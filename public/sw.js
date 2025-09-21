const CACHE_NAME = 'ggt-todo-v4';
const STATIC_CACHE = 'ggt-static-v4';
const DYNAMIC_CACHE = 'ggt-dynamic-v4';

const staticAssets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/favicon.ico',
  '/ggf.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(staticAssets);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching for Vite development server requests
  if (event.request.url.includes('@vite') ||
      event.request.url.includes('@react-refresh') ||
      event.request.url.includes('src/') ||
      event.request.url.includes('node_modules/')) {
    return;
  }

  // Handle CSS, JS, and font requests
  if (event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'font' ||
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {

    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return cached fallback for fonts
              if (event.request.destination === 'font') {
                return new Response('', { status: 200 });
              }
            });
        })
    );
    return;
  }

  // Handle navigation and other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('ggt-') ||
                (!cacheName.includes('v4') && cacheName.includes('ggt-'))) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});