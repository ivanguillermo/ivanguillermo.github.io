export function init() {
    console.log('Módulo Bio / Perfil cargado.');

    initQuotesRotator();
}

function initQuotesRotator() {
    const quotes = [
        "«El verdadero viaje de descubrimiento no consiste en buscar nuevos paisajes, sino en tener nuevos ojos.»",
        "«La tecnología es solo una herramienta. En términos de llevar a los niños a trabajar juntos y motivarlos, el profesor es lo más importante.»",
        "«La matemática es la ciencia de los patrones y el arte de la estructura.»"
    ];

    const quoteElement = document.getElementById('quote-text');
    if (!quoteElement) return;

    let index = 0;

    // Cambia la cita con una transición suave cada 6 segundos
    setInterval(() => {
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            index = (index + 1) % quotes.length;
            quoteElement.textContent = quotes[index];
            quoteElement.style.opacity = '1';
        }, 500);
    }, 6000);
}
