/* ==========================================================================
   PSTORE — COMUNICACIÓN CON BASE DE DATOS CSV (js/api.js)
   ========================================================================== */

import { CONFIG } from './config.js';
import { Estado } from './estado.js';

export function cargarProductosCSV() {
  return new Promise((resolve, reject) => {
    if (typeof Papa === 'undefined') {
      console.error('PapaParse no está cargado.');
      reject('Biblioteca PapaParse no disponible');
      return;
    }

    Papa.parse(CONFIG.SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          Estado.productos = normalizarProductos(results.data);
          Estado.productosFiltrados = [...Estado.productos];
          resolve(Estado.productos);
        } else {
          reject('No se encontraron registros de productos.');
        }
      },
      error: (err) => {
        reject(err);
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
