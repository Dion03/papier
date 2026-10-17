import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, CommandDialog, EmptyState, IconButton, Kbd, Papier, SegmentedControl, Sheet, Skeleton, Text, Toggle, ToastProvider, icons, useToast,
  type CommandItem, type PapierTheme,
} from '@dionbm/papier';
import api from './props.json';
import { ActiveExample, sectionsOf } from './Example';
import { Explorer } from './Explorer';
import { Home } from './Home';

// Pages load on demand: the homepage and the explorer come first, every example and guide after.
const Components = lazy(() => import('./Components').then((m) => ({ default: m.Components })));
const Foundations = lazy(() => import('./Foundations').then((m) => ({ default: m.Foundations })));
const StartGuide = lazy(() => import('./Guides').then((m) => ({ default: m.StartGuide })));
const ThemeGuide = lazy(() => import('./Guides').then((m) => ({ default: m.ThemeGuide })));

/** Calls `then` once an element with this id exists, e.g. after a lazy page has loaded. */
function whenPresent(id: string, then: (el: HTMLElement) => void) {
  const found = document.getElementById(id);
  if (found) { then(found); return () => {}; }
  const mo = new MutationObserver(() => {
    const el = document.getElementById(id);
    if (el) { mo.disconnect(); then(el); }
  });
  mo.observe(document.body, { childList: true, subtree: true });
  const stop = window.setTimeout(() => mo.disconnect(), 4000);
  return () => { mo.disconnect(); window.clearTimeout(stop); };
}

function PageLoading() {
  return (
    <div className="doc-page doc-loading" aria-busy="true">
      <Skeleton width="30%" />
      <Skeleton shape="block" height={56} width="70%" />
      <Skeleton lines={2} />
      <Skeleton shape="block" height={260} />
      <span className="pp-visually-hidden" role="status">Pagina laden</span>
    </div>
  );
}
import { categories, categoryById, guides, pageBySlug, pages, type DocPage } from './registry';
import { href, navigate, setLegacyAnchors, useRoute, type Route } from './router';

setLegacyAnchors(Object.fromEntries(pages.map((p) => [p.example, p.slug])));
const reference = api as Record<string, unknown>;
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const shortcut = isMac ? '⌘ K' : 'Ctrl K';

function useResolvedTheme(theme: PapierTheme): 'light' | 'dark' {
  const query = '(prefers-color-scheme: dark)';
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    const on = () => setSystemDark(mq.matches);
    mq?.addEventListener('change', on);
    return () => mq?.removeEventListener('change', on);
  }, []);
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}

function readPref<T extends string>(key: string, fallback: T): T {
  try { return (localStorage.getItem(key) as T) || fallback; } catch { return fallback; }
}
function writePref(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* private mode */ } }

const top = [
  { to: 'start', label: 'Aan de slag' },
  { to: 'componenten', label: 'Componenten' },
  { to: 'thema', label: 'Thema’s' },
  { to: 'fundament', label: 'Fundament' },
];

/** What a route shows, its title for the tab and its "Op deze pagina" list. */
function resolve(route: Route): { kind: string; title: string; page?: DocPage; toc: Array<{ id: string; title: string }> } {
  const [first, second] = route.path;
  if (!first) return { kind: 'home', title: 'Papier · design system', toc: [] };
  if (first === 'componenten' && second) {
    const page = pageBySlug.get(second);
    if (!page) return { kind: 'missing', title: 'Niet gevonden · Papier', toc: [] };
    return { kind: 'component', page, title: `${page.title} · Papier`, toc: sectionsOf(page, page.exports.some((e) => reference[e])) };
  }
  if (first === 'componenten') return { kind: 'index', title: 'Componenten · Papier', toc: [] };
  if (first === 'categorie') {
    const c = categoryById.get(route.section ?? '');
    return c ? { kind: 'category', title: `${c.title} · Papier`, toc: [] } : { kind: 'missing', title: 'Niet gevonden · Papier', toc: [] };
  }
  const guide = guides.find((g) => g.slug === first);
  if (guide) return { kind: first, title: `${guide.title} · Papier`, toc: guide.sections };
  return { kind: 'missing', title: 'Niet gevonden · Papier', toc: [] };
}

function Sidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  const current = route.path.join('/');
  const link = (to: string, label: string, extra?: string) => (
    <li key={to}>
      <a href={`#/${to}`} className="doc-side__link" aria-current={current === to ? 'page' : undefined} onClick={onNavigate}>
        {label}{extra && <span className="doc-side__badge">{extra}</span>}
      </a>
    </li>
  );
  return (
    <nav className="doc-side" aria-label="Documentatie">
      <div className="doc-side__group">
        <p className="doc-side__title">Aan de slag</p>
        <ul>{link('', 'Introductie')}{guides.map((g) => link(g.slug, g.title))}{link('componenten', 'Alle componenten')}</ul>
      </div>
      {categories.map((c) => (
        <div key={c.id} className="doc-side__group">
          <p className="doc-side__title"><a href={href('categorie', c.id)} onClick={onNavigate} aria-current={route.path[0] === 'categorie' && route.section === c.id ? 'page' : undefined}>{c.title}</a></p>
          <ul>{pages.filter((p) => p.category === c.id).map((p) => link(`componenten/${p.slug}`, p.title, p.added === '0.7' ? 'nieuw' : undefined))}</ul>
        </div>
      ))}
    </nav>
  );
}

/** "Op deze pagina", with the section in view marked. */
function Toc({ items, base }: { items: Array<{ id: string; title: string }>; base: string }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items, base]);
  if (!items.length) return null;
  return (
    <nav className="doc-toc" aria-label="Op deze pagina">
      <p className="doc-toc__title">Op deze pagina</p>
      <ul>{items.map((i) => <li key={i.id}><a href={`#/${base}/${i.id}`} aria-current={active === i.id ? 'location' : undefined}>{i.title}</a></li>)}</ul>
    </nav>
  );
}

function Search({ open, onClose, setTheme, reduced, setReduced }: { open: boolean; onClose: () => void; setTheme: (t: PapierTheme) => void; reduced: boolean; setReduced: (r: boolean) => void }) {
  const { toast } = useToast();
  const items = useMemo<CommandItem[]>(() => [
    ...guides.flatMap((g) => [
      { id: g.slug, group: 'Gidsen', label: g.title, description: g.summary, icon: <icons.ArrowRight />, onSelect: () => navigate(href(g.slug)) },
      ...g.sections.map((s) => ({ id: `${g.slug}-${s.id}`, group: 'Gidsen', label: `${g.title}: ${s.title}`, textValue: `${s.title} ${g.title}`, keywords: s.keywords, icon: <icons.ChevronRight />, onSelect: () => navigate(href(g.slug, s.id)) })),
    ]),
    ...pages.map((p) => ({
      id: p.slug, group: categoryById.get(p.category)!.title, label: p.title, description: p.summary, icon: categoryById.get(p.category)!.icon,
      keywords: [...p.exports, ...(p.keywords ?? []), ...categoryById.get(p.category)!.title.split(' ')], onSelect: () => navigate(href('componenten', p.slug)),
    })),
    ...pages.map((p) => ({ id: `${p.slug}-api`, group: 'API', label: `${p.title}: props`, textValue: `${p.title} props api`, keywords: p.exports, icon: <icons.Sort />, onSelect: () => navigate(href('componenten', p.slug, 'api')) })),
    { id: 'licht', group: 'Instellingen', label: 'Licht thema', icon: <icons.Sun />, keywords: ['light'], onSelect: () => setTheme('light') },
    { id: 'donker', group: 'Instellingen', label: 'Donker thema', icon: <icons.Moon />, keywords: ['dark', 'nacht'], onSelect: () => setTheme('dark') },
    { id: 'systeem', group: 'Instellingen', label: 'Thema van het systeem', icon: <icons.Copy />, keywords: ['system', 'auto'], onSelect: () => setTheme('system') },
    { id: 'beweging', group: 'Instellingen', label: reduced ? 'Beweging weer aanzetten' : 'Minder beweging', icon: <icons.Pause />, keywords: ['motion', 'animatie'], onSelect: () => setReduced(!reduced) },
    { id: 'npm', group: 'Instellingen', label: 'Kopieer de installatieopdracht', icon: <icons.Copy />, keywords: ['npm', 'install'], onSelect: () => {
      navigator.clipboard?.writeText('npm install @dionbm/papier').then(() => toast({ title: 'Gekopieerd', description: 'npm install @dionbm/papier' }), () => toast({ tone: 'danger', title: 'Kopiëren mislukt' }));
    } },
  ], [reduced, setReduced, setTheme, toast]);
  // API items only show up when you search for them; they would double the list otherwise.
  const filter = (item: CommandItem, query: string) => {
    if (item.group === 'API' && !query.trim()) return 0;
    if (item.group === 'Gidsen' && item.id.includes('-') && !query.trim()) return 0;
    const words = query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').split(/\s+/).filter(Boolean);
    if (!words.length) return 1;
    const label = (item.textValue ?? String(item.label)).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const keys = (item.keywords ?? []).join(' ').toLowerCase();
    const desc = typeof item.description === 'string' ? item.description.toLowerCase() : '';
    let score = 0;
    for (const w of words) {
      const s = label.startsWith(w) ? 8 : label.includes(` ${w}`) ? 6 : keys.split(' ').some((k) => k.startsWith(w)) ? 5 : label.includes(w) ? 4 : keys.includes(w) ? 3 : desc.includes(w) ? 1 : 0;
      if (!s) return 0;
      score += s;
    }
    return item.group === 'API' ? score - 2 : score;
  };
  return <CommandDialog open={open} onClose={onClose} label="Zoek in de documentatie" placeholder="Zoek een component, prop of gids…" items={items} filter={filter}
    emptyText={<>Niets gevonden. Probeer een export zoals <code>DatePicker</code> of een woord zoals ‘upload’.</>} />;
}

