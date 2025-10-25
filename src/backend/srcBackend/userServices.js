import { connectionDB  } from "./conectDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const SECRET_KEY = process.env.SECRET_KEY;
// Obtener todos los usuarios
export async function getUsuarios() {
  const [rows] = await connectionDB.query("SELECT * FROM tbl_usuarios");
  return rows;
}
// BUSCAR USUARIO POR CEDULA O CORREO 
export async function getUsuarioByCedulaOCorreo(user) {
  const sql = `
    SELECT id, cedula, nombre, correo, telefono
    FROM tbl_usuarios
    WHERE cedula = ? OR correo = ?
    LIMIT 1
  `;
  const [rows] = await connectionDB.query(sql, [user, user]);
  return rows[0] || null;
}

/// VERIFICAR EL TOKEN 

export function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ mensaje: "Token requerido" });
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) {
      return res.status(403).json({ mensaje: "Token inválido o expirado" });
    }

    req.user = userData; // guardamos los datos del token en la request
    next();
  });
}
//funcion de verificacion para el login
export async function getUsersLogin(user, pass) {
    const sql = `
    SELECT id, cedula, contrasena, nombre, correo, telefono
    FROM tbl_usuarios
    WHERE cedula = ?
    LIMIT 1
  `;

    const [rows] = await connectionDB.query(sql, [user]); // consulta preparada
    const usuario = rows[0];

    if (!usuario) return null;

    // Comparar contraseñas usando bcrypt
    const match = await bcrypt.compare(pass, usuario.contrasena);
    if (!match) return null;

    // Si coincide, eliminar la contraseña del resultado
    delete usuario.contrasena;
    return usuario;
}

