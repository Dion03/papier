import { useEffect, useState } from 'react';

// Hash routes ("#/componenten/button/api"), so the static build works on GitHub Pages
// without a 404 fallback and without a router dependency. The third segment is a section
// on the page, which keeps deep links to "API" or "Toegankelijkheid" shareable.

export interface Route { path: string[]; section?: string }

/** Old one-page anchors (#knoppen) still work: they open the component's page. */
let legacy: Record<string, string> = {};
export function setLegacyAnchors(map: Record<string, string>) { legacy = map; }

/** A mangled link (a cut-off "%E0") must not take the whole site down. */
function safeDecode(s: string) {
  try { return decodeURIComponent(s); } catch { return s; }
}

export function parseHash(hash: string): Route {
  const raw = safeDecode(hash.replace(/^#/, ''));
  if (!raw.startsWith('/')) {
    if (legacy[raw]) return { path: ['componenten', legacy[raw]] };
    if (raw === 'gebruik') return { path: ['start'] };
    if (raw === 'fundament' || raw === 'principes') return { path: ['fundament'] };
    return { path: [] };
  }
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'componenten' && parts.length >= 3) return { path: parts.slice(0, 2), section: parts[2] };
  if (parts[0] !== 'componenten' && parts.length >= 2) return { path: parts.slice(0, 1), section: parts[1] };
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
      // Rewrite old anchors to their route, so the address bar shows where you are.
      if (window.location.hash && !window.location.hash.startsWith('#/') && next.path.length) {
        history.replaceState(null, '', href(...next.path, next.section));
      }
      setRoute(next);
    };
    on();
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
