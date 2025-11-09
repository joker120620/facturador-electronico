import { connectionDB } from "./conectDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// Obtener todos los usuarios
export async function getUsuarios() {
  const [rows] = await connectionDB.query("SELECT * FROM tbl_usuarios");
  return rows;
}

// BUSCAR USUARIO POR CEDULA O CORREO 
export async function getUsuarioByCedulaOCorreo(user) {
  const sql = `
    SELECT id_usuario, cedula_usuario, nombre_usuario, correo_usuario, telefono_usuario
    FROM tbl_usuarios
    WHERE cedula_usuario = ? OR correo_usuario = ?
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
    return res.status(403).json({ status: 403, mensaje: "Token requerido" });
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if (err) {
      return res.status(403).json({ status: 403, mensaje: "Token inválido o expirado" });
    }

    req.user = userData; // guardamos los datos del token en la request
    next();
  });
}

//funcion de verificacion para el login
export async function getUsersLogin(user, pass) {
  const sql = `
    SELECT id_usuario, cedula_usuario, contrasena_usuario, nombre_usuario, correo_usuario, telefono_usuario
    FROM tbl_usuarios
    WHERE cedula_usuario = ?
    LIMIT 1
  `;

  const [rows] = await connectionDB.query(sql, [user]); // consulta preparada
  const usuario = rows[0];

  if (!usuario) return null;

  // Comparar contraseñas usando bcrypt
  const match = await bcrypt.compare(pass, usuario.contrasena_usuario);
  if (!match) return null;

  // Si coincide, eliminar la contraseña del resultado
  delete usuario.contrasena_usuario;
  return usuario;
}

// Crear nuevo usuario con contraseña encriptada
export async function addUsuario({ cedula, contrasena, nombre, correo, telefono, direccion, rol = "usuario" , municipio_id}) {
  // Encriptar la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(contrasena, 10); // 10 = salt rounds

  const sql = `
    INSERT INTO tbl_usuarios (cedula_usuario, contrasena_usuario, nombre_usuario, correo_usuario, telefono_usuario, direccion_usuario, rol_usuario , municipio_id_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connectionDB.query(sql, [cedula, hashedPassword, nombre, correo, telefono, direccion, rol , municipio_id]);
  return result.insertId;
}
// Obtener usuario por ID
export async function getUsuarioById(id) {
  const [rows] = await connectionDB.query("SELECT * FROM tbl_usuarios WHERE id_usuario = ?", [id]);
  return rows[0];
}

/////actualizar datos de usuario// 
export async function updateUsuarioCompleto(id, { cedula, nombre, correo, telefono, nuevaContrasena , municipio_id}) {
  let sql, params;

  // Si se actualiza la contraseña
  if (nuevaContrasena) {
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    sql = `
      UPDATE tbl_usuarios
      SET cedula_usuario = ?, nombre_usuario = ?, correo_usuario = ?, telefono_usuario = ?, contrasena_usuario = ? , municipio_id_usuario = ?
      WHERE id_usuario = ?
    `;
    params = [cedula, nombre, correo, telefono, hashedPassword, municipio_id, id];
  } else {
    // Si no se cambia la contraseña
    sql = `
      UPDATE tbl_usuarios
      SET cedula_usuario = ?, nombre_usuario = ?, correo_usuario = ?, telefono_usuario = ?, municipio_id_usuario = ?
      WHERE id_usuario = ?
    `;
    params = [cedula, nombre, correo, telefono, municipio_id, id];
  }

  const [result] = await connectionDB.query(sql, params);
  return result.affectedRows;
}
// Eliminar usuario
export async function deleteUsuario(id) {
  const [result] = await connectionDB.query("DELETE FROM tbl_usuarios WHERE id_usuario = ?", [id]);
  return result.affectedRows;
}
////==============================CLIENTES ============================
// Insertar un cliente (relacionado a un usuario)
export async function addCliente({
  usuario_id,
  cedula,
  digito_verificacion = null,
  nombre,
  razon_social = null,
  nombre_comercial = null,
  telefono = null,
  direccion = null,
  correo = null,
  tipo_organizacion_id = null,
  regimen_tributario_id = null,
  tipo_documento_id = null,
  municipio_id = null
}) {
  const sql = `
    INSERT INTO tbl_clientes (
      usuario_id_cliente,
      cedula_cliente,
      digito_verificacion_cliente,
      nombre_cliente,
      razon_social_cliente,
      nombre_comercial_cliente,
      telefono_cliente,
      direccion_cliente,
      correo_cliente,
      tipo_organizacion_id_cliente,
      regimen_tributario_id_cliente,
      tipo_documento_id_cliente,
      municipio_id_cliente
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await connectionDB.query(sql, [
    usuario_id,
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
  ]);
  return result.insertId;
}
///obtener cliente segun el usuario
export async function getClientesByUsuario(usuario_id) {
  const sql = `
    SELECT * FROM tbl_clientes
    WHERE usuario_id_cliente = ?
    ORDER BY nombre_cliente ASC
  `;
  const [rows] = await connectionDB.query(sql, [usuario_id]);
  return rows;
}
// Actualizar datos de un cliente
export async function updateCliente({ id_cliente, usuario_id, cedula_cliente, digito_verificacion_cliente = "", nombre_cliente, razon_social_cliente = "", nombre_comercial_cliente = "", telefono_cliente , direccion_cliente , correo_cliente , tipo_organizacion_id_cliente, regimen_tributario_id_cliente , tipo_documento_id_cliente , municipio_id_cliente }) {
  try {
    // Validar que el cliente pertenece al usuario antes de actualizar
    const [existe] = await connectionDB.query(
      "SELECT * FROM tbl_clientes WHERE id_cliente = ? AND usuario_id_cliente = ?",
      [id_cliente, usuario_id]
    );
    console.log(id_cliente +" : " + usuario_id)
    console.log(existe)

    if (existe.length === 0) {
      // No existe o no pertenece al usuario autenticado
      return { autorizado: false };
    }

    // Actualizar los datos del cliente
    const [result] = await connectionDB.query(
      `
      UPDATE tbl_clientes
      SET cedula_cliente = ?, digito_verificacion_cliente = ?, nombre_cliente = ?, razon_social_cliente = ?, nombre_comercial_cliente = ?, telefono_cliente = ?, direccion_cliente = ?, correo_cliente = ?, tipo_organizacion_id_cliente = ?, regimen_tributario_id_cliente = ?, tipo_documento_id_cliente = ?, municipio_id_cliente = ?
      WHERE id_cliente = ? AND usuario_id_cliente = ?
      `,
      [cedula_cliente, digito_verificacion_cliente, nombre_cliente, razon_social_cliente, nombre_comercial_cliente, telefono_cliente, direccion_cliente, correo_cliente, tipo_organizacion_id_cliente, regimen_tributario_id_cliente, tipo_documento_id_cliente, municipio_id_cliente, id_cliente, usuario_id]
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
      "SELECT id_cliente FROM tbl_clientes WHERE id_cliente = ? AND usuario_id_cliente = ?",
      [id, usuario_id]
    );

    if (existe.length === 0) {
      // El cliente no existe o no pertenece al usuario
      return { eliminado: false, mensaje: "Cliente no encontrado o no autorizado" };
    }

    // Eliminar cliente (sus facturas y detalles se borran automáticamente)
    const [result] = await connectionDB.query(
      "DELETE FROM tbl_clientes WHERE id_cliente = ? AND usuario_id_cliente = ?",
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

    // Calcular total (usando campos de detalle: precio_unitario_detalle y cantidad_detalle si existen)
    const total = items.reduce((acc, i) => {
      const precio = i.precio_unitario_detalle ?? i.precio ?? 0;
      const cantidad = i.cantidad_detalle ?? i.cantidad ?? 0;
      const descuentoPct = i.descuento_porcentaje_detalle ?? i.descuento ?? 0;
      const subtotal = cantidad * precio * (1 - (descuentoPct / 100));
      const impuestoPct = i.impuesto_porcentaje_detalle ?? i.impuesto ?? 0;
      const impuesto = subtotal * (impuestoPct / 100);
      return acc + subtotal + impuesto;
    }, 0);

    // Crear factura
    const [facturaResult] = await conn.query(
      `INSERT INTO tbl_facturas (usuario_id_factura, cliente_id_factura, total_factura) VALUES (?, ?, ?)`,
      [usuario_id, cliente_id, total]
    );

    const factura_id = facturaResult.insertId;

    // Insertar los productos en tbl_factura_detalle
    for (const item of items) {
      const producto_id = item.producto_id_detalle ?? item.producto_id ?? null;
      const codigo_referencia = item.codigo_referencia_detalle ?? item.sku_producto ?? item.codigo_producto ?? null;
      const nombre_detalle = item.nombre_detalle ?? item.nombre ?? item.nombre_producto ?? null;
      const cantidad = item.cantidad_detalle ?? item.cantidad ?? 0;
      const precio_unitario = item.precio_unitario_detalle ?? item.precio ?? 0;
      const descuento_porcentaje = item.descuento_porcentaje_detalle ?? item.descuento ?? 0;
      const impuesto_porcentaje = item.impuesto_porcentaje_detalle ?? item.impuesto ?? 0;
      const unidad_medida = item.unidad_medida_id_detalle ?? item.unidad_medida ?? null;
      const tributo = item.tributo_id_detalle ?? item.tributo_id ?? null;
      const excluido = item.excluido_detalle ?? item.excluido ?? 0;
      const observacion = item.observacion_detalle ?? item.observacion ?? null;

      await conn.query(
        `INSERT INTO tbl_factura_detalle (
          factura_id_detalle,
          producto_id_detalle,
          codigo_referencia_detalle,
          nombre_detalle,
          cantidad_detalle,
          precio_unitario_detalle,
          descuento_porcentaje_detalle,
          impuesto_porcentaje_detalle,
          unidad_medida_id_detalle,
          tributo_id_detalle,
          excluido_detalle,
          observacion_detalle
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          factura_id,
          producto_id,
          codigo_referencia,
          nombre_detalle,
          cantidad,
          precio_unitario,
          descuento_porcentaje,
          impuesto_porcentaje,
          unidad_medida,
          tributo,
          excluido,
          observacion
        ]
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
      f.id_factura AS factura_id, 
      f.fecha_factura AS fecha, 
      f.total_factura AS total, 
      c.nombre_cliente AS cliente,
      c.cedula_cliente AS cliente_cedula,
      d.producto_id_detalle AS producto_id, 
      COALESCE(p.nombre_producto, d.nombre_detalle) AS producto, 
      d.cantidad_detalle AS cantidad, 
      COALESCE(d.precio_unitario_detalle, d.precio_unitario_detalle) AS precio, 
      (d.cantidad_detalle * COALESCE(d.precio_unitario_detalle, 0)) AS subtotal
    FROM tbl_facturas f
    JOIN tbl_clientes c ON f.cliente_id_factura = c.id_cliente
    JOIN tbl_factura_detalle d ON d.factura_id_detalle = f.id_factura
    LEFT JOIN tbl_productos p ON d.producto_id_detalle = p.id_producto
    WHERE f.usuario_id_factura = ?
    ORDER BY f.fecha_factura DESC
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
    "DELETE FROM tbl_facturas WHERE id_factura = ? AND usuario_id_factura = ?",
    [id, usuario_id]
  );
  return result.affectedRows;
}

