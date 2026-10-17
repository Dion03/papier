import { useEffect, useState } from 'react';

// Hash routes ("#/components/button/api"), so the static build works on GitHub Pages
// without a 404 fallback and without a router dependency. The third segment is a section
// on the page, which keeps deep links to "API" or "Accessibility" shareable.

export interface Route { path: string[]; section?: string }

/** Old one-page anchors (#knoppen) still work: they open the component's page. */
let legacy: Record<string, string> = {};
export function setLegacyAnchors(map: Record<string, string>) { legacy = map; }

/** Routes and section ids from the Dutch site before 0.6, so shared links keep working. */
const dutchSegments: Record<string, string> = {
  componenten: 'components', categorie: 'category', start: 'getting-started', gebruik: 'getting-started',
  thema: 'theming', fundament: 'foundations', principes: 'foundations',
  acties: 'actions', invoer: 'inputs', keuzes: 'choices', zoeken: 'search', datums: 'dates',
  navigatie: 'navigation', gegevens: 'data', basis: 'basics',
  voorbeeld: 'example', varianten: 'variants', toegankelijkheid: 'accessibility', gerelateerd: 'related',
  installatie: 'installation', 'eerste-scherm': 'first-screen', talen: 'languages', kwaliteit: 'quality',
  'licht-donker': 'light-dark', 'eigen-thema': 'custom-theme', speeltuin: 'playground', beweging: 'motion',
  kleur: 'color', typografie: 'typography', ruimte: 'space',
};
const english = (s: string) => dutchSegments[s] ?? s;

/** A mangled link (a cut-off "%E0") must not take the whole site down. */
function safeDecode(s: string) {
  try { return decodeURIComponent(s); } catch { return s; }
}

export function parseHash(hash: string): Route {
  const raw = safeDecode(hash.replace(/^#/, ''));
  if (!raw.startsWith('/')) {
    if (legacy[raw]) return { path: ['components', legacy[raw]] };
    if (dutchSegments[raw] === 'getting-started' || dutchSegments[raw] === 'foundations') return { path: [dutchSegments[raw]] };
    return { path: [] };
  }
  // Component slugs were English already, so mapping every segment is safe.
  const parts = raw.split('/').filter(Boolean).map(english);
  if (parts[0] === 'components' && parts.length >= 3) return { path: parts.slice(0, 2), section: parts[2] };
  if (parts[0] !== 'components' && parts.length >= 2) return { path: parts.slice(0, 1), section: parts[1] };
  return { path: parts };
}

export const href = (...parts: Array<string | undefined>) => `#/${parts.filter(Boolean).join('/')}`;

export function navigate(to: string) {
  if (window.location.hash === to) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else window.location.hash = to;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => {
      const next = parseHash(window.location.hash);
      // Rewrite old anchors and Dutch routes, so the address bar shows where you are.
      const canonical = href(...next.path, next.section);
      if (window.location.hash && next.path.length && safeDecode(window.location.hash) !== canonical) {
        history.replaceState(null, '', canonical);
      }
      setRoute(next);
    };
    on();
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
