# Papier

My design system: warm paper, ink, vermilion and sage from
[portfolio.dionbm.nl](https://portfolio.dionbm.nl) as accessible React components,
with tokens for web and Android.

Documentation and examples: [papier.dionbm.nl](https://papier.dionbm.nl).

```bash
npm install @dionbm/papier
```

```tsx
import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier, ToastProvider, Button } from '@dionbm/papier';

export function App() {
  return (
    <Papier theme="system">
      <ToastProvider>
        <Button>Save</Button>
      </ToastProvider>
    </Papier>
  );
}
```

Works in Vite and in Next.js (App Router), with React 18 or 19. Everything renders on the server.

## Components (56)

| Group | Components |
|---|---|
| Basics | Papier, Text, VisuallyHidden, Stack, Container, Separator, Kbd |
| Actions | Button, IconButton, CopyButton, Link, Menu, Toggle, ToggleGroup |
| Forms | TextField, TextArea, PasswordField, NumberField, PinInput, FileField, DatePicker, DateRangePicker, Calendar, RangeCalendar, Select, Combobox, MultiCombobox, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, RangeSlider, SegmentedControl |
| Field building blocks | Field, FieldLabel, FieldHint, FieldError, useField, useFieldControl |
| Navigation | Breadcrumb (BreadcrumbItem), Pagination, Steps |
| Structure | Tabs (TabList, Tab, TabPanel), Disclosure, Accordion, Table, SortHeader and useTableSort |
| Overlays | Dialog, AlertDialog, Sheet, Popover, Tooltip, Command and CommandDialog |
| Feedback | Notice, ToastProvider and useToast, Progress, Spinner, Skeleton, EmptyState |
| Material | Surface, Tag, Avatar |

Plus 30 line icons under `icons`.

Every component has its own page on [papier.dionbm.nl](https://papier.dionbm.nl) with a
live example, code, variants, accessibility and the API from the types. Search with
<kbd>Ctrl</kbd> <kbd>K</kbd> (<kbd>⌘</kbd> <kbd>K</kbd> on a Mac) or <kbd>/</kbd>.

How Papier compares to shadcn/ui, Radix, Mantine, Chakra and HeroUI, and what is still on the
list: [docs/gap-analysis.md](docs/gap-analysis.md).

## In your own app

### Router links: `asChild`

With `asChild`, Button, IconButton and Link render their only child instead of their own
element. That gives the Link from Next.js or React Router the Papier look, and it stays a
real link:

```tsx
import NextLink from 'next/link';

<Button asChild variant="ink" iconEnd={<icons.ArrowRight />}>
  <NextLink href="/work">See the work</NextLink>
</Button>
<Link asChild variant="arrow"><NextLink href="/about">About me</NextLink></Link>
<IconButton asChild label="Home" icon={<icons.ArrowLeft />}><NextLink href="/" /></IconButton>
```

Papier puts the class, data attributes, ARIA and `ref` on the child; the child's `className`,
`style` and handlers are kept. The child's text becomes the label. A `loading` or `disabled`
Button with `asChild` gets `aria-disabled` and blocks the click, including the router
link's navigation.

### Fields: `Field`, `useField` and prefix/suffix

TextField, TextArea and Select are built on `Field`. Use the same building block for your
own or a third-party input, and it gets the same styling and wiring (label, error and hint
via `aria-describedby`, `aria-invalid`):

```tsx
<Field label="Speed" hint="33, 45 or 78" error={error}>
  {(control) => <MyInput {...control} />}
</Field>
```

Children can also fetch the props themselves with `useFieldControl()`. To control the
structure entirely yourself, use `useField` with `FieldLabel`, `FieldHint` and `FieldError`:

```tsx
const f = useField({ hint, error });
<FieldLabel {...f.labelProps}>Artist</FieldLabel>
<MyCombobox {...f.controlProps} aria-labelledby={f.ids.label} />
<FieldError {...f.errorProps}>{error}</FieldError>
<FieldHint {...f.hintProps}>{hint}</FieldHint>
```

TextField has `prefix` and `suffix` for an icon or unit:

```tsx
<TextField label="Price in euros" prefix="€" />
<TextField label="Search" hideLabel prefix={<icons.Search />} />
```

Prefix and suffix are decorative (`aria-hidden`), as in GOV.UK. So put the unit in the
label or hint as well.

### Popover and menus with choices

Popover is a non-modal panel next to a button, for filters, a short form or an explanation.
Focus moves into it on open and back to the button on Escape:

```tsx
<Popover title="Filter the crate" trigger={<Button variant="secondary">Filters</Button>}>
  {({ close }) => <Button onClick={() => { apply(); close(); }}>Apply</Button>}
</Popover>
```

Besides actions, Menu supports headings, separators, choices, links and shortcuts. Existing
`items` work unchanged:

```tsx
<Menu trigger="View" items={[
  { type: 'label', label: 'Sort by' },
  { type: 'radio', label: 'Artist', checked: sort === 'artist', onSelect: () => setSort('artist') },
  { type: 'separator' },
  { type: 'checkbox', label: 'Sleeves', checked: covers, keepOpen: true, onSelect: toggleCovers },
  { label: 'View on Discogs', href: 'https://www.discogs.com', target: '_blank' },
]} />
```

### Numbers, passwords and files

```tsx
<NumberField label="Price" formatOptions={{ style: 'currency', currency: 'EUR' }} min={0} step={0.5} />
<PasswordField label="Password" autoComplete="current-password" />
<TextArea label="Notes" autoResize maxRows={8} />
<FileField label="Sleeves" accept="image/*" multiple maxFiles={4} maxSize={5_000_000} />
```

NumberField reads and writes numbers in the app's language (`24,95` in Dutch). That comes
from `labels.locale` (`nl-NL` in `dutchLabels`, `en-US` in `englishLabels`), or pass
`locale`. FileField writes dropped and removed files back to the real
`<input type="file">`, so a plain form submits what you see.

### Dates, multiple choices and ranges

```tsx
<DatePicker label="Delivery date" value={date} onValueChange={setDate} min="2026-10-20" isDateUnavailable={isWeekend} />
<Calendar value={date} onValueChange={setDate} />
<DateRangePicker label="Stay" value={stay} onValueChange={setStay} startName="arrival" endName="departure" />
<MultiCombobox label="Genres" options={genres} value={chosen} onValueChange={setChosen} max={5} />
<RangeSlider label="Year" min={1950} max={2025} value={years} onValueChange={setYears} marks={[1960, 1980, 2000]} />
```

Dates are strings in the form `"2024-03-15"`, just like `<input type="date">`, so no day
shifts because of a time zone. DatePicker reads typed dates in the order of `locale`
(`15-3-2024` in Dutch, `3/15/2024` in American English) and the calendar starts the week
on the first day for that language.

### Sortable tables

```tsx
const sort = useTableSort<'title' | 'year'>();
<thead><tr>
  <SortHeader {...sort.headerProps('title')}>Title</SortHeader>
  <SortHeader {...sort.headerProps('year')} align="end">Year</SortHeader>
</tr></thead>
<tbody>{sort.sortRows(rows, (row, key) => row[key]).map(renderRow)}</tbody>
```

### Toasts that follow along with work

```tsx
const { promise } = useToast();
promise(save(), {
  loading: { title: 'Saving…' },
  success: { title: 'Saved' },
  error: (e) => ({ title: 'Saving failed', description: String(e) }),
});
```

`update(id, options)` changes an existing toast; its timer then starts again.

### Overlays in the top layer

Menu and Tooltip open in the top layer using the Popover API. They don't get clipped in a
Table, Surface or other container with `overflow: hidden`, and they flip at the edge of
the screen. You choose the placement with `side` and `align` (Menu) or `placement` (Tooltip):
`top`, `bottom`, `left` or `right`. Browsers without the Popover API get a fixed panel with
a `z-index`. The panel stays in the DOM next to its button, so the tab order and the
`.papier` variables stay correct.

### Cascade: `@layer papier`

All of Papier's CSS, including the tokens, lives in `@layer papier`. Styles outside a layer
therefore always win, regardless of specificity:

```css
.pp-button { border-radius: 8px; }           /* beats Papier */
:root { --papier-color-accent: #d6452a; }     /* overrides a token */
```

- Your own reset (`button { color: inherit }`) now wins too. Put it in a layer before
  Papier: `@layer reset, papier;` at the top of your CSS.
- Tailwind 4 uses layers itself. Put
  `@layer theme, base, papier, components, utilities;` at the top of your CSS, so utilities
  beat Papier and Papier beats the Tailwind base.
- Tailwind 3 writes everything without a layer, including the preflight reset. Utilities
  therefore win on their own, but the reset (`button { background-color: transparent }`)
  beats Papier too. Load preflight in a layer (`@import 'tailwindcss/base' layer(reset);` with
  postcss-import) or turn off `corePlugins.preflight`.

### Next.js and server components

The build has one file per module. Only modules with hooks, context or events
start with `'use client'`; Text, VisuallyHidden, Stack, Container, Surface, Tag, Table,
Skeleton, Separator, Kbd, EmptyState, the icons and the theme functions stay server components and add no
JavaScript to your page. Which modules those are is listed in
`scripts/server-modules.mjs`; a test checks that they contain no client code, and
`scripts/check-build.mjs` that the build is correct.

### Custom theme

Components only use colour roles (`--papier-color-*`). A brand is therefore a
different value for a few roles:

```tsx
import { Papier, themeStyle, checkTheme } from '@dionbm/papier';

const brand = { action: '#1f4e8c', 'action-hover': '#183d6e', 'on-action': '#ffffff' };

<Papier theme="light" style={themeStyle(brand)}>…</Papier>
```

`checkTheme(brand, 'light')` checks the colours against the same 26 contrast pairs as the build
and returns the ratio per pair. Put it in a test, and no brand colour can make text
unreadable:

```ts
expect(checkTheme(brand).filter((r) => !r.ok)).toEqual([]);
```

All roles are in `colorRoles`, the built-in values in `themeColors('light')` and
`themeColors('dark')`. For both light and dark, set the variables in your own CSS:

```css
[data-papier-theme="light"] { --papier-color-action: #1f4e8c; }
[data-papier-theme="dark"] { --papier-color-action: #9cc0ff; }
```

### Right to left

Set `dir="rtl"` on `<html>` (or on `<Papier>`). Papier uses logical CSS
(`inset-inline-start`, `text-align: start`), so alignment, tables, toasts and fields
follow along. Menus with `align="start"` align to the right side of the button, and arrows
in Link, Breadcrumb and Pagination are mirrored. Give your own directional icons
`className="pp-flip-rtl"`, for example in a Button's `iconEnd`. Set the direction
before rendering: if you change `dir` later, you have to re-render the page.

### Refs

Every component with its own element forwards `ref`: Dialog and Sheet to the
`<dialog>`, Menu to the trigger button, Popover to the panel, NumberField, PasswordField
and FileField to the input, Tabs, TabList, Tab and TabPanel, RadioGroup to the
fieldset, SegmentedControl, Avatar, Skeleton, Field and all input fields. Tooltip has
no element of its own; its child's ref keeps working as usual.

## The documentation site

`docs/` is a Vite app with hash routes (`#/components/button`), so the static build
works on GitHub Pages without extra configuration. There is no router or docs framework in it;
everything on the site is Papier itself.

- `docs/registry.tsx` is the map of the site: per page the category, title, summary,
  exports, keywords, related pages and a small live example for the explorer.
- `docs/Components.tsx`, `docs/Extended.tsx` and `docs/Additions.tsx` contain the examples
  (`<Example id="…">`); each example renders only on its own page.
- `docs/variants.tsx` adds variants, sizes and states per page.
- The API tables come from the types (`docs/props.json`, `node scripts/build-props.mjs`).

Documenting a new component: write an `<Example id="…">`, add a page to
`docs/registry.tsx` and run `npm run check`. `tests/docs.test.ts` fails if an example
has no page (or vice versa), if a page names an export that doesn't exist, if a
related link goes nowhere or if an exported component isn't listed anywhere. The
e2e test runs axe and the horizontal-scroll check on every page, in light and dark.

```bash
npm run dev        # docs at http://127.0.0.1:4330
```

## Tokens

`src/tokens/tokens.mjs` is the single source. The build produces:

- `tokens.css`: CSS variables (`--papier-*`), themes `light`, `dark` and `system`;
- `tokens.json`: all values for other tools;
- `tokens.dtcg.json`: the same values in the W3C design tokens format (DTCG), for
  Tokens Studio, Figma plugins and Style Dictionary. Theme colours refer to the palette
  (`{primitive.paper}`), so a design tool shows where each role comes from;
- `android/PapierTokens.kt`: the same colours, spacing, shape, type and motion for Jetpack Compose.

## Labels

Built-in text (Close, opens in a new tab, Notifications, ...) is Dutch by default
(`dutchLabels`) and can be changed per app; `englishLabels` is available too:

```tsx
import { Papier, englishLabels } from '@dionbm/papier';
<Papier labels={englishLabels}>…</Papier>
```

Text with a number or name, such as "Page 3 of 12", "4 results" and "Remove
sleeve.jpg", is a function. `locale` determines how NumberField, FileField, DatePicker, Calendar and
`useTableSort` format numbers and dates and sort text:

```tsx
<Papier labels={{ pageOf: (p, n) => `${p} / ${n}` }}>…</Papier>
```

## Principles

1. Native first: button, details, dialog, select and input stay real elements.
2. Depth and material only for things you operate; prose stays flat.
3. Components know roles, not colours. A theme is a new set of roles.
4. Every transition has a directly reachable end state; reduced motion sets all
   durations to 0 (`motion="reduced"` or the OS setting).

## Quality

```bash
npm run check      # props docs, typecheck, contrast, unit, axe and SSR tests, build and build check
npm run test:e2e   # Playwright: axe, high contrast, keyboard, visual regression
```

- `scripts/contrast.mjs` checks 26 colour pairs per theme against WCAG 2.2.
- Vitest: axe on every component in light and dark, behaviour tests for keyboard,
  focus and ARIA, and a server render test without `window`. CI also runs them on React 18.
- `scripts/build-props.mjs` extracts the docs' API tables from the TypeScript types;
  `npm run check` fails if `docs/props.json` is out of date.
- Playwright: axe on the docs in light, dark and high contrast, keyboard routes and
  screenshot comparison per component, also with `dir="rtl"`. CI runs Chromium, Firefox
  and WebKit.
- Locally with your own Chromium: `PAPIER_CHROMIUM=/path/to/chromium npm run test:e2e`.

By hand, before every minor release: the [screen reader test](docs/screen-reader-test.md) with
NVDA and VoiceOver. I haven't done it yet.

## Browser support

Papier supports the last two major versions of Chrome, Edge, Firefox and Safari. The floor
is Chrome and Edge 111, Firefox 121 and Safari 16.4, because Papier needs `@layer`, `:has()`
and `color-mix()`. Menu and Tooltip use the Popover API, with a fixed panel as a fallback.
Details: [papier.dionbm.nl/#/stability](https://papier.dionbm.nl/#/stability).

## Releasing

1. Update `CHANGELOG.md`.
2. `npm run release:patch` or `npm run release:minor` (runs the check and creates a version tag).
3. `git push --follow-tags`: the workflow publishes to npm via Trusted Publishing (no
   token needed) and creates a GitHub release with the changelog.

Every push to `main` redeploys the docs to [papier.dionbm.nl](https://papier.dionbm.nl)
(GitHub Pages, workflow `pages.yml`).

## Deviations from the portfolio

- `muted` is `#64635a` instead of `#6b6a61`, so that secondary text also reaches 4.5:1 on the
  sunken surface and soft sage.

## Licence

MIT. Manrope and DM Sans are under the SIL Open Font License and come via Fontsource.
