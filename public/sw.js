// Doctorian PWA Service Worker (Full Offline Core)
const CACHE_NAME = 'doctorian-offline-v1';

// Static assets to pre-cache as the application shell
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.svg',
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
  const url = new URL(event.request.url);

  // 1. Bypass Server API and Real-Time Telemetry/Websocket Endpoints
  if (url.pathname.startsWith('/api') || url.pathname.includes('/ws') || url.pathname.includes('/live')) {
    return; // Let the browser handle these normally
  }

  // 2. Navigation Request (SPA client-side router routing fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest page structure
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback: Serve the cached shell index.html for any SPA router URL
          console.warn('[Doctorian SW] Offline detected. Serving cached SPA shell...');
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
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.debug('[Doctorian SW] Failed to fetch static asset from network:', url.pathname, err);
          });

        // Serve instantly from cache, compile updates in the background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default standard caching (e.g., manifest or standard metadata assets) - Cache falling back to network
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
      });
    })
  );
});
