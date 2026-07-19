// Service worker for bishalgc.info.np — enables PWA install + offline support
// Cache version is auto-bumped by scripts/bump-sw-cache.js on each build.
const CACHE_NAME = 'bishalgc-9b76dae51b5e5bcb5c1d9529797bcd7e9562fc46f1d19d8ecc2322b7435124b1';

// Pre-cache the shell on install
const PRECACHE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Clean up old cache versions on activate.
// Does NOT call clients.claim() — existing tabs keep their current SW
// until reload, preventing mid-session cache invalidation on deploy.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin only — skip external CDNs (fonts, analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // ── Navigation: network-first, cache fallback ──
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses — don't cache 4xx/5xx
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Network failed — try cache for the exact URL, then fall back to root
          caches.match(request).then((cached) => cached || caches.match('/')),
        ),
    );
    return;
  }

  // ── Hashed build assets (CSS, JS bundles): cache-first ──
  // These have content hashes in their filenames, so they are truly immutable.
  // Path matches `astro/` because astro.config.mjs sets build.assets: 'astro'.
  if (url.pathname.startsWith('/astro/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // ── Mutable public assets (icons, logos, OG image, manifest, CV): network-first ──
  // These use fixed, non-hashed URLs and can change across deploys.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
  }
});
