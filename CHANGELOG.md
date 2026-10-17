# Changelog

## 0.5.0 (nog niet uitgebracht)

Nieuwe componenten en uitbreidingen na een vergelijking met shadcn/ui, Radix, Mantine, Chakra
en HeroUI (zie `docs/gap-analysis.md`), en een nieuwe documentatiesite. Samen 56 componenten.
Bestaande API's werken ongewijzigd, op twee punten na: zie Teksten en Tabs.

### Nieuwe componenten

- `Popover`, een niet-modaal paneel naast een knop voor filters, korte formulieren en
  uitleg. Focus gaat erin en terug, Escape en een klik of focus buiten sluiten, top layer.
- `NumberField` (spinbutton) met − en +, pijltjes, PageUp/PageDown, Home/End, min, max
  en step, en invoer en opmaak in de taal van de app via `Intl.NumberFormat` (bedrag,
  percentage, eenheid). Ingedrukt houden blijft stappen. Plus `parseNumber`.
- `DatePicker` en `Calendar`. Typen in de volgorde van de taal met elk scheidingsteken
  en tweecijferige jaren, of kiezen in een kalender in een popover (WAI-ARIA date grid:
  pijltjes, Home/End, PageUp/PageDown, met Shift per jaar). `min`, `max` en
  `isDateUnavailable`; de week begint op de eerste dag van de taal. Datums zijn
  `"YYYY-MM-DD"`, zoals `<input type="date">`. Plus `parseTypedDate` en `formatNumericDate`.
- `DateRangePicker` en `RangeCalendar` voor een periode: twee typbare velden en een
  kalender waarin de eerste dag het begin is en de tweede het eind, met een voorbeeld tijdens
  het kiezen. Een omgekeerde periode wordt omgedraaid.
- `MultiCombobox` voor meerdere keuzes met meezoeken: labels in het veld, een lijst die
  open blijft, Backspace haalt de laatste weg, `max`, en elke waarde in het formulier.
- `RangeSlider` met twee duimen op één spoor (twee native range-inputs), `minDistance`,
  `marks` en `onValueCommit`.
- `PasswordField` met een toonknop (aria-pressed).
- `FileField` met sleepvlak, `accept`, `maxSize`, `maxFiles`, een lijst met voorbeelden
  en verwijderknoppen, en meldingen voor geweigerde bestanden. De echte file-input blijft in
  sync voor gewone formulieren. Plus `acceptsFile` en `formatFileSize`.
- `CheckboxGroup` (fieldset, ook als tegels) en op `Checkbox` de props `indeterminate`
  en `error`.
- `Accordion` rond Disclosures; `type="single"` vouwt de open sectie geanimeerd dicht.
- `Toggle` en `ToggleGroup` voor knoppen die ingedrukt blijven, met één tabstop.
- `SortHeader` en `useTableSort` voor sorteerbare tabellen met `aria-sort`, natuurlijke
  volgorde (2 voor 10) en sorteren in de taal van de app.
- `Separator`, `Kbd` en `EmptyState`, alle drie server components.
- `Command` en `CommandDialog`, een opdrachtenlijst die meezoekt (combobox met een
  gegroepeerde listbox): rangschikking op label, woorden, trefwoorden en beschrijving,
  uitgeschakelde items, sneltoetshints en een eigen `filter`. Plus `scoreCommandItem`.
- `CopyButton` met bevestiging op dezelfde plek, een live region naast de knop en een
  terugval zonder Clipboard API.
- `Steps` voor een flow van een paar stappen: `aria-current="step"`, voltooide stappen
  als knoppen om terug te gaan, horizontaal of verticaal, compact op smalle schermen.
- `PinInput` voor codes: doorschuiven, Backspace terug, plakken en sms-autofill
  (`autocomplete="one-time-code"`), cijfers of letters, afgeschermd.

### Uitbreidingen

- Menu: kopjes (`type: 'label'`), scheidingslijnen, `checkbox`- en `radio`-items, links
  (`href`), sneltoetsen (`shortcut`), `keepOpen` en typeahead. `onSelect` is nu optioneel.
- Tabs: `orientation="vertical"` en `activation="manual"`. In rechts-naar-links gaan de
  pijltjes nu naar de visueel volgende tab.
- TextArea: `autoResize` en `maxRows`.
- Toast: `update()` en `promise()`, plus `icon` op toasts en op `Notice`. De live region
  meldt ook gewijzigde tekst.
