
const CACHE = 'Iranian Concrete Mix Disign-v1';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './page3.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('beton479-') && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(
        response => response || fetch(event.request)
      )
    );
  }
});
