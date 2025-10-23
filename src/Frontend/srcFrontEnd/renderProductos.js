export function renderProductos(dataJSON) {
    const tbody = document.querySelector("#ContainerProductos tbody");
    if (!tbody) return;
    console.log(dataJSON);
    tbody.innerHTML = "";
     if (dataJSON.status !== 200) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td colspan="5">No se encontraron Productos</td>
      `;
      tbody.appendChild(fila);
      return;
    }else{
      dataJSON.productos.forEach(prod => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${prod.id}</td>
        <td>${prod.nombre}</td>
        <td>${prod.precio}</td>
        <td class="options-table">
          <button class="btn-rojo" onclick="eliminarProducto('${prod.id}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });

    }
    
  }
