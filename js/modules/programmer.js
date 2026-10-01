// URL de tu Web App de Google Apps Script o Endpoint JSON de tu Google Sheet
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwe5BQ8TtzKHbTaBFX3-2hDuldvzjyhviYGiVKjzgqnXzx9lhLwQOp-orIV-5S0Ft_R/exec';

export async function init() {
    console.log('Módulo Programador cargado.');
    await fetchTechData();
}

async function fetchTechData() {
    const container = document.getElementById('tech-list-container');
    if (!container) return;

    try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();

        // Tomamos únicamente las primeras 5 tecnologías/filas
        const top5Techs = data.slice(0, 5);
        
        renderTechCards(top5Techs, container);
    } catch (error) {
        console.error('Error al cargar datos de Google Sheets:', error);
        container.innerHTML = `<p class="text-danger text-center">No se pudieron cargar los proyectos. Intenta de nuevo más tarde.</p>`;
    }
}

function renderTechCards(techList, container) {
    container.innerHTML = ''; // Limpiar loader

    techList.forEach(item => {
        // Estructurar los 3 ejemplos dinámicamente
        const examples = [
            { name: item.ejemplo_1, link: item.ejemplo_1_link },
            { name: item.ejemplo_2, link: item.ejemplo_2_link },
            { name: item.ejemplo_3, link: item.ejemplo_3_link }
        ].filter(ex => ex.name && ex.link); // Filtra los que no estén vacíos

        const card = document.createElement('div');
        card.className = 'tech-card';

        card.innerHTML = `
            <div class="tech-card-header">
                <img src="${item.link_de_imagen || 'imgx/default-code.png'}" alt="${item.tecnologia}" class="tech-icon" />
                <h3>${item.tecnologia}</h3>
            </div>
            <div class="tech-card-body">
                <span class="examples-title">Proyectos / Snippets:</span>
                <ul class="tech-examples-list">
                    ${examples.map(ex => `
                        <li>
                            <a href="${ex.link}" target="_blank" rel="noopener">
                                <i class="fa fa-code-fork"></i> ${ex.name}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        container.appendChild(card);
    });
}

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
