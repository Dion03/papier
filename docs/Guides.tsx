import { useMemo, useState, type ReactNode } from 'react';
import {
  Button, Checkbox, Field, Kbd, Link, Notice, Papier, Progress, Steps, Surface, Switch, Tag, Text, checkTheme, themeColors, themeStyle, icons,
} from '@dionbm/papier';
import { href } from './router';
import { CodeBlock } from './CodeBlock';

function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="doc-page__section" aria-labelledby={`${id}-title`}>
      <Text variant="title" as="h2" id={`${id}-title`} className="doc-page__h2">{title}</Text>
      {children}
    </section>
  );
}

function GuideHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: ReactNode }) {
  return (
    <header className="doc-page__head">
      <Text variant="label" as="p" className="doc-eyebrow">{eyebrow}</Text>
      <Text variant="headline" as="h1" id="page-title" tabIndex={-1} className="doc-page__title">{title}</Text>
      <Text variant="body-lg" tone="muted" className="doc-page__lead">{lead}</Text>
    </header>
  );
}

export function StartGuide() {
  return (
    <article className="doc-page doc-guide" aria-labelledby="page-title">
      <GuideHead eyebrow="Aan de slag" title="In drie regels op papier." lead="Papier is een npm-pakket met React-componenten, één CSS-bestand en de tokens. Geen provider-boom, geen build-plugin, geen runtime-styling." />

      <Steps className="doc-guide__steps" current={3} label="Stappen om te beginnen" items={[
        { title: 'Installeer', description: 'npm install' }, { title: 'Importeer de CSS', description: 'fonts en papier.css' }, { title: 'Wikkel in Papier', description: 'thema en teksten' }, { title: 'Bouw', description: 'componenten' },
      ]} />

      <GuideSection id="installatie" title="Installatie">
        <Text tone="muted">React 18 of 19 is een peer dependency. De fonts (Manrope en DM Sans) komen mee als variabele fonts.</Text>
        <CodeBlock label="Installatieopdracht" code="npm install @dionbm/papier" />
        <CodeBlock label="CSS importeren" code={`import '@dionbm/papier/fonts.css';   // Manrope en DM Sans
import '@dionbm/papier/papier.css';  // tokens, basis en alle componenten`} />
      </GuideSection>

      <GuideSection id="eerste-scherm" title="Je eerste scherm">
        <Text tone="muted"><code>Papier</code> zet het thema, de typografie en de teksten. <code>ToastProvider</code> is alleen nodig als je toasts gebruikt.</Text>
        <CodeBlock label="Eerste component" code={`import { Papier, ToastProvider, Button } from '@dionbm/papier';

export function App() {
  return (
    <Papier theme="system">
      <ToastProvider>
        <Button>Opslaan</Button>
      </ToastProvider>
    </Papier>
  );
}`} />
        <Text tone="muted">Kijk daarna bij de <Link href={href('componenten')}>componenten</Link>, of zoek er een met <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>.</Text>
      </GuideSection>

      <GuideSection id="nextjs" title="Next.js en server components">
        <Text tone="muted">De build heeft één bestand per module. Alleen modules met hooks, context of events beginnen met <code>'use client'</code>. Text, Stack, Container, Surface, Tag, Table, Skeleton, Separator, Kbd, EmptyState, de iconen en de themafuncties blijven server components en voegen geen JavaScript aan je pagina toe.</Text>
        <CodeBlock label="Next.js layout" code={`// app/layout.tsx
import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier } from '@dionbm/papier';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="nl"><body><Papier theme="system">{children}</Papier></body></html>;
}`} />
      </GuideSection>

      <GuideSection id="router-links" title="Router-links met asChild">
        <Text tone="muted">Button, IconButton, Link en BreadcrumbItem renderen met <code>asChild</code> hun enige kind. Zo krijgt de Link van Next.js of React Router de Papier-vorm en blijft het een echte link.</Text>
        <CodeBlock label="asChild met Next.js" code={`import NextLink from 'next/link';

<Button asChild variant="ink" iconEnd={<icons.ArrowRight />}>
  <NextLink href="/werk">Bekijk het werk</NextLink>
</Button>`} />
      </GuideSection>

      <GuideSection id="css" title="CSS, @layer en Tailwind">
        <Text tone="muted">Alle CSS van Papier staat in <code>@layer papier</code>. Je eigen stijlen buiten een laag winnen daardoor altijd, zonder specificiteitsgevecht.</Text>
        <CodeBlock label="Eigen CSS en Tailwind 4" code={`.pp-button { border-radius: 8px; }            /* wint van Papier */
:root { --papier-color-accent: #d6452a; }      /* overschrijft een token */

/* Tailwind 4: utilities winnen van Papier, Papier van de basis */
@layer theme, base, papier, components, utilities;`} />
      </GuideSection>

      <GuideSection id="talen" title="Teksten en talen">
        <Text tone="muted">Ingebouwde teksten zijn Nederlands en per app aan te passen. <code>locale</code> bepaalt ook hoe getallen, datums en bestandsgroottes worden opgemaakt.</Text>
        <CodeBlock label="Engelse teksten" code={`import { Papier, englishLabels } from '@dionbm/papier';

<Papier labels={englishLabels}>…</Papier>
<Papier labels={{ pageOf: (p, n) => \`\${p} / \${n}\` }}>…</Papier>`} />
      </GuideSection>

      <GuideSection id="rtl" title="Van rechts naar links">
        <Text tone="muted">Zet <code>dir="rtl"</code> op <code>&lt;html&gt;</code> of op <code>&lt;Papier&gt;</code>. Papier gebruikt logische CSS: uitlijning, menu's, sliders en pijlen draaien mee. Geef eigen richtingsiconen <code>className="pp-flip-rtl"</code>.</Text>
      </GuideSection>

      <GuideSection id="kwaliteit" title="Hoe het getest is">
        <ul className="doc-a11y">
          {['axe zonder overtredingen voor elk component, in licht en donker, ook open overlays.', 'Gedragstests voor toetsenbord, focus en ARIA, en een server-rendertest zonder window.', 'Een contrastcheck op 26 paren per thema die de build laat falen.', 'Playwright in Chromium, Firefox, WebKit en mobiel: axe, hoogcontrast, rechts-naar-links, echte klikken en screenshots.', 'De API-tabellen komen uit de TypeScript-types; npm run check faalt als ze achterlopen.'].map((l) => <li key={l}><icons.Check width={16} height={16} />{l}</li>)}
        </ul>
      </GuideSection>
    </article>
  );
}

