// ==========================================
// CONFIGURACIÓN Y SINCRONIZACIÓN REMOTA (FALLBACK)
// ==========================================

// Aplicar estilos y vista de cuadrícula
function aplicarConfiguracion(config) {
  if (config.estilosCSS) {
    Object.entries(config.estilosCSS).forEach(([prop, val]) => {
      if (val) document.documentElement.style.setProperty(prop, val);
    });
  }

  const catalogo = document.getElementById("catalogo");
  const selectCol = document.getElementById("select-columnas");
  const vistaGuardada = localStorage.getItem("pstore_vista_grid");

  // Si el usuario no ha elegido una vista manualmente, aplicar la por defecto
  if (!vistaGuardada && catalogo && config.columnasMovilDefecto) {
    catalogo.classList.remove("grid-1", "grid-2", "grid-4");
    catalogo.classList.add(config.columnasMovilDefecto);
    if (selectCol) selectCol.value = config.columnasMovilDefecto;
  }
}

// Consultar Google Sheets en segundo plano
async function sincronizarConGoogleSheets() {
  if (typeof CONFIG_PSTORE === "undefined" || !CONFIG_PSTORE.urlSheetConfig) return;

  try {
    const res = await fetch(CONFIG_PSTORE.urlSheetConfig);
    if (!res.ok) throw new Error("Error al obtener datos de Google Sheets");

    const csvText = await res.text();
    const lineas = csvText.split("\n");

    lineas.forEach(linea => {
      const [param, valor] = linea.split(",").map(item => item?.trim());
      if (!param || !valor) return;

      if (param.startsWith("--")) {
        CONFIG_PSTORE.estilosCSS[param] = valor;
      }
      
      if (param === "columnas_movil_defecto") {
        CONFIG_PSTORE.columnasMovilDefecto = `grid-${valor}`;
      }
    });

    aplicarConfiguracion(CONFIG_PSTORE);
  } catch (error) {
    console.warn("Usando configuración local de config.js:", error);
  }
}

