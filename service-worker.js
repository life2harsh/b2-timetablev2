// Name and version of your cache
const CACHE_NAME = 'b2-timetable-cache-v1';

// List all URLs you want to cache (your HTML, CSS, JS, images, etc.)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/service-worker.js',
  // Include any other local assets like CSS or JS files, e.g.:
  // '/styles.css',
  // '/script.js',
];

// Install event: caches all the assets for offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch event: serves files from cache if available, else fetches from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // If cached file is found, return it; otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});
