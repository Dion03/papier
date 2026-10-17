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

const ticks = (lines: ReactNode[]) => (
  <ul className="doc-a11y">{lines.map((l, i) => <li key={i}><icons.Check width={16} height={16} />{l}</li>)}</ul>
);

export function StartGuide() {
  return (
    <article className="doc-page doc-guide" aria-labelledby="page-title">
      <GuideHead eyebrow="Getting started" title="On paper in three lines." lead="Papier is an npm package with React components, one CSS file and the tokens. No provider tree, no build plugin, no runtime styling." />

      <Steps className="doc-guide__steps" current={3} label="Steps to get started" items={[
        { title: 'Install', description: 'npm install' }, { title: 'Import the CSS', description: 'fonts and papier.css' }, { title: 'Wrap in Papier', description: 'theme and labels' }, { title: 'Build', description: 'components' },
      ]} />

      <GuideSection id="installation" title="Installation">
        <Text tone="muted">React 18 or 19 is a peer dependency. The fonts (Manrope and DM Sans) ship as variable fonts.</Text>
        <CodeBlock label="Install command" code="npm install @dionbm/papier" />
        <CodeBlock label="Import the CSS" code={`import '@dionbm/papier/fonts.css';   // Manrope and DM Sans
import '@dionbm/papier/papier.css';  // tokens, base and every component`} />
      </GuideSection>

      <GuideSection id="first-screen" title="Your first screen">
        <Text tone="muted"><code>Papier</code> sets the theme, the typography and the labels. <code>ToastProvider</code> is only needed if you use toasts.</Text>
        <CodeBlock label="First component" code={`import { Papier, ToastProvider, Button } from '@dionbm/papier';

export function App() {
  return (
    <Papier theme="system">
      <ToastProvider>
        <Button>Save</Button>
      </ToastProvider>
    </Papier>
  );
}`} />
        <Text tone="muted">Then browse the <Link href={href('components')}>components</Link>, or search for one with <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>.</Text>
      </GuideSection>

      <GuideSection id="nextjs" title="Next.js and server components">
        <Text tone="muted">The build has one file per module. Only modules with hooks, context or events start with <code>'use client'</code>. Text, Stack, Container, Surface, Tag, Table, Skeleton, Separator, Kbd, EmptyState, the icons and the theme functions stay server components and add no JavaScript to your page.</Text>
        <CodeBlock label="Next.js layout" code={`// app/layout.tsx
import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier } from '@dionbm/papier';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Papier theme="system">{children}</Papier></body></html>;
}`} />
      </GuideSection>

      <GuideSection id="router-links" title="Router links with asChild">
        <Text tone="muted">With <code>asChild</code>, Button, IconButton, Link and BreadcrumbItem render their only child. The Link from Next.js or React Router gets the Papier look and stays a real link.</Text>
        <CodeBlock label="asChild with Next.js" code={`import NextLink from 'next/link';

<Button asChild variant="ink" iconEnd={<icons.ArrowRight />}>
  <NextLink href="/work">View the work</NextLink>
</Button>`} />
      </GuideSection>

      <GuideSection id="css" title="CSS, @layer and Tailwind">
        <Text tone="muted">All of Papier’s CSS lives in <code>@layer papier</code>, so your own unlayered styles always win, without a specificity fight.</Text>
        <CodeBlock label="Your own CSS and Tailwind 4" code={`.pp-button { border-radius: 8px; }            /* beats Papier */
:root { --papier-color-accent: #d6452a; }      /* overrides a token */

/* Tailwind 4: utilities beat Papier, Papier beats the base */
@layer theme, base, papier, components, utilities;`} />
      </GuideSection>

      <GuideSection id="languages" title="Text and languages">
        <Text tone="muted">Built-in labels are Dutch by default and can be replaced per app. <code>englishLabels</code> ships with the package, and this site uses it. <code>locale</code> also decides how numbers, dates and file sizes are formatted.</Text>
        <CodeBlock label="English labels" code={`import { Papier, englishLabels } from '@dionbm/papier';

<Papier labels={{ ...englishLabels, locale: 'en-GB' }}>…</Papier>
<Papier labels={{ pageOf: (p, n) => \`\${p} / \${n}\` }}>…</Papier>`} />
      </GuideSection>

      <GuideSection id="rtl" title="Right to left">
        <Text tone="muted">Set <code>dir="rtl"</code> on <code>&lt;html&gt;</code> or on <code>&lt;Papier&gt;</code>. Papier uses logical CSS: alignment, menus, sliders and arrows follow. Give your own directional icons <code>className="pp-flip-rtl"</code>.</Text>
      </GuideSection>

      <GuideSection id="quality" title="How it is tested">
        {ticks([
          'axe with no violations for every component, in light and dark, open overlays included.',
          'Behaviour tests for keyboard, focus and ARIA, and a server render test without window.',
          'A contrast check on 26 pairs per theme that fails the build.',
          'Playwright in Chromium, Firefox, WebKit and mobile: axe, high contrast, right to left, real clicks and screenshots.',
          'The API tables come from the TypeScript types; npm run check fails when they fall behind.',
          'A manual screen reader pass with NVDA and VoiceOver before every minor release.',
        ])}
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
        {color('Action', action, setAction)}
        {color('Text on action', onAction, setOnAction)}
        {color('Accent and focus', accent, setAccent)}
        <Button size="sm" variant="ghost" onClick={() => { const d = themeColors('light'); setAction(d.action); setOnAction(d['on-action']); setAccent(d.accent); }}>Back to Papier</Button>
      </div>
      <Papier theme="light" style={themeStyle(brand)} className="doc-playground__preview">
        <Surface material="paper" elevation="raised" padding="md" className="doc-stack">
          <div className="doc-row"><Button>Save</Button><Button variant="secondary">Cancel</Button></div>
          <Switch label="Notifications" defaultChecked />
          <Checkbox label="Remember me" defaultChecked />
          <Progress label="Uploading" value={64} />
          <Link href="#/theming/playground">An accent link</Link>
        </Surface>
      </Papier>
      <div className="doc-playground__result">
        {failing.length === 0
          ? <Notice tone="success" title="All 26 contrast pairs pass">These colours are safe to use.</Notice>
          : <Notice tone="warning" title={`${failing.length} of 26 pairs too low`}>
              <ul className="doc-fail-list">{failing.map((r) => <li key={`${r.foreground}-${r.background}`}><code>{r.foreground}</code> on <code>{r.background}</code>: {r.ratio.toFixed(2)} (minimum {r.minimum}) · {r.use}</li>)}</ul>
            </Notice>}
        <CodeBlock label="Code for this theme" code={code} />
        {!hex.test(action) && <Tag tone="accent">Only #rrggbb is measured</Tag>}
      </div>
    </div>
  );
}

export function ThemeGuide() {
  return (
    <article className="doc-page doc-guide" aria-labelledby="page-title">
      <GuideHead eyebrow="Theming" title="Roles, not colours." lead="Components only know roles such as text, action and focus. A theme is a new value for a few roles, and the same contrast check as the build tells you whether it stays readable." />

      <GuideSection id="light-dark" title="Light, dark and system">
        <Text tone="muted"><code>theme="system"</code> follows the device setting. You can also switch within a page: every <code>Papier</code> sets its own theme.</Text>
        <div className="doc-themes">
          {(['light', 'dark'] as const).map((t) => (
            <Papier key={t} theme={t} className="doc-themes__item">
              <Text variant="label" as="p">{t === 'light' ? 'Light' : 'Dark'}</Text>
              <div className="doc-row"><Button size="sm">Save</Button><Button size="sm" variant="secondary">Later</Button></div>
              <Switch label="Sound" defaultChecked />
            </Papier>
          ))}
        </div>
        <CodeBlock label="Choose a theme" code={`<Papier theme="system">…</Papier>   // or "light" and "dark"`} />
      </GuideSection>

      <GuideSection id="custom-theme" title="A custom theme">
        <Text tone="muted"><code>themeStyle</code> sets roles as CSS variables, and <code>checkTheme</code> measures them against the 26 contrast pairs. Put that check in a test and no brand colour can make text unreadable.</Text>
        <CodeBlock label="Custom theme and test" code={`import { Papier, themeStyle, checkTheme } from '@dionbm/papier';

const brand = { action: '#1f4e8c', 'action-hover': '#183d6e', 'on-action': '#ffffff' };
<Papier theme="light" style={themeStyle(brand)}>…</Papier>

expect(checkTheme(brand).filter((r) => !r.ok)).toEqual([]);

/* For light and dark in your own CSS */
[data-papier-theme="dark"] { --papier-color-action: #9cc0ff; }`} />
      </GuideSection>

      <GuideSection id="playground" title="Try a brand colour">
        <Text tone="muted">Pick colours: the components below use them straight away, and the check reports which pairs lack contrast. Try a light yellow action, for instance.</Text>
        <ThemePlayground />
      </GuideSection>

      <GuideSection id="motion" title="Reduced motion">
        <Text tone="muted">Every transition has an end state you can reach at once. The OS setting sets every duration to 0, and <code>motion="reduced"</code> does the same for one <code>Papier</code>, like the toggle at the top right of this site.</Text>
        <CodeBlock label="Reduced motion" code={`<Papier motion="reduced">…</Papier>`} />
      </GuideSection>
    </article>
  );
}

export function StabilityGuide() {
  return (
    <article className="doc-page doc-guide" aria-labelledby="page-title">
      <GuideHead eyebrow="Stability" title="What a version number promises." lead="Papier follows semantic versioning. Before 1.0 a minor release may still change the API, but every change is listed in the changelog with a migration note. From 1.0, everything below is a promise." />

      <GuideSection id="public-api" title="What the public API is">
        <Text tone="muted">These parts are covered: changing or removing them is a breaking change.</Text>
        {ticks([
          <>Every export of <code>@dionbm/papier</code>, its props and their types, and the files <code>papier.css</code>, <code>fonts.css</code> and <code>tokens.css</code>.</>,
          <>Every <code>--papier-*</code> custom property: its name and its role. Values may be tuned, for example a shade that improves contrast.</>,
          <>The <code>pp-*</code> class names and <code>data-*</code> attributes on component roots, so your own CSS can target them.</>,
          <>Keyboard behaviour, focus order and the roles and names screen readers hear.</>,
          <>The label keys in <code>dutchLabels</code> and <code>englishLabels</code>. A new label is a minor change; it gets a Dutch and an English default.</>,
        ])}
        <Text tone="muted">Not covered: inner class names (<code>pp-button__icon</code> and the like), the DOM structure inside a component, exact pixel values, animation timing and anything under <code>docs/</code>. Use the documented props and tokens instead.</Text>
      </GuideSection>

      <GuideSection id="versions" title="Versions and releases">
        {ticks([
          'Patch (0.6.1): bug fixes, accessibility fixes and documentation. Always safe to update.',
          'Minor (0.7.0): new components, props, tokens and labels. Before 1.0 a minor release can also contain breaking changes; they are marked in the changelog.',
          'Major (2.0.0, after 1.0): breaking changes only, each with a migration note.',
          'Every release is published from CI with npm provenance, and its notes come from CHANGELOG.md.',
        ])}
      </GuideSection>

      <GuideSection id="deprecations" title="Deprecations">
        <Text tone="muted">A prop or export that will go away is first marked <code>@deprecated</code> in the types, so your editor strikes it through, and keeps working for at least one minor release. It is removed in the next major release. In 0.6, <code>onChange</code> on Combobox and MultiCombobox became <code>onValueChange</code>, the name every other Papier input uses; the old name still works until 1.0.</Text>
        <CodeBlock label="Migrating to onValueChange" code={`// Before
<Combobox label="Artist" options={options} onChange={(value) => setArtist(value)} />

// From 0.6
<Combobox label="Artist" options={options} onValueChange={(value) => setArtist(value)} />`} />
      </GuideSection>

      <GuideSection id="browsers" title="Supported browsers">
        <Text tone="muted">Papier supports the last two major versions of Chrome, Edge, Firefox and Safari, on desktop and mobile. The CSS needs <code>@layer</code>, <code>:has()</code> and <code>color-mix()</code>, which sets the floor at Chrome and Edge 111, Firefox 121 and Safari 16.4.</Text>
        {ticks([
          <>Menu, Tooltip and Popover use the Popover API for the top layer. Without it, they fall back to a fixed panel with a <code>z-index</code> that works the same.</>,
          <>Dialog, AlertDialog and Sheet use the native <code>&lt;dialog&gt;</code> element.</>,
          <>Enhancements such as <code>text-wrap: balance</code> and <code>@starting-style</code> are progressive: older browsers just skip them.</>,
          'Every pull request runs the end-to-end tests in Chromium, Firefox, WebKit and a mobile viewport.',
        ])}
      </GuideSection>

      <GuideSection id="road-to-1" title="On the way to 1.0">
        <Text tone="muted">1.0 comes when the API has been stable for a while in real apps. The remaining decisions are which language the built-in labels default to and the removal of the deprecated names above. Follow the changelog on <Link href="https://github.com/Dion03/papier/blob/main/CHANGELOG.md">GitHub</Link>.</Text>
      </GuideSection>
    </article>
  );
}