- Negen nieuwe iconen: ChevronUp, ArrowUp, ArrowDown, Sort, Eye, EyeOff, Upload, File en Calendar.
- Hoogcontrastmodus voor alle nieuwe onderdelen.
- Teksten: nieuw `locale`, `increment`, `decrement`, `showPassword`, `chooseFiles`,
  `removeFile`, `fileTooLarge`, `fileTypeNotAllowed`, `tooManyFiles`, `remove`, `removed`,
  `selectedItems`, `rangeStart`, `rangeEnd`, `chooseDate`, `previousMonth`, `nextMonth`,
  `datePattern`, `invalidDate`, `dateUnavailable`, `copy`, `copied`, `copyFailed`, `steps`,
  `stepOf`, `stepComplete`, `stepError`, `pinChar` en `commandHints`. Let op: wie een eigen,
  volledige `PapierLabels` typt, moet die aanvullen; `labels` op `<Papier>` blijft partieel
  en werkt zonder wijziging.

### Fixes

- Checkbox: een klik op het vakje deed niets. Het raakvlak van 44 px lag als
  `::before` over de input en ving de klik op; alleen het label werkte. Het vakje is nu zelf
  een label en de input ligt boven het raakvlak, dus zowel het vakje als de rand eromheen
  vinken aan. Een e2e-test klikt nu echt op de vakjes.

### Documentatie en kwaliteit

- Een eigen pagina per component met breadcrumb, importregel, Voorbeeld/Code-tabs met
  kopieerknop, varianten en toestanden, toegankelijkheid, API-tabellen, gerelateerde
  componenten en vorige/volgende. Een zijbalk per categorie (ook als blad op mobiel), zoeken
  met Ctrl/⌘ K of `/` over componenten, exports, props, gidsen en instellingen, een
  homepage met een verkenner van live voorbeelden, en gidsen voor aan de slag en thema's met
  een merkkleur-speeltuin die `checkTheme` live toont. Oude ankers (`#knoppen`) blijven werken.
- Kwaliteit: `tests/docs.test.ts` houdt de site en de bibliotheek gelijk; de e2e-test draait
  axe en de scrollcheck op elke pagina, test navigatie, zoeken, het mobiele menu en de
  kopieerknop.

## 0.4.0 (2026-10-16)

- Nieuw: `Combobox`, een invoerveld met een lijst die meezoekt (WAI-ARIA combobox). Zoekt
  standaard in label en beschrijving, zonder accenten en hoofdletters; `filter={false}` met
  `inputValue` en `onInputChange` voor zoeken op een server, `loading` en `name` voor formulieren.
- Nieuw: `AlertDialog` voor bevestigingen (role="alertdialog"). De focus begint op Annuleren,
  een klik ernaast sluit niet, en een promise uit `onConfirm` laat de knop laden.
- Nieuw: `Breadcrumb` en `BreadcrumbItem`, met `asChild` voor routerlinks.
- Nieuw: `Pagination` met knoppen (`onPageChange`) of echte links (`getHref`, `linkAs`).
  Op smalle schermen blijven vorige, volgende en "Pagina 3 van 12".
- Teksten: nieuwe labels `cancel`, `breadcrumb`, `pagination`, `previous`, `next`,
  `showOptions` en `noResults`, en de functies `page`, `pageOf` en `results`.
- Contrastcheck: twee nieuwe paren (focus op verdiept vlak, tekst op de gevarenknop), samen 26.
- Hoogcontrastmodus: de actieve optie en de huidige pagina blijven zichtbaar.
- Dialog, AlertDialog en Sheet geven de focus na sluiten ook in Safari terug aan de knop
  die ze opende. Safari focust een knop niet bij een klik; Papier onthoudt daarom de laatst
  gebruikte knop. Nieuw: `returnFocusTo` om zelf te kiezen waar de focus heen gaat.
- Fix: `asChild` overschreef een prop van het kind met `undefined` (bijvoorbeeld `href` van
  een routerlink die `to` gebruikt). Papier zet nu alleen props die een waarde hebben.
- Server components: de build heeft nu één bestand per module, en alleen modules met hooks,
  context of events zijn `'use client'`. Text, VisuallyHidden, Stack, Container, Surface,
  Tag, Table, Skeleton, de iconen en de themafuncties blijven server components in Next.js.
  De paden in `exports` zijn gelijk gebleven; wie rechtstreeks `dist/papier.js` als één
  bundel kopieerde, krijgt nu een map met modules.
- Eigen thema: `themeStyle()` zet kleurrollen als CSS-variabelen, `checkTheme()` legt ze langs
  de 26 contrastparen van de build, plus `colorRoles` en `themeColors()`.
