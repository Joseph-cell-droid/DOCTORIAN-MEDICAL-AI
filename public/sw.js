// Doctorian PWA Service Worker (Full Offline & Online Core)
const CACHE_NAME = 'doctorian-offline-v2';

// Static assets to pre-cache as the application shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.svg',
  '/logo.png',
  '/logo-512.png',
  '/logo-192.png',
  '/logo-144.png',
  '/logo-96.png',
  '/logo-72.png',
  '/logo-48.png',
  '/favicon.ico',
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
  console.log('[Doctorian SW] Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Doctorian SW] Pre-caching Core Offline Shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Claim clients and purge legacy system caches
self.addEventListener('activate', (event) => {
  console.log('[Doctorian SW] Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Doctorian SW] Clearing legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Bypass Server API and Real-Time Telemetry/Websocket Endpoints
  if (url.pathname.startsWith('/api') || url.pathname.includes('/ws') || url.pathname.includes('/live')) {
    return; // Let the network handle these directly
  }

  // 2. Navigation Request (SPA client-side router routing fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.warn('[Doctorian SW] Offline mode detected. Serving cached SPA shell...');
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 3. Stale-While-Revalidate for JS, CSS, Images, and Web Fonts
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf)$/i)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.debug('[Doctorian SW] Network fetch omitted (offline):', url.pathname);
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default standard caching - Cache falling back to network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Safe fallback if asset not in cache and network offline
      });
    })
  );
});
