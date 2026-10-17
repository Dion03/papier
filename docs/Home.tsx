import { useState } from 'react';
import { Button, Kbd, Link, SegmentedControl, Slider, Surface, Switch, Tag, Text, icons } from '@dionbm/papier';
import { CodeBlock } from './CodeBlock';
import { Explorer, PageCard } from './Explorer';
import { pages } from './registry';
import { href } from './router';

const exportCount = new Set(pages.flatMap((p) => p.exports).filter((e) => /^[A-Z]/.test(e))).size;

/** The hero: Papier components laid out as objects on paper, all of them live. */
function Constellation() {
  const [period, setPeriod] = useState('week');
  const [on, setOn] = useState(true);
  const [vol, setVol] = useState(64);
  return (
    <div className="doc-constellation" aria-label="Example: Papier components as objects" role="group">
      <Surface material="sage" elevation="object" className="doc-obj doc-obj--a">
        <Text variant="label" as="p">Period</Text>
        <SegmentedControl label="Period" size="sm" value={period} onValueChange={setPeriod}
          options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]} />
      </Surface>
      <Surface material="coral" elevation="object" className="doc-obj doc-obj--b">
        <Switch label="Sound" checked={on} onCheckedChange={setOn} />
      </Surface>
      <Surface material="paper" elevation="object" className="doc-obj doc-obj--c">
        <Slider label="Volume" value={vol} onValueChange={setVol} formatValue={(v) => `${v}%`} />
      </Surface>
      <Surface material="ink" elevation="object" className="doc-obj doc-obj--d">
        <span className="doc-obj__count">{exportCount}</span>
        <Text variant="small" as="p">components and parts, tested with axe in light and dark</Text>
      </Surface>
      <div className="doc-obj doc-obj--e doc-disc" aria-hidden="true"><span /></div>
    </div>
  );
}

const principles = [
  ['Native first', 'A button is a button, an expander a details, a window a dialog. Papier styles what the browser already does well and only fills in where needed.'],
  ['Objects, not decoration', 'Depth and material are for things you operate. Reading text and navigation stay flat and calm on paper.'],
  ['Roles, not colours', 'Components only know roles such as text, action and focus. A theme is a new set of roles that meets the same contrast requirements.'],
  ['Motion is optional', 'Every transition has an end state you can reach at once. Reduced motion sets every duration to zero; nothing disappears.'],
];

export function Home({ onSearch, shortcut }: { onSearch: () => void; shortcut: string }) {
  const popular = pages.filter((p) => p.popular);
  return (
    <div className="doc-home">
      <section className="doc-hero" aria-labelledby="page-title">
        <div className="doc-hero__copy">
          <Tag tone="outline">Design system · React 18 and 19 · MIT</Tag>
          <Text variant="display" as="h1" id="page-title" tabIndex={-1}>Papier<span className="doc-accent">.</span></Text>
          <Text variant="body-lg" tone="muted" className="doc-hero__lead">
            Warm paper, ink, vermilion and sage as accessible React components. Native where possible, tested where it matters, with tokens that check themselves.
          </Text>
          <div className="doc-row">
            <Button asChild variant="ink" size="lg" iconEnd={<icons.ArrowRight className="pp-flip-rtl" />}><a href={href('getting-started')}>Get started</a></Button>
            <Button asChild variant="secondary" size="lg"><a href={href('components')}>Components</a></Button>
          </div>
          <button type="button" className="doc-hero__search" onClick={onSearch}>
            <icons.Search width={16} height={16} />
            <span>Search for a component or topic</span>
            <span className="doc-hero__keys" aria-hidden="true">{shortcut.split(' ').map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </button>
        </div>
        <Constellation />
      </section>

      <section className="doc-band" aria-label="Papier in numbers">
        <dl className="doc-stats">
          <div><dt>Components and parts</dt><dd>{exportCount}</dd></div>
          <div><dt>Contrast pairs per theme</dt><dd>26</dd></div>
          <div><dt>axe violations, light and dark</dt><dd>0</dd></div>
          <div><dt>Runtime dependencies</dt><dd>0</dd></div>
        </dl>
      </section>

      <section className="doc-home__section" aria-labelledby="principles-title">
        <div className="doc-home__head">
          <Text variant="label" as="p" className="doc-eyebrow">Principles</Text>
          <Text variant="headline" as="h2" id="principles-title">Made to be touched.</Text>
        </div>
        <ol className="doc-principles">
          {principles.map(([t, d]) => <li key={t}><Text variant="subtitle" as="h3">{t}</Text><Text tone="muted">{d}</Text></li>)}
        </ol>
      </section>

      <section className="doc-home__section" aria-labelledby="start-title">
        <div className="doc-home__head">
          <Text variant="label" as="p" className="doc-eyebrow">Start here</Text>
          <Text variant="headline" as="h2" id="start-title">From npm install to your own theme.</Text>
        </div>
        <div className="doc-start">
          <div className="doc-start__code">
            <CodeBlock label="Install command" code="npm install @dionbm/papier" />
            <CodeBlock label="First component" code={`import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier, Button } from '@dionbm/papier';

<Papier theme="system">
  <Button>Save</Button>
</Papier>`} />
          </div>
          <ul className="doc-guides">
            {[
              { to: href('getting-started'), title: 'Getting started', text: 'Installing, Next.js, router links, Tailwind and languages.', icon: <icons.ArrowRight /> },
              { to: href('theming'), title: 'Theming', text: 'Light, dark and a brand colour with a live contrast check.', icon: <icons.Sun /> },
              { to: href('foundations'), title: 'Foundations', text: 'Colour, type, space, shape and motion as tokens.', icon: <icons.Copy /> },
            ].map((g) => (
              <li key={g.title}>
                <a href={g.to} className="doc-guide-link">
                  <span className="doc-guide-link__icon" aria-hidden="true">{g.icon}</span>
                  <span className="doc-guide-link__title">{g.title}</span>
                  <span className="doc-guide-link__text">{g.text}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="doc-home__section" aria-labelledby="popular-title">
        <div className="doc-home__head doc-home__head--row">
          <div>
            <Text variant="label" as="p" className="doc-eyebrow">Popular</Text>
            <Text variant="headline" as="h2" id="popular-title">Where most apps start.</Text>
          </div>
          <Link href={href('components')} variant="arrow">All components</Link>
        </div>
        <ul className="doc-cards">{popular.map((p) => <PageCard key={p.slug} page={p} />)}</ul>
      </section>

      <section className="doc-home__section" aria-labelledby="all-title">
        <div className="doc-home__head">
          <Text variant="label" as="p" className="doc-eyebrow">Explore</Text>
          <Text variant="headline" as="h2" id="all-title">Everything, by kind.</Text>
        </div>
        <Explorer headingLevel={3} />
      </section>
    </div>
  );
}