let clientesConocidos = [];
let clienteActual = null;
let productoActualModal = null; // Variable global para compartir

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar configuración inicial inmediata de config.js
    if (typeof CONFIG_PSTORE !== "undefined") {
      aplicarConfiguracion(CONFIG_PSTORE);
      sincronizarConGoogleSheets(); // Actualizar desde Sheets si hay red
    }
  
    // 2. Escuchador de cambios para el Selector de Vista (Columnas)
    const selectColumnas = document.getElementById("select-columnas");
    const contenedorCatalogo = document.getElementById("catalogo");
  
    if (selectColumnas && contenedorCatalogo) {
      // Restaurar si el usuario ya había guardado una opción previamente
      const vistaGuardada = localStorage.getItem("pstore_vista_grid");
      if (vistaGuardada) {
        selectColumnas.value = vistaGuardada;
        contenedorCatalogo.classList.remove("grid-1", "grid-2", "grid-4");
        if (vistaGuardada !== "grid-auto") {
          contenedorCatalogo.classList.add(vistaGuardada);
        }
      }
  
      selectColumnas.addEventListener("change", (e) => {
        const valor = e.target.value;
        contenedorCatalogo.classList.remove("grid-1", "grid-2", "grid-4");
        
        if (valor !== "grid-auto") {
          contenedorCatalogo.classList.add(valor);
        }
        
        localStorage.setItem("pstore_vista_grid", valor);
      });
    }
  
  let todosLosProductos = [];
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

  // Lógica de reset del logo (Colocar dentro de DOMContentLoaded)
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      if (selectCategoria) selectCategoria.value = "todas";
      if (selectPersonaje) selectPersonaje.value = "todas";
      if (inputBusqueda) inputBusqueda.value = "";
      
      history.replaceState(null, null, window.location.pathname);
      aplicarFiltros();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  actualizarContadorCarrito();
  // --- LÓGICA DE INSTALACIÓN PWA Y MENÚ LATERAL ---
  let deferredPrompt = null;
  
  const btnInstalarPWA = document.getElementById("btn-instalar-pwa");
  const btnHamburguesa = document.getElementById("btn-menu-hamburguesa");
  const btnCerrarMenu = document.getElementById("btn-cerrar-menu");
  const menuLateral = document.getElementById("menu-lateral");
  const menuOverlay = document.getElementById("menu-overlay");
  
  // 1. Interceptar el evento de instalación del navegador
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevenir que Chrome/Edge muestre el mini-infobar automático
    e.preventDefault();
    // Guardar el evento para dispararlo cuando el usuario presione el botón
    deferredPrompt = e;
    
    // Mostrar el botón en el menú lateral
    if (btnInstalarPWA) {
      btnInstalarPWA.style.display = "block";
    }
    // Lógica de reset del logo (Colocar dentro de DOMContentLoaded)
    const logo = document.querySelector(".logo");
    if (logo) {
      logo.style.cursor = "pointer";
      logo.addEventListener("click", (e) => {
        e.preventDefault();
        if (selectCategoria) selectCategoria.value = "todas";
        if (selectPersonaje) selectPersonaje.value = "todas";
        if (inputBusqueda) inputBusqueda.value = "";
        
        history.replaceState(null, null, window.location.pathname);
        aplicarFiltros();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
  
  // Acción al hacer clic en "Instalar App Pstore"
  if (btnInstalarPWA) {
    btnInstalarPWA.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      
      // Mostrar el prompt de instalación nativo
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('El usuario instaló la PWA');
      }
      deferredPrompt = null;
      btnInstalarPWA.style.display = "none";
      cerrarMenu();
    });
  }
  
  // Ocultar botón si la app ya está instalada e iniciada como App
  window.addEventListener("appinstalled", () => {
    if (btnInstalarPWA) btnInstalarPWA.style.display = "none";
    deferredPrompt = null;
  });
  
  // 2. Control Apertura / Cierre del Menú Lateral
  function abrirMenu() {
    if (menuLateral && menuOverlay) {
      menuLateral.classList.add("activo");
      menuOverlay.classList.add("activo");
    }
  }
  
  function cerrarMenu() {
    if (menuLateral && menuOverlay) {
      menuLateral.classList.remove("activo");
      menuOverlay.classList.remove("activo");
    }
  }
  
  if (btnHamburguesa) btnHamburguesa.addEventListener("click", abrirMenu);
  if (btnCerrarMenu) btnCerrarMenu.addEventListener("click", cerrarMenu);
  if (menuOverlay) menuOverlay.addEventListener("click", cerrarMenu);
  
  // Conectar Validación VIP dentro del Menú Lateral
  const btnValidarSide = document.getElementById("btn-validar-cliente-side");
  if (btnValidarSide) {
    btnValidarSide.addEventListener("click", () => {
      const input = document.getElementById("input-codigo-cliente-side").value;
      if (input) {
        identificarCliente(input);
        cerrarMenu();
      } else {
        alert("Por favor ingresa un correo o código válido.");
      }
    });
  }
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

      // Verificar si la URL trae un hash (#ID) o parámetro (?id=ID) al cargar
      verificarURLCompartida(todosLosProductos);
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

  function verificarURLCompartida(productos) {
    const hash = window.location.hash.replace("#", "").trim();
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    const targetId = hash || idParam;

    if (targetId) {
      const productoEncontrado = productos.find(p => p.id === targetId);
      if (productoEncontrado) {
        abrirModal(productoEncontrado);
      }
    }
  }

  function abrirModal(producto) {
    if (!modal) return;
    productoActualModal = producto; // Guardar referencia global

    const containerThumbnails = document.getElementById("modal-thumbnails");
    containerThumbnails.innerHTML = ""; 

    // 1. Separar URLs
    const fotosRaw = producto.imagen ? producto.imagen.split(",") : [];
    const fotos = fotosRaw.map(url => obtenerUrlDirectaDrive(url.trim())).filter(Boolean);

    // 2. Asignar foto principal
    const fotoPrincipal = fotos.length > 0 ? fotos[0] : 'assets/pstore.jpg';
    modalImg.src = fotoPrincipal;
    modalImg.alt = producto.nombre || "Producto";

    // 3. Miniaturas
    if (fotos.length > 1) {
      containerThumbnails.style.display = "flex";
      fotos.forEach((fotoUrl, index) => {
        const imgThumb = document.createElement("img");
        imgThumb.src = fotoUrl;
        imgThumb.className = index === 0 ? "thumb-img activa" : "thumb-img";

        imgThumb.addEventListener("click", () => {
          modalImg.src = fotoUrl;
          document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("activa"));
          imgThumb.classList.add("activa");
        });

        containerThumbnails.appendChild(imgThumb);
      });
    } else {
      containerThumbnails.style.display = "none";
    }

    // Cargar datos
    modalCategoria.textContent = producto.categoria || "";
    modalNombre.textContent = producto.nombre || "";
    modalDescripcion.textContent = producto.descripcion || "";
    modalPrecio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
    if (mostrandoBolivares && tasaBcvActual) {
    const montoBs = (producto.precio * tasaBcvActual).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    textoPrecio += ` <small style="font-size: 0.8em; color: #aaa;">(Bs. ${montoBs})</small>`;
  }
    // Configurar enlaces de compartir
    actualizarEnlacesCompartir(producto);

    if (producto.id) {
      history.replaceState(null, null, `#${producto.id}`);
    }

    modal.classList.add("activo");
  }

  function actualizarEnlacesCompartir(producto) {
    const urlProducto = `${window.location.origin}${window.location.pathname}#${producto.id}`;
    const textoMensaje = `¡Mira este producto en Pstore! ${producto.nombre} - $${parseFloat(producto.precio).toFixed(2)}`;

    const btnWa = document.getElementById("share-wa");
    const btnFb = document.getElementById("share-fb");

    if (btnWa) {
      btnWa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensaje + " " + urlProducto)}`;
    }
    if (btnFb) {
      btnFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlProducto)}`;
    }
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

  // --- FUNCIONES AUXILIARES ---

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

