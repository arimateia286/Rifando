const params = new URLSearchParams(window.location.search);
const actualRifaName = params.get('rifa').toString();

let rifa = localStorage.getItem(actualRifaName) ? JSON.parse(localStorage.getItem(actualRifaName)) : {
  'borderColor': '#007eff',
  'backColor': '#ffffff',
  'fontColor': '#000000',
  'borderRadius': 8,
  'gap': 2,
  'borderThickness': 1.5,
  'wScale': 95,
  'hScale': 54,
  'topMargin': 29,
  'fontSize': 12,
  'background': 'Img/rifa.png',
  'pointsAmount': 200,
  'pointsPerPage': 100,
  points: {}
};

let pointsMin = 1,
  pointsMax = rifa['pointsPerPage'],
  actualPage = pointsMax / rifa['pointsAmount'],
  pageAmount = rifa['pointsAmount'] / rifa['pointsPerPage'];

const rifaContainer = get('rifa-container');
const tableContainer = get('table-container');
const sliderContainer = get('slider-container');
const barContainer = get('bar-container');
const buttonContainer = get('button-container');
const configButton = get('config-button');
const mainContainer = get('main-container');
const pointsTable = get('points-table').getElementsByTagName('tbody')[0];

const soldButton = get('sold-points');
const amountButton = get('points-amount');
const pointsBack = get('points-back');
const pagesCount = get('pages-count');
const pointsFoward = get('points-foward');
const toggleViewButton = get('toggle-view');
const imagePicker = get('image-picker');
const buttonsRow = get('buttons-row');
const pdfButton = get('pdf-button');
const transformContainer = get('transform-controls');
const screenshotButton = get('screenshot-button');
const homeScreenButton = get('home-screen-button');
homeScreenButton.addEventListener('click', goHome);

const backImage = get('back-image');
let imageW, imageH;
backImage.src = rifa['background'];
backImage.onload = function () {
  imageW = backImage.width;
  imageH = backImage.height;
  resizeContainer();
};

const borderColorButton = colorButton('border-color-button', 'da borda', 'borderColor');
const backColorButton = colorButton('back-color-button', 'do fundo', 'backColor');
const fontColorButton = colorButton('font-color-button', 'da fonte', 'fontColor');

const sliderLabel = get('slider-label');
const mainSlider = get('slider');
mainSlider.actualAction = 'none';

const sliderMinus = get('slider-minus');
const sliderPlus = get('slider-plus');

let fadeTimer = setTimeout(() => {
  configButton.classList.add('hidden');
}, 2000);

let rifaGrid, isTableView = false, pointsCounter = 0;

const sliderButtons = [
  ['fa-solid fa-arrows-left-right-to-line', 'Espaço', 'gap', 0, 10, 'Espaço entre pontos'],
  ['fa-bezier-curve', 'Raio', 'borderRadius', 0, 100, 'Raio da borda'],
  ['fa-border-all', 'Borda', 'borderThickness', 0, 6, 'Espessura da borda'],
  ['fa-left-right', 'Largura', 'wScale', 0, 100, 'Largura da rifa'],
  ['fa-up-down', 'Altura', 'hScale', 0, 100, 'Altura da rifa'],
  ['fa-down-long', 'Posição', 'topMargin', 0, 100, 'Posição da rifa'],
  ['fa-font', 'Fonte', 'fontSize', 4, 18, 'Tamanho da fonte']
];

let sliderBtnArr = [];

