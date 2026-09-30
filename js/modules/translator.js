export function init() {
    console.log('Módulo de Traductor e Idiomas inicializado');

    const idiomas = [
        'Eu posso traduzir entre vários idiomas. Eu sou um falante nativo de ESPANHOL...',
        'Ich kann zwischen fünf Sprachen übersetzen. Ich bin ein Muttersprachler von SPANISCH...',
        'Je peux traduire entre cinq langues. Je suis un locuteur natif de L`ESPAGNOL...',
        'Puedo traducir entre cinco idiomas. Soy un hablante nativo de ESPAÑOL...',
        'I can translate between five languages. I am a native speaker of SPANISH...'
    ];

    const flags = document.querySelectorAll('.aflag');
    const langTxt = document.getElementById('tr_txt');

    if (flags.length > 0) {
        flags.forEach(flag => {
            flag.addEventListener('click', function() {
                const langIndex = this.dataset.lang;
                flags.forEach(f => f.classList.remove('big_flag'));
                this.classList.add('big_flag');
                if (langTxt) langTxt.innerHTML = idiomas[langIndex];
            });
        });
    }

    // Iniciar animación de globos sólo cuando este módulo esté activo
    startBalloons();
}

function startBalloons() {
    // Lógica optimizada de los globos interactivos
}
