import express from "express";
import cors from "cors";
import { fetchData } from "../Frontend/peticionServer.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  addUsuario,
  addCliente,
  getClientesByUsuario,
  getUsersLogin,
  getUsuarioById,
  getUsuarioByCedulaOCorreo,
  updateUsuarioCompleto,
  verificarToken,
  updateCliente,
  deleteCliente,
  getFacturasByUsuario,
  addFacturaCompleta,
  deleteFactura,
  addProducto,
  deleteProducto,
  getProductosByUsuario,
  getUsuarioByTelefono,
  getClienteByNombre,
  getProductoByNombreTolerante,
  generarFacturaElectronicaByIdFactura,
  enviarFacturaFactus

} from "./srcBackend/userServices.js";
import jwt from "jsonwebtoken";
import loginFactus from "./srcBackend/loginFactus.js"

dotenv.config();
// Crear aplicación
const app = express();

// =================== CONFIGURAR CORS ===================
const allowedOrigins = [
  "http://127.0.0.1:5500", // Live Server (VS Code)
  "http://localhost:5173", // Vite
  "http://localhost:3000", // Dev
  "https://joker120620.github.io", // GitHub Pages
  "https://front-web.up.railway.app", // front
  "https://facturabot.dev", // produccion
  "https://facturador-electronico-web.up.railway.app"
];

// ✅ Middleware global para todas las rutas
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
// También puedes mantener cors() por compatibilidad
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

///////////////////variable estado bot
let statusBot = false;
const codes = [];
const HOST_BOT = process.env.HOST_BOT || "http://localhost:4000";
const HOST_API_FACTUS = process.env.HOST_API_FACTUS;

/////////////////////////
const SECRET_KEY = process.env.SECRET_KEY;
//////////////////
// Ruta de prueba
app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin" , "*");
  res.json({ msj: "Servidor Online" });
});

// ====================== ESTADO DEL BOT ======================
app.post("/statusbot", (req, res) => {
  const response = req.body;
  if(response.entity === "bot"){
    statusBot = response.status;
    console.log("Bot Conectado", statusBot);
    res.json({ msj: "Server conectado 200" });
  } else if (response.entity === "client") {
    res.json({ statusBotServer: statusBot });
    console.log("Cliente consultando estado del bot", statusBot);
  }
});

// ====================== LOGUEARSE  ======================
app.post("/login", async (req, res) => {
  try {
    const response = req.body;
    if (!response.user || !response.password) {
      return res.status(400).json({ msj: "Faltan datos" });
    }

    const usuario = await getUsersLogin(response.user, response.password);

    if (!usuario) {
      res.json({status: 401, msj: "Usuario o contraseña incorrectos", userAppData: ""});
      console.log("Login fallido para el usuario:", response.user);
      return;
    }

    // Determinar id y campos (compatibilidad: id_usuario o id)
    const userId = usuario.id_usuario ?? usuario.id;
    const userCedula = usuario.cedula_usuario ?? usuario.cedula;
    const userNombre = usuario.nombre_usuario ?? usuario.nombre;

    // 🔑 Crear token JWT con datos básicos del usuario
    const token = jwt.sign(
      {
        id: userId,
        cedula: userCedula,
        nombre: userNombre
      },
      SECRET_KEY,
      { expiresIn: "1h" } // expira en 1 hora
    );

    // Enviar respuesta con token incluido
    // Quitar la contraseña del objeto si existe
    if (usuario.contrasena_usuario) delete usuario.contrasena_usuario;
    if (usuario.contrasena) delete usuario.contrasena;

    res.json({
      userStatus: true,
      userAppData: usuario,
      token,
    });
  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ msj: "Error interno del servidor" });
  }
});

