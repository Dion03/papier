// Papier's tokens in the W3C Design Tokens (DTCG) format, as Tokens Studio, Figma
// plugins and Style Dictionary read it. Theme colours that equal a primitive become
// aliases ({primitive.paper}), so a design tool shows where each role comes from.
import * as t from '../src/tokens/tokens.mjs';

const displayRoles = new Set(['display', 'headline', 'title', 'subtitle']);
const families = (stack) => stack.split(',').map((f) => f.trim().replace(/^"|"$/g, ''));
const byHex = new Map(Object.entries(t.primitives).map(([k, v]) => [v.toLowerCase(), k]));
const color = (value) => {
  const alias = byHex.get(String(value).toLowerCase());
  return { $type: 'color', $value: alias ? `{primitive.${alias}}` : value };
};
const dimension = (value) => ({ $type: 'dimension', $value: value === '0' ? '0px' : value });
const group = (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]));

export function toDtcg() {
  const theme = (name) => {
    const { shadow: _shadow, ...colors } = t.themes[name];
    return { $description: `Semantic colour roles, ${name} theme. Components use only these.`, ...group(colors, color) };
  };
  return {
    $description: 'Papier design tokens, generated from src/tokens/tokens.mjs.',
    primitive: { $description: 'Raw palette from the portfolio. Use the theme roles in components.', ...group(t.primitives, (v) => ({ $type: 'color', $value: v })) },
    light: theme('light'),
    dark: theme('dark'),
    font: group(t.font, (v) => ({ $type: 'fontFamily', $value: families(v) })),
    type: group(t.type, ([size, line, weight, tracking], role) => ({
      $type: 'typography',
      $value: {
        fontFamily: `{font.${displayRoles.has(role) ? 'display' : 'body'}}`,
        fontSize: size, lineHeight: Number(line), fontWeight: Number(weight), letterSpacing: tracking === '0' ? '0em' : tracking,
      },
      ...(size.startsWith('clamp') ? { $description: `Fluid size: ${size}` } : {}),
    })),
    space: group(t.space, dimension),
    radius: group(t.radius, dimension),
    size: group(t.size, dimension),
    motion: group(t.motion, (v) => (v.startsWith('cubic-bezier')
      ? { $type: 'cubicBezier', $value: v.slice(13, -1).split(',').map(Number) }
      : { $type: 'duration', $value: v })),
  };
}
