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
          <button class="btn-azul" onclick="editarCliente('${cliente.id_cliente}')"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M504-264Zm-312 72v-96q0-23 12.5-43.5T239-366q55-32 116.36-49T480-432q37.68 0 74.34 6Q591-420 626-409l-58 58q-22-5-43.62-7-21.62-2-44.38-2-55 0-107 14t-98 42q-5 4-8 7.72-3 3.73-3 8.28v24h240v72H192Zm384 48v-113l210-209q7.26-7.41 16.13-10.71Q811-480 819.76-480q9.55 0 18.31 3.5Q846.83-473 854-466l44 45q6.59 7.26 10.29 16.13Q912-396 912-387.24t-3.29 17.92q-3.3 9.15-10.71 16.32L689-144H576Zm288-243-45-45 45 45ZM624-192h45l115-115-22-23-22-22-116 115v45Zm138-138-22-22 44 45-22-23ZM480-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42Zm.21-72Q510-552 531-573.21t21-51Q552-654 530.79-675t-51-21Q450-696 429-674.79t-21 51Q408-594 429.21-573t51 21Zm-.21-72Z"/></svg></button>
          <button class="btn-rojo" onclick="eliminarCliente('${cliente.id_cliente}')"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg></button>
        </td>`;
      tbody.appendChild(fila);
    });

    }
    
  }