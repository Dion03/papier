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
  const trigger = page.getByRole('button', { name: 'Acties', exact: true });
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

test('menu in een tabel opent in de top layer en wordt niet afgeknipt', async ({ page }) => {
  await open(page, 'light');
  const trigger = page.getByRole('button', { name: 'Acties voor Kleine Uren' });
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  expect(await menu.evaluate((el) => el.matches(':popover-open'))).toBe(true);
  await expect(page.getByRole('menuitem', { name: 'Afspelen' })).toBeFocused();
  const item = page.getByRole('menuitem', { name: 'Naar Discogs' });
  // The last item sits below the table, which scrolls (overflow-x: auto): it must still be the topmost element there.
  const wrap = await page.locator('#data .pp-table-wrap').boundingBox();
  const box = (await item.boundingBox())!;
  expect(box.y + box.height).toBeGreaterThan(wrap!.y + wrap!.height);
  expect(await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent, [box.x + box.width / 2, box.y + box.height / 2])).toBe('Naar Discogs');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('menu klapt omhoog onderaan het scherm', async ({ page }) => {
  await open(page, 'light');
  const trigger = page.getByRole('button', { name: 'Acties', exact: true });
  // Firefox's scrollIntoView({ block: 'end' }) can leave the button a few px below the
  // viewport, so the click would scroll it to the centre first. Place it exactly instead.
  await trigger.evaluate((el) => window.scrollBy({ top: el.getBoundingClientRect().bottom - window.innerHeight + 8, behavior: 'instant' }));
  await trigger.click();
  const menu = page.getByRole('menu');
  await expect(menu).toHaveAttribute('data-side', 'top');
  const m = (await menu.boundingBox())!;
  const t = (await trigger.boundingBox())!;
  expect(m.y + m.height).toBeLessThanOrEqual(t.y);
});

test('combobox: typen, kiezen met het toetsenbord en de lijst in de top layer', async ({ page }) => {
  await open(page, 'light');
  const input = page.getByRole('combobox', { name: 'Plaat op de draaitafel' });
  await input.fill('');
  await input.pressSequentially('bjork');
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  await expect(list.getByRole('option')).toHaveText([/Vespertine/]);
  const l = (await list.boundingBox())!;
  const i = (await input.boundingBox())!;
  // Below the field, or above it when there is no room: never on top of it.
  expect(l.y >= i.y + i.height || l.y + l.height <= i.y).toBe(true);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('Vespertine');
  await expect(list).toBeHidden();
  await expect(input).toBeFocused();
  await expect(page.locator('#zoeken').getByText('Gekozen: Vespertine.')).toBeVisible();
});

test('alertdialog: focus op Annuleren, klik ernaast sluit niet, focus keert terug', async ({ page }) => {
  await open(page, 'light');
  const opener = page.getByRole('button', { name: 'Uit collectie halen' });
  await opener.click();
  const dialog = page.getByRole('alertdialog', { name: 'Blue Train uit je collectie halen?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Annuleren' })).toBeFocused();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('rechts-naar-links: geen horizontale scroll, axe schoon, menu en pijlen gespiegeld', async ({ page }) => {
  // As an app would: dir="rtl" in the HTML itself, before anything renders.
  await page.route('/', async (route) => {
    const res = await route.fetch();
    await route.fulfill({ response: res, body: (await res.text()).replace('<html ', '<html dir="rtl" ') });
  });
  await open(page, 'light');
  expect(await page.evaluate(() => getComputedStyle(document.body).direction)).toBe('rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  expect(await axe(page)).toEqual([]);
  // align="start" lines the menu up with the button's start edge, which is now the right edge.
  const trigger = page.getByRole('button', { name: 'Acties', exact: true });
  await trigger.click();
  const m = (await page.getByRole('menu').boundingBox())!;
  const t = (await trigger.boundingBox())!;
  expect(Math.abs((m.x + m.width) - (t.x + t.width))).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  expect(await page.locator('.pp-breadcrumb__sep').first().evaluate((el) => getComputedStyle(el).scale)).toBe('-1 1');
  // The SegmentedControl indicator sits under the chosen option.
  const chosen = (await page.locator('#keuzes .pp-segmented__option[aria-checked="true"]').first().boundingBox())!;
  const marker = (await page.locator('#keuzes .pp-segmented__indicator').first().boundingBox())!;
  expect(Math.abs(marker.x - chosen.x)).toBeLessThanOrEqual(2);
  // A checked switch has its thumb at the end, i.e. on the left.
  const track = page.locator('#keuzes .pp-switch__track').first();
  if ((await track.getAttribute('aria-checked')) !== 'true') await track.click();
  const thumb = (await track.locator('.pp-switch__thumb').boundingBox())!;
  const box = (await track.boundingBox())!;
  expect(thumb.x + thumb.width / 2).toBeLessThan(box.x + box.width / 2);
});

test('eigen CSS wint van Papier dankzij @layer papier', async ({ page }) => {
  await open(page, 'light');
  await page.addStyleTag({ content: '.pp-button { background: rgb(1, 2, 3); }' });
  expect(await page.locator('#knoppen .pp-button').first().evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(1, 2, 3)');
});

test('thema wisselen werkt en blijft bewaard', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'Donker' }).click();
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
  await page.reload();
  await expect(page.locator('.papier').first()).toHaveAttribute('data-papier-theme', 'dark');
});

test('popover: focus erin, Escape zet hem terug, het paneel staat in de top layer', async ({ page }) => {
  await open(page, 'light');
  const trigger = page.locator('#popover').getByRole('button', { name: /^Filters/ });
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Filter de bak' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('checkbox', { name: 'Jazz' })).toBeFocused();
  expect(await panel.evaluate((el) => { try { return el.matches(':popover-open'); } catch { return true; } })).toBe(true);
  await page.keyboard.press('Space');
  await panel.getByRole('button', { name: 'Toepassen' }).click();
  await expect(panel).toBeHidden();
  await expect(page.locator('#popover').getByText('Je ziet alle genres, vanaf 1960.')).toBeVisible();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Filter de bak' })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('numberfield: typen in het Nederlands, pijltjes en opmaak bij verlaten', async ({ page }) => {
  await open(page, 'light');
  const price = page.getByRole('spinbutton', { name: 'Prijs per plaat' });
  await price.fill('19,5');
  await page.keyboard.press('Tab');
  await expect(price).toHaveValue(/19,50/);
  await price.focus();
  await page.keyboard.press('ArrowUp');
  await expect(price).toHaveValue(/20,00/);
  await expect(price).toHaveAttribute('aria-valuenow', '20');
});

test('filefield: een gekozen bestand verschijnt en is te verwijderen', async ({ page }) => {
  await open(page, 'light');
  const input = page.getByLabel("Foto's van de hoes");
  await input.setInputFiles([{ name: 'hoes.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') }, { name: 'notities.txt', mimeType: 'text/plain', buffer: Buffer.from('x') }]);
  await expect(page.locator('#bestanden').getByText('hoes.png')).toBeVisible();
  await expect(page.locator('#bestanden').getByText('notities.txt heeft een bestandstype dat hier niet kan.')).toBeVisible();
  expect(await input.evaluate((el) => (el as HTMLInputElement).files?.length)).toBe(1);
  await page.getByRole('button', { name: 'hoes.png verwijderen' }).click();
  await expect(input).toBeFocused();
  expect(await input.evaluate((el) => (el as HTMLInputElement).files?.length)).toBe(0);
});

