export function renderFacturas(dataJSON) {
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
          <button class="btn-verde" onclick="downloadFile('${fact.factura_id}')"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M480-315.33 284.67-510.67l47.33-48L446.67-444v-356h66.66v356L628-558.67l47.33 48L480-315.33ZM226.67-160q-27 0-46.84-19.83Q160-199.67 160-226.67V-362h66.67v135.33h506.66V-362H800v135.33q0 27-19.83 46.84Q760.33-160 733.33-160H226.67Z"/></svg></button>
          <button class="btn-rojo" onclick="eliminarFactura('${fact.factura_id}')"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z"/></svg></button>
        </td>`;
      tbody.appendChild(fila);
    });
    }

    
  }