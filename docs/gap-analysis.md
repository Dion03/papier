# Papier vs. established libraries: gap analysis (October 2026)

Compared against shadcn/ui (Radix or Base UI), Radix Primitives, Mantine 8, Chakra UI 3
(Ark UI), HeroUI 3 (React Aria) and React Aria Components.

## Where Papier is already ahead

- **Accessibility discipline**: axe in light and dark per component, forced-colors CSS,
  26 contrast pairs checked at build time, `checkTheme()` for brand colours. Most
  libraries leave contrast to the user.
- **Native first**: real `<dialog>`, `<details>`, `<select>`, `<input type="range">`, Popover
  API top layer. Less JavaScript than Radix-based stacks, and it works in forms.
- **Server components by module**, `@layer papier` cascade, RTL, DTCG + Android tokens,
  API tables generated from the types.
- A distinct identity (paper, ink, vermilion, sage; underlined fields, tactile objects).

## Gaps, by impact

| # | Gap | Who has it | Impact | Status |
|---|---|---|---|---|
| 1 | **Popover** for interactive content (filters, pickers, forms) | all five | High: the most-used overlay after Dialog | built |
| 2 | **Menu**: separators, group labels, checkbox and radio items, link items, shortcuts, typeahead | Radix, shadcn, Mantine, Chakra, HeroUI | High: current Menu only does flat actions | built |
| 3 | **NumberField** with steppers, keys, min/max, locale formatting | Mantine, Chakra, HeroUI, React Aria | High for forms (amounts, quantities) | built |
| 4 | **Checkbox indeterminate** and **CheckboxGroup** with hint/error | all five | High: select-all in tables, multi-choice questions | built |
| 5 | **FileField** (drop zone, accept, size limits, list, remove) | Mantine, Chakra, HeroUI | High for real apps | built |
| 6 | **PasswordField** (reveal) and **auto-growing TextArea** | Mantine, HeroUI, Chakra | Medium, cheap | built |
| 7 | **Accordion** (exclusive or multiple Disclosures) | all five | Medium | built |
| 8 | **Tabs**: vertical orientation, manual activation | Radix, React Aria, Mantine | Medium (a11y completeness, settings pages) | built |
| 9 | **Sortable table headers** (`aria-sort`) | Mantine DataTable, HeroUI Table, React Aria | Medium | built |
| 10 | **Toast**: update, promise, custom icon | shadcn/Sonner, Chakra, Mantine | Medium DX | built |
| 11 | **ToggleGroup** (pressed buttons, toolbars, filters) | Radix, shadcn, HeroUI, Chakra | Medium | built |
| 12 | **Separator, Kbd, EmptyState** | all five | Low, cheap, server components | built |
| 13 | **MultiCombobox** (multi-select with tags) | Mantine, Chakra, HeroUI | Medium | built |
| 14 | **RangeSlider** (two thumbs), marks | Mantine, Radix, Chakra | Medium | built |
| 15 | **DatePicker** and **Calendar** (typed input in the locale's order, date grid) | all but Radix | High | built |
| 16 | Command palette, context menu, menubar, navigation menu | shadcn, Radix | Low for Papier's audience | not planned |
| 17 | Stepper, PinInput, Rating, Carousel | Mantine, Chakra | Low | not planned |
| 18 | **DateRangePicker** and **RangeCalendar** | Mantine, HeroUI, React Aria | Medium | built |
| 19 | Time input | Mantine, HeroUI, React Aria | Low: native `<TextField type="time">` already gives a localized, accessible picker | native |

## Beyond components

- **Theming**: already strong (roles, `themeStyle`, `checkTheme`, DTCG). No change needed.
- **Animations**: consistent tokens and reduced motion. New components reuse
  `pp-menu-in`, `dur-open/close` and `ease-arrive`.
- **DX**: every new component forwards refs, supports controlled and uncontrolled use via
  `useControllable`, has typed props in the generated API tables and Dutch/English labels.
- **Testing**: each addition gets axe cases (light and dark), behaviour tests for keyboard and
  ARIA, and server rendering coverage.
