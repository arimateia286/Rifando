# Rifando 🍀

O **Rifando** é uma aplicação web intuitiva e totalmente personalizável para a criação, gerenciamento e sorteio de rifas. Este repositório funciona atualmente como a **versão de demonstração (Demo)** oficial do projeto e está hospedado publicamente através do GitHub Pages.

A versão completa, nativa e com recursos expandidos deste projeto está disponível para dispositivos Android na **[Google Play Store](https://play.google.com/store/apps/details?id=com.marocalabs.rifando)**.

**Obs.:** Essa versão web é baseada na primeira versão feita da aplicação, então ela é bastante incompleta se comparada com a versão de produção atual.

---

## 📱 O Projeto e Ecossistema

Este repositório cumpre dois papéis fundamentais no ecossistema do aplicativo:
1. **Demonstração Web (PVP):** Permite que usuários testem as principais mecânicas de customização e o algoritmo de sorteio direto pelo navegador.
2. **Hospedagem de Produção:** Serve como o servidor estático seguro para o arquivo `app-ads.txt`, essencial para a conformidade, verificação de propriedade e monetização do aplicativo distribuído na Play Store via AdMob.

---

## ✨ Funcionalidades da Versão Web

* **Gerenciamento de Pontos:** Marcação dinâmica de números como "Pago" ou "Não pago" com atualização em tempo real de estatísticas.
* **Customização Estética Completa:** Ajuste de cores de fundo, fontes, bordas e tamanhos de componentes usando seletores nativos e bibliotecas de estilo (Pickr).
* **Suporte a Artes Próprias:** Upload de imagens locais (ex: criadas no Canva/Photoshop) para serem usadas como plano de fundo da rifa.
* **Módulo de Sorteio Integrado (Roleta):** Efeito visual de alternância rápida de nomes para o sorteio, com gatilhos de áudio, sistema de confetes (`canvas-confetti`) e filtros para incluir ou remover inadimplentes da rodada.
* **Exportação de Relatórios:** Geração de capturas de tela e arquivos em formato PDF da tabela de participantes (`jspdf` e `html2canvas`).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído prezando pela leveza, máxima performance mobile e zero dependência de frameworks pesados (*Vanilla Architecture*):

* **HTML5 & CSS3:** Estrutura semântica avançada com variáveis nativas (`:root`), efeitos de desfoque (`backdrop-filter`) e animações otimizadas por aceleração de hardware.
* **JavaScript (ES6+):** Manipulação eficiente do DOM através de fragmentos (`DocumentFragment`), tratamento reativo de filtros e persistência local com `localStorage`.
* **FontAwesome v7.0.1:** Kit de ícones para a interface adaptativa.
* **Bibliotecas Externas:**
    * [Canvas-Confetti](https://github.com/catdad/canvas-confetti) (Efeitos visuais no sorteio)
    * [HTML2Canvas](https://html2canvas.hertzen.com/) (Captura de tela do painel)
    * [jsPDF](https://github.com/parallax/jsPDF) & AutoTable (Exportação de relatórios em PDF)
    * [Pickr (Theme Nano)](https://github.com/simonwep/pickr) (Seleção avançada de paleta de cores)

---

## 📂 Estrutura de Páginas

A arquitetura de arquivos reflete um fluxo de usuário limpo e modularizado:

* `index.html` / `home.js`: Tela principal de boas-vindas, exibição de listagens de rifas criadas pelo usuário e central de ajuda.
* `rifa.html` / `rifa.js`: Tela de edição, mapeamento de clientes, importação de fundos e configurações do grid.
* `sorteio.html` / `sorteio.js`: Painel do sorteio dinâmico com tratamento de regras de negócio (mínimo de participantes, validação de status de pagamento).

---

## 🔗 Links Úteis

* **Demonstração no GitHub Pages:** [Acesse a versão Web](https://arimateia286.github.io/Rifando)
* **Download do App:** [Disponível na Google Play Store](https://play.google.com/store/apps/details?id=com.marocalabs.rifando)
* **Verificação Monetária:** [Arquivo app-ads.txt](https://arimateia286.github.io/Rifando/app-ads.txt)
