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
        <span className="doc-obj__count">{exportCount}</span>
        <Text variant="small" as="p">componenten en onderdelen, getest met axe in licht en donker</Text>
      </Surface>
      <div className="doc-obj doc-obj--e doc-disc" aria-hidden="true"><span /></div>
    </div>
  );
}

const principles = [
  ['Native eerst', 'Een knop is een button, een uitklapper een details, een venster een dialog. Papier stijlt wat de browser al goed doet en vult alleen aan waar nodig.'],
  ['Object, geen decoratie', 'Diepte en materiaal zijn voor dingen die je bedient. Leestekst en navigatie blijven vlak en rustig op papier.'],
  ['Rollen, geen kleuren', 'Componenten kennen alleen rollen zoals tekst, actie en focus. Een thema is een nieuwe set rollen die dezelfde contrasteisen haalt.'],
  ['Beweging is optioneel', 'Elke overgang heeft een eindtoestand die direct bereikbaar is. Minder beweging zet alle duren op nul, niets verdwijnt.'],
];

export function Home({ onSearch, shortcut }: { onSearch: () => void; shortcut: string }) {
  const popular = pages.filter((p) => p.popular);
  return (
    <div className="doc-home">
      <section className="doc-hero" aria-labelledby="page-title">
        <div className="doc-hero__copy">
          <Tag tone="outline">Design system · React 18 en 19 · MIT</Tag>
          <Text variant="display" as="h1" id="page-title" tabIndex={-1}>Papier<span className="doc-accent">.</span></Text>
          <Text variant="body-lg" tone="muted" className="doc-hero__lead">
            Warm papier, inkt, vermiljoen en salie als toegankelijke React-componenten. Native waar het kan, getest waar het moet, met tokens die zichzelf controleren.
          </Text>
          <div className="doc-row">
            <Button asChild variant="ink" size="lg" iconEnd={<icons.ArrowRight className="pp-flip-rtl" />}><a href={href('start')}>Aan de slag</a></Button>
            <Button asChild variant="secondary" size="lg"><a href={href('componenten')}>Componenten</a></Button>
          </div>
          <button type="button" className="doc-hero__search" onClick={onSearch}>
            <icons.Search width={16} height={16} />
            <span>Zoek een component of onderwerp</span>
            <span className="doc-hero__keys" aria-hidden="true">{shortcut.split(' ').map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
          </button>
        </div>
        <Constellation />
      </section>

      <section className="doc-band" aria-label="Papier in getallen">
        <dl className="doc-stats">
          <div><dt>Componenten en onderdelen</dt><dd>{exportCount}</dd></div>
          <div><dt>Contrastparen per thema</dt><dd>26</dd></div>
          <div><dt>axe-fouten, licht en donker</dt><dd>0</dd></div>
          <div><dt>Runtime-afhankelijkheden</dt><dd>0</dd></div>
        </dl>
      </section>

      <section className="doc-home__section" aria-labelledby="principes-title">
        <div className="doc-home__head">
          <Text variant="label" as="p" className="doc-eyebrow">Principes</Text>
          <Text variant="headline" as="h2" id="principes-title">Gemaakt om aan te raken.</Text>
        </div>
        <ol className="doc-principles">
          {principles.map(([t, d]) => <li key={t}><Text variant="subtitle" as="h3">{t}</Text><Text tone="muted">{d}</Text></li>)}
        </ol>
      </section>

      <section className="doc-home__section" aria-labelledby="begin-title">
        <div className="doc-home__head">
          <Text variant="label" as="p" className="doc-eyebrow">Begin hier</Text>
          <Text variant="headline" as="h2" id="begin-title">Van npm install tot eigen thema.</Text>
        </div>
        <div className="doc-start">
          <div className="doc-start__code">
            <CodeBlock label="Installatieopdracht" code="npm install @dionbm/papier" />
            <CodeBlock label="Eerste component" code={`import '@dionbm/papier/fonts.css';
import '@dionbm/papier/papier.css';
import { Papier, Button } from '@dionbm/papier';

<Papier theme="system">
  <Button>Opslaan</Button>
</Papier>`} />
          </div>
          <ul className="doc-guides">
            {[
              { to: href('start'), title: 'Aan de slag', text: 'Installeren, Next.js, router-links, Tailwind en talen.', icon: <icons.ArrowRight /> },
              { to: href('thema'), title: 'Thema’s', text: 'Licht, donker en een merkkleur met live contrastcheck.', icon: <icons.Sun /> },
              { to: href('fundament'), title: 'Fundament', text: 'Kleur, type, ruimte, vorm en beweging als tokens.', icon: <icons.Copy /> },
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

      <section className="doc-home__section" aria-labelledby="populair-title">
        <div className="doc-home__head doc-home__head--row">
          <div>
            <Text variant="label" as="p" className="doc-eyebrow">Populair</Text>
            <Text variant="headline" as="h2" id="populair-title">Waar de meeste apps mee beginnen.</Text>
          </div>
          <Link href={href('componenten')} variant="arrow">Alle componenten</Link>
        </div>
        <ul className="doc-cards">{popular.map((p) => <PageCard key={p.slug} page={p} />)}</ul>
      </section>

      <section className="doc-home__section" aria-labelledby="alles-title">
        <div className="doc-home__head">
          <Text variant="label" as="p" className="doc-eyebrow">Verkennen</Text>
          <Text variant="headline" as="h2" id="alles-title">Alles, per soort.</Text>
        </div>
        <Explorer headingLevel={3} />
      </section>
    </div>
  );
}
