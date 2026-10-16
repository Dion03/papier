# Changelog

## 0.4.0 (nog niet uitgebracht)

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
- Fix: `asChild` overschreef een prop van het kind met `undefined` (bijvoorbeeld `href` van
  een routerlink die `to` gebruikt). Papier zet nu alleen props die een waarde hebben.

## 0.3.0 (nog niet uitgebracht)

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
