// WCAG 2.2 contrast check for every semantic pair Papier uses. Exits 1 on failure.
import { themes } from '../src/tokens/tokens.mjs';

import { contrast as ratio } from '../src/tokens/contrast.mjs';

import { pairs } from '../src/tokens/pairs.mjs';

let failed = 0;
for (const [name, t] of Object.entries(themes)) {
  console.log(`\n${name}`);
  for (const [fg, bg, min, why] of pairs) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)} ≥ ${min}  ${fg} on ${bg} (${why})`);
  }
}
if (failed) { console.error(`\n${failed} pair(s) below WCAG minimum`); process.exit(1); }
console.log('\nall pairs pass');
