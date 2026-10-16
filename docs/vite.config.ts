import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  resolve: { alias: { '@dionbm/papier': fileURLToPath(new URL('../src/index.ts', import.meta.url)) } },
  build: { outDir: '../dist-docs', emptyOutDir: true },
  server: { host: '127.0.0.1', port: 4330 },
});
