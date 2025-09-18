const CACHE_VERSION = 'apple-cottage-v2';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/offline.css',
  '/site.webmanifest',
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icons/pwa-icon.svg',
  '/icons/pwa-icon-maskable.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon-512.png'
];

const isAllowedHost = (hostname) => {
  if (!hostname) {
    return false;
  }
  if (hostname === self.location.hostname) {
    return true;
  }
  if (hostname === 'applecottagecreetown.co.uk' || hostname === 'www.applecottagecreetown.co.uk') {
    return true;
  }
  if (hostname.endsWith('.applecottagecreetown.co.uk')) {
    return true;
  }
  if (hostname.endsWith('.cloudfront.net')) {
    return true;
  }
  return false;
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.warn('Service worker install failed', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const shouldHandleRequest = (request) => {
  if (request.method !== 'GET') {
    return false;
  }
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }
  if (!isAllowedHost(url.hostname)) {
    return false;
  }
  return true;
};

const maybeCacheResponse = async (request, response) => {
  try {
    if (!response) {
      return;
    }
    if (!response.ok && response.type !== 'opaque') {
      return;
    }
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response.clone());
  } catch (error) {
    console.warn('Unable to cache response', error);
  }
};

const networkThenCache = async (request) => {
  try {
    const response = await fetch(request);
    await maybeCacheResponse(request, response);
    return response;
  } catch (error) {
    console.warn('Network request failed; falling back to cache', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    if (request.destination === 'image') {
      const fallbackImage = await caches.match('/icons/icon-512.png');
      if (fallbackImage) {
        return fallbackImage;
      }
    }
    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};

self.addEventListener('fetch', (event) => {
  if (!shouldHandleRequest(event.request)) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        fetch(event.request)
          .then((response) => maybeCacheResponse(event.request, response))
          .catch(() => undefined);
        return cached;
      }
      return networkThenCache(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
