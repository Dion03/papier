# Changelog

## Unreleased

### Fixed

- `NumberField` and `parseNumber` in a comma locale read `0.125` as 0.125 and `1234.567` as
  1234.567. A dot with three digits after it was always taken as a thousands separator, so a
  Dutch user typing `0.125` got 125.
- Controlled `Tabs` no longer needs a `defaultValue` next to `value` to type-check.
- `asChild` works when the parent is a server component. Next.js hands a server component's
  child to Button, IconButton, Link and BreadcrumbItem as a lazy node, which threw "expected
  a single React element child"; a wrapper `'use client'` component was the only way round it.
  Tooltip and Popover had the same problem: from a server component, Tooltip showed no tip and
  Popover rendered nothing.
- In `RadioGroup appearance="card"`, the label stretched over the card covered the radio
  itself, so a click on the circle (or Playwright's `check()`) hit the label. The radio now
  sits on top, as the checkbox already did.

## 0.6.0 (2026-10-17)

The project is now in English: the documentation site, README, changelog and examples. The
library's built-in labels stay Dutch by default; `englishLabels` is unchanged and the docs
site uses it with `locale: 'en-GB'`. Switching the default is a decision for 1.0.

### Changed

- `Combobox` and `MultiCombobox` call `onValueChange`, the name every other Papier input
  uses. `onChange` still works and is marked `@deprecated`; it goes away in 1.0.
- `IconButton` has a `size="sm"` (36 px), next to `md` and `lg`.
- The contrast pairs from `checkTheme` describe their use in English ("Body text",
  "Primary button") instead of Dutch.

### Documentation

- English routes: `#/components/button`, `#/category/dates`, `#/getting-started`,
  `#/theming`, `#/foundations`. Dutch links from 0.5 (`#/componenten/…`, `#/categorie/…`,
  `#/start`, `#/thema`, `#/fundament` and their section anchors) redirect to the new route.
- A new Stability page: what the public API is, how versions and deprecations work, and
  which browsers are supported.
- The screen reader checklist is now `docs/screen-reader-test.md`, in English, and covers
  the docs site and every component added in 0.5.

## 0.5.0 (2026-10-17)

New components and extensions after a comparison with shadcn/ui, Radix, Mantine, Chakra
and HeroUI (see `docs/gap-analysis.md`), and a new documentation site. 56 components in total.
Existing APIs work unchanged, with two exceptions: see Labels and Tabs.

### New components

- `Popover`, a non-modal panel next to a button for filters, short forms and
  explanations. Focus moves in and back, Escape and a click or focus outside close it, top layer.
- `NumberField` (spinbutton) with − and +, arrow keys, PageUp/PageDown, Home/End, min, max
  and step, and input and formatting in the app's language via `Intl.NumberFormat` (currency,
  percentage, unit). Holding a button keeps stepping. Plus `parseNumber`.
- `DatePicker` and `Calendar`. Type in the language's order with any separator
  and two-digit years, or pick in a calendar in a popover (WAI-ARIA date grid:
  arrow keys, Home/End, PageUp/PageDown, with Shift per year). `min`, `max` and
  `isDateUnavailable`; the week starts on the language's first day. Dates are
  `"YYYY-MM-DD"`, like `<input type="date">`. Plus `parseTypedDate` and `formatNumericDate`.
- `DateRangePicker` and `RangeCalendar` for a period: two typeable fields and a
  calendar in which the first day is the start and the second the end, with a preview while
  picking. A reversed period is swapped.
- `MultiCombobox` for multiple choices with search-as-you-type: tags in the field, a list that
  stays open, Backspace removes the last one, `max`, and every value in the form.
- `RangeSlider` with two thumbs on one track (two native range inputs), `minDistance`,
  `marks` and `onValueCommit`.
- `PasswordField` with a show button (aria-pressed).
- `FileField` with a drop zone, `accept`, `maxSize`, `maxFiles`, a list with previews
  and remove buttons, and messages for rejected files. The real file input stays in
  sync for plain forms. Plus `acceptsFile` and `formatFileSize`.
- `CheckboxGroup` (fieldset, also as tiles) and the props `indeterminate` and `error`
  on `Checkbox`.
- `Accordion` around Disclosures; `type="single"` collapses the open section with an animation.
- `Toggle` and `ToggleGroup` for buttons that stay pressed, with a single tab stop.
- `SortHeader` and `useTableSort` for sortable tables with `aria-sort`, natural
  order (2 before 10) and sorting in the app's language.
