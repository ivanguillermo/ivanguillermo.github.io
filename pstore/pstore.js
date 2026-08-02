
    let todosLosProductos = [];

    // 1. Cargar el CSV
    Papa.parse("pstore.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        todosLosProductos = results.data;
        poblarCategorias(todosLosProductos);
        renderizarCatalogo(todosLosProductos);
      }
    });

    // 2. Extraer categorías únicas para el <select> y el Footer
    function poblarCategorias(productos) {
      const select = document.getElementById("select-categoria");
      const footerUl = document.getElementById("footer-categorias");
      
      const categorias = [...new Set(productos.map(p => p.categoria.trim()))];

      categorias.forEach(cat => {
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
          select.value = cat; // Sincronizar el <select>
          filtrarPorCategoria(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir al catálogo
        }
      });
    }

    // 3. Filtrar catálogo según la selección
    function filtrarPorCategoria(categoriaSeleccionada) {
      if (categoriaSeleccionada === "todas") {
        renderizarCatalogo(todosLosProductos);
      } else {
        const filtrados = todosLosProductos.filter(
          p => p.categoria.trim() === categoriaSeleccionada
        );
        renderizarCatalogo(filtrados);
      }
    }

    // 4. Renderizar tarjetas
    function renderizarCatalogo(productos) {
      const contenedor = document.getElementById("catalogo");
      contenedor.innerHTML = "";

      if (productos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
        return;
      }

      productos.forEach(prod => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";
        tarjeta.innerHTML = `
          <img src="${prod.imagen}" alt="${prod.nombre}">
          <div class="contenido">
            <span class="categoria">${prod.categoria}</span>
            <h2 class="nombre">${prod.nombre}</h2>
            <p class="descripcion">${prod.descripcion}</p>
            <span class="precio">$${parseFloat(prod.precio).toFixed(2)}</span>
          </div>
        `;
        contenedor.appendChild(tarjeta);
      });
    }

