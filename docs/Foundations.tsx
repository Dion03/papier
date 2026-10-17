import { useState } from 'react';
import { Button, Surface, Tag, Text } from '@dionbm/papier';
import { themes, type as typeScale, space, radius, motion } from '../src/tokens/tokens.mjs';
import { pairs } from '../src/tokens/pairs.mjs';
import { contrast } from '../src/tokens/contrast.mjs';

type ThemeName = 'light' | 'dark';
type Palette = Record<string, string>;

const swatchGroups: Array<{ title: string; roles: string[] }> = [
  { title: 'Ground', roles: ['bg', 'surface', 'surface-sunken', 'line'] },
  { title: 'Ink', roles: ['text', 'text-muted', 'line-strong', 'action-strong'] },
  { title: 'Accent and action', roles: ['accent', 'accent-text', 'action', 'focus'] },
  { title: 'Materials', roles: ['sage', 'sage-soft', 'coral', 'on-sage'] },
  { title: 'Status', roles: ['success', 'warning', 'danger', 'danger-soft'] },
];

const typeSamples: Record<string, string> = {
  display: 'Papier.', headline: 'One world.', title: 'Work you can try', subtitle: 'Warm paper and tactile interfaces',
  'body-lg': 'Introductions and explanations that read calmly.', body: 'Running text in DM Sans with open line spacing.',
  control: 'Controls', small: 'Notes and metadata', label: 'LABEL · 13 PX',
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
    <div className="doc-table-wrap" tabIndex={0} role="region" aria-label={`Contrast table, ${theme}`}>
      <table className="doc-contrast">
        <caption className="pp-visually-hidden">Contrast of every text and control pair under WCAG 2.2</caption>
        <thead><tr><th scope="col">Sample</th><th scope="col">Use</th><th scope="col">Pair</th><th scope="col">Ratio</th><th scope="col">Requirement</th></tr></thead>
        <tbody>
          {(pairs as Array<[string, string, number, string]>).map(([fg, bg, min, use]) => {
            const r = contrast(palette[fg], palette[bg]);
            return (
              <tr key={`${fg}-${bg}`}>
                <td>{min < 4.5
                  ? <span className="doc-contrast__sample" style={{ background: palette[bg] }} aria-hidden="true"><span className="doc-contrast__mark" style={{ borderColor: palette[fg] }} /></span>
                  : <span className="doc-contrast__sample" style={{ color: palette[fg], background: palette[bg] }} aria-hidden="true">Aa</span>}</td>
                <td>{use}</td>
                <td><code>{fg}</code> on <code>{bg}</code></td>
                <td className="doc-num">{r.toFixed(2)}</td>
                <td>{r >= min ? <Tag tone="sage">≥ {min} passes</Tag> : <Tag tone="accent">below {min}</Tag>}</td>
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
    ['dur-press', motion['dur-press'], 'Press'],
    ['dur-color', motion['dur-color'], 'Colour and material'],
    ['dur-close', motion['dur-close'], 'Fold closed'],
    ['dur-open', motion['dur-open'], 'Unfold and slide'],
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
        <Button size="sm" variant="ink" onClick={() => setRun((r) => r + 1)}>Play the curves</Button>
        <Text variant="small" tone="muted">Everything uses the arrival curve <code>{motion['ease-arrive']}</code>. With reduced motion every duration is 0.</Text>
      </div>
    </Surface>
  );
}

export function Foundations({ theme }: { theme: ThemeName }) {
  const palette = themes[theme] as unknown as Palette;
  return (
    <article id="foundations" className="doc-page doc-guide" aria-labelledby="page-title">
      <div className="doc-page__head">
        <Text variant="label" as="p" className="doc-eyebrow">Foundations</Text>
        <Text variant="headline" as="h1" id="page-title" tabIndex={-1} className="doc-page__title">One source, every form.</Text>
        <Text variant="body-lg" tone="muted">
          Every value lives in one file. A script turns it into CSS variables and JSON, and a second script checks on every build that each pair stays readable. The same calculation fills the table below.
        </Text>
      </div>

      <div className="doc-block" id="color">
        <Text variant="title" as="h2">Colour and contrast</Text>
        <Text tone="muted" className="doc-block__intro">You are looking at the {theme} theme. Components only use roles, never hex values, so a theme is a new set of roles.</Text>
        <Swatches palette={palette} />
        <ContrastTable palette={palette} theme={theme} />
      </div>

      <div className="doc-block" id="typography">
        <Text variant="title" as="h2">Typography</Text>
        <Text tone="muted" className="doc-block__intro">Manrope carries the headings, DM Sans the explanations. Both are bundled as variable fonts under the OFL licence.</Text>
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

      <div className="doc-block doc-grid-2" id="space">
        <div>
          <Text variant="title" as="h2">Space</Text>
          <ul className="doc-space">
            {Object.entries(space).filter(([k]) => k !== '0').map(([k, v]) => (
              <li key={k}><code>space-{k}</code><span className="doc-space__bar" style={{ width: v }} /><span className="doc-num">{v}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <Text variant="title" as="h2">Shape</Text>
          <ul className="doc-radius">
            {Object.entries(radius).map(([k, v]) => (
              <li key={k}><span className="doc-radius__box" style={{ borderRadius: v }} /><code>radius-{k}</code><span className="doc-num">{v}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="doc-block" id="motion">
        <Text variant="title" as="h2">Motion</Text>
        <Text tone="muted" className="doc-block__intro">Short responses with one arrival curve. Motion supports the order of things; without animation everything stays usable.</Text>
        <MotionDemo />
      </div>
    </article>
  );
}
