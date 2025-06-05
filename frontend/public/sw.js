const CACHE_NAME = 'kardiyolive-v1.0.0';
const STATIC_CACHE_NAME = 'kardiyolive-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'kardiyolive-dynamic-v1.0.0';

// Cache edilecek static dosyalar
const STATIC_ASSETS = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache edilecek görsel dosyaları
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

// Cache edilmeyecek URL'ler
const EXCLUDE_URLS = [
  '/api/auth',
  '/admin',
  '/_next/webpack-hmr',
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker aktifleştirilmesi
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
            .map((key) => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Network istekleri yakalama
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Exclude edilecek URL'leri atla
  if (EXCLUDE_URLS.some(excludeUrl => url.pathname.startsWith(excludeUrl))) {
    return;
  }

  // GET istekleri için cache stratejisi
  if (request.method === 'GET') {
    event.respondWith(handleGetRequest(request));
  }
});

// GET istekleri için cache stratejisi
async function handleGetRequest(request) {
  const url = new URL(request.url);
  
  // Static assets - Cache First
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/static')) {
    return cacheFirst(request, STATIC_CACHE_NAME);
  }
  
  // API istekleri - Network First
  if (url.pathname.startsWith('/api/')) {
    return networkFirst(request, DYNAMIC_CACHE_NAME);
  }
  
  // Görseller - Cache First with fallback
  if (IMAGE_EXTENSIONS.some(ext => url.pathname.includes(ext))) {
    return cacheFirstWithFallback(request, DYNAMIC_CACHE_NAME);
  }
  
  // Diğer sayfalar - Stale While Revalidate
  return staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
}

// Cache First stratejisi
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed for:', request.url);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network First stratejisi
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    return cached || new Response(
      JSON.stringify({ error: 'Network unavailable' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First with Fallback (görseller için)
async function cacheFirstWithFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Varsayılan görsel döndür
    return cache.match('/images/placeholder.jpg') || 
           new Response('', { status: 503 });
  }
}

// Stale While Revalidate stratejisi
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Görüntüle',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Eğer sayfa zaten açıksa, focus et
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Yeni sayfa aç
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
  
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

// Offline senkronizasyon fonksiyonları
async function syncOrders() {
  try {
    // Offline sıradaki siparişleri senkronize et
    const orders = await getOfflineOrders();
    for (const order of orders) {
      await submitOrder(order);
    }
    await clearOfflineOrders();
  } catch (error) {
    console.log('[SW] Order sync failed:', error);
  }
}

async function syncCart() {
  try {
    // Sepet verilerini senkronize et
    const cart = await getOfflineCart();
    if (cart) {
      await syncCartToServer(cart);
    }
  } catch (error) {
    console.log('[SW] Cart sync failed:', error);
  }
}

// IndexedDB helper functions (basit implementasyon)
async function getOfflineOrders() {
  // IndexedDB'den offline siparişleri al
  return [];
}

async function clearOfflineOrders() {
  // IndexedDB'den offline siparişleri temizle
}

async function getOfflineCart() {
  // IndexedDB'den offline sepeti al
  return null;
}

async function submitOrder(order) {
  // Sipariş gönder
  return fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
}

async function syncCartToServer(cart) {
  // Sepeti sunucuya senkronize et
  return fetch('/api/cart/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart)
  });
}