// Crear nuevo usuario con contraseña encriptada
export async function addUsuario({ cedula, contrasena, nombre, correo, telefono }) {
  // Encriptar la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(contrasena, 10); // 10 = salt rounds

  const sql = `
    INSERT INTO tbl_usuarios (cedula, contrasena, nombre, correo, telefono)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connectionDB.query(sql, [cedula, hashedPassword, nombre, correo, telefono]);
  return result.insertId;
}
// Obtener usuario por ID
export async function getUsuarioById(id) {
  const [rows] = await connectionDB.query("SELECT * FROM tbl_usuarios WHERE id = ?", [id]);
  return rows[0];
}

/////actualizar datos de usuario// 
export async function updateUsuarioCompleto(id, { cedula, nombre, correo, telefono, nuevaContrasena }) {
  let sql, params;

  // Si se actualiza la contraseña
  if (nuevaContrasena) {
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    sql = `
      UPDATE tbl_usuarios
      SET cedula = ?, nombre = ?, correo = ?, telefono = ?, contrasena = ?
      WHERE id = ?
    `;
    params = [cedula, nombre, correo, telefono, hashedPassword, id];
  } else {
    // Si no se cambia la contraseña
    sql = `
      UPDATE tbl_usuarios
      SET cedula = ?, nombre = ?, correo = ?, telefono = ?
      WHERE id = ?
    `;
    params = [cedula, nombre, correo, telefono, id];
  }

  const [result] = await connectionDB.query(sql, params);
  return result.affectedRows;
}
// Eliminar usuario
export async function deleteUsuario(id) {
  const [result] = await connectionDB.query("DELETE FROM tbl_usuarios WHERE id = ?", [id]);
  return result.affectedRows;
}
////==============================CLIENTES ============================
// Insertar un cliente (relacionado a un usuario)
export async function addCliente({ usuario_id, cedula, nombre, telefono, direccion, correo }) {
  const sql = `
    INSERT INTO tbl_clientes (usuario_id, cedula, nombre, telefono, direccion, correo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await connectionDB.query(sql, [usuario_id, cedula, nombre, telefono, direccion, correo]);
  return result.insertId;
}
///obtener cliente segun el usuario
export async function getClientesByUsuario(usuario_id) {
  const sql = `
    SELECT id, usuario_id, cedula, nombre, telefono, direccion, correo
    FROM tbl_clientes
    WHERE usuario_id = ?
    ORDER BY nombre ASC
  `;
  const [rows] = await connectionDB.query(sql, [usuario_id]);
  return rows;
}
// Actualizar datos de un cliente
export async function updateCliente({ id, usuario_id, cedula, nombre, telefono, direccion, correo }) {
  try {
    // Validar que el cliente pertenece al usuario antes de actualizar
    const [existe] = await connectionDB.query(
      "SELECT * FROM tbl_clientes WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (existe.length === 0) {
      // No existe o no pertenece al usuario autenticado
      return { autorizado: false };
    }

    // Actualizar los datos del cliente
    const [result] = await connectionDB.query(
      `
      UPDATE tbl_clientes
      SET cedula = ?, nombre = ?, telefono = ?, direccion = ?, correo = ?
      WHERE id = ? AND usuario_id = ?
      `,
      [cedula, nombre, telefono, direccion, correo, id, usuario_id]
    );

    return {
      autorizado: true,
      filasAfectadas: result.affectedRows,
    };
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
}

// Eliminar cliente por ID Y SUS FACTURAS
export async function deleteCliente(id, usuario_id) {
  try {
    // Verificar que el cliente pertenece al usuario autenticado
    const [existe] = await connectionDB.query(
      "SELECT id FROM tbl_clientes WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (existe.length === 0) {
      // El cliente no existe o no pertenece al usuario
      return { eliminado: false, mensaje: "Cliente no encontrado o no autorizado" };
    }

    // Eliminar cliente (sus facturas y detalles se borran automáticamente)
    const [result] = await connectionDB.query(
      "DELETE FROM tbl_clientes WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (result.affectedRows > 0) {
      return { eliminado: true, mensaje: "Cliente y facturas asociadas eliminados correctamente" };
    } else {
      return { eliminado: false, mensaje: "No se pudo eliminar el cliente" };
    }

  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error; // Propagar el error para que el endpoint lo maneje
  }
}

// ====================== FACTURAS ======================
// Agregar factura con sus productos
export async function addFacturaCompleta({ usuario_id, cliente_id, items }) {
  const conn = await connectionDB.getConnection();

  try {
    await conn.beginTransaction();

    // Calcular total
    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

    // Crear factura
    const [facturaResult] = await conn.query(
      `INSERT INTO tbl_facturas (usuario_id, cliente_id, total) VALUES (?, ?, ?)`,
      [usuario_id, cliente_id, total]
    );

    const factura_id = facturaResult.insertId;

    // Insertar los productos
    for (const item of items) {
      await conn.query(
        `INSERT INTO tbl_factura_detalle (factura_id, producto_id, cantidad, precio)
         VALUES (?, ?, ?, ?)`,
        [factura_id, item.producto_id, item.cantidad, item.precio]
      );
    }

    await conn.commit();
    return factura_id;
  } catch (error) {
    await conn.rollback();
    console.error("Error al crear factura:", error);
    throw error;
  } finally {
    conn.release();
  }
}
// Obtener todas las facturas con sus productos
export async function getFacturasByUsuario(usuario_id) {
  const sql = `
    SELECT 
      f.id AS factura_id, 
      f.fecha, 
      f.total, 
      c.nombre AS cliente,
      c.cedula AS cliente_cedula,
      d.producto_id, 
      p.nombre AS producto, 
      d.cantidad, 
      d.precio, 
      (d.cantidad * d.precio) AS subtotal
    FROM tbl_facturas f
    JOIN tbl_clientes c ON f.cliente_id = c.id
    JOIN tbl_factura_detalle d ON d.factura_id = f.id
    JOIN tbl_productos p ON d.producto_id = p.id
    WHERE f.usuario_id = ?
    ORDER BY f.fecha DESC
  `;

  const [rows] = await connectionDB.query(sql, [usuario_id]);

  // Agrupar por factura_id
  const facturasMap = {};

  for (const row of rows) {
    if (!facturasMap[row.factura_id]) {
      facturasMap[row.factura_id] = {
        factura_id: row.factura_id,
        fecha: row.fecha,
        total: row.total,
        cliente: row.cliente,
        cliente_cedula: row.cliente_cedula, 
        productos: []
      };
    }

    facturasMap[row.factura_id].productos.push({
      producto_id: row.producto_id,
      nombre: row.producto,
      cantidad: row.cantidad,
      precio: row.precio,
      subtotal: row.subtotal
    });
  }

  return Object.values(facturasMap);
}
// Eliminar una factura (y sus detalles automáticamente por CASCADE)
export async function deleteFactura(id, usuario_id) {
  const [result] = await connectionDB.query(
    "DELETE FROM tbl_facturas WHERE id = ? AND usuario_id = ?",
    [id, usuario_id]
  );
  return result.affectedRows;
}

// ====================== PRODUCTOS ======================

// Obtener todos los productos de un usuario
export async function getProductosByUsuario(usuario_id) {
  try {
    const sql = `
      SELECT id, nombre, precio
      FROM tbl_productos
      WHERE usuario_id = ?
      ORDER BY nombre ASC
    `;
    const [rows] = await connectionDB.query(sql, [usuario_id]);
    return rows;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

// Agregar nuevo producto
export async function addProducto({ usuario_id, nombre, precio }) {
  try {
    const sql = `
      INSERT INTO tbl_productos (usuario_id, nombre, precio)
      VALUES (?, ?, ?)
    `;
    const [result] = await connectionDB.query(sql, [usuario_id, nombre, precio]);
    return result.insertId;
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw error;
  }
}

// Eliminar producto
export async function deleteProducto(id, usuario_id) {
  try {
    // Verificar que el producto pertenece al usuario
    const [existe] = await connectionDB.query(
      "SELECT id FROM tbl_productos WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (existe.length === 0) {
      return { eliminado: false, mensaje: "Producto no encontrado o no autorizado" };
    }

    // Eliminar el producto (facturas detalle se eliminarán automáticamente si hay cascada)
    const [result] = await connectionDB.query(
      "DELETE FROM tbl_productos WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (result.affectedRows > 0) {
      return { eliminado: true, mensaje: "Producto eliminado correctamente" };
    } else {
      return { eliminado: false, mensaje: "No se pudo eliminar el producto" };
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
}
///==================ACTIONS BOT=======================
// Buscar usuario por teléfono
export async function getUsuarioByTelefono(telefono) {
  const sql = `SELECT * FROM tbl_usuarios WHERE telefono = ? LIMIT 1`;
  const [rows] = await connectionDB.query(sql, [telefono]);
  return rows[0];
}

// Buscar cliente por nombre dentro de un usuario
export async function getClienteByNombre(nombre, usuario_id) {
  const sql = `
    SELECT * FROM tbl_clientes
    WHERE LOWER(nombre) = LOWER(?) AND usuario_id = ?
    LIMIT 1
  `;
  const [rows] = await connectionDB.query(sql, [nombre, usuario_id]);
  return rows[0];
}

//Buscar productos por una lista de nombres (de un usuario)
export async function getProductosByNombres(nombres, usuario_id) {
  if (!Array.isArray(nombres) || nombres.length === 0) {
    return [];
  }

  // Asegurar que todos los nombres son strings válidos
  const nombresLimpios = nombres.filter(n => typeof n === "string" && n.trim() !== "");

  if (nombresLimpios.length === 0) {
    console.warn("⚠️ No hay nombres válidos de productos para buscar.");
    return [];
  }

  const placeholders = nombresLimpios.map(() => "?").join(",");
  const sql = `
    SELECT id, nombre, precio 
    FROM tbl_productos 
    WHERE usuario_id = ? 
    AND LOWER(nombre) IN (${placeholders.map(() => "LOWER(?)").join(",")})
  `;
  const params = [usuario_id, ...nombresLimpios];
  
  const [rows] = await connectionDB.query(sql, params);
  return rows;
}
// BUSCAR PRODUCTO POR NOMBRE (TOLERANTE)
export async function getProductoByNombreTolerante(nombre, usuario_id) {
  try {
    const sql = `
      SELECT id, nombre, precio
      FROM tbl_productos
      WHERE usuario_id = ?
      AND LOWER(REPLACE(nombre, 'á', 'a')) LIKE CONCAT('%', REPLACE(LOWER(?), 'á', 'a'), '%')
      LIMIT 1
    `;
    const [rows] = await connectionDB.query(sql, [usuario_id, nombre]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error en getProductoByNombreTolerante:", error);
    return null;
  }
}
