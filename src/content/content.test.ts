import { describe, expect, it } from 'vitest';
import { course, modules } from '.';
import { runTests } from '../engine/runTests';

describe('course content', () => {
  it('has unique ids', () => {
    const ids = course.map((c) => c.item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(modules.map((m) => m.id)).size).toBe(modules.length);
  });

  describe.each(course.map((c) => [c.item.id, c] as const))('%s', (_id, { item }) => {
    it('solution passes every task', () => {
      const run = runTests(item, item.solution);
      const failed = run.results.filter((r) => !r.passed);
      expect(failed).toEqual([]);
    });

    it('starter code does not already pass', () => {
      expect(runTests(item, item.starterCode).allPassed).toBe(false);
    });

    it('has tasks and hints', () => {
      expect(item.tasks.length).toBeGreaterThan(0);
      expect(item.hints.length).toBeGreaterThan(0);
    });
  });
});
