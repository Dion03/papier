// Single source of truth for Papier. scripts/build-tokens.mjs turns this into
// CSS custom properties (tokens.css) and a JSON file for other platforms.
// Colours come from the dion-portfolio DESIGN.md frontmatter.

export const primitives = {
  paper: '#f2efe7',
  paper2: '#faf7ef',
  paper3: '#e8e3d6',
  ink: '#252621',
  ink2: '#3a3a33',
  // Portfolio muted is #6b6a61; nudged darker so it also reads on sunken and soft sage (≥ 4.5:1).
  muted: '#64635a',
  line: '#d6cfbf',
  vermilion: '#dc5835',
  rust: '#973d29',
  coral: '#db7653',
  sage: '#c9d5a5',
  sageSoft: '#dfe3cf',
  moss: '#35462f',
  mossDeep: '#243520',
  cream: '#f8f6ed',
  night: '#1c1d19',
  night2: '#262722',
  night3: '#31322c',
  dusk: '#ebe6da',
  duskMuted: '#aaa697',
  nightLine: '#45463e',
  ember: '#f08a62',
  sageNight: '#3c4a35',
  sageNightSoft: '#2d3529',
};

const p = primitives;

/** Semantic colour roles per theme. Every pair used for text is checked by scripts/contrast.mjs. */
export const themes = {
  light: {
    bg: p.paper,
    surface: p.paper2,
    'surface-sunken': p.paper3,
    text: p.ink,
    'text-muted': p.muted,
    line: p.line,
    'line-strong': p.ink,
    accent: p.vermilion,
    'accent-text': p.rust,
    focus: p.rust,
    action: p.moss,
    'action-hover': p.mossDeep,
    'on-action': p.cream,
    'action-strong': p.ink,
    'on-action-strong': p.paper2,
    sage: p.sage,
    'sage-soft': p.sageSoft,
    'on-sage': '#2c392a',
    coral: p.coral,
    'on-coral': p.ink,
    danger: '#a3341d',
    'danger-soft': '#f6ddd3',
    success: '#3f5f38',
    'success-soft': p.sageSoft,
    warning: '#7a5410',
    'warning-soft': '#f1e4c4',
    overlay: 'rgb(37 38 33 / 0.42)',
    shadow: '61 52 39',
  },
  dark: {
    bg: p.night,
    surface: p.night2,
    'surface-sunken': '#151612',
    text: p.dusk,
    'text-muted': p.duskMuted,
    line: p.nightLine,
    'line-strong': p.dusk,
    accent: p.ember,
    'accent-text': p.ember,
    focus: p.ember,
    action: p.sage,
    'action-hover': '#d8e2b8',
    'on-action': '#20291d',
    'action-strong': p.dusk,
    'on-action-strong': p.night,
    sage: p.sageNight,
    'sage-soft': p.sageNightSoft,
    'on-sage': '#e3ead0',
    coral: '#c9694a',
    'on-coral': '#1c1d19',
    danger: '#f19a83',
    'danger-soft': '#3d241d',
    success: '#b9cf94',
    'success-soft': '#2b3426',
    warning: '#e5c278',
    'warning-soft': '#3a3120',
    overlay: 'rgb(0 0 0 / 0.6)',
    shadow: '0 0 0',
  },
};

export const font = {
  display: '"Manrope Variable", Manrope, "DM Sans", system-ui, sans-serif',
  body: '"DM Sans Variable", "DM Sans", system-ui, sans-serif',
};

/** Type roles: [size, line-height, weight, tracking]. Display sizes are fluid. */
export const type = {
  display: ['clamp(48px, 6.2vw, 88px)', '1.08', '500', '-0.04em'],
  headline: ['clamp(36px, 4.6vw, 64px)', '1.13', '500', '-0.04em'],
  title: ['clamp(26px, 2.5vw, 34px)', '1.2', '500', '-0.03em'],
  subtitle: ['21px', '1.4', '500', '-0.015em'],
  body: ['16px', '1.5', '400', '0'],
  'body-lg': ['18px', '1.6', '400', '0'],
  control: ['15px', '1.25', '600', '0'],
  small: ['14px', '1.45', '400', '0'],
  label: ['13px', '1.3', '600', '0.01em'],
};

export const space = { 0: '0', 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '22px', 6: '32px', 7: '48px', 8: '72px' };

export const radius = { sm: '7px', md: '12px', lg: '18px', xl: '28px', pill: '999px' };

export const motion = {
  'ease-arrive': 'cubic-bezier(.16, 1, .3, 1)',
  'ease-leave': 'cubic-bezier(.7, 0, .84, 0)',
  'dur-press': '160ms',
  'dur-color': '260ms',
  'dur-open': '420ms',
  'dur-close': '290ms',
};

export const size = { 'hit-target': '44px', 'control-sm': '36px', 'control-md': '44px', 'control-lg': '55px' };
