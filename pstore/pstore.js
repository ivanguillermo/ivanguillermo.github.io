// ==========================================
// CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================
let listaProductosCompleta = [];
let clientesConocidos = [];
let clienteActual = null;
let productoActualModal = null;
let wishlistIDs = JSON.parse(localStorage.getItem("pstore_wishlist")) || [];
let carrito = JSON.parse(localStorage.getItem("pstore_carrito")) || [];

let tasaBcvActual = null;
let mostrandoBolivares = false;
let paginaActual = 1;
const productosPorPagina = 20;

// Aplicar estilos y vista inicial de cuadrícula
function aplicarConfiguracion(config) {
  if (config.estilosCSS) {
    Object.entries(config.estilosCSS).forEach(([prop, val]) => {
      if (val) document.documentElement.style.setProperty(prop, val);
    });
  }

  const catalogo = document.getElementById("catalogo");
  const selectCol = document.getElementById("select-columnas");
  const vistaGuardada = localStorage.getItem("pstore_vista_grid");

  if (!vistaGuardada && catalogo && config.columnasMovilDefecto) {
    catalogo.classList.remove("grid-1", "grid-2", "grid-4");
    catalogo.classList.add(config.columnasMovilDefecto);
    if (selectCol) selectCol.value = config.columnasMovilDefecto;
  }
}

// Sincronización con Google Sheets para Configuración
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

      if (param === "tasa_bcv") {
        const tasaParsed = parseFloat(valor.replace(",", "."));
        if (!isNaN(tasaParsed) && tasaParsed > 0) tasaBcvActual = tasaParsed;
      }

      if (param.startsWith("--")) CONFIG_PSTORE.estilosCSS[param] = valor;
      if (param === "numero_whatsapp") CONFIG_PSTORE.numeroWhatsapp = valor;
      if (param === "nombre_tienda") CONFIG_PSTORE.nombreTienda = valor;
      if (param === "url_logo") CONFIG_PSTORE.urlLogo = valor;
      if (param === "url_pdf_catalogo") CONFIG_PSTORE.urlPdfCatalogo = valor;
    });

    const btnToggle = document.getElementById("btn-toggle-moneda");
    if (btnToggle && tasaBcvActual) {
      btnToggle.style.display = "inline-flex";
      btnToggle.onclick = alternarMoneda;
    }

    aplicarConfiguracion(CONFIG_PSTORE);
  } catch (error) {
    console.warn("Usando configuración local de config.js:", error);
  }
}

// ==========================================
// INICIALIZACIÓN PRINCIPAL (DOM READY)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof CONFIG_PSTORE !== "undefined") {
    aplicarConfiguracion(CONFIG_PSTORE);
    sincronizarConGoogleSheets();
  }

  // 1. Cargar Productos desde Google Sheets
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=51076819&single=true&output=csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_"),
    complete: function (results) {
      listaProductosCompleta = results.data
        .map(p => ({
          ...p,
          id: p.id ? p.id.trim() : "",
          categoria_secundaria: p.categoria_secundaria || p.personaje || p.coleccion || ""
        }))
        .filter((p) => p.nombre && p.categoria && p.precio);

      poblarCategorias(listaProductosCompleta);
      construirFiltrosDinamicos();
      aplicarFiltrosYPaginacion();
      configurarEventosBuscador();
      configurarEventosModal();
      configurarEventosCarrito();
      verificarURLCompartida(listaProductosCompleta);
    }
  });

  // 2. Cargar Clientes VIP
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=1777061918&single=true&output=csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_"),
    complete: function (results) {
      clientesConocidos = results.data;
    }
  });

  // Eventos de interfaz
  actualizarContadorWishlist();
  actualizarContadorCarrito();

  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      resetearFiltros();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Eventos de la barra lateral de filtros
  document.getElementById("btn-limpiar-filtros")?.addEventListener("click", resetearFiltros);
  ["input-busqueda", "precio-min", "precio-max"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      paginaActual = 1;
      aplicarFiltrosYPaginacion();
    });
  });
});

