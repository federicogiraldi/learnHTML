import { describe, expect, it } from 'vitest';
import { courseItems } from '.';
import { cssCourse } from './css';
import { runTests } from '../engine/runTests';

// CSS lessons are checked in a real browser: their checks read computed styles and layout.
describe.each(courseItems(cssCourse).map((c) => [c.item.id, c] as const))('%s', (_id, { item }) => {
  it('is a CSS lesson', () => {
    expect(item.starterCss).toBeDefined();
    expect(item.solutionCss).toBeDefined();
  });

  it('solution passes every task', () => {
    const failed = runTests(item, item.solution, item.solutionCss).results.filter((r) => !r.passed);
    expect(failed).toEqual([]);
  });

  it('starter code does not already pass', () => {
    expect(runTests(item, item.starterCode, item.starterCss).allPassed).toBe(false);
  });
});
