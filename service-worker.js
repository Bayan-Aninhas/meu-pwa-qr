importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log("Workbox carregado com sucesso!");
} else {
  console.log("Falha ao carregar Workbox");
}

// ---------- Instalação e ativação ----------
self.addEventListener('install', event => {
  console.log('Service Worker instalado!');
  self.skipWaiting(); // Ativa o SW imediatamente
});

self.addEventListener('activate', event => {
  console.log('Service Worker ativado!');
  self.clients.claim(); // Assume o controlo das páginas imediatamente
});

// ---------- Pre-cache ----------
workbox.precaching.precacheAndRoute([
  { url: '/auth.html', revision: '1' },
  { url: '/home.html', revision: '1' },
  { url: '/offline.html', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/css/auth.css', revision: '1' },
  { url: '/css/home.css', revision: '1' },
  { url: '/js/auth.js', revision: '1' },
  { url: '/js/app.js', revision: '1' },
]);

// ---------- Cache de imagens ----------
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.NetworkFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
      }),
    ],
  })
);

// ---------- Cache de CSS e JS ----------
workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

// ---------- Cache de HTML ----------
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
  })
);

// ---------- Fallback offline ----------
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  if (event.request.destination === 'image') {
    return caches.match('/images/fallback.png'); // colocar fallback genérico
  }
  return Response.error();
});
