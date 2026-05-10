const CACHE = 'auto-shopping-v1';
const ASSETS = [
  '/auto-shopping/',
  '/auto-shopping/index.html',
  '/auto-shopping/auto-loan/',
  '/auto-shopping/auto-loan/index.html',
  '/auto-shopping/lease/',
  '/auto-shopping/lease/index.html',
  '/auto-shopping/manifest.json',
  '/auto-shopping/icons/icon-192.png',
  '/auto-shopping/icons/icon-512.png',
  '/auto-shopping/icons/icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin assets, network-first for external (fonts, NHTSA API)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always go network for NHTSA API calls
  if (url.hostname === 'vpic.nhtsa.dot.gov') return;

  // Cache-first for app assets
  if (url.hostname === self.location.hostname) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }))
    );
  }
});
