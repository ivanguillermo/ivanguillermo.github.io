// ==========================================
// CONFIGURACIÓN BASE LOCAL Y DE RESPALDO
// ==========================================

const CONFIG_PSTORE = {
  // 1. Identidad y Contacto de la Tienda
  nombreTienda: "Pstore",
  urlLogo: "assets/pstore.jpg",
  numeroWhatsapp: "+584126216661",
  mensajeBienvenida: "¡Bienvenidos a Pstore!",
  urlPdfCatalogo: "https://drive.google.com/file/d/1UbvpO9gN32uocysk-97mQ3RFlLUp-R9q/view?usp=sharing",
  tasaBcvRespaldo: 0, 
  
  // Redes Sociales (Opcionales)
  linkInstagram: "https://www.instagram.com/pstorevzla",
  linkFacebook: "https://www.facebook.com/people/Pstore-Variedades/100069365366035/",

  // 2. Moneda Alternativa
  // Importante: No colocamos tasa por defecto (null) para no mostrar valores desactualizados.
  simboloMonedaAlt: "Bs.",

  // 3. Enlace de publicación CSV de tu pestaña 'Configuracion' en Google Sheets
  urlSheetConfig: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_D4Cym7p0ATsh5UCG2Q3kbvhy5WuMPx0Q8gCfdz_l9IDoaCb4jn1T8zQ9YKCCvt-0GA0vkDrwKXX2/pub?gid=1458625703&single=true&output=csv",

  // 4. Estilos CSS por defecto (Variables :root)
  estilosCSS: {
    "--brand-black": "#111111",
    "--brand-gold": "#d4af37",
    "--bg-main": "#0d0d0d",
    "--bg-card": "#1e1e1e",
    "--text-primary": "#ffffff",
    "--text-secondary": "#a0a0a0",
    "--border-color": "#333333"
  }
};
