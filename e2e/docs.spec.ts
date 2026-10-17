import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

// Every route of the docs site; tests/docs.test.ts keeps docs/registry.tsx in step with the examples.
const registry = readFileSync('docs/registry.tsx', 'utf8');
const slugs = [...registry.matchAll(/\{ slug: '([^']+)', example: '([^']+)'/g)].map((m) => ({ slug: m[1], example: m[2] }));
const guides = ['', 'getting-started', 'theming', 'foundations', 'stability', 'components', 'category/inputs'];

async function open(page: Page, theme: 'light' | 'dark', path = '') {
  await page.addInitScript((t) => { try { localStorage.setItem('papier-docs-theme', t); } catch { /* ignore */ } }, theme);
  await page.goto(`/#/${path}`);
  // Pages load lazily: wait for the heading and for the skeleton to go.
  await expect(page.locator('#page-title')).toBeVisible();
  await expect(page.locator('.doc-loading')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}
/** A component page by its old example id, e.g. "knoppen". */
const component = (example: string) => `components/${slugs.find((s) => s.example === example)!.slug}`;

/** Client-side navigation; waits until the new page's heading replaced the old one. */
async function go(page: Page, path: string) {
  if (await page.evaluate((p) => window.location.hash === `#/${p}`, path)) return;
  await page.evaluate((p) => {
    const old = document.getElementById('page-title');
    if (old) old.dataset.old = '';
    window.location.hash = `#/${p}`;
  }, path);
  await expect(page.locator('#page-title:not([data-old])')).toBeVisible();
  await expect(page.locator('.doc-loading')).toHaveCount(0);
}

async function axe(page: Page, options: Record<string, unknown> = {}) {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axeSource });
  return page.evaluate(async (opts) => {
    const r = await (window as unknown as { axe: { run: (c: Document, o: unknown) => Promise<{ violations: Array<{ id: string; nodes: Array<{ target: string[] }> }> }> } }).axe.run(document, opts);
    return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`);
  }, options);
}

for (const theme of ['light', 'dark'] as const) {
  test(`axe and no horizontal scroll on every page (${theme})`, async ({ page }) => {
    test.setTimeout(240_000);
    await open(page, theme);
    for (const path of [...guides, ...slugs.map((s) => `components/${s.slug}`)]) {
      if (path) await go(page, path);
      expect(await axe(page), path || 'home').toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path || 'home').toBeLessThanOrEqual(0);
    }
  });
}

test('forced colours: axe, and every button has a visible edge', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'forced-colors emulation only works in Chromium');
  await page.emulateMedia({ forcedColors: 'active' });
  await open(page, 'light', component('keuzes'));
  // axe reads author colours, not the forced system palette, so contrast is judged by the screenshot.
  expect(await axe(page, { rules: { 'color-contrast': { enabled: false } } })).toEqual([]);
  await expect(page.locator('#keuzes .doc-example__stage')).toHaveScreenshot('forced-colors-keuzes.png');
  const borderless = await page.$$eval('.pp-button, .pp-icon-button', (els) => els.filter((e) => getComputedStyle(e).borderTopStyle === 'none').length);
  expect(borderless).toBe(0);
});

test('navigation: sidebar, focus on the heading, previous and next', async ({ page, isMobile }) => {
  test.skip(isMobile, 'on narrow screens the sidebar lives in the menu');
  await open(page, 'light', 'components/button');
  await expect(page).toHaveTitle('Button · Papier');
  await page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Combobox', exact: true }).click();
  await expect(page).toHaveURL(/#\/components\/combobox$/);
  await expect(page.locator('#page-title')).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Documentation' }).getByRole('link', { name: 'Combobox', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('navigation', { name: 'Previous and next component' }).getByRole('link', { name: /Next/ }).click();
  await expect(page).toHaveURL(/#\/components\/multi-combobox$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/components\/combobox$/);
  // A section link from "On this page" scrolls to the API.
  await page.goto('/#/components/date-picker/api');
  await expect(page.locator('#api')).toBeInViewport();
});

test('search: Ctrl+K, typing and Enter opens the page; Escape closes it', async ({ page }) => {
  await open(page, 'light');
  await page.keyboard.press('Control+k');
  const search = page.getByRole('combobox', { name: 'Search the documentation' });
  await expect(search).toBeFocused();
  await search.fill('daterange');
  await expect(page.getByRole('option').first()).toContainText('DateRangePicker');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/components\/date-range-picker$/);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('combobox', { name: 'Search the documentation' }).fill('dark');
  await page.keyboard.press('Enter');
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
  await page.keyboard.press('/');
  await expect(page.getByRole('combobox', { name: 'Search the documentation' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('combobox', { name: 'Search the documentation' })).toBeHidden();
});

test('mobile menu: the sheet opens and a link closes it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'narrow screens only');
  await open(page, 'light', 'getting-started');
  await page.getByRole('button', { name: 'Navigation' }).click();
  const sheet = page.getByRole('dialog', { name: 'Navigation' });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('link', { name: 'PinInput' }).click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/#\/components\/pin-input$/);
});

test('old anchors and Dutch routes open the right page, unknown routes an empty state', async ({ page }) => {
  await page.goto('/#knoppen');
  await expect(page).toHaveURL(/#\/components\/button$/);
  await expect(page.locator('#knoppen')).toBeVisible();
  await page.goto('/#/componenten/date-picker/toegankelijkheid');
  await expect(page).toHaveURL(/#\/components\/date-picker\/accessibility$/);
  await expect(page.locator('#accessibility')).toBeInViewport();
  await page.goto('/#/components/does-not-exist');
  await expect(page.getByRole('heading', { name: 'This page does not exist (any more)' })).toBeVisible();
});

test('explorer: filtering, the empty state and a card opens its page', async ({ page }) => {
  await open(page, 'light', 'components');
  const filter = page.getByRole('searchbox', { name: 'Filter the components' });
  await filter.fill('upload');
  await expect(page.locator('.doc-card')).toHaveCount(1);
  await filter.fill('xyzzy');
  await expect(page.getByRole('heading', { name: 'Nothing found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filter' }).click();
  await page.locator('.doc-cards').getByRole('link', { name: 'Steps', exact: true }).click();
  await expect(page).toHaveURL(/#\/components\/steps$/);
});

test('keyboard: menu, dialog and focus return', async ({ page }) => {
  await open(page, 'light', component('overlays'));
  const trigger = page.getByRole('button', { name: 'Actions', exact: true });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Play' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();

  await go(page, component('dialoog'));
  const opener = page.getByRole('button', { name: 'Put record away' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Put the record back in its sleeve?' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('a menu in a table opens in the top layer and is not clipped', async ({ page }) => {
  await open(page, 'light', component('data'));
  const trigger = page.getByRole('button', { name: 'Actions for Kleine Uren' });
  // Room below the button, so the menu opens downwards and past the table's bottom edge.
  await trigger.evaluate((el) => window.scrollBy({ top: el.getBoundingClientRect().top - 140, behavior: 'instant' }));
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  expect(await menu.evaluate((el) => el.matches(':popover-open'))).toBe(true);
  await expect(page.getByRole('menuitem', { name: 'Play' })).toBeFocused();
  const item = page.getByRole('menuitem', { name: 'Open in Discogs' });
  const wrap = await page.locator('#data .pp-table-wrap').boundingBox();
  const box = (await item.boundingBox())!;
  expect(box.y + box.height).toBeGreaterThan(wrap!.y + wrap!.height);
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent, [box.x + box.width / 2, box.y + box.height / 2])).toBe('Open in Discogs');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('a menu flips up at the bottom of the screen', async ({ page }) => {
  await open(page, 'light', component('overlays'));
  const trigger = page.getByRole('button', { name: 'Actions', exact: true });
  // Make the window end just below the button, whatever the length of the page.
  const bottom = await trigger.evaluate((el) => { window.scrollTo(0, 0); return el.getBoundingClientRect().bottom + window.scrollY; });
  await page.setViewportSize({ width: page.viewportSize()!.width, height: Math.ceil(bottom + 8) });
  await trigger.evaluate((el) => window.scrollBy({ top: el.getBoundingClientRect().bottom - window.innerHeight + 8, behavior: 'instant' }));
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toHaveAttribute('data-side', 'top');
  const m = (await menu.boundingBox())!;
  const t = (await trigger.boundingBox())!;
  expect(m.y + m.height).toBeLessThanOrEqual(t.y);
});

test('combobox: typing, choosing with the keyboard and the list in the top layer', async ({ page }) => {
  await open(page, 'light', component('zoeken'));
  const input = page.getByRole('combobox', { name: 'Record on the turntable' });
  await input.fill('');
  await input.pressSequentially('bjork');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option')).toHaveText([/Vespertine/]);
  const l = (await list.boundingBox())!;
  const i = (await input.boundingBox())!;
  expect(l.y >= i.y + i.height || l.y + l.height <= i.y).toBe(true);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Vespertine');
  await expect(list).toBeHidden();
  await expect(input).toBeFocused();
  await expect(page.locator('#zoeken').getByText('Selected: Vespertine.')).toBeVisible();
});

test('alertdialog: focus on Cancel, a click outside does not close it, focus returns', async ({ page }) => {
  await open(page, 'light', component('bevestigen'));
  const opener = page.getByRole('button', { name: 'Remove from collection' });
  await opener.click();
  const dialog = page.getByRole('alertdialog', { name: 'Remove Blue Train from your collection?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('right to left: no horizontal scroll, axe clean, menu and arrows mirrored', async ({ page }) => {
  // As an app would: dir="rtl" in the HTML itself, before anything renders.
  await page.route('/', async (route) => {
    const res = await route.fetch();
    await route.fulfill({ response: res, body: (await res.text()).replace('<html ', '<html dir="rtl" ') });
  });
  await open(page, 'light', component('overlays'));
  expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe('rtl');
  for (const path of ['', component('overlays'), component('keuzes')]) {
    await go(page, path || 'getting-started');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    expect(await axe(page)).toEqual([]);
  }
  await go(page, component('overlays'));
  // align="start" lines the menu up with the button's start edge, which is now the right edge.
  const trigger = page.getByRole('button', { name: 'Actions', exact: true });
  await trigger.click();
  const m = (await page.getByRole('menu').boundingBox())!;
  const t = (await trigger.boundingBox())!;
  expect(Math.abs((m.x + m.width) - (t.x + t.width))).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  expect(await page.locator('.pp-breadcrumb__sep').first().evaluate((el) => getComputedStyle(el).scale)).toBe('-1 1');
  await go(page, component('keuzes'));
  const chosen = (await page.locator('#keuzes .pp-segmented__option[aria-checked="true"]').first().boundingBox())!;
  const marker = (await page.locator('#keuzes .pp-segmented__indicator').first().boundingBox())!;
  expect(Math.abs(marker.x - chosen.x)).toBeLessThanOrEqual(2);
  const track = page.locator('#keuzes .pp-switch__track').first();
  if ((await track.getAttribute('aria-checked')) !== 'true') await track.click();
  const thumb = (await track.locator('.pp-switch__thumb').boundingBox())!;
  const box = (await track.boundingBox())!;
  expect(thumb.x + thumb.width / 2).toBeLessThan(box.x + box.width / 2);
});

test('your own CSS beats Papier thanks to @layer papier', async ({ page }) => {
  await open(page, 'light', component('knoppen'));
  await page.addStyleTag({ content: '.pp-button { background: rgb(1, 2, 3); }' });
  expect(await page.locator('#knoppen .doc-example__stage .pp-button').first().evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(1, 2, 3)');
});

test('switching the theme works and is remembered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Dark' }).click();
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
  await page.reload();
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
});

test('example and code: the code tab shows the code and the copy button copies it', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions only in Chromium');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, 'light', component('knoppen'));
  const demo = page.locator('#example');
  await demo.getByRole('tab', { name: 'Code' }).click();
  await expect(demo.getByRole('region', { name: /Code of/ }).or(demo.locator('pre'))).toContainText('<Button');
  await demo.getByRole('button', { name: 'Copy' }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('<Button');
});

test('popover: focus moves in, Escape returns it, the panel is in the top layer', async ({ page }) => {
  await open(page, 'light', component('popover'));
  const trigger = page.locator('#popover').getByRole('button', { name: /^Filters/ });
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Filter the crate' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('checkbox', { name: 'Jazz' })).toBeFocused();
  expect(await panel.evaluate((el) => { try { return el.matches(':popover-open'); } catch { return true; } })).toBe(true);
  await page.keyboard.press('Space');
  await panel.getByRole('button', { name: 'Apply' }).click();
  await expect(panel).toBeHidden();
  await expect(page.locator('#popover').getByText('Showing all genres, from 1960.')).toBeVisible();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Filter the crate' })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('numberfield: typing in the app’s locale, arrows and formatting on blur', async ({ page }) => {
  await open(page, 'light', component('getallen'));
  const price = page.getByRole('spinbutton', { name: 'Price per record' });
  await price.fill('19.5');
  await page.keyboard.press('Tab');
  await expect(price).toHaveValue(/19\.50/);
  await price.focus();
  await page.keyboard.press('ArrowUp');
  await expect(price).toHaveValue(/20\.00/);
  await expect(price).toHaveAttribute('aria-valuenow', '20');
});

test('filefield: a chosen file appears and can be removed', async ({ page }) => {
  await open(page, 'light', component('bestanden'));
  const input = page.getByLabel('Photos of the sleeve');
  await input.setInputFiles([{ name: 'sleeve.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') }, { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') }]);
  await expect(page.locator('#bestanden').getByText('sleeve.png')).toBeVisible();
  await expect(page.locator('#bestanden').getByText('notes.txt is a file type that is not allowed here.')).toBeVisible();
  expect(await input.evaluate((el) => (el as HTMLInputElement).files?.length)).toBe(1);
  await page.getByRole('button', { name: 'Remove sleeve.png' }).click();
  await expect(input).toBeFocused();
  expect(await input.evaluate((el) => (el as HTMLInputElement).files?.length)).toBe(0);
});

test('datepicker: typing, the calendar by keyboard and focus back', async ({ page }) => {
  await open(page, 'light', component('datum'));
  const input = page.getByRole('textbox', { name: 'Release date' });
  await input.fill('7/4/72');
  await page.keyboard.press('Tab');
  await expect(input).toHaveValue('07/04/1972');
  await expect(page.locator('#datum').getByText('Release: 1972-04-07')).toBeVisible();
  const toggle = page.locator('#datum').getByRole('button', { name: /^Choose a date, Friday,? 7 April 1972/ });
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Choose a date' });
  await expect(dialog.getByRole('gridcell', { name: /^Friday,? 7 April 1972$/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(input).toHaveValue('14/04/1972');
  await expect(input).toBeFocused();
});

test('multicombobox: choosing several, Backspace, and the arrow stays on the first line', async ({ page }) => {
  await open(page, 'light', component('meerdere'));
  const input = page.getByRole('combobox', { name: 'Artists in your mix' });
  await input.click();
  await input.pressSequentially('bjork');
  await page.keyboard.press('Enter');
  await expect(page.locator('#meerdere .pp-multi__tag')).toHaveText(['John Coltrane', 'Nina Simone', 'Björk']);
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#meerdere .pp-multi__tag')).toHaveCount(2);
  for (const name of ['froukje', 'bjork', 'radiohead']) { await input.pressSequentially(name); await page.keyboard.press('Enter'); }
  await page.keyboard.press('Escape');
  const tags = page.locator('#meerdere .pp-multi__tag');
  const first = (await tags.first().boundingBox())!;
  const last = (await tags.last().boundingBox())!;
  const toggle = (await page.locator('#meerdere .pp-combobox__toggle').boundingBox())!;
  expect(last.y).toBeGreaterThan(first.y + first.height - 1);
  expect(Math.abs((toggle.y + toggle.height / 2) - (first.y + first.height / 2))).toBeLessThan(4);
});

test('rangeslider: the thumbs move with arrows and never pass each other', async ({ page }) => {
  await open(page, 'light', component('bereik'));
  const from = page.getByRole('slider', { name: 'Price From' });
  await from.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await expect(from).toHaveAttribute('aria-valuetext', /35/);
  await expect(page.getByRole('slider', { name: 'Price To' })).toHaveAttribute('aria-valuetext', /40/);
});

test('checkboxes: a real click on the box works, also in a table and a popover', async ({ page }) => {
  await open(page, 'light', component('meerkeuze'));
  // check() clicks the input itself and fails when another element would catch the click.
  const all = page.getByRole('checkbox', { name: 'All formats' });
  await all.check();
  await expect(page.locator('#meerkeuze').getByRole('checkbox', { name: /^EP/ })).toBeChecked();
  await all.uncheck();
  await expect(page.locator('#meerkeuze').getByRole('checkbox', { name: /^LP/ })).not.toBeChecked();
  // The 44px touch area around the box toggles it too.
  const box = (await page.locator('#meerkeuze .pp-check__box').first().boundingBox())!;
  await page.mouse.click(box.x - 6, box.y + box.height / 2);
  await expect(all).toBeChecked();
  await go(page, component('keuzes'));
  await page.locator('#keuzes').getByRole('checkbox').first().check();
  await go(page, component('sorteren'));
  await page.getByRole('checkbox', { name: 'Select Rumours' }).check();
  await expect(page.getByRole('checkbox', { name: 'Select all visible records' })).toHaveJSProperty('indeterminate', true);
  await page.getByRole('checkbox', { name: 'Select all visible records' }).check();
  await expect(page.locator('#sorteren').getByText('5 selected.')).toBeVisible();
  await go(page, component('popover'));
  await page.locator('#popover').getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('dialog', { name: 'Filter the crate' }).getByRole('checkbox', { name: 'Soul' }).check();
});

test('command and pin code: searching inline, and a code via autofill in the boxes', async ({ page }) => {
  await open(page, 'light', component('command'));
  const inline = page.locator('#command .doc-command-inline').getByRole('combobox');
  await inline.fill('csv');
  await expect(page.locator('#command .doc-command-inline').getByRole('option')).toHaveText([/Export as CSV/]);
  await go(page, component('pincode'));
  const first = page.locator('#example').getByRole('textbox', { name: 'Character 1 of 6' });
  // As the phone's SMS suggestion does: the whole code lands in the first box and spreads out.
  // (Pasting is covered by the unit tests; Firefox drops the data of a synthetic paste event.)
  await first.fill('424242');
  await expect(page.getByText('Signed in')).toBeVisible();
});

test('responsive: every page on phone, tablet, laptop and wide without horizontal scroll', async ({ page, isMobile }) => {
  test.skip(isMobile, 'this test sets its own widths');
  test.setTimeout(300_000);
  await open(page, 'light');
  for (const [width, height] of [[360, 740], [768, 1024], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    for (const path of [...guides, ...slugs.map((s) => `components/${s.slug}`)]) {
      await go(page, path || 'getting-started');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${width}px ${path || 'home'}`).toBeLessThanOrEqual(0);
      await expect(page.locator('#page-title'), `${width}px ${path}`).toBeInViewport({ ratio: 0.5 });
    }
    // Navigation is reachable at every width: the top nav, or the menu button below 900 px.
    await go(page, 'components');
    const nav = width < 900 ? page.getByRole('button', { name: 'Navigation' }) : page.getByRole('navigation', { name: 'Main', exact: true });
    await expect(nav, `${width}px navigation`).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search', exact: true }), `${width}px search`).toBeVisible();
  }
});

