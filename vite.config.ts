import { relative } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serverModules } from './scripts/server-modules.mjs';

const server = new Set(serverModules);

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts', name: 'Papier', formats: ['es', 'cjs'], cssFileName: 'papier',
      // One file per module, so Next.js can tell client modules from server ones.
      fileName: (format, name) => `${name === 'index' ? 'papier' : name}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Text, Stack, Surface, Table and the like stay server components and add no
        // JavaScript to a Next.js page; everything interactive is a client module.
        banner: (chunk) => {
          const id = chunk.facadeModuleId;
          if (!id || !/\.(tsx?|mjs)$/.test(id)) return '';
          return server.has(relative('src', id).split('\\').join('/')) ? '' : "'use client';";
        },
      },
    },
    sourcemap: true,
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'], css: false, include: ['tests/**/*.test.{ts,tsx}'] },
});
