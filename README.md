# Papier

Het design system van Dion: warm papier, inkt, vermiljoen en salie uit
[portfolio.dionbm.nl](https://portfolio.dionbm.nl) als toegankelijke React-componenten.

```bash
npm install @dionbm/papier
```

```tsx
import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier, Button } from '@dionbm/papier';

export function App() {
  return (
    <Papier theme="system">
      <Button>Opslaan</Button>
    </Papier>
  );
}
```

## Inhoud

- **Tokens**: één bron (`src/tokens/tokens.mjs`) wordt CSS-variabelen
  (`--papier-*`) en `tokens.json`. Thema's `light`, `dark` en `system`.
- **16 componenten**: Papier, Text, Button, IconButton, Link, Surface, Tag,
  Notice, Progress, TextField, TextArea, Checkbox, Switch, Slider,
  SegmentedControl, Tabs, Disclosure en Dialog.
- **Docs**: `npm run dev` start de documentatiesite op http://127.0.0.1:4330.

## Principes

1. Native eerst: button, details, dialog en input blijven echte elementen.
2. Diepte en materiaal alleen voor dingen die je bedient; prose blijft vlak.
3. Componenten kennen rollen, geen kleuren. Een thema is een nieuwe set rollen.
4. Elke overgang heeft een direct bereikbare eindtoestand; minder beweging
   zet alle duren op 0 (`motion="reduced"` of de OS-instelling).

## Kwaliteit

```bash
npm run check   # typecheck, contrast, tests en build
```

- `scripts/contrast.mjs` controleert 24 paren per thema volgens WCAG 2.2
  en laat de build falen onder de eis.
- `tests/a11y.test.tsx` draait axe op elk component in licht en donker.
- `tests/behaviour.test.tsx` test toetsenbord, focus en ARIA-status.
- In de browser is de docs-site axe-schoon in beide thema's.

## Afwijkingen van het portfolio

- `muted` is `#64635a` in plaats van `#6b6a61`, zodat toelichting ook op
  het verdiepte vlak en zachte salie 4,5:1 haalt.

## Licentie

MIT. Manrope en DM Sans vallen onder de SIL Open Font License en worden via
Fontsource geladen.
