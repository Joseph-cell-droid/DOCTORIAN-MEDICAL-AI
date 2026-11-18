// Doctorian Service Worker v6 — Fast Online Loading + Full Offline App Shell, Chunks & API Resilience
const SHELL_CACHE = 'doctorian-shell-v6';
const RUNTIME_CACHE = 'doctorian-runtime-v6';
const API_CACHE = 'doctorian-api-v6';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/logo.svg',
  '/logo.png',
  '/apple-touch-icon.png',
  '/logo-512.png',
  '/logo-192.png',
  '/logo-144.png',
  '/logo-96.png',
  '/logo-72.png',
  '/logo-48.png',
  '/rx_hero_banner.png',
  '/rx_capsule_3d.png',
  '/rx_doctor_telemed.png',
  '/rx_patient_avatar.png',
  '/african_doctor_female.png',
  '/african_doctor_male.png',
  '/portraits/dr_sarah_nakalema.jpg',
  '/portraits/dr_emmanuel_kato.jpg',
  '/portraits/dr_achan_grace.jpg',
  '/portraits/dr_joseph_mukasa.jpg',
  '/portraits/patient_sarah.jpg',
  '/downloads/Doctorian-Offline-Package-Suite.json'
];

const CACHEABLE_API_PREFIXES = [
  '/api/guidelines',
  '/api/dashboard/live-summary',
  '/api/network/users',
  '/api/network/messages',
  '/api/network/stats',
  '/api/connections/',
  '/api/patient-memory/',
  '/api/sms/analytics',
  '/api/telephony/directory',
  '/api/billing/plans',
  '/api/neural/events',
  '/api/pharmacy/',
  '/api/offline-assets',
  '/api/ai/status'
];

function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('network_timeout')), timeoutMs);
    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => null))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([SHELL_CACHE, RUNTIME_CACHE, API_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => (!validCaches.has(name) ? caches.delete(name) : Promise.resolve(false)))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes('/ws') || url.pathname.includes('/live')) {
    return;
  }

  // 1. Safe GET API Endpoints -> Fast Network with Instant Cached Fallback on Offline/Slow Links
  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.startsWith('/api/download-app-')) {
      return;
    }
    const isCacheableApi = CACHEABLE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
    if (!isCacheableApi) return;

    event.respondWith(
      fetchWithTimeout(event.request, 4500)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(API_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ offline: true, cachedFallback: true, message: 'Offline mode active.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. SPA Navigation -> Fast Network (1.8s cap) with Instant Offline Shell Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(event.request, 1800)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return networkRes;
        })
        .catch(async () => {
          return (
            (await caches.match('/index.html')) ||
            (await caches.match('/')) ||
            new Response('Doctorian AI Offline Shell Unavailable', { status: 503 })
          );
        })
    );
    return;
  }

  // 3. Streamed Native Binary Packages -> Always stream directly (client handles offline fallback synthesis cleanly)
  if (url.pathname.startsWith('/downloads/') && !url.pathname.endsWith('.json')) {
    return;
  }

  // 4. Production Hashed Assets (/assets/*.js, *.css) -> CacheFirst for Instant Page Transitions
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cachedRes) => {
        if (cachedRes) return cachedRes;
        return fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 5. Vite dev modules (/src/, /@vite/, /node_modules/) -> NetworkFirst with Offline Backup
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts')
  ) {
    event.respondWith(
      fetchWithTimeout(event.request, 2500)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          throw new Error('Offline source module not yet cached');
        })
    );
    return;
  }

  // 6. Icons, Portraits, Manifests, Media -> Stale-While-Revalidate (Zero-wait load when cached)
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      const fetchPromise = fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && (networkRes.type === 'basic' || networkRes.type === 'cors')) {
            const copy = networkRes.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkRes;
        })
        .catch(() => cachedRes || new Response('', { status: 404 }));

      return cachedRes || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data.type === 'PRECACHE_URLS' && Array.isArray(event.data.urls)) {
    const urls = event.data.urls.filter((u) => typeof u === 'string' && !u.includes('/downloads/Doctorian-') || u.endsWith('.json'));
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) =>
        Promise.allSettled(
          urls.map((u) =>
            caches.match(u).then((hit) => {
              if (hit && !u.startsWith('/api/')) return hit;
              return cache.add(u).catch(() => null);
            })
          )
        )
      )
    );
  }
});
