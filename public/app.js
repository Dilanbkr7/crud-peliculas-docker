async function cargarPeliculas() {
  const res = await fetch("/api/peliculas");
  const data = await res.json();

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  data.forEach(p => {
    lista.innerHTML += `
      <div class="card">
        <h3>${p.titulo}</h3>
        <p>${p.director}</p>
        <p>${p.anio} - ${p.genero}</p>
        <button onclick="eliminar(${p.id})">Eliminar</button>
      </div>
    `;
  });
}

async function crearPelicula() {
  const data = {
    titulo: titulo.value,
    director: director.value,
    anio: anio.value,
    genero: genero.value
  };

  await fetch("/api/peliculas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  cargarPeliculas();
}

async function eliminar(id) {
  await fetch("/api/peliculas/" + id, {
    method: "DELETE"
  });

  cargarPeliculas();
}

cargarPeliculas();