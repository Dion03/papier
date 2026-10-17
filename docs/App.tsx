import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, CommandDialog, EmptyState, IconButton, Kbd, Papier, englishLabels, SegmentedControl, Sheet, Skeleton, Text, Toggle, ToastProvider, icons, useToast,
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
const StabilityGuide = lazy(() => import('./Guides').then((m) => ({ default: m.StabilityGuide })));

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
      <span className="pp-visually-hidden" role="status">Loading page</span>
    </div>
  );
}
import { categories, categoryById, currentRelease, guides, pageBySlug, pages, type DocPage } from './registry';
import { href, navigate, setLegacyAnchors, useRoute, type Route } from './router';

setLegacyAnchors(Object.fromEntries(pages.map((p) => [p.example, p.slug])));
const reference = api as Record<string, unknown>;
/** The site is English; the library's own default stays Dutch until 1.0. */
const labels = { ...englishLabels, locale: 'en-GB' };
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
  { to: 'getting-started', label: 'Getting started' },
  { to: 'components', label: 'Components' },
  { to: 'theming', label: 'Theming' },
  { to: 'foundations', label: 'Foundations' },
];

/** What a route shows, its title for the tab and its "On this page" list. */
function resolve(route: Route): { kind: string; title: string; page?: DocPage; toc: Array<{ id: string; title: string }> } {
  const [first, second] = route.path;
  if (!first) return { kind: 'home', title: 'Papier · design system', toc: [] };
  if (first === 'components' && second) {
    const page = pageBySlug.get(second);
    if (!page) return { kind: 'missing', title: 'Not found · Papier', toc: [] };
    return { kind: 'component', page, title: `${page.title} · Papier`, toc: sectionsOf(page, page.exports.some((e) => reference[e])) };
  }
  if (first === 'components') return { kind: 'index', title: 'Components · Papier', toc: [] };
  if (first === 'category') {
    const c = categoryById.get(route.section ?? '');
    return c ? { kind: 'category', title: `${c.title} · Papier`, toc: [] } : { kind: 'missing', title: 'Not found · Papier', toc: [] };
  }
  const guide = guides.find((g) => g.slug === first);
  if (guide) return { kind: first, title: `${guide.title} · Papier`, toc: guide.sections };
  return { kind: 'missing', title: 'Not found · Papier', toc: [] };
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
    <nav className="doc-side" aria-label="Documentation">
      <div className="doc-side__group">
        <p className="doc-side__title">Getting started</p>
        <ul>{link('', 'Introduction')}{guides.map((g) => link(g.slug, g.title))}{link('components', 'All components')}</ul>
      </div>
      {categories.map((c) => (
        <div key={c.id} className="doc-side__group">
          <p className="doc-side__title"><a href={href('category', c.id)} onClick={onNavigate} aria-current={route.path[0] === 'category' && route.section === c.id ? 'page' : undefined}>{c.title}</a></p>
          <ul>{pages.filter((p) => p.category === c.id).map((p) => link(`components/${p.slug}`, p.title, p.added === currentRelease ? 'new' : undefined))}</ul>
        </div>
      ))}
    </nav>
  );
}

/** "On this page", with the section in view marked. */
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
    <nav className="doc-toc" aria-label="On this page">
      <p className="doc-toc__title">On this page</p>
      <ul>{items.map((i) => <li key={i.id}><a href={`#/${base}/${i.id}`} aria-current={active === i.id ? 'location' : undefined}>{i.title}</a></li>)}</ul>
    </nav>
  );
}

