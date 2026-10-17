// The docs site maps every Example to a page in docs/registry.tsx. These checks fail when a
// new component gets an Example but no page (or the other way round), when a page names an
// export that does not exist, or when a related link points nowhere.
import { readFileSync } from 'node:fs';
import * as papier from '../src';
import { categories, guides, pages, pageBySlug } from '../docs/registry';
import { href, parseHash } from '../docs/router';

const exampleIds = ['docs/Components.tsx', 'docs/Extended.tsx', 'docs/Additions.tsx']
  .flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<Example id="([^"]+)"/g)].map((m) => m[1]));

describe('docs registry', () => {
  it('elke Example heeft precies één pagina, en elke pagina een Example', () => {
    expect(new Set(exampleIds).size).toBe(exampleIds.length);
    expect(pages.map((p) => p.example).sort()).toEqual([...exampleIds].sort());
  });

  it('slugs zijn uniek en categorieën bestaan', () => {
    expect(new Set(pages.map((p) => p.slug)).size).toBe(pages.length);
    const ids = new Set(categories.map((c) => c.id));
    for (const p of pages) expect(ids.has(p.category), `${p.slug}: ${p.category}`).toBe(true);
    for (const c of categories) expect(pages.some((p) => p.category === c.id), `lege categorie ${c.id}`).toBe(true);
  });

  it('elke genoemde export bestaat in het pakket', () => {
    const exported = new Set(Object.keys(papier));
    for (const p of pages) for (const e of p.exports) expect(exported.has(e), `${p.slug}: ${e}`).toBe(true);
  });

  it('gerelateerde pagina’s bestaan', () => {
    for (const p of pages) for (const r of p.related ?? []) expect(pageBySlug.has(r), `${p.slug} → ${r}`).toBe(true);
  });

  it('elk component uit het pakket staat op een pagina', () => {
    const documented = new Set(pages.flatMap((p) => p.exports));
    const components = Object.keys(papier).filter((k) => /^[A-Z]/.test(k) && !['Papier'].includes(k) && typeof (papier as Record<string, unknown>)[k] !== 'string');
    const missing = components.filter((c) => !documented.has(c) && !/^(icons|Field|FieldLabel|FieldHint|FieldError)$/.test(c));
    expect(missing).toEqual([]);
  });

  it('gidsen hebben unieke secties', () => {
    for (const g of guides) expect(new Set(g.sections.map((s) => s.id)).size).toBe(g.sections.length);
  });
});

describe('docs router', () => {
  it('leest pagina en sectie uit de hash, en href maakt dezelfde route terug', () => {
    expect(parseHash('')).toEqual({ path: [] });
    expect(parseHash('#/componenten/button')).toEqual({ path: ['componenten', 'button'] });
    expect(parseHash('#/componenten/button/api')).toEqual({ path: ['componenten', 'button'], section: 'api' });
    expect(parseHash('#/start/installatie')).toEqual({ path: ['start'], section: 'installatie' });
    expect(parseHash(href('componenten', 'datepicker', 'toegankelijkheid'))).toEqual({ path: ['componenten', 'datepicker'], section: 'toegankelijkheid' });
    expect(parseHash('#gebruik')).toEqual({ path: ['start'] });
    expect(parseHash('#iets-onbekends')).toEqual({ path: [] });
  });

  it('een kapotte link laat de site niet crashen', () => {
    expect(() => parseHash('#/componenten/%E0%A4%A')).not.toThrow();
    expect(parseHash('#/componenten/%E0%A4%A').path[0]).toBe('componenten');
  });
});
