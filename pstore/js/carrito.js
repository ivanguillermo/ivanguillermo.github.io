/* ==========================================================================
   PSTORE — LÓGICA DE CARRITO, WISHLIST Y PEDIDOS (js/carrito.js)
   ========================================================================== */

import { CONFIG } from './config.js';
import { Estado, guardarEstadoStorage } from './estado.js';
import { actualizarBadgesHeader, calcularPrecioMoneda, abrirModal, cerrarModal } from './ui.js';

export function agregarAlCarrito(id) {
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

export function cambiarCantidadCarrito(id, delta) {
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

export function toggleWishlist(id) {
  if (Estado.wishlist.includes(id)) {
    Estado.wishlist = Estado.wishlist.filter(item => item !== id);
  } else {
    Estado.wishlist.push(id);
  }
  guardarEstadoStorage();
  actualizarBadgesHeader();
}

export function renderizarModalCarrito() {
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

  if (Estado.clienteVIP) {
    const descuento = totalUSD * (CONFIG.DESCUENTO_VIP_PORCENTAJE / 100);
    totalUSD -= descuento;
  }

  totalMonto.innerText = calcularPrecioMoneda(totalUSD);
}

export function procesarPedidoWhatsApp() {
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
