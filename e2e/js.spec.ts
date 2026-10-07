import { expect, test, type Page } from '@playwright/test';
import { jsCourse } from '../src/content/js';

const KEY = 'learnhtml:v1';
/** Progress saved before the JavaScript course existed: it must survive untouched. */
const EXISTING = {
  completed: { 'basics-first-tag': { at: Date.UTC(2026, 0, 1) } },
  code: { 'basics-first-tag': '<h1>Saved before the update</h1>' },
  unlocked: [],
};

const saved = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), KEY);

test('a JavaScript lesson: write code, run it, see the console, pass the tasks, keep progress after reload', async ({ page }) => {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(EXISTING)],
  );
  await page.goto('./#/course/js');
  await expect(page.getByRole('heading', { name: 'Learn JavaScript by writing it.' })).toBeVisible();
  await page.getByRole('link', { name: /Start the first lesson/ }).click();
  await expect(page.getByRole('heading', { name: 'Hello, console' })).toBeVisible();

  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type("console.log('Hello, world!');\nconsole.log(2026);\nconsole.log(7 * 6);\nconsole.log({ ok: true });\nnope();\n");

  // Nothing runs while typing; Ctrl+Enter runs the code.
  const output = page.getByRole('region', { name: 'Console', exact: true });
  await page.keyboard.press('ControlOrMeta+Enter');
  await expect(output.getByText('Hello, world!')).toBeVisible();
  await expect(output.getByText('{ ok: true }')).toBeVisible();
  await expect(output.getByText('ReferenceError: nope is not defined')).toBeVisible();
  await expect(output.getByText('script.js:6')).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'Your JavaScript runs without errors.' })).toContainText('Line 6: ReferenceError');
  await expect(page.getByRole('status').filter({ hasText: 'all tasks done' })).toHaveCount(0);

  // Fix the error and run with the button.
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.press('Shift+ArrowUp');
  await page.keyboard.press('Backspace');
  await page.getByRole('button', { name: '▶ Run' }).first().click();
  await expect(page.getByRole('status').filter({ hasText: 'Nice work — all tasks done!' })).toBeVisible();
  await expect(output.getByText('ReferenceError')).toHaveCount(0);

  await page.reload();
  await expect(page.locator('.cm-content').first()).toContainText("console.log('Hello, world!');");
  await expect(page.getByRole('heading', { name: /Hello, console/ })).toContainText('Completed');
  const state = await saved(page);
  expect(state.completed['js-basics-console']).toBeTruthy();
  expect(state.code['js-basics-console:js']).toContain('console.log(7 * 6);');
  // The HTML progress saved before is still there.
  expect(state.completed['basics-first-tag']).toEqual(EXISTING.completed['basics-first-tag']);
  expect(state.code['basics-first-tag']).toBe(EXISTING.code['basics-first-tag']);

  await page.goto('./#/course/js');
  await expect(page.getByText(/^1 \/ \d+ completed$/)).toBeVisible();
});

test('an infinite loop is stopped with a clear message and the app keeps working', async ({ page }) => {
  await page.goto('./#/learn/js-basics-console');
  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type('while (true) {}\n');
  await page.keyboard.press('ControlOrMeta+Enter');
  const output = page.getByRole('region', { name: 'Console', exact: true });
  await expect(output.getByText(/loop on line 2 ran for more than 2 seconds/)).toBeVisible({ timeout: 8000 });
  // The app is still responsive.
  await page.getByRole('link', { name: 'JS', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Learn JavaScript by writing it.' })).toBeVisible();
});

test('page lessons run script.js against the preview page', async ({ page }) => {
  const lesson = jsCourse.modules.flatMap((m) => m.lessons).find((l) => l.starterCode.trim() !== '')!;
  const code = { [lesson.id]: lesson.solution, [`${lesson.id}:js`]: lesson.solutionJs!, [`${lesson.id}:css`]: lesson.solutionCss ?? '' };
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [KEY, JSON.stringify({ completed: {}, code, unlocked: [] })],
  );
  await page.goto(`./#/learn/${lesson.id}`);
  await expect(page.getByRole('tab', { name: 'script.js' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'index.html' })).toBeVisible();
  await expect(page.frameLocator('.js-page iframe').locator('body')).not.toBeEmpty();
  await expect(page.getByRole('status').filter({ hasText: 'Nice work — all tasks done!' })).toBeVisible();
});

test('the playground runs script.js and shows its console', async ({ page }) => {
  await page.goto('./#/playground');
  await page.frameLocator('.js-page iframe').getByRole('button', { name: 'Say hello' }).click();
  await expect(page.getByRole('region', { name: 'Console', exact: true }).getByText('Hello from script.js!')).toBeVisible();
});

// Custom checks are turned into source with toString(): make sure they still work after minification.
test('every JavaScript lesson’s solution passes in the production build', async ({ page }) => {
  test.setTimeout(240_000);
  const items = jsCourse.modules.flatMap((m) => [...m.lessons.map((l) => ({ l, challenge: false })), { l: m.challenge, challenge: true }]);
  const code: Record<string, string> = {};
  for (const { l } of items) {
    code[`${l.id}:js`] = l.solutionJs ?? '';
    if (l.starterCode.trim()) code[l.id] = l.solution;
    if (l.starterCss !== undefined) code[`${l.id}:css`] = l.solutionCss ?? '';
  }
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

test('JavaScript lessons work offline: the sandbox needs nothing from the network', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.goto('./#/learn/js-basics-variables');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Variables: let and const' })).toBeVisible();
  await page.getByRole('button', { name: '▶ Run' }).first().click();
  await expect(page.getByRole('region', { name: 'Console', exact: true }).getByText('Rome 3')).toBeVisible();
});
