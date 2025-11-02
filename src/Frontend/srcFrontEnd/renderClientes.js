export function renderClientes(dataJSON) {
    const tbody = document.querySelector("#ContainerClientes tbody");
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
        <td><p>Cedula: </p>${cliente.cedula_cliente}</td>
        <td><p>Nombre: </p>${cliente.nombre_cliente}</td>
        <td><p>Correo: </p>${cliente.correo_cliente}</td>
        <td><p>Direccion: </p>${cliente.direccion_cliente}</td>
        <td><p>Telefono: </p>${cliente.telefono_cliente}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="editarCliente('${cliente.id_cliente}')">Editar</button>
          <button class="btn-rojo" onclick="eliminarCliente('${cliente.id_cliente}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });

    }
    
  }