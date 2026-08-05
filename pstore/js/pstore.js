/* ==========================================================================
   PSTORE — MOTOR PRINCIPAL (js/pstore.js)
   ========================================================================== */

(function () {
  'use strict';

  // --- ESTADO GLOBAL DE LA APLICACIÓN ---
  const Estado = {
    productos: [],
    productosFiltrados: [],
    carrito: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CARRITO)) || [],
    wishlist: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.WISHLIST)) || [],
    clienteVIP: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CLIENTE_VIP)) || null,
    monedaActual: localStorage.getItem(CONFIG.STORAGE_KEYS.MONEDA) || CONFIG.MONEDA_BASE,
    tasaBs: CONFIG.TASA_CAMBIO_BS,
    paginaActual: 1,
    filtros: {
      busqueda: '',
      categoria: 'todas',
      categoriasCheckbox: [],
      publico: 'todas',
      colecciones: [],
      tallas: [],
      estado: [],
      precioMin: null,
      precioMax: null
    },
    deferredPromptPWA: null
  };

  // --- INICIALIZACIÓN ---
  document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
  });

  async function inicializarApp() {
    configurarEventListeners();
    actualizarBadgesHeader();
    await cargarProductosCSV();
    procesarParametrosURL();
    configurarPWA();
  }

  /* ==========================================================================
     1. CARGA Y PROCESAMIENTO DE DATOS (PAPAPARSE)
     ========================================================================== */
  function cargarProductosCSV() {
    return new Promise((resolve) => {
      Papa.parse(CONFIG.SHEET_CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            Estado.productos = normalizarProductos(results.data);
            Estado.productosFiltrados = [...Estado.productos];
            poblarFiltrosEstaticosDinamicos();
            renderizarCatalogo();
          } else {
            mostrarErrorCatalogo('No se encontraron registros de productos en el origen de datos.');
          }
          resolve();
        },
        error: (err) => {
          console.error('Error al parsear el CSV:', err);
          mostrarErrorCatalogo('No se pudo conectar con la base de datos de productos.');
          resolve();
        }
      });
    });
  }

  function normalizarProductos(dataRaw) {
    return dataRaw.map((item, idx) => {
      const id = String(item.ID || item.id || `PROD-${idx + 1}`).trim();
      const nombre = String(item.Nombre || item.nombre || 'Producto sin título').trim();
      const categoria = String(item.Categoria || item.categoria || 'General').trim();
      const categoriaSecundaria = String(item.CategoriaSecundaria || item.categoria_secundaria || item.Publico || 'Unisex').trim();
      const coleccion = String(item.Coleccion || item.coleccion || item.Franquicia || '').trim();
      const talla = String(item.Talla || item.talla || '').trim();
      
      const precio = parseFloat(String(item.Precio || item.precio || 0).replace(',', '.')) || 0;
      const precioAnterior = parseFloat(String(item.PrecioAnterior || item.precio_anterior || 0).replace(',', '.')) || 0;
      
      const imagen = item.Imagen || item.imagen ? String(item.Imagen || item.imagen).trim() : 'assets/pstore.jpg';
      const galeriaRaw = item.Galeria || item.galeria || '';
      const galeria = galeriaRaw ? galeriaRaw.split(',').map(url => url.trim()) : [imagen];
      
      const descripcion = String(item.Descripcion || item.descripcion || 'Sin descripción detallada.').trim();
      const destacado = String(item.Destacado || item.destacado).toUpperCase() === 'TRUE';
      const nuevo = String(item.Nuevo || item.nuevo).toUpperCase() === 'TRUE';

      return {
        id,
        nombre,
        categoria,
        categoriaSecundaria,
        coleccion,
        talla,
        precio,
        precioAnterior,
        imagen,
        galeria,
        descripcion,
        destacado,
        nuevo
      };
    });
  }

  /* ==========================================================================
     2. EVENT LISTENERS Y BINDINGS DEL DOM
     ========================================================================== */
  function configurarEventListeners() {
    // Menú Lateral
    const btnMenu = document.getElementById('btn-menu-hamburguesa');
    const btnCerrarMenu = document.getElementById('btn-cerrar-menu');
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.getElementById('menu-overlay');

    btnMenu?.addEventListener('click', () => toggleMenu(true));
    btnCerrarMenu?.addEventListener('click', () => toggleMenu(false));
    overlay?.addEventListener('click', () => toggleMenu(false));

    // Búsqueda
    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) {
      inputBusqueda.addEventListener('input', debounce((e) => {
        Estado.filtros.busqueda = e.target.value.toLowerCase().trim();
        ejecutarFiltrado();
      }, 250));
    }

    // Selectores del Header
    document.getElementById('select-categoria')?.addEventListener('change', (e) => {
      Estado.filtros.categoria = e.target.value;
      ejecutarFiltrado();
    });

    document.getElementById('select-personaje')?.addEventListener('change', (e) => {
      Estado.filtros.publico = e.target.value;
      ejecutarFiltrado();
    });

    document.getElementById('select-columnas')?.addEventListener('change', (e) => {
      const catalogo = document.getElementById('catalogo');
      if (!catalogo) return;
      catalogo.classList.remove('grid-1', 'grid-2', 'grid-4');
      if (e.target.value !== 'grid-auto') {
        catalogo.classList.add(e.target.value);
      }
    });

    // Conversión de Moneda
    document.getElementById('btn-toggle-moneda')?.addEventListener('click', alternarMoneda);

    // Filtros de Precio
    document.getElementById('precio-min')?.addEventListener('input', debounce((e) => {
      Estado.filtros.precioMin = parseFloat(e.target.value) || null;
      ejecutarFiltrado();
    }, 300));

    document.getElementById('precio-max')?.addEventListener('input', debounce((e) => {
      Estado.filtros.precioMax = parseFloat(e.target.value) || null;
      ejecutarFiltrado();
    }, 300));

    document.getElementById('btn-limpiar-filtros')?.addEventListener('click', resetearFiltros);

    // Modales
    document.getElementById('btn-carrito')?.addEventListener('click', () => abrirModal('modal-carrito'));
    document.getElementById('cerrar-carrito')?.addEventListener('click', () => cerrarModal('modal-carrito'));
    document.getElementById('cerrar-modal')?.addEventListener('click', () => cerrarModal('modal-producto'));
    
    // Acciones de Pedido por WhatsApp
    document.getElementById('btn-enviar-whatsapp')?.addEventListener('click', procesarPedidoWhatsApp);

    // Validaciones VIP
    document.getElementById('btn-validar-cliente')?.addEventListener('click', () => validarVIP('input-codigo-cliente'));
    document.getElementById('btn-validar-cliente-side')?.addEventListener('click', () => validarVIP('input-codigo-cliente-side'));
  }

  function toggleMenu(abrir) {
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.getElementById('menu-overlay');
    if (abrir) {
      menuLateral?.classList.add('activo');
      overlay?.classList.add('activo');
    } else {
      menuLateral?.classList.remove('activo');
      overlay?.classList.remove('activo');
    }
  }

  /* ==========================================================================
     3. FILTRADO Y FACETAS
     ========================================================================== */
  function poblarFiltrosEstaticosDinamicos() {
    // Categorías
    const categorias = [...new Set(Estado.productos.map(p => p.categoria))].filter(Boolean);
    const selectCat = document.getElementById('select-categoria');
    const grupoCat = document.getElementById('grupo-categoria');

    if (selectCat) {
      selectCat.innerHTML = '<option value="todas">Todas las categorías</option>' + 
        categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    if (grupoCat) {
      grupoCat.innerHTML = categorias.map(c => `
        <label>
          <input type="checkbox" value="${c}" class="chk-cat-facet"> ${c}
        </label>
      `).join('');

      grupoCat.querySelectorAll('.chk-cat-facet').forEach(chk => {
        chk.addEventListener('change', () => {
          Estado.filtros.categoriasCheckbox = Array.from(
            grupoCat.querySelectorAll('.chk-cat-facet:checked')
          ).map(el => el.value);
          ejecutarFiltrado();
        });
      });
    }

    // Colecciones
    const colecciones = [...new Set(Estado.productos.map(p => p.coleccion))].filter(Boolean);
    const grupoCol = document.getElementById('grupo-coleccion');
    if (grupoCol) {
      grupoCol.innerHTML = colecciones.map(col => `
        <label>
          <input type="checkbox" value="${col}" class="chk-col-facet"> ${col}
        </label>
      `).join('');

      grupoCol.querySelectorAll('.chk-col-facet').forEach(chk => {
        chk.addEventListener('change', () => {
          Estado.filtros.colecciones = Array.from(
            grupoCol.querySelectorAll('.chk-col-facet:checked')
          ).map(el => el.value);
          ejecutarFiltrado();
        });
      });
    }

    // Tallas
    const tallas = [...new Set(Estado.productos.map(p => p.talla))].filter(Boolean);
    const grupoTallas = document.getElementById('grupo-tallas');
    if (grupoTallas) {
      grupoTallas.innerHTML = tallas.map(t => `
        <button type="button" class="btn-talla" data-talla="${t}">${t}</button>
      `).join('');

      grupoTallas.querySelectorAll('.btn-talla').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('activo');
          const tallaVal = btn.getAttribute('data-talla');
          if (Estado.filtros.tallas.includes(tallaVal)) {
            Estado.filtros.tallas = Estado.filtros.tallas.filter(t => t !== tallaVal);
          } else {
            Estado.filtros.tallas.push(tallaVal);
          }
          ejecutarFiltrado();
        });
      });
    }
  }

  function ejecutarFiltrado() {
    Estado.productosFiltrados = Estado.productos.filter(p => {
      // Coincidencia por Búsqueda (Nombre o ID)
      const matchBusqueda = !Estado.filtros.busqueda || 
        p.nombre.toLowerCase().includes(Estado.filtros.busqueda) || 
        p.id.toLowerCase().includes(Estado.filtros.busqueda);

      // Select Categoría Principal
      const matchCatSelect = Estado.filtros.categoria === 'todas' || p.categoria === Estado.filtros.categoria;

      // Checkboxes Categorías
      const matchCatChks = Estado.filtros.categoriasCheckbox.length === 0 || Estado.filtros.categoriasCheckbox.includes(p.categoria);

      // Público / Personaje
      const matchPublico = Estado.filtros.publico === 'todas' || p.categoriaSecundaria === Estado.filtros.publico;

      // Colección
      const matchColeccion = Estado.filtros.colecciones.length === 0 || Estado.filtros.colecciones.includes(p.coleccion);

      // Talla
      const matchTalla = Estado.filtros.tallas.length === 0 || Estado.filtros.tallas.includes(p.talla);

      // Rango de Precio
      const matchPrecioMin = Estado.filtros.precioMin === null || p.precio >= Estado.filtros.precioMin;
      const matchPrecioMax = Estado.filtros.precioMax === null || p.precio <= Estado.filtros.precioMax;

      return matchBusqueda && matchCatSelect && matchCatChks && matchPublico && matchColeccion && matchTalla && matchPrecioMin && matchPrecioMax;
    });

    Estado.paginaActual = 1;
    renderizarCatalogo();
  }

  function resetearFiltros() {
    Estado.filtros = {
      busqueda: '',
      categoria: 'todas',
      categoriasCheckbox: [],
      publico: 'todas',
      colecciones: [],
      tallas: [],
      estado: [],
      precioMin: null,
      precioMax: null
    };

    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    document.querySelectorAll('.btn-talla').forEach(b => b.classList.remove('activo'));
    
    const busqueda = document.getElementById('input-busqueda');
    if (busqueda) busqueda.value = '';
    const selCat = document.getElementById('select-categoria');
    if (selCat) selCat.value = 'todas';
    const selPub = document.getElementById('select-personaje');
    if (selPub) selPub.value = 'todas';
    const pMin = document.getElementById('precio-min');
    if (pMin) pMin.value = '';
    const pMax = document.getElementById('precio-max');
    if (pMax) pMax.value = '';

    Estado.productosFiltrados = [...Estado.productos];
    Estado.paginaActual = 1;
    renderizarCatalogo();
  }

  /* ==========================================================================
     4. RENDERIZADO DE CATÁLOGO Y PAGINACIÓN
     ========================================================================== */
  function renderizarCatalogo() {
    const catalogo = document.getElementById('catalogo');
    const sinResultados = document.getElementById('sin-resultados');
    if (!catalogo) return;

    catalogo.innerHTML = '';

    if (Estado.productosFiltrados.length === 0) {
      if (sinResultados) sinResultados.style.display = 'block';
      renderizarPaginacion(0);
      return;
    }

    if (sinResultados) sinResultados.style.display = 'none';

    const inicio = (Estado.paginaActual - 1) * CONFIG.ITEMS_POR_PAGINA;
    const fin = inicio + CONFIG.ITEMS_POR_PAGINA;
    const paginados = Estado.productosFiltrados.slice(inicio, fin);

    paginados.forEach(prod => {
      const enWishlist = Estado.wishlist.includes(prod.id);
      const tarjeta = document.createElement('article');
      tarjeta.className = 'tarjeta-producto';

      const precioDisplay = calcularPrecioMoneda(prod.precio);
      const precioAntDisplay = prod.precioAnterior > 0 ? calcularPrecioMoneda(prod.precioAnterior) : null;

      tarjeta.innerHTML = `
        <div class="imagen-container">
          <div class="badges">
            ${prod.nuevo ? '<span class="badge badge-nuevo">Nuevo</span>' : ''}
            ${prod.precioAnterior > prod.precio ? '<span class="badge badge-descuento">Oferta</span>' : ''}
          </div>
          <button class="btn-fav ${enWishlist ? 'activo' : ''}" data-id="${prod.id}" title="Favoritos">
            ${enWishlist ? '❤️' : '🤍'}
          </button>
          <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy" onerror="this.src='assets/pstore.jpg'">
        </div>
        <div class="info-producto">
          <span class="categoria">${prod.categoria}</span>
          <h3 class="nombre" data-id="${prod.id}">${prod.nombre}</h3>
          <div class="precio-contenedor">
            <span class="precio-actual">${precioDisplay}</span>
            ${precioAntDisplay ? `<span class="precio-anterior">${precioAntDisplay}</span>` : ''}
          </div>
          <div class="acciones-tarjeta">
            <button class="btn-agregar-tarjeta" data-id="${prod.id}">
              🛒 Agregar
            </button>
          </div>
        </div>
      `;

      // Handlers de Click
      tarjeta.querySelector('.imagen-container img').addEventListener('click', () => abrirModalDetalle(prod.id));
      tarjeta.querySelector('.nombre').addEventListener('click', () => abrirModalDetalle(prod.id));
      
      tarjeta.querySelector('.btn-agregar-tarjeta').addEventListener('click', (e) => {
        e.stopPropagation();
        agregarAlCarrito(prod.id);
      });

      tarjeta.querySelector('.btn-fav').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(prod.id);
      });

      catalogo.appendChild(tarjeta);
    });

    renderizarPaginacion(Estado.productosFiltrados.length);
  }

  function renderizarPaginacion(totalItems) {
    const container = document.getElementById('paginacion-container');
    if (!container) return;

    container.innerHTML = '';
    const totalPaginas = Math.ceil(totalItems / CONFIG.ITEMS_POR_PAGINA);

    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.innerText = i;
      if (i === Estado.paginaActual) btn.classList.add('activo');
      btn.addEventListener('click', () => {
        Estado.paginaActual = i;
        renderizarCatalogo();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      container.appendChild(btn);
    }
  }

  /* ==========================================================================
     5. MODAL DETALLE DE PRODUCTO
     ========================================================================== */
  function abrirModalDetalle(id) {
    const prod = Estado.productos.find(p => p.id === id);
    if (!prod) return;

    const modalImg = document.getElementById('modal-img');
    const modalCat = document.getElementById('modal-categoria');
    const modalNom = document.getElementById('modal-nombre');
    const modalDesc = document.getElementById('modal-descripcion');
    const modalPrecio = document.getElementById('modal-precio');
    const thumbnailsContainer = document.getElementById('modal-thumbnails');

    if (modalImg) modalImg.src = prod.imagen;
    if (modalCat) modalCat.innerText = prod.categoria;
    if (modalNom) modalNom.innerText = prod.nombre;
    if (modalDesc) modalDesc.innerText = prod.descripcion;
    if (modalPrecio) modalPrecio.innerText = calcularPrecioMoneda(prod.precio);

    // Galería
    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = '';
      if (prod.galeria && prod.galeria.length > 1) {
        prod.galeria.forEach(imgUrl => {
          const thumb = document.createElement('img');
          thumb.src = imgUrl;
          thumb.className = 'thumb-img';
          thumb.addEventListener('click', () => {
            if (modalImg) modalImg.src = imgUrl;
          });
          thumbnailsContainer.appendChild(thumb);
        });
      }
    }

    // Redes y Compartir
    const urlProducto = `${window.location.origin}${window.location.pathname}?prod=${prod.id}`;
    const txtShare = `Mira este producto en Pstore: ${prod.nombre}`;
    
    const shareWa = document.getElementById('share-wa');
    if (shareWa) shareWa.href = `https://wa.me/?text=${encodeURIComponent(txtShare + ' ' + urlProducto)}`;

    const shareFb = document.getElementById('share-fb');
    if (shareFb) shareFb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlProducto)}`;

    // Acciones Modal
    const btnAgregar = document.getElementById('btn-agregar-carrito');
    if (btnAgregar) {
      btnAgregar.onclick = () => {
        agregarAlCarrito(prod.id);
        cerrarModal('modal-producto');
      };
    }

    const btnConsultar = document.getElementById('btn-consultar-whatsapp');
    if (btnConsultar) {
      btnConsultar.onclick = () => {
        const msg = `Hola Pstore, quisiera consultar disponibilidad de: ${prod.nombre} (Código: ${prod.id})`;
        window.open(`https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
      };
    }

    abrirModal('modal-producto');
  }

  /* ==========================================================================
     6. CARRITO, WISHLIST Y MONEDA
     ========================================================================== */
  function agregarAlCarrito(id) {
    const prod = Estado.productos.find(p => p.id === id);
    if (!prod) return;

    const item = Estado.carrito.find(i => i.id === id);
    if (item) {
      item.cantidad++;
    } else {
      Estado.carrito.push({ ...prod, cantidad: 1 });
    }

    guardarEstadoStorage();
    actualizarBadgesHeader();
  }

  function cambiarCantidadCarrito(id, delta) {
    const item = Estado.carrito.find(i => i.id === id);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
      Estado.carrito = Estado.carrito.filter(i => i.id !== id);
    }

    guardarEstadoStorage();
    actualizarBadgesHeader();
    renderizarModalCarrito();
  }

  function toggleWishlist(id) {
    if (Estado.wishlist.includes(id)) {
      Estado.wishlist = Estado.wishlist.filter(item => item !== id);
    } else {
      Estado.wishlist.push(id);
    }
    guardarEstadoStorage();
    actualizarBadgesHeader();
    renderizarCatalogo();
  }

  function alternarMoneda() {
    Estado.monedaActual = Estado.monedaActual === 'USD' ? 'BS' : 'USD';
    localStorage.setItem(CONFIG.STORAGE_KEYS.MONEDA, Estado.monedaActual);
    renderizarCatalogo();
    renderizarModalCarrito();
  }

  function calcularPrecioMoneda(montoUSD) {
    if (Estado.monedaActual === 'BS') {
      const totalBs = montoUSD * Estado.tasaBs;
      return `Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${montoUSD.toFixed(2)}`;
  }

  function guardarEstadoStorage() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CARRITO, JSON.stringify(Estado.carrito));
    localStorage.setItem(CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(Estado.wishlist));
  }

  function actualizarBadgesHeader() {
    const cantCart = document.getElementById('cant-carrito');
    if (cantCart) {
      const totalItems = Estado.carrito.reduce((sum, i) => sum + i.cantidad, 0);
      cantCart.innerText = totalItems;
    }

    const cantWish = document.getElementById('wishlist-count');
    if (cantWish) {
      cantWish.innerText = Estado.wishlist.length;
    }
  }

  function renderizarModalCarrito() {
    const lista = document.getElementById('lista-carrito');
    const totalMonto = document.getElementById('total-monto');
    if (!lista || !totalMonto) return;

    lista.innerHTML = '';
    let totalUSD = 0;

    if (Estado.carrito.length === 0) {
      lista.innerHTML = '<p class="sin-resultados">Tu carrito está vacío actualmente.</p>';
      totalMonto.innerText = calcularPrecioMoneda(0);
      return;
    }

    Estado.carrito.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      totalUSD += subtotal;

      const row = document.createElement('div');
      row.className = 'carrito-item-row';
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);';
      
      row.innerHTML = `
        <div style="flex:1;">
          <strong style="display:block; font-size:0.9rem;">${item.nombre}</strong>
          <small style="color:var(--text-muted);">${calcularPrecioMoneda(item.precio)} c/u</small>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button class="btn-qty btn-restar" style="background:var(--bg-input); color:var(--text-main); width:26px; height:26px; border-radius:4px;">-</button>
          <span style="font-weight:bold;">${item.cantidad}</span>
          <button class="btn-qty btn-sumar" style="background:var(--bg-input); color:var(--text-main); width:26px; height:26px; border-radius:4px;">+</button>
          <span style="font-weight:bold; min-width:65px; text-align:right;">${calcularPrecioMoneda(subtotal)}</span>
        </div>
      `;

      row.querySelector('.btn-restar').addEventListener('click', () => cambiarCantidadCarrito(item.id, -1));
      row.querySelector('.btn-sumar').addEventListener('click', () => cambiarCantidadCarrito(item.id, 1));

      lista.appendChild(row);
    });

    // Descuento VIP
    if (Estado.clienteVIP) {
      const descuento = totalUSD * (CONFIG.DESCUENTO_VIP_PORCENTAJE / 100);
      totalUSD -= descuento;
    }

    totalMonto.innerText = calcularPrecioMoneda(totalUSD);
  }

  function procesarPedidoWhatsApp() {
    if (Estado.carrito.length === 0) {
      alert('Añade al menos un producto al carrito antes de solicitar el pedido.');
      return;
    }

    const nombre = document.getElementById('cliente-nombre')?.value.trim();
    const ciudad = document.getElementById('cliente-ciudad')?.value;
    const pago = document.getElementById('cliente-pago')?.value;

    if (!nombre) {
      alert('Por favor, indica tu Nombre y Apellido.');
      return;
    }

    let msj = `🛍️ *NUEVO PEDIDO EN PSTORE*\n`;
    msj += `👤 *Cliente:* ${nombre}\n`;
    msj += `📍 *Ubicación:* ${ciudad}\n`;
    msj += `💳 *Método de Pago:* ${pago}\n`;
    if (Estado.clienteVIP) {
      msj += `🌟 *Cliente VIP:* ${Estado.clienteVIP.codigo} (${CONFIG.DESCUENTO_VIP_PORCENTAJE}% desc.)\n`;
    }
    msj += `\n📦 *Detalle de Compra:*\n`;

    let total = 0;
    Estado.carrito.forEach(i => {
      const sub = i.precio * i.cantidad;
      total += sub;
      msj += `- ${i.cantidad}x ${i.nombre} (${calcularPrecioMoneda(sub)})\n`;
    });

    if (Estado.clienteVIP) {
      const desc = total * (CONFIG.DESCUENTO_VIP_PORCENTAJE / 100);
      total -= desc;
      msj += `\n🎁 *Descuento VIP Aplicado:* -${calcularPrecioMoneda(desc)}`;
    }

    msj += `\n💰 *Total Final Estimado:* ${calcularPrecioMoneda(total)}`;

    window.open(`https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(msj)}`, '_blank');
  }

  /* ==========================================================================
     7. UTILIDADES (VIP, URL PARAMS, PWA, UTILS)
     ========================================================================== */
  function validarVIP(inputId) {
    const val = document.getElementById(inputId)?.value.trim().toUpperCase();
    if (!val) {
      alert('Ingresa tu código o correo registrado.');
      return;
    }

    if (CONFIG.CODIGOS_VIP.includes(val) || val.includes('@')) {
      Estado.clienteVIP = { codigo: val, fecha: new Date().toISOString() };
      localStorage.setItem(CONFIG.STORAGE_KEYS.CLIENTE_VIP, JSON.stringify(Estado.clienteVIP));
      alert(`¡Código VIP validado con éxito! Se aplicará un ${CONFIG.DESCUENTO_VIP_PORCENTAJE}% de descuento en tu total.`);
      renderizarModalCarrito();
    } else {
      alert('Código VIP no reconocido. Verifica e intenta nuevamente.');
    }
  }

  function procesarParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('prod');
    if (prodId) {
      abrirModalDetalle(prodId);
    }
  }

  function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      if (id === 'modal-carrito') renderizarModalCarrito();
      modal.classList.add('activo');
    }
  }

  function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('activo');
  }

  function mostrarErrorCatalogo(mensaje) {
    const catalogo = document.getElementById('catalogo');
    if (catalogo) {
      catalogo.innerHTML = `<div class="sin-resultados"><p>${mensaje}</p></div>`;
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function configurarPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      Estado.deferredPromptPWA = e;
      const btnPWA = document.getElementById('btn-instalar-pwa');
      if (btnPWA) {
        btnPWA.style.display = 'block';
        btnPWA.addEventListener('click', () => {
          btnPWA.style.display = 'none';
          Estado.deferredPromptPWA.prompt();
        });
      }
    });
  }

  // Métodos expuestos globalmente para eventos en HTML si fueran necesarios
  window.compartirNativo = function () {
    if (navigator.share) {
      navigator.share({
        title: document.getElementById('modal-nombre')?.innerText || 'Pstore',
        text: '¡Mira este producto en Pstore!',
        url: window.location.href
      }).catch(() => {});
    } else {
      window.copiarEnlaceProducto();
    }
  };

  window.copiarEnlaceProducto = function () {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('¡Enlace del producto copiado al portapapeles!');
    });
  };

})();