// ====================== REGISTRAR NUEVOS USUARIOS ======================
//endpoint de registro de usuarios
app.post("/registerUser", async (req, res) => {
  const { cedula, contrasena, nombre, correo, telefono, direccion } = req.body;

  if (!cedula || !contrasena || !nombre || !correo || !direccion) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    // Envío doble de campos por compatibilidad (antiguos y nuevos)
    const payload = {
      cedula, cedula_usuario: cedula,
      contrasena, contrasena_usuario: contrasena,
      nombre, nombre_usuario: nombre,
      correo, correo_usuario: correo,
      telefono, telefono_usuario: telefono,
      direccion, direccion_usuario: direccion
    };

    const id = await addUsuario(payload);
    res.status(200).json({ mensaje: "Usuario registrado correctamente", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
});

// ====================== ACTUALIZAR DATOS DE USUARIO ======================
app.post("/updateDataUser", verificarToken, async (req, res) => {
  try {
    const usuario_id_token = req.user.id; // viene del token
    const { nombre, correo, telefono, actualPass, newPass } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !correo) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios (nombre y correo)" });
    }

    // Obtener usuario actual (usar getUsuarioById)
    const usuario = await getUsuarioById(usuario_id_token);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Determinar el hash almacenado (compatibilidad)
    const hashStored = usuario.contrasena_usuario ?? usuario.contrasena;

    // validar contraseña para actualizar datos (si actualPass fue enviado)
    if (actualPass) {
      const match = await bcrypt.compare(actualPass, hashStored);
      if (!match) {
        return res.status(401).json({ mensaje: "La contraseña actual no es correcta" });
      }
    }

    // Si quiere cambiar contraseña, validar la actual y actualizar
    if (actualPass && newPass) {
      // Actualizar incluyendo nueva contraseña
      const payloadUpdate = {
        cedula: usuario.cedula_usuario ?? usuario.cedula,
        cedula_usuario: usuario.cedula_usuario ?? usuario.cedula,
        nombre, nombre_usuario: nombre,
        correo, correo_usuario: correo,
        telefono, telefono_usuario: telefono,
        nuevaContrasena: newPass,
        contrasena_usuario: newPass,
        contrasena: newPass
      };

      const filasAfectadas = await updateUsuarioCompleto(usuario_id_token, payloadUpdate);

      if (filasAfectadas === 0) {
        return res.status(400).json({ mensaje: "No se pudo actualizar el usuario" });
      }

      return res.status(200).json({
        status: 200,
        mensaje: "Datos y contraseña actualizados correctamente",
        usuario: { id: usuario_id_token, nombre, correo, telefono }
      });
    }

    // si no cambia contraseña, actualizar solo datos básicos
    const payloadUpdateBasic = {
      cedula: usuario.cedula_usuario ?? usuario.cedula,
      cedula_usuario: usuario.cedula_usuario ?? usuario.cedula,
      nombre, nombre_usuario: nombre,
      correo, correo_usuario: correo,
      telefono, telefono_usuario: telefono
    };

    const filasAfectadas = await updateUsuarioCompleto(usuario_id_token, payloadUpdateBasic);
    if (filasAfectadas === 0) {
      return res.status(400).json({ mensaje: "No se pudo actualizar el usuario" });
    }

    res.status(200).json({
      mensaje: "Datos actualizados correctamente",
      usuario: { id: usuario_id_token, nombre, correo, telefono }
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El correo ya está en uso por otro usuario." });
    }
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// Recuperación de contraseña - enviar código
app.post("/recoveryPassword", async (req, res) =>{
  const { cedulaOCorreo } = req.body;
  if (!cedulaOCorreo) {
    return res.status(400).json({ mensaje: "Falta el campo cedulaOCorreo" });
  };
  try{
    const usuario = await getUsuarioByCedulaOCorreo(cedulaOCorreo);
    if(!usuario){
      return res.json({status: 404, mensaje: "Usuario no encontrado" });
    }else{
       const userId = usuario.id_usuario ?? usuario.id;
       const userPhone = usuario.telefono_usuario ?? usuario.telefono;
       const codigo = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
       codes[userId] = codigo;
       console.log("Código de recuperación generado para el usuario:", userId, codigo);
       const mensaje = `🔐 Código de recuperación de contraseña: ${codigo}\n\nEste código es válido por 1 minuto. Si no solicitaste este código, ignora este mensaje.`;
       const response = await fetchData(`${HOST_BOT}/bot/sendMessage`, { mensaje , phone: userPhone });
       if (response.status === 200) {
         setTimeout(() => {
           delete codes[userId];
         }, 60000);
         return res.status(200).json({ status: 200 , mensaje: "Código de recuperación enviado correctamente" });
       } else {
         return res.status(500).json({ mensaje: "No se pudo enviar el código" });
       }
    }
  }catch(error){
    console.error("Error al recuperar contraseña:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ======================= VERIFICAR CÓDIGO DE RECUPERACIÓN ======================
app.post("/verifyRecoveryCodePass", async (req, res) => {
  const { codigo, cedulaOCorreo} = req.body;

  if (!codigo || !cedulaOCorreo) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const usuario = await getUsuarioByCedulaOCorreo(cedulaOCorreo);
    if (!usuario) {
      return res.status(404).json({ status: 404, mensaje: "Usuario no encontrado" });
    }

    const userId = usuario.id_usuario ?? usuario.id;
    console.log("Código almacenado para el usuario:", userId, codes[userId] || "No existe");

    if (codes[userId] === codigo) {
      codes[userId]= true; // marcar como verificado
      return res.status(200).json({status: 200 , mensaje: "Código de recuperación verificado correctamente" });
    } else {
      return res.json({status: 400 , mensaje: "Código de recuperación incorrecto o caducado" });
    }
  } catch (error) {
    console.error("Error al verificar código de recuperación:", error);
    res.json({ status: 500, mensaje: "Error interno del servidor" });
  }
});

// ====================== GUARDAR NUEVA CONTRASEÑA ======================
app.post("/updateRecoveryPassword", async (req, res) => {
  const { newPassword, cedulaOCorreo } = req.body;

  if (!newPassword || !cedulaOCorreo) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const usuario = await getUsuarioByCedulaOCorreo(cedulaOCorreo);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const userId = usuario.id_usuario ?? usuario.id;
    console.log("Verificación de código para el usuario:", userId, codes[userId]);

    if (!codes[userId]) {
      return res.status(403).json({ mensaje: "Código de recuperación no verificado" });
    }

    // Actualizar contraseña - enviamos ambos formatos por compatibilidad
    const payloadUpdate = {
      cedula: usuario.cedula_usuario ?? usuario.cedula,
      cedula_usuario: usuario.cedula_usuario ?? usuario.cedula,
      nombre: usuario.nombre_usuario ?? usuario.nombre,
      nombre_usuario: usuario.nombre_usuario ?? usuario.nombre,
      correo: usuario.correo_usuario ?? usuario.correo,
      correo_usuario: usuario.correo_usuario ?? usuario.correo,
      telefono: usuario.telefono_usuario ?? usuario.telefono,
      telefono_usuario: usuario.telefono_usuario ?? usuario.telefono,
      nuevaContrasena: newPassword,
      contrasena_usuario: newPassword,
      contrasena: newPassword
    };

    const filasAfectadas = await updateUsuarioCompleto(userId, payloadUpdate);

    if (filasAfectadas === 0) {
      return res.status(400).json({ mensaje: "No se pudo actualizar el usuario" });
    }

    delete codes[userId]; // Eliminar el código después de usarlo
    res.status(200).json({ status: 200 , mensaje: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== MOSTRAR CLIENTE ======================
app.post("/getClient", verificarToken, async (req, res) => {
  const { usuario_id } = req.body;
  console.log("Usuario autenticado:", req.user);

  if (!usuario_id) {
    return res.status(400).json({
      mensaje: "Falta el campo usuario_id en el cuerpo de la solicitud",
    });
  }

  try {
    const clientes = await getClientesByUsuario(usuario_id);

    if (!clientes || clientes.length === 0) {
      return res.status(404).json({
        status: 404,
        mensaje: "No se encontraron clientes para este usuario",
      });
    }

    res.json({ status: 200, clientes });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ status: 500, mensaje: "Error interno del servidor" });
  }
});

// ====================== AGREGAR CLIENTE ======================
app.post("/addClient", verificarToken, async (req, res) => {
  try {
    // El ID del usuario autenticado viene del token
    const usuario_id_token = req.user.id;

    const { cedula,
      digito_verificacion,
      nombre,
      razon_social,
      nombre_comercial,
      telefono,
      direccion,
      correo,
      tipo_organizacion_id,
      regimen_tributario_id,
      tipo_documento_id,
      municipio_id } = req.body;
    //  Validar campos obligatorios
    if (!cedula  || !nombre || !telefono || !direccion || !correo || !tipo_organizacion_id || !regimen_tributario_id || !tipo_documento_id || !municipio_id) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios: cedula, nombre, telefono, direccion o correo"
      });
    }
   
    const payload = {
      usuario_id : usuario_id_token,
      cedula,
      digito_verificacion,
      nombre,
      razon_social,
      nombre_comercial,
      telefono,
      direccion,
      correo,
      tipo_organizacion_id,
      regimen_tributario_id,
      tipo_documento_id,
      municipio_id
    };


    // Insertar cliente en la base de datos
    const id = await addCliente(payload);

    res.status(201).json({
      mensaje: "Cliente agregado correctamente",
      cliente: { id, usuario_id: usuario_id_token, cedula, nombre, telefono, direccion, correo }
    });

  } catch (error) {
    console.error("Error al agregar cliente:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El cliente ya existe (cédula o correo duplicado)." });
    }

    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== EDITAR CLIENTE ======================
app.post("/updateClient", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { id_cliente,
        cedula_cliente,
        digito_verificacion_cliente,
        nombre_cliente,
        correo_cliente,
        telefono_cliente,
        direccion_cliente,
        tipo_documento_id_cliente,
        tipo_organizacion_id_cliente,
        regimen_tributario_id_cliente,
        municipio_id_cliente,
        razon_social_cliente,
        nombre_comercial_cliente
    } = req.body;

    // Validar campos obligatorios
    if (!id_cliente || 
      !cedula_cliente || 
      !nombre_cliente || 
      !correo_cliente || 
      !telefono_cliente || 
      !direccion_cliente || 
      !tipo_documento_id_cliente || 
      !tipo_organizacion_id_cliente || 
      !regimen_tributario_id_cliente || 
      !municipio_id_cliente) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios: id, cedula, nombre, telefono, direccion o , etc",
      });
    }

    // Preparar payload con ambos esquemas
    const payload = {
        id_cliente,
        usuario_id, 
        cedula_cliente ,
        digito_verificacion_cliente,
        nombre_cliente ,
        razon_social_cliente,
        nombre_comercial_cliente,
        telefono_cliente,
        direccion_cliente,
        correo_cliente,
        tipo_organizacion_id_cliente,
        regimen_tributario_id_cliente,
        tipo_documento_id_cliente,
        municipio_id_cliente,
    };

    // Llamar la función del servicio
    const resultado = await updateCliente(payload);

    if (!resultado || resultado.autorizado === false) {
      return res.status(403).json({ mensaje: "No tienes permiso para editar este cliente" });
    }

    if (resultado.filasAfectadas === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado o sin cambios" });
    }

    res.status(200).json({
      mensaje: "Cliente actualizado correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar cliente:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El cliente ya existe (cédula o correo duplicado)." });
    }

    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== ELIMINAR CLIENTE ======================
app.post("/deleteClient", verificarToken, async (req, res) => {
  try {
    const usuario_id_token = req.user.id;
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: "Falta el campo id del cliente" });
    }

    const filasEliminadas = await deleteCliente(id, usuario_id_token);

    if (filasEliminadas === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado o no pertenece a este usuario" });
    }

    res.status(200).json({ mensaje: "Cliente eliminado correctamente" });

  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== CREAR FACTURA ======================
app.post("/addFactura", verificarToken, async (req, res) => {
  try {
    const usuario_id_token = req.user.id;
    const { cliente_id, items } = req.body;

    // Validaciones básicas
    if (!cliente_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        mensaje: "Debe incluir cliente_id y al menos un producto en items"
      });
    }

    // Preparar items para compatibilidad: enviar ambos nombres por ítem
    const itemsCompat = items.map(it => ({
      ...it,
      producto_id: it.producto_id ?? it.producto_id_detalle,
      producto_id_detalle: it.producto_id ?? it.producto_id_detalle,
      cantidad: it.cantidad ?? it.cantidad_detalle,
      cantidad_detalle: it.cantidad ?? it.cantidad_detalle,
      precio: it.precio ?? it.precio_unitario_detalle ?? it.precio_detalle,
      precio_unitario_detalle: it.precio ?? it.precio_unitario_detalle ?? it.precio_detalle,
      descuento_porcentaje_detalle: it.descuento_porcentaje_detalle ?? it.descuento ?? 0,
      impuesto_porcentaje_detalle: it.impuesto_porcentaje_detalle ?? it.impuesto ?? 0,
      sku_producto: it.sku_producto ?? it.codigo_referencia_detalle ?? it.codigo_producto ?? null
    }));

    // Crear factura con sus productos
    const factura_id = await addFacturaCompleta({
      usuario_id: usuario_id_token,
      usuario_id_factura: usuario_id_token,
      cliente_id,
      cliente_id_factura: cliente_id,
      items: itemsCompat
    });

    res.status(201).json({
      mensaje: "Factura creada correctamente",
      factura_id
    });
  } catch (error) {
    console.error("Error al crear factura:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== OBTENER FACTURAS ======================
app.post("/getFacturas", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const facturas = await getFacturasByUsuario(usuario_id);

    if (!facturas || facturas.length === 0) {
      return res.status(404).json({status: 404, mensaje: "No se encontraron facturas" });
    }

    res.status(200).json({ status: 200, facturas });
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res.status(500).json({ status: 500, mensaje: "Error interno del servidor" });
  }
});

// ====================== ELIMINAR FACTURAS ======================
app.post("/deleteFactura", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { id_factura } = req.body;
    console.log("Solicitud para eliminar factura:", id_factura, "Usuario ID:", usuario_id);

    if (!id_factura) {
      return res.json({ mensaje: "Falta el campo id de la factura" });
    }

    const filasEliminadas = await deleteFactura(id_factura, usuario_id);

    if (filasEliminadas === 0) {
      return res.json({ mensaje: "Factura no encontrada o no pertenece a este usuario" });
    }

    res.status(200).json({ mensaje: "Factura eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== OBTENER PRODUCTOS ======================
app.post("/getProduct", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const productos = await getProductosByUsuario(usuario_id);

    if (!productos || productos.length === 0) {
      return res.status(404).json({status: 404, mensaje: "No se encontraron productos" });
    }

    res.status(200).json({status : 200 , productos});
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({status: 500, mensaje: "Error interno del servidor" });
  }
});

// ====================== AGREGAR PRODUCTO ======================
app.post("/addProduct", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { nombre, precio, descripcion, codigo } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre o precio" });
    }

    // Enviar ambos esquemas en el payload
    const payload = {
      usuario_id,
      usuario_id_producto: usuario_id,
      nombre,
      nombre_producto: nombre,
      descripcion,
      descripcion_producto: descripcion,
      codigo,
      codigo_producto: codigo,
      precio,
      precio_producto: precio
    };

    const id = await addProducto(payload);

    res.status(201).json({
      mensaje: "Producto agregado correctamente",
      producto: { id, usuario_id, nombre, precio }
    });

  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ====================== ELIMINAR PRODUCTO ======================
app.post("/deleteProduct", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: "Falta el campo id del producto" });
    }

    const resultado = await deleteProducto(id, usuario_id);

    if (!resultado.eliminado) {
      return res.status(404).json({ mensaje: resultado.mensaje });
    }

    res.status(200).json({ mensaje: resultado.mensaje });

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

/////////////BOT ================================

// ====================== CREAR FACTURA DESDE BOT (por nombres) ======================
app.post("/addFacturaByName", async (req, res) => {
  try {
    const {
      telefono_usuario,
      vendedor,
      cliente,
      fecha,
      total_factura,
      items
    } = req.body;
    console.log("-----------------------------------------------------------")
    console.log(req.body)

    // Validaciones básicas
    if (!telefono_usuario || !cliente?.nombre || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 400,
        mensaje: "Faltan datos: teléfono del usuario, cliente o lista de productos."
      });
    }

    // Buscar usuario (vendedor) por teléfono
    const usuario = await getUsuarioByTelefono(telefono_usuario);
    if (!usuario) {
      return res.status(404).json({
        status: 404,
        mensaje: "Usuario (vendedor) no encontrado con ese número de teléfono."
      });
    }
    console.log("----------------------usuario---------------------------------------")
    console.log(usuario)
    const usuario_id = usuario.id_usuario ?? usuario.id;

    // Buscar cliente
    const clienteDB = await getClienteByNombre(cliente.nombre, usuario_id);
    if (!clienteDB) {
      return res.status(404).json({
        status: 404,
        mensaje: `El cliente "${cliente.nombre}" no está registrado.`
      });
    }
    console.log("----------------------cliente---------------------------------------")
    console.log(clienteDB)
    const cliente_id = clienteDB.id_cliente ?? clienteDB.id;

    // Buscar productos tolerantes (por coincidencia parcial)
    const productosBuscados = [];
    const productosNoEncontrados = [];

    for (const item of items) {
      const nombreBuscar = item.producto_nombre
        .normalize("NFD") // elimina tildes y acentos
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      console.log("Nombre a buscar:", nombreBuscar);
      if (!nombreBuscar) continue;

      const producto = await getProductoByNombreTolerante(nombreBuscar, usuario_id);
      console.log("-------------------------producto--------------------------------------")
      console.log(producto)
      if (producto) {
        const prodId = producto.id_producto ?? producto.id;
        const prodNombre = producto.nombre_producto ?? producto.nombre;
        const prodPrecio = producto.precio_producto ?? producto.precio;
        productosBuscados.push({
          producto_id: prodId,
          nombre: prodNombre,
          cantidad: item.cantidad || 1,
          precio: prodPrecio,
          subtotal: prodPrecio * (item.cantidad || 1)
        });
      } else {
        productosNoEncontrados.push(item.producto_nombre);
      }
      console.log("-------------------------------------------------------------")
    }

    // Si faltan productos y no hay ninguno encontrado, retornar error
    if (productosNoEncontrados.length > 0 && productosBuscados.length === 0) {
      return res.status(404).json({
        status: 404,
        mensaje: `No se encontraron productos con nombres similares a: ${productosNoEncontrados.join(", ")}`
      });
    }

    // Calcular total
    const totalCalculado = productosBuscados.reduce((acc, p) => acc + p.subtotal, 0);

    // Crear factura (compatibilizando payload)
    const factura_id = await addFacturaCompleta({
      usuario_id,
      usuario_id_factura: usuario_id,
      cliente_id,
      cliente_id_factura: cliente_id,
      items: productosBuscados
    });
    const token = await loginFactus();
    const facturaPayload = await generarFacturaElectronicaByIdFactura(factura_id)
    const respuesta = await enviarFacturaFactus(facturaPayload, factura_id, token);
    if (respuesta.exito) {
      res.status(201).json({
      status: 201,
      mensaje: `Factura creada correctamente para ${cliente.nombre}`,
      factura_id,
      productos_no_encontrados: productosNoEncontrados,
      total_calculado: totalCalculado,
      pdfBase64: respuesta.pdf_base,
    });

    }else {
      res.status(201).json({
      status: 201,
      mensaje: `error${cliente.nombre}`,
      factura_id,
      productos_no_encontrados: productosNoEncontrados,
      total_calculado: totalCalculado})
    }

    

  } catch (error) {
    console.error("Error al crear factura desde bot:", error);
    res.status(500).json({status: 500, mensaje: "Error interno del servidor" });
  }
});


// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});