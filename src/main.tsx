import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { startNeuralMeshClient } from './utils/neuralClient';

// Capture beforeinstallprompt & appinstalled as early as possible before React mounts
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPWAInstallPrompt = e;
    try {
      localStorage.removeItem('doctorian_pwa_installed_flag');
    } catch {
      // ignore
    }
  });

  window.addEventListener('appinstalled', () => {
    (window as any).deferredPWAInstallPrompt = null;
    try {
      localStorage.setItem('doctorian_pwa_installed_flag', 'true');
    } catch {
      // ignore
    }
  });

  // Register Doctorian Service Worker for full offline execution & fast shell caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          console.warn('[Doctorian PWA] Service worker registration skipped:', err);
        });
    });
  }

  // Boot real-time WebSocket + BroadcastChannel + Offline Outbox Neural Mesh
  startNeuralMeshClient();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
