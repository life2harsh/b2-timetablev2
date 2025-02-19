const CACHE_NAME = 'b2-timetable-cache-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/service-worker.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
