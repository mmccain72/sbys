const CACHE_NAME = 'shop-your-shade-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-32x32.png',
  '/icons/icon-16x16.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        // Cache files one by one to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Chrome-compatible version
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip Convex API requests to avoid caching issues
  if (event.request.url.includes('.convex.cloud') || 
      event.request.url.includes('convex.dev') ||
      event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Don't cache dynamic content
            if (event.request.url.includes('auth') || 
                event.request.url.includes('login') ||
                event.request.url.includes('logout')) {
              return networkResponse;
            }

            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Cache the response asynchronously
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
                  .catch((error) => {
                    console.warn('Service Worker: Failed to cache', event.request.url, error);
                  });
              })
              .catch((error) => {
                console.warn('Service Worker: Failed to open cache', error);
              });

            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Network fetch failed', error);
            
            // For navigation requests, try to return cached index
            if (event.request.mode === 'navigate') {
              return caches.match('/').then((fallback) => {
                if (fallback) {
                  return fallback;
                }
                // If no cached fallback, return a basic offline page
                return new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
                );
              });
            }
            
            // For other requests, just throw the error
            throw error;
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
