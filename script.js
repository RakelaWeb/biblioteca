// BOTÓN GUARDAR
document.getElementById("botonGuardar").addEventListener("click", (event) => {
  event.preventDefault();

  const titulo = document.getElementById("tituloLibro").value.trim();
  const autor = document.getElementById("autorLibro").value.trim();
  const fecha = document.getElementById("fechaLibro").value.trim();
  const genero = document.getElementById("generoLibro").value.trim();
  const portada = document.getElementById("portadaLibro").value.trim();

  limpiarErrores();

  let valid = true;

  if (!titulo) {
    document.getElementById("errorTitulo").textContent = "Debe ingresar el título del libro.";
    valid = false;
  }

  if (!autor) {
    document.getElementById("errorAutor").textContent = "Debe ingresar el nombre del autor.";
    valid = false;
  }

  if (fecha <= 0) {
    document.getElementById("errorFecha").textContent = "Ingrese una fecha válida.";
    valid = false;
  }

  if (!genero) {
    document.getElementById("errorGenero").textContent = "Debe ingresar el género del libro.";
    valid = false;
  }

  if (!validarPortada(portada)) {
    document.getElementById("errorPortada").textContent = "Debe ingresar una URL de imagen válida.";
    valid = false;
  }

  if (valid) {
    const libro = { titulo, autor, fecha, genero, portada };
    let libros = JSON.parse(localStorage.getItem("libros")) || [];

    if (typeof window.libroEditandoIndex !== "undefined") {
      libros[window.libroEditandoIndex] = libro;
      window.libroEditandoIndex = undefined;
    } else {
      libros.push(libro);
    }

    localStorage.setItem("libros", JSON.stringify(libros));
     document.getElementById("botonGuardar").textContent="Guardar"
    alert("¡Libro guardado correctamente!");
    document.querySelector(".formulario").reset();
  }
});

function limpiarErrores() {
  document.getElementById("errorTitulo").textContent = "";
  document.getElementById("errorAutor").textContent = "";
  document.getElementById("errorFecha").textContent = "";
  document.getElementById("errorGenero").textContent = "";
  document.getElementById("errorPortada").textContent = "";
}

function validarPortada(url) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(url);
}

// BOTÓN VER LISTADO
document.getElementById("verListado").addEventListener("click", (e) => {
  e.preventDefault();

  const contenedor = document.getElementById("containerListado");
  const contenedorDestacado = document.getElementById("containerDestacado").style.display="none";
  contenedor.innerHTML = ""; // Limpiar tarjetas anteriores

  const template = document.getElementById("item_libro");
  const libros = JSON.parse(localStorage.getItem("libros")) || [];

  libros.forEach((libro, index) => {
    const clon = document.importNode(template.content, true);
    clon.querySelector("#nombre_libro").textContent = libro.titulo;
    clon.querySelector("#autor_libro").textContent = libro.autor;
    clon.querySelector("#fecha_libro").textContent = libro.fecha;
    clon.querySelector("#genero_libro").textContent = libro.genero;
    clon.querySelector("img").src = libro.portada;

    // Etiquetar con índice para edición
    clon.querySelector("#editar_libro").setAttribute("data-index", index);
    clon.querySelector("#eliminar_libro").setAttribute("data-index", index);

    contenedor.appendChild(clon);


  });
});

// ESCUCHAR CLIC EN EDITAR / ELIMINAR
document.getElementById("containerListado").addEventListener("click", (e) => {
  if (e.target.id === "editar_libro") {
    const index = e.target.getAttribute("data-index");
    document.getElementById("botonGuardar").style.backgroundColor="rgb(150, 75, 6); "
    document.getElementById("botonGuardar").textContent="Guardar cambios"
    actualizarDatos(index);
  }

  if (e.target.id === "eliminar_libro") {
    const index = e.target.getAttribute("data-index");
    eliminarLibro(index);
  }
});

// FUNCION ACTUALIZAR DATOS
function actualizarDatos(index) {
  const libros = JSON.parse(localStorage.getItem("libros")) || [];
  const libro = libros[index];

  document.getElementById("tituloLibro").value = libro.titulo;
  document.getElementById("autorLibro").value = libro.autor;
  document.getElementById("fechaLibro").value = libro.fecha;
  document.getElementById("generoLibro").value = libro.genero;
  document.getElementById("portadaLibro").value = libro.portada;

  window.libroEditandoIndex = index;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminarLibro(index) {
  const libros = JSON.parse(localStorage.getItem("libros")) || [];
  libros.splice(index, 1);
  localStorage.setItem("libros", JSON.stringify(libros));
  document.getElementById("verListado").click(); // Recargar vista
}


//BUSCAR LIBRO EN OVERLAY POR FILTRADO

function normalizar(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

document.getElementById("botonAbrirBuscar").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".overlay").style.display = "flex";
  document.querySelector("header").style.zIndex = "0";
});


document.getElementById("botonBuscar").addEventListener("click", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("tituloLibroBuscar").value.trim().toLowerCase();
  const autor = document.getElementById("autorLibroBuscar").value.trim().toLowerCase();
  const fecha = document.getElementById("fechaLibroBuscar").value.trim();
  const genero = document.getElementById("generoLibroBuscar").value.trim().toLowerCase();

  const libros = JSON.parse(localStorage.getItem("libros")) || [];

  const resultados = libros.filter(libro => {
    return (
      (!titulo || normalizar(libro.titulo.toLowerCase()).includes(normalizar(titulo))) &&
      (!autor || normalizar(libro.autor.toLowerCase()).includes(normalizar(autor))) &&
      (!fecha || libro.fecha.includes(fecha)) &&
      (!genero || normalizar(libro.genero.toLowerCase()).includes(normalizar(genero)))
    );
  });

  const contenedor = document.getElementById("containerDestacado");
  contenedor.innerHTML = "";
  document.querySelector(".overlay").style.display = "none";
  document.querySelector("header").style.zIndex = "1";

  if (resultados.length > 0) {
    const template = document.getElementById("item_libro");
    resultados.forEach(libro => {
      const clon = document.importNode(template.content, true);
      const tarjeta = clon.querySelector(".card-libro");
      tarjeta.classList.add("card-destacada");
      clon.querySelector("#nombre_libro").textContent = libro.titulo;
      clon.querySelector("#autor_libro").textContent = libro.autor;
      clon.querySelector("#fecha_libro").textContent = libro.fecha;
      clon.querySelector("#genero_libro").textContent = libro.genero;
      clon.querySelector("img").src = libro.portada;
      contenedor.appendChild(clon);
    });
  } else {
    contenedor.innerHTML = "<p style='padding:20px'>No se encontró ningún libro con esos datos.</p>";
  }
});
 // CERRAR OVERLAY
document.getElementById("cerrarOverlay").addEventListener("click", () => {
  document.querySelector(".overlay").style.display = "none";
  document.querySelector("header").style.zIndex = "1";
  
  // Opcional: limpiar campos del formulario de búsqueda
  document.getElementById("tituloLibroBuscar").value = "";
  document.getElementById("autorLibroBuscar").value = "";
  document.getElementById("fechaLibroBuscar").value = "";
  document.getElementById("generoLibroBuscar").value = "";
  document.getElementById("portadaLibroBuscar").value = "";
});
