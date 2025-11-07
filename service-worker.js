self.addEventListener("install", event => {
  console.log("Service Worker instalado!");
});

self.addEventListener("fetch", event => {
  // Aqui poderias interceptar pedidos e servir cache offline
});
