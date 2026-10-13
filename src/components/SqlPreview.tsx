import { useState } from 'react';
import type { SqlTestRun } from '../engine/runTests';
import type { SqlValue, StatementResult, TableSnapshot } from '../engine/sql/protocol';
import { useStrings, useTranslateMessage } from '../i18n';

/** Numbers as SQLite's own shell prints them: 16.8, not 16.799999999999997. */
const show = (v: SqlValue) => (typeof v === 'number' ? String(Number(v.toPrecision(15))) : v);

function ResultTable({ columns, rows, caption }: { columns: string[]; rows: SqlValue[][]; caption?: string }) {
  return (
    <div className="sql-table-wrap">
      <table className="sql-table">
        {caption && <caption className="visually-hidden">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c, k) => (
              <th key={k} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((v, k) => (
                <td key={k} className={v === null ? 'null' : typeof v === 'number' ? 'num' : undefined}>
                  {v === null ? 'NULL' : show(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Statement({ s }: { s: StatementResult }) {
  const t = useStrings();
  const change =
    s.verb === 'INSERT'
      ? t.sqlInserted(s.changes)
      : s.verb === 'UPDATE'
        ? t.sqlUpdated(s.changes)
        : s.verb === 'DELETE'
          ? t.sqlDeleted(s.changes)
          : s.verb === 'CREATE'
            ? t.sqlCreated
            : t.sqlDone;
  return (
    <section className="sql-statement" aria-label={t.sqlQueryAt(s.line)}>
      <p className="sql-statement-head">
        <span className="sql-where">{t.sqlQueryAt(s.line)}</span>
        {s.returnsRows && <span>{t.sqlRows(s.rows.length)}</span>}
      </p>
      {!s.returnsRows ? (
        <p className="sql-change">✓ {change}</p>
      ) : s.rows.length === 0 ? (
        <>
          <ResultTable columns={s.columns} rows={[]} caption={t.sqlQueryAt(s.line)} />
          <p className="muted sql-empty-rows">{t.sqlNoRows}</p>
        </>
      ) : (
        <>
          <ResultTable columns={s.columns} rows={s.rows} caption={t.sqlQueryAt(s.line)} />
          {s.truncated && <p className="muted">{t.sqlFirstRows(s.rows.length)}</p>}
        </>
      )}
    </section>
  );
}

function Tables({ tables }: { tables: TableSnapshot[] }) {
  const t = useStrings();
  if (tables.length === 0) return <p className="muted">{t.sqlNoTables}</p>;
  return (
    <>
      <p className="muted">{t.sqlTablesNote}</p>
      {tables.map((table) => (
        <section key={table.name} className="sql-db-table" aria-label={table.name}>
          <h3>
            {table.name} <span className="muted">· {t.sqlRows(table.count)}</span>
          </h3>
          <ul className="sql-columns" aria-label={t.sqlColumns}>
            {table.columns.map((c) => (
              <li key={c.name} title={c.pk ? t.sqlPrimaryKey : undefined}>
                {c.pk && <span aria-label={t.sqlPrimaryKey}>🔑 </span>}
                <strong>{c.name}</strong> <span className="muted">{c.type || 'ANY'}</span>
              </li>
            ))}
          </ul>
          <ResultTable columns={table.columns.map((c) => c.name)} rows={table.rows} caption={table.name} />
          {table.count > table.rows.length && <p className="muted">{t.sqlFirstRows(table.rows.length)}</p>}
        </section>
      ))}
    </>
  );
}

/** The results pane of SQL lessons: what each statement returned or changed, and the database's tables. */
export function SqlPreview({ run, onRun }: { run: SqlTestRun | null; onRun: () => void }) {
  const t = useStrings();
  const tr = useTranslateMessage();
  const [view, setView] = useState<'results' | 'tables'>('results');
  const out = run?.output;
  const statements = out?.statements ?? [];
  return (
    <div className="sql-preview">
      <div className="pane-bar">
        <div className="file-tabs" role="tablist" aria-label={t.sqlResults}>
          <button type="button" role="tab" aria-selected={view === 'results'} onClick={() => setView('results')}>
            {t.sqlResults}
          </button>
          <button type="button" role="tab" aria-selected={view === 'tables'} onClick={() => setView('tables')}>
            {t.sqlTables}
          </button>
        </div>
        <button type="button" className="btn small run narrow-only" onClick={onRun}>
          ▶ {t.run}
        </button>
      </div>
      <div className="sql-output" role="tabpanel" aria-label={view === 'results' ? t.sqlResults : t.sqlTables} aria-live="polite">
        {!run ? (
          <p className="muted">{t.sqlRunning}</p>
        ) : run.failure ? (
          <p className="sql-error" role="alert">
            ✖ {tr(run.failure)}
          </p>
        ) : view === 'tables' ? (
          <Tables tables={out?.tables ?? []} />
        ) : (
          <>
            {/* The error stopped the script: it goes first, where it can't hide below a long result. */}
            {out?.error && (
              <p className="sql-error" role="alert">
                ✖ {out.error.line ? `${t.line(out.error.line)}: ` : ''}
                {tr(out.error.message)}
              </p>
            )}
            {statements.map((s, k) => (
              <Statement key={k} s={s} />
            ))}
            {statements.length === 0 && !out?.error && <p className="muted">{t.sqlEmpty}</p>}
          </>
        )}
      </div>
    </div>
  );
}
