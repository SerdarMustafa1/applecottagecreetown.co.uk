// Service Worker error handling and cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Marketing push campaigns kept in sync with src/lib/pwa/pushCampaigns.ts
const MARKETING_CAMPAIGNS = [
  {
    id: 'booking-reminders',
    title: 'Viewing confirmed – here\'s what to expect',
    body: 'Get instant alerts when your preferred viewing slot is confirmed and receive timely reminders so you never miss an appointment.',
    url: '/#book-viewing',
    tag: 'booking-updates'
  },
  {
    id: 'insider-guide',
    title: 'Unlock the Apple Cottage insider guide',
    body: 'Tap for curated tips on the rooms to explore, hidden garden corners and scenic walks while you plan your visit.',
    url: '/#highlights',
    tag: 'insider-guide'
  },
  {
    id: 'arrival-checklist',
    title: 'Arrival checklist ready for you',
    body: 'We\'ll nudge you with directions, parking info and Wi-Fi details the day before you travel so arrival is effortless.',
    url: '/#plan-your-stay',
    tag: 'arrival-checklist'
  }
];

const FALLBACK_NOTIFICATION = {
  title: 'Apple Cottage updates',
  body: 'Install the app to receive booking alerts, insider guides and pre-arrival reminders as soon as they drop.',
  url: '/?source=push-fallback',
  tag: 'applecottage-default'
};

const getCampaignById = (id) => MARKETING_CAMPAIGNS.find((campaign) => campaign.id === id);

self.addEventListener('push', (event) => {
  if (!event) {
    return;
  }

  let payload;
  try {
    payload = event.data?.json?.();
  } catch {
    try {
      const text = event.data?.text?.();
      payload = text ? { body: text } : undefined;
    } catch {
      payload = undefined;
    }
  }

  const campaign = payload?.campaignId ? getCampaignById(payload.campaignId) : undefined;
  const notificationDetails = campaign ?? {
    title: payload?.title ?? FALLBACK_NOTIFICATION.title,
    body: payload?.body ?? FALLBACK_NOTIFICATION.body,
    url: payload?.url ?? FALLBACK_NOTIFICATION.url,
    tag: payload?.tag ?? FALLBACK_NOTIFICATION.tag
  };

  const data = {
    url: notificationDetails.url,
    campaignId: campaign?.id ?? payload?.campaignId ?? null,
    source: payload?.source ?? 'push'
  };

  const options = {
    body: notificationDetails.body,
    tag: notificationDetails.tag,
    data,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open Apple Cottage'
      }
    ]
  };

  event.waitUntil(
    (async () => {
      if (!self.registration?.showNotification) {
        return undefined;
      }
      return self.registration.showNotification(notificationDetails.title, options);
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url ?? '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existingClient = allClients.find((client) => client.url?.includes(self.location.origin));

      if (existingClient?.focus) {
        await existingClient.focus();
        if (targetUrl && existingClient.url !== targetUrl && existingClient.navigate) {
          await existingClient.navigate(targetUrl);
        }
        return undefined;
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    })()
  );
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