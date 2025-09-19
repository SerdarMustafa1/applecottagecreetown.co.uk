// Service Worker error handling and cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle quota exceeded errors
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).then((fetchResponse) => {
        // Don't cache large images or panoramas to prevent quota issues
        const url = new URL(event.request.url);
        const isLargeImage = url.pathname.includes('panos/') || 
                           url.pathname.includes('-1600.') || 
                           url.pathname.includes('-1200.');
        
        if (isLargeImage || fetchResponse.status !== 200) {
          return fetchResponse;
        }
        
        // Try to cache, but handle quota errors gracefully
        const responseToCache = fetchResponse.clone();
        caches.open('runtime-cache').then((cache) => {
          cache.put(event.request, responseToCache).catch((error) => {
            if (error.name === 'QuotaExceededError') {
              // Clear old entries and retry
              cache.keys().then((keys) => {
                const oldKeys = keys.slice(0, Math.floor(keys.length / 2));
                return Promise.all(oldKeys.map(key => cache.delete(key)));
              }).then(() => {
                return cache.put(event.request, responseToCache.clone());
              }).catch(() => {
                // If still failing, just don't cache
                console.warn('Cache quota exceeded, skipping cache for:', event.request.url);
              });
            }
          });
        });
        
        return fetchResponse;
      }).catch(() => {
        // Return offline fallback if available
        return caches.match('/offline.html') || new Response('Offline', { status: 503 });
      });
    })
  );
});