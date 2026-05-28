(() => {
  // --- Inicialização de Estado ---
  const params = new URLSearchParams(window.location.search);
  const actualRifaName = params.get("rifa")?.toString() || "";

  const actualRifa = JSON.parse(localStorage.getItem(actualRifaName)) || {
    points: {},
  };
  const rifaPoints = actualRifa.points;

  // Cache estático dos totais gerais para os cálculos na UI
  const totalVendidos = Object.values(rifaPoints).filter(
    (p) => p.status === "Pago" || p.status === "Não pago",
  );
  const totalPagos = totalVendidos.filter((p) => p.status === "Pago");

  let participantes = [];

  // --- Cache de Elementos do DOM ---
  const get = (id) => document.getElementById(id);
  const elements = {
    checkboxParticipante: get("checkbox-participante"),
    infosRifa: get("infos-rifa"),
    sortearButton: get("sortear-button"),
    sortearContainer: get("sortear-container"),
    numeroDiv: get("numero-participante"),
    nomeDiv: get("nome-participante"),
    participantesTable: document.querySelector("#participantes-table tbody"),
    participantesDialog: get("participantes-dialog"),
    verButton: get("ver-button"),
    homeButton: get("home-button"),
    okButton: get("ok-button"),
    audioWin: get("audio-win"),
  };

  // --- Inicializador ---
  const init = () => {
    if (!actualRifaName || Object.keys(rifaPoints).length === 0) {
      alert("Rifa inválida ou sem pontos marcados!").then(goHome);
      return;
    }

    updateParticipantesList(); // Define os participantes base iniciais
    setupEventListeners();
  };

  // --- Atualiza Lista de Participantes (Centraliza Regra de Negócio) ---
  const updateParticipantesList = () => {
    const incluirNaoPagos = elements.checkboxParticipante.checked;

    participantes = Object.entries(rifaPoints)
      .filter(
        ([_, dados]) =>
          dados.status === "Pago" ||
          (incluirNaoPagos && dados.status === "Não pago"),
      )
      .map(([numero, dados]) => ({ numero, dados }));

    // Atualiza toda a interface para bater com o novo filtro
    renderInfos();
    renderTable();
    checkSorteioValido();
  };

  // --- Renderização de Textos e UI ---
  const renderInfos = () => {
    const cleanName = actualRifaName.replace(/^rifando-/, ""); // Remove o PREFIX dinamicamente de forma segura
    elements.infosRifa.innerHTML = `
      Nome da rifa: ${cleanName}<br>
      Pontos pagos: ${totalPagos.length}/${totalVendidos.length}<br>
      Participantes filtrados: ${participantes.length}<br>
    `;
  };

  const renderTable = () => {
    if (!elements.participantesTable) return;

    elements.participantesTable.innerHTML = "";
    const fragment = document.createDocumentFragment();

    participantes.forEach((ponto) => {
      const tr = document.createElement("tr");
      const isPago = ponto.dados.status === "Pago";

      tr.innerHTML = `
        <td>${ponto.numero}</td>
        <td>${ponto.dados.nome}</td>
        <td class="${isPago ? "status-pago" : "status-nao-pago"}">${ponto.dados.status}</td>
      `;
      fragment.appendChild(tr);
    });

    elements.participantesTable.appendChild(fragment);
  };

  // --- Validação do Estado do Sorteio ---
  const checkSorteioValido = () => {
    // Esconde ou mostra os botões/avisos dependendo do número atual de participantes aptos
    const temParticipantesSuficientes = participantes.length > 1;

    if (elements.sortearButton)
      elements.sortearButton.disabled = !temParticipantesSuficientes;
    if (elements.verButton)
      elements.verButton.disabled = participantes.length === 0;
  };

  // --- Ação de Sortear (O "Roleta" Effect) ---
  const startSorteio = () => {
    if (participantes.length < 2) {
      return alert(
        "É preciso pelo menos 2 participantes para fazer o sorteio!",
      );
    }

    elements.sortearContainer.style.display = "none";
    elements.nomeDiv.classList.remove("destacado");

    // Toca áudio tratando possíveis restrições de autoplay do navegador
    elements.audioWin
      ?.play()
      .catch(() => console.log("Áudio bloqueado pelas políticas do navegador"));

    let tempo = 0;
    const duracaoTotal = 4000;
    const intervaloTempo = 100;

    const intervalo = setInterval(() => {
      const sorteado =
        participantes[Math.floor(Math.random() * participantes.length)];

      elements.numeroDiv.textContent = `Nº ${sorteado.numero}`;
      elements.nomeDiv.textContent = sorteado.dados.nome;
      tempo += intervaloTempo;

      if (tempo >= duracaoTotal) {
        clearInterval(intervalo);

        // Dispara Confete se a biblioteca externa existir
        if (typeof confetti === "function") {
          confetti({ particleCount: 250, ticks: 400 });
        }

        elements.nomeDiv.classList.add("destacado");
        elements.sortearContainer.style.display = "block"; // Devolve o container/botão caso queira sortear de novo
      }
    }, intervaloTempo);
  };

  // --- Configuração de Eventos ---
  const setupEventListeners = () => {
    elements.checkboxParticipante.addEventListener(
      "change",
      updateParticipantesList,
    );

    elements.homeButton.addEventListener("click", goHome);
    elements.okButton.addEventListener("click", () => {
      elements.participantesDialog.classList.add("hidden");
    });

    if (elements.sortearButton) {
      elements.sortearButton.addEventListener("click", startSorteio);
    }

    if (elements.verButton && elements.participantesDialog) {
      elements.verButton.addEventListener("click", () => {
        elements.participantesDialog.classList.remove("hidden");
      });
    }

    // Criação global/escutador simplificado para fechar o modal
    window.closeParticipantesDialog = () => {
      elements.participantesDialog?.classList.add("hidden");
    };
  };

  // Inicializa o módulo
  if (document.body) init();
  else window.addEventListener("DOMContentLoaded", init);
})();
