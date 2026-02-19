const CACHE_NAME = 'palabra-dia-v1';
const CORE_ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/palabras.txt'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((oldKey) => caches.delete(oldKey)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'REFRESH_CACHE') return;

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((asset) =>
          fetch(asset, { cache: 'no-store' })
            .then((response) => {
              if (response.ok) {
                return cache.put(asset, response.clone());
              }
              return null;
            })
            .catch(() => null)
        )
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (!isSameOrigin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                return caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
              }
              return null;
            })
            .catch(() => null)
        );
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
