/* ==========================================================================
   PSTORE — RENDERIZADO DE INTERFAZ Y MODALES (js/ui.js)
   ========================================================================== */

import { CONFIG } from './config.js';
import { Estado } from './estado.js';
import { agregarAlCarrito, toggleWishlist, renderizarModalCarrito } from './carrito.js';

export function calcularPrecioMoneda(montoUSD) {
  if (Estado.monedaActual === 'BS') {
    const totalBs = montoUSD * Estado.tasaBs;
    return `Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${montoUSD.toFixed(2)}`;
}

export function actualizarBadgesHeader() {
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

export function renderizarCatalogo() {
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
        <h3 class="nombre">${prod.nombre}</h3>
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

    tarjeta.querySelector('.imagen-container img').addEventListener('click', () => abrirModalDetalle(prod.id));
    tarjeta.querySelector('.nombre').addEventListener('click', () => abrirModalDetalle(prod.id));
    
    tarjeta.querySelector('.btn-agregar-tarjeta').addEventListener('click', (e) => {
      e.stopPropagation();
      agregarAlCarrito(prod.id);
    });

    tarjeta.querySelector('.btn-fav').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(prod.id);
      renderizarCatalogo();
    });

    catalogo.appendChild(tarjeta);
  });

  renderizarPaginacion(Estado.productosFiltrados.length);
}

export function renderizarPaginacion(totalItems) {
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

export function abrirModalDetalle(id) {
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

  const btnAgregar = document.getElementById('btn-agregar-carrito');
  if (btnAgregar) {
    btnAgregar.onclick = () => {
      agregarAlCarrito(prod.id);
      cerrarModal('modal-producto');
    };
  }

  abrirModal('modal-producto');
}

export function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    if (id === 'modal-carrito') renderizarModalCarrito();
    modal.classList.add('activo');
  }
}

export function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('activo');
}
