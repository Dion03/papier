# Papier

Mijn design system: warm papier, inkt, vermiljoen en salie uit
[portfolio.dionbm.nl](https://portfolio.dionbm.nl) als toegankelijke React-componenten,
met tokens voor web en Android.

Documentatie en voorbeelden: [papier.dionbm.nl](https://papier.dionbm.nl).

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
        <Button>Opslaan</Button>
      </ToastProvider>
    </Papier>
  );
}
```

Werkt in Vite en in Next.js (App Router), met React 18 of 19. Alles rendert op de server.

## Componenten (34)

| Groep | Componenten |
|---|---|
| Basis | Papier, Text, VisuallyHidden, Stack, Container |
| Acties | Button, IconButton, Link, Menu |
| Formulieren | TextField, TextArea, Select, Combobox, Checkbox, RadioGroup, Switch, Slider, SegmentedControl |
| Veldbouwstenen | Field, FieldLabel, FieldHint, FieldError, useField, useFieldControl |
| Navigatie | Breadcrumb (BreadcrumbItem), Pagination |
| Structuur | Tabs (TabList, Tab, TabPanel), Disclosure, Table |
| Overlays | Dialog, AlertDialog, Sheet, Tooltip |
| Feedback | Notice, ToastProvider en useToast, Progress, Spinner, Skeleton |
| Materiaal | Surface, Tag, Avatar |

Plus 21 lijniconen onder `icons`.

## In je eigen app

### Router-links: `asChild`

Button, IconButton en Link renderen met `asChild` hun enige kind in plaats van een eigen
element. Zo krijgt de Link van Next.js of React Router de Papier-vorm, en blijft het een
echte link:

```tsx
import NextLink from 'next/link';

<Button asChild variant="ink" iconEnd={<icons.ArrowRight />}>
  <NextLink href="/werk">Bekijk het werk</NextLink>
</Button>
<Link asChild variant="arrow"><NextLink href="/over">Over mij</NextLink></Link>
<IconButton asChild label="Home" icon={<icons.ArrowLeft />}><NextLink href="/" /></IconButton>
```

Papier zet klasse, data-attributen, ARIA en `ref` op het kind; `className`, `style` en
handlers van het kind blijven behouden. De tekst van het kind wordt het label. Een
`loading` of `disabled` Button met `asChild` krijgt `aria-disabled` en blokkeert de klik,
ook de navigatie van de routerlink.

### Velden: `Field`, `useField` en prefix/suffix

TextField, TextArea en Select zijn gebouwd op `Field`. Gebruik dezelfde bouwsteen voor een
eigen of externe input, dan krijgt die dezelfde opmaak en koppelingen (label, fout en hint
via `aria-describedby`, `aria-invalid`):

```tsx
<Field label="Toerental" hint="33, 45 of 78" error={error}>
  {(control) => <MijnInput {...control} />}
