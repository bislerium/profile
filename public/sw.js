// Service worker for bishalgc.info.np — enables PWA install + offline support
// Cache version is auto-bumped by scripts/bump-sw-cache.js on each build.
const CACHE_NAME = 'bishalgc-8706831afc2308a451fd58e5497d4c9d1e068bbcef6766546acb8b84febc4986';
const MAX_CACHE_ENTRIES = 50;

// Trim cache to MAX_CACHE_ENTRIES, keeping most-recently-added entries.
// Keys are ordered by insertion time, so we drop from the front (oldest).
const trimCache = async (cache) => {
  const keys = await cache.keys();
  if (keys.length > MAX_CACHE_ENTRIES) {
    const toDelete = keys.slice(0, keys.length - MAX_CACHE_ENTRIES);
    await Promise.all(toDelete.map((req) => cache.delete(req)));
  }
};

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
            caches.open(CACHE_NAME).then((cache) => { cache.put(request, clone); trimCache(cache); });
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
              caches.open(CACHE_NAME).then((cache) => { cache.put(request, clone); trimCache(cache); });
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
            caches.open(CACHE_NAME).then((cache) => { cache.put(request, clone); trimCache(cache); });
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
  }
});
