/* ==========================================================================
   PSTORE — CONFIGURACIÓN GLOBAL Y CONSTANTES (js/config.js)
   ========================================================================== */

const CONFIG = {
  // Configuración de Google Sheets (CSV)
  SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR_EXAMPLE_KEY/pub?output=csv',
  
  // Datos de Contacto y Tienda
  TIENDA_NOMBRE: 'Pstore',
  WHATSAPP_PHONE: '584126216661',
  INSTAGRAM_USER: 'pstorevzla',
  CATALOGO_PDF_URL: 'https://drive.google.com/file/d/1-nmOf4b58Y3ioW4Cnym-uev9I5j8h72C/view',

  // Configuración Financiera y Monedas
  MONEDA_BASE: 'USD',
  MONEDA_SECUNDARIA: 'BS',
  TASA_CAMBIO_BS: 36.5, // Valor por defecto / fallback
  API_TASA_URL: 'https://p2p.binance.com/bapi/fiat/v1/public/bnc/welcome-p2p/search', // O endpoint de tasa personalizada

  // Paginación y Renderizado
  ITEMS_POR_PAGINA: 12,
  OPCIONES_COLUMNAS: ['grid-auto', 'grid-1', 'grid-2', 'grid-4'],

  // Clientes VIP / Promociones
  CODIGOS_VIP: ['VIP2026', 'PSTOREVIP', 'CLIENTEESTRELLA'],
  DESCUENTO_VIP_PORCENTAJE: 10,

  // Ciudades y Métodos de Envío
  ZONAS_COBERTURA: [
    { id: 'bqto', nombre: 'Barquisimeto', costoEnvio: 0 },
    { id: 'cbd', nombre: 'Cabudare', costoEnvio: 0 },
    { id: 'acg', nombre: 'Acarigua', costoEnvio: 0 },
    { id: 'yar', nombre: 'Yaracuy (San Felipe / Guama / Chivacoa)', costoEnvio: 0 },
    { id: 'nac', nombre: 'Envío Nacional (MRW / Zoom / Tealca)', costoEnvio: 0 }
  ],

  METODOS_PAGO: [
    'Pago Móvil',
    'Efectivo ($ / €)',
    'Zelle',
    'Binance Pay (USDT)'
  ],

  // Cache y Almacenamiento Local
  STORAGE_KEYS: {
    CARRITO: 'pstore_carrito_v2',
    WISHLIST: 'pstore_wishlist_v2',
    MONEDA: 'pstore_moneda_pref',
    CLIENTE_VIP: 'pstore_cliente_vip'
  }
};
