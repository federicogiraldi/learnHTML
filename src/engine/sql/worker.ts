/// <reference lib="webworker" />
import initSqlJs, { type Database, type SqlValue as RawValue } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import type { QueryAnswer, ResultSet, SqlRequest, SqlResponse, SqlValue, StatementResult, TableSnapshot, WorkerMessage } from './protocol';

/**
 * Runs SQL in a real SQLite (sql.js, WebAssembly), off the main thread: a runaway query can't freeze the app,
 * because the app terminates this worker when a run takes too long. Every run starts from a new database.
 */

/** Rows sent back per statement; the rest are only counted. */
const MAX_ROWS = 1000;
/** Rows of each table in the snapshot. */
const SNAPSHOT_ROWS = 200;

const post = (m: WorkerMessage) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m);

const value = (v: RawValue): SqlValue => (v instanceof Uint8Array ? `[blob, ${v.length} bytes]` : v);

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Offset of the first character after whitespace and comments. */
function skipBlank(sql: string, from: number) {
  let i = from;
  for (;;) {
    while (i < sql.length && /\s/.test(sql[i])) i++;
    if (sql.startsWith('--', i)) {
      const end = sql.indexOf('\n', i);
      i = end === -1 ? sql.length : end + 1;
    } else if (sql.startsWith('/*', i)) {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
    } else return i;
  }
}

const lineAt = (sql: string, offset: number) => sql.slice(0, offset).split('\n').length;

function query(db: Database, sql: string): ResultSet {
  const stmt = db.prepare(sql);
  try {
    const rows: SqlValue[][] = [];
    while (stmt.step() && rows.length < MAX_ROWS) rows.push(stmt.get().map(value));
    return { columns: stmt.getColumnNames(), rows };
  } finally {
    stmt.free();
  }
}

function runScript(db: Database, script: string): Pick<SqlResponse, 'statements' | 'error'> {
  const statements: StatementResult[] = [];
  const it = db.iterateStatements(script);
  for (;;) {
    const start = skipBlank(script, script.length - it.getRemainingSQL().length);
    const line = lineAt(script, start);
    let stmt;
    try {
      const next = it.next();
      if (next.done) break;
      stmt = next.value;
    } catch (e) {
      return { statements, error: { message: errorMessage(e), line } };
    }
    try {
      const columns = stmt.getColumnNames();
      const rows: SqlValue[][] = [];
      let truncated = false;
      while (stmt.step()) {
        if (rows.length < MAX_ROWS) rows.push(stmt.get().map(value));
        else truncated = true;
      }
      const verb = /^[a-z]+/i.exec(script.slice(start))?.[0].toUpperCase() ?? '';
      const returnsRows = columns.length > 0;
      statements.push({ line, verb, columns, rows, returnsRows, changes: returnsRows ? 0 : db.getRowsModified(), truncated });
    } catch (e) {
      return { statements, error: { message: errorMessage(e), line } };
    }
  }
  return { statements };
}

function snapshot(db: Database): TableSnapshot[] {
  const names = query(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").rows;
  return names.map(([name]) => {
    const id = `"${String(name).replace(/"/g, '""')}"`;
    const info = query(db, `PRAGMA table_info(${id})`).rows;
    return {
      name: String(name),
      columns: info.map(([, col, type, notNull, , pk]) => ({ name: String(col), type: String(type), notNull: notNull === 1, pk: Number(pk) > 0 })),
      rows: query(db, `SELECT * FROM ${id} LIMIT ${SNAPSHOT_ROWS}`).rows,
      count: Number(query(db, `SELECT COUNT(*) FROM ${id}`).rows[0][0]),
    };
  });
}

const sqlReady = initSqlJs({ locateFile: () => wasmUrl });

sqlReady.then(
  () => post({ type: 'ready' }),
  (e) => post({ type: 'failed', message: errorMessage(e) }),
);

self.onmessage = async (e: MessageEvent<SqlRequest>) => {
  const req = e.data;
  const SQL = await sqlReady;
  const fresh = (script = '') => {
    const db = new SQL.Database();
    db.run(req.setup);
    if (script) db.run(script);
    return db;
  };
  const ask = (db: Database, sql: string): QueryAnswer => {
    try {
      return query(db, sql);
    } catch (err) {
      return { error: errorMessage(err) };
    }
  };

  // Expected answers share one fresh database per distinct script.
  const others = new Map<string, Database | { error: string }>();
  const expected = (script: string) => {
    let other = others.get(script);
    if (!other) {
      try {
        other = fresh(script);
      } catch (err) {
        other = { error: `The expected answer failed: ${errorMessage(err)}` };
      }
      others.set(script, other);
    }
    return other;
  };

  let db: Database | undefined;
  try {
    db = fresh();
    const learner = db;
    const { statements, error } = runScript(learner, req.script);
    const answers = req.queries.map((q) => {
      const target = q.fresh === undefined ? learner : expected(q.fresh);
      return 'error' in target ? target : ask(target, q.sql);
    });
    const tables = req.snapshot ? snapshot(learner) : [];
    post({ type: 'result', id: req.id, statements, error, answers, tables });
  } catch (err) {
    post({ type: 'result', id: req.id, statements: [], error: { message: errorMessage(err) }, answers: [], tables: [] });
  } finally {
    db?.close();
    others.forEach((d) => 'close' in d && d.close());
  }
};
