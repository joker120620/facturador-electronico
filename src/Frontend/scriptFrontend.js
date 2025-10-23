// ===================================================================
//==========================IMPORTAR ARCHIVOS================
import { fetchData , fetchDataWithToken } from "../peticionServer.js";
import { renderUserApp } from "./srcFrontEnd/renderUserApp.js";
import { renderProductos } from "./srcFrontEnd/renderProductos.js";
import { renderFacturas } from "./srcFrontEnd/renderFacturas.js";
import { renderClientes } from "./srcFrontEnd/renderClientes.js";
//================================================================
const HOST_API = "http://localhost:3000";
document.addEventListener("DOMContentLoaded", async () => {
//////=====================
  const session = sessionStorage.getItem("sessionUser");
  // ====================== PEDIR DATOS Clientes  ======================
  const pedirDatosClientes = async () => {
    const session = await JSON.parse(sessionStorage.getItem("sessionUser"));
    const usuarioId = await session.data.id;
    const dataClientes = await fetchDataWithToken(`${HOST_API}/getClient`, { usuario_id: usuarioId });
    return dataClientes

  }

  // ====================== PEDIR DATOS PRODUCTOS  ======================
  const pedirDatosProductos = async () => {
    const session = JSON.parse(sessionStorage.getItem("sessionUser"));
    const usuarioId = session.data.id;
    const dataClientes = await fetchDataWithToken(`${HOST_API}/getProduct`, { usuario_id: usuarioId });
    return dataClientes

  }
  //====================== PEDIR DATOS FACTURAS ======================
  const pedirDatosFacturas = async () => {
    const session = JSON.parse(sessionStorage.getItem("sessionUser"));
    const usuarioId = session.data.id;
    const dataFacturas = await fetchDataWithToken(`${HOST_API}/getFacturas`, { usuario_id: usuarioId });
    return dataFacturas
  }
  let dataJSON = {};
  // ====================== FUNCIONES AUXILIARES ======================
  function capturarItem(id) { return document.getElementById(id); }
  /// ===================== CAMBIAR ESTADO DEL BOT=========================
  async function changeStatusBot() {
    const divEstadoBot = capturarItem("estadoBot");
    let responseStatus = await fetchData(`${HOST_API}/statusbot`, { entity: "client" });
    if (responseStatus.statusBotServer) {
      divEstadoBot.textContent = "Conectado"
    } else {
      divEstadoBot.textContent = "Desconectado"
    }

    setTimeout(changeStatusBot, 10000); // cada 10 segundos
  }


//==================ACTUALIZAR DATOS DEL SERVIDOR===================
  async function updateDataViwer() {
    let data;
    data = await pedirDatosClientes();// recargar datos al iniciar sesión
    if(data.status == 403){
      mostrarMensaje("Session cerrada");
      mostrarSeccion(ContainerLogin);
    }else{
      renderClientes(data);
      if (!data.clientes) {
        data.clientes = [];
      }
      dataJSON.clientes = data.clientes
    }
    data = await pedirDatosProductos();
    if(data.status == 403){
      mostrarMensaje("Session cerrada");
      mostrarSeccion(ContainerLogin);
    }else{
      renderProductos(data);
      if (!data.productos) {
        data.productos = [];
      }
      dataJSON.productos = data.productos
    }
    data = await pedirDatosFacturas();
    if(data.status == 403){
      mostrarMensaje("Session cerrada");
      mostrarSeccion(ContainerLogin);
    }else{
      renderFacturas(data);
      if(!data.facturas){
        data.facturas = [];
      }
      dataJSON.facturas = data.facturas;
      
    }
    

  }

////btn actualizar de la barra de busqueda


function recharged(){
    const data = JSON.parse(session).data;
    updateDataViwer(data);
    const timeoutId = setTimeout(() => {
       capturarItem("svgBusqueda1").classList.remove("btn-actualizar-girar");
       capturarItem("svgBusqueda2").classList.remove("btn-actualizar-girar");
       capturarItem("svgBusqueda3").classList.remove("btn-actualizar-girar");
       clearTimeout(timeoutId);
    }, 3000);
    }


  const btnActualizarDatos1 = capturarItem("btnActualizarDatosViwer1")
  btnActualizarDatos1.addEventListener('click', () => {
    capturarItem("svgBusqueda1").classList.add("btn-actualizar-girar");
    
    recharged()
  })
  
///====================================================================

  const btnActualizarDatos2 = capturarItem("btnActualizarDatosViwer2")
  btnActualizarDatos2.addEventListener('click', () => {
    capturarItem("svgBusqueda2").classList.add("btn-actualizar-girar");
    
    recharged()
  });

///====================================================================

  const btnActualizarDatos3 = capturarItem("btnActualizarDatosViwer3")
  btnActualizarDatos3.addEventListener('click', () => {
    capturarItem("svgBusqueda3").classList.add("btn-actualizar-girar");
    
    recharged()
  })
///====================================================================



  // ====================== MODALES PERSONALIZADOS ======================
  // Crea y reutiliza dos modales: mensaje y confirm
  // - mostrarMensaje(text) -> muestra texto y cierra en 2.5s o con botón "Cerrar"
  // - mostrarConfirm(text, callback) -> muestra confirm con "Aceptar" / "Cancelar"

  function crearModalesSiNoExisten() {
    // Mensaje
    if (!document.getElementById('modalMensajeCustom')) {
      const htmlMsg = `
        <div class="modal" id="modalMensajeCustom" aria-hidden="true">
          <div class="modal-loading-content" style="min-width:260px; max-width:480px;">
            <p id="modalMensajeCustomTexto" style="white-space:pre-wrap; margin-bottom:12px;"></p>
            <div style="display:flex; justify-content:center;">
              <button id="modalMensajeCustomCerrar" class="btn-azul">Cerrar</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', htmlMsg);
      const cerrar = document.getElementById('modalMensajeCustomCerrar');
      cerrar.addEventListener('click', () => {
        const m = document.getElementById('modalMensajeCustom');
        if (m) m.style.display = 'none';
      });
    }

    // Confirm
    if (!document.getElementById('modalConfirmCustom')) {
      const htmlConfirm = `
        <div class="modal" id="modalConfirmCustom" aria-hidden="true">
          <div class="modal-loading-content" style="min-width:260px; max-width:480px;">
            <p id="modalConfirmCustomTexto" style="white-space:pre-wrap; margin-bottom:12px;"></p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button id="modalConfirmCustomAceptar" class="btn-azul">Aceptar</button>
              <button id="modalConfirmCustomCancelar" class="btn-rojo">Cancelar</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', htmlConfirm);
      // handlers se configuran en mostrarConfirm para que puedan recibir callback dinámico
    }
  }

  crearModalesSiNoExisten();

  // mostrar mensaje con autocierre
  let mensajeTimeoutId = null;
  function mostrarMensaje(texto) {
    crearModalesSiNoExisten();
    const modal = document.getElementById('modalMensajeCustom');
    const textoNode = document.getElementById('modalMensajeCustomTexto');
    if (!modal || !textoNode) return;
    textoNode.textContent = texto;
    modal.style.display = 'flex';

    // limpiar timeout previo si existiera
    if (mensajeTimeoutId) {
      clearTimeout(mensajeTimeoutId);
      mensajeTimeoutId = null;
    }

    // cerrar automáticamente en 2.5s
    mensajeTimeoutId = setTimeout(() => {
      modal.style.display = 'none';
      mensajeTimeoutId = null;
    }, 2500);
  }

  // mostrar confirm con callback (true/false)
  function mostrarConfirm(texto, callback) {
    crearModalesSiNoExisten();
    const modal = document.getElementById('modalConfirmCustom');
    const textoNode = document.getElementById('modalConfirmCustomTexto');
    const btnAceptar = document.getElementById('modalConfirmCustomAceptar');
    const btnCancelar = document.getElementById('modalConfirmCustomCancelar');
    if (!modal || !textoNode || !btnAceptar || !btnCancelar) {
      // fallback a confirm por si algo falla
      const r = window.confirm(texto);
      callback(Boolean(r));
      return;
    }

    textoNode.textContent = texto;
    modal.style.display = 'flex';

    // handlers temporales
    const onAceptar = () => {
      modal.style.display = 'none';
      cleanup();
      callback(true);
    };
    const onCancelar = () => {
      modal.style.display = 'none';
      cleanup();
      callback(false);
    };

    function cleanup() {
      btnAceptar.removeEventListener('click', onAceptar);
      btnCancelar.removeEventListener('click', onCancelar);
    }

    btnAceptar.addEventListener('click', onAceptar);
    btnCancelar.addEventListener('click', onCancelar);
  }

  // ====================== VALIDACIONES ======================
  function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validarNumero(num) { return /^[0-9]+$/.test(num); }

 // ====================== CLIENTES ======================
window.editarCliente = function (id) {
  console.log(dataJSON.clientes)
  // Asegurarse de que el ID sea numérico (por si viene como string)
  const cliente = dataJSON.clientes.find(c => c.id === Number(id));

  if (!cliente) {
    mostrarMensaje("Cliente no encontrado");
    return;
  }

  // Capturar los inputs del formulario
  const el = capturarItem("modal1");
  if (!el) return;

  const ccInput = capturarItem("cc_cliente");
  const nombreInput = capturarItem("nombre_cliente");
  const emailInput = capturarItem("email_cliente");
  const direccionInput = capturarItem("direccion_cliente");
  const telefonoInput = capturarItem("telefono_cliente");

  // Rellenar los campos
  if (ccInput) ccInput.value = cliente.cedula || "";
  if (nombreInput) nombreInput.value = cliente.nombre || "";
  if (emailInput) emailInput.value = cliente.correo || "";
  if (direccionInput) direccionInput.value = cliente.direccion || "";
  if (telefonoInput) telefonoInput.value = cliente.telefono || "";

  // Mostrar modal
  el.classList.add("active");
};
  window.eliminarCliente = function  (cc) {
    mostrarConfirm("¿Deseas eliminar este cliente? " + "\n se eliminaran las facturas asosiadas", async (ok) => {
      if (ok) {
        const response = await fetchDataWithToken(`${HOST_API}/deleteClient`, {
        "id": cc
      });
      if (response) {
        mostrarMensaje(response.mensaje);

      }
      updateDataViwer();

      }
    });
  };

  // Guardar o editar cliente
const btnAgregarCliente = capturarItem("btnAgregarCliente");
if (btnAgregarCliente) {
  btnAgregarCliente.addEventListener("click", async () => {
    const cc = (capturarItem("cc_cliente")?.value || "").trim();
    const nombre = (capturarItem("nombre_cliente")?.value || "").trim();
    const email = (capturarItem("email_cliente")?.value || "").trim();
    const direccion = (capturarItem("direccion_cliente")?.value || "").trim();
    const telefono = (capturarItem("telefono_cliente")?.value || "").trim();

    if (!cc || !nombre || !email || !direccion || !telefono) {
      mostrarMensaje("Por favor completa todos los campos");
      return;
    }
    if (!validarNumero(cc)) { mostrarMensaje("El CC debe ser numérico"); return; }
    if (!validarEmail(email)) { mostrarMensaje("El correo no es válido"); return; }

    // Buscar cliente existente
    const idx = dataJSON.clientes.findIndex(c => c.cedula === cc);

    if (idx >= 0) {
      // Editar existente
      

      const response = await fetchDataWithToken(`${HOST_API}/updateClient`, {
        "id": dataJSON.clientes[idx].id,
        "cedula": cc,
        "nombre": nombre,
        "telefono": telefono,
        "direccion": direccion,
        "correo": email
      });
      
      if (response){
        mostrarMensaje(response.mensaje);
      }
      updateDataViwer()
    } else {
      // Agregar nuevo
      const response = await fetchDataWithToken(`${HOST_API}/addClient`, {
        "cedula": cc,
        "nombre": nombre,
        "telefono": telefono,
        "direccion": direccion,
        "correo": email
      });
      if (response){
        mostrarMensaje(response.mensaje);
      }
      updateDataViwer()
    }


    const modal = capturarItem("modal1");
    if (modal) modal.classList.remove("active");
  });
}
  // ====================== PRODUCTOS =========================
  

  window.eliminarProducto = function (id) {
    mostrarConfirm("¿Eliminar producto?", async (ok) => {
      if  (ok) {
        const response = await fetchDataWithToken(`${HOST_API}/deleteProduct`, {
        "id": id
      });
      if (response) {
        mostrarMensaje(response.mensaje);

      }
      updateDataViwer();
      }
    });
  };

  const btnAgregarProducto = capturarItem("btnAgregarProducto");
  if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener("click", async () => {
      const idProducto = Number((capturarItem("codigo_producto")?.value || "").trim());
      const nombreProducto = (capturarItem("nombre_producto")?.value || "").trim();
      const precioProducto = (capturarItem("precio_producto")?.value || "").trim();
      

      if (!idProducto || !nombreProducto || !precioProducto) {
        mostrarMensaje("Completa todos los campos");
        return;
      }
      if (!validarNumero(idProducto)) { mostrarMensaje("El código debe ser numérico"); return; }
      if (dataJSON.productos.some(p => p.id === idProducto)) {
        mostrarMensaje("Ya existe un producto con ese código");
        return;
      } else {
        // Agregar nuevo
        const session = JSON.parse(sessionStorage.getItem("sessionUser"));
        const response = await fetchDataWithToken(`${HOST_API}/addProduct`, {
          //////////session falta
          "usuario_id": session.data.id,
          "nombre": nombreProducto,
          "precio": precioProducto
        });
      if (response){
        mostrarMensaje(response.mensaje);
      }
      updateDataViwer()
      }

      // Limpiar formulario
      if (capturarItem("codigo_producto")) capturarItem("codigo_producto").value = "";
      if (capturarItem("nombre_producto")) capturarItem("nombre_producto").value = "";
      if (capturarItem("descripcion_producto")) capturarItem("descripcion_producto").value = "";

      const modal = capturarItem("modal3");
      if (modal) modal.classList.remove("active");
    });
  }

  // ====================== FACTURAS ======================
  window.verFactura = function (codigo) {
    const fact = dataJSON.facturas.find(f => f.codigo === codigo);
    if (!fact) {
      mostrarMensaje("Factura no encontrada");
      return;
    }

    const modal = capturarItem("modal2");
    if (!modal) return;
    const inCodigo = capturarItem("codigo_factura");
    const inCC = capturarItem("cc_factura");
    const inNombre = capturarItem("nombre_factura");
    const inFecha = capturarItem("fecha_factura");
    const inDescripcion = capturarItem("descripcion_factura");

    if (inCodigo) inCodigo.value = fact.codigo;
    if (inCC) inCC.value = fact.cc;
    if (inNombre) inNombre.value = fact.cliente;
    if (inFecha) inFecha.value = fact.fecha;
    //ciclo for paramostrar productos que compro
    //hay que iterar por que son varios productos de cada factura
    if (inDescripcion) {
      inDescripcion.value = "";
      for (const item of fact.descripcion) {
        inDescripcion.value += "Producto " + item.producto + "\n " +
          " Cantidad: " + item.cantidad + "\n " +
          " Precio: " + item.precio + "\n " +
          " Total: " + item.total + "\n\n";
      }
    }

    modal.classList.add("active");
  };

  window.eliminarFactura = function (codigo) {
    mostrarConfirm("¿Deseas eliminar la factura?", (ok) => {
      if (ok) {
        dataJSON.facturas = dataJSON.facturas.filter(f => f.codigo !== codigo);
        renderFacturas(dataJSON);
        mostrarMensaje("Factura eliminada correctamente");
      }
    });
  };

  // Enviar facturas (simulado). Buscamos varios posibles IDs por compatibilidad
  const btnEnviar = capturarItem("btnEnviarFacturas") || capturarItem("open-modal2");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      mostrarMensaje("Facturas enviadas correctamente (simulación)");
    });
  }

  // ====================== BUSCADORES ======================
  const btnBuscarCliente = capturarItem("btnBuscarCliente");
  const inputBuscarCliente = capturarItem("buscarCliente")
  if (inputBuscarCliente) {
    inputBuscarCliente.addEventListener("input", () => {
      const texto = (capturarItem("buscarCliente")?.value || "").trim().toLowerCase();
      const tbody = document.querySelector("#ContainerClientes tbody");
      if (!tbody) return;
      const filtrados = dataJSON.clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto) || c.cedula.includes(texto)
      );
      btnBuscarCliente.addEventListener("click", () => {
        console.log(filtrados)
        if (filtrados.length === 0) {
        mostrarMensaje("No se encontraron clientes");
        return;
      }else{
        if(texto !==""){
          mostrarMensaje("Busqueda completada");
        }
        
      }
      })
      if (filtrados.length !== 0) {
        tbody.innerHTML = "";
        filtrados.forEach(c => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
          <td>${c.cedula}</td>
          <td>${c.nombre}</td>
          <td>${c.correo}</td>
          <td>${c.direccion}</td>
          <td>${c.telefono}</td>
          <td class="options-table">
            <button class="btn-azul" onclick="editarCliente('${c.cc}')">Editar</button>
            <button class="btn-rojo" onclick="eliminarCliente('${c.cc}')">Eliminar</button>
          </td>`;
          tbody.appendChild(fila);
        });
        return;
      }

    });
  }

  const btnBuscarProducto = capturarItem("btnBuscarProducto");
  const inputBuscarProducto = capturarItem("buscarProducto")
  if (inputBuscarProducto) {
    inputBuscarProducto.addEventListener("input", () => {
      const texto = (capturarItem("buscarProducto")?.value || "").trim().toLowerCase();
      const tbody = document.querySelector("#ContainerProductos tbody");
      if (!tbody) return;
      const filtrados = dataJSON.productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) || p.codigo.includes(texto)
      );
      btnBuscarProducto.addEventListener("click", () => {
        if (filtrados.length === 0) {
        mostrarMensaje("No se encontraron Productos");
        return;
      }else{
        mostrarMensaje("Busqueda completada");
      }
    });
      if(filtrados.length !== 0){
        tbody.innerHTML = "";
        filtrados.forEach(p => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
          <td>${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.descripcion}</td>
          <td class="options-table">
            <button class="btn-azul" onclick="verProducto('${p.codigo}')">Ver</button>
            <button class="btn-rojo" onclick="eliminarProducto('${p.codigo}')">Eliminar</button>
          </td>`;
          tbody.appendChild(fila);
        });
      }

    });
  }

  const inputBuscarFactura = capturarItem("buscarFactura")
  const btnBuscarFactura = capturarItem("btnBuscarFactura");
  if (inputBuscarFactura) {
    inputBuscarFactura.addEventListener("input", () => {
      console.log(inputBuscarFactura.value)
      const texto = (capturarItem("buscarFactura")?.value || "").trim().toLowerCase();
      const tbody = document.querySelector("#ContainerFacturas tbody");
      if (!tbody) return;
      const filtrados = dataJSON.facturas.filter(f =>
        f.cliente.toLowerCase().includes(texto) || f.codigo.includes(texto)
      );
      btnBuscarFactura.addEventListener("click", () => {
        if (filtrados.length === 0) {
        mostrarMensaje("No se encontraron Facturas");
        return;
      }else{
        mostrarMensaje("Busqueda completada");
      }
    });
      if (filtrados.length !== 0){
        tbody.innerHTML = "";
        filtrados.forEach(f => {
          const fila = document.createElement("tr");
          fila.innerHTML = `
          <td>${f.codigo}</td>
          <td>${f.cc}</td>
          <td>${f.cliente}</td>
          <td>${f.fecha}</td>
          <td class="options-table">
            <button class="btn-azul" onclick="verFactura('${f.codigo}')">Ver</button>
            <button class="btn-rojo" onclick="eliminarFactura('${f.codigo}')">Eliminar</button>
          </td>`;
          tbody.appendChild(fila);
        });
      }

    });
  }

  // ====================== MENÚ NAVEGACIÓN ======================
  const ContainerClientes = capturarItem("ContainerClientes");
  const ContainerFacturas = capturarItem("ContainerFacturas");
  const ContainerProductos = capturarItem("ContainerProductos");
  const ContainerHome = capturarItem("ContainerHome");
  const ContainerAjustes =capturarItem("ContainerAjustes");
  const ContainerLogin = capturarItem("ContainerLogin");
  const ContainerRegister =capturarItem("ContainerRegister");
  const ContainerRecoveryPass = capturarItem("ContainerRecoverPass");
  const btnSalir = capturarItem("btnMenuSalir");
  function ocultarMainBtn (){
    const mainSections = document.querySelectorAll(".menu-section");
      mainSections.forEach(sec => sec.style.display = "none");
  }
  if (btnSalir) {
    btnSalir.addEventListener("click", () => {
      mostrarSeccion(ContainerLogin);
      ocultarMainBtn()
      
    });
  }

  function mostrarSeccion(seccion) {
    [ContainerClientes, ContainerFacturas, ContainerProductos, ContainerHome, ContainerLogin , ContainerAjustes , ContainerRegister , ContainerRecoveryPass].forEach(s =>
      s && s.classList.add("content-section-disabled")
    );
    
    seccion && seccion.classList.remove("content-section-disabled");
    capturarItem("menu-section").style.display = "block"
    
  }

  capturarItem("btnMenuHome")?.addEventListener("click", () => mostrarSeccion(ContainerHome));
  capturarItem("btnMenuClientes")?.addEventListener("click", () => mostrarSeccion(ContainerClientes));
  capturarItem("btnMenuFacturas")?.addEventListener("click", () => mostrarSeccion(ContainerFacturas));
  capturarItem("btnMenuProductos")?.addEventListener("click", () => mostrarSeccion(ContainerProductos));
  capturarItem("btnMenuAjustes")?.addEventListener("click", ()=> mostrarSeccion(ContainerAjustes));
  capturarItem("btnSubMenuRegister")?.addEventListener("click", () => {
    mostrarSeccion(ContainerRegister)
    ocultarMainBtn()
  });
  capturarItem("btnRecuperarPass")?.addEventListener("click", () => {
    mostrarSeccion(ContainerRecoveryPass);
    ocultarMainBtn();
  })
  capturarItem("btnVolverLogin")?.addEventListener("click", () => {
    mostrarSeccion(ContainerLogin);
    ocultarMainBtn();
  });
  capturarItem("btnVolverLoginRecuperar")?.addEventListener("click", () => {
    mostrarSeccion(ContainerLogin);
    ocultarMainBtn();
    capturarItem("step3RecoveryPass").style.display = "none";
    capturarItem("step2RecoveryPass").style.display = "none";
    capturarItem("step1RecoveryPass").style.display = "block";
    capturarItem("inputRecoverUser").value = "";
    capturarItem("inputRecoveryCodePass").value = "";
    capturarItem("inputNewPasswordRecovery").value = "";

  });
  

  // ====================== MODALES (abrir/cerrar botones de HTML) ======================
  // Solo enlazamos si existen los botones; si no, no hacemos nada.
  function conectarAbrirCerrar() {
    const open1 = capturarItem("open-modal1");
    if (open1) open1.addEventListener("click", () => capturarItem("modal1")?.classList.add("active"));
    const open2 = capturarItem("open-modal2");
    if (open2) open2.addEventListener("click", () => capturarItem("modal2")?.classList.add("active"));
    const open3 = capturarItem("open-modal3");
    if (open3) open3.addEventListener("click", () => capturarItem("modal3")?.classList.add("active"));

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close');
        if (target) capturarItem(target)?.classList.remove('active');
      });
    });
  }

  conectarAbrirCerrar();


  ///====================== EDITAR USUARIO =========================
  const btnChancgeUserData = capturarItem("btnChangeDataUser");
  
  if(btnChancgeUserData){
    btnChancgeUserData.addEventListener("click", async ()=>{
      
    const newName = capturarItem("changeUserName").value.trim();
    const newEmail = capturarItem("changeUserEmail").value.trim();
    const newPhone = capturarItem("changeUserPhone").value.trim();
    const passwordUser = capturarItem("changeUserPass").value.trim();
    const newPass = capturarItem("changeUserNewPass").value.trim();
    if(!newName || !newEmail || !newPhone || !passwordUser){
      mostrarMensaje("Datos Incompletos!")
    }else{
      if(!validarEmail(newEmail) || !validarNumero(newPhone)){
        mostrarMensaje("Datos invalidos")
      }else{
        if(newPass !== ""){
          if(newPass && newPass.length <6){
          mostrarMensaje("La nueva contraseña debe tener al menos 6 caracteres")
          return;
        }else if(newPass && newPass.length >=6){
        const response = await fetchDataWithToken(`${HOST_API}/updateDataUser`, {
          nombre : newName,
          correo : newEmail,
          telefono : newPhone,
          actualPass : passwordUser,
          newPass : newPass
        });
        if(response){
          mostrarConfirm(response.mensaje + "\n Se cerrara la sesión para aplicar los cambios", (ok)=>{
            if(ok){
              mostrarSeccion(ContainerLogin);
              capturarItem("menu-section").style.display = "none"
              sessionStorage.clear();
            }else{
              mostrarSeccion(ContainerLogin);
              capturarItem("menu-section").style.display = "none"
              sessionStorage.clear();
            }
          
        })
      }
      }
        
    }else{
      const response = await fetchDataWithToken(`${HOST_API}/updateDataUser`, {
          nombre : newName,
          correo : newEmail,
          telefono : newPhone,
          actualPass : passwordUser,
        });
        if(response){
          mostrarConfirm(response.mensaje + "\n Se cerrara la sesión para aplicar los cambios", (ok)=>{
            if(ok){
              mostrarSeccion(ContainerLogin);
              capturarItem("menu-section").style.display = "none"
              sessionStorage.clear();
            }else{
              mostrarSeccion(ContainerLogin);
              capturarItem("menu-section").style.display = "none"
              sessionStorage.clear();
            }
          
        })
      }
    }
        
    }
    }

  });
  

  }
  
  // ====================== LOGIN ======================
  const mainSections = document.querySelectorAll(".menu-section");

  // Ocultar todo el contenido al cargar, excepto login
  mostrarSeccion(ContainerLogin);
  mainSections.forEach(sec => sec.style.display = "none");

  const btnLogin = document.getElementById("btnLogin");
  const btnSubMenuRegister = document.getElementById("btnSubMenuRegister");

  btnLogin.addEventListener("click", async () => {
    capturarItem("spinnerContainerLogin").style.display = "block";
    btnLogin.style.display = "none";
    btnSubMenuRegister.style.display = "none";
    const user = document.getElementById("login_user").value.trim();
    const pass = document.getElementById("login_pass").value.trim();

    if (!user || !pass) {
      capturarItem("spinnerContainerLogin").style.display = "none";
      btnLogin.style.display = "block";
      btnSubMenuRegister.style.display = "block";
      mostrarMensaje("Por favor complete todos los campos");
      return;
    } else {


      const dataUser = await fetchData(`${HOST_API}/login`, { user: user, password: pass });
      console.log(dataUser.userAppData.cedula)
      if (dataUser.userStatus) {
        //Guardar sesión en localStorage
          sessionStorage.setItem("sessionUser", JSON.stringify({
          data: dataUser.userAppData,
          token: dataUser.token
        }));
        mostrarMensaje("Inicio de sesión exitoso");
        mostrarSeccion(ContainerHome);
        mainSections.forEach(sec => sec.style.display = "block");
        capturarItem("spinnerContainerLogin").style.display = "none";
        btnLogin.style.display = "block";
        btnSubMenuRegister.style.display = "block";
        updateDataViwer(dataUser.userAppData)
        changeStatusBot(); // iniciar ciclo estado bot
        renderUserApp(dataUser.userAppData);

        
      } else if (dataUser.status === 401) {
        mostrarMensaje("Usuario o contraseña incorrectos");
        mainSections.forEach(sec => sec.style.display = "block");
        capturarItem("spinnerContainerLogin").style.display = "none";
        btnLogin.style.display = "block";
        btnSubMenuRegister.style.display = "block";
        capturarItem("menu-section").style.display = "none"
      }


    }

  });


  //================================CERRAR SESION=========================
  document.getElementById("btnMenuSalir").addEventListener("click", () => {
    mostrarSeccion(ContainerLogin);
    capturarItem("menu-section").style.display = "none"
    sessionStorage.clear();
    mostrarMensaje("Sesión cerrada correctamente");
    
  });
 // ========================REGISTRAR USUARIO =======================


 capturarItem("btnRegistrarUsuario").addEventListener("click", async ()=>{
 const newUserCC = capturarItem("registerCedula").value.trim();
 const newUserName = capturarItem("registerNombre").value.trim();
 const newUserEmail = capturarItem("registerCorreo").value.trim();
 const newUserPhone = capturarItem("registerTelefono").value.trim();
 const newUserPass = capturarItem("registerContrasena").value.trim();
  if(!newUserCC || !newUserEmail || !newUserName || !newUserPass || !newUserPhone){
    
    mostrarMensaje("Datos Incompletos!")
  }else{
    if(!validarEmail(newUserEmail) || !validarNumero(newUserPhone) || !validarNumero(newUserCC)){
      mostrarMensaje("Datos invalidos")
    }else{
      const response = await fetchData(`${HOST_API}/registerUser`, {
        cedula: newUserCC, 
        contrasena :newUserPass, 
        nombre : newUserName, 
        correo : newUserEmail, 
        telefono : newUserPhone});
      if(response){
        mostrarMensaje("Registro Exitoso!")
      }else{
        mostrarMensaje("Error del servidor")
      }
      mostrarSeccion(ContainerLogin);
      capturarItem("menu-section").style.display = "none"

    }
  }
   
 })

