(() => {
  // --- Estado Global Isolado ---
  const params = new URLSearchParams(window.location.search);
  const actualRifaName = params.get("rifa")?.toString() || "default";

  // Objeto padrão isolado
  const DEFAULT_RIFA = {
    borderColor: "#39bd00ff",
    borderRadius: 8,
    borderThickness: 2,
    backColor: "#0000001a",
    fontColor: "#ffffff",
    fontSize: 12,
    gap: 2,
    wScale: 92.5,
    hScale: 51,
    topMargin: 35.5,
    background: "Img/rifa.png",
    pointsAmount: 200,
    pointsPerPage: 100,
    points: {},
  };

  let rifa = JSON.parse(localStorage.getItem(actualRifaName)) || {
    ...DEFAULT_RIFA,
  };

  let pointsMin = 1;
  let pointsMax = rifa.pointsPerPage;
  let actualPage = pointsMax / rifa.pointsPerPage;
  let pageAmount = rifa.pointsAmount / rifa.pointsPerPage;
  let imageW = 0,
    imageH = 0;
  let rifaGrid = null;
  let isTableView = false;
  let fadeTimer = null;
  const sliderBtnArr = [];

  // --- Cache de Elementos do DOM ---
  const get = (id) => document.getElementById(id);
  const elements = {
    rifaContainer: get("rifa-container"),
    tableContainer: get("table-container"),
    sliderContainer: get("slider-container"),
    barContainer: get("bar-container"),
    buttonContainer: get("button-container"),
    configButton: get("config-button"),
    mainContainer: get("main-container"),
    pointsTable: get("points-table").getElementsByTagName("tbody")[0],
    soldButton: get("sold-points"),
    amountButton: get("points-amount"),
    pointsBack: get("points-back"),
    pagesCount: get("pages-count"),
    pointsFoward: get("points-foward"),
    toggleViewButton: get("toggle-view"),
    imagePicker: get("image-picker"),
    buttonsRow: get("buttons-row"),
    pdfButton: get("pdf-button"),
    transformContainer: get("transform-controls"),
    screenshotButton: get("screenshot-button"),
    homeScreenButton: get("home-screen-button"),
    backImage: get("back-image"),
    sliderLabel: get("slider-label"),
    mainSlider: get("slider"),
    sliderMinus: get("slider-minus"),
    sliderPlus: get("slider-plus"),
  };

  // Definições de configuração dos controles deslizantes
  const SLIDER_CONFIGS = [
    {
      icon: "fa-arrows-left-right-to-line",
      text: "Espaço",
      prop: "gap",
      min: 0,
      max: 10,
      label: "Espaço entre pontos",
    },
    {
      icon: "fa-bezier-curve",
      text: "Raio",
      prop: "borderRadius",
      min: 0,
      max: 100,
      label: "Raio da borda",
    },
    {
      icon: "fa-border-all",
      text: "Borda",
      prop: "borderThickness",
      min: 0,
      max: 6,
      label: "Espessura da borda",
    },
    {
      icon: "fa-left-right",
      text: "Largura",
      prop: "wScale",
      min: 0,
      max: 100,
      label: "Largura da rifa",
    },
    {
      icon: "fa-up-down",
      text: "Altura",
      prop: "hScale",
      min: 0,
      max: 100,
      label: "Altura da rifa",
    },
    {
      icon: "fa-down-long",
      text: "Posição",
      prop: "topMargin",
      min: 0,
      max: 100,
      label: "Posição da rifa",
    },
    {
      icon: "fa-font",
      text: "Fonte",
      prop: "fontSize",
      min: 4,
      max: 18,
      label: "Tamanho da fonte",
    },
  ];

  // --- Inicialização ---
  const init = () => {
    elements.mainSlider.actualAction = "none";
    elements.backImage.src = rifa.background;
    elements.backImage.onload = () => {
      imageW = elements.backImage.width;
      imageH = elements.backImage.height;
      resizeContainer();
    };

    setupColorButtons();
    buildSliderControls();
    setupEventListeners();
    createGrid(pointsMin, pointsMax);
    updateTable();
    resetTimer();
  };

  // --- Gerenciamento dos Sliders ---
  const buildSliderControls = () => {
    const fragment = document.createDocumentFragment();

    SLIDER_CONFIGS.forEach((config) => {
      const btn = document.createElement("button");
      btn.action = config.prop;
      btn.className = "normal-button";
      btn.innerHTML = `<i class="fa-solid ${config.icon} icon"></i>${config.text}`;

      btn.addEventListener("click", () => handleSliderClick(btn, config));
      sliderBtnArr.push(btn);
      fragment.appendChild(btn);
    });

    elements.transformContainer.appendChild(fragment);
  };

  const handleSliderClick = (clickedBtn, config) => {
    const slider = elements.mainSlider;

    if (slider.actualAction === clickedBtn.action) {
      elements.sliderContainer.classList.add("hidden");
      slider.actualAction = "none";
    } else {
      elements.sliderContainer.classList.remove("hidden");
      slider.actualAction = clickedBtn.action;
      slider.min = config.min;
      slider.max = config.max;
      slider.value = rifa[config.prop];

      updateSliderUI(config.label, slider.value);

      const updateValues = (val) => {
        slider.value = val;
        rifa[config.prop] = val;
        updateSliderUI(config.label, val);
        resizeContainer();
        applyPointStyles();
      };

      slider.oninput = (e) => updateValues(e.target.value);
      elements.sliderMinus.onclick = () =>
        updateValues(Math.max(config.min, parseFloat(slider.value) - 0.5));
      elements.sliderPlus.onclick = () =>
        updateValues(Math.min(config.max, parseFloat(slider.value) + 0.5));
    }

    sliderBtnArr.forEach((btn) =>
      btn.classList.toggle("chosen", btn.action === slider.actualAction),
    );
  };

  const updateSliderUI = (label, val) => {
    elements.sliderLabel.innerHTML = `${label}: <b>${val}</b>`;
  };

  // --- Seletores de Cores (Pickr) ---
  const setupColorButtons = () => {
    const colorConfigs = [
      { id: "border-color-button", text: "da borda", prop: "borderColor" },
      { id: "back-color-button", text: "do fundo", prop: "backColor" },
      { id: "font-color-button", text: "da fonte", prop: "fontColor" },
    ];

    colorConfigs.forEach(({ id, text, prop }) => {
      const btn = get(id);
      if (!btn) return;

      const pickerEl = document.createElement("div");
      const label = document.createElement("div");
      label.textContent = `Cor ${text}`;
      btn.append(pickerEl, label);

      const pickr = Pickr.create({
        el: pickerEl,
        theme: "nano",
        default: rifa[prop],
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            hex: true,
            rgba: true,
            input: true,
            clear: true,
            save: true,
          },
        },
      });

      const updateColor = (color) => {
        rifa[prop] = color.toRGBA().toString();
        applyPointStyles();
      };

      pickr
        .on("hide", () => {
          pickr.applyColor();
          pickr.hide();
        })
        .on("save", (color) => {
          updateColor(color);
          pickr.hide();
        })
        .on("change", (color) => updateColor(color));
    });
  };

  // --- Renderização Eficiente da Grid ---
  function createGrid(nMin, nMax) {
    if (rifaGrid) rifaGrid.remove();

    rifaGrid = document.createElement("div");
    rifaGrid.classList.add("rifa-grid");

    const fragment = document.createDocumentFragment();

    for (let i = nMin; i <= nMax; i++) {
      const point = document.createElement("div");
      point.className = `rifa-point${rifa.points[i] ? " sold" : ""}`;
      point.textContent = i;
      point.addEventListener("click", () => togglePoint(i, point));
      fragment.appendChild(point);
    }

    rifaGrid.appendChild(fragment);
    elements.rifaContainer.appendChild(rifaGrid);

    resizeContainer();
    applyPointStyles();
    handleButtonsVisibility();

    actualPage = nMax / rifa.pointsPerPage;
    pageAmount = rifa.pointsAmount / rifa.pointsPerPage;

    elements.pagesCount.textContent = `${actualPage}/${pageAmount}`;
    elements.amountButton.innerHTML = `<i class="fa-solid fa-cog icon"></i>Pontos: ${rifa.pointsAmount}`;
  }

  function applyPointStyles() {
    if (!rifaGrid) return;

    // Evita reflows aplicando o gap diretamente no container da Grid
    rifaGrid.style.gap = `${rifa.gap}px`;

    // Cache dinâmico dos estilos para evitar releitura de propriedades do objeto
    const {
      borderThickness,
      borderColor,
      borderRadius,
      fontSize,
      backColor,
      fontColor,
    } = rifa;
    const borderStyle = `${borderThickness}px solid ${borderColor}`;
    const fontStyle = `${fontSize}pt`;
    const isCollision = borderColor === fontColor;

    const points = rifaGrid.getElementsByClassName("rifa-point");

    // Loop de alta performance usando variáveis em cache
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.style.border = borderStyle;
      p.style.borderRadius = `${borderRadius}px`;
      p.style.fontSize = fontStyle;

      if (p.classList.contains("sold")) {
        p.style.backgroundColor = isCollision ? "red" : borderColor;
        p.style.color = fontColor;
      } else {
        p.style.backgroundColor = backColor;
        p.style.color = fontColor;
      }
    }
    saveRifa();
  }

  function resizeContainer() {
    const containerW = (rifa.wScale / 100) * imageW;
    const containerH = (rifa.hScale / 100) * imageH;
    let containerY = (rifa.topMargin / 100) * imageH;

    if (rifaGrid) {
      const rifaH = rifaGrid.clientHeight;
      if (containerY > imageH - rifaH) containerY = imageH - rifaH;
    }

    elements.mainContainer.style.width = `${containerW}px`;
    elements.mainContainer.style.height = `${containerH}px`;
    elements.mainContainer.style.transform = `translate(-50%, ${containerY}px)`;
    saveRifa();
  }

  // --- Operações de Compra / Marcação ---
  function togglePoint(numero, elemento) {
    if (elemento.classList.contains("sold")) {
      confirm(
        "DESMARCAR PONTO",
        "Tem certeza que deseja desmarcar este ponto?",
      ).then((confirmado) => {
        if (confirmado) {
          elemento.classList.remove("sold");
          delete rifa.points[numero];
          updateTable();
        }
      });
    } else {
      prompt("MARCAR PONTO", "Nome do comprador").then((nome) => {
        if (nome?.trim()) {
          elemento.classList.add("sold");
          rifa.points[numero] = { nome: nome.trim(), status: "Não pago" };
          updateTable();
        }
      });
    }
  }

  function updateTable() {
    elements.pointsTable.innerHTML = "";
    let pointsCounter = 0;
    const fragment = document.createDocumentFragment();

    Object.entries(rifa.points).forEach(([ponto, info]) => {
      const row = document.createElement("tr");

      const cNome = document.createElement("td");
      cNome.textContent = info.nome;
      const cPonto = document.createElement("td");
      cPonto.textContent = ponto;
      const cStatus = document.createElement("td");
      cStatus.textContent = info.status;
      cStatus.className =
        info.status === "Pago" ? "status-pago" : "status-nao-pago";

      cStatus.addEventListener("click", () => {
        info.status = info.status === "Não pago" ? "Pago" : "Não pago";
        updateTable();
      });

      row.append(cNome, cPonto, cStatus);
      fragment.appendChild(row);
      pointsCounter++;
    });

    elements.pointsTable.appendChild(fragment);
    elements.soldButton.innerHTML = `<i class="fa-solid fa-check icon"></i>Vendidos: ${pointsCounter}`;

    saveRifa();
    applyPointStyles();
  }

  // --- Eventos da UI e Navegação de Páginas ---
  const handleButtonsVisibility = () => {
    const isSinglePage = rifa.pointsPerPage === rifa.pointsAmount;
    elements.pointsBack.classList.toggle("hidden", isSinglePage);
    elements.pagesCount.classList.toggle("hidden", isSinglePage);
    elements.pointsFoward.classList.toggle("hidden", isSinglePage);
  };

  const resetTimer = () => {
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(
      () => elements.configButton.classList.add("hidden"),
      1000,
    );
  };

  const saveRifa = () =>
    localStorage.setItem(actualRifaName, JSON.stringify(rifa));

  const setupEventListeners = () => {
    elements.homeScreenButton.addEventListener("click", goHome);

    window.addEventListener("click", () => {
      elements.configButton.classList.remove("hidden");
      if (elements.buttonContainer.classList.contains("hidden")) resetTimer();
    });

    elements.configButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = elements.buttonContainer.classList.contains("hidden");

      if (isHidden) {
        elements.configButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
        elements.buttonContainer.classList.remove("hidden");
        clearTimeout(fadeTimer);
      } else {
        sliderBtnArr.forEach((btn) => btn.classList.remove("chosen"));
        elements.configButton.innerHTML = `<i class="fa-solid fa-cog"></i>`;
        elements.buttonContainer.classList.add("hidden");
        elements.sliderContainer.classList.add("hidden");
        elements.mainSlider.actualAction = "none";
        resetTimer();
      }
    });

    elements.amountButton.addEventListener("click", () => {
      prompt("De quantos pontos será a rifa?").then((amountStr) => {
        const amount = parseInt(amountStr);
        if (!amount || isNaN(amount)) return;

        prompt("Quantos pontos mostrar por página?").then((pointsStr) => {
          const points = parseInt(pointsStr);
          if (!points || isNaN(points)) return;

          if (amount % points === 0) {
            rifa.pointsAmount = amount;
            rifa.pointsPerPage = points;
            pointsMin = 1;
            pointsMax = points;
            createGrid(pointsMin, pointsMax);
          } else {
            alert(
              "Quantidade de pontos deve ser um múltiplo de pontos por página!",
            );
          }
        });
      });
    });

    elements.pointsBack.addEventListener("click", () => {
      if (pointsMin > rifa.pointsPerPage) {
        pointsMin -= rifa.pointsPerPage;
        pointsMax -= rifa.pointsPerPage;
      } else {
        pointsMin = rifa.pointsAmount - rifa.pointsPerPage + 1;
        pointsMax = rifa.pointsAmount;
      }
      createGrid(pointsMin, pointsMax);
    });

    elements.pointsFoward.addEventListener("click", () => {
      if (pointsMax < rifa.pointsAmount) {
        pointsMin += rifa.pointsPerPage;
        pointsMax += rifa.pointsPerPage;
      } else {
        pointsMin = 1;
        pointsMax = rifa.pointsPerPage;
      }
      createGrid(pointsMin, pointsMax);
    });

    elements.toggleViewButton.addEventListener("click", () => {
      isTableView = !isTableView;

      elements.rifaContainer.style.display = isTableView ? "none" : "grid";
      elements.tableContainer.style.display = isTableView ? "block" : "none";
      elements.toggleViewButton.innerHTML = isTableView
        ? '<i class="fa-solid fa-ticket icon"></i>Rifa'
        : '<i class="fa-solid fa-table icon"></i>Tabela';

      elements.pdfButton.classList.toggle("hidden", !isTableView);
      elements.buttonsRow.classList.toggle("hidden", isTableView);

      if (!isTableView) handleButtonsVisibility();
      else {
        elements.pointsBack.classList.add("hidden");
        elements.pagesCount.classList.add("hidden");
        elements.pointsFoward.classList.add("hidden");
      }
    });

    elements.imagePicker.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        rifa.background = event.target.result;
        elements.backImage.src = rifa.background;
      };
      reader.readAsDataURL(file);
    });

    elements.pdfButton.addEventListener("click", () => {
      exportPDF(`${actualRifaName}-${getDataString()}.pdf`);
    });

    elements.screenshotButton.addEventListener("click", handleScreenshot);
  };

  // --- Exportações e Captura ---
  function handleScreenshot() {
    elements.configButton.click();
    elements.configButton.classList.add("hidden");
    elements.buttonContainer.classList.add("hidden");
    elements.sliderContainer.classList.add("hidden");
    elements.mainSlider.actualAction = "none";

    const rect = elements.backImage.getBoundingClientRect();

    html2canvas(document.body, {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    }).then((canvas) => {
      const base64Image = canvas.toDataURL("image/png");
      const filename = `${actualRifaName}pag${actualPage}-${getDataString()}.png`;

      if (window.Android?.saveImage) {
        window.Android.saveImage(base64Image, filename);
      } else {
        const link = document.createElement("a");
        link.href = base64Image;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    });
  }

  function exportPDF(filename) {
    const doc = new jspdf.jsPDF();
    const tableBody = Object.keys(rifa.points).map((key) => [
      key,
      rifa.points[key].nome,
      rifa.points[key].status,
    ]);

    doc.autoTable({
      theme: "grid",
      head: [["Número", "Nome", "Status"]],
      body: tableBody,
    });

    const base64PDF = btoa(doc.output());

    if (window.Android?.savePDF) {
      window.Android.savePDF(base64PDF, filename);
    } else {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${base64PDF}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  function getDataString() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getDate())}${pad(now.getMonth() + 1)}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  // Dispara o app
  init();
})();
