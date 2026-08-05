let clientesConocidos = [];
let clienteActual = null;

document.addEventListener("DOMContentLoaded", () => {
  let todosLosProductos = [];
  let productoActualModal = null;
  let carrito = JSON.parse(localStorage.getItem("pstore_carrito")) || [];

  // Elementos DOM Filtros
  const selectCategoria = document.getElementById("select-categoria");
  const selectPersonaje = document.getElementById("select-personaje");
  const inputBusqueda = document.getElementById("input-busqueda");

  // Elementos Modal Producto
  const modal = document.getElementById("modal-producto");
  const cerrarModalBtn = document.getElementById("cerrar-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCategoria = document.getElementById("modal-categoria");
  const modalNombre = document.getElementById("modal-nombre");
  const modalDescripcion = document.getElementById("modal-descripcion");
  const modalPrecio = document.getElementById("modal-precio");
  const btnAgregarCarrito = document.getElementById("btn-agregar-carrito");
  const btnConsultarWA = document.getElementById("btn-consultar-whatsapp");

  // Elementos Modal Carrito
  const btnCarritoHeader = document.getElementById("btn-carrito");
  const cantCarritoHeader = document.getElementById("cant-carrito");
  const modalCarrito = document.getElementById("modal-carrito");
  const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalMonto = document.getElementById("total-monto");
  const btnEnviarWhatsApp = document.getElementById("btn-enviar-whatsapp");
  const btnValidarCliente = document.getElementById("btn-validar-cliente");

  actualizarContadorCarrito();

  // 1. CARGAR CATÁLOGO DE PRODUCTOS (CSV)
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=51076819&single=true&output=csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_"),
    complete: function (results) {
      todosLosProductos = results.data
        .map(p => ({
          ...p,
          id: p.id ? p.id.trim() : "",
          categoria_secundaria: p.categoria_secundaria || p.personaje || p.coleccion || ""
        }))
        .filter((p) => p.nombre && p.categoria && p.precio);

      poblarCategorias(todosLosProductos);
      aplicarFiltros();
      configurarEventosBuscador();
      configurarEventosModal();
      configurarEventosCarrito();

      // Verificar si la URL trae un hash directo (#ID) al cargar
      verificarHashURL();
    }
  });

  // 2. CARGAR CLIENTES CONOCIDOS (CSV)
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=1777061918&single=true&output=csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_"),
    complete: function (results) {
      clientesConocidos = results.data;
    }
  });

  // Evento Validar Cliente VIP
  if (btnValidarCliente) {
    btnValidarCliente.addEventListener("click", () => {
      const input = document.getElementById("input-codigo-cliente").value;
      if (input) {
        identificarCliente(input);
      } else {
        alert("Por favor ingresa un correo o código válido.");
      }
    });
  }

  // --- LÓGICA DE RUTA Y MODAL DE PRODUCTO ---

  function verificarHashURL() {
    const hash = window.location.hash.replace("#", "").trim();
    if (hash) {
      const productoEncontrado = todosLosProductos.find(p => p.id === hash);
      if (productoEncontrado) {
        abrirModal(productoEncontrado);
      }
    }
  }

  function abrirModal(producto) {
    if (!modal) return;
    productoActualModal = producto;

    const containerThumbnails = document.getElementById("modal-thumbnails");
    containerThumbnails.innerHTML = ""; // Limpiar miniaturas anteriores

    // 1. Separar URLs por coma
    const fotosRaw = producto.imagen ? producto.imagen.split(",") : [];
    const fotos = fotosRaw.map(url => obtenerUrlDirectaDrive(url.trim())).filter(Boolean);

    // 2. Asignar la primera foto como principal
    const fotoPrincipal = fotos.length > 0 ? fotos[0] : 'assets/pstore.jpg';
    modalImg.src = fotoPrincipal;
    modalImg.alt = producto.nombre || "Producto";

    // 3. Generar las miniaturas solo si hay más de 1 foto
    if (fotos.length > 1) {
      containerThumbnails.style.display = "flex";
      fotos.forEach((fotoUrl, index) => {
        const imgThumb = document.createElement("img");
        imgThumb.src = fotoUrl;
        imgThumb.className = index === 0 ? "thumb-img activa" : "thumb-img";

        // Al hacer clic en la miniatura, cambia la foto grande
        imgThumb.addEventListener("click", () => {
          modalImg.src = fotoUrl;
          document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("activa"));
          imgThumb.classList.add("activa");
        });

        containerThumbnails.appendChild(imgThumb);
      });
    } else {
      containerThumbnails.style.display = "none"; // Ocultar si solo hay una foto
    }

    // Cargar datos de texto
    modalCategoria.textContent = producto.categoria || "";
    modalNombre.textContent = producto.nombre || "";
    modalDescripcion.textContent = producto.descripcion || "";
    modalPrecio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;

    if (producto.id) {
      history.replaceState(null, null, `#${producto.id}`);
    }

    modal.classList.add("activo");
  }

  function cerrarModal() {
    if (modal) {
      modal.classList.remove("activo");
      history.replaceState(null, null, window.location.pathname);
    }
  }

  function configurarEventosModal() {
    if (cerrarModalBtn) cerrarModalBtn.addEventListener("click", cerrarModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
      });
    }

    if (btnAgregarCarrito) {
      btnAgregarCarrito.addEventListener("click", () => {
        if (productoActualModal) {
          agregarAlCarrito(productoActualModal);
          cerrarModal();
        }
      });
    }

    if (btnConsultarWA) {
      btnConsultarWA.addEventListener("click", () => {
        if (!productoActualModal) return;

        const telefonoPstore = "584126216661";
        const urlProducto = `${window.location.origin}${window.location.pathname}#${productoActualModal.id}`;
        
        let mensaje = `👋 ¡Hola Pstore! Quisiera consultar sobre este producto:\n\n`;
        mensaje += `📌 *${productoActualModal.nombre}*\n`;
        mensaje += `💰 *Precio:* $${parseFloat(productoActualModal.precio).toFixed(2)}\n`;
        if (productoActualModal.id) mensaje += `🆔 *ID:* ${productoActualModal.id}\n`;
        mensaje += `🔗 *Link:* ${urlProducto}\n\n`;
        mensaje += `¿Tienen disponibilidad para envío/entrega?`;

        window.open(`https://wa.me/${telefonoPstore}?text=${encodeURIComponent(mensaje)}`, "_blank");
      });
    }
  }

  // --- FUNCIONES AUXILIARES DE INTERFAZ Y FILTROS ---

  function obtenerUrlDirectaDrive(url) {
    if (!url) return 'assets/pstore.jpg';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
  }

  function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function poblarCategorias(productos) {
    const footerUl = document.getElementById("footer-categorias");
    const categorias = [...new Set(productos.map((p) => (p.categoria ? p.categoria.trim() : "")))].filter(Boolean);

    if (selectCategoria) {
      selectCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
      });
      selectCategoria.addEventListener("change", aplicarFiltros);
    }

    if (selectPersonaje) {
      selectPersonaje.addEventListener("change", aplicarFiltros);
    }

    if (footerUl) {
      categorias.forEach((cat) => {
        const li = document.createElement("li");
        li.innerHTML = `<a data-cat="${cat}">${cat}</a>`;
        footerUl.appendChild(li);
      });

      footerUl.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          const cat = e.target.getAttribute("data-cat");
          if (selectCategoria) selectCategoria.value = cat;
          if (selectPersonaje) selectPersonaje.value = "todas";
          if (inputBusqueda) inputBusqueda.value = "";
          aplicarFiltros();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  function configurarEventosBuscador() {
    if (inputBusqueda) inputBusqueda.addEventListener("input", aplicarFiltros);
  }

  function aplicarFiltros() {
    const catSel = selectCategoria ? selectCategoria.value : "todas";
    const catSecSel = selectPersonaje ? selectPersonaje.value : "todas";
    const query = inputBusqueda ? normalizarTexto(inputBusqueda.value) : "";

    const productosFiltrados = todosLosProductos.filter((prod) => {
      const coincideCat = catSel === "todas" || (prod.categoria && prod.categoria.trim() === catSel);
      const coincideCatSec = catSecSel === "todas" || 
        (prod.categoria_secundaria && prod.categoria_secundaria.trim().toLowerCase() === catSecSel.toLowerCase());

      const coincideTexto = query === "" ||
        normalizarTexto(prod.nombre).includes(query) ||
        normalizarTexto(prod.categoria).includes(query) ||
        normalizarTexto(prod.categoria_secundaria).includes(query) ||
        normalizarTexto(prod.descripcion).includes(query);

      return coincideCat && coincideCatSec && coincideTexto;
    });

    renderizarCatalogo(productosFiltrados);
  }

  function renderizarCatalogo(productos) {
    const contenedor = document.getElementById("catalogo");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    if (productos.length === 0) {
      contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;'>No se encontraron productos.</p>";
      return;
    }

    productos.forEach((prod) => {
      const tarjeta = document.createElement("article");
      const estadoNorm = normalizarTexto(prod.estado);

      const esPromo = estadoNorm.includes("promo") || estadoNorm.includes("oferta");
      const esNuevo = estadoNorm.includes("nuevo");
      const pocasUnidades = estadoNorm.includes("pocas") || estadoNorm.includes("agotando");

      let clasesTarjeta = "tarjeta";
      let badgeHtml = "";

      if (esNuevo) {
        clasesTarjeta += " es-nuevo";
        badgeHtml = `<span class="badge-promo badge-nuevo">🔥 ¡Nuevo!</span>`;
      } else if (pocasUnidades) {
        clasesTarjeta += " pocas-unidades";
        badgeHtml = `<span class="badge-promo badge-pocas">⚡ Pocas Unidades</span>`;
      } else if (esPromo) {
        clasesTarjeta += " en-promo";
        badgeHtml = `<span class="badge-promo">🏷️ ¡En Promo!</span>`;
      }

      tarjeta.className = clasesTarjeta;

      const precioNum = parseFloat(prod.precio);
      const precioFormateado = isNaN(precioNum) ? prod.precio : precioNum.toFixed(2);
      const srcImagen = obtenerUrlDirectaDrive(prod.imagen);
      const tagSecundaria = prod.categoria_secundaria ? `<span class="categoria-sec"> • ${prod.categoria_secundaria}</span>` : "";

      tarjeta.innerHTML = `
        ${badgeHtml}
        <img src="${srcImagen}" alt="${prod.nombre}">
        <div class="contenido">
          <span class="categoria">${prod.categoria || ''}${tagSecundaria}</span>
          <h2 class="nombre">${prod.nombre || ''}</h2>
          <p class="descripcion">${prod.descripcion || ''}</p>
          <span class="precio">$${precioFormateado}</span>
        </div>
      `;

      tarjeta.addEventListener("click", () => abrirModal(prod));
      contenedor.appendChild(tarjeta);
    });
  }

  // --- LÓGICA DEL CARRITO ---

  function agregarAlCarrito(prod) {
    const existe = carrito.find((p) => p.nombre === prod.nombre);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({
        nombre: prod.nombre,
        precio: parseFloat(prod.precio) || 0,
        cantidad: 1
      });
    }
    guardarYActualizarCarrito();
  }

  function modificarCantidad(nombre, cambio) {
    const prod = carrito.find((p) => p.nombre === nombre);
    if (prod) {
      prod.cantidad += cambio;
      if (prod.cantidad <= 0) {
        carrito = carrito.filter((p) => p.nombre !== nombre);
      }
    }
    guardarYActualizarCarrito();
  }

  function guardarYActualizarCarrito() {
    localStorage.setItem("pstore_carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    renderizarCarrito();
  }

  function actualizarContadorCarrito() {
    const totalCant = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    if (cantCarritoHeader) cantCarritoHeader.textContent = totalCant;
  }

  function renderizarCarrito() {
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
      listaCarrito.innerHTML = "<p style='text-align: center; color: var(--text-secondary); padding: 1.5rem;'>Tu carrito está vacío.</p>";
      totalMonto.textContent = "$0.00";
      return;
    }

    let total = 0;
    carrito.forEach((prod) => {
      const subtotal = prod.precio * prod.cantidad;
      total += subtotal;

      const item = document.createElement("div");
      item.className = "item-carrito";
      item.innerHTML = `
        <div class="info-item-carrito">
          <strong>${prod.nombre}</strong>
          <span>$${prod.precio.toFixed(2)} c/u</span>
        </div>
        <div class="controles-item-carrito">
          <button class="btn-cant" data-nombre="${prod.nombre}" data-cambio="-1">-</button>
          <span>${prod.cantidad}</span>
          <button class="btn-cant" data-nombre="${prod.nombre}" data-cambio="1">+</button>
        </div>
      `;
      listaCarrito.appendChild(item);
    });

    let totalFinal = total;
    if (clienteActual && clienteActual.descuento > 0) {
      const montoDescuento = (total * clienteActual.descuento) / 100;
      totalFinal = total - montoDescuento;
      totalMonto.innerHTML = `<span style="font-size:0.85rem; text-decoration:line-through; color:#888;">$${total.toFixed(2)}</span> $${totalFinal.toFixed(2)} (${clienteActual.descuento}% desc.)`;
    } else {
      totalMonto.textContent = `$${total.toFixed(2)}`;
    }

    listaCarrito.querySelectorAll(".btn-cant").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const nombre = e.target.getAttribute("data-nombre");
        const cambio = parseInt(e.target.getAttribute("data-cambio"));
        modificarCantidad(nombre, cambio);
      });
    });
  }

  function configurarEventosCarrito() {
    if (btnCarritoHeader) {
      btnCarritoHeader.addEventListener("click", () => {
        renderizarCarrito();
        modalCarrito.classList.add("activo");
      });
    }

    if (cerrarCarritoBtn) {
      cerrarCarritoBtn.addEventListener("click", () => {
        modalCarrito.classList.remove("activo");
      });
    }

    if (modalCarrito) {
      modalCarrito.addEventListener("click", (e) => {
        if (e.target === modalCarrito) modalCarrito.classList.remove("activo");
      });
    }

    if (btnEnviarWhatsApp) {
      btnEnviarWhatsApp.addEventListener("click", enviarPedidoWhatsApp);
    }
  }

  function enviarPedidoWhatsApp() {
    if (carrito.length === 0) return alert("Tu carrito está vacío.");

    const nombreInput = document.getElementById("cliente-nombre").value.trim();
    const nombre = clienteActual ? clienteActual.nombre : (nombreInput || "Cliente");
    const ciudad = document.getElementById("cliente-ciudad").value;
    const pago = document.getElementById("cliente-pago").value;

    let mensaje = `🛒 *¡Hola Pstore! Quisiera realizar el siguiente pedido:*\n\n`;

    let total = 0;
    carrito.forEach((prod) => {
      const subtotal = prod.precio * prod.cantidad;
      total += subtotal;
      mensaje += `• ${prod.cantidad}x ${prod.nombre} - $${subtotal.toFixed(2)}\n`;
    });

    let totalFinal = total;
    if (clienteActual && clienteActual.descuento > 0) {
      const montoDescuento = (total * clienteActual.descuento) / 100;
      totalFinal = total - montoDescuento;
      mensaje += `\n🏷️ *Descuento VIP (${clienteActual.descuento}%):* -$${montoDescuento.toFixed(2)}\n`;
    }

    mensaje += `💰 *Total a Pagar:* $${totalFinal.toFixed(2)}\n`;
    mensaje += `-----------------------------\n`;
    mensaje += `👤 *Cliente:* ${nombre} ${clienteActual ? '⭐ [Cliente Registrado]' : ''}\n`;
    mensaje += `📍 *Ubicación:* ${ciudad}\n`;
    mensaje += `💳 *Método de Pago:* ${pago}\n\n`;
    mensaje += `¿Me confirman disponibilidad para acordar la entrega?`;

    const telefonoPstore = "584126216661";
    window.open(`https://wa.me/${telefonoPstore}?text=${encodeURIComponent(mensaje)}`, "_blank");
  }

  function identificarCliente(correoOCodigo) {
    const query = correoOCodigo.trim().toLowerCase();
    
    const encontrado = clientesConocidos.find(c => {
      const valorCodigo = Object.keys(c).find(k => k.includes("correo") || k.includes("codigo"));
      return c[valorCodigo] && c[valorCodigo].trim().toLowerCase() === query;
    });

    if (encontrado) {
      const keyNombre = Object.keys(encontrado).find(k => k.includes("nombre")) || "nombre_cliente";
      const keyDescuento = Object.keys(encontrado).find(k => k.includes("descuento")) || "descuento";
      const keyCredito = Object.keys(encontrado).find(k => k.includes("credito")) || "permite_credito";

      clienteActual = {
        nombre: encontrado[keyNombre] || "Cliente Registrado",
        descuento: parseFloat(encontrado[keyDescuento]) || 0,
        permiteCredito: (encontrado[keyCredito] || "").trim().toUpperCase() === "SI"
      };
      alert(`¡Bienvenido/a ${clienteActual.nombre}! Se ha aplicado tu descuento de cliente especial (${clienteActual.descuento}%).`);
    } else {
      clienteActual = null;
      alert("Código o correo no registrado. Continuarás con precios regulares.");
    }

    actualizarOpcionesCheckout();
    renderizarCarrito();
  }

  function actualizarOpcionesCheckout() {
    const selectPago = document.getElementById("cliente-pago");
    if (!selectPago) return;

    let opcionCredito = selectPago.querySelector("option[value='A Crédito / Cuenta Corriente']");

    if (clienteActual && clienteActual.permiteCredito) {
      if (!opcionCredito) {
        opcionCredito = document.createElement("option");
        opcionCredito.value = "A Crédito / Cuenta Corriente";
        opcionCredito.textContent = "💳 Pago a Crédito (Cliente VIP)";
        selectPago.appendChild(opcionCredito);
      }
    } else {
      if (opcionCredito) {
        opcionCredito.remove();
      }
    }
  }
});