function NotFound() {
  return (
    <div className="doc-page">
      <h1 id="page-title" tabIndex={-1} className="pp-visually-hidden">Niet gevonden</h1>
      <EmptyState headingLevel={2} title="Deze pagina bestaat niet (meer)" icon={<icons.Search />}
        description="Misschien heeft het component een nieuwe plek. Zoek het op naam, of bekijk alle componenten."
        action={<Button asChild variant="ink"><a href={href('componenten')}>Alle componenten</a></Button>} />
    </div>
  );
}

function Shell() {
  const [theme, setThemeState] = useState<PapierTheme>(() => readPref<PapierTheme>('papier-docs-theme', 'light'));
  const [reduced, setReducedState] = useState(() => readPref<string>('papier-docs-motion', 'full') === 'reduced');
  const setTheme = (t: PapierTheme) => { setThemeState(t); writePref('papier-docs-theme', t); };
  const setReduced = (r: boolean) => { setReducedState(r); writePref('papier-docs-motion', r ? 'reduced' : 'full'); };
  const resolved = useResolvedTheme(theme);
  const route = useRoute();
  const view = resolve(route);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    document.documentElement.style.colorScheme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#1c1d19' : '#f2efe7');
    document.body.style.background = resolved === 'dark' ? '#1c1d19' : '#f2efe7';
  }, [resolved]);

  // After a route change: title, scroll, and focus on the heading so screen readers hear where they are.
  useEffect(() => {
    document.title = view.title;
    const isFirst = first.current;
    first.current = false;
    const section = route.section && view.kind !== 'category' ? route.section : null;
    if (section) return whenPresent(section, (el) => el.scrollIntoView({ block: 'start' }));
    window.scrollTo(0, 0);
    if (isFirst) return undefined;
    return whenPresent('page-title', (el) => el.focus({ preventScroll: true }));
  }, [route.path.join('/'), route.section]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setSearch((s) => !s); }
      else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setSearch(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const withSidebar = view.kind !== 'home';
  let content;
  if (view.kind === 'home') content = <Home onSearch={() => setSearch(true)} shortcut={shortcut} />;
  else if (view.kind === 'start') content = <StartGuide />;
  else if (view.kind === 'thema') content = <ThemeGuide />;
  else if (view.kind === 'fundament') content = <Foundations theme={resolved} />;
  else if (view.kind === 'component') content = <ActiveExample.Provider value={view.page!.example}><Components /></ActiveExample.Provider>;
  else if (view.kind === 'index' || view.kind === 'category') {
    const c = view.kind === 'category' ? categoryById.get(route.section!)! : null;
    content = (
      <div className="doc-page doc-index">
        <header className="doc-page__head">
          <Text variant="label" as="p" className="doc-eyebrow">{c ? 'Categorie' : 'Componenten'}</Text>
          <Text variant="headline" as="h1" id="page-title" tabIndex={-1} className="doc-page__title">{c ? c.title : 'Onderdelen die je kunt aanraken.'}</Text>
          <Text variant="body-lg" tone="muted" className="doc-page__lead">{c ? c.blurb : 'Elk onderdeel is gebouwd op een native element waar dat kan. Papier voegt materiaal en beweging toe, nooit een eigen versie van wat de browser al goed doet.'}</Text>
        </header>
        <Explorer key={c?.id ?? 'all'} only={c?.id} />
      </div>
    );
  } else content = <NotFound />;

  const tocBase = view.kind === 'component' ? `componenten/${view.page!.slug}` : route.path[0];

  return (
    <Papier theme={resolved} motion={reduced ? 'reduced' : 'full'} className="doc">
      <ToastProvider>
      <a className="doc-skip" href="#inhoud" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus(); }}>Naar de inhoud</a>
      <header className="doc-header">
        <IconButton label="Navigatie" variant="ghost" icon={<icons.Menu />} className="doc-header__menu" onClick={() => setMenu(true)} aria-haspopup="dialog" />
        <a href="#/" className="doc-wordmark">papier<span>.</span><span className="pp-visually-hidden"> naar de introductie</span></a>
        <nav aria-label="Hoofdnavigatie" className="doc-nav">
          {top.map((n) => <a key={n.to} href={href(n.to)} className="doc-nav__link" aria-current={route.path[0] === n.to || (n.to === 'componenten' && route.path[0] === 'categorie') ? 'page' : undefined}>{n.label}</a>)}
        </nav>
        <div className="doc-controls">
          <button type="button" className="doc-search" onClick={() => setSearch(true)} aria-haspopup="dialog" aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}>
            <icons.Search width={16} height={16} />
            <span className="doc-search__text">Zoeken</span>
            <span className="doc-search__keys" aria-hidden="true">{shortcut.split(' ').map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </button>
          <SegmentedControl label="Thema" size="sm" value={theme} onValueChange={setTheme} className="doc-theme-switch"
            options={[
              { value: 'light', label: <><icons.Sun width={15} height={15} /><span className="pp-visually-hidden">Licht</span></> },
              { value: 'dark', label: <><icons.Moon width={15} height={15} /><span className="pp-visually-hidden">Donker</span></> },
              { value: 'system', label: <><span aria-hidden="true">A</span><span className="pp-visually-hidden">Systeem</span></> },
            ]} />
          <Toggle size="sm" pressed={reduced} onPressedChange={setReduced} aria-label="Minder beweging" icon={<icons.Pause width={15} height={15} />} className="doc-motion-toggle" title="Minder beweging" />
          <IconButton asChild label="Broncode op GitHub" variant="ghost" icon={<icons.External />} className="doc-header__github">
            <a href="https://github.com/Dion03/papier" target="_blank" rel="noopener noreferrer" />
          </IconButton>
        </div>
      </header>

      <div className={withSidebar ? 'doc-layout' : 'doc-layout doc-layout--wide'}>
        {withSidebar && <div className="doc-layout__side"><Sidebar route={route} /></div>}
        <main id="inhoud" key={route.path.join('/') + (view.kind === 'category' ? `/${route.section}` : '')} className="doc-layout__main" data-kind={view.kind}>
          <Suspense fallback={<PageLoading />}>{content}</Suspense>
        </main>
        {withSidebar && view.toc.length > 0 && <div className="doc-layout__toc"><Toc key={tocBase} items={view.toc} base={tocBase} /></div>}
      </div>

      <footer className="doc-footer">
        <div>
          <a href="#/" className="doc-wordmark doc-wordmark--small">papier<span>.</span><span className="pp-visually-hidden"> naar de introductie</span></a>
          <Text variant="small" tone="muted">Het design system achter mijn portfolio en apps. MIT; fonts onder de SIL Open Font License.</Text>
        </div>
        <nav aria-label="Voettekst" className="doc-footer__nav">
          {top.map((n) => <a key={n.to} href={href(n.to)}>{n.label}</a>)}
          <a href="https://www.npmjs.com/package/@dionbm/papier" target="_blank" rel="noopener noreferrer">npm<span className="pp-visually-hidden"> (opent in een nieuw tabblad)</span></a>
        </nav>
      </footer>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Navigatie" side="left" className="doc-menu-sheet">
        <nav aria-label="Hoofdnavigatie (menu)" className="doc-sheet-top">
          {top.map((n) => <a key={n.to} href={href(n.to)} onClick={() => setMenu(false)}>{n.label}</a>)}
        </nav>
        <Sidebar route={route} onNavigate={() => setMenu(false)} />
      </Sheet>
      <Search open={search} onClose={() => setSearch(false)} setTheme={setTheme} reduced={reduced} setReduced={setReduced} />
      </ToastProvider>
    </Papier>
  );
}

export const App = Shell;
