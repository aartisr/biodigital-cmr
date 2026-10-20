import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
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
          manualChunks(id) {
            // The WebGL engine is loaded only by the lazy heart visualizer.
            // Divide its internal renderer graph so it can be streamed in
            // smaller cacheable chunks rather than a single 500 kB+ payload.
            if (id.includes('/node_modules/three/src/renderers/webgl/')) return 'three-webgl';
            if (id.includes('/node_modules/three/src/renderers/shaders/')) return 'three-shaders';
            if (id.includes('/node_modules/three/src/renderers/')) return 'three-renderer';
            if (id.includes('/node_modules/three/src/')) return 'three-core';

            if (id.includes('/node_modules/recharts/')) return 'recharts';
            if (id.includes('/node_modules/d3-')) return 'd3';
            if (id.includes('/node_modules/katex/')) return 'math';
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
