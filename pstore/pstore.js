document.addEventListener("DOMContentLoaded", () => {
  let todosLosProductos = [];

  // Elementos del Modal
  const modal = document.getElementById("modal-producto");
  const cerrarModalBtn = document.getElementById("cerrar-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCategoria = document.getElementById("modal-categoria");
  const modalNombre = document.getElementById("modal-nombre");
  const modalDescripcion = document.getElementById("modal-descripcion");
  const modalPrecio = document.getElementById("modal-precio");

  // 1. Cargar el CSV con PapaParse
  Papa.parse("pstore.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (results.errors && results.errors.length > 0) {
        console.warn("Advertencias al leer el CSV:", results.errors);
      }
      
      todosLosProductos = results.data.filter(
        (p) => p.nombre && p.categoria && p.precio
      );

      poblarCategorias(todosLosProductos);
      renderizarCatalogo(todosLosProductos);
      configurarEventosModal();
    },
    error: function (err) {
      console.error("Error al cargar el archivo CSV:", err);
    }
  });

  // 2. Extraer categorías únicas para el <select> y el Footer
  function poblarCategorias(productos) {
    const select = document.getElementById("select-categoria");
    const footerUl = document.getElementById("footer-categorias");

    if (!select || !footerUl) return;

    const categorias = [
      ...new Set(productos.map((p) => (p.categoria ? p.categoria.trim() : "")))
    ].filter(Boolean);

    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);

      const li = document.createElement("li");
      li.innerHTML = `<a data-cat="${cat}">${cat}</a>`;
      footerUl.appendChild(li);
    });

    select.addEventListener("change", (e) => {
      filtrarPorCategoria(e.target.value);
    });

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

    productos.forEach((prod, index) => {
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

      // Evento de clic para abrir el modal con este producto
      tarjeta.addEventListener("click", () => {
        abrirModal(prod);
      });

      contenedor.appendChild(tarjeta);
    });
  }

  // 5. Funciones del Modal
  function abrirModal(producto) {
    if (!modal) return;

    const precioNum = parseFloat(producto.precio);
    const precioFormateado = isNaN(precioNum)
      ? producto.precio
      : precioNum.toFixed(2);

    modalImg.src = producto.imagen || "assets/placeholder.jpg";
    modalImg.alt = producto.nombre || "Producto";
    modalCategoria.textContent = producto.categoria || "";
    modalNombre.textContent = producto.nombre || "";
    modalDescripcion.textContent = producto.descripcion || "";
    modalPrecio.textContent = `$${precioFormateado}`;

    modal.classList.add("activo");
  }

  function cerrarModal() {
    if (modal) {
      modal.classList.remove("activo");
    }
  }

  function configurarEventosModal() {
    // Cerrar con el botón X
    if (cerrarModalBtn) {
      cerrarModalBtn.addEventListener("click", cerrarModal);
    }

    // Cerrar haciendo clic en el fondo oscuro
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          cerrarModal();
        }
      });
    }

    // Cerrar presionando la tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("activo")) {
        cerrarModal();
      }
    });
  }
});

