const LANG_DATA = {
    es: {
        tag: "Español (Nativo)",
        text: "Hablante nativo de español. Desarrollo traducciones precisas y contenido adaptado para contextos didácticos, técnicos y literarios."
    },
    en: {
        tag: "English (Advanced / C1)",
        text: "Full professional proficiency. Capable of translating technical documentation, educational modules, and literary prose with high accuracy."
    },
    pt: {
        tag: "Português (Intermediário)",
        text: "Capacidade de leitura e tradução fluida de textos em português, aplicando estruturas gramaticais e vocabulário técnico com precisão."
    },
    de: {
        tag: "Deutsch (Grundkenntnisse)",
        text: "Verständnis der deutschen Grammatik und Syntax. Fähigkeit zur Übersetzung strukturierter Texte und grundlegender Ausdrücke."
    },
    fr: {
        tag: "Français (Intermédiaire)",
        text: "Compréhension écrite et capacité de traduction de textes en français, axée sur les concepts philosophiques et didactiques."
    }
};

const BUBBLE_WORDS = [
    "Bonjour", "Hello", "Olá", "Hallo", "Hola",
    "Knowledge", "Connaissance", "Wissen", "Conhecimento",
    "Patience", "Geduld", "Paciencia", "Welt", "World", "Monde"
];

export function init() {
    console.log('Módulo Traductor cargado.');
    setupFlagsEvents();
    createFloatingBubbles();
}

function setupFlagsEvents() {
    const flags = document.querySelectorAll('.aflag');
    const txtElement = document.getElementById('tr_txt');
    const tagElement = document.getElementById('tr_lang_tag');

    flags.forEach(flag => {
        flag.addEventListener('click', () => {
            flags.forEach(f => f.classList.remove('active'));
            flag.classList.add('active');

            const lang = flag.getAttribute('data-lang');
            if (LANG_DATA[lang]) {
                txtElement.style.opacity = '0';
                setTimeout(() => {
                    txtElement.innerText = `"${LANG_DATA[lang].text}"`;
                    tagElement.innerText = LANG_DATA[lang].tag;
                    txtElement.style.opacity = '1';
                }, 200);
            }
        });
    });
}

function createFloatingBubbles() {
    const container = document.getElementById('bubbles-container');
    if (!container) return;
    container.innerHTML = ''; // Limpiar

    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'floating-bubble';
        bubble.innerText = BUBBLE_WORDS[Math.floor(Math.random() * BUBBLE_WORDS.length)];
        
        // Posicionamiento y tiempos aleatorios
        const size = Math.floor(Math.random() * 20) + 14; // tamaño de letra
        const left = Math.random() * 90; // posición X %
        const duration = Math.random() * 10 + 8; // duración animación
        const delay = Math.random() * 5;

        bubble.style.fontSize = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;

        container.appendChild(bubble);
    }
}
