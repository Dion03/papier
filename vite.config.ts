import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', name: 'Papier', formats: ['es', 'cjs'], fileName: (f) => (f === 'es' ? 'papier.js' : 'papier.cjs'), cssFileName: 'papier' },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
    sourcemap: true,
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'], css: false, include: ['tests/**/*.test.tsx'] },
});
