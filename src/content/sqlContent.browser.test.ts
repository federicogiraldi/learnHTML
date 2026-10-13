import { describe, expect, it } from 'vitest';
import { courseItems } from '.';
import { sqlCourse } from './sql';
import { isSqlLesson } from './types';
import { isSqlCheck } from '../engine/sqlChecks';
import { runSqlTests } from '../engine/runTests';

// SQL lessons run in a real SQLite (WebAssembly, in a worker), so they are checked in the browser.
describe.each(courseItems(sqlCourse).map((c) => [c.item.id, c] as const))('%s', (_id, { item }) => {
  it('is an SQL lesson with SQL checks and a database', () => {
    expect(isSqlLesson(item)).toBe(true);
    expect(item.solutionSql).toBeDefined();
    expect(item.db).toBeTruthy();
    expect(item.tasks.every((t) => isSqlCheck(t.check))).toBe(true);
  });

  it('solution passes every task', async () => {
    const failed = (await runSqlTests(item, item.solutionSql ?? '')).results.filter((r) => !r.passed);
    expect(failed).toEqual([]);
  });

  it('starter code does not already pass', async () => {
    expect((await runSqlTests(item, item.starterSql ?? '')).allPassed).toBe(false);
  });

  it('every task fails on the starter code or checks something the starter leaves out', async () => {
    // A check that passes on an empty script checks nothing.
    const empty = await runSqlTests(item, '');
    const passing = empty.results.filter((r) => r.passed && !r.implicit).map((r) => r.text);
    expect(passing).toEqual([]);
  });
});
