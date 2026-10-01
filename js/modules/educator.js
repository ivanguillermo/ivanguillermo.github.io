const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbziZxVwuC4V5Lqq4nRYSRhrtwlPMD3GY054OkJFIDf2XxU1I9k4roCH-FuMCyCU3rp2/exec?sheet=presentaciones';

let allSlides = [];
let rotateInterval = null;

export async function init() {
    console.log('Módulo Educador cargado.');
    setupModalEvents();
    await loadEducatorSlides();
}

async function loadEducatorSlides() {
    try {
        const response = await fetch(SHEET_API_URL);
        allSlides = await response.json();

        if (!allSlides || allSlides.length === 0) {
            console.warn('No se encontraron presentaciones.');
            return;
        }

        renderRandomGrid();

        // Limpiar intervalo previo si existía
        if (rotateInterval) clearInterval(rotateInterval);

        // Refrescar las 8 diapositivas aleatorias cada 12 segundos
        rotateInterval = setInterval(() => {
            renderRandomGrid();
        }, 12000);

    } catch (error) {
        console.error('Error cargando presentaciones:', error);
    }
}

function renderRandomGrid() {
    const cards = document.querySelectorAll('.edu-card');
    if (cards.length === 0 || allSlides.length === 0) return;

    // Desordenar array (Shuffle)
    const shuffled = [...allSlides].sort(() => 0.5 - Math.random());
    // Tomar hasta 8 elementos
    const selected = shuffled.slice(0, 8);

    cards.forEach((card, idx) => {
        const slide = selected[idx];
        if (!slide) {
            card.innerHTML = '';
            return;
        }

        card.innerHTML = `
            <div class="slide-preview-thumb" style="background-image: url('${slide.link_imagen || 'imgx/default-slide.png'}');">
                <div class="slide-overlay">
                    <span>${slide.titulo}</span>
                    <i class="fa fa-play-circle fa-2x"></i>
                </div>
            </div>
        `;

        card.onclick = () => openSlideModal(slide.titulo, slide.link_embed);
    });
}

function openSlideModal(title, embedUrl) {
    const modal = document.getElementById('educator-modal');
    const container = document.getElementById('modal-body-content');
    if (!modal || !container) return;

    container.innerHTML = `
        <h3 class="modal-slide-title">${title}</h3>
        <div class="embed-responsive embed-responsive-16by9">
            <iframe class="embed-responsive-item" src="${embedUrl}" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
        </div>
    `;

    modal.style.display = 'block';
}

function setupModalEvents() {
    const modal = document.getElementById('educator-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-btn');

    const closeModal = () => {
        modal.style.display = 'none';
        const container = document.getElementById('modal-body-content');
        if (container) container.innerHTML = ''; // Detener la reproducción del video/iframe
    };

    if (closeBtn) closeBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target === modal) closeModal();
    };
}
