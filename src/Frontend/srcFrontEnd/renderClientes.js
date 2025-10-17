export function renderClientes(dataJSON) {
    const tbody = document.querySelector("#ContainerClientes tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    dataJSON.clientes.forEach(cliente => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cliente.cc}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.email}</td>
        <td>${cliente.direccion}</td>
        <td>${cliente.telefono}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="editarCliente('${cliente.cc}')">Editar</button>
          <button class="btn-rojo" onclick="eliminarCliente('${cliente.cc}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
  }