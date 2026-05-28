(() => {
  // 1. Injeta o HTML apenas quando o DOM estiver pronto
  const injectDialogs = () => {
    const html = `
      <div id="custom-prompt" class="dialog-container hidden">
        <div class="generic-dialog">
          <div class="dialog-title dialog-button centered"></div>
          <input type="text" class="prompt-input" autocomplete="off" required>
          <div class="dialog-btns-row">
            <div class="dialog-button btn-cancel">Cancelar</div>
            <div class="dialog-button btn-ok">Ok</div>
          </div>
        </div>
      </div>

      <div id="custom-confirm" class="dialog-container hidden">
        <div class="generic-dialog">
          <div class="dialog-title dialog-button centered"></div>
          <p class="dialog-message"></p>
          <div class="dialog-btns-row">
            <div class="dialog-button btn-no">Não</div>
            <div class="dialog-button btn-yes">Sim</div>
          </div>
        </div>
      </div>

      <div id="custom-alert" class="dialog-container hidden">
        <div class="generic-dialog">
          <div class="dialog-button centered">AVISO</div>
          <p class="dialog-message"></p>
          <div class="dialog-button btn-close">Ok</div>
        </div>
      </div>
    `;

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    setupEventListeners();
  };

  // Cache dos elementos para evitar buscas repetidas no DOM (Otimização de performance)
  let elements = {};

  // 2. Vincula os eventos diretamente via JS (Adeus 'onclick' no HTML)
  const setupEventListeners = () => {
    elements = {
      prompt: document.getElementById("custom-prompt"),
      confirm: document.getElementById("custom-confirm"),
      alert: document.getElementById("custom-alert"),
    };

    // Sub-elementos do Prompt
    elements.promptInput = elements.prompt.querySelector(".prompt-input");
    elements.promptTitle = elements.prompt.querySelector(".dialog-title");

    // Sub-elementos do Confirm
    elements.confirmTitle = elements.confirm.querySelector(".dialog-title");
    elements.confirmMessage = elements.confirm.querySelector(".dialog-message");

    // Sub-elementos do Alert
    elements.alertMessage = elements.alert.querySelector(".dialog-message");
  };

  // Executa a injeção assim que o DOM estiver disponível
  if (document.body) injectDialogs();
  else window.addEventListener("DOMContentLoaded", injectDialogs);

  // --- Sobrescrita dos Métodos Globais com Escopo Isolado ---

  window.prompt = function (titleMsg, placeholderStr = "") {
    return new Promise((resolve) => {
      elements.promptTitle.textContent = titleMsg;
      elements.promptInput.placeholder = placeholderStr;
      elements.promptInput.value = "";
      elements.prompt.classList.remove("hidden");
      elements.promptInput.focus();

      // Funções de limpeza de evento para evitar vazamento de memória (Memory Leak)
      const handleConfirm = () => {
        cleanup();
        resolve(elements.promptInput.value);
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleKeyDown = (e) => {
        if (e.key === "Enter") handleConfirm();
        if (e.key === "Escape") handleCancel();
      };

      const cleanup = () => {
        elements.prompt.classList.add("hidden");
        elements.prompt
          .querySelector(".btn-ok")
          .removeEventListener("click", handleConfirm);
        elements.prompt
          .querySelector(".btn-cancel")
          .removeEventListener("click", handleCancel);
        elements.promptInput.removeEventListener("keydown", handleKeyDown);
      };

      elements.prompt
        .querySelector(".btn-ok")
        .addEventListener("click", handleConfirm);
      elements.prompt
        .querySelector(".btn-cancel")
        .addEventListener("click", handleCancel);
      elements.promptInput.addEventListener("keydown", handleKeyDown);
    });
  };

  window.confirm = function (title, message) {
    return new Promise((resolve) => {
      elements.confirmTitle.textContent = title;
      elements.confirmMessage.textContent = message;
      elements.confirm.classList.remove("hidden");

      const handleYes = () => {
        cleanup();
        resolve(true);
      };
      const handleNo = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        elements.confirm.classList.add("hidden");
        elements.confirm
          .querySelector(".btn-yes")
          .removeEventListener("click", handleYes);
        elements.confirm
          .querySelector(".btn-no")
          .removeEventListener("click", handleNo);
      };

      elements.confirm
        .querySelector(".btn-yes")
        .addEventListener("click", handleYes);
      elements.confirm
        .querySelector(".btn-no")
        .addEventListener("click", handleNo);
    });
  };

  window.alert = function (message) {
    return new Promise((resolve) => {
      elements.alertMessage.textContent = message;
      elements.alert.classList.remove("hidden");

      const handleClose = () => {
        elements.alert.classList.add("hidden");
        elements.alert
          .querySelector(".btn-close")
          .removeEventListener("click", handleClose);
        resolve();
      };

      elements.alert
        .querySelector(".btn-close")
        .addEventListener("click", handleClose);
    });
  };

  // Função utilitária global de navegação
  window.goHome = function () {
    window.location.href = "index.html";
  };
})();
