import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // VitePWA disabled for troubleshooting artifact upload
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@tensorflow') || id.includes('tfjs')) {
                return 'vendor-tensorflow';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('@google') || id.includes('generative-ai')) {
                return 'vendor-ai';
              }
              return 'vendor-core';
            } else if (id.includes('src/components/')) {
              if (id.includes('PatientMonitor')) {
                return 'comp-patient-monitor';
              }
              if (id.includes('AdminDashboard')) {
                return 'comp-admin-dashboard';
              }
              if (id.includes('DoctorsDashboard')) {
                return 'comp-doctors-dashboard';
              }
              if (id.includes('ChatInterface')) {
                return 'comp-chat-interface';
              }
              if (id.includes('SpecialistFinder')) {
                return 'comp-specialist-finder';
              }
              if (id.includes('HealthProgressTracker')) {
                return 'comp-health-progress';
              }
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
