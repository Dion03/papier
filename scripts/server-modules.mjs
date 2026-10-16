// Modules that stay React Server Components: no hooks, context, event handlers or
// function props. Every other module gets 'use client' in the build.
// tests/build.test.ts checks that these contain none of those and only import each other.
export const serverModules = [
  'index.ts',
  'components/Text.tsx',
  'components/VisuallyHidden.tsx',
  'components/Surface.tsx',
  'components/Layout.tsx',
  'components/Tag.tsx',
  'components/Table.tsx',
  'components/Skeleton.tsx',
  'components/icons.tsx',
  'lib/cx.ts',
  'lib/theme.ts',
  'tokens/tokens.mjs',
  'tokens/pairs.mjs',
  'tokens/contrast.mjs',
];

/** True when source code could not run as a server component. */
export const needsClient = (source) =>
  /\buse[A-Z]\w*\(|\bcreateContext\(|\bon[A-Z]\w*=\{|\bdocument\.|\bwindow\.|\bchildren\(/.test(source);