test('datepicker: typen, de kalender met het toetsenbord en focus terug', async ({ page }) => {
  await open(page, 'light');
  const input = page.getByRole('textbox', { name: 'Releasedatum' });
  await input.fill('7/4/72');
  await page.keyboard.press('Tab');
  await expect(input).toHaveValue('07-04-1972');
  await expect(page.locator('#datum').getByText('Release: 1972-04-07')).toBeVisible();
  const toggle = page.locator('#datum').getByRole('button', { name: /^Kies een datum, vrijdag 7 april 1972/ });
  await toggle.click();
  const dialog = page.getByRole('dialog', { name: 'Kies een datum' });
  await expect(dialog.getByRole('gridcell', { name: 'vrijdag 7 april 1972' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(input).toHaveValue('14-04-1972');
  await expect(input).toBeFocused();
});

test('multicombobox: meerdere kiezen met het toetsenbord en Backspace', async ({ page }) => {
  await open(page, 'light');
  const input = page.getByRole('combobox', { name: 'Artiesten in je mix' });
  await input.click();
  await input.pressSequentially('bjork');
  await page.keyboard.press('Enter');
  await expect(page.locator('#meerdere .pp-multi__tag')).toHaveText(['John Coltrane', 'Nina Simone', 'Björk']);
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Backspace');
  await expect(page.locator('#meerdere .pp-multi__tag')).toHaveCount(2);
});

test('rangeslider: de duimen bewegen met pijltjes en passeren elkaar niet', async ({ page }) => {
  await open(page, 'light');
  const from = page.getByRole('slider', { name: 'Prijs Van' });
  await from.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await expect(from).toHaveAttribute('aria-valuetext', /35/);
  await expect(page.getByRole('slider', { name: 'Prijs Tot' })).toHaveAttribute('aria-valuetext', /40/);
});

test('checkboxes: een echte klik op het vakje werkt, ook in een tabel en een popover', async ({ page }) => {
  await open(page, 'light');
  // check() clicks the input itself and fails when another element would catch the click.
  const all = page.getByRole('checkbox', { name: 'Alle formaten' });
  await all.check();
  await expect(page.locator('#meerkeuze').getByRole('checkbox', { name: /^EP/ })).toBeChecked();
  await all.uncheck();
  await expect(page.locator('#meerkeuze').getByRole('checkbox', { name: /^LP/ })).not.toBeChecked();
  await page.locator('#keuzes').getByRole('checkbox').first().check();
  await page.getByRole('checkbox', { name: 'Selecteer Rumours' }).check();
  await expect(page.getByRole('checkbox', { name: 'Selecteer alle zichtbare platen' })).toHaveJSProperty('indeterminate', true);
  await page.getByRole('checkbox', { name: 'Selecteer alle zichtbare platen' }).check();
  await expect(page.locator('#sorteren').getByText('5 geselecteerd.')).toBeVisible();
  await page.locator('#popover').getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('dialog', { name: 'Filter de bak' }).getByRole('checkbox', { name: 'Soul' }).check();
  // The 44px touch area around the box toggles it too.
  await page.keyboard.press('Escape');
  await page.locator('#meerkeuze .pp-check__box').first().scrollIntoViewIfNeeded();
  const box = (await page.locator('#meerkeuze .pp-check__box').first().boundingBox())!;
  await page.mouse.click(box.x - 6, box.y + box.height / 2);
  await expect(all).toBeChecked();
});

test('multicombobox: de pijl blijft op de eerste regel als de labels doorlopen', async ({ page }) => {
  await open(page, 'light');
  const input = page.getByRole('combobox', { name: 'Artiesten in je mix' });
  await input.click();
  for (const name of ['froukje', 'bjork', 'radiohead']) { await input.pressSequentially(name); await page.keyboard.press('Enter'); }
  await page.keyboard.press('Escape');
  const tags = page.locator('#meerdere .pp-multi__tag');
  const first = (await tags.first().boundingBox())!;
  const last = (await tags.last().boundingBox())!;
  const toggle = (await page.locator('#meerdere .pp-combobox__toggle').boundingBox())!;
  expect(last.y).toBeGreaterThan(first.y + first.height - 1);
  expect(Math.abs((toggle.y + toggle.height / 2) - (first.y + first.height / 2))).toBeLessThan(4);
});

const sections = ['knoppen', 'formulieren', 'velden', 'zoeken', 'keuzes', 'slider', 'feedback', 'select', 'overlays', 'navigatie', 'data', 'materiaal',
  'popover', 'menu-keuzes', 'getallen', 'account', 'bestanden', 'meerkeuze', 'structuur-plus', 'sorteren', 'details',
  // Not 'datum': its calendar shows the current month and today, so a screenshot changes daily.
  'meerdere', 'bereik', 'periode'];
for (const theme of ['light', 'dark'] as const) {
  test(`visuele regressie (${theme})`, async ({ page }) => {
    await open(page, theme);
    await expect(page.locator('.doc-hero')).toHaveScreenshot(`hero-${theme}.png`);
    for (const id of sections) {
      await expect(page.locator(`#${id} .doc-example__stage`)).toHaveScreenshot(`${id}-${theme}.png`);
    }
  });
}