const hex = /^#[0-9a-f]{6}$/i;

/** Pick a brand colour and see the components and the contrast check change with it. */
function ThemePlayground() {
  const [action, setAction] = useState('#1f4e8c');
  const [onAction, setOnAction] = useState('#ffffff');
  const [accent, setAccent] = useState('#d6452a');
  const brand = useMemo(() => ({ action, 'action-hover': action, 'on-action': onAction, accent, focus: accent, 'accent-text': accent }), [action, onAction, accent]);
  const results = useMemo(() => checkTheme(brand, 'light'), [brand]);
  const failing = results.filter((r) => !r.ok);
  const code = `<Papier theme="light" style={themeStyle(${JSON.stringify({ action, 'on-action': onAction, accent }, null, 0).replace(/,/g, ', ')})}>`;
  const color = (label: string, value: string, set: (v: string) => void) => (
    <Field label={label} hint={value}>
      {(c) => <input {...c} type="color" className="doc-color" value={value} onChange={(e) => set(e.target.value)} />}
    </Field>
  );
  return (
    <div className="doc-playground">
      <div className="doc-playground__controls">
        {color('Actie', action, setAction)}
        {color('Tekst op actie', onAction, setOnAction)}
        {color('Accent en focus', accent, setAccent)}
        <Button size="sm" variant="ghost" onClick={() => { const d = themeColors('light'); setAction(d.action); setOnAction(d['on-action']); setAccent(d.accent); }}>Terug naar Papier</Button>
      </div>
      <Papier theme="light" style={themeStyle(brand)} className="doc-playground__preview">
        <Surface material="paper" elevation="raised" padding="md" className="doc-stack">
          <div className="doc-row"><Button>Opslaan</Button><Button variant="secondary">Annuleren</Button></div>
          <Switch label="Meldingen" defaultChecked />
          <Checkbox label="Onthoud mij" defaultChecked />
          <Progress label="Uploaden" value={64} />
          <Link href="#/thema/speeltuin">Een accentlink</Link>
        </Surface>
      </Papier>
      <div className="doc-playground__result">
        {failing.length === 0
          ? <Notice tone="success" title="Alle 26 contrastparen gehaald">Deze kleuren kun je veilig gebruiken.</Notice>
          : <Notice tone="warning" title={`${failing.length} van 26 paren te laag`}>
              <ul className="doc-fail-list">{failing.map((r) => <li key={`${r.foreground}-${r.background}`}><code>{r.foreground}</code> op <code>{r.background}</code>: {r.ratio.toFixed(2)} (minimaal {r.minimum}) · {r.use}</li>)}</ul>
            </Notice>}
        <CodeBlock label="Code voor dit thema" code={code} />
        {!hex.test(action) && <Tag tone="accent">Alleen #rrggbb wordt gemeten</Tag>}
      </div>
    </div>
  );
}

export function ThemeGuide() {
  return (
    <article className="doc-page doc-guide" aria-labelledby="page-title">
      <GuideHead eyebrow="Thema’s" title="Rollen, geen kleuren." lead="Componenten kennen alleen rollen zoals tekst, actie en focus. Een thema is een nieuwe waarde voor een paar rollen, en dezelfde contrastcheck als de build zegt of hij leesbaar blijft." />

      <GuideSection id="licht-donker" title="Licht, donker en systeem">
        <Text tone="muted"><code>theme="system"</code> volgt de instelling van het apparaat. Je kunt ook binnen een pagina wisselen: elke <code>Papier</code> zet zijn eigen thema.</Text>
        <div className="doc-themes">
          {(['light', 'dark'] as const).map((t) => (
            <Papier key={t} theme={t} className="doc-themes__item">
              <Text variant="label" as="p">{t === 'light' ? 'Licht' : 'Donker'}</Text>
              <div className="doc-row"><Button size="sm">Opslaan</Button><Button size="sm" variant="secondary">Later</Button></div>
              <Switch label="Geluid" defaultChecked />
            </Papier>
          ))}
        </div>
        <CodeBlock label="Thema kiezen" code={`<Papier theme="system">…</Papier>   // of "light" en "dark"`} />
      </GuideSection>

      <GuideSection id="eigen-thema" title="Een eigen thema">
        <Text tone="muted"><code>themeStyle</code> zet rollen als CSS-variabelen, <code>checkTheme</code> legt ze langs de 26 contrastparen. Zet die check in een test, dan kan geen merkkleur tekst onleesbaar maken.</Text>
        <CodeBlock label="Eigen thema en test" code={`import { Papier, themeStyle, checkTheme } from '@dionbm/papier';

const merk = { action: '#1f4e8c', 'action-hover': '#183d6e', 'on-action': '#ffffff' };
<Papier theme="light" style={themeStyle(merk)}>…</Papier>

expect(checkTheme(merk).filter((r) => !r.ok)).toEqual([]);

/* Voor licht én donker in je eigen CSS */
[data-papier-theme="dark"] { --papier-color-action: #9cc0ff; }`} />
      </GuideSection>

      <GuideSection id="speeltuin" title="Probeer een merkkleur">
        <Text tone="muted">Kies kleuren: de componenten hieronder gebruiken ze meteen, en de check meldt welke paren te weinig contrast hebben. Probeer maar eens een lichtgele actie.</Text>
        <ThemePlayground />
      </GuideSection>

      <GuideSection id="beweging" title="Minder beweging">
        <Text tone="muted">Elke overgang heeft een eindtoestand die direct bereikbaar is. De OS-instelling zet alle duren op 0, en <code>motion="reduced"</code> doet dat ook voor één <code>Papier</code>, zoals de schakelaar rechtsboven op deze site.</Text>
        <CodeBlock label="Minder beweging" code={`<Papier motion="reduced">…</Papier>`} />
      </GuideSection>
    </article>
  );
}
