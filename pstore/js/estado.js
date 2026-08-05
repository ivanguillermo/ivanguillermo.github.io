/* ==========================================================================
   PSTORE — ESTADO GLOBAL DE LA APLICACIÓN (js/estado.js)
   ========================================================================== */

import { CONFIG } from './config.js';

export const Estado = {
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

export function guardarEstadoStorage() {
  localStorage.setItem(CONFIG.STORAGE_KEYS.CARRITO, JSON.stringify(Estado.carrito));
  localStorage.setItem(CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(Estado.wishlist));
  localStorage.setItem(CONFIG.STORAGE_KEYS.MONEDA, Estado.monedaActual);
  if (Estado.clienteVIP) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CLIENTE_VIP, JSON.stringify(Estado.clienteVIP));
  }
}

export function resetearFiltrosEstado() {
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
  Estado.productosFiltrados = [...Estado.productos];
  Estado.paginaActual = 1;
}
