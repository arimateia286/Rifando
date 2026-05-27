(function injectCustomDialogs() {
  const html = `
  <div id="custom-prompt" class="dialog-container hidden">
    <div class="generic-dialog">
        <div id="custom-prompt-title" class="dialog-button centered"></div>
        <input type="text" class="prompt-input" id="custom-prompt-input" autocomplete="off" required>
        <div class="row">
            <div class="dialog-button bordered" onclick="handlePromptCancel()">Cancelar</div>
            <div class="dialog-button" onclick="handlePromptConfirm()">Ok</div>
        </div>
    </div>
  </div>

  <div id="custom-confirm" class="dialog-container hidden">
    <div class="generic-dialog">
        <div id="custom-confirm-title" class="dialog-button centered"></div>
        <p id="custom-confirm-message"></p>
        <div class="row">
            <div class="dialog-button bordered" onclick="confirmResolve(false)">Não</div>
            <div class="dialog-button" onclick="confirmResolve(true)">Sim</div>
        </div>
    </div>
  </div>

  <div id="custom-alert" class="dialog-container hidden">
    <div class="generic-dialog">
        <div class="dialog-button centered">AVISO</div>
        <p id="custom-alert-message"></p>
        <div class="dialog-button" onclick="handleAlertClose()">Ok</div>
    </div>
  </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
})();

const get = (id) => document.getElementById(id);

let promptResolve, confirmResolve, alertResolve;

function showCustomPrompt(titleMsg, placeholderStr, resolve) {
  const dialog = get("custom-prompt");
  const input = get("custom-prompt-input");
  input.value = "";
  const title = get("custom-prompt-title");

  title.textContent = titleMsg;
  input.placeholder = placeholderStr;
  promptResolve = resolve;

  dialog.classList.remove("hidden");
}

function handlePromptConfirm() {
  const input = get("custom-prompt-input");
  get("custom-prompt").classList.add("hidden");
  promptResolve(input.value);
}

function handlePromptCancel() {
  get("custom-prompt").classList.add("hidden");
  promptResolve(null);
}

function showCustomConfirm(title, message, resolve) {
  get("custom-confirm-title").textContent = title;
  get("custom-confirm-message").textContent = message;
  get("custom-confirm").classList.remove("hidden");
  confirmResolve = (result) => {
    get("custom-confirm").classList.add("hidden");
    resolve(result);
  };
}

function showCustomAlert(message) {
  get("custom-alert-message").textContent = message;
  get("custom-alert").classList.remove("hidden");

  return new Promise((resolve) => {
    alertResolve = resolve;
  });
}

function handleAlertClose() {
  get("custom-alert").classList.add("hidden");
  if (alertResolve) alertResolve();
}

window.prompt = function (message, defaultText = "") {
  return new Promise((resolve) => {
    showCustomPrompt(message, defaultText, resolve);
  });
};

window.confirm = function (title, message) {
  return new Promise((resolve) => {
    showCustomConfirm(title, message, resolve);
  });
};

window.alert = function (message) {
  return showCustomAlert(message);
};

function goHome() {
  window.location.href = "index.html";
}
