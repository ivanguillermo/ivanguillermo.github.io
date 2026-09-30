export function init() {
    console.log('Módulo Programador cargado.');

    // Configuración de proyectos/tecnologías
    const techCards = document.querySelectorAll('.p-lang-card');
    
    techCards.forEach(card => {
        card.addEventListener('click', () => {
            const lang = card.getAttribute('data-lang') || 'Tecnología';
            highlightTech(card);
            console.log(`Seleccionada la tecnología: ${lang}`);
        });
    });

    renderGitHubStats();
}

function highlightTech(selectedCard) {
    document.querySelectorAll('.p-lang-card').forEach(card => {
        card.style.opacity = '0.5';
        card.style.transform = 'scale(0.95)';
    });

    selectedCard.style.opacity = '1';
    selectedCard.style.transform = 'scale(1.05)';
}

function renderGitHubStats() {
    const container = document.getElementById('github-stats-container');
    if (!container) return;

    // Inserción dinámica de métricas/resumen de proyectos
    container.innerHTML = `
        <div class="repo-badge">
            <i class="fa fa-github"></i>
            <span>Proyectos activos en PWA, Google Apps Script & Web Tools</span>
        </div>
    `;
}
