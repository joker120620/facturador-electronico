import express from "express";
import cors from "cors";
import { fetchData } from "../Frontend/peticionServer.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { 
  addUsuario, 
  addCliente, 
  getClientesByUsuario , 
  getUsersLogin,
  getUsuarioById,
  getUsuarioByCedulaOCorreo,
  updateUsuarioCompleto , 
  verificarToken , 
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
  getProductoByNombreTolerante

  
 } from "./srcBackend/userServices.js";
import jwt from "jsonwebtoken";



// Cargar las variables del archivo .env
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
  origin: 'https://facturabot.dev',
  credentials: true,
}));
// Middleware para leer JSON



///////////////////variable estado bot
let statusBot = false;
const codes = [];
const HOST_BOT = process.env.HOST_BOT || "http://localhost:4000";

/////////////////////////
const SECRET_KEY = process.env.SECRET_KEY;
//////////////////
// Ruta de prueba
app.get("/", (req, res) => {
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
  const response = req.body;
  const usuario = await getUsersLogin(response.user, response.password);
  if(response.user && response.password){
    if(usuario){
      // 🔑 Crear token JWT con datos básicos del usuario
    const token = jwt.sign(
      {
        id: usuario.id,
        cedula: usuario.cedula,
        nombre: usuario.nombre,
      },
      SECRET_KEY,
      { expiresIn: "1h" } // expira en 1 horas
    );

    // Enviar respuesta con token incluido
    res.json({
      userStatus: true,
      userAppData: usuario,
      token,
    });

    }else {
      res.json({status: 401, msj: "Usuario o contraseña incorrectos" ,userAppData: "" });
      console.log("Login fallido para el usuario:", response.user);
    }
  } else {
    res.status(400).json({ msj: "Faltan datos" });
  }

   
});
// ====================== REGISTRAR NUEVOS USUARIOS ======================
//endpoint de registro de usuarios
app.post("/registerUser", async (req, res) => {
  const { cedula, contrasena, nombre, correo, telefono } = req.body;

  if (!cedula || !contrasena || !nombre || !correo) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const id = await addUsuario({ cedula, contrasena, nombre, correo, telefono });
    res.status(200).json({ mensaje: "Usuario registrado correctamente", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
});

// ====================== ACTUALIZAR DATOS DE USUARIO ======================
app.post("/updateDataUser", verificarToken, async (req, res) => {
  try {
    const usuario_id = req.user.id; // viene del token
    const { nombre, correo, telefono, actualPass, newPass } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !correo) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios (nombre y correo)" });
    }

    // Obtener usuario actual
    const usuario = await getUsuarioById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    // validar contraseña para actualizar datos
    const match = await bcrypt.compare(actualPass, usuario.contrasena);
      if (!match) {
        return res.status(401).json({ mensaje: "La contraseña actual no es correcta" });
      }
    // Si quiere cambiar contraseña, validar la actual
    if (actualPass && newPass) {
      const match = await bcrypt.compare(actualPass, usuario.contrasena);
      if (!match) {
        return res.status(401).json({ mensaje: "La contraseña actual no es correcta" });
      }

      // Actualizar incluyendo nueva contraseña
      const filasAfectadas = await updateUsuarioCompleto(usuario_id, {
        cedula : usuario.cedula,
        nombre,
        correo,
        telefono,
        nuevaContrasena: newPass
      });

      if (filasAfectadas === 0) {
        return res.status(400).json({ mensaje: "No se pudo actualizar el usuario" });
      }

      return res.status(200).json({
        mensaje: "Datos y contraseña actualizados correctamente",
        usuario: { id: usuario_id, nombre, correo, telefono }
      });
    }

    // si no cambia contraseña, actualizar solo datos básicos
    const filasAfectadas = await updateUsuarioCompleto(usuario_id, {
      cedula: usuario.cedula,
      nombre,
      correo,
      telefono
    });
    if (filasAfectadas === 0) {
      return res.status(400).json({ mensaje: "No se pudo actualizar el usuario" });
    }

    res.status(200).json({
      mensaje: "Datos actualizados correctamente",
      usuario: { id: usuario_id, nombre, correo, telefono }
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El correo ya está en uso por otro usuario." });
    }
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

app.post("/recoveryPassword", async (req, res) =>{
  const { cedulaOCorreo } = req.body;
  if (!cedulaOCorreo) {
    res.status(400).json({ mensaje: "Falta el campo cedulaOCorreo" });
  };
  try{
    const usuario = await getUsuarioByCedulaOCorreo(cedulaOCorreo);
    if(!usuario){
      res.json({status: 404, mensaje: "Usuario no encontrado" });
    }else{
      
       const codigo = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
       codes[usuario.id] = codigo;
       console.log("Código de recuperación generado para el usuario:", usuario.id, codigo);
       const mensaje = `🔐 Código de recuperación de contraseña: ${codigo}\n\nEste código es válido por 1 minuto. Si no solicitaste este código, ignora este mensaje.`;
      const response = await fetchData(`${HOST_BOT}/bot/sendMessage`, { mensaje , phone: usuario.telefono });
      if (response.status === 200) {
        setTimeout(() => {
          delete codes[usuario.id];
        }, 60000);
        res.status(200).json({ status: 200 , mensaje: "Código de recuperación enviado correctamente" });
       }
    }

  }catch(error){
    console.error("Error al recuperar contraseña:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});
///====================== VERIFICAR CÓDIGO DE RECUPERACIÓN ======================
app.post("/verifyRecoveryCodePass", async (req, res) => {
const { codigo, cedulaOCorreo} = req.body;

if (!codigo || !cedulaOCorreo) {
  res.status(400).json({ mensaje: "Faltan datos obligatorios" });
}

try {
  const usuario = await getUsuarioByCedulaOCorreo(cedulaOCorreo);
  console.log("Código almacenado para el usuario:", usuario.id, codes[usuario.id] || "No existe");
  if (!usuario) {
    res.status(404).json({ status: 404, mensaje: "Usuario no encontrado" });
  }
  

  if (codes[usuario.id] === codigo) {
    codes[usuario.id]= true; // marcar como verificado
    res.status(200).json({status: 200 , mensaje: "Código de recuperación verificado correctamente" });
  } else {
    res.json({status: 400 , mensaje: "Código de recuperación incorrecto o caducado" });
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
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    console.log("Verificación de código para el usuario:", usuario.id, codes[usuario.id]);

    if (!codes[usuario.id]) {
      res.status(403).json({ mensaje: "Código de recuperación no verificado" });
    }

    // Aquí se actualizaría la contraseña en la base de datos
    // Actualizar incluyendo nueva contraseña
      const filasAfectadas = await updateUsuarioCompleto(usuario.id, {
        cedula: usuario.cedula,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono,
        nuevaContrasena: newPassword
      });

    if (filasAfectadas === 0) {
      res.status(400).json({ mensaje: "No se pudo actualizar el usuario" });
    } else {

      delete codes[usuario.id]; // Eliminar el código después de usarlo

      res.status(200).json({ status: 200 , mensaje: "Contraseña actualizada correctamente" });
    }

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

    if (clientes.length === 0) {
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
    const usuario_id = req.user.id;

    const { cedula, nombre, telefono, direccion, correo } = req.body;

    //  Validar campos obligatorios
    if (!cedula || !nombre || !telefono || !direccion || !correo) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios: cedula, nombre, telefono, direccion o correo"
      });
    }

    // Insertar cliente en la base de datos
    const id = await addCliente({ usuario_id, cedula, nombre, telefono, direccion, correo });

    res.status(201).json({
      mensaje: "Cliente agregado correctamente",
      cliente: { id, usuario_id, cedula, nombre, telefono, direccion, correo }
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
    const { id, cedula, nombre, telefono, direccion, correo } = req.body;

    // Validar campos obligatorios
    if (!id || !cedula || !nombre || !telefono || !direccion || !correo) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios: id, cedula, nombre, telefono, direccion o correo",
      });
    }

    // Llamar la función del servicio
    const resultado = await updateCliente({ id, usuario_id, cedula, nombre, telefono, direccion, correo });

    if (!resultado.autorizado) {
      return res.status(403).json({ mensaje: "No tienes permiso para editar este cliente" });
    }

    if (resultado.filasAfectadas === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado o sin cambios" });
    }

    res.status(200).json({
      mensaje: "Cliente actualizado correctamente",
      cliente: { id, usuario_id, cedula, nombre, telefono, direccion, correo },
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
    const usuario_id = req.user.id;
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ mensaje: "Falta el campo id del cliente" });
    }

    const filasEliminadas = await deleteCliente(id, usuario_id);

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
    const usuario_id = req.user.id;
    const { cliente_id, items } = req.body;

    // Validaciones básicas
    if (!cliente_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        mensaje: "Debe incluir cliente_id y al menos un producto en items"
      });
    }

    // Crear factura con sus productos
    const factura_id = await addFacturaCompleta({ usuario_id, cliente_id, items });

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

    if (facturas.length === 0) {
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

    if (productos.length === 0) {
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
    const { nombre, precio } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre o precio" });
    }

    const id = await addProducto({ usuario_id, nombre, precio });

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
// ====================== CREAR FACTURA DESDE BOT (TOLERANTE A ERRORES) ======================
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

    // 🧩 Validaciones básicas
    if (!telefono_usuario || !cliente?.nombre || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 400,
        mensaje: "Faltan datos: teléfono del usuario, cliente o lista de productos."
      });
    }

    // 🔹 Buscar usuario (vendedor)
    const usuario = await getUsuarioByTelefono(telefono_usuario);
    if (!usuario) {
      return res.status(404).json({
        status: 404,
        mensaje: "Usuario (vendedor) no encontrado con ese número de teléfono."
      });
    }
    console.log("----------------------usuario---------------------------------------")
    console.log(usuario)
    const usuario_id = usuario.id;

    // 🔹 Buscar cliente
    const clienteDB = await getClienteByNombre(cliente.nombre, usuario_id);
    if (!clienteDB) {
      return res.status(404).json({
        status: 404,
        mensaje: `El cliente "${cliente.nombre}" no está registrado.`
      });
    }
    console.log("----------------------cliente---------------------------------------")
    console.log(clienteDB)
    const cliente_id = clienteDB.id;

    // 🔹 Buscar productos tolerantes (por coincidencia parcial)
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
        productosBuscados.push({
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: item.cantidad || 1,
          precio: producto.precio,
          subtotal: producto.precio * (item.cantidad || 1)
        });
      } else {
        productosNoEncontrados.push(item.producto_nombre);
      }
      console.log("-------------------------------------------------------------")
    }

    // ⚠️ Si faltan productos, avisamos pero no detenemos todo
    if (productosNoEncontrados.length > 0 && productosBuscados.length === 0) {
      return res.status(404).json({
        status: 404,
        mensaje: `No se encontraron productos con nombres similares a: ${productosNoEncontrados.join(", ")}`
      });
    }

    // 🔹 Calcular total
    const totalCalculado = productosBuscados.reduce((acc, p) => acc + p.subtotal, 0);

    // 🔹 Crear factura
    const factura_id = await addFacturaCompleta({
      usuario_id,
      cliente_id,
      items: productosBuscados
    });

    res.status(201).json({
      status: 201,
      mensaje: `Factura creada correctamente para ${cliente.nombre}`,
      factura_id,
      productos_no_encontrados: productosNoEncontrados,
      total_calculado: totalCalculado
    });

  } catch (error) {
    console.error("Error al crear factura desde bot:", error);
    res.status(500).json({status: 500, mensaje: "Error interno del servidor" });
  }
});






//datos token
const datosToken = 
{
  "grant_type": "password",
  "client_id": process.env.CLIENT_ID,
  "client_secret": process.env.CLIENT_SECRET,
  "username": process.env.USER,
  "password": process.env.PASSWORD
}
app.get("/token", async (req, res) => {
  try {
    // Llamamos a la función que hace la petición
    const dataRecived = await fetchData(
      "https://api-sandbox.factus.com.co/oauth/token",
      datosToken
    );

    //console.log("Datos recibidos:", dataRecived);

    // Responder al cliente
    res.json(dataRecived);
  } catch (error) {
    console.error("Error al obtener token:", error);
    res.status(500).json({ error: "Error al obtener token" });
  }
});
// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});