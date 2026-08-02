document.addEventListener("DOMContentLoaded", () => {
  let todosLosProductos = [];

  // Elementos del DOM
  const selectCategoria = document.getElementById("select-categoria");
  const selectCategoriaSec = document.getElementById("select-categoria-sec");
  const inputBusqueda = document.getElementById("input-busqueda");

  // Elementos del Modal
  const modal = document.getElementById("modal-producto");
  const cerrarModalBtn = document.getElementById("cerrar-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCategoria = document.getElementById("modal-categoria");
  const modalNombre = document.getElementById("modal-nombre");
  const modalDescripcion = document.getElementById("modal-descripcion");
  const modalPrecio = document.getElementById("modal-precio");

  // 1. Cargar el CSV con PapaParse
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=0&single=true&output=csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (results.errors && results.errors.length > 0) {
        console.warn("Advertencias al leer el CSV:", results.errors);
      }

      todosLosProductos = results.data.filter(
        (p) => p.nombre && p.categoria && p.precio
      );

      poblarCategorias(todosLosProductos);
      aplicarFiltros();
      configurarEventosBuscador();
      configurarEventosModal();
    },
    error: function (err) {
      console.error("Error al cargar el archivo CSV:", err);
    }
  });

  // Helper: Convertir links de Drive a imagen directa
  function obtenerUrlDirectaDrive(url) {
    if (!url) return 'assets/placeholder.jpg';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  }

  // Helper: Normalizar texto (sin acentos, en minúsculas)
  function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // 2. Poblar ambos <select> (Principal y Secundario) y el Footer
  function poblarCategorias(productos) {
    const footerUl = document.getElementById("footer-categorias");

    // Categorías Principales
    const categorias = [
      ...new Set(productos.map((p) => (p.categoria ? p.categoria.trim() : "")))
    ].filter(Boolean);

    // Categorías Secundarias (Personajes / Temáticas)
    const categoriasSec = [
      ...new Set(
        productos.map((p) => (p.categoria_secundaria ? p.categoria_secundaria.trim() : ""))
      )
    ].filter(Boolean);

    // Llenar <select> de Categoría Principal
    if (selectCategoria) {
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
      });

      selectCategoria.addEventListener("change", aplicarFiltros);
    }

    // Llenar <select> de Categoría Secundaria
    if (selectCategoriaSec) {
      categoriasSec.forEach((catSec) => {
        const option = document.createElement("option");
        option.value = catSec;
        option.textContent = catSec;
        selectCategoriaSec.appendChild(option);
      });

      selectCategoriaSec.addEventListener("change", aplicarFiltros);
    }

    // Llenar Footer (Categorías Principales)
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
          if (selectCategoriaSec) selectCategoriaSec.value = "todas";
          if (inputBusqueda) inputBusqueda.value = "";
          aplicarFiltros();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  // 3. Configurar eventos del Buscador
  function configurarEventosBuscador() {
    if (!inputBusqueda) return;
    inputBusqueda.addEventListener("input", aplicarFiltros);
  }

  // 4. Aplicar Filtro Combinado (Categoría Principal + Categoría Secundaria + Búsqueda)
  function aplicarFiltros() {
    const catSel = selectCategoria ? selectCategoria.value : "todas";
    const catSecSel = selectCategoriaSec ? selectCategoriaSec.value : "todas";
    const query = inputBusqueda ? normalizarTexto(inputBusqueda.value) : "";

    const productosFiltrados = todosLosProductos.filter((prod) => {
      // Filtro Categoría Principal
      const coincideCat =
        catSel === "todas" ||
        (prod.categoria && prod.categoria.trim() === catSel);

      // Filtro Categoría Secundaria
      const coincideCatSec =
        catSecSel === "todas" ||
        (prod.categoria_secundaria && prod.categoria_secundaria.trim() === catSecSel);

      // Búsqueda por Texto (Nombre, Categorías, Descripción)
      const nombreNorm = normalizarTexto(prod.nombre);
      const catNorm = normalizarTexto(prod.categoria);
      const catSecNorm = normalizarTexto(prod.categoria_secundaria);
      const descNorm = normalizarTexto(prod.descripcion);

      const coincideTexto =
        query === "" ||
        nombreNorm.includes(query) ||
        catNorm.includes(query) ||
        catSecNorm.includes(query) ||
        descNorm.includes(query);

      return coincideCat && coincideCatSec && coincideTexto;
    });

    renderizarCatalogo(productosFiltrados);
  }

  // 5. Renderizar tarjetas
  function renderizarCatalogo(productos) {
    const contenedor = document.getElementById("catalogo");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (productos.length === 0) {
      contenedor.innerHTML =
        "<p style='grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;'>No se encontraron productos que coincidan con la búsqueda.</p>";
      return;
    }

    productos.forEach((prod) => {
      const tarjeta = document.createElement("article");
      
      // Comprobar si está en oferta/promo (insensible a mayúsculas/espacios)
      const estadoNorm = normalizarTexto(prod.estado);
      const esPromo = estadoNorm.includes("en promo") || estadoNorm.includes("promo") || estadoNorm.includes("oferta");
      
      // Agregar clases CSS dinámicas
      tarjeta.className = esPromo ? "tarjeta en-promo" : "tarjeta";

      const precioNum = parseFloat(prod.precio);
      const precioFormateado = isNaN(precioNum)
        ? prod.precio
        : precioNum.toFixed(2);

      const srcImagen = obtenerUrlDirectaDrive(prod.imagen);

      const tagSecundaria = prod.categoria_secundaria
        ? `<span class="categoria-sec"> • ${prod.categoria_secundaria}</span>`
        : "";

      // Si está en promo, agregamos el Badge dorado flotante
      const badgeHtml = esPromo ? `<span class="badge-promo">¡En Promo!</span>` : "";

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

      tarjeta.addEventListener("click", () => {
        abrirModal(prod);
      });

      contenedor.appendChild(tarjeta);
    });
  }
  // 6. Lógica del Modal
  function abrirModal(producto) {
    if (!modal) return;

    const precioNum = parseFloat(producto.precio);
    const precioFormateado = isNaN(precioNum)
      ? producto.precio
      : precioNum.toFixed(2);

    const tagSecundaria = producto.categoria_secundaria
      ? ` (${producto.categoria_secundaria})`
      : "";

    modalImg.src = obtenerUrlDirectaDrive(producto.imagen);
    modalImg.alt = producto.nombre || "Producto";
    modalCategoria.textContent = (producto.categoria || "") + tagSecundaria;
    modalNombre.textContent = producto.nombre || "";
    modalDescripcion.textContent = producto.descripcion || "";
    modalPrecio.textContent = `$${precioFormateado}`;

    modal.classList.add("activo");
  }

  function cerrarModal() {
    if (modal) {
      modal.classList.remove("activo");
    }
  }

  function configurarEventosModal() {
    if (cerrarModalBtn) {
      cerrarModalBtn.addEventListener("click", cerrarModal);
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("activo")) {
        cerrarModal();
      }
    });
  }
});
let carrito = JSON.parse(localStorage.getItem("pstore_carrito")) || [];

