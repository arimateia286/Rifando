let mode = "Sorteando",
  rifasList;

const listContainer = get("list-container");
const noRifasMessage = get("no-rifas-message");
const buttonsContainer = get("buttons-container");
const addButton = get("add-button");
addButton.addEventListener("click", () => {
  prompt("NOVA RIFA", "Nome da rifa").then((rifaName) => {
    if (rifaName) {
      if (localStorage.getItem(`rifando-${rifaName}`)) {
        alert("Já existe uma rifa com esse nome!");
      } else {
        loadRifa(`rifando-${rifaName}`);
      }
    }
  });
});
const importButton = get("import-button");
importButton.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".rifa,application/json";
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rifaData = reader.result;

        JSON.parse(rifaData);

        const rifaName = file.name.replace(".rifa", "");
        if (localStorage.getItem(`rifando-${rifaName}`)) {
          alert("Já existe uma rifa com esse nome! Importando como cópia.");
          localStorage.setItem(`rifando-${rifaName} (cópia)`, rifaData);
        } else {
          localStorage.setItem(`rifando-${rifaName}`, rifaData);
        }
      } catch (e) {
        alert("Erro: " + e.message);
      }
    };
    reader.readAsText(file);

    setTimeout(() => {
      loadRifasList();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }, 500);
  });
  fileInput.click();
});
const modeButton = get("mode-button");
const appName = get("app-name");

function loadRifasList() {
  keys = Object.keys(localStorage)
    .sort()
    .filter((key) => key.startsWith("rifando-"));
  if (keys.length > 0) {
    if (rifasList) listContainer.removeChild(rifasList);
    rifasList = document.createElement("div");
    rifasList.className = "rifas-list";

    keys.forEach((key) => {
      const elementContainer = document.createElement("div");
      elementContainer.className = "element-container glassy";

      const rifaButton = document.createElement("button");
      rifaButton.className = "rifa-button";
      rifaButton.textContent = key.slice(8, key.toString().length);
      rifaButton.addEventListener("click", () => {
        if (mode == "Rifando") loadRifa(key.toString());
        else loadSorteio(key.toString());
      });

      elementContainer.appendChild(rifaButton);

      const optionsButton = document.createElement("button");
      optionsButton.innerHTML =
        '<i class="fa-solid fa-ellipsis-vertical icon"></i>';
      optionsButton.className = "options-button";
      optionsButton.addEventListener("click", () => {
        const dialogContainer = document.createElement("div");
        dialogContainer.className = "dialog-container";

        const optionsDialog = document.createElement("div");
        optionsDialog.className = "generic-dialog";

        const optionsDialogTitle = document.createElement("div");
        optionsDialogTitle.className = "dialog-button";
        optionsDialogTitle.textContent = "OPÇÕES";

        const deleteButton = document.createElement("div");
        deleteButton.className = "option-button";
        deleteButton.textContent = "Apagar";
        deleteButton.addEventListener("click", () => {
          document.body.removeChild(dialogContainer);

          confirm("APAGAR RIFA", "Deseja mesmo apagar essa rifa?").then(
            (result) => {
              if (result) {
                localStorage.removeItem(key.toString());
                loadRifasList();
              }
            },
          );
        });

        const renameButton = document.createElement("div");
        renameButton.className = "option-button";
        renameButton.textContent = "Renomear";
        renameButton.addEventListener("click", () => {
          document.body.removeChild(dialogContainer);

          prompt("RENOMEAR RIFA", "Nome da Rifa").then((result) => {
            if (result) {
              localStorage.setItem(
                `rifando-${result}`,
                localStorage.getItem(key.toString()),
              );
              localStorage.removeItem(key.toString());
              loadRifasList();
            }
          });
        });

        const copyButton = document.createElement("div");
        copyButton.className = "option-button";
        copyButton.textContent = "Copiar";
        copyButton.addEventListener("click", () => {
          localStorage.setItem(
            `${key.toString()} cópia`,
            localStorage.getItem(key.toString()),
          );
          loadRifasList();

          document.body.removeChild(dialogContainer);
        });

        const exportButton = document.createElement("div");
        exportButton.className = "option-button";
        exportButton.textContent = "Exportar";
        exportButton.addEventListener("click", () => {
          const rifaData = localStorage.getItem(key.toString());
          const blob = new Blob([rifaData], { type: "application/json" });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `${key.toString().split("-")[1]}.rifa`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          document.body.removeChild(dialogContainer);
        });

        const closeDialogButton = document.createElement("div");
        closeDialogButton.className = "dialog-button";
        closeDialogButton.textContent = "FECHAR";
        closeDialogButton.addEventListener("click", () => {
          document.body.removeChild(dialogContainer);
        });

        optionsDialog.append(
          optionsDialogTitle,
          deleteButton,
          renameButton,
          copyButton,
          exportButton,
          closeDialogButton,
        );

        dialogContainer.append(optionsDialog);

        document.body.append(dialogContainer);
      });

      elementContainer.appendChild(optionsButton);

      rifasList.appendChild(elementContainer);
    });

    listContainer.appendChild(rifasList);
    noRifasMessage.classList.remove("shown");
  } else {
    if (rifasList) listContainer.removeChild(rifasList);
    noRifasMessage.classList.add("shown");
  }
}

function loadRifa(rifaName) {
  window.location.href = `rifa.html?rifa=${rifaName}`;
}

function loadSorteio(rifaName) {
  window.location.href = `sorteio.html?rifa=${rifaName}`;
}

function changeMode() {
  if (mode === "Rifando") {
    mode = "Sorteando";
    buttonsContainer.classList.remove("shown");
    modeButton.innerHTML = `<i class="fa-solid fa-ticket icon"></i>`;
  } else {
    mode = "Rifando";
    modeButton.innerHTML = `<i class="fa-solid fa-clover icon"></i>`;
    buttonsContainer.classList.add("shown");
  }

  appName.textContent = mode;
}

changeMode();
loadRifasList();
