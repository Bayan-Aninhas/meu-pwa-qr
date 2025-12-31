importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log("Workbox carregado com sucesso!");
} else {
  console.log("Falha ao carregar Workbox");
}

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker instalado!');
  self.skipWaiting(); // Ativa o SW imediatamente
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker ativado!');
  self.clients.claim(); // Assume o controlo das páginas imediatamente
});

// Cache de HTML, CSS e JS essenciais (pre-cache)
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/css/auth.css', revision: '1' },
  { url: '/js/auth.js', revision: '1' },
  { url: '/js/app.js', revision: '1' },
]);

// Regra para imagens: NetworkFirst
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

// Regra para CSS e JS: StaleWhileRevalidate (busca do cache primeiro, depois atualiza)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets-cache',
  })
);

// Regra para HTML: NetworkFirst (prioriza online, mas usa cache se offline)
workbox.routing.registerRoute(
  ({request}) => request.destination === 'document',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
  })
);

