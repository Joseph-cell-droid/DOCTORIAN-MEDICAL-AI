// Doctorian Service Worker v5 — Full Offline App Shell, Telehealth Portraits, Native Packages & API Cache
const SHELL_CACHE = 'doctorian-shell-v5';
const RUNTIME_CACHE = 'doctorian-runtime-v5';
const API_CACHE = 'doctorian-api-v5';

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
  '/favicon.ico',
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
  '/downloads/Doctorian-Offline-Package-Suite.json',
  '/downloads/Doctorian-Setup.exe',
  '/downloads/Doctorian-MedicalAI-Android.apk',
  '/downloads/Doctorian-Tablet-HD.apk'
];

// Read-only safe API GET paths to mirror offline so dashboards, guidelines, orders, and chats stay alive
const CACHEABLE_API_PREFIXES = [
  '/api/guidelines',
  '/api/dashboard/live-summary',
  '/api/network/users',
  '/api/network/messages',
  '/api/network/stats',
  '/api/neural/events',
  '/api/pharmacy/orders',
  '/api/ai/status'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch(() => null)
          )
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

  // Never cache WebSocket upgrades or SSE/live endpoints
  if (url.pathname.includes('/ws') || url.pathname.includes('/live')) {
    return;
  }

  // 1. Safe GET API Endpoints -> NetworkFirst with Offline Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    const isCacheableApi = CACHEABLE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
    if (!isCacheableApi) return;

    event.respondWith(
      fetch(event.request)
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
            JSON.stringify({ offline: true, message: 'Served offline cache fallback.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. SPA Navigation -> NetworkFirst with instant cached App Shell fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
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

  // 3. Native Installers (/downloads/*) -> NetworkFirst with guaranteed offline Shell Cache fallback
  if (url.pathname.startsWith('/downloads/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, copy));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response('Offline package not yet cached', { status: 503 });
        })
    );
    return;
  }

  // 4. Vite dev source modules (/src/, /@vite/, /node_modules/) -> NetworkFirst with offline cache backup
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts')
  ) {
    event.respondWith(
      fetch(event.request)
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

  // 5. Production Assets, Images, CSS, JS, Fonts -> Stale-While-Revalidate
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
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
