// Service Worker for CoffeePolice PWA
const CACHE_NAME = 'coffeepolice-v1';
const STATIC_CACHE = 'coffeepolice-static-v1';
const DYNAMIC_CACHE = 'coffeepolice-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/strong-coffee.svg'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              // Cache the fetched response
              const responseClone = fetchResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return fetchResponse;
            });
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return cached page if network fails
          return caches.match('/index.html');
        })
    );
    return;
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'CoffeePolice',
    body: 'Time for your coffee recommendation!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: '/ask'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.log('Could not parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Get Recommendations',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: false,
      silent: false
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(event.notification.data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'coffee-preference-sync') {
    event.waitUntil(
      // Sync user preferences when back online
      syncUserPreferences()
    );
  }
});

// Function to sync user preferences
async function syncUserPreferences() {
  try {
    // Get stored preferences from IndexedDB
    const preferences = await getStoredPreferences();
    
    if (preferences && preferences.length > 0) {
      // Send preferences to server
      const response = await fetch('/api/preferences/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        console.log('Preferences synced successfully');
        // Clear stored preferences after successful sync
        await clearStoredPreferences();
      }
    }
  } catch (error) {
    console.error('Failed to sync preferences:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredPreferences() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function clearStoredPreferences() {
  // Implementation would depend on your IndexedDB setup
  return;
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
