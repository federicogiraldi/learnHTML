import { describe, expect, it } from 'vitest';
import { allItems, courseItems, courses } from '.';
import { htmlCourse } from './html';
import { runTests } from '../engine/runTests';

describe('course content', () => {
  it('has unique lesson and module ids across all courses', () => {
    const ids = allItems.map((c) => c.item.id);
    expect(new Set(ids).size).toBe(ids.length);
    const moduleIds = courses.flatMap((c) => c.modules.map((m) => m.id));
    expect(new Set(moduleIds).size).toBe(moduleIds.length);
  });

  it('every item has tasks and hints', () => {
    for (const { item } of allItems) {
      expect(item.tasks.length, item.id).toBeGreaterThan(0);
      expect(item.hints.length, item.id).toBeGreaterThan(0);
    }
  });

  // CSS lessons need real layout, so they are checked in tests/css-content.browser.test.ts.
  describe.each(courseItems(htmlCourse).map((c) => [c.item.id, c] as const))('%s', (_id, { item }) => {
    it('solution passes every task', () => {
      const failed = runTests(item, item.solution).results.filter((r) => !r.passed);
      expect(failed).toEqual([]);
    });

    it('starter code does not already pass', () => {
      expect(runTests(item, item.starterCode).allPassed).toBe(false);
    });
  });
});
