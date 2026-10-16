# AGENTS.md

## Source of Truth

- `src/tokens/tokens.mjs` is de enige bron voor waarden; `src/styles/tokens.css` wordt gegenereerd (`node scripts/build-tokens.mjs`).
- De visuele autoriteit is `dion-portfolio/DESIGN.md`. Wijk alleen af voor toegankelijkheid en documenteer dat in README.
- Knowledge base: `papier.md` in `project-knowledge-base`.

## Werkregels

- `npm run check` moet slagen voor een commit.
- Nieuwe kleurparen die tekst dragen horen in `src/tokens/pairs.mjs`.
- Geen `npm publish`, push of deploy zonder expliciete toestemming van Dion.