for (let i = 0; i < sliderButtons.length; i++) {
  const tButton = document.createElement('button');
  tButton.action = sliderButtons[i][2];
  tButton.className = 'normal-button';
  sliderBtnArr.push(tButton);
  tButton.addEventListener('click', () => {
    if (mainSlider.actualAction == tButton.action) {
      sliderContainer.classList.add('hidden');
      mainSlider.actualAction = 'none';
    } else {
      sliderContainer.classList.remove('hidden');
      mainSlider.actualAction = tButton.action;
      mainSlider.min = sliderButtons[i][3];
      mainSlider.max = sliderButtons[i][4];
      mainSlider.value = rifa[tButton.action];
      sliderLabel.innerHTML = `${sliderButtons[i][5]}: <b>${mainSlider.value}</b>`;
      mainSlider.oninput = function () {
        rifa[tButton.action] = this.value;
        sliderLabel.innerHTML = `${sliderButtons[i][5]}: <b>${mainSlider.value}</b>`;
        resizeContainer();
        changePointStyle();
      };
      sliderMinus.onclick = () => {
        mainSlider.value -= 0.5;
        rifa[tButton.action] = mainSlider.value;
        sliderLabel.innerHTML = `${sliderButtons[i][5]}: <b>${mainSlider.value}</b>`;
        resizeContainer();
        changePointStyle();
      }
      sliderPlus.onclick = () => {
        mainSlider.value = parseFloat(mainSlider.value) + 0.5;
        rifa[tButton.action] = mainSlider.value;
        sliderLabel.innerHTML = `${sliderButtons[i][5]}: <b>${mainSlider.value}</b>`;
        resizeContainer();
        changePointStyle();
      }
    }
    for (let j = 0; j < sliderBtnArr.length; j++) {
      sliderBtnArr[j].classList.remove('chosen');
      if (sliderBtnArr[j].action == mainSlider.actualAction) {
        sliderBtnArr[j].classList.add('chosen');
      }
    }
  });

  tButton.innerHTML = `<i class="fa-solid ${sliderButtons[i][0]} icon"></i>${sliderButtons[i][1]}`;
  transformContainer.appendChild(tButton);
}

function handleButtonsVisibility() {
  if (rifa['pointsPerPage'] == rifa['pointsAmount']) {
    pointsBack.classList.add('hidden');
    pagesCount.classList.add('hidden');
    pointsFoward.classList.add('hidden');
  } else {
    pointsBack.classList.remove('hidden');
    pagesCount.classList.remove('hidden');
    pointsFoward.classList.remove('hidden');
  }
}

function resetTimer() {
  clearInterval(fadeTimer);
  fadeTimer = setTimeout(() => {
    configButton.classList.add('hidden');
  }, 1000);
}

function createGrid(nMin, nMax) {
  if (rifaGrid) rifaContainer.removeChild(rifaGrid);
  rifaGrid = document.createElement('div');
  rifaGrid.classList.add('rifa-grid');
  for (let i = nMin; i <= nMax; i++) {
    const point = document.createElement('div');
    point.classList.add('rifa-point');
    point.textContent = i;
    if (rifa.points[i]) {
      point.classList.add('sold');
    }
    point.addEventListener('click', () => togglePoint(i, point));
    rifaGrid.appendChild(point);
  }
  rifaContainer.appendChild(rifaGrid);

  resizeContainer();
  changePointStyle();

  handleButtonsVisibility();

  actualPage = pointsMax / rifa['pointsPerPage'];
  pageAmount = rifa['pointsAmount'] / rifa['pointsPerPage'];

  pagesCount.innerHTML = `${actualPage}/${pageAmount}`;
  amountButton.innerHTML = `<i class="fa-solid fa-cog icon"></i>Pontos: ${rifa['pointsAmount']}`;
}

createGrid(pointsMin, pointsMax);

function colorButton(id, text, item) {
  const colorButton = get(id);
  let actualColor = rifa[item] || eval(rifa[item]);

  const pickerEl = document.createElement('div');
  colorButton.appendChild(pickerEl);

  const label = document.createElement('div');
  label.textContent = `Cor ${text}`;
  colorButton.appendChild(label);

  if (navigator.onLine) {
    const pickr = Pickr.create({
      el: pickerEl,
      theme: 'nano',

      default: actualColor,

      inline: false,

      components: {

        preview: true,
        opacity: true,
        hue: true,

        interaction: {
          hex: true,
          rgba: true,
          hsla: false,
          hsva: false,
          cmyk: true,
          input: true,
          clear: true,
          save: true
        },
      }
    });

    pickr.on('hide', instance => {
      let color = pickr.getColor();
      rifa[item] = color.toRGBA().toString();
      changePointStyle();

      pickr.applyColor();
      pickr.hide();
    });

    pickr.on('save', (color, instance) => {
      rifa[item] = color.toRGBA().toString();
      changePointStyle();
      pickr.hide();
    });

    pickr.on('change', (color, source, instance) => {
      rifa[item] = color.toRGBA().toString();
      changePointStyle();
    });
  } else {
    pickerEl.innerHTML = `<i class="fa-solid fa-square icon" style="color: ${actualColor}"></i>`;
    pickerEl.addEventListener('click', () => {
      alert('Só dá pra trocar as cores quando tu tiver com internet, man.');
    });
  }
}

