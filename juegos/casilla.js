const tablero = document.getElementById("tablero");
const numeroEl = document.getElementById("numero");
const aciertosEl = document.getElementById("aciertos");
const erroresEl = document.getElementById("errores");
const intentosEl = document.getElementById("intentos");
const relojEl = document.getElementById("reloj");
const recordEl = document.getElementById("recordValor");
const modoEl = document.getElementById("modo");
const nivelEl = document.getElementById("nivel");
const puntosTotalesEl = document.getElementById("puntosTotales");
const tituloEl = document.getElementById("titulo");

let resultadoObjetivo;
let timer;
let tiempo = 60;
let aciertos = 0;
let errores = 0;
let intentos = 0;
let nivelActual = 1;
let puntosTotales = 0;
let modoAventura = false;

// Evalúa la expresión matemática
function evaluar(operacion) {
  try {
    return eval(operacion);
  } catch (e) {
    return null;
  }
}

// Genera una operación aleatoria
function generarOperacion(maxNumeros = 3) {
  const operadores = ["+", "-", "*"];
  const cantidad = Math.floor(Math.random() * (maxNumeros - 1)) + 2;
  let expresion = "";
  for (let i = 0; i < cantidad; i++) {
    expresion += Math.floor(Math.random() * 10);
    if (i < cantidad - 1) {
      expresion += operadores[Math.floor(Math.random() * operadores.length)];
    }
  }
  return expresion;
}

// Genera una operación que dé el resultado deseado
function generarOperacionParaResultado(resultado, maxNumeros = 3) {
  const operadores = ["+", "-", "*"];
  for (let intentos = 0; intentos < 500; intentos++) {
    const cantidad = Math.floor(Math.random() * (maxNumeros - 1)) + 2;
    let expresion = "";
    for (let i = 0; i < cantidad; i++) {
      expresion += Math.floor(Math.random() * 10);
      if (i < cantidad - 1) {
        expresion += operadores[Math.floor(Math.random() * operadores.length)];
      }
    }
    if (evaluar(expresion) === resultado) {
      return { texto: expresion, valor: resultado };
    }
  }
  return null;
}

// Actualiza el récord en localStorage
function actualizarRecord(puntos, nivel, modo) {
  const clave = `record_${modo}_nivel_${nivel}`;
  const max = localStorage.getItem(clave) || 0;
  if (puntos > max) {
    localStorage.setItem(clave, puntos);
    return puntos;
  }
  return max;
}

// Muestra el récord actual
function mostrarRecord(nivel, modo) {
  const clave = `record_${modo}_nivel_${nivel}`;
  recordEl.textContent = localStorage.getItem(clave) || 0;
}

// Verifica si se completaron los aciertos necesarios
function verificarFin() {
  if (aciertos === 5) {
    clearInterval(timer);
    const puntos = Math.max(0, Math.floor(tiempo * 10 - errores * 5));
    puntosTotales += puntos;

    const modo = modoAventura ? "aventura" : "clasico";
    const record = actualizarRecord(puntos, nivelActual, modo);
    mostrarRecord(nivelActual, modo);
    puntosTotalesEl.textContent = puntosTotales;

    if (modoAventura && nivelActual < 7) {
      alert(`✅ Nivel ${nivelActual} superado!\n🏆 +${puntos} puntos`);
      nivelActual++;
      setTimeout(() => cargarNivel(nivelActual), 800);
    } else {
      alert(`🎉 Juego terminado\n🏅 Puntos totales: ${puntosTotales}`);
      location.reload();
    }
  }
}

// Inicia el juego completo
function iniciarJuego() {
  aciertos = errores = intentos = puntosTotales = 0;
  aciertosEl.textContent = erroresEl.textContent = intentosEl.textContent = 0;
  puntosTotalesEl.textContent = "0";

  modoAventura = modoEl.value === "aventura";
  nivelActual = modoAventura ? 1 : parseInt(nivelEl.value);
  cargarNivel(nivelActual);
}

// Carga un nivel específico
function cargarNivel(nivel) {
  const cantCeldas = 12 + nivel * 2;
  const maxNumeros = nivel >= 4 ? 4 : 3;
  const tiempoMax = Math.max(15, 60 - nivel * 5);
  resultadoObjetivo = Math.floor(Math.random() * (nivel * 10 + 10));
  numeroEl.textContent = resultadoObjetivo;
  tituloEl.textContent = `Nivel ${nivel} — Selecciona 5 operaciones que den como resultado:`;

  tablero.innerHTML = "";
  aciertos = errores = intentos = 0;
  aciertosEl.textContent = erroresEl.textContent = intentosEl.textContent = 0;

  const operaciones = [];

  while (operaciones.length < 5) {
    let op = generarOperacionParaResultado(resultadoObjetivo, maxNumeros);
    if (op && !operaciones.find(o => o.texto === op.texto)) {
      operaciones.push(op);
    }
  }

  while (operaciones.length < cantCeldas) {
    let texto, valor;
    do {
      texto = generarOperacion(maxNumeros);
      valor = evaluar(texto);
    } while (
      valor === null ||
      isNaN(valor) ||
      valor === resultadoObjetivo ||
      operaciones.find(o => o.texto === texto)
    );
    operaciones.push({ texto: texto, valor: valor });
  }

  operaciones.sort(() => Math.random() - 0.5);

  operaciones.forEach(op => {
    const celda = document.createElement("div");
    celda.textContent = op.texto;
    celda.classList.add("cell");
    celda.addEventListener("click", () => {
      if (celda.classList.contains("correct") || celda.classList.contains("wrong")) return;
      intentos++;
      intentosEl.textContent = intentos;
      if (op.valor === resultadoObjetivo) {
        aciertos++;
        aciertosEl.textContent = aciertos;
        celda.classList.add("correct");
        verificarFin();
      } else {
        errores++;
        erroresEl.textContent = errores;
        celda.classList.add("wrong");
      }
      celda.style.pointerEvents = "none";
    });
    tablero.appendChild(celda);
  });

  tiempo = tiempoMax;
  relojEl.textContent = tiempo;
  const modo = modoAventura ? "aventura" : "clasico";
  mostrarRecord(nivel, modo);

  clearInterval(timer);
  timer = setInterval(() => {
    tiempo--;
    relojEl.textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(timer);
      alert(`⏱ Tiempo agotado. ¡Inténtalo de nuevo!`);
      location.reload();
    }
  }, 1000);
}
