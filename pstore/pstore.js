document.addEventListener("DOMContentLoaded", () => {
  let todosLosProductos = [];
  let productoActualModal = null;

  // Carrito persistente en el navegador
  let carrito = JSON.parse(localStorage.getItem("pstore_carrito")) || [];

  // Elementos DOM Filtros
  const selectCategoria = document.getElementById("select-categoria");
  const selectCategoriaSec = document.getElementById("select-categoria-sec");
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

  // Elementos Modal Carrito
  const btnCarritoHeader = document.getElementById("btn-carrito");
  const cantCarritoHeader = document.getElementById("cant-carrito");
  const modalCarrito = document.getElementById("modal-carrito");
  const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
  const listaCarrito = document.getElementById("lista-carrito");
  const totalMonto = document.getElementById("total-monto");
  const btnEnviarWhatsApp = document.getElementById("btn-enviar-whatsapp");

  // Inicializar contador del carrito en el header
  actualizarContadorCarrito();

  // 1. Cargar el CSV con PapaParse
  Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=51076819&single=true&output=csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    transformHeader: function(header) {
      return header
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "_");
    },
    complete: function (results) {
      if (results.errors && results.errors.length > 0) {
        console.warn("Advertencias CSV:", results.errors);
      }

      todosLosProductos = results.data
        .map(p => ({
          ...p,
          categoria_secundaria: p.categoria_secundaria || p.personaje || p.coleccion || ""
        }))
        .filter((p) => p.nombre && p.categoria && p.precio);

      poblarCategorias(todosLosProductos);
      aplicarFiltros();
      configurarEventosBuscador();
      configurarEventosModal();
      configurarEventosCarrito();
    },
    error: function (err) {
      console.error("Error al cargar el CSV:", err);
    }
  });

  // Helpers
  function obtenerUrlDirectaDrive(url) {
    if (!url) return 'assets/placeholder.jpg';
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return match && match[1] ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
  }

  function normalizarTexto(texto) {
    if (!texto) return "";
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Poblar Filtros y Footer
  function poblarCategorias(productos) {
    const footerUl = document.getElementById("footer-categorias");

    const categorias = [...new Set(productos.map((p) => (p.categoria ? p.categoria.trim() : "")))].filter(Boolean);
    const categoriasSec = [...new Set(productos.map((p) => (p.categoria_secundaria ? p.categoria_secundaria.trim() : "")))].filter(Boolean);

    if (selectCategoria) {
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
      });
      selectCategoria.addEventListener("change", aplicarFiltros);
    }

    if (selectCategoriaSec) {
      categoriasSec.forEach((catSec) => {
        const option = document.createElement("option");
        option.value = catSec;
        option.textContent = catSec;
        selectCategoriaSec.appendChild(option);
      });
      selectCategoriaSec.addEventListener("change", aplicarFiltros);
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
          if (selectCategoriaSec) selectCategoriaSec.value = "todas";
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

  // Filtro
  function aplicarFiltros() {
    const catSel = selectCategoria ? selectCategoria.value : "todas";
    const catSecSel = selectCategoriaSec ? selectCategoriaSec.value : "todas";
    const query = inputBusqueda ? normalizarTexto(inputBusqueda.value) : "";

    const productosFiltrados = todosLosProductos.filter((prod) => {
      const coincideCat = catSel === "todas" || (prod.categoria && prod.categoria.trim() === catSel);
      const coincideCatSec = catSecSel === "todas" || (prod.categoria_secundaria && prod.categoria_secundaria.trim() === catSecSel);

      const coincideTexto = query === "" ||
        normalizarTexto(prod.nombre).includes(query) ||
        normalizarTexto(prod.categoria).includes(query) ||
        normalizarTexto(prod.categoria_secundaria).includes(query) ||
        normalizarTexto(prod.descripcion).includes(query);

      return coincideCat && coincideCatSec && coincideTexto;
    });

    renderizarCatalogo(productosFiltrados);
  }

  // Renderizar Tarjetas
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

      tarjeta.className = esPromo ? "tarjeta en-promo" : "tarjeta";

      const precioNum = parseFloat(prod.precio);
      const precioFormateado = isNaN(precioNum) ? prod.precio : precioNum.toFixed(2);
      const srcImagen = obtenerUrlDirectaDrive(prod.imagen);
      const tagSecundaria = prod.categoria_secundaria ? `<span class="categoria-sec"> • ${prod.categoria_secundaria}</span>` : "";
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

      tarjeta.addEventListener("click", () => abrirModal(prod));
      contenedor.appendChild(tarjeta);
    });
  }

  // Modal de Detalle
  function abrirModal(producto) {
    if (!modal) return;
    productoActualModal = producto;

    const precioNum = parseFloat(producto.precio);
    const precioFormateado = isNaN(precioNum) ? producto.precio : precioNum.toFixed(2);
    const tagSecundaria = producto.categoria_secundaria ? ` (${producto.categoria_secundaria})` : "";

    modalImg.src = obtenerUrlDirectaDrive(producto.imagen);
    modalImg.alt = producto.nombre || "Producto";
    modalCategoria.textContent = (producto.categoria || "") + tagSecundaria;
    modalNombre.textContent = producto.nombre || "";
    modalDescripcion.textContent = producto.descripcion || "";
    modalPrecio.textContent = `$${precioFormateado}`;

    modal.classList.add("activo");
  }

  function cerrarModal() {
    if (modal) modal.classList.remove("activo");
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
  }

  // ==========================================
  // LÓGICA COMPLETA DEL CARRITO DE COMPRAS
  // ==========================================
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

    totalMonto.textContent = `$${total.toFixed(2)}`;

    // Asignar clicks a botones + y -
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

    const nombre = document.getElementById("cliente-nombre").value.trim() || "Cliente";
    const ciudad = document.getElementById("cliente-ciudad").value;
    const pago = document.getElementById("cliente-pago").value;

    let mensaje = `🛒 *¡Hola Pstore! Quisiera realizar el siguiente pedido:*\n\n`;

    let total = 0;
    carrito.forEach((prod) => {
      const subtotal = prod.precio * prod.cantidad;
      total += subtotal;
      mensaje += `• ${prod.cantidad}x ${prod.nombre} - $${subtotal.toFixed(2)}\n`;
    });

    mensaje += `\n💰 *Total Estimado:* $${total.toFixed(2)}\n`;
    mensaje += `-----------------------------\n`;
    mensaje += `👤 *Cliente:* ${nombre}\n`;
    mensaje += `📍 *Ubicación:* ${ciudad}\n`;
    mensaje += `💳 *Método de Pago:* ${pago}\n\n`;
    mensaje += `¿Me confirman disponibilidad para acordar la entrega?`;

    // Reemplaza por tu número real de WhatsApp Business (Código país 58)
    const telefonoPstore = "584126216661"; 
    const urlWA = `https://wa.me/${telefonoPstore}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWA, "_blank");
  }
});

// Variable global para almacenar la lista de clientes conocidos
let clientesConocidos = [];
let clienteActual = null;

// URL de la pestaña "Clientes" en CSV (Reemplaza con tu URL publicada de la pestaña Clientes)
const URL_CSV_CLIENTES = "https://docs.google.com/spreadsheets/d/e/TU_LINK_PUBLICADO_CLIENTES/pub?gid=TU_GID&single=true&output=csv";

// Cargar la lista de clientes al iniciar
Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=1777061918&single=true&output=csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  transformHeader: h => h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_"),
  complete: function (results) {
    clientesConocidos = results.data;
    console.log("Clientes cargados con éxito:", clientesConocidos.length);
  }
});

// Función para identificar al cliente
function identificarCliente(correoOCodigo) {
  const query = correoOCodigo.trim().toLowerCase();
  
  // Buscar coincidencia por correo o código
  const encontrado = clientesConocidos.find(c => 
    (c.correo___codigo && c.correo___codigo.trim().toLowerCase() === query)
  );

  if (encontrado) {
    clienteActual = {
      nombre: encontrado.nombre_cliente,
      descuento: parseFloat(encontrado.descuento____) || 0,
      permiteCredito: (encontrado.permite_credito || "").trim().toUpperCase() === "SI"
    };
    alert(`¡Bienvenido/a ${clienteActual.nombre}! Se ha aplicado tu descuento de cliente especial (${clienteActual.descuento}%).`);
  } else {
    clienteActual = null;
    alert("Código o correo no registrado. Continuarás con precios regulares.");
  }

  actualizarOpcionesCheckout();
  renderizarCarrito(); // Re-renderiza para aplicar descuentos si los hay
}

// Mostrar/Ocultar la opción de pago "A Crédito" según el perfil
function actualizarOpcionesCheckout() {
  const selectPago = document.getElementById("cliente-pago");
  let opcionCredito = selectPago.querySelector("option[value='A Crédito']");

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
document.getElementById("btn-validar-cliente").addEventListener("click", () => {
  const input = document.getElementById("input-codigo-cliente").value;
  if (input) identificarCliente(input);
});
