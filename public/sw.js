// Minimal no-op service worker to avoid 404s on /sw.js.
// This does not cache or intercept any requests.

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

