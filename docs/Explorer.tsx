import { useMemo, useState } from 'react';
import { Button, EmptyState, Tag, Text, TextField, icons } from '@dionbm/papier';
import { categories, categoryById, pages, type DocPage } from './registry';
import { href } from './router';

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const matches = (p: DocPage, q: string) => {
  const hay = normalize([p.title, p.summary, categoryById.get(p.category)!.title, ...p.exports, ...(p.keywords ?? [])].join(' '));
  return normalize(q).split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
};

/** A card per component page: a live, inert preview and a link that covers the card. */
export function PageCard({ page, headingLevel = 3 }: { page: DocPage; headingLevel?: 2 | 3 | 4 }) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <li className="doc-card">
      <div className="doc-card__preview" inert aria-hidden="true">{page.preview()}</div>
      <div className="doc-card__body">
        <H className="doc-card__title"><a href={href('componenten', page.slug)} className="doc-card__link">{page.title}</a></H>
        <p className="doc-card__summary">{page.summary}</p>
        <div className="doc-card__tags">
          {page.added === '0.7' && <Tag tone="accent">Nieuw</Tag>}
          {page.server && <Tag tone="sage">Server</Tag>}
          <span className="doc-card__exports">{page.exports.filter((e) => /^[A-Z]/.test(e)).slice(0, 3).join(' · ')}</span>
        </div>
      </div>
    </li>
  );
}

/**
 * Every component page by category, with a filter that searches titles, summaries, exports
 * and keywords. `only` limits it to one category (the category route).
 */
export function Explorer({ only, headingLevel = 2, autoFocus }: { only?: string; headingLevel?: 2 | 3; autoFocus?: boolean }) {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => pages.filter((p) => (!only || p.category === only) && matches(p, query)), [query, only]);
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <div className="doc-explorer">
      <div className="doc-explorer__bar">
        <TextField label="Filter de componenten" hideLabel type="search" placeholder="Filter op naam, functie of export, bijvoorbeeld ‘datum’" prefix={<icons.Search />}
          value={query} onChange={(e) => setQuery(e.target.value)} autoFocus={autoFocus} />
        <Text variant="small" tone="muted" role="status" className="doc-explorer__count">{shown.length} {shown.length === 1 ? 'pagina' : "pagina's"}</Text>
      </div>
      {shown.length === 0 && (
        <EmptyState title="Niets gevonden" headingLevel={headingLevel} icon={<icons.Search />}
          description={`Geen component past bij "${query}". Zoek op wat het doet, zoals ‘upload’, ‘datum’ of ‘melding’.`}
          action={<Button variant="secondary" size="sm" onClick={() => setQuery('')}>Filter wissen</Button>} />
      )}
      {categories.filter((c) => !only || c.id === only).map((c) => {
        const inCategory = shown.filter((p) => p.category === c.id);
        if (!inCategory.length) return null;
        return (
          <section key={c.id} className="doc-explorer__group" aria-labelledby={`cat-${c.id}`}>
            <div className="doc-explorer__head">
              <span className="doc-explorer__icon" aria-hidden="true">{c.icon}</span>
              <H id={`cat-${c.id}`} className="doc-explorer__title">{only ? c.title : <a href={href('categorie', c.id)}>{c.title}</a>}</H>
              <Text variant="small" tone="muted" as="p" className="doc-explorer__blurb">{c.blurb}</Text>
            </div>
            <ul className="doc-cards">{inCategory.map((p) => <PageCard key={p.slug} page={p} headingLevel={headingLevel === 2 ? 3 : 4} />)}</ul>
          </section>
        );
      })}
    </div>
  );
}
