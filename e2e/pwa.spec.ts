import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { serveDistCopy } from './static-server';

const KEY = 'learnhtml:v1';
/** Progress as saved by the app before this change: the same key must keep working. */
const EXISTING = {
  completed: { 'basics-first-tag': { at: Date.UTC(2026, 0, 1) } },
  code: { 'basics-first-tag': '<h1>Saved before the update</h1>' },
  unlocked: [],
};

/** Waits until a service worker controls the page (the first visit installs it; the next load is controlled). */
async function waitForServiceWorker(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

const saved = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), KEY);

async function typeInEditor(page: Page, text: string) {
  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type(text);
}

test('the manifest is valid and its icons and start URL resolve under /learnHTML/', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifestUrl = new URL(href!, page.url()).href;
  expect(manifestUrl).toBe('http://localhost:4173/learnHTML/manifest.webmanifest');

  const res = await request.get(manifestUrl);
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest).toMatchObject({ name: 'LearnWeb', short_name: 'LearnWeb', display: 'standalone' });
  expect(new URL(manifest.start_url, manifestUrl).href).toBe('http://localhost:4173/learnHTML/');
  expect(new URL(manifest.scope, manifestUrl).href).toBe('http://localhost:4173/learnHTML/');
  expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);

  const sizes = manifest.icons.map((i: { sizes: string; purpose?: string }) => `${i.sizes} ${i.purpose ?? 'any'}`);
  expect(sizes).toEqual(expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']));
  for (const icon of manifest.icons) {
    const img = await request.get(new URL(icon.src, manifestUrl).href);
    expect(img.ok()).toBe(true);
    expect(img.headers()['content-type']).toBe('image/png');
  }
});

test('registers a service worker scoped to /learnHTML/ that precaches only the app', async ({ page }) => {
  await page.goto('./');
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(scope).toBe('http://localhost:4173/learnHTML/');

  const cached = await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      for (const req of await (await caches.open(name)).keys()) urls.push(req.url);
    }
    return urls;
  });
  expect(cached.some((u) => /\/learnHTML\/index\.html/.test(u))).toBe(true);
  expect(cached.some((u) => /\/learnHTML\/assets\/index-.*\.js/.test(u))).toBe(true);
  expect(cached.every((u) => u.startsWith('http://localhost:4173/learnHTML/'))).toBe(true);
  expect(cached.some((u) => /picsum\.photos|fonts\.(googleapis|gstatic)\.com/.test(u))).toBe(false);
});

test('works offline after the first visit and keeps progress across reloads', async ({ page, context }) => {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(EXISTING)],
  );
  await page.goto('./');
  await waitForServiceWorker(page);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Learn HTML by writing it.' })).toBeVisible();
  await expect(page.getByText(/^1 \/ \d+ completed$/)).toBeVisible();

  // A lesson opens offline, and its code is still saved after a reload.
  await page.goto('./#/learn/basics-first-tag');
  await expect(page.locator('.cm-content').first()).toContainText('Saved before the update');
  await typeInEditor(page, '<p>offline edit</p>');
  await page.reload();
  await expect(page.locator('.cm-content').first()).toContainText('offline edit');
  expect((await saved(page)).completed).toEqual(EXISTING.completed);
});

test('a new version waits for "Update", and updating keeps unsaved code and progress', async ({ browser }) => {
  const server = await serveDistCopy();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.addInitScript(
      ([key, value]) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      },
      [KEY, JSON.stringify(EXISTING)],
    );
    await page.goto(`${server.url}#/learn/basics-first-tag`);
    await waitForServiceWorker(page);
    await expect(page.locator('.cm-content').first()).toContainText('Saved before the update');

    // Deploy a new version: any byte change to sw.js makes the browser install it.
    await appendFile(join(server.root, 'sw.js'), '\n// next version\n');
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())!.update());
    const update = page.getByRole('button', { name: 'Update' });
    await expect(update).toBeVisible();

    // The page is not reloaded by surprise while the banner waits.
    await typeInEditor(page, '<p>typed right before updating</p>');
    const before = await page.evaluate(() => performance.timeOrigin);
    const reloaded = page.waitForEvent('load');
    await update.click(); // well within the editor's save delay
    await reloaded;

    expect(await page.evaluate(() => performance.timeOrigin)).not.toBe(before);
    await expect(page.locator('.cm-content').first()).toContainText('typed right before updating');
    await expect(page.getByRole('button', { name: 'Update' })).toHaveCount(0);
    const state = await saved(page);
    expect(state.completed).toEqual(EXISTING.completed);
    expect(state.code['basics-first-tag']).toContain('typed right before updating');
    expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toBe(`${server.url}sw.js`);
  } finally {
    await context.close();
    await server.close();
  }
});

test('warns that progress is not saved when localStorage throws', async ({ page }) => {
  await page.addInitScript(() => {
    const fail = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    Storage.prototype.getItem = fail;
    Storage.prototype.setItem = fail;
  });
  await page.goto('./');
  const banner = page.getByRole('alert').filter({ hasText: 'Your progress isn’t being saved' });
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Export progress' })).toBeVisible();
  // The app still works for this session.
  await expect(page.getByRole('heading', { name: 'Learn HTML by writing it.' })).toBeVisible();
  await banner.getByRole('button', { name: 'Dismiss' }).click();
  await expect(banner).toHaveCount(0);
});

test('shows no storage warning when localStorage works', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Learn HTML by writing it.' })).toBeVisible();
  await expect(page.getByText('Your progress isn’t being saved')).toHaveCount(0);
});

test('offers to install when the browser fires beforeinstallprompt', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Install the app' })).toHaveCount(0);
  await page.evaluate(() => {
    const e = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: async () => {
        (window as unknown as { prompted: boolean }).prompted = true;
      },
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    window.dispatchEvent(e);
  });
  await page.getByRole('button', { name: 'Install the app' }).click();
  expect(await page.evaluate(() => (window as unknown as { prompted: boolean }).prompted)).toBe(true);
  await expect(page.getByRole('button', { name: 'Install the app' })).toHaveCount(0);
});

test.describe('on iPhone', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });

  test('explains how to add the app to the home screen', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByText('Add to Home Screen')).toBeVisible();
  });
});

test('shows a backup reminder when the last export is old', async ({ page }) => {
  const old = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [KEY, JSON.stringify({ ...EXISTING, lastExportAt: old })],
  );
  await page.goto('./');
  const reminder = page.getByRole('complementary', { name: 'Backup reminder' });
  await expect(reminder).toBeVisible();
  const download = page.waitForEvent('download');
  await reminder.getByRole('button', { name: 'Export progress' }).click();
  expect((await download).suggestedFilename()).toBe('learnhtml-progress.json');
  await expect(reminder).toHaveCount(0);
  expect((await saved(page)).lastExportAt).toBeGreaterThan(old);
});
