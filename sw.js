const CACHE_NAME = 'gleejeyly-v2';
const RUNTIME_CACHE = 'gleejeyly-runtime';
const IMAGE_CACHE = 'gleejeyly-images';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/product.html',
  '/order.html',
  '/reviews.html',
  '/faq.html',
  '/contact.html',
  '/styles/style.css',
  '/styles/accessibility.css',
  '/scripts/index.js',
  '/scripts/config.js',
  '/scripts/utils.js',
  '/scripts/ui.js',
  '/scripts/performance.js',
  '/scripts/accessibility.js',
  '/scripts/loader-modern.js',
  '/scripts/pwa.js',
  '/shared/header.html',
  '/shared/modal.html',
  '/shared/footer.html',
  '/images/logo.svg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching critical assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== RUNTIME_CACHE && key !== IMAGE_CACHE)
          .map(key => {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // API requests - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request, RUNTIME_CACHE));
    return;
  }

  // Images - Cache first with network fallback
  if (event.request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(event.request, IMAGE_CACHE));
    return;
  }

  // Static assets (JS, CSS, HTML) - Cache first
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(cacheFirstStrategy(event.request, CACHE_NAME));
    return;
  }

  // HTML pages - Network first with cache fallback
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirstStrategy(event.request, CACHE_NAME));
    return;
  }

  // Default - Cache first
  event.respondWith(cacheFirstStrategy(event.request, CACHE_NAME));
});

// Cache first strategy
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy
async function networkFirstStrategy(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || new Response('Offline - Using cached data or unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

async function syncOfflineOrders() {
  try {
    const db = new (await import('workbox-window')).getCacheStorage();
    const orders = await db.match('offline-orders');
    
    if (orders) {
      const response = await fetch('/api/orders', {
        method: 'POST',
        body: orders
      });

      if (response.ok) {
        await db.delete('offline-orders');
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Message handling from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(event.data.urls);
    });
  }
});

console.log('Service Worker loaded');

