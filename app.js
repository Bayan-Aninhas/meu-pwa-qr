// Registra o service worker (para virar PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

// Inicializa o leitor de QR Code
function iniciarLeitor() {
  const leitor = new Html5Qrcode("reader");

  leitor.start(
    { facingMode: "environment" }, // câmera traseira
    {
      fps: 10,
      qrbox: 250
    },
    qrCodeMessage => {
      document.getElementById("resultado").innerText = "QR Code lido: " + qrCodeMessage;
    },
    errorMessage => {
    }
  );
}

window.onload = iniciarLeitor;
