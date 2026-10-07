import { describe, expect, it } from 'vitest';
import { courseItems } from '.';
import { jsCourse } from './js';
import { isJsLesson } from './types';
import { isJsCheck } from '../engine/jsChecks';
import { runJsTests } from '../engine/runTests';

// JavaScript lessons run in a real sandbox iframe, so they are checked in the browser.
describe.each(courseItems(jsCourse).map((c) => [c.item.id, c] as const))('%s', (_id, { item }) => {
  const files = (kind: 'starter' | 'solution') => ({
    js: (kind === 'starter' ? item.starterJs : item.solutionJs) ?? '',
    html: kind === 'starter' ? item.starterCode : item.solution,
    css: (kind === 'starter' ? item.starterCss : item.solutionCss) ?? '',
  });

  it('is a JavaScript lesson with JavaScript checks', () => {
    expect(isJsLesson(item)).toBe(true);
    expect(item.solutionJs).toBeDefined();
    expect(item.tasks.every((t) => isJsCheck(t.check))).toBe(true);
  });

  it('solution passes every task', async () => {
    const failed = (await runJsTests(item, files('solution'))).results.filter((r) => !r.passed);
    expect(failed).toEqual([]);
  });

  it('starter code does not already pass', async () => {
    expect((await runJsTests(item, files('starter'))).allPassed).toBe(false);
  });
});
