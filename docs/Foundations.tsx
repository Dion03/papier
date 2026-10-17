import { useState } from 'react';
import { Button, Surface, Tag, Text } from '@dionbm/papier';
import { themes, type as typeScale, space, radius, motion } from '../src/tokens/tokens.mjs';
import { pairs } from '../src/tokens/pairs.mjs';
import { contrast } from '../src/tokens/contrast.mjs';

type ThemeName = 'light' | 'dark';
type Palette = Record<string, string>;

const swatchGroups: Array<{ title: string; roles: string[] }> = [
  { title: 'Ondergrond', roles: ['bg', 'surface', 'surface-sunken', 'line'] },
  { title: 'Inkt', roles: ['text', 'text-muted', 'line-strong', 'action-strong'] },
  { title: 'Accent en actie', roles: ['accent', 'accent-text', 'action', 'focus'] },
  { title: 'Materialen', roles: ['sage', 'sage-soft', 'coral', 'on-sage'] },
  { title: 'Status', roles: ['success', 'warning', 'danger', 'danger-soft'] },
];

const typeSamples: Record<string, string> = {
  display: 'Papier.', headline: 'Eén wereld.', title: 'Werk dat je kunt proberen', subtitle: 'Warm papier en tastbare interfaces',
  'body-lg': 'Introducties en uitleg die rustig leest.', body: 'Lopende tekst in DM Sans met een open regelafstand.',
  control: 'Bediening', small: 'Toelichting en metadata', label: 'LABEL · 13 PX',
};

