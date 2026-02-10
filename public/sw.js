// public/sw.js
const CACHE_NAME = 'compras-app-v1';

self.addEventListener('install', (event) => {
  console.log('SW instalado');
});

self.addEventListener('fetch', (event) => {
  // Obligatorio para que sea instalable
  event.respondWith(fetch(event.request));
});