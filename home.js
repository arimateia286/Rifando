// Encapsulando o código em um escopo limpo para evitar poluição global
(() => {
  const PREFIX = "rifando";
  let mode = "Sorteando";

  // Atalho seguro para seleção de elementos (substituindo o antigo 'get')
  const get = (id) => document.getElementById(id);

  const elements = {
    rifasList: get("rifas-list"),
    listContainer: get("list-container"),
    noRifasMessage: get("no-rifas-message"),
    buttonsContainer: get("buttons-container"),
    addButton: get("add-button"),
    importButton: get("import-button"),
    modeButton: get("mode-button"),
    helpButton: get("help-button"),
    okButton: get("ok-button"),
    appName: get("app-name"),
  };

  // --- Inicialização ---
  window.addEventListener("DOMContentLoaded", () => {
    changeMode();
    loadRifasList();
    initEventListeners();
  });

  function initEventListeners() {
    elements.addButton.addEventListener("click", handleAddRifa);
    elements.importButton.addEventListener("click", handleImportRifa);
    elements.modeButton.addEventListener("click", changeMode);
    // Abrir o modal de ajuda
    elements.helpButton.addEventListener("click", () => {
      document.getElementById("help-dialog").classList.remove("hidden");
    });

    // Fechar o modal de ajuda
    elements.okButton.addEventListener("click", () => {
      document.getElementById("help-dialog").classList.add("hidden");
    });
  }

  // --- Funções de Navegação ---
  const navigateTo = (page, rifaName) => {
    window.location.href = `${page}.html?rifa=${encodeURIComponent(rifaName)}`;
  };

  // --- Gerenciamento de Estado/Modo ---
  function changeMode() {
    mode = mode === "Rifando" ? "Sorteando" : "Rifando";

    const isRifando = mode === "Rifando";
    elements.buttonsContainer.classList.toggle("shown", isRifando);
    elements.modeButton.innerHTML = isRifando
      ? `<i class="fa-solid fa-clover"></i>`
      : `<i class="fa-solid fa-ticket"></i>`;

    elements.appName.textContent = mode;
  }

  // --- Ações Principais ---
  function handleAddRifa() {
    // Nota: Presumiu-se que 'prompt' e 'confirm' customizados retornam Promises no seu projeto original
    prompt("NOVA RIFA", "Nome da rifa").then((rifaName) => {
      if (!rifaName) return;

      const fullKey = `${PREFIX}-${rifaName.trim()}`;
      if (localStorage.getItem(fullKey)) {
        return alert("Já existe uma rifa com esse nome!");
      }
      navigateTo("rifa", fullKey);
    });
  }

  function handleImportRifa() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".rifa,application/json";

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (!file) return;

      try {
        const text = await file.text(); // API moderna para ler arquivos (substitui FileReader)
        JSON.parse(text); // Valida se é um JSON válido

        const rawName = file.name.replace(".rifa", "");
        let fullKey = `${PREFIX}-${rawName}`;

        if (localStorage.getItem(fullKey)) {
          alert("Já existe uma rifa com esse nome! Importando como cópia.");
          fullKey += " (cópia)";
        }

        localStorage.setItem(fullKey, text);

        // Renderiza novamente e limpa a URL se necessário, sem setTimeouts esquisitos
        loadRifasList();
      } catch (err) {
        alert("Erro ao importar: " + err.message);
      }
    });

    fileInput.click();
  }

  // --- Renderização da Lista ---
  function loadRifasList() {
    const keys = Object.keys(localStorage)
      .filter((key) => key.startsWith(`${PREFIX}-`))
      .sort();

    if (keys.length === 0) {
      elements.rifasList.innerHTML = "";
      elements.noRifasMessage.classList.add("shown");
      return;
    }

    elements.noRifasMessage.classList.remove("shown");
    elements.rifasList.innerHTML = "";

    // Fragmento para otimizar a inserção de múltiplos elementos no DOM de uma vez só
    const fragment = document.createDocumentFragment();

    keys.forEach((key) => {
      const cleanName = key.replace(`${PREFIX}-`, "");
      const container = document.createElement("div");
      container.className = "element-container glassy";

      // HTML interno mais limpo e legível usando Template Literals
      container.innerHTML = `
        <button class="rifa-button" data-key="${key}">${cleanName}</button>
        <button class="options-button"><i class="fa-solid fa-ellipsis-vertical icon"></i></button>
      `;

      // Evento do botão principal da rifa
      container.querySelector(".rifa-button").addEventListener("click", () => {
        navigateTo(mode === "Rifando" ? "rifa" : "sorteio", key);
      });

      // Evento do menu de opções
      container
        .querySelector(".options-button")
        .addEventListener("click", () => openOptionsDialog(key));

      fragment.appendChild(container);
    });

    elements.rifasList.appendChild(fragment);
  }

  // --- Sub-componente: Modal de Opções ---
  function openOptionsDialog(key) {
    const dialogContainer = document.createElement("div");
    dialogContainer.className = "dialog-container";

    dialogContainer.innerHTML = `
      <div class="generic-dialog">
        <div class="dialog-button header">OPÇÕES</div>
        <div class="option-button btn-delete">Apagar</div>
        <div class="option-button btn-rename">Renomear</div>
        <div class="option-button btn-copy">Copiar</div>
        <div class="option-button btn-export">Exportar</div>
        <div class="dialog-button btn-close">FECHAR</div>
      </div>
    `;

    const close = () => dialogContainer.remove();

    // Mapeamento de ações do Modal
    dialogContainer
      .querySelector(".btn-close")
      .addEventListener("click", close);

    dialogContainer
      .querySelector(".btn-delete")
      .addEventListener("click", () => {
        close();
        confirm("APAGAR RIFA", "Deseja mesmo apagar essa rifa?").then(
          (confirmed) => {
            if (confirmed) {
              localStorage.removeItem(key);
              loadRifasList();
            }
          },
        );
      });

    dialogContainer
      .querySelector(".btn-rename")
      .addEventListener("click", () => {
        close();
        prompt("RENOMEAR RIFA", "Nome da Rifa").then((newName) => {
          if (!newName) return;
          const data = localStorage.getItem(key);
          localStorage.setItem(`${PREFIX}-${newName.trim()}`, data);
          localStorage.removeItem(key);
          loadRifasList();
        });
      });

    dialogContainer.querySelector(".btn-copy").addEventListener("click", () => {
      const data = localStorage.getItem(key);
      localStorage.setItem(`${key} cópia`, data);
      loadRifasList();
      close();
    });

    dialogContainer
      .querySelector(".btn-export")
      .addEventListener("click", () => {
        const data = localStorage.getItem(key);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = `${key.replace(`${PREFIX}-`, "")}.rifa`;
        document.body.appendChild(a);
        a.click();

        a.remove();
        URL.revokeObjectURL(url);
        close();
      });

    document.body.appendChild(dialogContainer);
  }
})();