</Field>
```

Kinderen kunnen de props ook zelf ophalen met `useFieldControl()`. Wil je de opbouw helemaal
zelf bepalen, gebruik dan `useField` met `FieldLabel`, `FieldHint` en `FieldError`:

```tsx
const f = useField({ hint, error });
<FieldLabel {...f.labelProps}>Artiest</FieldLabel>
<MijnCombobox {...f.controlProps} aria-labelledby={f.ids.label} />
<FieldError {...f.errorProps}>{error}</FieldError>
<FieldHint {...f.hintProps}>{hint}</FieldHint>
```

TextField heeft `prefix` en `suffix` voor een icoon of eenheid:

```tsx
<TextField label="Prijs in euro" prefix="€" />
<TextField label="Zoeken" hideLabel prefix={<icons.Search />} />
```

Prefix en suffix zijn decoratief (`aria-hidden`), net als bij GOV.UK. Zet de eenheid daarom
ook in het label of de hint.

### Overlays in de top layer

Menu en Tooltip openen met de Popover API in de top layer. Ze vallen niet weg in een
Table, Surface of andere container met `overflow: hidden`, en ze klappen om aan de rand van
het scherm. De plaatsing kies je met `side` en `align` (Menu) of `placement` (Tooltip):
`top`, `bottom`, `left` of `right`. Browsers zonder Popover API krijgen een vast paneel met
een `z-index`. Het paneel blijft in de DOM bij zijn knop, dus de tabvolgorde en de
`.papier`-variabelen blijven kloppen.

### Cascade: `@layer papier`

Alle CSS van Papier, ook de tokens, staat in `@layer papier`. Stijlen buiten een laag
winnen daardoor altijd, ongeacht specificiteit:

```css
.pp-button { border-radius: 8px; }           /* wint van Papier */
:root { --papier-color-accent: #d6452a; }     /* overschrijft een token */
```

- Een eigen reset (`button { color: inherit }`) wint nu ook. Zet die in een laag vóór
  Papier: `@layer reset, papier;` bovenaan je CSS.
- Tailwind 4 gebruikt zelf lagen. Zet bovenaan je CSS
  `@layer theme, base, papier, components, utilities;`, dan winnen utilities van Papier en
  Papier van de Tailwind-basis.
- Tailwind 3 schrijft alles zonder laag, ook de preflight-reset. Utilities winnen dus
  vanzelf, maar de reset (`button { background-color: transparent }`) wint ook van Papier.
  Laad de preflight in een laag (`@import 'tailwindcss/base' layer(reset);` met
  postcss-import) of zet `corePlugins.preflight` uit.

### Next.js en server components

De build heeft één bestand per module. Alleen modules met hooks, context of events
beginnen met `'use client'`; Text, VisuallyHidden, Stack, Container, Surface, Tag, Table,
Skeleton, de iconen en de themafuncties blijven server components en voegen geen
JavaScript aan je pagina toe. Welke modules dat zijn staat in
`scripts/server-modules.mjs`; een test controleert dat ze geen client-code bevatten, en
`scripts/check-build.mjs` dat de build het goed doet.

### Eigen thema

Componenten gebruiken alleen kleurrollen (`--papier-color-*`). Een merk is dus een
andere waarde voor een paar rollen:

```tsx
import { Papier, themeStyle, checkTheme } from '@dionbm/papier';

const merk = { action: '#1f4e8c', 'action-hover': '#183d6e', 'on-action': '#ffffff' };

<Papier theme="light" style={themeStyle(merk)}>…</Papier>
```

`checkTheme(merk, 'light')` legt de kleuren langs dezelfde 26 contrastparen als de build
en geeft per paar de verhouding terug. Zet het in een test, dan kan geen merkkleur tekst
onleesbaar maken:

```ts
expect(checkTheme(merk).filter((r) => !r.ok)).toEqual([]);
```

Alle rollen staan in `colorRoles`, de ingebouwde waarden in `themeColors('light')` en
`themeColors('dark')`. Voor licht én donker zet je de variabelen in je eigen CSS:

```css
[data-papier-theme="light"] { --papier-color-action: #1f4e8c; }
[data-papier-theme="dark"] { --papier-color-action: #9cc0ff; }
```

### Van rechts naar links

Zet `dir="rtl"` op `<html>` (of op `<Papier>`). Papier gebruikt logische CSS
(`inset-inline-start`, `text-align: start`), dus uitlijning, tabellen, toasts en velden
draaien mee. Menu's lijnen `align="start"` uit op de rechterkant van de knop, en pijlen
in Link, Breadcrumb en Pagination spiegelen. Geef je eigen richtingsiconen
`className="pp-flip-rtl"`, bijvoorbeeld in `iconEnd` van een Button. Zet de richting
vóór het renderen: wie `dir` later wisselt, moet de pagina opnieuw renderen.

### Refs

Elk component met een eigen element geeft `ref` door: Dialog en Sheet naar het
`<dialog>`, Menu naar de triggerknop, Tabs, TabList, Tab en TabPanel, RadioGroup naar de
fieldset, SegmentedControl, Avatar, Skeleton, Field en alle invoervelden. Tooltip heeft
geen eigen element; de ref van zijn kind blijft gewoon werken.

## Tokens

`src/tokens/tokens.mjs` is de enige bron. De build maakt:

- `tokens.css`: CSS-variabelen (`--papier-*`), thema's `light`, `dark` en `system`;
- `tokens.json`: alle waarden voor andere tools;
- `tokens.dtcg.json`: dezelfde waarden in het W3C-formaat voor design tokens (DTCG), voor
  Tokens Studio, Figma-plugins en Style Dictionary. Themakleuren verwijzen naar het palet
  (`{primitive.paper}`), zodat een ontwerptool laat zien waar elke rol vandaan komt;
- `android/PapierTokens.kt`: dezelfde kleuren, ruimte, vorm, type en beweging voor Jetpack Compose.

## Teksten

Ingebouwde teksten (Sluiten, opent in een nieuw tabblad, Meldingen, ...) zijn standaard
Nederlands en per app aan te passen:

```tsx
import { Papier, englishLabels } from '@dionbm/papier';
<Papier labels={englishLabels}>…</Papier>
```

Teksten met een getal, zoals "Pagina 3 van 12" en "4 resultaten", zijn functies:

```tsx
<Papier labels={{ pageOf: (p, n) => `${p} / ${n}` }}>…</Papier>
```

## Principes

1. Native eerst: button, details, dialog, select en input blijven echte elementen.
2. Diepte en materiaal alleen voor dingen die je bedient; prose blijft vlak.
3. Componenten kennen rollen, geen kleuren. Een thema is een nieuwe set rollen.
4. Elke overgang heeft een direct bereikbare eindtoestand; minder beweging zet alle
   duren op 0 (`motion="reduced"` of de OS-instelling).

## Kwaliteit

```bash
npm run check      # props-docs, typecheck, contrast, unit-, axe- en SSR-tests, build en buildcheck
npm run test:e2e   # Playwright: axe, hoogcontrast, toetsenbord, visuele regressie
```

- `scripts/contrast.mjs` controleert 26 kleurparen per thema volgens WCAG 2.2.
- Vitest: axe op elk component in licht en donker, gedragstests voor toetsenbord,
  focus en ARIA, en een server-rendertest zonder `window`. CI draait ze ook op React 18.
- `scripts/build-props.mjs` haalt de API-tabellen van de docs uit de TypeScript-types;
  `npm run check` faalt als `docs/props.json` achterloopt.
- Playwright: axe op de docs in licht, donker en hoogcontrast, toetsenbordroutes en
  screenshotvergelijking per component, ook met `dir="rtl"`. CI draait Chromium, Firefox
  en WebKit.
- Lokaal met een eigen Chromium: `PAPIER_CHROMIUM=/pad/naar/chromium npm run test:e2e`.

Met de hand, voor elke minor-release: de [schermlezertest](docs/schermlezertest.md) met
NVDA en VoiceOver. Die heb ik nog niet gedaan.

## Releasen

1. Werk `CHANGELOG.md` bij.
2. `npm run release:patch` of `npm run release:minor` (draait de check en maakt een versietag).
3. `git push --follow-tags`: de workflow publiceert naar npm via Trusted Publishing (geen
   token nodig) en maakt een GitHub-release met de changelog.

Elke push naar `main` zet de docs opnieuw op [papier.dionbm.nl](https://papier.dionbm.nl)
(GitHub Pages, workflow `pages.yml`).

## Afwijkingen van het portfolio

- `muted` is `#64635a` in plaats van `#6b6a61`, zodat toelichting ook op het verdiepte
  vlak en zachte salie 4,5:1 haalt.

## Licentie

MIT. Manrope en DM Sans vallen onder de SIL Open Font License en komen via Fontsource.