test('keyboard: the skip link moves focus to the page heading', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Safari skips links with Tab');
  await open(page, 'light', 'components/command');
  // The inline Command on this page must not scroll the page when it appears.
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#page-title')).toBeFocused();
});

test('related components and categories link to each other', async ({ page }) => {
  await open(page, 'light', 'components/date-picker');
  const related = page.locator('#related');
  await expect(related.getByRole('link')).not.toHaveCount(0);
  await related.getByRole('link', { name: /DateRangePicker/ }).click();
  await expect(page).toHaveURL(/#\/components\/date-range-picker$/);
  await page.getByRole('navigation', { name: 'You are here' }).getByRole('link', { name: 'Dates' }).click();
  await expect(page).toHaveURL(/#\/category\/dates$/);
  await expect(page.locator('.doc-card')).toHaveCount(2);
});

test('loading state: a skeleton while a page loads, then the content', async ({ page }) => {
  await open(page, 'light');
  // Hold back the chunk with the component pages, as on a slow connection.
  let release!: () => void;
  const held = new Promise<void>((r) => { release = r; });
  await page.route(/Components-.*\.js$/, async (route) => { await held; await route.continue(); });
  await page.evaluate(() => { window.location.hash = '#/components/steps'; });
  await expect(page.locator('.doc-loading')).toBeVisible();
  await expect(page.locator('.doc-loading')).toHaveAttribute('aria-busy', 'true');
  release();
  await expect(page.locator('#stappen')).toBeVisible();
  await expect(page.locator('.doc-loading')).toHaveCount(0);
});

// Not 'datum': its calendar shows the current month and today, so a screenshot changes daily.
const sections = ['knoppen', 'formulieren', 'velden', 'zoeken', 'keuzes', 'slider', 'feedback', 'select', 'overlays', 'navigatie', 'data', 'materiaal',
  'popover', 'menu-keuzes', 'getallen', 'account', 'bestanden', 'meerkeuze', 'structuur-plus', 'sorteren', 'details', 'meerdere', 'bereik', 'periode',
  'kopieren', 'stappen', 'pincode'];
for (const theme of ['light', 'dark'] as const) {
  test(`visual regression (${theme})`, async ({ page }) => {
    test.setTimeout(120_000);
    await open(page, theme);
    await expect(page.locator('.doc-hero')).toHaveScreenshot(`hero-${theme}.png`);
    for (const id of sections) {
      await go(page, component(id));
      await expect(page.locator(`#${id} .doc-example__stage`)).toHaveScreenshot(`${id}-${theme}.png`);
    }
  });
}
