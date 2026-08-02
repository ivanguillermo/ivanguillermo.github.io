document.addEventListener("DOMContentLoaded", () => {
  let todosLosProductos = [];

  // 1. Cargar el CSV con PapaParse
  Papa.parse("pstore.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (results.errors && results.errors.length > 0) {
        console.warn("Advertencias al leer el CSV:", results.errors);
      }
      
      // Filtrar filas inválidas que no tengan los campos clave
      todosLosProductos = results.data.filter(
        (p) => p.nombre && p.categoria && p.precio
      );

      poblarCategorias(todosLosProductos);
      renderizarCatalogo(todosLosProductos);
    },
    error: function (err) {
      console.error("Error al cargar el archivo CSV:", err);
      const contenedor = document.getElementById("catalogo");
      if (contenedor) {
        contenedor.innerHTML =
          "<p style='color:red;'>Error al cargar el catálogo de productos. Asegúrate de ejecutar la página en un servidor local (Live Server).</p>";
      }
    }
  });

  // 2. Extraer categorías únicas para el <select> y el Footer
  function poblarCategorias(productos) {
    const select = document.getElementById("select-categoria");
    const footerUl = document.getElementById("footer-categorias");

    if (!select || !footerUl) return;

    // Obtener categorías únicas limpiando espacios
    const categorias = [
      ...new Set(productos.map((p) => (p.categoria ? p.categoria.trim() : "")))
    ].filter(Boolean);

    categorias.forEach((cat) => {
      // Llenar <select> del Header
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);

      // Llenar Lista del Footer
      const li = document.createElement("li");
      li.innerHTML = `<a data-cat="${cat}">${cat}</a>`;
      footerUl.appendChild(li);
    });

    // Escuchar el cambio en el selector del Header
    select.addEventListener("change", (e) => {
      filtrarPorCategoria(e.target.value);
    });

    // Escuchar clics en los enlaces de Búsqueda Rápida del Footer
    footerUl.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        const cat = e.target.getAttribute("data-cat");
        select.value = cat;
        filtrarPorCategoria(cat);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // 3. Filtrar catálogo según la selección
  function filtrarPorCategoria(categoriaSeleccionada) {
    if (categoriaSeleccionada === "todas") {
      renderizarCatalogo(todosLosProductos);
    } else {
      const filtrados = todosLosProductos.filter(
        (p) => p.categoria && p.categoria.trim() === categoriaSeleccionada
      );
      renderizarCatalogo(filtrados);
    }
  }

  // 4. Renderizar tarjetas en el DOM
  function renderizarCatalogo(productos) {
    const contenedor = document.getElementById("catalogo");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (productos.length === 0) {
      contenedor.innerHTML =
        "<p>No hay productos disponibles en esta categoría.</p>";
      return;
    }

    productos.forEach((prod) => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta";

      const precioNum = parseFloat(prod.precio);
      const precioFormateado = isNaN(precioNum)
        ? prod.precio
        : precioNum.toFixed(2);

      tarjeta.innerHTML = `
        <img src="${prod.imagen || 'assets/placeholder.jpg'}" alt="${prod.nombre}">
        <div class="contenido">
          <span class="categoria">${prod.categoria || ''}</span>
          <h2 class="nombre">${prod.nombre || ''}</h2>
          <p class="descripcion">${prod.descripcion || ''}</p>
          <span class="precio">$${precioFormateado}</span>
        </div>
      `;
      contenedor.appendChild(tarjeta);
    });
  }
});