// --- FUNCIONES GLOBALES PARA BOTONES DE COMPARTIR ---

function compartirNativo() {
  if (!productoActualModal) return;
  const urlProducto = `${window.location.origin}${window.location.pathname}#${productoActualModal.id}`;
  
  if (navigator.share) {
    navigator.share({
      title: productoActualModal.nombre,
      text: `¡Mira este producto en Pstore! ${productoActualModal.nombre} - $${parseFloat(productoActualModal.precio).toFixed(2)}`,
      url: urlProducto
    }).catch(console.error);
  } else {
    copiarEnlaceProducto();
  }
}

function copiarEnlaceProducto() {
  if (!productoActualModal) return;
  const urlProducto = `${window.location.origin}${window.location.pathname}#${productoActualModal.id}`;
  
  navigator.clipboard.writeText(urlProducto).then(() => {
    alert("¡Enlace del producto copiado al portapapeles!");
  }).catch(() => {
    prompt("Copia el enlace manualmente:", urlProducto);
  });
}

// Estado global de moneda (Sin tasa por defecto)
let tasaBcvActual = null;
let mostrandoBolivares = false;

// Función para formatear el monto en bolívares
function formatearBs(montoUSD, tasa) {
  const totalBs = montoUSD * tasa;
  return totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Alternar la vista de moneda al hacer clic en el botón
function alternarMoneda() {
  if (!tasaBcvActual) return; // Si no hay tasa disponible, no realiza ninguna acción
  
  mostrandoBolivares = !mostrandoBolivares;
  const btnToggle = document.getElementById("btn-toggle-moneda");
  
  if (btnToggle) {
    btnToggle.classList.toggle("activo", mostrandoBolivares);
  }

  // Refrescar tarjetas de productos
  if (typeof renderizarProductos === "function") {
    renderizarProductos();
  }
}

// Sincronización con Google Sheets
async function sincronizarConGoogleSheets() {
  if (typeof CONFIG_PSTORE === "undefined" || !CONFIG_PSTORE.urlSheetConfig) return;

  try {
    const res = await fetch(CONFIG_PSTORE.urlSheetConfig);
    if (!res.ok) throw new Error("Error al obtener datos");

    const csvText = await res.text();
    const lineas = csvText.split("\n");

    lineas.forEach(linea => {
      const [param, valor] = linea.split(",").map(item => item?.trim());
      if (!param || !valor) return;

      // Leer la tasa únicamente si viene de la hoja
      if (param === "tasa_bcv") {
        const tasaParsed = parseFloat(valor.replace(",", "."));
        if (!isNaN(tasaParsed) && tasaParsed > 0) {
          tasaBcvActual = tasaParsed;
        }
      }

      if (param.startsWith("--")) {
        CONFIG_PSTORE.estilosCSS[param] = valor;
      }
    });

    // Habilitar el botón solo si se obtuvo una tasa válida
    const btnToggle = document.getElementById("btn-toggle-moneda");
    if (btnToggle && tasaBcvActual) {
      btnToggle.style.display = "inline-flex";
      btnToggle.addEventListener("click", alternarMoneda);
    }

    aplicarConfiguracion(CONFIG_PSTORE);

  } catch (error) {
    console.warn("No se pudo obtener la tasa BCV remota. La tienda se mantendrá en USD.", error);
  }
}

