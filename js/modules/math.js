export function init() {
    console.log('Módulo Matemático cargado.');

    initMathCarousel();
    setupTopicCards();
}

function initMathCarousel() {
    const carouselEl = document.querySelector('#mathCarousel');
    if (!carouselEl || typeof $ === 'undefined') return;

    // Inicializa el carrusel de Bootstrap si está cargado
    $(carouselEl).carousel({
        interval: 5000,
        pause: 'hover'
    });
}

function setupTopicCards() {
    const cards = document.querySelectorAll('.math-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const topic = card.getAttribute('data-topic');
            console.log(`Sección matemática seleccionada: ${topic}`);

            // Remueve clase activa previa y asigna a la actual
            cards.forEach(c => c.classList.remove('math-active'));
            card.classList.add('math-active');
        });
    });
}
