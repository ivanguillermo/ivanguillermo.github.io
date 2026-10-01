export function init() {
    console.log('Módulo Bio / Perfil cargado.');

    initQuotesRotator();
}

function initQuotesRotator() {
    const quotes = [
        "«Es sencillo hacer que las cosas sean complicadas, pero difícil hacer que sean sencillas.» -Friedrich Nietzsche",
        "«La vida de un hombre es lo que sus pensamientos hacen de ella.»",
        "«La matemática, vista correctamente, posee no solo verdad, sino belleza suprema»"      

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
