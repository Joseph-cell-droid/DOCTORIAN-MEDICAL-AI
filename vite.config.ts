import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: false // Prevent preamble timing conflicts in proxied iframe environments
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@tensorflow/tfjs': path.resolve(__dirname, 'node_modules/@tensorflow/tfjs/dist/tf.fesm.min.js'),
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      maxParallelFileOps: 2,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('@tensorflow')) return 'vendor-tfjs';
            if (id.includes('/three/')) return 'vendor-three';
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts') || id.includes('/d3') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('canvg')) return 'vendor-pdf';
            if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('react-markdown') || id.includes('remark-') || id.includes('unified') || id.includes('mdast')) return 'vendor-markdown';
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    cors: true
  }
});
