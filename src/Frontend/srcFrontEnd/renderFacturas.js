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
        <td>${fact.codigo}</td>
        <td>${fact.cc}</td>
        <td>${fact.cliente}</td>
        <td>${fact.fecha}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="verFactura('${fact.codigo}')">Ver</button>
          <button class="btn-rojo" onclick="eliminarFactura('${fact.codigo}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
    }

    
  }