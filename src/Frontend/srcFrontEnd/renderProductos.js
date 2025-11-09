export function renderProductos(dataJSON) {
    const tbody = document.querySelector("#ContainerProductos tbody");
    if (!tbody) return;
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
        <td><p>Codigo: </p>${prod.id}</td>
        <td><p>Nombre: </p>${prod.nombre}</td>
        <td><p>Precio: </p>${prod.precio}</td>
        <td class="options-table">
          <button class="btn-rojo" onclick="eliminarProducto('${prod.id}')"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg></button>
        </td>`;
      tbody.appendChild(fila);
    });

    }
    
  }
