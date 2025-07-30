let mode = 'Sorteando', rifasList;

const listContainer = get('list-container');
const addButton = get('add-button');
const modeButton = get('mode-button');
const appName = get('app-name');

function loadRifasList() {
  keys = Object.keys(localStorage).sort().filter(key => key.startsWith('rifando-'));
  if (keys.length > 0) {
    if (rifasList) listContainer.removeChild(rifasList);
    rifasList = document.createElement('div');
    rifasList.className = 'rifas-list';

    keys.forEach(key => {

      const elementContainer = document.createElement('div');
      elementContainer.className = 'element-container glassy';

      const rifaButton = document.createElement('button');
      rifaButton.className = 'rifa-button';
      rifaButton.textContent = key.slice(8, key.toString().length);
      rifaButton.addEventListener('click', () => {
        if (mode == 'Rifando') loadRifa(key.toString());
        else loadSorteio(key.toString());
      });

      elementContainer.appendChild(rifaButton);

      const optionsButton = document.createElement('button');
      optionsButton.innerHTML = '<i class="fa-solid fa-ellipsis-vertical icon"></i>';
      optionsButton.classList.add('options-button');
      optionsButton.addEventListener('click', () => {
        const optionsDialog = document.createElement('dialog');
        optionsDialog.className = 'generic-dialog';

        const optionsDialogTitle = document.createElement('div');
        optionsDialogTitle.className = 'dialog-button';
        optionsDialogTitle.textContent = 'OPÇÕES';

        const deleteButton = document.createElement('div');
        deleteButton.className = 'option-button';
        deleteButton.textContent = 'Apagar rifa';
        deleteButton.addEventListener('click', () => {
          confirm('APAGAR RIFA', 'Deseja mesmo apagar essa rifa?')
            .then((result) => {
              if (result) {
                localStorage.removeItem(key.toString());
                loadRifasList();
                optionsDialog.close();
                document.body.removeChild(optionsDialog);
              }
            });
        });

        const renameButton = document.createElement('div');
        renameButton.className = 'option-button';
        renameButton.textContent = 'Renomear rifa';
        renameButton.addEventListener('click', () => {
          prompt('RENOMEAR RIFA', 'Nome da Rifa')
            .then((result) => {
              if (result) {
                localStorage.setItem(`rifando-${result}`, localStorage.getItem(key.toString()));
                localStorage.removeItem(key.toString());
                loadRifasList();
                optionsDialog.close();
                document.body.removeChild(optionsDialog);
              }
            });

        });

        const copyButton = document.createElement('div');
        copyButton.className = 'option-button';
        copyButton.textContent = 'Copiar rifa';
        copyButton.addEventListener('click', () => {
          localStorage.setItem(`${key.toString()} cópia`, localStorage.getItem(key.toString()));
          loadRifasList();
          optionsDialog.close();
          document.body.removeChild(optionsDialog);
        });

        const closeDialogButton = document.createElement('div');
        closeDialogButton.className = 'dialog-button';
        closeDialogButton.textContent = 'FECHAR';
        closeDialogButton.addEventListener('click', () => {
          optionsDialog.close();
          document.body.removeChild(optionsDialog);
        });

        optionsDialog.append(optionsDialogTitle, deleteButton, renameButton, copyButton, closeDialogButton);

        document.body.append(optionsDialog);

        optionsDialog.showModal();
      });

      elementContainer.appendChild(optionsButton);

      rifasList.appendChild(elementContainer);
    });

    listContainer.appendChild(rifasList);
  } else {
    if (rifasList) listContainer.removeChild(rifasList);
    const noRifasMessage = document.createElement('span');
    noRifasMessage.className = 'no-rifas-message';
    noRifasMessage.innerHTML =
      `
    Sem rifas por enquanto!<br>Crie uma pelo botão + abaixo, ou se é sua primeira vez aqui, clique no botão ? acima para saber mais.
    `;
    listContainer.appendChild(noRifasMessage);
  }
}

function loadRifa(rifaName) {
  window.location.href = `rifa.html?rifa=${rifaName}`;
}

function loadSorteio(rifaName) {
  window.location.href = `sorteio.html?rifa=${rifaName}`;
}

function changeMode() {
  if (mode === 'Rifando') {
    mode = 'Sorteando';
    addButton.classList.add('hidden');
    modeButton.innerHTML = `<i class="fa-solid fa-ticket icon"></i>`;
  } else {
    mode = 'Rifando';
    modeButton.innerHTML = `<i class="fa-solid fa-clover icon"></i>`;
    addButton.classList.remove('hidden');
    addButton.addEventListener('click', () => {
      prompt("NOVA RIFA", "Nome da rifa")
        .then((rifaName) => {
          if (rifaName) {
            if (localStorage.getItem(`rifando-${rifaName}`)) {
              alert('Já existe uma rifa com esse nome!');
            } else {
              loadRifa(`rifando-${rifaName}`);
            }
          }
        });
    });
  }

  appName.textContent = mode;
}

changeMode();
loadRifasList();