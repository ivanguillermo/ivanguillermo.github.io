let nivelDActual = 1;
    let num1, num2;
    let aciertosD = 0;
    let intentosD = 0;
    let rachaD = 0;

    window.onload = function() {
      document.getElementById('nivelDSelect').value = "1";
      document.getElementById('nivelD').textContent = nivelDActual;
      generarSuma();
    };
    function generarOperacionPorNivelD(nivelD) {
  let n1, n2, n3, operador, operadores, expresion, respuesta;

  switch(nivelD) {
    case 1:
      // NivelD 1: suma de dos dígitos
      n1 = rand(10, 99);
      n2 = rand(10, 99);
      respuesta = n1 + n2;
      expresion = `${n1} + ${n2}`;
      break;

    case 2:
      // NivelD 2: suma o resta (resultado siempre positivo)
      n1 = rand(10, 99);
      n2 = rand(10, 99);
      operador = Math.random() < 0.5 ? '+' : '-';
      if (operador === '-' && n1 < n2) [n1, n2] = [n2, n1]; // evitar negativos
      respuesta = operador === '+' ? n1 + n2 : n1 - n2;
      expresion = `${n1} ${operador} ${n2}`;
      break;

    case 3:
      // NivelD 3: suma o resta de tres números de dos dígitos (resultado > 0)
      const nums = [rand(10, 99), rand(10, 99), rand(10, 99)];
      operadores = [Math.random() < 0.5 ? '+' : '-', Math.random() < 0.5 ? '+' : '-'];
      expresion = `${nums[0]} ${operadores[0]} ${nums[1]} ${operadores[1]} ${nums[2]}`;
      respuesta = evalExpresionSeguro(expresion);
      if (respuesta <= 0) return generarOperacionPorNivelD(nivelD); // intentar de nuevo si es negativa
      break;

    case 4:
      // NivelD 4: multiplicación sencilla
      const opciones = [
        () => [rand(2, 9), rand(2, 9)],
        () => [rand(10, 99), rand(2, 9)]
      ];
      [n1, n2] = opciones[Math.floor(Math.random() * opciones.length)]();
      respuesta = n1 * n2;
      expresion = `${n1} × ${n2}`;
      break;

    case 5:
      // NivelD 5: tres números, suma o resta, resultado > 0 + temporizador
      const a = rand(10, 99), b = rand(10, 99), c = rand(10, 99);
      operadores = [Math.random() < 0.5 ? '+' : '-', Math.random() < 0.5 ? '+' : '-'];
      expresion = `${a} ${operadores[0]} ${b} ${operadores[1]} ${c}`;
      respuesta = evalExpresionSeguro(expresion);
      if (respuesta <= 0) return generarOperacionPorNivelD(nivelD);
      break;

    case 6:
      // NivelD 6: multiplicación con uno de 2 dígitos × uno de 1 dígito + temporizador
      n1 = rand(10, 99);
      n2 = rand(2, 9);
      respuesta = n1 * n2;
      expresion = `${n1} × ${n2}`;
      break;

    case 7:
      // NivelD 7: combinación respetando orden de operaciones, sin temporizador
      const ops = ['+', '-', '*'];
      const op1 = ops[rand(0, 2)];
      const op2 = ops[rand(0, 2)];
      n1 = rand(10, 99);
      n2 = rand(2, 9);
      n3 = rand(2, 9);
      expresion = `${n1} ${op1} ${n2} ${op2} ${n3}`;
      respuesta = evalExpresionSeguro(expresion);
      break;

    default:
      return null;
  }

  return { expresion, respuesta };
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function evalExpresionSeguro(expr) {
  try {
    return Math.round(eval(expr.replace(/×/g, '*')));
  } catch {
    return -1;
  }
}

    function cambiarNivelD() {
  nivelDActual = parseInt(document.getElementById('nivelDSelect').value);
  racha = 0;
  actualizarRacha();
  document.getElementById('nivelD').textContent = nivelDActual;
  document.getElementById('signoigual').textContent = "=";
  generarEjercicio();
}


let operacionActual = { expresion: "", respuesta: 0 };
let tiempoRestante = 0;
let temporizadorActivo = false;
let cuentaAtras;

function generarEjercicio() {
  operacionActual = generarOperacionPorNivelD(nivelDActual);
  document.getElementById('num1').textContent = operacionActual.expresion;
  document.getElementById('respuesta').value = "";
  document.getElementById('resultado').textContent = "";

  if (nivelDActual === 5 || nivelDActual === 6) {
    iniciarTemporizador(20);
  } else {
    detenerTemporizador();
  }
}


   function verificar() {
  if (temporizadorActivo) detenerTemporizador();

  const respuestaUsuario = parseInt(document.getElementById('respuesta').value);
  const resultado = document.getElementById('resultado');
  const imagen = document.getElementById('imagen');
  intentos++;

  if (respuestaUsuario === operacionActual.respuesta) {
    aciertos++;
    racha++;
    resultado.textContent = "✅ ¡Correcto!";
    resultado.style.color = "green";
    imagen.src="boyhappy.png";

    if (racha === 5 && nivelDActual < 7) {
      nivelDActual++;
      document.getElementById('nivelDSelect').value = nivelDActual;
      document.getElementById('nivelD').textContent = nivelDActual;
      racha = 0;
      alert(`🎉 ¡Subiste al nivelD ${nivelDActual}!`);
    }
     else if (racha === 5 && nivelDActual === 7) {      
      document.getElementById('nivelD').textContent = "Final";
      racha = 0;
      alert(`🎉 ¡Felicidades, eres el nuevo Dios de las Matematicas`);
      aciertos = 0;
      intentos = 0;
      document.getElementById('cosa').textContent = "";
    }
  } else {
    resultado.textContent = `❌ Incorrecto. Era ${operacionActual.respuesta}`;
    resultado.style.color = "red";
    racha = Math.max(racha - 1, 0);
    imagen.src="boytriste.png";
;
  }

  actualizarContadores();
  actualizarRacha();
  setTimeout(generarEjercicio, 800);
}

function iniciarTemporizador(segundos) {
  detenerTemporizador();
  tiempoRestante = segundos;
  temporizadorActivo = true;
  document.getElementById('temporizador').textContent = `⏳ Tiempo: ${tiempoRestante}s`;

  cuentaAtras = setInterval(() => {
    tiempoRestante--;
    if (tiempoRestante <= 0) {
      clearInterval(cuentaAtras);
      temporizadorActivo = false;
      document.getElementById('resultado').textContent = "⏰ ¡Tiempo agotado!";
      document.getElementById('resultado').style.color = "red";
      intentos++;
      racha = 0;
      actualizarContadores();
      actualizarRacha();
      setTimeout(generarEjercicio, 800);
    }
  }, 1000);
}

function detenerTemporizador() {
  clearInterval(cuentaAtras);
  temporizadorActivo = false;
}

    function actualizarContadores() {
      const porcentaje = intentos > 0 ? Math.round((aciertos / intentos) * 100) : 0;
      document.getElementById('aciertos').textContent = aciertos;
      document.getElementById('intentos').textContent = intentos;
      document.getElementById('porcentaje').textContent = `${porcentaje}%`;

      let mensaje = "";
      if (intentos === 0) mensaje = "Empecemos";
      else if (porcentaje <= 20) mensaje = "😕 Tienes mucho que mejorar";
      else if (porcentaje <= 40) mensaje = "💪 Sigue adelante";
      else if (porcentaje <= 60) mensaje = "🙂 Puedes hacerlo mejor";
      else if (porcentaje <= 80) mensaje = "👌 Muy bien";
      else if (porcentaje <= 90) mensaje = "🌟 Excelente";
      else mensaje = "🚀 ¡La NASA quiere saber tu ubicación!";

      document.getElementById('calificacion').textContent = mensaje;
    }

    function actualizarRacha() {
      const porcentaje = Math.min((racha / 5) * 100, 100);
      const barra = document.getElementById('progressBar');
      barra.style.width = porcentaje + "%";
      barra.textContent = `${racha} / 5`;
    }

    function reiniciarContadores() {
      aciertos = 0;
      intentos = 0;
      racha = 0;
      actualizarContadores();
      actualizarRacha();
    }

    function cambiarOperacion() {
      generarSuma();
    }