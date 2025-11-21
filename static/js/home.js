// =======================
// ELEMENTOS DO DOM
// =======================
const registoBtn = document.getElementById('registo-btn');
const procurarBtn = document.getElementById('procurar-btn');
const registoModal = document.getElementById('registo-modal');
const codigoModal = document.getElementById('codigo-modal');
const procurarModal = document.getElementById('procurar-modal');
const closeRegisto = document.getElementById('close-registo');
const closeCodigo = document.getElementById('close-codigo');
const closeProcurar = document.getElementById('close-procurar');
const confirmarRegisto = document.getElementById('confirmar-registo');
const fecharCodigo = document.getElementById('fechar-codigo');
const confirmarProcurar = document.getElementById('confirmar-procurar');
const codigoDisplay = document.getElementById('codigo-display');

// =======================
// FUNÇÕES AUXILIARES
// =======================

// Verifica se o utilizador está autenticado
function verificarSessao() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('⚠️ Sessão expirada ou inexistente. Faz login novamente.');
    window.location.href = '/';
    return null;
  }
  return token;
}

// =======================
// EVENTOS
// =======================

// Abrir modal de registo
registoBtn.addEventListener('click', () => {
  registoModal.style.display = 'flex';
});

// Fechar modais
closeRegisto.addEventListener('click', () => registoModal.style.display = 'none');
closeCodigo.addEventListener('click', () => codigoModal.style.display = 'none');
closeProcurar.addEventListener('click', () => procurarModal.style.display = 'none');

// Confirmar registo
confirmarRegisto.addEventListener('click', async () => {
  const nome = document.getElementById('nome-registo').value.trim();
  const localizacao = document.getElementById('localizacao').value.trim();
  const estado = document.getElementById('estado').value.trim();

  if (!nome || !localizacao || !estado) {
    alert('❌ Preenche todos os campos!');
    return;
  }

  const token = verificarSessao();
  if (!token) return;

  try {
    const response = await fetch('/registar_equipamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 🔐 Token JWT no header
      },
      body: JSON.stringify({ nome, localizacao, estado })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        alert('⚠️ Sessão expirada! Faz login novamente.');
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      alert(data.msg || data.message || 'Erro ao registar equipamento.');
      return;
    }

    // Mostra o código e o QR
    registoModal.style.display = 'none';
    codigoDisplay.innerHTML = `
      <strong>${data.codigo}</strong><br>
      <img src="${data.qr_code_url}" alt="QR Code" style="margin-top:10px; width:150px;">
    `;
    codigoModal.style.display = 'flex';

  } catch (error) {
    console.error(error);
    alert('❌ Erro de rede ao registar equipamento.');
  }
});

// Fechar modal de código
closeProcurar.addEventListener('click', () => {
    procurarModal.style.display = 'none';

    // Parar scanner se estiver a correr
    if (qrReader && scanning) {
        qrReader.stop().then(() => {
            console.log("Scanner parado ao fechar modal.");
            scanning = false;

            // limpar div para evitar bugs no mobile
            document.getElementById('qr-reader').innerHTML = "";
        }).catch(err => console.error("Erro ao parar scanner:", err));
    } else {
        document.getElementById('qr-reader').innerHTML = "";
    }
});


  // =======================
// PROCURAR EQUIPAMENTO
// =======================

let qrReader = null; // mantém instância global para não duplicar
let scanning = false;

procurarBtn.addEventListener('click', async () => {
  procurarModal.style.display = 'flex';

  const qrDiv = document.getElementById('qr-reader');
  qrDiv.innerHTML = ""; // limpa antes de iniciar novo scan

  // Garante que a lib foi carregada
  if (typeof Html5Qrcode === "undefined") {
    alert("Biblioteca de QR Code não carregada. Verifica o caminho do ficheiro html5-qrcode.min.js.");
    return;
  }

  try {
      // Obtém câmaras disponíveis
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || !cameras.length) {
        alert("Nenhuma câmara encontrada no dispositivo.");
        return;
      }

      // 🔍 Procurar câmera traseira pelo nome
      let backCamera = cameras.find(cam =>
        cam.label.toLowerCase().includes("back") ||
        cam.label.toLowerCase().includes("rear") ||
        cam.label.toLowerCase().includes("traseira")
      );

      // Se não encontrar, usar a última (que normalmente é a traseira)
      let cameraId = backCamera ? backCamera.id : cameras[cameras.length - 1].id;

      console.log("📸 Usando a câmera:", backCamera ? backCamera.label : "Última da lista");

      // Cria instância se não existir
      if (!qrReader) {
        qrReader = new Html5Qrcode("qr-reader");
      }

      // Evita iniciar o scanner mais de uma vez
      if (scanning) return;
      scanning = true;

      // Inicia leitura na câmera traseira
      await qrReader.start(
        cameraId,
        { fps: 10, qrbox: 200 },
        (decodedText) => {
          document.getElementById('codigo').value = decodedText;

          // Para o scanner assim que o QR é lido
          qrReader.stop().then(() => {
            console.log("QR scanning stopped.");
            scanning = false;
          }).catch(err => console.error("Erro ao parar scanner:", err));
        },
        (errorMessage) => {
          // erros de leitura são normais — ignoramos
        }
      );

  } catch (err) {
    console.error("Erro ao aceder à câmara:", err);
    alert("Erro ao aceder à câmara. Verifica as permissões no navegador.");
  }
});

// Confirmar procura
confirmarProcurar.addEventListener('click', async () => {
  const codigo = document.getElementById('codigo').value.trim();
  if (!codigo) {
    alert("Por favor, escaneia ou insere um código primeiro!");
    return;
  }

  const token = verificarSessao();
  if (!token) return;

  try {
    const response = await fetch('/procurar_equipamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ codigo })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Equipamento não encontrado.");
      return;
    }

    // Mostra os resultados
    document.getElementById('resultado-equipamento').style.display = 'block';
    document.getElementById('res-nome').innerText = data.nome;
    document.getElementById('res-localizacao').innerText = data.localizacao;
    document.getElementById('res-estado').innerText = data.estado;

  } catch (err) {
    console.error(err);
    alert("Erro ao procurar equipamento.");
  }
});

// =======================
// IMPRIMIR QR CODE
// =======================

document.getElementById('imprimir-qr').addEventListener('click', () => {
    const conteudo = document.getElementById('codigo-display').innerHTML;

    // Abre uma nova janela só com o QR
    const printWindow = window.open('', '', 'width=400,height=600');

    printWindow.document.write(`
        <html>
        <head>
            <title>Imprimir QR Code</title>
            <style>
                body {
                    font-family: Arial;
                    text-align: center;
                    padding-top: 20px;
                }
                img {
                    width: 250px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            ${conteudo}
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                }
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
});