// ==========================================
// FILTROS Y RENDERIZADO
// ==========================================
function obtenerValoresUnicos(lista, propiedad) {
  const valoresSet = new Set();
  lista.forEach(p => {
    const val = p[propiedad];
    if (!val) return;
    if (propiedad === "tallas") {
      val.split(",").forEach(t => valoresSet.add(t.trim().toUpperCase()));
    } else {
      valoresSet.add(val.trim());
    }
  });
  return Array.from(valoresSet).sort();
}

function construirFiltrosDinamicos() {
  const atributos = [
    { idContenedor: "grupo-categoria", claveCSV: "categoria" },
    { idContenedor: "grupo-categoria_secundaria", claveCSV: "categoria_secundaria" },
    { idContenedor: "grupo-coleccion", claveCSV: "coleccion" },
    { idContenedor: "grupo-tallas", claveCSV: "tallas" },
    { idContenedor: "grupo-estado", claveCSV: "estado" }
  ];

  atributos.forEach(({ idContenedor, claveCSV }) => {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    const valoresUnicos = obtenerValoresUnicos(listaProductosCompleta, claveCSV);
    contenedor.innerHTML = "";

    valoresUnicos.forEach(valor => {
      const label = document.createElement("label");
      if (claveCSV === "tallas") {
        label.className = "tag-check";
        label.innerHTML = `<input type="checkbox" class="filter-check" data-grupo="${claveCSV}" value="${valor}" /> ${valor}`;
      } else {
        label.innerHTML = `<input type="checkbox" class="filter-check" data-grupo="${claveCSV}" value="${valor}" /> ${valor}`;
      }
      contenedor.appendChild(label);
    });
  });

  document.querySelectorAll(".filter-check").forEach(cb => {
    cb.addEventListener("change", () => {
      paginaActual = 1;
      aplicarFiltrosYPaginacion();
    });
  });
}

function obtenerFiltrosSeleccionados() {
  const checkboxes = document.querySelectorAll(".filter-check:checked");
  const filtros = { categoria: [], categoria_secundaria: [], coleccion: [], tallas: [], estado: [] };

  checkboxes.forEach(cb => {
    const grupo = cb.dataset.grupo;
    if (filtros[grupo]) filtros[grupo].push(cb.value.toLowerCase());
  });

  const selectCat = document.getElementById("select-categoria")?.value;
  if (selectCat && selectCat !== "todas") filtros.categoria.push(selectCat.toLowerCase());

  const selectSec = document.getElementById("select-personaje")?.value;
  if (selectSec && selectSec !== "todas") filtros.categoria_secundaria.push(selectSec.toLowerCase());

  const textoBusqueda = document.getElementById("input-busqueda")?.value.toLowerCase().trim() || "";
  const precioMin = parseFloat(document.getElementById("precio-min")?.value) || 0;
  const precioMax = parseFloat(document.getElementById("precio-max")?.value) || Infinity;

  return { filtros, textoBusqueda, precioMin, precioMax };
}

function filtrarProductos() {
  const { filtros, textoBusqueda, precioMin, precioMax } = obtenerFiltrosSeleccionados();

  return listaProductosCompleta.filter(prod => {
    if (textoBusqueda) {
      const enNombre = prod.nombre?.toLowerCase().includes(textoBusqueda);
      const enDesc = prod.descripcion?.toLowerCase().includes(textoBusqueda);
      const enId = prod.id?.toString().toLowerCase().includes(textoBusqueda);
      if (!enNombre && !enDesc && !enId) return false;
    }

    const precio = parseFloat(prod.precio) || 0;
    if (precio < precioMin || precio > precioMax) return false;

    if (filtros.categoria.length > 0 && !filtros.categoria.includes(prod.categoria?.toLowerCase())) return false;
    if (filtros.categoria_secundaria.length > 0 && !filtros.categoria_secundaria.includes(prod.categoria_secundaria?.toLowerCase())) return false;
    if (filtros.coleccion.length > 0 && !filtros.coleccion.includes(prod.coleccion?.toLowerCase())) return false;

    if (filtros.tallas.length > 0) {
      const tallasProd = (prod.tallas || "").toLowerCase().split(",").map(t => t.trim());
      if (!filtros.tallas.some(t => tallasProd.includes(t))) return false;
    }

    if (filtros.estado.length > 0 && !filtros.estado.includes(prod.estado?.toLowerCase())) return false;

    return true;
  });
}

