// FACTURABOT - RUTAS PRINCIPALES
// ==============================================
import express from "express";
import bcrypt from "bcrypt";
import { connectionDB } from "./srcBackend/conectDb.js";

const router = express.Router();

// ==============================================
// USUARIOS
// ==============================================

// Crear usuario
router.post("/api/usuarios", async (req, res) => {
  const { cedula, contrasena, nombre, correo, telefono } = req.body;
  if (!cedula || !contrasena || !nombre || !correo)
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

  try {
    const hashed = await bcrypt.hash(contrasena, 10);
    const sql = `
      INSERT INTO tbl_usuarios (cedula, contrasena, nombre, correo, telefono)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connectionDB.query(sql, [cedula, hashed, nombre, correo, telefono]);
    res.status(201).json({ mensaje: "Usuario creado correctamente", id: result.insertId });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ mensaje: "Cédula o correo ya registrados." });
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// Login de usuario
router.post("/api/login", async (req, res) => {
  const { cedula, contrasena } = req.body;
  console.log(cedula)
  console.log(contrasena)
  if (!cedula || !contrasena)
    return res.status(400).json({ mensaje: "Faltan datos" });

  try {
    const [rows] = await connectionDB.query("SELECT * FROM tbl_usuarios WHERE cedula = ?", [cedula]);
    const usuario = rows[0];
    if (!usuario)
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });

    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido)
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });

    delete usuario.contrasena;
    res.json({ mensaje: "Inicio de sesión exitoso", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// Actualizar usuario (requiere contraseña actual)
router.post("/api/usuarios/actualizar", async (req, res) => {
  const { id, cedula, nombre, correo, telefono, contrasenaActual, nuevaContrasena } = req.body;
  if (!id || !contrasenaActual)
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

  try {
    const [rows] = await connectionDB.query("SELECT * FROM tbl_usuarios WHERE id = ?", [id]);
    const usuario = rows[0];
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const valida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!valida)
      return res.status(401).json({ mensaje: "Contraseña actual incorrecta" });

    let sql, params;
    if (nuevaContrasena) {
      const hashed = await bcrypt.hash(nuevaContrasena, 10);
      sql = `
        UPDATE tbl_usuarios
        SET cedula = ?, nombre = ?, correo = ?, telefono = ?, contrasena = ?
        WHERE id = ?
      `;
      params = [cedula || usuario.cedula, nombre || usuario.nombre, correo || usuario.correo, telefono || usuario.telefono, hashed, id];
    } else {
      sql = `
        UPDATE tbl_usuarios
        SET cedula = ?, nombre = ?, correo = ?, telefono = ?
        WHERE id = ?
      `;
      params = [cedula || usuario.cedula, nombre || usuario.nombre, correo || usuario.correo, telefono || usuario.telefono, id];
    }

    await connectionDB.query(sql, params);

    res.json({
      mensaje: "Usuario actualizado correctamente",
      usuario: {
        id,
        cedula: cedula || usuario.cedula,
        nombre: nombre || usuario.nombre,
        correo: correo || usuario.correo,
        telefono: telefono || usuario.telefono,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ mensaje: "Cédula o correo ya registrados." });
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ==============================================
// CLIENTES
// ==============================================

// Crear cliente
router.post("/api/clientes", async (req, res) => {
  const { usuario_id, cedula, nombre, telefono, direccion, correo } = req.body;
  if (!usuario_id || !cedula || !nombre)
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

  try {
    const sql = `
      INSERT INTO tbl_clientes (usuario_id, cedula, nombre, telefono, direccion, correo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connectionDB.query(sql, [usuario_id, cedula, nombre, telefono, direccion, correo]);
    res.status(201).json({
      mensaje: "Cliente creado correctamente",
      cliente: { id: result.insertId, usuario_id, cedula, nombre, telefono, direccion, correo },
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ mensaje: "El cliente ya existe (cédula o correo duplicado)." });
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// Obtener clientes por usuario (POST seguro)
router.post("/api/clientes/obtener", async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id)
    return res.status(400).json({ mensaje: "Falta el campo usuario_id" });

  try {
    const [rows] = await connectionDB.query(
      "SELECT * FROM tbl_clientes WHERE usuario_id = ? ORDER BY nombre ASC",
      [usuario_id]
    );
    if (rows.length === 0)
      return res.status(404).json({ mensaje: "No se encontraron clientes" });
    res.json({ mensaje: "Clientes obtenidos correctamente", total: rows.length, clientes: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

// ==============================================
// PRODUCTOS
// ==============================================

// Crear producto
router.post("/api/productos", async (req, res) => {
  const { usuario_id, nombre, precio } = req.body;
  if (!usuario_id || !nombre || !precio)
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

  try {
    const [result] = await connectionDB.query(
      "INSERT INTO tbl_productos (usuario_id, nombre, precio) VALUES (?, ?, ?)",
      [usuario_id, nombre, precio]
    );
    res.status(201).json({ mensaje: "Producto creado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear producto" });
  }
});

// Obtener productos del usuario
router.post("/api/productos/obtener", async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id)
    return res.status(400).json({ mensaje: "Falta usuario_id" });

  try {
    const [rows] = await connectionDB.query(
      "SELECT * FROM tbl_productos WHERE usuario_id = ? ORDER BY nombre ASC",
      [usuario_id]
    );
    res.json({ mensaje: "Productos obtenidos correctamente", productos: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
});

// ==============================================
// FACTURAS
// ==============================================

// Crear factura
router.post("/api/facturas", async (req, res) => {
  const { usuario_id, cliente_id, producto_id, cantidad, total } = req.body;
  if (!usuario_id || !cliente_id || !producto_id)
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });

  try {
    const [result] = await connectionDB.query(
      "INSERT INTO tbl_facturas (usuario_id, cliente_id, producto_id, cantidad, total) VALUES (?, ?, ?, ?, ?)",
      [usuario_id, cliente_id, producto_id, cantidad || 1, total || 0]
    );
    res.status(201).json({ mensaje: "Factura creada correctamente", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al crear factura" });
  }
});

// Obtener facturas de un usuario
router.post("/api/facturas/obtener", async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id)
    return res.status(400).json({ mensaje: "Falta usuario_id" });

  try {
    const [rows] = await connectionDB.query(
      `SELECT f.*, c.nombre AS cliente, p.nombre AS producto
       FROM tbl_facturas f
       JOIN tbl_clientes c ON f.cliente_id = c.id
       JOIN tbl_productos p ON f.producto_id = p.id
       WHERE f.usuario_id = ?
       ORDER BY f.fecha DESC`,
      [usuario_id]
    );
    res.json({ mensaje: "Facturas obtenidas correctamente", total: rows.length, facturas: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener facturas" });
  }
});

// ==============================================
// EXPORTAR RUTAS
// ==============================================
export default router;