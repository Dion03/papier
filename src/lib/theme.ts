import type { CSSProperties } from 'react';
import { themes } from '../tokens/tokens.mjs';
import { pairs } from '../tokens/pairs.mjs';
import { contrast } from '../tokens/contrast.mjs';

/** A semantic colour role. Components only use these roles, never raw colours. */
export type ColorRole = Exclude<keyof typeof themes.light, 'shadow'>;
export type ThemeColors = Record<ColorRole, string>;

const roles = Object.keys(themes.light).filter((k) => k !== 'shadow') as ColorRole[];
/** Every colour role, in token order. These are the public --papier-color-* variables. */
export const colorRoles: readonly ColorRole[] = roles;

/** The built-in colours of a theme. */
export function themeColors(base: 'light' | 'dark' = 'light'): ThemeColors {
  const { shadow: _shadow, ...colors } = themes[base];
  return colors as ThemeColors;
}

/**
 * Inline CSS variables for a brand or custom theme, e.g.
 * `<Papier style={themeStyle({ action: '#1d4ed8', 'on-action': '#ffffff' })}>`.
 * Inline styles win over Papier's @layer, so only the roles you pass change.
 */
export function themeStyle(colors: Partial<ThemeColors>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [role, value] of Object.entries(colors)) if (value) style[`--papier-color-${role}`] = value;
  return style as CSSProperties;
}

export interface ContrastResult { foreground: ColorRole; background: ColorRole; ratio: number; minimum: number; ok: boolean; use: string }

/**
 * Checks a custom theme against the same WCAG 2.2 pairs as Papier's own build, on top of
 * a built-in theme. Use it in a test so a brand colour can never make text unreadable.
 * Only #rrggbb colours are measured; other formats are reported as failing.
 */
export function checkTheme(colors: Partial<ThemeColors>, base: 'light' | 'dark' = 'light'): ContrastResult[] {
  const all = { ...themeColors(base), ...colors };
  return (pairs as Array<[ColorRole, ColorRole, number, string]>).map(([fg, bg, minimum, use]) => {
    const hex = /^#[0-9a-f]{6}$/i;
    const ratio = hex.test(all[fg]) && hex.test(all[bg]) ? contrast(all[fg], all[bg]) : 0;
    return { foreground: fg, background: bg, ratio: Math.round(ratio * 100) / 100, minimum, ok: ratio >= minimum, use };
  });
}
