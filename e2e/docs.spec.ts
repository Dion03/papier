import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

async function open(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => { try { localStorage.setItem('papier-docs-theme', t); } catch { /* ignore */ } }, theme);
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}

async function axe(page: Page, options: Record<string, unknown> = {}) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async (opts) => {
    const r = await (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: Array<{ id: string; nodes: unknown[] }> }> } }).axe.run(document, opts);
    return r.violations.map((v) => `${v.id} (${v.nodes.length})`);
  }, options);
}

for (const theme of ['light', 'dark'] as const) {
  test(`axe vindt niets (${theme})`, async ({ page }) => {
    await open(page, theme);
    expect(await axe(page)).toEqual([]);
  });

  test(`geen horizontale scroll (${theme})`, async ({ page }) => {
    await open(page, theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
}

test('hoogcontrastmodus: axe en elke knop zichtbaar begrensd', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'forced-colors emulatie werkt alleen in Chromium');
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page, 'light');
  // axe reads author colours, not the forced system palette, so contrast is judged by the screenshot.
  expect(await axe(page, { rules: { 'color-contrast': { enabled: false } } })).toEqual([]);
  await expect(page.locator('#keuzes .doc-example__stage')).toHaveScreenshot('forced-colors-keuzes.png');
  const borderless = await page.$$eval('.pp-button, .pp-icon-button', (els) => els.filter((e) => getComputedStyle(e).borderTopStyle === 'none').length);
  expect(borderless).toBe(0);
});

test('toetsenbord: menu, dialoog en terugkeer van focus', async ({ page }) => {
  await open(page, 'light');
  const trigger = page.getByRole('button', { name: /^Acties/ });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Afspelen' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();

  const opener = page.getByRole('button', { name: 'Plaat opbergen' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Plaat terug in de hoes?' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('thema wisselen werkt en blijft bewaard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Donker' }).click();
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
  await page.reload();
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
});

const sections = ['knoppen', 'formulieren', 'keuzes', 'slider', 'feedback', 'select', 'overlays', 'data', 'materiaal'];
for (const theme of ['light', 'dark'] as const) {
  test(`visuele regressie (${theme})`, async ({ page }) => {
    await open(page, theme);
    await expect(page.locator('.doc-hero')).toHaveScreenshot(`hero-${theme}.png`);
    for (const id of sections) {
      await expect(page.locator(`#${id} .doc-example__stage`)).toHaveScreenshot(`${id}-${theme}.png`);
    }
  });
}
