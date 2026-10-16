import { useEffect, useState } from 'react';
import { Button, Link, Papier, ToastProvider, SegmentedControl, Slider, Surface, Switch, Tag, Text, icons, type PapierTheme } from '@dionbm/papier';
import { Foundations } from './Foundations';
import { Components } from './Components';

const nav = [
  { href: '#principes', label: 'Principes' },
  { href: '#fundament', label: 'Fundament' },
  { href: '#componenten', label: 'Componenten' },
  { href: '#gebruik', label: 'Gebruik' },
];

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

/** The hero: Papier components laid out as objects on paper, all of them live. */
function Constellation() {
  const [period, setPeriod] = useState('week');
  const [on, setOn] = useState(true);
  const [vol, setVol] = useState(64);
  return (
    <div className="doc-constellation" aria-label="Voorbeeld: Papier-componenten als objecten" role="group">
      <Surface material="sage" elevation="object" className="doc-obj doc-obj--a">
        <Text variant="label" as="p">Periode</Text>
        <SegmentedControl label="Periode" size="sm" value={period} onValueChange={setPeriod}
          options={[{ value: 'week', label: 'Week' }, { value: 'maand', label: 'Maand' }, { value: 'jaar', label: 'Jaar' }]} />
      </Surface>
      <Surface material="coral" elevation="object" className="doc-obj doc-obj--b">
        <Switch label="Geluid" checked={on} onCheckedChange={setOn} />
      </Surface>
      <Surface material="paper" elevation="object" className="doc-obj doc-obj--c">
        <Slider label="Volume" value={vol} onValueChange={setVol} formatValue={(v) => `${v}%`} />
      </Surface>
      <Surface material="ink" elevation="object" className="doc-obj doc-obj--d">
        <span className="doc-obj__count">52</span>
        <Text variant="small" as="p">componenten, getest met axe in licht en donker</Text>
      </Surface>
      <div className="doc-obj doc-obj--e doc-disc" aria-hidden="true"><span /></div>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<PapierTheme>(() => readPref<PapierTheme>('papier-docs-theme', 'light'));
  const [reduced, setReduced] = useState(() => readPref<string>('papier-docs-motion', 'full') === 'reduced');
  const resolved = useResolvedTheme(theme);

  useEffect(() => {
    document.documentElement.style.colorScheme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#1c1d19' : '#f2efe7');
    document.body.style.background = resolved === 'dark' ? '#1c1d19' : '#f2efe7';
  }, [resolved]);

  return (
    <Papier theme={resolved} motion={reduced ? 'reduced' : 'full'} className="doc">
      <ToastProvider>
      <a className="doc-skip" href="#inhoud">Naar de inhoud</a>
      <header className="doc-header">
        <a href="#top" className="doc-wordmark">papier<span>.</span><span className="pp-visually-hidden"> naar boven</span></a>
        <nav aria-label="Hoofdnavigatie" className="doc-nav">
          {nav.map((n) => <Link key={n.href} href={n.href} variant="quiet">{n.label}</Link>)}
        </nav>
        <div className="doc-controls">
          <SegmentedControl label="Thema" size="sm" value={theme}
            onValueChange={(v) => { setTheme(v); writePref('papier-docs-theme', v); }}
            options={[{ value: 'light', label: 'Licht' }, { value: 'dark', label: 'Donker' }, { value: 'system', label: 'Systeem' }]} />
          <Switch label="Minder beweging" checked={reduced} onCheckedChange={(v) => { setReduced(v); writePref('papier-docs-motion', v ? 'reduced' : 'full'); }} className="doc-motion-switch" />
        </div>
      </header>

      <main id="inhoud" tabIndex={-1}>
        <section id="top" className="doc-hero" aria-labelledby="hero-title">
          <div className="doc-hero__copy">
            <Tag tone="outline">v0.3 · React · MIT</Tag>
            <Text variant="display" id="hero-title">Papier<span className="doc-accent">.</span></Text>
            <Text variant="body-lg" tone="muted" className="doc-hero__lead">
              Het design system achter mijn portfolio en apps. Warm papier, inkt, vermiljoen en salie als 52 toegankelijke React-componenten, met tokens die zichzelf controleren.
            </Text>
            <div className="doc-row">
              <Button asChild variant="ink" size="lg" iconEnd={<icons.ArrowRight />}><a href="#componenten">Bekijk de componenten</a></Button>
              <Link href="#gebruik" variant="arrow">Installeren</Link>
            </div>
          </div>
          <Constellation />
        </section>

        <section id="principes" className="doc-section" aria-labelledby="principes-title">
          <div className="doc-section__head">
            <Text variant="headline" as="h2" id="principes-title">Gemaakt om aan te raken.</Text>
          </div>
          <ol className="doc-principles">
            <li><Text variant="subtitle" as="h3">Native eerst</Text><Text tone="muted">Een knop is een button, een uitklapper een details, een venster een dialog. Papier stijlt wat de browser al goed doet en vult alleen aan waar nodig.</Text></li>
            <li><Text variant="subtitle" as="h3">Object, geen decoratie</Text><Text tone="muted">Diepte en materiaal zijn voor dingen die je bedient. Leestekst en navigatie blijven vlak en rustig op papier.</Text></li>
            <li><Text variant="subtitle" as="h3">Rollen, geen kleuren</Text><Text tone="muted">Componenten kennen alleen rollen zoals tekst, actie en focus. Een thema is een nieuwe set rollen die dezelfde contrasteisen haalt.</Text></li>
            <li><Text variant="subtitle" as="h3">Beweging is optioneel</Text><Text tone="muted">Elke overgang heeft een eindtoestand die direct bereikbaar is. Minder beweging zet alle duren op nul, niets verdwijnt.</Text></li>
          </ol>
        </section>

        <Foundations theme={resolved} />
        <Components />

        <section id="gebruik" className="doc-section" aria-labelledby="gebruik-title">
          <div className="doc-section__head">
            <Text variant="headline" as="h2" id="gebruik-title">In drie regels op papier.</Text>
          </div>
          <div className="doc-grid-2">
            <Surface material="ink" padding="lg" className="doc-code-card">
              <pre tabIndex={0} aria-label="Installatievoorbeeld"><code>{`npm install @dionbm/papier

import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier, Button } from '@dionbm/papier';

export function App() {
  return (
    <Papier theme="system">
      <Button>Opslaan</Button>
    </Papier>
  );
}`}</code></pre>
            </Surface>
            <div className="doc-stack">
              <Text variant="subtitle" as="h3">Wat je krijgt</Text>
              <ul className="doc-list">
                <li><code>papier.css</code>: tokens, basis en alle componenten, 7 kB gzip.</li>
                <li><code>tokens.css</code> en <code>tokens.json</code> voor wie alleen de waarden wil, ook buiten React.</li>
                <li><code>tokens.dtcg.json</code> in het W3C-formaat voor design tokens, voor Tokens Studio, Figma en Style Dictionary.</li>
                <li><code>fonts.css</code>: Manrope en DM Sans als variabele fonts.</li>
                <li>ES- en CommonJS-builds met typedefinities, één bestand per module. React 18 of 19 is een peer dependency.</li>
              </ul>
              <Text variant="subtitle" as="h3">Hoe het getest is</Text>
              <ul className="doc-list">
                <li>axe zonder overtredingen voor elk component, in licht en donker.</li>
                <li>Gedragstests voor toetsenbord, focus en ARIA-status.</li>
                <li>Een contrastcheck op 26 paren per thema die de build laat falen.</li>
                <li>Unit-, axe- en SSR-tests op React 18 en 19; Playwright in Chromium, Firefox, WebKit en mobiel, ook van rechts naar links.</li>
                <li>De API-tabellen hieronder komen uit de TypeScript-types, dus ze lopen nooit achter.</li>
              </ul>
              <Text variant="subtitle" as="h3">In je eigen app</Text>
              <ul className="doc-list">
                <li><code>asChild</code> op Button, IconButton en Link: de Link van Next.js of React Router krijgt de Papier-vorm.</li>
                <li>Alle CSS staat in <code>@layer papier</code>. Je eigen stijlen winnen zonder specificiteitsgevecht; zet bij Tailwind 4 bovenaan <code>@layer theme, base, papier, components, utilities;</code>.</li>
                <li>Menu en Tooltip openen in de top layer en vallen niet weg in een tabel of module met <code>overflow: hidden</code>.</li>
                <li>Elk component met een eigen element geeft een <code>ref</code> door.</li>
                <li>Next.js: Text, Stack, Container, Surface, Tag, Table en Skeleton blijven server components; alleen wat je bedient is client-code.</li>
                <li>Van rechts naar links: zet <code>dir="rtl"</code> op je pagina. Uitlijning, menu's en pijlen draaien mee; geef eigen pijlen <code>className="pp-flip-rtl"</code>.</li>
              </ul>
            </div>
          </div>
          <div className="doc-grid-2 doc-theme">
            <Surface material="ink" padding="lg" className="doc-code-card">
              <pre tabIndex={0} aria-label="Voorbeeld van een eigen thema"><code>{`import { Papier, themeStyle, checkTheme } from '@dionbm/papier';

const merk = { action: '#1f4e8c', 'action-hover': '#183d6e', 'on-action': '#ffffff' };

<Papier theme="light" style={themeStyle(merk)}>…</Papier>

// In een test: geen merkkleur maakt tekst onleesbaar.
expect(checkTheme(merk).filter((r) => !r.ok)).toEqual([]);`}</code></pre>
            </Surface>
            <div className="doc-stack">
              <Text variant="subtitle" as="h3">Een eigen thema</Text>
              <Text tone="muted">Componenten gebruiken alleen kleurrollen. Een merk of thema is dus een andere waarde voor een paar rollen, als CSS-variabele <code>--papier-color-*</code>. <code>themeStyle</code> zet ze inline, <code>checkTheme</code> legt ze langs dezelfde 26 contrastparen als de build.</Text>
              <Text tone="muted">Alle rollen staan in <code>colorRoles</code>. Voor licht én donker zet je de variabelen in je eigen CSS onder <code>[data-papier-theme]</code>.</Text>
            </div>
          </div>
        </section>
      </main>

      <footer className="doc-footer">
        <Text variant="small" tone="muted">Papier is mijn design system en draagt de identiteit van mijn portfolio. Fonts onder de SIL Open Font License.</Text>
        <a href="#top" className="doc-wordmark doc-wordmark--small">papier<span>.</span><span className="pp-visually-hidden"> terug naar boven</span></a>
      </footer>
      </ToastProvider>
    </Papier>
  );
}
