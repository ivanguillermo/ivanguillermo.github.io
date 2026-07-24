document.addEventListener('DOMContentLoaded', () => {

  // --- 1. TRADUCTOR: Cambio de Idiomas ---
  const idiomas = [
    'Eu posso traduzir entre vários idiomas. Eu sou um falante nativo de ESPANHOL e sou altamente proficiente em INGLÊS.<br/> Traduzir para esses 2 idiomas de:<br/><span style="color:#000;"> ALEMÃO 🇩🇪 FRANCÊS 🇫🇷 PORTUGUÊS 🇧🇷</span>',
    'Ich kann zwischen fünf Sprachen übersetzen. Ich bin Muttersprachler von SPANISCH und fließend in ENGLISCH.<br/> Übersetzen in diese 2 Sprachen von:<br/><span style="color:#000;"> DEUTSCH 🇩🇪 FRANZÖSISCH 🇫🇷 PORTUGIESISCH 🇧🇷</span>',
    'Je peux traduire entre cinq langues. Je suis un locuteur natif de L\'ESPAGNOL et très compétent en ANGLAIS.<br/> Traduire vers ces 2 langues depuis:<br/><span style="color:#000;"> ALLEMAND 🇩🇪 FRANÇAIS 🇫🇷 PORTUGAIS 🇧🇷</span>',
    'Puedo traducir entre cinco idiomas. Soy un hablante nativo de ESPAÑOL y altamente competente en INGLÉS.<br/> Y además puedo traducir a esos 2 idiomas desde:<br/><span style="color:#000;"> ALEMÁN 🇩🇪 FRANCÉS 🇫🇷 PORTUGUÉS 🇧🇷</span>',
    'I can translate between five languages. I am a native speaker of SPANISH and highly proficient in ENGLISH.<br/> And I can translate to those 2 languages from:<br/><span style="color:#000;"> GERMAN 🇩🇪 FRENCH 🇫🇷 PORTUGUESE 🇧🇷</span>'
  ];

  const flags = document.querySelectorAll('.aflag');
  const trTxt = document.getElementById('tr_txt');

  flags.forEach(flag => {
    flag.addEventListener('click', function() {
      const langIdx = this.dataset.lang;
      flags.forEach(f => f.classList.remove('big_flag'));
      this.classList.add('big_flag');
      trTxt.innerHTML = idiomas[langIdx];
    });
  });

  // --- 2. GLOBOS ANIMADOS (Limpia memoria al terminar animación) ---
  const colors = ['var(--blue)', 'var(--green)', 'var(--magenta)', '#ff00ff', '#ffc600'];
  const words = ['Hola', 'Hallo', 'Translator', 'Spanish', 'Hi', 'Français', 'Deutsch', 'Übersetzer', 'ESPAÑOL', 'English', 'Bonjour'];
  const container = document.getElementById('myDIV2');

  function spawnBalloon() {
    if (!container) return;
    
    // Generar globos solo si el contenedor está visible en pantalla
    const rect = container.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomLeft = Math.floor(Math.random() * 80); // 0 a 80vw

    balloon.style.left = `${randomLeft}vw`;
    balloon.style.backgroundColor = randomColor;
    balloon.innerHTML = `<span>${randomWord}</span>`;

    // Eliminación automática del DOM al terminar la animación
    balloon.addEventListener('animationend', () => balloon.remove());

    container.appendChild(balloon);
  }

  setInterval(spawnBalloon, 2000);

  // --- 3. SECCIÓN EDUCADOR: Galería y Modal de Presentaciones ---
  const pptxs = [
    ["datos_no_agrupados", "Datos no agrupados", "https://docs.google.com/presentation/d/e/2PACX-1vRndRh69UxkKMdnXo-8NJuSvBFVhPO-vALoLAyaacHHZVURx8OxoYz-jZB30PoLCX65PiN6oJyoqfo3/embed?start=false&loop=false&delayms=3000"],
    ["derivada", "Derivadas", "https://docs.google.com/presentation/d/e/2PACX-1vSyWsf67g0hTONcUMN-tlXjAzHyoatA-u-C7agtV6wQFEuLCA4tvK-6cTSDPDXPebKOsZMGQjvIryZk/embed?start=false&loop=false&delayms=3000"],
    ["didactica", "Didáctica", "https://docs.google.com/presentation/d/e/2PACX-1vSrG0GkskW6HR6z9hgkoQmq61UE_K81Stogr5Gwished9Sdox20PcrAhxSQOUgkB8bgsG6ZE4puXZ01/embed?start=false&loop=false&delayms=3000"],
    ["electronica_digital", "Electrónica Digital", "https://docs.google.com/presentation/d/e/2PACX-1vRCdEw85JiDkLsdGDjVVrpFDcH6LuojqAz1mFoUstDeq6tGMqHmp-FPmtmEsxrKz2eDYLChZzOK40h2/embed?start=false&loop=false&delayms=3000"],
    ["estructura_datos_2", "Estructura Datos 2", "https://docs.google.com/presentation/d/e/2PACX-1vTvtZBStPW16UbZ9pm_eiW4ClMdjDyuINHmPNSrfpEHMUQeFfozknVf_f0HMbaPiHwxsTBayHZFo2NU/embed?start=false&loop=false&delayms=3000"]
    ["derivada", "Derivadas", "https://docs.google.com/presentation/d/e/2PACX-1vSyWsf67g0hTONcUMN-tlXjAzHyoatA-u-C7agtV6wQFEuLCA4tvK-6cTSDPDXPebKOsZMGQjvIryZk/embed?start=false&loop=false&delayms=3000"],
    ["didactica", "Didáctica", "https://docs.google.com/presentation/d/e/2PACX-1vSrG0GkskW6HR6z9hgkoQmq61UE_K81Stogr5Gwished9Sdox20PcrAhxSQOUgkB8bgsG6ZE4puXZ01/embed?start=false&loop=false&delayms=3000"],
    ["electronica_digital", "Electrónica Digital", "https://docs.google.com/presentation/d/e/2PACX-1vRCdEw85JiDkLsdGDjVVrpFDcH6LuojqAz1mFoUstDeq6tGMqHmp-FPmtmEsxrKz2eDYLChZzOK40h2/embed?start=false&loop=false&delayms=3000"]
        ];

  const pptxGrid = document.getElementById('pptx_container');
  const modal = document.getElementById('pptx_modal');
  const iframe = document.getElementById('pptx_shower_frame');
  const modalTitle = document.getElementById('pptx_shower_tit');
  const closeModal = document.getElementById('close_modal');

  // Carga de tarjetas
  if (pptxGrid) {
    pptxs.forEach(([id, title, url]) => {
      const card = document.createElement('div');
      card.className = 'pptx_item';
      card.innerHTML = `<img src="imgx/pptx/${id}.png" alt="${title}" title="${title}">`;
      card.addEventListener('click', () => {
        iframe.src = url;
        modalTitle.textContent = title;
        if (modal.showModal) {
          modal.showModal();
        } else {
          modal.style.display = 'block';
        }
      });
      pptxGrid.appendChild(card);
    });
  }

  // Cierre de Modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      iframe.src = '';
      if (modal.close) {
        modal.close();
      } else {
        modal.style.display = 'none';
      }
    });
  }
});