function aplicarFiltrosYPaginacion() {
  const filtrados = filtrarProductos();
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  renderizarTarjetas(filtrados.slice(inicio, fin));
  renderizarControlesPaginacion(filtrados.length);
}

function renderizarTarjetas(productos) {
  const contenedor = document.getElementById("catalogo");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  if (productos.length === 0) {
    contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;'>No se encontraron productos.</p>";
    return;
  }

  productos.forEach((prod) => {
    const esFav = wishlistIDs.includes(prod.id);
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const precioNum = parseFloat(prod.precio);
    const precioFormateado = isNaN(precioNum) ? prod.precio : precioNum.toFixed(2);
    let htmlPrecio = `<span class="precio">$${precioFormateado}</span>`;

    if (mostrandoBolivares && tasaBcvActual) {
      const montoBs = (precioNum * tasaBcvActual).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      htmlPrecio += `<span class="precio-bs-tarjeta">(Bs. ${montoBs})</span>`;
    }

    const srcImagen = obtenerUrlDirectaDrive(prod.imagen);

    tarjeta.innerHTML = `
      <button class="btn-fav ${esFav ? 'activo' : ''}" onclick="event.stopPropagation(); toggleFavorito('${prod.id}')">
        ${esFav ? '❤️' : '🤍'}
      </button>
      <img src="${srcImagen}" alt="${prod.nombre}" loading="lazy">
      <div class="contenido">
        <span class="categoria">${prod.categoria || ''}</span>
        <h2 class="nombre">${prod.nombre || ''}</h2>
        <p class="descripcion">${prod.descripcion || ''}</p>
        <div class="precios">${htmlPrecio}</div>
      </div>
    `;

    tarjeta.addEventListener("click", () => abrirModal(prod));
    contenedor.appendChild(tarjeta);
  });
}

function renderizarControlesPaginacion(totalProductos) {
  let container = document.getElementById("paginacion-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "paginacion-container";
    container.className = "paginacion-container";
    document.getElementById("catalogo")?.after(container);
  }
  container.innerHTML = "";

  const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.className = `btn-pagina ${i === paginaActual ? "activa" : ""}`;
    btn.textContent = i;
    btn.onclick = () => {
      paginaActual = i;
      aplicarFiltrosYPaginacion();
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    };
    container.appendChild(btn);
  }
}

function resetearFiltros() {
  document.querySelectorAll(".filter-check").forEach(cb => cb.checked = false);
  if (document.getElementById("input-busqueda")) document.getElementById("input-busqueda").value = "";
  if (document.getElementById("precio-min")) document.getElementById("precio-min").value = "";
  if (document.getElementById("precio-max")) document.getElementById("precio-max").value = "";
  if (document.getElementById("select-categoria")) document.getElementById("select-categoria").value = "todas";
  if (document.getElementById("select-personaje")) document.getElementById("select-personaje").value = "todas";
  paginaActual = 1;
  history.replaceState(null, null, window.location.pathname);
  aplicarFiltrosYPaginacion();
}

// ==========================================
// MODAL DE PRODUCTO Y COMPARTIR
// ==========================================
function abrirModal(producto) {
  const modal = document.getElementById("modal-producto");
  if (!modal) return;
  productoActualModal = producto;

  const containerThumbnails = document.getElementById("modal-thumbnails");
  const modalImg = document.getElementById("modal-img");
  containerThumbnails.innerHTML = "";

  const fotosRaw = producto.imagen ? producto.imagen.split(",") : [];
  const fotos = fotosRaw.map(url => obtenerUrlDirectaDrive(url.trim())).filter(Boolean);

  modalImg.src = fotos.length > 0 ? fotos[0] : 'assets/pstore.jpg';
  modalImg.alt = producto.nombre || "Producto";

  if (fotos.length > 1) {
    containerThumbnails.style.display = "flex";
    fotos.forEach((fotoUrl, index) => {
      const imgThumb = document.createElement("img");
      imgThumb.src = fotoUrl;
      imgThumb.className = index === 0 ? "thumb-img activa" : "thumb-img";
      imgThumb.onclick = () => {
        modalImg.src = fotoUrl;
        document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("activa"));
        imgThumb.classList.add("activa");
      };
      containerThumbnails.appendChild(imgThumb);
    });
  } else {
    containerThumbnails.style.display = "none";
  }

  document.getElementById("modal-categoria").textContent = producto.categoria || "";
  document.getElementById("modal-nombre").textContent = producto.nombre || "";
  document.getElementById("modal-descripcion").textContent = producto.descripcion || "";
  
  let textoPrecio = `$${parseFloat(producto.precio).toFixed(2)}`;
  if (mostrandoBolivares && tasaBcvActual) {
    const montoBs = (producto.precio * tasaBcvActual).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    textoPrecio += ` (Bs. ${montoBs})`;
  }
  document.getElementById("modal-precio").textContent = textoPrecio;

  actualizarEnlacesCompartir(producto);
  if (producto.id) history.replaceState(null, null, `#${producto.id}`);
  modal.classList.add("activo");
}

