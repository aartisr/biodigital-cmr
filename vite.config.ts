import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-runtime': ['three'],
            charts: ['d3', 'recharts'],
            math: ['katex'],
          },
        },
      },
    },
    server: {
      // Optional switch for constrained development environments.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when HMR is explicitly disabled.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
