importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log('✅ Workbox carregado com sucesso!');
} else {
  console.log('❌ Falha ao carregar Workbox');
}

/* =========================
   INSTALL & ACTIVATE
========================= */
self.addEventListener('install', event => {
  console.log('📦 Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker ativado');
  self.clients.claim();
});

/* =========================
   PRE-CACHE (ROTAS REAIS DO FLASK)
========================= */
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },               // auth.html (rota Flask)
  { url: '/home', revision: '1' },           // home.html (rota Flask)
  { url: '/offline.html', revision: '1' },   // fallback offline
  { url: '/manifest.json', revision: '1' },

  // CSS
  { url: '/static/css/auth.css', revision: '1' },
  { url: '/static/css/home.css', revision: '1' },

  // JS
  { url: '/static/js/auth.js', revision: '1' },
  { url: '/static/js/app.js', revision: '1' },
]);

/* =========================
   IMAGENS
========================= */
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 semana
      }),
    ],
  })
);

/* =========================
   CSS & JS
========================= */
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

/* =========================
   HTML (PÁGINAS)
========================= */
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages-cache',
  })
);

/* =========================
   FALLBACK OFFLINE
========================= */
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});
