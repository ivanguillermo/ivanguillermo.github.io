// Carga dinámica de módulos según interacción o visibilidad
const modules = {
    'sec-bio': () => import('./modules/bio.js'),
    'sec-translator': () => import('./modules/translator.js'),
    'sec-programmer': () => import('./modules/programmer.js'),
    'sec-math': () => import('./modules/math.js'),
    'sec-educator': () => import('./modules/educator.js')
};

const loadedModules = new Set();

// Función para activar e inicializar módulo
async function loadModule(sectionId) {
    if (!loadedModules.has(sectionId) && modules[sectionId]) {
        const module = await modules[sectionId]();
        if (module && module.init) {
            module.init();
        }
        loadedModules.add(sectionId);
    }
}

// Navegación por Click
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-target');
        
        // Actualizar estados visuales de la barra
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Smooth Scroll hacia la sección seleccionada
        const targetSection = document.getElementById(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });

        // Cargar JS de la sección inmediatamente
        loadModule(targetId);
    });
});

// Lazy Loading por Scroll con IntersectionObserver
const observerOptions = {
    root: null,
    threshold: 0.3
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            loadModule(sectionId);

            // Sincronizar botón activo de la barra de navegación
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-target') === sectionId);
            });
        }
    });
}, observerOptions);

document.querySelectorAll('.app-section').forEach(sec => observer.observe(sec));
