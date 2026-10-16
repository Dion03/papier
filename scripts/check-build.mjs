// After the build: client modules start with 'use client', server modules do not, and
// every module listed in package.json exports exists.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serverModules } from './server-modules.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const server = new Set(serverModules.map((m) => m.replace(/\.(tsx?|mjs)$/, '').replace(/^index$/, 'papier')));
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? (f === 'types' ? [] : walk(p)) : [p];
});

let failed = 0;
let counts = { client: 0, server: 0 };
for (const file of walk(dist).filter((f) => /\.(c?js)$/.test(f))) {
  const name = relative(dist, file).split(sep).join('/').replace(/\.c?js$/, '');
  const client = /^["']use client["']/.test(readFileSync(file, 'utf8'));
  const shouldBeServer = server.has(name);
  if (client === shouldBeServer) { failed++; console.error(`  FAIL ${name}: ${client ? 'client' : 'server'}, expected ${shouldBeServer ? 'server' : 'client'}`); }
  counts[client ? 'client' : 'server']++;
}
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const target of Object.values(pkg.exports).flatMap((e) => (typeof e === 'string' ? [e] : Object.values(e)))) {
  if (!existsSync(join(root, target))) { failed++; console.error(`  FAIL export ${target} is missing`); }
}
if (failed) { console.error(`\n${failed} build problem(s)`); process.exit(1); }
console.log(`build ok: ${counts.client / 2} client and ${counts.server / 2} server modules, all exports present`);
