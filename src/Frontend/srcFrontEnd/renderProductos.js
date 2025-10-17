export function renderProductos(dataJSON) {
    const tbody = document.querySelector("#ContainerProductos tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    dataJSON.productos.forEach(prod => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${prod.codigo}</td>
        <td>${prod.nombre}</td>
        <td>${prod.descripcion}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="verProducto('${prod.codigo}')">Ver</button>
          <button class="btn-rojo" onclick="eliminarProducto('${prod.codigo}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
  }
