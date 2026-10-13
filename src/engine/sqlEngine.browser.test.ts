import { describe, expect, it } from 'vitest';
import type { Lesson, SqlCheck } from '../content/types';
import { runSqlTests } from './runTests';
import { runSql, stoppedMessage } from './sql/runner';
import { afterwards, all, columnsNamed, returns, stripComments, uses } from './sqlChecks';

const db = `CREATE TABLE pets (id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT, age INTEGER);
INSERT INTO pets (id, name, kind, age) VALUES (1, 'Rex', 'dog', 3), (2, 'Tom', 'cat', 5), (3, 'Nemo', 'fish', NULL);`;

const lesson = (...checks: SqlCheck[]): Lesson => ({
  id: 'test',
  title: 'Test',
  explanation: '',
  starterCode: '',
  starterSql: '',
  db,
  tasks: checks.map((check, k) => ({ text: `Task ${k + 1}`, check })),
  hints: [],
  solution: '',
});

const messages = async (l: Lesson, sql: string) => (await runSqlTests(l, sql)).results.map((r) => (r.passed ? true : r.message));

describe('the SQL runner', () => {
  it('runs each statement on a fresh database and reports rows, changes and lines', async () => {
    const out = await runSql({
      setup: db,
      script: `-- a comment\nSELECT name FROM pets ORDER BY id;\n\nUPDATE pets SET age = age + 1;\n/* another */ SELECT COUNT(*) AS n FROM pets;`,
      queries: [],
      snapshot: true,
    });
    if ('failure' in out) throw new Error(out.failure);
    expect(out.error).toBeUndefined();
    expect(out.statements.map((s) => [s.line, s.verb, s.returnsRows, s.changes])).toEqual([
      [2, 'SELECT', true, 0],
      [4, 'UPDATE', false, 3],
      [5, 'SELECT', true, 0],
    ]);
    expect(out.statements[0].rows).toEqual([['Rex'], ['Tom'], ['Nemo']]);
    expect(out.statements[2].columns).toEqual(['n']);
    expect(out.tables[0]).toMatchObject({ name: 'pets', count: 3 });
    expect(out.tables[0].columns[0]).toEqual({ name: 'id', type: 'INTEGER', pk: true, notNull: false });
    expect(out.tables[0].rows[0]).toEqual([1, 'Rex', 'dog', 4]);

    // The next run starts from the original data again.
    const again = await runSql({ setup: db, script: 'SELECT age FROM pets WHERE id = 1', queries: [] });
    expect('failure' in again ? again.failure : again.statements[0].rows).toEqual([[3]]);
  });

  it('reports errors with their line and keeps the statements before them', async () => {
    const out = await runSql({ setup: db, script: 'SELECT name FROM pets;\n\nSELECT nme FROM pets;\nSELECT 1;', queries: [] });
    if ('failure' in out) throw new Error(out.failure);
    expect(out.statements).toHaveLength(1);
    expect(out.error).toEqual({ message: 'no such column: nme', line: 3 });

    const runtime = await runSql({ setup: db, script: "SELECT 1;\nINSERT INTO pets (kind) VALUES ('bird');", queries: [] });
    if ('failure' in runtime) throw new Error(runtime.failure);
    expect(runtime.error).toEqual({ message: 'NOT NULL constraint failed: pets.name', line: 2 });
  });

  it('stops a query that never ends, and works again afterwards', async () => {
    const forever = 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n) SELECT COUNT(*) FROM n;';
    expect(await runSql({ setup: db, script: forever, queries: [] })).toEqual({ failure: stoppedMessage });
    const next = await runSql({ setup: db, script: 'SELECT 42', queries: [] });
    expect('failure' in next ? next.failure : next.statements[0].rows).toEqual([[42]]);
  }, 10_000);
});

describe('SQL checks', () => {
  it('returns: compares columns, rows and order with the reference query', async () => {
    const l = lesson(returns('SELECT name FROM pets WHERE age > 2'), returns('SELECT name, age FROM pets ORDER BY age DESC', { nth: 1, ordered: true }));
    expect(await messages(l, 'SELECT name, age FROM pets ORDER BY age DESC')).toEqual([
      'The result should have 1 column, yours has 2.',
      true,
      true,
    ]);
    expect((await messages(l, 'SELECT name FROM pets'))[0]).toBe('The result should have 2 rows, yours has 3.');
    expect((await messages(l, "SELECT name FROM pets WHERE id IN (1, 3)"))[0]).toBe("A row is missing from your result: (name = 'Tom').");
    expect((await messages(l, 'SELECT name, age FROM pets ORDER BY age'))[1]).toBe('The rows are right, but not in the right order.');
    expect((await messages(l, ''))[0]).toBe('Write a SELECT query: its result is checked here.');
    expect((await messages(lesson(returns('SELECT 1', { nth: 2 })), 'SELECT 1'))[0]).toBe(
      'Write at least 2 SELECT queries: this task checks query 2.',
    );
  });

  it('afterwards: compares the data after the script with the data after a reference change', async () => {
    const l = lesson(afterwards('SELECT id, age FROM pets', 'UPDATE pets SET age = 6 WHERE id = 2'));
    expect(await messages(l, 'UPDATE pets SET age = 6 WHERE name = "Tom"')).toEqual([true, true]);
    expect((await messages(l, 'UPDATE pets SET age = 6'))[0]).toBe('After your SQL, this row is missing: (id = 1, age = 3).');
    expect((await messages(lesson(afterwards('SELECT * FROM toys', 'CREATE TABLE toys (x)')), ''))[0]).toBe(
      'After your SQL: no such table: toys',
    );
  });

  it('columnsNamed, uses and all', async () => {
    const l = lesson(all(columnsNamed(['total']), uses(/\bSUM\b/i, 'Use SUM.')));
    expect(await messages(l, 'SELECT SUM(age) AS Total FROM pets')).toEqual([true, true]);
    expect((await messages(l, 'SELECT SUM(age) FROM pets'))[0]).toBe('Name the columns total (yours: SUM(age)).');
    expect((await messages(l, '-- SUM\nSELECT 1 AS total'))[0]).toBe('Use SUM.');
  });

  it('reports a script error as a failed implicit task', async () => {
    const r = await runSqlTests(lesson(returns('SELECT 1')), 'SELECT 1;\nSELEC 2;');
    expect(r.results.at(-1)).toMatchObject({ passed: false, implicit: true, message: 'Line 2: near "SELEC": syntax error' });
  });

  it('stripComments keeps strings', () => {
    expect(stripComments("SELECT '--not' -- yes\n/* gone */ FROM t")).toBe("SELECT '--not' \n  FROM t");
  });
});
