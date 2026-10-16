# Papier

Het design system van Dion: warm papier, inkt, vermiljoen en salie uit
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

Werkt in Vite en in Next.js (App Router): de build is een client-module en alles
rendert op de server.

## Componenten (30)

| Groep | Componenten |
|---|---|
| Basis | Papier, Text, VisuallyHidden, Stack, Container |
| Acties | Button, IconButton, Link, Menu |
| Formulieren | TextField, TextArea, Select, Checkbox, RadioGroup, Switch, Slider, SegmentedControl |
| Structuur | Tabs (TabList, Tab, TabPanel), Disclosure, Table |
| Overlays | Dialog, Sheet, Tooltip |
| Feedback | Notice, ToastProvider en useToast, Progress, Spinner, Skeleton |
| Materiaal | Surface, Tag, Avatar |

Plus 21 lijniconen onder `icons`.

## Tokens

`src/tokens/tokens.mjs` is de enige bron. De build maakt:

- `tokens.css`: CSS-variabelen (`--papier-*`), thema's `light`, `dark` en `system`;
- `tokens.json`: alle waarden voor andere tools;
- `android/PapierTokens.kt`: dezelfde kleuren, ruimte, vorm, type en beweging voor Jetpack Compose.

## Teksten

Ingebouwde teksten (Sluiten, opent in een nieuw tabblad, Meldingen, ...) zijn standaard
Nederlands en per app aan te passen:

```tsx
import { Papier, englishLabels } from '@dionbm/papier';
<Papier labels={englishLabels}>…</Papier>
```

## Principes

1. Native eerst: button, details, dialog, select en input blijven echte elementen.
2. Diepte en materiaal alleen voor dingen die je bedient; prose blijft vlak.
3. Componenten kennen rollen, geen kleuren. Een thema is een nieuwe set rollen.
4. Elke overgang heeft een direct bereikbare eindtoestand; minder beweging zet alle
   duren op 0 (`motion="reduced"` of de OS-instelling).

## Kwaliteit

```bash
npm run check      # typecheck, contrast, unit-, axe- en SSR-tests, build
npm run test:e2e   # Playwright: axe, hoogcontrast, toetsenbord, visuele regressie
```

- `scripts/contrast.mjs` controleert 24 kleurparen per thema volgens WCAG 2.2.
- Vitest: axe op elk component in licht en donker, gedragstests voor toetsenbord,
  focus en ARIA, en een server-rendertest zonder `window`.
- Playwright: axe op de docs in licht, donker en hoogcontrast, toetsenbordroutes en
  screenshotvergelijking per component. CI draait Chromium, Firefox en WebKit.
- Lokaal met een eigen Chromium: `PAPIER_CHROMIUM=/pad/naar/chromium npm run test:e2e`.

Nog niet gedaan: een handmatige test met VoiceOver en NVDA.

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
