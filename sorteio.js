const params = new URLSearchParams(window.location.search);
const actualRifaName = params.get("rifa").toString();

const actualRifa = JSON.parse(localStorage.getItem(actualRifaName));
const rifaPoints = actualRifa.points;
let participantes = Object.entries(rifaPoints)
  .filter(([numero, dados]) => dados.status === "Pago")
  .map(([numero, dados]) => ({ numero, dados }));

const checkboxParticipante = get("checkbox-participante");
checkboxParticipante.addEventListener("change", () => {
  if (checkboxParticipante.checked) {
    participantes = Object.entries(rifaPoints)
      .filter(
        ([numero, dados]) =>
          dados.status === "Pago" || dados.status === "Não pago",
      )
      .map(([numero, dados]) => ({ numero, dados }));
    updateInfosRifa();
  } else {
    participantes = Object.entries(rifaPoints)
      .filter(([numero, dados]) => dados.status === "Pago")
      .map(([numero, dados]) => ({ numero, dados }));
    updateInfosRifa();
  }
});

const vendidos = Object.values(rifaPoints).filter(
  (ponto) => ponto.status == "Pago" || ponto.status == "Não pago",
);

const pagos = vendidos.filter((ponto) => ponto.status == "Pago");

const infosRifa = get("infos-rifa");
updateInfosRifa();

if (participantes.length > 1) {
  const sortearButton = get("sortear-button");
  const sortearContainer = get("sortear-container");
  const numeroDiv = get("numero-participante");
  const nomeDiv = get("nome-participante");

  sortearButton.addEventListener("click", () => {
    sortearContainer.style.display = "none";
    let intervalo;
    let tempo = 0;
    const duracaoTotal = 4000;
    get("audio-win").play();

    intervalo = setInterval(() => {
      const sorteado =
        participantes[Math.floor(Math.random() * participantes.length)];
      numeroDiv.innerHTML = "Nº" + sorteado.numero;
      nomeDiv.innerHTML = sorteado.dados.nome;
      tempo += 100;
      if (tempo >= duracaoTotal) {
        clearInterval(intervalo);
        confetti({
          particleCount: 250,
          ticks: 400,
        });
        nomeDiv.classList.add("destacado");
      }
    }, 100);
  });

  const participantesTable = document.querySelector(
    "#participantes-table tbody",
  );
  participantesTable.innerHTML = "";
  participantes.forEach((ponto) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
	<td>${ponto.numero}</td>
	<td>${ponto.dados.nome}</td>
	`;
    if (ponto.dados.status === "Pago") {
      tr.innerHTML += `<td class="status-pago">${ponto.dados.status}</td>`;
    } else
      tr.innerHTML += `<td class="status-nao-pago">${ponto.dados.status}</td>`;

    participantesTable.appendChild(tr);
  });

  const participantesDialog = get("participantes-dialog");

  const verButton = get("ver-button");
  verButton.addEventListener("click", () => {
    participantesDialog.classList.remove("hidden");
  });

  function closeParticipantesDialog() {
    participantesDialog.classList.add("hidden");
  }
} else {
  alert("É preciso pelo menos 2 participantes para fazer o sorteio!").then(
    (result) => {
      goHome();
    },
  );
}

function updateInfosRifa() {
  infosRifa.innerHTML = `
	${actualRifaName.slice(8, actualRifaName.length)}<br>
	Pontos pagos: ${pagos.length}/${vendidos.length}<br>
	Participantes: ${participantes.length}<br>
	`;
}
