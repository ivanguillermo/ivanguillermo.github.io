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
          categoria_secundaria: p.categoria_secundaria || p.personaje || p.coleccion || ""
        }))
        .filter((p) => p.nombre && p.categoria && p.precio);

      poblarCategorias(todosLosProductos);
      aplicarFiltros();
      configurarEventosBuscador();
      configurarEventosModal();
      configurarEventosCarrito();
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

  // --- FUNCIONES Y LÓGICA DE INTERFAZ ---

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
      // Limpiar opciones manteniendo la inicial
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
