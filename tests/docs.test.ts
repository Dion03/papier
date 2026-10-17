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
  it('every Example has exactly one page, and every page an Example', () => {
    expect(new Set(exampleIds).size).toBe(exampleIds.length);
    expect(pages.map((p) => p.example).sort()).toEqual([...exampleIds].sort());
  });

  it('slugs are unique and categories exist', () => {
    expect(new Set(pages.map((p) => p.slug)).size).toBe(pages.length);
    const ids = new Set(categories.map((c) => c.id));
    for (const p of pages) expect(ids.has(p.category), `${p.slug}: ${p.category}`).toBe(true);
    for (const c of categories) expect(pages.some((p) => p.category === c.id), `empty category ${c.id}`).toBe(true);
  });

  it('every listed export exists in the package', () => {
    const exported = new Set(Object.keys(papier));
    for (const p of pages) for (const e of p.exports) expect(exported.has(e), `${p.slug}: ${e}`).toBe(true);
  });

  it('related pages exist', () => {
    for (const p of pages) for (const r of p.related ?? []) expect(pageBySlug.has(r), `${p.slug} → ${r}`).toBe(true);
  });

  it('every component in the package has a page', () => {
    const documented = new Set(pages.flatMap((p) => p.exports));
    const components = Object.keys(papier).filter((k) => /^[A-Z]/.test(k) && !['Papier'].includes(k) && typeof (papier as Record<string, unknown>)[k] !== 'string');
    const missing = components.filter((c) => !documented.has(c) && !/^(icons|Field|FieldLabel|FieldHint|FieldError)$/.test(c));
    expect(missing).toEqual([]);
  });

  it('guides have unique sections', () => {
    for (const g of guides) expect(new Set(g.sections.map((s) => s.id)).size).toBe(g.sections.length);
  });
});

describe('docs router', () => {
  it('reads the page and section from the hash, and href builds the same route back', () => {
    expect(parseHash('')).toEqual({ path: [] });
    expect(parseHash('#/components/button')).toEqual({ path: ['components', 'button'] });
    expect(parseHash('#/components/button/api')).toEqual({ path: ['components', 'button'], section: 'api' });
    expect(parseHash('#/getting-started/installation')).toEqual({ path: ['getting-started'], section: 'installation' });
    expect(parseHash(href('components', 'date-picker', 'accessibility'))).toEqual({ path: ['components', 'date-picker'], section: 'accessibility' });
    expect(parseHash('#something-unknown')).toEqual({ path: [] });
  });

  it('Dutch routes from before 0.6 still lead to the same place', () => {
    expect(parseHash('#/componenten/button/toegankelijkheid')).toEqual({ path: ['components', 'button'], section: 'accessibility' });
    expect(parseHash('#/categorie/datums')).toEqual({ path: ['category'], section: 'dates' });
    expect(parseHash('#/start/installatie')).toEqual({ path: ['getting-started'], section: 'installation' });
    expect(parseHash('#/thema/speeltuin')).toEqual({ path: ['theming'], section: 'playground' });
    expect(parseHash('#/fundament/kleur')).toEqual({ path: ['foundations'], section: 'color' });
    expect(parseHash('#gebruik')).toEqual({ path: ['getting-started'] });
  });

  it('a broken link does not crash the site', () => {
    expect(() => parseHash('#/components/%E0%A4%A')).not.toThrow();
    expect(parseHash('#/components/%E0%A4%A').path[0]).toBe('components');
  });
});