function changePointStyle() {
  const rifaPoints = document.getElementsByClassName('rifa-point');
  for (let rifaPoint of rifaPoints) {
    rifaPoint.style.border = `${rifa['borderThickness']}px solid ${rifa['borderColor']}`;
    rifaPoint.style.borderRadius = `${rifa['borderRadius']}px`;
    rifaPoint.style.fontSize = `${rifa['fontSize']}pt`;
    if (rifaPoint.classList.contains('sold')) {
      rifaPoint.style.background = rifa['borderColor'];
      rifaPoint.style.color = rifa['fontColor'];
      if (rifa['borderColor'] == rifa['fontColor']) rifaPoint.style.background = 'red';
    } else {
      rifaPoint.style.background = rifa['backColor'];
      rifaPoint.style.color = rifa['fontColor'];
    }
  }
  let gap = rifa['gap'];
  rifaGrid.style.gap = `${gap}px`;
  saveRifa();
}

function resizeContainer() {
  let containerW = (rifa['wScale'] / 100) * imageW;
  let containerH = (rifa['hScale'] / 100) * imageH;
  let containerY = (rifa['topMargin'] / 100) * imageH;
  let rifaH = rifaGrid.clientHeight;

  if (containerY > imageH - rifaH) containerY = imageH - rifaH;

  mainContainer.style.width = `${containerW}px`;
  mainContainer.style.height = `${containerH}px`;
  mainContainer.style.transform = `translate(-50%, ${containerY}px)`;

  saveRifa();
}

function togglePoint(numero, elemento) {
  if (elemento.classList.contains('sold')) {
    confirm('DESMARCAR PONTO', 'Tem certeza que deseja desmarcar este ponto?')
      .then(confirmado => {
        if (confirmado) {
          elemento.classList.remove('sold');
          delete rifa.points[numero];
        }
        updateTable();
      });
  } else {
    prompt('MARCAR PONTO', 'Nome do comprador')
      .then(nome => {
        if (nome) {
          elemento.classList.add('sold');
          rifa.points[numero] = {
            nome,
            status: 'Não pago'
          };
        }
        updateTable();
      });
  }
}

function updateTable() {
  pointsCounter = 0;
  pointsTable.innerHTML = '';
  for (const [ponto, info] of Object.entries(rifa.points)) {
    const row = pointsTable.insertRow();
    row.insertCell().textContent = info.nome;
    row.insertCell().textContent = ponto;
    const statusCell = row.insertCell();
    statusCell.textContent = info.status;
    statusCell.classList.add(info.status === 'Pago' ? 'status-pago' : 'status-nao-pago');
    statusCell.addEventListener('click', () => toggleStatus(ponto));
    pointsCounter++;
  }
  soldButton.innerHTML = `<i class="fa-solid fa-check icon"></i>Vendidos: ${pointsCounter}`;

  saveRifa();
  changePointStyle();
}

function toggleStatus(ponto) {
  if (rifa.points[ponto].status === 'Não pago') {
    rifa.points[ponto].status = 'Pago';
  } else {
    rifa.points[ponto].status = 'Não pago';
  }
  updateTable();
}

function saveRifa() {
  localStorage.setItem(actualRifaName, JSON.stringify(rifa));
}

window.addEventListener('click', () => {
  configButton.classList.remove('hidden');
  if (buttonContainer.classList.contains('hidden')) resetTimer();
});

configButton.addEventListener('click', () => {
  if (buttonContainer.classList.contains('hidden')) {
    configButton.innerHTML = `<i class="fa-solid fa-xmark icon"></i>`;
    buttonContainer.classList.remove('hidden');
    clearInterval(fadeTimer);
  } else {
    sliderBtnArr.forEach((e) => e.classList.remove('chosen'));
    configButton.innerHTML = `<i class="fa-solid fa-cog icon"></i>`;
    buttonContainer.classList.add('hidden');
    sliderContainer.classList.add('hidden');
    mainSlider.actualAction = 'none';
    resetTimer();
  }
});