function Search({ open, onClose, setTheme, reduced, setReduced }: { open: boolean; onClose: () => void; setTheme: (t: PapierTheme) => void; reduced: boolean; setReduced: (r: boolean) => void }) {
  const { toast } = useToast();
  const items = useMemo<CommandItem[]>(() => [
    ...guides.flatMap((g) => [
      { id: g.slug, group: 'Guides', label: g.title, description: g.summary, icon: <icons.ArrowRight />, onSelect: () => navigate(href(g.slug)) },
      ...g.sections.map((s) => ({ id: `${g.slug}-${s.id}`, group: 'Guides', label: `${g.title}: ${s.title}`, textValue: `${s.title} ${g.title}`, keywords: s.keywords, icon: <icons.ChevronRight />, onSelect: () => navigate(href(g.slug, s.id)) })),
    ]),
    ...pages.map((p) => ({
      id: p.slug, group: categoryById.get(p.category)!.title, label: p.title, description: p.summary, icon: categoryById.get(p.category)!.icon,
      keywords: [...p.exports, ...(p.keywords ?? []), ...categoryById.get(p.category)!.title.split(' ')], onSelect: () => navigate(href('components', p.slug)),
    })),
    ...pages.map((p) => ({ id: `${p.slug}-api`, group: 'API', label: `${p.title}: props`, textValue: `${p.title} props api`, keywords: p.exports, icon: <icons.Sort />, onSelect: () => navigate(href('components', p.slug, 'api')) })),
    { id: 'light', group: 'Settings', label: 'Light theme', icon: <icons.Sun />, keywords: ['light'], onSelect: () => setTheme('light') },
    { id: 'dark', group: 'Settings', label: 'Dark theme', icon: <icons.Moon />, keywords: ['dark', 'night'], onSelect: () => setTheme('dark') },
    { id: 'system', group: 'Settings', label: 'System theme', icon: <icons.Copy />, keywords: ['system', 'auto'], onSelect: () => setTheme('system') },
    { id: 'motion', group: 'Settings', label: reduced ? 'Turn motion back on' : 'Reduce motion', icon: <icons.Pause />, keywords: ['motion', 'animation'], onSelect: () => setReduced(!reduced) },
    { id: 'npm', group: 'Settings', label: 'Copy the install command', icon: <icons.Copy />, keywords: ['npm', 'install'], onSelect: () => {
      navigator.clipboard?.writeText('npm install @dionbm/papier').then(() => toast({ title: 'Copied', description: 'npm install @dionbm/papier' }), () => toast({ tone: 'danger', title: 'Copying failed' }));
    } },
  ], [reduced, setReduced, setTheme, toast]);
  // API items only show up when you search for them; they would double the list otherwise.
  const filter = (item: CommandItem, query: string) => {
    if (item.group === 'API' && !query.trim()) return 0;
    if (item.group === 'Guides' && item.id.includes('-') && !query.trim()) return 0;
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
  return <CommandDialog open={open} onClose={onClose} label="Search the documentation" placeholder="Search for a component, prop or guide…" items={items} filter={filter}
    emptyText={<>Nothing found. Try an export such as <code>DatePicker</code> or a word such as ‘upload’.</>} />;
}

function NotFound() {
  return (
    <div className="doc-page">
      <h1 id="page-title" tabIndex={-1} className="pp-visually-hidden">Not found</h1>
      <EmptyState headingLevel={2} title="This page does not exist (any more)" icon={<icons.Search />}
        description="The component may have moved. Search for it by name, or browse all components."
        action={<Button asChild variant="ink"><a href={href('components')}>All components</a></Button>} />
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
  else if (view.kind === 'getting-started') content = <StartGuide />;
  else if (view.kind === 'theming') content = <ThemeGuide />;
  else if (view.kind === 'stability') content = <StabilityGuide />;
  else if (view.kind === 'foundations') content = <Foundations theme={resolved} />;
  else if (view.kind === 'component') content = <ActiveExample.Provider value={view.page!.example}><Components /></ActiveExample.Provider>;
  else if (view.kind === 'index' || view.kind === 'category') {
    const c = view.kind === 'category' ? categoryById.get(route.section!)! : null;
    content = (
      <div className="doc-page doc-index">
        <header className="doc-page__head">
          <Text variant="label" as="p" className="doc-eyebrow">{c ? 'Category' : 'Components'}</Text>
          <Text variant="headline" as="h1" id="page-title" tabIndex={-1} className="doc-page__title">{c ? c.title : 'Parts you can touch.'}</Text>
          <Text variant="body-lg" tone="muted" className="doc-page__lead">{c ? c.blurb : 'Every part is built on a native element where one exists. Papier adds material and motion, never its own version of what the browser already does well.'}</Text>
        </header>
        <Explorer key={c?.id ?? 'all'} only={c?.id} />
      </div>
    );
  } else content = <NotFound />;

  const tocBase = view.kind === 'component' ? `components/${view.page!.slug}` : route.path[0];

  return (
    <Papier theme={resolved} motion={reduced ? 'reduced' : 'full'} labels={labels} className="doc">
      <ToastProvider>
      <a className="doc-skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('page-title')?.focus(); }}>Skip to content</a>
      <header className="doc-header">
        <IconButton label="Navigation" variant="ghost" icon={<icons.Menu />} className="doc-header__menu" onClick={() => setMenu(true)} aria-haspopup="dialog" />
        <a href="#/" className="doc-wordmark">papier<span>.</span><span className="pp-visually-hidden"> to the introduction</span></a>
        <nav aria-label="Main" className="doc-nav">
          {top.map((n) => <a key={n.to} href={href(n.to)} className="doc-nav__link" aria-current={route.path[0] === n.to || (n.to === 'components' && route.path[0] === 'category') ? 'page' : undefined}>{n.label}</a>)}
        </nav>
        <div className="doc-controls">
          <button type="button" className="doc-search" onClick={() => setSearch(true)} aria-haspopup="dialog" aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}>
            <icons.Search width={16} height={16} />
            <span className="doc-search__text">Search</span>
            <span className="doc-search__keys" aria-hidden="true">{shortcut.split(' ').map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </button>
          <SegmentedControl label="Theme" size="sm" value={theme} onValueChange={setTheme} className="doc-theme-switch"
            options={[
              { value: 'light', label: <><icons.Sun width={15} height={15} /><span className="pp-visually-hidden">Light</span></> },
              { value: 'dark', label: <><icons.Moon width={15} height={15} /><span className="pp-visually-hidden">Dark</span></> },
              { value: 'system', label: <><span aria-hidden="true">A</span><span className="pp-visually-hidden">System</span></> },
            ]} />
          <Toggle size="sm" pressed={reduced} onPressedChange={setReduced} aria-label="Reduce motion" icon={<icons.Pause width={15} height={15} />} className="doc-motion-toggle" title="Reduce motion" />
          <IconButton asChild label="Source code on GitHub" variant="ghost" icon={<icons.External />} className="doc-header__github">
            <a href="https://github.com/Dion03/papier" target="_blank" rel="noopener noreferrer" />
          </IconButton>
        </div>
      </header>

      <div className={withSidebar ? 'doc-layout' : 'doc-layout doc-layout--wide'}>
        {withSidebar && <div className="doc-layout__side"><Sidebar route={route} /></div>}
        <main id="main" key={route.path.join('/') + (view.kind === 'category' ? `/${route.section}` : '')} className="doc-layout__main" data-kind={view.kind}>
          <Suspense fallback={<PageLoading />}>{content}</Suspense>
        </main>
        {withSidebar && view.toc.length > 0 && <div className="doc-layout__toc"><Toc key={tocBase} items={view.toc} base={tocBase} /></div>}
      </div>

      <footer className="doc-footer">
        <div>
          <a href="#/" className="doc-wordmark doc-wordmark--small">papier<span>.</span><span className="pp-visually-hidden"> to the introduction</span></a>
          <Text variant="small" tone="muted">The design system behind my portfolio and apps. MIT; fonts under the SIL Open Font License.</Text>
        </div>
        <nav aria-label="Footer" className="doc-footer__nav">
          {top.map((n) => <a key={n.to} href={href(n.to)}>{n.label}</a>)}
          <a href="https://www.npmjs.com/package/@dionbm/papier" target="_blank" rel="noopener noreferrer">npm<span className="pp-visually-hidden"> (opens in a new tab)</span></a>
        </nav>
      </footer>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Navigation" side="left" className="doc-menu-sheet">
        <nav aria-label="Main (menu)" className="doc-sheet-top">
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
