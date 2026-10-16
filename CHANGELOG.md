# Changelog

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