// Variable global para almacenar el producto actual que está en el modal
var productoActualModal = null;

function abrirModalProducto(producto) {
  productoActualModal = producto; // Guardar datos del producto
  
  // URL base de tu página web (ejemplo: https://ivanguillermo.github.io/)
  // Para enlazar directamente al producto, usamos un parámetro id o hash
  var urlProducto = window.location.origin + window.location.pathname + "?id=" + producto.id;
  var textoMensaje = `¡Mira este producto en Pstore! ${producto.nombre} - $${producto.precio}`;

  // 1. Configurar enlace para WhatsApp
  var urlWA = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensaje + " " + urlProducto)}`;
  document.getElementById("share-wa").href = urlWA;

  // 2. Configurar enlace para Facebook
  var urlFB = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlProducto)}`;
  document.getElementById("share-fb").href = urlFB;

  // Mostrar el modal...
  document.getElementById("miModal").style.display = "block";
}

// Función para el botón nativo (Móvil)
function compartirNativo() {
  if (navigator.share && productoActualModal) {
    var urlProducto = window.location.origin + window.location.pathname + "?id=" + productoActualModal.id;
    
    navigator.share({
      title: productoActualModal.nombre,
      text: `¡Mira este producto en Pstore! ${productoActualModal.nombre} - $${productoActualModal.precio}`,
      url: urlProducto
    }).catch(console.error);
  } else {
    // Si está en PC y no soporta Web Share, copia el enlace al portapapeles
    copiarEnlaceProducto();
  }
}

// Función rápida para copiar el enlace
function copiarEnlaceProducto() {
  if (!productoActualModal) return;
  var urlProducto = window.location.origin + window.location.pathname + "?id=" + productoActualModal.id;
  
  navigator.clipboard.writeText(urlProducto).then(function() {
    alert("¡Enlace del producto copiado al portapapeles!");
  });
}

window.addEventListener('DOMContentLoaded', function() {
  // Leer los parámetros de la URL
  var urlParams = new URLSearchParams(window.location.search);
  var idProducto = urlParams.get('id');

  if (idProducto) {
    // Buscar el producto en tu lista de productos por su ID
    var productoEncontrado = listaDeProductos.find(p => p.id === idProducto);
    if (productoEncontrado) {
      abrirModalProducto(productoEncontrado);
    }
  }
});
