export function renderFacturas(dataJSON) {
  console.log(dataJSON)
    const tbody = document.querySelector("#ContainerFacturas tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (dataJSON.status !== 200) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td colspan="5">No se encontraron facturas</td>
      `;
      tbody.appendChild(fila);
      return;
    }else{
      dataJSON.facturas.forEach(fact => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><p>Codigo: </p>${fact.factura_id}</td>
        <td><p>Cedula: </p>${fact.cliente_cedula}</td>
        <td><p>CLiente: </p>${fact.cliente}</td>
        <td><p>Fecha: </p>${fact.fecha}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="verFactura('${fact.factura_id}')">Ver</button>
          <button class="btn-rojo" onclick="eliminarFactura('${fact.factura_id}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
    }

    
  }