- `Separator`, `Kbd` and `EmptyState`, all three server components.
- `Command` and `CommandDialog`, a command list that filters as you type (combobox with a
  grouped listbox): ranking on label, words, keywords and description,
  disabled items, shortcut hints and a custom `filter`. Plus `scoreCommandItem`.
- `CopyButton` with confirmation in the same place, a live region next to the button and a
  fallback without the Clipboard API.
- `Steps` for a flow of a few steps: `aria-current="step"`, completed steps
  as buttons to go back, horizontal or vertical, compact on narrow screens.
- `PinInput` for codes: auto-advance, Backspace goes back, paste and SMS autofill
  (`autocomplete="one-time-code"`), digits or letters, masked.

### Extensions

- Menu: headings (`type: 'label'`), separators, `checkbox` and `radio` items, links
  (`href`), shortcuts (`shortcut`), `keepOpen` and typeahead. `onSelect` is now optional.
- Tabs: `orientation="vertical"` and `activation="manual"`. In right-to-left, the
  arrow keys now go to the visually next tab.
- TextArea: `autoResize` and `maxRows`.
- Toast: `update()` and `promise()`, plus `icon` on toasts and on `Notice`. The live region
  also announces changed text.
- Nine new icons: ChevronUp, ArrowUp, ArrowDown, Sort, Eye, EyeOff, Upload, File and Calendar.
- High contrast mode for all new parts.
- Labels: new `locale`, `increment`, `decrement`, `showPassword`, `chooseFiles`,
  `removeFile`, `fileTooLarge`, `fileTypeNotAllowed`, `tooManyFiles`, `remove`, `removed`,
  `selectedItems`, `rangeStart`, `rangeEnd`, `chooseDate`, `previousMonth`, `nextMonth`,
  `datePattern`, `invalidDate`, `dateUnavailable`, `copy`, `copied`, `copyFailed`, `steps`,
  `stepOf`, `stepComplete`, `stepError`, `pinChar` and `commandHints`. Note: if you type your
  own, complete `PapierLabels`, you need to add these; `labels` on `<Papier>` stays partial
  and works without changes.

### Fixes

- Checkbox: a click on the box did nothing. The 44 px hit area sat over the input as a
  `::before` and caught the click; only the label worked. The box is now a label itself
  and the input sits above the hit area, so both the box and the edge around it
  check it. An e2e test now actually clicks the boxes.

### Documentation and quality

- A page per component with breadcrumb, import line, Example/Code tabs with a
  copy button, variants and states, accessibility, API tables, related
  components and previous/next. A sidebar per category (also as a sheet on mobile), search
  with Ctrl/⌘ K or `/` across components, exports, props, guides and settings, a
  homepage with an explorer of live examples, and guides for getting started and theming with
  a brand colour playground that shows `checkTheme` live. Old anchors (`#knoppen`) keep working.
- Quality: `tests/docs.test.ts` keeps the site and the library in sync; the e2e test runs
  axe and the scroll check on every page, and tests navigation, search, the mobile menu and the
  copy button.

## 0.4.0 (2026-10-16)

- New: `Combobox`, an input with a list that filters as you type (WAI-ARIA combobox). Searches
  label and description by default, ignoring accents and case; `filter={false}` with
  `inputValue` and `onInputChange` for server-side search, `loading` and `name` for forms.
- New: `AlertDialog` for confirmations (role="alertdialog"). Focus starts on Cancel,
  a click outside doesn't close it, and a promise from `onConfirm` puts the button in a loading state.
- New: `Breadcrumb` and `BreadcrumbItem`, with `asChild` for router links.
- New: `Pagination` with buttons (`onPageChange`) or real links (`getHref`, `linkAs`).
  On narrow screens, previous, next and "Page 3 of 12" remain.
- Labels: new labels `cancel`, `breadcrumb`, `pagination`, `previous`, `next`,
  `showOptions` and `noResults`, and the functions `page`, `pageOf` and `results`.
- Contrast check: two new pairs (focus on the sunken surface, text on the danger button), 26 in total.
- High contrast mode: the active option and the current page stay visible.
- Dialog, AlertDialog and Sheet now also return focus to the button that opened them in
  Safari. Safari doesn't focus a button on click, so Papier remembers the last
  used button. New: `returnFocusTo` to choose where focus goes yourself.