- Van rechts naar links: logische CSS in Select, Table, Toast, Dialog, Combobox, Menu en
  Switch, menu's die `align` spiegelen, gespiegelde pijlen in Link, Breadcrumb en Pagination,
  en de klasse `pp-flip-rtl` voor eigen iconen. Slider en Progress vullen van rechts.
- Fix: de markering van SegmentedControl en Tabs meet opnieuw als de opties breder worden,
  bijvoorbeeld wanneer een webfont later laadt.
- Tokens: `tokens.dtcg.json` in het W3C-formaat voor design tokens, voor Tokens Studio,
  Figma en Style Dictionary.
- Docs: een API-tabel per component, gemaakt uit de TypeScript-types. `npm run check` faalt
  als die achterloopt.
- Kwaliteit: CI draait de unit-, axe- en SSR-tests ook op React 18; een e2e-test met
  `dir="rtl"`; `scripts/check-build.mjs` controleert de build; een checklist voor de
  schermlezertest met NVDA en VoiceOver staat in `docs/schermlezertest.md`.

## 0.3.0 (2026-10-16)

- Router-links: `asChild` op Button, IconButton en Link rendert het kind (bv. de Link van
  Next.js of React Router) met de Papier-stijl. Klasse, ARIA, handlers en ref worden samengevoegd.
- Veldbouwstenen: `Field`, `FieldLabel`, `FieldHint`, `FieldError`, `useField` en
  `useFieldControl` voor eigen en externe inputs. TextField, TextArea en Select gebruiken ze
  zelf; Select heeft geen eigen kopie van de veldlogica meer.
- TextField: `prefix` en `suffix` voor een icoon of eenheid.
- Een eigen `aria-describedby` op TextField, TextArea en Select wordt nu toegevoegd aan
  fout en hint in plaats van ze te vervangen.
- Menu en Tooltip openen in de top layer (Popover API, met een vast paneel als terugval),
  dus `overflow: hidden` knipt ze niet meer af. Ze klappen om aan de rand van het scherm.
  Nieuw: `side` en `align: 'center'` op Menu, `placement: 'left' | 'right'` op Tooltip.
  Let op: `data-align` staat nu op het menupaneel (`.pp-menu__list`) in plaats van op
  `.pp-menu`. Eigen CSS met `.pp-menu[data-align="end"]` moet naar het paneel wijzen.
- Alle CSS, ook `tokens.css`, staat in `@layer papier`: CSS van je app wint zonder
  specificiteitsgevecht. Let op: een eigen reset zoals `button { color: inherit }` wint nu
  ook; zet die in een laag vóór Papier (zie README).
- Refs op Dialog, Sheet, Menu (triggerknop), Tabs, TabList, Tab, TabPanel, RadioGroup,
  SegmentedControl, Avatar en Skeleton.
- Nieuwe types: `TabListProps`, `TabProps`, `TabPanelProps`, `FieldProps` en verwante.
- Docs: sectie voor velden, een actiemenu per tabelrij, de hero-knop via `asChild` en
  uitleg voor gebruik in je eigen app.

## 0.2.1 (2026-10-16)

- README en pakketbeschrijving in de eerste persoon.

## 0.2.0 (2026-10-16)

- Nieuw: Select, RadioGroup, Tooltip, Menu, ToastProvider en useToast, Table, Skeleton, Sheet, Stack, Container, Avatar en Spinner. Samen 30 componenten.
- 15 extra iconen, zoals Search, Play, Pause, Menu, More, Copy en External.
- Werkt met Next.js: de build begint met `'use client'` en alles rendert op de server.
- Instelbare teksten via `<Papier labels>`, met `dutchLabels` en `englishLabels`.
- Ondersteuning voor de Windows-hoogcontrastmodus (`forced-colors`).
- Playwright-tests in Chromium, Firefox, WebKit en mobiel: axe in licht, donker en hoogcontrast, toetsenbordroutes en visuele regressie.
- CI op GitHub Actions en een releaseworkflow die op een versietag naar npm publiceert.
- Android: `dist/android/PapierTokens.kt` met kleuren, ruimte, vorm, type en beweging voor Jetpack Compose.
- Skeleton leest beter in het donkere thema; toelichtingskleur `muted` is `#64635a`.

## 0.1.0 (2026-10-16)

- Eerste versie: tokens met licht en donker thema, contrastcheck, 18 componenten,
  axe- en gedragstests en een documentatiesite.
