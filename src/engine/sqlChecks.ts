import type { CheckResult, SqlCheck, SqlRun } from '../content/types';
import { isAnswerError, type QueryAnswer, type ResultSet, type SqlValue } from './sql/protocol';

/**
 * Checks for SQL lessons. Each one names the extra queries it needs (run in the worker together with the learner's
 * script) and then compares in the app: the learner's result with the answer of a reference query on a fresh copy
 * of the database, or the database after the learner's script with the database after a reference script.
 */

export const isSqlCheck = (v: unknown): v is SqlCheck =>
  !!v && typeof v === 'object' && typeof (v as SqlCheck).verify === 'function' && Array.isArray((v as SqlCheck).queries);

/** The script without comments (string literals stay), for checks that look at the code. */
export function stripComments(sql: string) {
  let out = '';
  for (let i = 0; i < sql.length; ) {
    const c = sql[i];
    if (c === "'" || c === '"') {
      const end = sql.indexOf(c, i + 1);
      const stop = end === -1 ? sql.length : end + 1;
      out += sql.slice(i, stop);
      i = stop;
    } else if (sql.startsWith('--', i)) {
      const end = sql.indexOf('\n', i);
      i = end === -1 ? sql.length : end;
    } else if (sql.startsWith('/*', i)) {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
      out += ' ';
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const formatValue = (v: SqlValue) =>
  v === null ? 'NULL' : typeof v === 'number' ? String(Number(v.toPrecision(15))) : `'${v}'`;

const formatRow = (row: SqlValue[], columns: string[]) => `(${row.map((v, k) => `${columns[k] ?? `#${k + 1}`} = ${formatValue(v)}`).join(', ')})`;

const sameValue = (a: SqlValue, b: SqlValue) =>
  typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) : a === b;

const sameRow = (a: SqlValue[], b: SqlValue[]) => a.length === b.length && a.every((v, k) => sameValue(v, b[k]));

/** Rows of `a` with no partner in `b` (as multisets). */
function unmatched(a: SqlValue[][], b: SqlValue[][]) {
  const used = new Set<number>();
  return a.filter((row) => {
    const k = b.findIndex((other, j) => !used.has(j) && sameRow(row, other));
    if (k === -1) return true;
    used.add(k);
    return false;
  });
}

type Context = 'result' | 'after';

function compare(actual: ResultSet, expected: ResultSet, ordered: boolean, ctx: Context): CheckResult {
  const cols = expected.columns;
  if (actual.columns.length !== cols.length) {
    return `The result should have ${plural(cols.length, 'column')}, yours has ${actual.columns.length}.`;
  }
  const [e, a] = [expected.rows.length, actual.rows.length];
  if (a !== e) {
    return ctx === 'result'
      ? `The result should have ${plural(e, 'row')}, yours has ${a}.`
      : `After your SQL there should be ${plural(e, 'matching row')}, there are ${a}.`;
  }
  const missing = unmatched(expected.rows, actual.rows)[0];
  if (missing) {
    const row = formatRow(missing, cols);
    return ctx === 'result' ? `A row is missing from your result: ${row}.` : `After your SQL, this row is missing: ${row}.`;
  }
  const extra = unmatched(actual.rows, expected.rows)[0];
  if (extra) {
    const row = formatRow(extra, cols);
    return ctx === 'result' ? `This row shouldn’t be in your result: ${row}.` : `After your SQL, this row shouldn’t be there: ${row}.`;
  }
  if (ordered && !actual.rows.every((row, k) => sameRow(row, expected.rows[k]))) {
    return 'The rows are right, but not in the right order.';
  }
  return true;
}

/** The result of the learner's nth query that returns rows (1-based), or the last one. */
function pick(run: SqlRun, nth?: number): ResultSet | string {
  const selects = run.statements.filter((s) => s.returnsRows);
  const found = nth ? selects[nth - 1] : selects[selects.length - 1];
  if (found) return found;
  return nth && nth > 1 ? `Write at least ${nth} SELECT queries: this task checks query ${nth}.` : 'Write a SELECT query: its result is checked here.';
}

const expectedAnswer = (answer: QueryAnswer | undefined): ResultSet | string =>
  !answer ? 'Not checked.' : isAnswerError(answer) ? `Check failed to run: ${answer.error}` : answer;

export interface ReturnsOptions {
  /** Which SELECT of the script is checked (1-based); the last one by default. */
  nth?: number;
  /** The rows must come in the same order (for ORDER BY). Otherwise any order is fine. */
  ordered?: boolean;
  /** For lessons that change data: the reference runs after this script, on a fresh database. */
  after?: string;
}

/** The learner's query returns the same columns and rows as `reference` on a fresh copy of the database. */
export function returns(reference: string, { nth, ordered = false, after = '' }: ReturnsOptions = {}): SqlCheck {
  return {
    queries: [{ sql: reference, fresh: after }],
    verify(run, [answer]) {
      const actual = pick(run, nth);
      if (typeof actual === 'string') return actual;
      const expected = expectedAnswer(answer);
      if (typeof expected === 'string') return expected;
      return compare(actual, expected, ordered, 'result');
    },
  };
}

/** The result's columns have these names (AS), in this order; case doesn't matter. */
export function columnsNamed(names: string[], nth?: number): SqlCheck {
  return {
    queries: [],
    verify(run) {
      const actual = pick(run, nth);
      if (typeof actual === 'string') return actual;
      const same = actual.columns.length === names.length && actual.columns.every((c, k) => c.toLowerCase() === names[k].toLowerCase());
      return same || `Name the columns ${names.join(', ')} (yours: ${actual.columns.join(', ')}).`;
    },
  };
}

/**
 * After the learner's script, `probe` returns the same rows (in any order) as it does on a fresh database after
 * `change`: for INSERT, UPDATE, DELETE and CREATE TABLE.
 */
export function afterwards(probe: string, change: string): SqlCheck {
  return {
    queries: [{ sql: probe }, { sql: probe, fresh: change }],
    verify(_run, [mine, theirs]) {
      const expected = expectedAnswer(theirs);
      if (typeof expected === 'string') return expected;
      if (!mine) return 'Not checked.';
      if (isAnswerError(mine)) return `After your SQL: ${mine.error}`;
      return compare(mine, expected, false, 'after');
    },
  };
}

/** The code (comments removed) matches `pattern`. */
export function uses(pattern: RegExp, message: string): SqlCheck {
  return { queries: [], verify: (run) => pattern.test(stripComments(run.script)) || message };
}

/** The code (comments removed) does not match `pattern`. */
export function avoids(pattern: RegExp, message: string): SqlCheck {
  return { queries: [], verify: (run) => !pattern.test(stripComments(run.script)) || message };
}

/** Every check passes; reports the first failure. */
export function all(...checks: SqlCheck[]): SqlCheck {
  return {
    queries: checks.flatMap((c) => c.queries),
    verify(run, answers) {
      let at = 0;
      for (const c of checks) {
        const r = c.verify(run, answers.slice(at, at + c.queries.length));
        at += c.queries.length;
        if (r !== true) return r;
      }
      return true;
    },
  };
}