- Fix: `asChild` overwrote a child's prop with `undefined` (for example `href` on
  a router link that uses `to`). Papier now only sets props that have a value.
- Server components: the build now has one file per module, and only modules with hooks,
  context or events are `'use client'`. Text, VisuallyHidden, Stack, Container, Surface,
  Tag, Table, Skeleton, the icons and the theme functions stay server components in Next.js.
  The paths in `exports` are unchanged; if you copied `dist/papier.js` directly as a single
  bundle, you now get a folder of modules.
- Custom theme: `themeStyle()` sets colour roles as CSS variables, `checkTheme()` checks them against
  the build's 26 contrast pairs, plus `colorRoles` and `themeColors()`.
- Right to left: logical CSS in Select, Table, Toast, Dialog, Combobox, Menu and
  Switch, menus that mirror `align`, mirrored arrows in Link, Breadcrumb and Pagination,
  and the class `pp-flip-rtl` for your own icons. Slider and Progress fill from the right.
- Fix: the indicator of SegmentedControl and Tabs measures again when the options get wider,
  for example when a web font loads later.
- Tokens: `tokens.dtcg.json` in the W3C design tokens format, for Tokens Studio,
  Figma and Style Dictionary.
- Docs: an API table per component, generated from the TypeScript types. `npm run check` fails
  if it is out of date.
- Quality: CI also runs the unit, axe and SSR tests on React 18; an e2e test with
  `dir="rtl"`; `scripts/check-build.mjs` checks the build; a checklist for the
  screen reader test with NVDA and VoiceOver is in `docs/screen-reader-test.md`.

## 0.3.0 (2026-10-16)

- Router links: `asChild` on Button, IconButton and Link renders the child (e.g. the Link from
  Next.js or React Router) with the Papier style. Class, ARIA, handlers and ref are merged.
- Field building blocks: `Field`, `FieldLabel`, `FieldHint`, `FieldError`, `useField` and
  `useFieldControl` for your own and third-party inputs. TextField, TextArea and Select use them
  themselves; Select no longer has its own copy of the field logic.
- TextField: `prefix` and `suffix` for an icon or unit.
- A custom `aria-describedby` on TextField, TextArea and Select is now added to
  the error and hint instead of replacing them.
- Menu and Tooltip open in the top layer (Popover API, with a fixed panel as a fallback),
  so `overflow: hidden` no longer clips them. They flip at the edge of the screen.
  New: `side` and `align: 'center'` on Menu, `placement: 'left' | 'right'` on Tooltip.
  Note: `data-align` is now on the menu panel (`.pp-menu__list`) instead of on
  `.pp-menu`. Custom CSS with `.pp-menu[data-align="end"]` must target the panel.
- All CSS, including `tokens.css`, is in `@layer papier`: your app's CSS wins without a
  specificity fight. Note: a custom reset such as `button { color: inherit }` now wins
  too; put it in a layer before Papier (see README).
- Refs on Dialog, Sheet, Menu (trigger button), Tabs, TabList, Tab, TabPanel, RadioGroup,
  SegmentedControl, Avatar and Skeleton.
- New types: `TabListProps`, `TabProps`, `TabPanelProps`, `FieldProps` and related.
- Docs: a section for fields, an action menu per table row, the hero button via `asChild` and
  guidance for use in your own app.

## 0.2.1 (2026-10-16)

- README and package description in the first person.

## 0.2.0 (2026-10-16)

- New: Select, RadioGroup, Tooltip, Menu, ToastProvider and useToast, Table, Skeleton, Sheet, Stack, Container, Avatar and Spinner. 30 components in total.
- 15 extra icons, such as Search, Play, Pause, Menu, More, Copy and External.
- Works with Next.js: the build starts with `'use client'` and everything renders on the server.
- Configurable text via `<Papier labels>`, with `dutchLabels` and `englishLabels`.
- Support for Windows high contrast mode (`forced-colors`).
- Playwright tests in Chromium, Firefox, WebKit and mobile: axe in light, dark and high contrast, keyboard routes and visual regression.
- CI on GitHub Actions and a release workflow that publishes to npm on a version tag.
- Android: `dist/android/PapierTokens.kt` with colours, spacing, shape, type and motion for Jetpack Compose.
- Skeleton reads better in the dark theme; secondary text colour `muted` is `#64635a`.

## 0.1.0 (2026-10-16)

- First version: tokens with light and dark themes, contrast check, 18 components,
  axe and behaviour tests and a documentation site.
