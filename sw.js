/**
 * ORION HOTEL CHAT - Service Worker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'orion-hotel-chat-v1.0.0';
const RUNTIME_CACHE = 'orion-runtime-v1.0.0';

// Files to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            console.log('[SW] Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // API requests - network only with timeout
  if (event.request.url.includes('script.google.com') || 
      event.request.url.includes('generativelanguage.googleapis.com') ||
      event.request.url.includes('openweathermap.org')) {
    
    event.respondWith(
      fetchWithTimeout(event.request, 10000)
        .catch(error => {
          console.log('[SW] API request failed:', error);
          return new Response(
            JSON.stringify({ 
              message: 'Service temporarily unavailable. Please try again.',
              type: 'error',
              offline: true
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // App shell - cache first, fall back to network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        return caches.open(RUNTIME_CACHE)
          .then(cache => {
            return fetch(event.request)
              .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                  cache.put(event.request, response.clone());
                }
                return response;
              });
          });
      })
      .catch(error => {
        console.log('[SW] Fetch failed:', error);
        
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        return new Response('Offline', { status: 503 });
      })
  );
});

// Fetch with timeout utility
function fetchWithTimeout(request, timeout = 8000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

// Background sync for queued messages (if supported)
if (self.registration.sync) {
  self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-messages') {
      event.waitUntil(syncQueuedMessages());
    }
  });
}

// Sync queued messages
async function syncQueuedMessages() {
  try {
    // This would retrieve queued messages from IndexedDB
    // and attempt to send them to the server
    console.log('[SW] Syncing queued messages...');
    
    // Implementation would go here
    // For now, just log
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Message sync failed:', error);
    return Promise.reject(error);
  }
}

// Push notifications (if configured)
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New message from Orion Hotel',
    icon: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🏨</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🏨</text></svg>',
    vibrate: [200, 100, 200],
    tag: 'orion-hotel-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open Chat' },
      { action: 'close', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Orion Hotel', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service worker loaded successfully');
