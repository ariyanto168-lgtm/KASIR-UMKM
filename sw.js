const CACHE_NAME = 'kasir-pos-v99.03'; // Versi Cache PWA
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo-kasir.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 1. Mengembalikan aset yang di-cache jika tersedia
      if (response) {
        return response;
      }
      
      // 2. Fetch aset ke internet jika tidak ada di cache
      return fetch(event.request).then(fetchRes => {
        // Abaikan caching untuk request ke API Backend (Google Apps Script / Method POST)
        if(event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
            return fetchRes;
        }
        
        // Simpan aset baru ke dalam cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
        // Fallback offline murni (tidak lakukan apa-apa, biarkan JS di index.html menangani error jaringan POST)
    })
  );
});

// Menghapus cache versi lama secara otomatis ketika ada pembaruan aplikasi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});