function Swatches({ palette }: { palette: Palette }) {
  return (
    <div className="doc-swatch-groups">
      {swatchGroups.map((g) => (
        <div key={g.title} className="doc-swatch-group">
          <Text variant="label" as="h3">{g.title}</Text>
          <ul className="doc-swatches">
            {g.roles.map((role) => (
              <li key={role} className="doc-swatch">
                <span className="doc-swatch__chip" style={{ background: palette[role] }} aria-hidden="true" />
                <span className="doc-swatch__name"><code>--papier-color-{role}</code></span>
                <span className="doc-swatch__hex">{palette[role]}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ContrastTable({ palette, theme }: { palette: Palette; theme: ThemeName }) {
  return (
    <div className="doc-table-wrap" tabIndex={0} role="region" aria-label={`Contrasttabel ${theme === 'light' ? 'licht' : 'donker'}`}>
      <table className="doc-contrast">
        <caption className="pp-visually-hidden">Contrast van elk tekst- en bedieningspaar volgens WCAG 2.2</caption>
        <thead><tr><th scope="col">Voorbeeld</th><th scope="col">Gebruik</th><th scope="col">Paar</th><th scope="col">Ratio</th><th scope="col">Eis</th></tr></thead>
        <tbody>
          {(pairs as Array<[string, string, number, string]>).map(([fg, bg, min, use]) => {
            const r = contrast(palette[fg], palette[bg]);
            return (
              <tr key={`${fg}-${bg}`}>
                <td>{min < 4.5
                  ? <span className="doc-contrast__sample" style={{ background: palette[bg] }} aria-hidden="true"><span className="doc-contrast__mark" style={{ borderColor: palette[fg] }} /></span>
                  : <span className="doc-contrast__sample" style={{ color: palette[fg], background: palette[bg] }} aria-hidden="true">Aa</span>}</td>
                <td>{use}</td>
                <td><code>{fg}</code> op <code>{bg}</code></td>
                <td className="doc-num">{r.toFixed(2)}</td>
                <td>{r >= min ? <Tag tone="sage">≥ {min} gehaald</Tag> : <Tag tone="accent">onder {min}</Tag>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MotionDemo() {
  const [run, setRun] = useState(0);
  const rows: Array<[string, string, string]> = [
    ['dur-press', motion['dur-press'], 'Indrukken'],
    ['dur-color', motion['dur-color'], 'Kleur en materiaal'],
    ['dur-close', motion['dur-close'], 'Dichtvouwen'],
    ['dur-open', motion['dur-open'], 'Ontvouwen en schuiven'],
  ];
  return (
    <Surface material="sunken" padding="lg" className="doc-motion">
      <div className="doc-motion__rows" data-run={run % 2}>
        {rows.map(([name, dur, use]) => (
          <div key={name} className="doc-motion__row">
            <span className="doc-motion__label"><code>--papier-{name}</code> <span>{dur} · {use}</span></span>
            <span className="doc-motion__lane"><span className="doc-motion__dot" style={{ transitionDuration: `var(--papier-${name})` }} /></span>
          </div>
        ))}
      </div>
      <div className="doc-row">
        <Button size="sm" variant="ink" onClick={() => setRun((r) => r + 1)}>Speel de curves af</Button>
        <Text variant="small" tone="muted">Alles gebruikt de aankomstcurve <code>{motion['ease-arrive']}</code>. Bij minder beweging staan alle duren op 0.</Text>
      </div>
    </Surface>
  );
}

export function Foundations({ theme }: { theme: ThemeName }) {
  const palette = themes[theme] as unknown as Palette;
  return (
    <article id="fundament" className="doc-page doc-guide" aria-labelledby="page-title">
      <div className="doc-page__head">
        <Text variant="label" as="p" className="doc-eyebrow">Fundament</Text>
        <Text variant="headline" as="h1" id="page-title" tabIndex={-1} className="doc-page__title">Eén bron, elke vorm.</Text>
        <Text variant="body-lg" tone="muted">
          Alle waarden staan in één bestand. Een script maakt er CSS-variabelen en JSON van, en een tweede script controleert bij elke build of elk paar leesbaar blijft. Dezelfde berekening vult de tabel hieronder.
        </Text>
      </div>

      <div className="doc-block" id="kleur">
        <Text variant="title" as="h2">Kleur en contrast</Text>
        <Text tone="muted" className="doc-block__intro">Je ziet nu het {theme === 'light' ? 'lichte' : 'donkere'} thema. Componenten gebruiken alleen rollen, nooit hexwaarden, dus een thema is een nieuwe set rollen.</Text>
        <Swatches palette={palette} />
        <ContrastTable palette={palette} theme={theme} />
      </div>

      <div className="doc-block" id="typografie">
        <Text variant="title" as="h2">Typografie</Text>
        <Text tone="muted" className="doc-block__intro">Manrope draagt de koppen, DM Sans de uitleg. Beide lokaal als variabel font, onder de OFL-licentie.</Text>
        <ul className="doc-type">
          {Object.entries(typeScale).map(([role, [size, line, weight]]) => (
            <li key={role} className="doc-type__row">
              <span className="doc-type__meta"><code>{role}</code><span>{size.replace('clamp(', '').replace(')', '').split(',').pop()?.trim()} · {line} · {weight}</span></span>
              <Text variant={role === 'control' ? 'body' : (role as never)} as="span" className="doc-type__sample" style={role === 'control' ? { font: `var(--papier-type-control-weight) var(--papier-type-control-size)/1 var(--papier-font-body)` } : undefined}>
                {typeSamples[role]}
              </Text>
            </li>
          ))}
        </ul>
      </div>

      <div className="doc-block doc-grid-2" id="ruimte">
        <div>
          <Text variant="title" as="h2">Ruimte</Text>
          <ul className="doc-space">
            {Object.entries(space).filter(([k]) => k !== '0').map(([k, v]) => (
              <li key={k}><code>space-{k}</code><span className="doc-space__bar" style={{ width: v }} /><span className="doc-num">{v}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <Text variant="title" as="h2">Vorm</Text>
          <ul className="doc-radius">
            {Object.entries(radius).map(([k, v]) => (
              <li key={k}><span className="doc-radius__box" style={{ borderRadius: v }} /><code>radius-{k}</code><span className="doc-num">{v}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="doc-block" id="beweging">
        <Text variant="title" as="h2">Beweging</Text>
        <Text tone="muted" className="doc-block__intro">Korte reacties met één aankomstcurve. Beweging ondersteunt de volgorde; zonder animatie blijft alles bruikbaar.</Text>
        <MotionDemo />
      </div>
    </article>
  );
}