function cerrarModal() {
  const modal = document.getElementById("modal-producto");
  if (modal) {
    modal.classList.remove("activo");
    history.replaceState(null, null, window.location.pathname);
  }
}

function configurarEventosModal() {
  document.getElementById("cerrar-modal")?.addEventListener("click", cerrarModal);
  document.getElementById("modal-producto")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-producto") cerrarModal();
  });

  document.getElementById("btn-agregar-carrito")?.addEventListener("click", () => {
    if (productoActualModal) {
      agregarAlCarrito(productoActualModal);
      cerrarModal();
    }
  });

  document.getElementById("btn-consultar-whatsapp")?.addEventListener("click", () => {
    if (!productoActualModal) return;
    const telefono = CONFIG_PSTORE.numeroWhatsapp || "584126216661";
    const urlProducto = `${window.location.origin}${window.location.pathname}#${productoActualModal.id}`;
    let mensaje = `👋 ¡Hola Pstore! Quisiera consultar sobre este producto:\n\n📌 *${productoActualModal.nombre}*\n💰 *Precio:* $${parseFloat(productoActualModal.precio).toFixed(2)}\n🔗 *Link:* ${urlProducto}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
  });
}

function actualizarEnlacesCompartir(producto) {
  const urlProducto = `${window.location.origin}${window.location.pathname}#${producto.id}`;
  const textoMensaje = `¡Mira este producto en Pstore! ${producto.nombre} - $${parseFloat(producto.precio).toFixed(2)}`;
  
  const btnWa = document.getElementById("share-wa");
  const btnFb = document.getElementById("share-fb");

  if (btnWa) btnWa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensaje + " " + urlProducto)}`;
  if (btnFb) btnFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlProducto)}`;
}

// ==========================================
// CARRITO Y WISHLIST
// ==========================================
function toggleFavorito(idProducto) {
  const index = wishlistIDs.indexOf(idProducto);
  if (index === -1) {
    wishlistIDs.push(idProducto);
  } else {
    wishlistIDs.splice(index, 1);
  }
  localStorage.setItem("pstore_wishlist", JSON.stringify(wishlistIDs));
  actualizarContadorWishlist();
  aplicarFiltrosYPaginacion();
}

function actualizarContadorWishlist() {
  const badge = document.getElementById("wishlist-count");
  if (badge) badge.textContent = wishlistIDs.length;
}

function agregarAlCarrito(prod) {
  const existe = carrito.find((p) => p.nombre === prod.nombre);
  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ nombre: prod.nombre, precio: parseFloat(prod.precio) || 0, cantidad: 1 });
  }
  guardarYActualizarCarrito();
}

function modificarCantidad(nombre, cambio) {
  const prod = carrito.find((p) => p.nombre === nombre);
  if (prod) {
    prod.cantidad += cambio;
    if (prod.cantidad <= 0) carrito = carrito.filter((p) => p.nombre !== nombre);
  }
  guardarYActualizarCarrito();
}

