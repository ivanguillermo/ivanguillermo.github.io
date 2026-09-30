export function init() {
    console.log('Módulo Educador cargado.');

    setupPresentationModal();
}

function setupPresentationModal() {
    const thumbs = document.querySelectorAll('.pptx-thumb');
    const modal = document.getElementById('educator-modal');
    const modalBody = document.getElementById('modal-body-content');
    const closeBtn = document.querySelector('.close-btn');

    if (!modal) return;

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const presentationTitle = thumb.getAttribute('data-title') || 'Presentación Educativa';
            const embedUrl = thumb.getAttribute('data-embed-url');

            if (modalBody) {
                modalBody.innerHTML = `
                    <h3>${presentationTitle}</h3>
                    ${embedUrl ? `<iframe src="${embedUrl}" width="100%" height="400px" frameborder="0" allowfullscreen="true"></iframe>` : '<p>Cargando vista previa de la presentación...</p>'}
                `;
            }

            modal.classList.add('active');
        });
    });

    // Cerrar modal por clic en la 'X'
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Cerrar modal si se hace clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('educator-modal');
    const modalBody = document.getElementById('modal-body-content');
    
    if (modal) {
        modal.classList.remove('active');
    }
    if (modalBody) {
        modalBody.innerHTML = ''; // Limpia el iframe al cerrar para detener audios/videos
    }
}
