import { expect, test } from '@playwright/test';
import { sqlCourse } from '../src/content/sql';

const KEY = 'learnhtml:v1';

test('an SQL lesson: write queries, see results and errors, pass the tasks, keep the code after reload', async ({ page }) => {
  await page.goto('./#/course/sql');
  await expect(page.getByRole('heading', { name: 'Learn SQL by writing it.' })).toBeVisible();
  await page.getByRole('link', { name: /Start the first lesson/ }).click();
  await expect(page.getByRole('heading', { name: 'Hello, database: SELECT' })).toBeVisible();

  // The starter query runs by itself.
  const results = page.getByRole('region', { name: 'Results' });
  await expect(results.getByRole('cell', { name: 'The Dark Knight' })).toBeVisible();

  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('SELECT title, year FROM movies;\nSELECT title, genre, rating FROM movis;\n');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(results.getByRole('alert')).toContainText('Line 2: no such table: movis');
  await expect(page.getByRole('listitem').filter({ hasText: 'Your SQL runs without errors.' })).toContainText('Line 2: no such table');

  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('End');
  // movis| ; → movi|s; → movie|s;
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('e');
  // Runs after a pause in typing, without pressing Run.
  await expect(page.getByRole('status').filter({ hasText: 'Nice work — all tasks done!' })).toBeVisible();
  await expect(results.getByRole('alert')).toHaveCount(0);

  await page.getByRole('tab', { name: 'Tables' }).click();
  await expect(page.getByRole('region', { name: 'movies' })).toContainText('17 rows');

  await page.reload();
  await expect(page.locator('.cm-content').first()).toContainText('FROM movies;');
  await expect(page.getByRole('heading', { name: /Hello, database/ })).toContainText('Completed');
  const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), KEY);
  expect(state.completed['sql-select-first']).toBeTruthy();
  expect(state.code['sql-select-first:sql']).toContain('SELECT title, genre, rating FROM movies;');
});

test('a query that never ends is stopped and the app keeps working', async ({ page }) => {
  await page.goto('./#/learn/sql-select-first');
  await page.locator('.cm-content').first().click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n) SELECT COUNT(*) FROM n;');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(page.getByRole('region', { name: 'Results' })).toContainText('Stopped: your SQL ran for more than 3 seconds.', {
    timeout: 8000,
  });
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('SELECT 6 * 7 AS answer;');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(page.getByRole('region', { name: 'Results' }).getByRole('cell', { name: '42' })).toBeVisible();
});

test('every SQL lesson’s solution passes in the production build', async ({ page }) => {
  test.setTimeout(120_000);
  const items = sqlCourse.modules.flatMap((m) => [...m.lessons.map((l) => ({ l, challenge: false })), { l: m.challenge, challenge: true }]);
  const code = Object.fromEntries(items.map(({ l }) => [`${l.id}:sql`, l.solutionSql ?? '']));
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify({ completed: {}, code, unlocked: [] })],
  );
  for (const { l, challenge } of items) {
    await page.goto(`./#/learn/${l.id}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(l.title);
    if (challenge) await page.getByRole('button', { name: 'Check my solution' }).click();
    await expect(page.getByRole('status').filter({ hasText: challenge ? 'Challenge complete!' : 'Nice work' }), l.id).toBeVisible({
      timeout: 10_000,
    });
  }
});

test('SQL lessons work offline: the SQLite engine is precached', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.goto('./#/learn/sql-agg-count');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Counting and totals' })).toBeVisible();
  await page.locator('.cm-content').first().click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('SELECT COUNT(*) AS n FROM sales;');
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(page.getByRole('region', { name: 'Results' }).getByRole('cell', { name: '17' })).toBeVisible();
});