// Agregar producto al carrito
function agregarAlCarrito(producto) {
  const existe = carrito.find(p => p.nombre === producto.nombre);
  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarritoStorage();
}

// Generar el mensaje y abrir WhatsApp
function enviarPedidoWhatsApp() {
  if (carrito.length === 0) return alert("Tu carrito está vacío.");

  const nombre = document.getElementById("cliente-nombre").value.trim() || "Cliente";
  const ciudad = document.getElementById("cliente-ciudad").value;
  const pago = document.getElementById("cliente-pago").value;

  let mensaje = `🛒 *¡Hola Pstore! Quisiera realizar el siguiente pedido:*\n\n`;

  let total = 0;
  carrito.forEach(prod => {
    const subtotal = parseFloat(prod.precio) * prod.cantidad;
    total += subtotal;
    mensaje += `• ${prod.cantidad}x ${prod.nombre} - $${subtotal.toFixed(2)}\n`;
  });

  mensaje += `\n💰 *Total Estimado:* $${total.toFixed(2)}\n`;
  mensaje += `-----------------------------\n`;
  mensaje += `👤 *Cliente:* ${nombre}\n`;
  mensaje += `📍 *Ubicación:* ${ciudad}\n`;
  mensaje += `💳 *Método de Pago:* ${pago}\n\n`;
  mensaje += `¿Me confirman disponibilidad para acordar la entrega?`;

  // Número de WhatsApp de Pstore (formato internacional sin signos: 58412...)
  const telefonoPstore = "584120000000"; 
  
  // Construcción de la URL codificada
  const urlWA = `https://wa.me/${telefonoPstore}?text=${encodeURIComponent(mensaje)}`;

  // Abrir en pestaña nueva
  window.open(urlWA, "_blank");
}
