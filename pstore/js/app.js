/* ==========================================================================
   PSTORE — ENTRY POINT Y CONTROLADOR PRINCIPAL (js/app.js)
   ========================================================================== */

import { CONFIG } from './config.js';
import { Estado, guardarEstadoStorage, resetearFiltrosEstado } from './estado.js';
import { cargarProductosCSV } from './api.js';
import { 
  renderizarCatalogo, 
  actualizarBadgesHeader, 
  abrirModal, 
  cerrarModal, 
  abrirModalDetalle 
} from './ui.js';
import { procesarPedidoWhatsApp } from './carrito.js';

document.addEventListener('DOMContentLoaded', async () => {
  configurarEventListeners();
  actualizarBadgesHeader();

  try {
    await cargarProductosCSV();
    poblarFiltrosEstaticosDinamicos();
    renderizarCatalogo();
    procesarParametrosURL();
  } catch (error) {
    console.error('Error al inicializar la app:', error);
  }

  configurarPWA();
});

function configurarEventListeners() {
  // Búsqueda
  const inputBusqueda = document.getElementById('input-busqueda');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', debounce((e) => {
      Estado.filtros.busqueda = e.target.value.toLowerCase().trim();
      ejecutarFiltrado();
    }, 250));
  }

  // Modales y Carrito
  document.getElementById('btn-carrito')?.addEventListener('click', () => abrirModal('modal-carrito'));
  document.getElementById('cerrar-carrito')?.addEventListener('click', () => cerrarModal('modal-carrito'));
  document.getElementById('cerrar-modal')?.addEventListener('click', () => cerrarModal('modal-producto'));
  document.getElementById('btn-enviar-whatsapp')?.addEventListener('click', procesarPedidoWhatsApp);

  // Moneda
  document.getElementById('btn-toggle-moneda')?.addEventListener('click', () => {
    Estado.monedaActual = Estado.monedaActual === 'USD' ? 'BS' : 'USD';
    guardarEstadoStorage();
    renderizarCatalogo();
  });
}

function poblarFiltrosEstaticosDinamicos() {
  const categorias = [...new Set(Estado.productos.map(p => p.categoria))].filter(Boolean);
  const selectCat = document.getElementById('select-categoria');
  if (selectCat) {
    selectCat.innerHTML = '<option value="todas">Todas las categorías</option>' + 
      categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    selectCat.addEventListener('change', (e) => {
      Estado.filtros.categoria = e.target.value;
      ejecutarFiltrado();
    });
  }
}

function ejecutarFiltrado() {
  Estado.productosFiltrados = Estado.productos.filter(p => {
    const matchBusqueda = !Estado.filtros.busqueda || 
      p.nombre.toLowerCase().includes(Estado.filtros.busqueda) || 
      p.id.toLowerCase().includes(Estado.filtros.busqueda);
    const matchCatSelect = Estado.filtros.categoria === 'todas' || p.categoria === Estado.filtros.categoria;

    return matchBusqueda && matchCatSelect;
  });

  Estado.paginaActual = 1;
  renderizarCatalogo();
}

function procesarParametrosURL() {
  const params = new URLSearchParams(window.location.search);
  const prodId = params.get('prod');
  if (prodId) {
    abrirModalDetalle(prodId);
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
  });
}
