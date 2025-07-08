const tableroC = document.getElementById("tablero");
const numeroEl = document.getElementById("numero");
const aciertosEl = document.getElementById("aciertosC");
const erroresEl = document.getElementById("erroresC");
const intentosEl = document.getElementById("intentosC");
const relojEl = document.getElementById("reloj");
const recordEl = document.getElementById("recordValor");
const modoEl = document.getElementById("modo");
const nivelEl = document.getElementById("nivelC");
const puntosTotalesEl = document.getElementById("puntosTotales");
const tituloEl = document.getElementById("titulo");

let resultadoObjetivo;
let timerC;
let tiempoC = 60;
let aciertosC = 0;
let erroresC = 0;
let intentosC = 0;
let nivelActualC = 1;
let puntosTotalesC = 0;
let modoAventura = false;

// Evalúa la expresión matemática
function evaluar(operacionC) {
  try {
    return eval(operacionC);
  } catch (e) {
    return null;
  }
}

// Genera una operación aleatoria
function generarOperacion(maxNumerosC = 3) {
  const operadoresC = ["+", "-", "*"];
  const cantidadC = Math.floor(Math.random() * (maxNumerosC - 1)) + 2;
  let expresionC= "";
  for (let i = 0; i < cantidadC; i++) {
    expresionC += Math.floor(Math.random() * 10);
    if (i < cantidadC - 1) {
      expresionC += operadoresC[Math.floor(Math.random() * operadoresC.length)];
    }
  }
  return expresionC;
}

// Genera una operación que dé el resultado deseado
function generarOperacionParaResultado(resultadoC, maxNumerosC = 3) {
  const operadoresC = ["+", "-", "*"];
  for (let intentosC = 0; intentosC < 500; intentosC++) {
    const cantidadC = Math.floor(Math.random() * (maxNumerosC - 1)) + 2;
    let expresionC = "";
    for (let i = 0; i < cantidadC; i++) {
      expresionC += Math.floor(Math.random() * 10);
      if (i < cantidadC - 1) {
        expresionC += operadoresC[Math.floor(Math.random() * operadoresC.length)];
      }
    }
    if (evaluar(expresionC) === resultadoC) {
      return { textoC: expresionC, valorC: resultadoC };
    }
  }
  return null;
}

// Actualiza el récord en localStorage
function actualizarRecord(puntosC, nivelC, modoC) {
  const claveC= `record_${modoC}_nivel_${nivelC}`;
  const maxC = localStorage.getItem(claveC) || 0;
  if (puntosC > maxC) {
    localStorage.setItem(claveC, puntosC);
    return puntosC;
  }
  return maxC;
}

// Muestra el récord actual
function mostrarRecord(nivelC, modoC) {
  const claveC = `record_${modoC}_nivel_${nivelC}`;
  recordEl.textContent = localStorage.getItem(claveC) || 0;
}

// Verifica si se completaron los aciertos necesarios
function verificarFin() {
  if (aciertosC === 5) {
    clearInterval(timerC);
    const puntosC = Math.max(0, Math.floor(tiempoC * 10 - erroresC * 5));
    puntosTotalesC += puntosC;

    const modoC = modoAventura ? "aventura" : "clasico";
    const recordC = actualizarRecord(puntosC, nivelActualC, modoC);
    mostrarRecord(nivelActualC, modoC);
    puntosTotalesEl.textContent = puntosTotalesC;

    if (modoAventura && nivelActualC < 7) {
      alert(`✅ Nivel ${nivelActualC} superado!\n🏆 +${puntosC} puntos`);
      nivelActualC++;
      setTimeout(() => cargarNivel(nivelActualC), 800);
    } else {
      alert(`🎉 Juego terminado\n🏅 Puntos totales: ${puntosTotalesC}`);
      location.reload();
    }
  }
}

// Inicia el juego completo
function iniciarJuego() {
  aciertosC = erroresC = intentosC = puntosTotalesC = 0;
  aciertosEl.textContent = erroresEl.textContent = intentosEl.textContent = 0;
  puntosTotalesEl.textContent = "0";

  modoAventura = modoEl.value === "aventura";
  nivelActualC = modoAventura ? 1 : parseInt(nivelEl.value);
  cargarNivel(nivelActualC);
}

// Carga un nivel específico
function cargarNivel(nivelC) {
  const cantCeldasC= 12 + nivelC * 2;
  const maxNumerosC = nivelC >= 4 ? 4 : 3;
  const tiempoMaxC = Math.max(15, 60 - nivelC * 5);
  resultadoObjetivo = Math.floor(Math.random() * (nivelC * 10 + 10));
  numeroEl.textContent = resultadoObjetivo;
  tituloEl.textContent = `Nivel ${nivelC} — Selecciona 5 operaciones que den como resultado:`;

  tableroC.innerHTML = "";
  aciertosC = erroresC = intentosC = 0;
  aciertosEl.textContent = erroresEl.textContent = intentosEl.textContent = 0;

  const operacionesC = [];

  while (operacionesC.length < 5) {
    let opC = generarOperacionParaResultado(resultadoObjetivo, maxNumerosC);
    if (opC && !operacionesC.find(o => o.textoC === opC.textoC)) {
      operacionesC.push(opC);
    }
  }

  while (operacionesC.length < cantCeldasC) {
    let textoC, valorC;
    do {
      textoC = generarOperacion(maxNumerosC);
      valorC = evaluar(textoC);
    } while (
      valorC === null ||
      isNaN(valorC) ||
      valorC === resultadoObjetivo ||
      operacionesC.find(o => o.textoC === textoC)
    );
    operacionesC.push({ textoC: textoC, valorC: valorC });
  }

  operacionesC.sort(() => Math.random() - 0.5);

  operacionesC.forEach(opC => {
    const celdaC = document.createElement("div");
    celdaC.textContent = opC.textoC;
    celdaC.classList.add("cell");
    celdaC.addEventListener("click", () => {
      if (celdaC.classList.contains("correct") || celdaC.classList.contains("wrong")) return;
      intentosC++;
      intentosEl.textContent = intentosC;
      if (opC.valorC === resultadoObjetivo) {
        aciertosC++;
        aciertosEl.textContent = aciertosC;
        celdaC.classList.add("correct");
        verificarFin();
      } else {
        erroresC++;
        erroresEl.textContent = erroresC;
        celdaC.classList.add("wrong");
      }
      celdaC.style.pointerEvents = "none";
    });
    tableroC.appendChild(celdaC);
  });

  tiempoC = tiempoMaxC;
  relojEl.textContent = tiempoC;
  const modoC = modoAventura ? "aventura" : "clasico";
  mostrarRecord(nivelC, modoC);

  clearInterval(timerC);
  timerC = setInterval(() => {
    tiempoC--;
    relojEl.textContent = tiempoC;
    if (tiempoC <= 0) {
      clearInterval(timerC);
      alert(`⏱ Tiempo agotado. ¡Inténtalo de nuevo!`);
      location.reload();
    }
  }, 1000);
}