// LÓGICA DE NAVEGACIÓN POR PESTAÑAS (TABS)
const tabButtons = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTabId = button.dataset.tab;

    // 1. Quitar la clase .active de todos los botones y secciones
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // 2. Activar el botón presionado y la sección correspondiente
    button.classList.add('active');
    document.getElementById(targetTabId).classList.add('active');
  });
});

document.addEventListener('keydown', (e) => {
  const activeBtn = document.querySelector('.nav-tab.active');
  if (!activeBtn) return;

  if (e.key === 'ArrowRight') {
    // Ir a la siguiente pestaña
    const nextBtn = activeBtn.nextElementSibling;
    if (nextBtn && nextBtn.classList.contains('nav-tab')) nextBtn.click();
  } else if (e.key === 'ArrowLeft') {
    // Ir a la pestaña anterior
    const prevBtn = activeBtn.previousElementSibling;
    if (prevBtn && prevBtn.classList.contains('nav-tab')) prevBtn.click();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.navbar-toggle');
  const navLinks = document.querySelector('.nav-links');
  const tabButtons = document.querySelectorAll('.nav-tab');

  // Alternar apertura / cierre del menú colapsable
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = navLinks.classList.toggle('show');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Cerrar el menú desplegable al hacer clic en cualquier pestaña
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
});