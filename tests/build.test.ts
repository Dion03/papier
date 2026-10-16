import { readFileSync } from 'node:fs';
import { dirname, join, normalize, sep } from 'node:path';
import { serverModules, needsClient } from '../scripts/server-modules.mjs';

const read = (m: string) => readFileSync(join('src', m), 'utf8');

describe('server components', () => {
  const modules = serverModules.filter((m) => m !== 'index.ts');

  it.each(modules)('%s gebruikt geen hooks, context, events of functie-children', (m) => {
    expect(needsClient(read(m))).toBe(false);
  });

  it.each(modules)('%s importeert alleen andere servermodules', (m) => {
    const local = [...read(m).matchAll(/from '(\.[^']+)'/g)].map(([, p]) => normalize(join(dirname(m), p)).split(sep).join('/'));
    for (const target of local) {
      const file = serverModules.find((s) => s.replace(/\.(tsx?|mjs)$/, '') === target.replace(/\.(tsx?|mjs)$/, ''));
      expect(file, `${m} importeert ${target}`).toBeDefined();
    }
  });

  it('herkent client-code', () => {
    expect(needsClient('const [a] = useState(0);')).toBe(true);
    expect(needsClient('<button onClick={go} />')).toBe(true);
    expect(needsClient('{children(control)}')).toBe(true);
    expect(needsClient('export const Text = forwardRef(function Text() {})')).toBe(false);
  });
});