amountButton.addEventListener('click', () => {
  let amount = parseInt(prompt('De quantos pontos será a rifa?'));
  prompt('De quantos pontos será a rifa?')
    .then(amount_ => {
      let amount = parseInt(amount_);
      if (amount && !isNaN(amount)) {
        prompt('Quantos pontos mostrar por página?')
          .then(points_ => {
            let points = parseInt(points_);
            if (points && !isNaN(points)) {
              if (amount % points == 0) {
                rifa['pointsAmount'] = amount;
                rifa['pointsPerPage'] = points;
                pointsMin = 1, pointsMax = rifa['pointsPerPage'];
                createGrid(pointsMin, pointsMax);
              } else alert('Quantidade de pontos deve ser um múltiplo de pontos por página!');
            }
          });
      }
    });
});

pointsBack.addEventListener('click', () => {
  if (pointsMin > rifa['pointsPerPage']) {
    pointsMin -= rifa['pointsPerPage'];
    pointsMax -= rifa['pointsPerPage'];
  } else {
    pointsMin = rifa['pointsAmount'] - rifa['pointsPerPage'] + 1;
    pointsMax = rifa['pointsAmount'];
  }
  createGrid(pointsMin, pointsMax);
});

pointsFoward.addEventListener('click', () => {
  if (pointsMax < rifa['pointsAmount']) {
    pointsMin = pointsMin + rifa['pointsPerPage'];
    pointsMax = pointsMax + rifa['pointsPerPage'];
  } else {
    pointsMin = 1;
    pointsMax = rifa['pointsPerPage'];
  }
  createGrid(pointsMin, pointsMax);
});

toggleViewButton.addEventListener('click', () => {
  isTableView = !isTableView;
  if (isTableView) {
    rifaContainer.style.display = 'none';
    tableContainer.style.display = 'block';
    toggleViewButton.innerHTML = '<i class="fa-solid fa-ticket icon"></i>Ver Rifa';
    pdfButton.classList.remove('hidden');
    pointsBack.classList.add('hidden');
    pagesCount.classList.add('hidden');
    pointsFoward.classList.add('hidden');
    buttonsRow.classList.add('hidden');
    buttonContainer.classList.add('center');
  } else {
    rifaContainer.style.display = 'grid';
    tableContainer.style.display = 'none';
    toggleViewButton.innerHTML = '<i class="fa-solid fa-table icon"></i>Ver Tabela';
    pdfButton.classList.add('hidden');
    buttonsRow.classList.remove('hidden');
    buttonContainer.classList.remove('center');
    handleButtonsVisibility();
  }
});

imagePicker.addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageData = e.target.result;
      rifa['background'] = imageData;
      backImage.src = rifa['background'];
    };

    reader.readAsDataURL(file);
  }
});

pdfButton.addEventListener('click', () => {
  exportPDF(`${actualRifaName}-${getDataString()}.pdf`);
});

screenshotButton.addEventListener('click', function () {
  configButton.click();
  configButton.classList.add('hidden');
  buttonContainer.classList.add('hidden');
  sliderContainer.classList.add('hidden');
  mainSlider.actualAction = 'none';

  const element = backImage;

  const rect = element.getBoundingClientRect();
  const x = rect.left + window.scrollX;
  const y = rect.top + window.scrollY;
  const width = rect.width;
  const height = rect.height;

  html2canvas(document.body, {
    x: x,
    y: y,
    width: width,
    height: height,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
  }).then(function (canvas) {
    let base64Image = canvas.toDataURL("image/png");
    let filename = `${actualRifaName}pag${actualPage}-${getDataString()}.png`;

    if (window.Android) {
      window.Android.saveImage(base64Image, filename);
    } else {
      const link = document.createElement('a');
      link.href = base64Image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
});

function dataToArray(dados) {
  return Object.keys(dados).map((key) => {
    return [key, dados[key].nome, dados[key].status];
  });
}

function getDataString() {
  const now = new Date();
  const year = now.getFullYear();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${day}${month}${hour}${minutes}${seconds}`;
}

function exportPDF(filename) {
  const doc = new jspdf.jsPDF();

  doc.autoTable({
    theme: 'grid',
    head: [
      ["Número", "Nome", "Status"]
    ],
    body: dataToArray(rifa.points),
  });

  let base64PDF = btoa(doc.output());

  if (window.Android) {
    window.Android.savePDF(base64PDF, filename);
  } else {
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,' + base64PDF;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

updateTable();