// ====================== PRODUCTOS ======================

// Obtener todos los productos de un usuario
export async function getProductosByUsuario(usuario_id) {
  try {
    const sql = `
      SELECT id_producto AS id, nombre_producto AS nombre, precio_producto AS precio, codigo_producto
      FROM tbl_productos
      WHERE usuario_id_producto = ?
      ORDER BY nombre_producto ASC
    `;
    const [rows] = await connectionDB.query(sql, [usuario_id]);
    return rows;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

// Agregar nuevo producto
export async function addProducto({ usuario_id_producto, nombre_producto, descripcion_producto = null, precio_producto }) {
  try {
    // Insertar sin el código
    const sqlInsert = `
      INSERT INTO tbl_productos 
      (usuario_id_producto, nombre_producto, descripcion_producto, precio_producto)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await connectionDB.query(sqlInsert, [usuario_id_producto, nombre_producto, descripcion_producto, precio_producto]);

    const nuevoId = result.insertId;

    // Generar código basado en el ID (4 dígitos)
    const codigo = `P${String(nuevoId).padStart(4, '0')}`;

    // Actualizar el producto con el código
    const sqlUpdate = `
      UPDATE tbl_productos
      SET codigo_producto = ?
      WHERE id_producto = ?
    `;
    await connectionDB.query(sqlUpdate, [codigo, nuevoId]);
    return nuevoId;
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
      "SELECT id_producto FROM tbl_productos WHERE id_producto = ? AND usuario_id_producto = ?",
      [id, usuario_id]
    );

    if (existe.length === 0) {
      return { eliminado: false, mensaje: "Producto no encontrado o no autorizado" };
    }

    // Eliminar el producto (facturas detalle se eliminarán automáticamente si hay cascada)
    const [result] = await connectionDB.query(
      "DELETE FROM tbl_productos WHERE id_producto = ? AND usuario_id_producto = ?",
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
  const sql = `SELECT * FROM tbl_usuarios WHERE telefono_usuario = ? LIMIT 1`;
  const [rows] = await connectionDB.query(sql, [telefono]);
  return rows[0];
}

// Buscar cliente por nombre dentro de un usuario
export async function getClienteByNombre(nombre, usuario_id) {
  const sql = `
    SELECT * FROM tbl_clientes
    WHERE LOWER(nombre_cliente) = LOWER(?) AND usuario_id_cliente = ?
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
    console.warn("No hay nombres válidos de productos para buscar.");
    return [];
  }

  const placeholders = nombresLimpios.map(() => "?").join(",");
  const lowerPlaceholders = nombresLimpios.map(() => "LOWER(?)").join(",");
  const sql = `
    SELECT id_producto AS id, nombre_producto AS nombre, precio_producto AS precio, codigo_producto
    FROM tbl_productos 
    WHERE usuario_id_producto = ? 
    AND LOWER(nombre_producto) IN (${lowerPlaceholders})
  `;
  const params = [usuario_id, ...nombresLimpios.map(n => n.toLowerCase())];
  
  const [rows] = await connectionDB.query(sql, params);
  return rows;
}
// BUSCAR PRODUCTO POR NOMBRE (TOLERANTE)
export async function getProductoByNombreTolerante(nombre, usuario_id) {
  try {
    const sql = `
      SELECT id_producto AS id, nombre_producto AS nombre, precio_producto AS precio
      FROM tbl_productos
      WHERE usuario_id_producto = ?
      AND LOWER(REPLACE(nombre_producto, 'á', 'a')) LIKE CONCAT('%', REPLACE(LOWER(?), 'á', 'a'), '%')
      LIMIT 1
    `;
    const [rows] = await connectionDB.query(sql, [usuario_id, nombre]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error en getProductoByNombreTolerante:", error);
    return null;
  }
}
//====================GET FILE PDF ==========================
export async function getFilePdfDatabase(id_usuario, id_factura) {
  try {
      const sql = `SELECT 
    a.id_archivo,
    a.factura_id,
    a.tipo_archivo,
    a.url_archivo,
    a.contenido_base64,
    a.fecha_creacion,
    c.nombre_cliente
FROM tbl_factura_archivos AS a
INNER JOIN tbl_facturas AS f 
    ON f.id_factura = a.factura_id
INNER JOIN tbl_clientes AS c 
    ON c.id_cliente = f.cliente_id_factura
WHERE a.factura_id = ? 
  AND f.usuario_id_factura = ?`
  const [facturaRows] = await connectionDB.query(sql,  [id_factura , id_usuario]);
    if (facturaRows.length === 0) return undefined;
    const factura = facturaRows[0];
    return factura
    
  } catch (error) {
    console.error("Error al obtener factura pdf", error);
    throw error;

    
  }
  
  
}
// ====================== FACTUS API ======================
export async function generarFacturaElectronicaByIdFactura(id_factura) {
  try {
    const sql = `
      SELECT 
        f.id_factura,
        f.total_factura,
        f.fecha_factura,
        f.observacion_factura,
        u.nombre_usuario,
        u.telefono_usuario,
        u.correo_usuario,
        u.direccion_usuario,
        u.municipio_id_usuario,
        c.id_cliente,
        c.cedula_cliente,
        c.digito_verificacion_cliente,
        c.nombre_cliente,
        c.razon_social_cliente,
        c.nombre_comercial_cliente,
        c.telefono_cliente,
        c.direccion_cliente,
        c.correo_cliente,
        c.tipo_organizacion_id_cliente,
        c.regimen_tributario_id_cliente,
        c.tipo_documento_id_cliente,
        c.municipio_id_cliente
      FROM tbl_facturas f
      JOIN tbl_clientes c ON f.cliente_id_factura = c.id_cliente
      JOIN tbl_usuarios u ON f.usuario_id_factura = u.id_usuario
      WHERE f.id_factura = ?
      LIMIT 1
    `;
    const [facturaRows] = await connectionDB.query(sql, [id_factura]);
    if (facturaRows.length === 0) throw new Error("Factura no encontrada");
    const factura = facturaRows[0];

    // Obtener productos
    const [itemsRows] = await connectionDB.query(
      `SELECT 
        codigo_referencia_detalle AS code_reference,
        nombre_detalle AS name,
        cantidad_detalle AS quantity,
        precio_unitario_detalle AS price,
        descuento_porcentaje_detalle AS discount_rate,
        impuesto_porcentaje_detalle AS tax_rate,
        unidad_medida_id_detalle AS unit_measure_id,
        tributo_id_detalle AS tribute_id,
        excluido_detalle AS is_excluded,
        observacion_detalle AS note
      FROM tbl_factura_detalle
      WHERE factura_id_detalle = ?`,
      [id_factura]
    );

    // Fechas ajustadas
    const hoy = new Date();
    const ayer = new Date();
    const mañana = new Date();
    ayer.setDate(hoy.getDate() - 1);
    mañana.setDate(hoy.getDate() + 1);

    const formatoFecha = (fecha) => fecha.toISOString().split("T")[0];

    // Payload para Factus
    const payload = {
      numbering_range: {
        prefix: "FAC",
        from: 900000000,
        to: 999999999,
        resolution_number: "18760000001",
        start_date: "2019-01-19",
        end_date: "2030-01-19"
      },
      reference_code: `FAC-${id_factura}`,
      observation: factura.observacion_factura || "Factura generada automáticamente desde db_facturabot",
      payment_form: "1", // Contado
      payment_due_date: formatoFecha(hoy),
      payment_method_code: "10", // Efectivo
      operation_type: 10,
      send_email: false,
      order_reference: {
        reference_code: `ORD-${id_factura}`,
        issue_date: formatoFecha(ayer) // ✅ día anterior
      },
      billing_period: {
        start_date: formatoFecha(hoy),
        start_time: "00:00:00",
        end_date: formatoFecha(mañana),
        end_time: "23:59:59"
      },
      establishment: {
        name: factura.nombre_usuario,
        address: factura.direccion_usuario || "Sin dirección",
        phone_number: factura.telefono_usuario,
        email: factura.correo_usuario,
        municipality_id: factura.municipio_id_usuario || 980
      },
      customer: {
        identification: factura.cedula_cliente,
        dv: factura.digito_verificacion_cliente,
        company: factura.razon_social_cliente,
        trade_name: factura.nombre_comercial_cliente,
        names: factura.nombre_cliente,
        address: factura.direccion_cliente,
        email: factura.correo_cliente,
        phone: factura.telefono_cliente,
        legal_organization_id: factura.tipo_organizacion_id_cliente,
        tribute_id: factura.regimen_tributario_id_cliente,
        identification_document_id: factura.tipo_documento_id_cliente,
        municipality_id: factura.municipio_id_cliente || 980
      },
      items: itemsRows.map(item => ({
        scheme_id: "1",
        note: item.note || "",
        code_reference: item.code_reference || `P-${id_factura}-${Math.floor(Math.random() * 9999)}`, // evita error de campo obligatorio
        name: item.name,
        quantity: Number(item.quantity),
        discount_rate: Number(item.discount_rate) || 0,
        price: Number(item.price),
        tax_rate: String(item.tax_rate || "19.00"),
        unit_measure_id: item.unit_measure_id || 70,
        standard_code_id: 1,
        is_excluded: item.is_excluded || 0,
        tribute_id: item.tribute_id || 1,
        withholding_taxes: []
      }))
    };

    return payload;
  } catch (error) {
    console.error("Error generando factura electrónica:", error);
    throw error;
  }
}

////ENVIAR FACTURA A FACTUS


export async function enviarFacturaFactus(facturaPayload, factura_id, token) {
  try {
    const url = process.env.HOST_API_FACTUS;

    const res = await fetch(`${url}/v1/bills/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(facturaPayload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Error al enviar factura: ${JSON.stringify(data)}`);
    const peticion = await fetch(`${url}/v1/bills/download-pdf/${data.data.bill.number}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const peticionPdf = await peticion.json();
    if(!peticionPdf){
       console.error("Error en enviar FacturaFactus:");
    }
    const pdfBase64 = peticionPdf.data.pdf_base_64_encoded;
    console.log("========================================================")
    console.log(pdfBase64.substring(0, 100));
    const guardarArchivo = await connectionDB.query(
      `INSERT INTO tbl_factura_archivos (factura_id, tipo_archivo, contenido_base64)
           VALUES (?, ?, ?)`,
      [factura_id, "PDF", pdfBase64]
    );
    console.log("----------------------------------------peticion")
    console.log(guardarArchivo)
    console.log("----------------------------------------pdf")
    console.log(pdfBase64)

    //  Retornar el link del PDF para enviar por WhatsApp
    return {
      exito: true,
      mensaje: "Factura enviada correctamente a Factus",
      pdf_base: pdfBase64
    };
  } catch (error) {
    console.error("Error en enviar FacturaFactus:", error);
    return {
      exito: false,
      mensaje: "Error al enviar factura a Factus",
      error: error.message
    };
  }
}