/////====================== RECUPERAR CONTRASEÑA =======================
 capturarItem("btnEnviarCodigoRecovery").addEventListener("click", async ()=>{
  const emailOrPhoneRecovery = capturarItem("inputRecoverUser").value.trim();
  if(!validarEmail(emailOrPhoneRecovery) && !validarNumero(emailOrPhoneRecovery)){
    mostrarMensaje("Correo o usuario inválido")
  }else{
    const response = await fetchData(`${HOST_API}/recoveryPassword`, { cedulaOCorreo: emailOrPhoneRecovery});
    if(response.status == 200){
      mostrarMensaje(response.mensaje);
      capturarItem("step2RecoveryPass").style.display = "block";
      capturarItem("step1RecoveryPass").style.display = "none";
      
      capturarItem("btnVerificarCodigoPass").addEventListener("click", async ()=>{
        const inputCodigo = capturarItem("inputRecoveryCodePass").value.trim();
        if(inputCodigo == ""){
        mostrarMensaje("Ingresa el código enviado")
        }else{
          const response = await fetchData(`${HOST_API}/verifyRecoveryCodePass`, { codigo: inputCodigo, cedulaOCorreo: emailOrPhoneRecovery});
          if(response.status == 200){
            mostrarMensaje(response.mensaje);
            capturarItem("step3RecoveryPass").style.display = "block";
            capturarItem("step2RecoveryPass").style.display = "none";
            
            capturarItem("btnGuardarNuevaPass").addEventListener("click", async ()=>{
              const newPasswordRecovery = capturarItem("inputNewPasswordRecovery").value.trim();
              if(newPasswordRecovery.length <6){
                mostrarMensaje("La nueva contraseña debe tener al menos 6 caracteres")
              }else{
                const response = await fetchData(`${HOST_API}/updateRecoveryPassword`, { newPassword: newPasswordRecovery, cedulaOCorreo: emailOrPhoneRecovery});
                if(response.status ==200){
                  mostrarSeccion(ContainerLogin);
                  capturarItem("menu-section").style.display = "none"      
                  mostrarMensaje("Contraseña actualizada correctamente");
                }else{
                  mostrarMensaje("Error al actualizar la contraseña");
                }
              }
            })
          }else{
            mostrarMensaje(response.mensaje);
          }
        }

      });
      
    }else{
      console.log(response)
      mostrarMensaje(response.mensaje);
    }
  }
  });
  // ====================== INICIALIZACIÓN ======================

  //===================CARGAR SESSION SI EXITE ==============================
  
    if (session) {
      const data = JSON.parse(session).data
      updateDataViwer(data)
      changeStatusBot(); // iniciar ciclo estado bot
      renderUserApp(data);
      mostrarSeccion(ContainerHome);
    } else {
      mostrarSeccion(ContainerLogin);
      capturarItem("menu-section").style.display = "none"

    }


}); // DOMContentLoaded end 