function guardarYActualizarCarrito() {
  localStorage.setItem("pstore_carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  renderizarCarrito();
}

function actualizarContadorCarrito() {
  const cantCarritoHeader = document.getElementById("cant-carrito");
  if (cantCarritoHeader) cantCarritoHeader.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
}

function renderizarCarrito() {
  const listaCarrito = document.getElementById("lista-carrito");
  const totalMonto = document.getElementById("total-monto");
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
        <button class="btn-cant" onclick="modificarCantidad('${prod.nombre}', -1)">-</button>
        <span>${prod.cantidad}</span>
        <button class="btn-cant" onclick="modificarCantidad('${prod.nombre}', 1)">+</button>
      </div>
    `;
    listaCarrito.appendChild(item);
  });

  totalMonto.textContent = `$${total.toFixed(2)}`;
}

function configurarEventosCarrito() {
  const modalCarrito = document.getElementById("modal-carrito");
  document.getElementById("btn-carrito")?.addEventListener("click", () => {
    renderizarCarrito();
    modalCarrito?.classList.add("activo");
  });

  document.getElementById("cerrar-carrito")?.addEventListener("click", () => modalCarrito?.classList.remove("activo"));
  document.getElementById("btn-enviar-whatsapp")?.addEventListener("click", enviarPedidoWhatsApp);
}

function enviarPedidoWhatsApp() {
  if (carrito.length === 0) return alert("Tu carrito está vacío.");

  const nombreInput = document.getElementById("cliente-nombre").value.trim();
  const ciudad = document.getElementById("cliente-ciudad").value;
  const pago = document.getElementById("cliente-pago").value;

  let mensaje = `🛒 *¡Hola Pstore! Quisiera realizar el siguiente pedido:*\n\n`;
  let total = 0;

  carrito.forEach((prod) => {
    const subtotal = prod.precio * prod.cantidad;
    total += subtotal;
    mensaje += `• ${prod.cantidad}x ${prod.nombre} - $${subtotal.toFixed(2)}\n`;
  });

  mensaje += `\n💰 *Total:* $${total.toFixed(2)}\n👤 *Cliente:* ${nombreInput || 'Cliente'}\n📍 *Ubicación:* ${ciudad}\n💳 *Pago:* ${pago}`;

  const telefono = CONFIG_PSTORE.numeroWhatsapp || "584126216661";
  window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// ==========================================
// UTILIDADES AUXILIARES
// ==========================================
function alternarMoneda() {
  if (!tasaBcvActual) return;
  mostrandoBolivares = !mostrandoBolivares;
  document.getElementById("btn-toggle-moneda")?.classList.toggle("activo", mostrandoBolivares);
  aplicarFiltrosYPaginacion();
}

function obtenerUrlDirectaDrive(url) {
  if (!url) return 'assets/pstore.jpg';
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
}

function poblarCategorias(productos) {
  const selectCategoria = document.getElementById("select-categoria");
  if (!selectCategoria) return;

  const categorias = [...new Set(productos.map((p) => (p.categoria ? p.categoria.trim() : "")))].filter(Boolean);
  selectCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';

  categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });

  selectCategoria.onchange = () => {
    paginaActual = 1;
    aplicarFiltrosYPaginacion();
  };
  
  document.getElementById("select-personaje")?.addEventListener("change", () => {
    paginaActual = 1;
    aplicarFiltrosYPaginacion();
  });
}

function configurarEventosBuscador() {
  document.getElementById("input-busqueda")?.addEventListener("input", () => {
    paginaActual = 1;
    aplicarFiltrosYPaginacion();
  });
}

function verificarURLCompartida(productos) {
  const hash = window.location.hash.replace("#", "").trim();
  if (hash) {
    const producto = productos.find(p => p.id === hash);
    if (producto) abrirModal(producto);
  }
}

function compartirNativo() {
  if (!productoActualModal) return;
  const urlProducto = `${window.location.origin}${window.location.pathname}#${productoActualModal.id}`;
  if (navigator.share) {
    navigator.share({
      title: productoActualModal.nombre,
      text: `¡Mira este producto en Pstore! ${productoActualModal.nombre}`,
      url: urlProducto
    }).catch(console.error);
  } else {
    copiarEnlaceProducto();
  }
}

function copiarEnlaceProducto() {
  if (!productoActualModal) return;
  const urlProducto = `${window.location.origin}${window.location.pathname}#${productoActualModal.id}`;
  navigator.clipboard.writeText(urlProducto).then(() => alert("¡Enlace copiado al portapapeles!"));
}
