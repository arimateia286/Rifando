(function injectCustomDialogs() {
    const html = `
  <dialog id="custom-prompt" class="generic-dialog hidden">
    <div id="custom-prompt-title" class="dialog-button centered"></div>
    <input type="text" class="prompt-input" id="custom-prompt-input" autocomplete="off" required>
    <div class="row">
      <div class="dialog-button bordered" onclick="handlePromptCancel()">Cancelar</div>
      <div class="dialog-button" onclick="handlePromptConfirm()">Ok</div>
    </div>
  </dialog>

  <dialog id="custom-confirm" class="generic-dialog hidden">
    <div id="custom-confirm-title" class="dialog-button centered"></div>
    <p id="custom-confirm-message"></p>
    <div class="row">
      <div class="dialog-button bordered" onclick="confirmResolve(false)">Não</div>
      <div class="dialog-button" onclick="confirmResolve(true)">Sim</div>
    </div>
  </dialog>

  <dialog id="custom-alert" class="generic-dialog hidden">
    <div class="dialog-button centered">AVISO</div>
    <p id="custom-alert-message"></p>
    <div class="dialog-button" onclick="handleAlertClose()">Ok</div>
  </dialog>
  `;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
})();

const get = (id) => document.getElementById(id);

let promptResolve, confirmResolve, alertResolve;

function showCustomPrompt(titleMsg, placeholderStr, resolve) {
    const dialog = get('custom-prompt');
    const input = get('custom-prompt-input');
    input.value = '';
    const title = get('custom-prompt-title');

    title.textContent = titleMsg;
    input.placeholder = placeholderStr;
    dialog.style.display = 'flex';
    dialog.showModal();

    promptResolve = resolve;
}

function handlePromptConfirm() {
    const input = get('custom-prompt-input');
    get('custom-prompt').close();
    get('custom-prompt').style.display = 'none';
    promptResolve(input.value);
}

function handlePromptCancel() {
    get('custom-prompt').close();
    get('custom-prompt').style.display = 'none';
    promptResolve(null);
}

function showCustomConfirm(title, message, resolve) {
    get('custom-confirm-title').textContent = title;
    get('custom-confirm-message').textContent = message;
    get('custom-confirm').style.display = 'flex';
    get('custom-confirm').showModal();
    confirmResolve = (result) => {
        get('custom-confirm').close();
        get('custom-confirm').style.display = 'none';
        resolve(result);
    };
}

function showCustomAlert(message) {
    get('custom-alert-message').textContent = message;
    get('custom-alert').style.display = 'flex';
    get('custom-alert').showModal();

    return new Promise((resolve) => {
        alertResolve = resolve;
    });
}

function handleAlertClose() {
    get('custom-alert').close();
    get('custom-alert').style.display = 'none';
    if (alertResolve) alertResolve();
}

window.prompt = function (message, defaultText = '') {
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