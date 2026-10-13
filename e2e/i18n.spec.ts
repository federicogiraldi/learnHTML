import { expect, test } from '@playwright/test';

test('switches between English and Italian at any time, keeping the code being edited', async ({ page }) => {
  await page.goto('./#/learn/basics-first-tag');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your first tag');

  const editor = page.locator('.cm-content').first();
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type('<h1>Hello</h1>');

  await page.getByRole('button', { name: 'Passa all’italiano' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Il tuo primo tag');
  await expect(page.getByRole('heading', { name: 'I tuoi compiti' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  // Check messages are translated too, and the code is untouched.
  await expect(page.getByText('Aggiungi un paragrafo <p>.')).toBeVisible();
  await expect(editor).toContainText('<h1>Hello</h1>');

  // The choice is remembered.
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Il tuo primo tag');
  await page.goto('./#/course/css');
  await expect(page.getByRole('heading', { name: 'Impara CSS scrivendolo.' })).toBeVisible();

  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('heading', { name: 'Learn CSS by writing it.' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
