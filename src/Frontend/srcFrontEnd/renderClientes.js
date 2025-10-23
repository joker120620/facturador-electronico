export function renderClientes(dataJSON) {
    const tbody = document.querySelector("#ContainerClientes tbody");
    console.log(dataJSON)
    if (!tbody) return;
    tbody.innerHTML = "";
     if (dataJSON.status !== 200) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td colspan="5">No se encontraron Clientes</td>
      `;
      tbody.appendChild(fila);
      return;
    }else{
      dataJSON.clientes.forEach(cliente => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cliente.cedula}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.correo}</td>
        <td>${cliente.direccion}</td>
        <td>${cliente.telefono}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="editarCliente('${cliente.id}')">Editar</button>
          <button class="btn-rojo" onclick="eliminarCliente('${cliente.id}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });

    }
    
  }