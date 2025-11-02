-- --------------------------------------------------------
-- 📦 Base de datos: db_facturabot
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS db_facturabot 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_general_ci;
USE db_facturabot;

-- --------------------------------------------------------
-- 🧍 TABLA: tbl_usuarios
-- --------------------------------------------------------
CREATE TABLE tbl_usuarios (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  cedula_usuario VARCHAR(20) NOT NULL,
  contrasena_usuario VARCHAR(255) NOT NULL,
  nombre_usuario VARCHAR(100) NOT NULL,
  correo_usuario VARCHAR(100) NOT NULL,
  telefono_usuario VARCHAR(20) DEFAULT NULL,
  rol_usuario VARCHAR(50) DEFAULT 'usuario',
  estado_usuario TINYINT(1) DEFAULT 1,
  fecha_registro_usuario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY unique_cedula (cedula_usuario),
  UNIQUE KEY unique_correo (correo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO tbl_usuarios 
(cedula_usuario, contrasena_usuario, nombre_usuario, correo_usuario, telefono_usuario, rol_usuario, estado_usuario)
VALUES
('1065233368', 'clave_hash1', 'Juan David Toloza Ortega', 'juan.toloza@example.com', '3227093117', 'admin', 1),
('1002003004', 'clave_hash2', 'Tatiana Rojas', 'tatiana.rojas@example.com', '3154629997', 'usuario', 1),
('9988776655', 'clave_hash3', 'Carlos Mendoza', 'carlos.mendoza@example.com', '3124567890', 'usuario', 1);

-- --------------------------------------------------------
-- 🧾 TABLA: tbl_clientes
-- --------------------------------------------------------
CREATE TABLE tbl_clientes (
  id_cliente INT(11) NOT NULL AUTO_INCREMENT,
  usuario_id_cliente INT(11) NOT NULL,
  cedula_cliente VARCHAR(20) NOT NULL,
  digito_verificacion_cliente VARCHAR(2) DEFAULT NULL,
  nombre_cliente VARCHAR(100) NOT NULL,
  razon_social_cliente VARCHAR(150) DEFAULT NULL,
  nombre_comercial_cliente VARCHAR(150) DEFAULT NULL,
  telefono_cliente VARCHAR(20) DEFAULT NULL,
  direccion_cliente VARCHAR(255) DEFAULT NULL,
  correo_cliente VARCHAR(100) DEFAULT NULL,
  tipo_organizacion_id_cliente INT DEFAULT NULL,
  regimen_tributario_id_cliente INT DEFAULT NULL,
  tipo_documento_id_cliente INT DEFAULT NULL,
  municipio_id_cliente INT DEFAULT NULL,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY unique_cedula_cliente (cedula_cliente),
  KEY fk_cliente_usuario (usuario_id_cliente),
  CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id_cliente) REFERENCES tbl_usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO tbl_clientes 
(usuario_id_cliente, cedula_cliente, digito_verificacion_cliente, nombre_cliente, razon_social_cliente, nombre_comercial_cliente, telefono_cliente, direccion_cliente, correo_cliente, tipo_organizacion_id_cliente, regimen_tributario_id_cliente, tipo_documento_id_cliente, municipio_id_cliente)
VALUES
(1, '900123456', '1', 'Alan Turing', 'Alan Turing SAS', 'Turing Solutions', '3201112233', 'Calle 1 #2-68, Bogotá', 'alan.turing@turing.com', 2, 21, 3, 11001),
(1, '800987654', '3', 'Ada Lovelace', 'Lovelace Innovaciones', 'Lovelace AI', '3204445566', 'Carrera 10 #34-22, Cali', 'ada.lovelace@ai.com', 1, 21, 3, 76001),
(2, '1078945632', '5', 'Grace Hopper', 'Hopper Tech Ltda', 'Hopper Systems', '3115558899', 'Av. 68 #20-15, Medellín', 'grace.hopper@hopper.com', 2, 22, 3, 50001);

-- --------------------------------------------------------
-- 💰 TABLA: tbl_productos
-- --------------------------------------------------------
CREATE TABLE tbl_productos (
  id_producto INT(11) NOT NULL AUTO_INCREMENT,
  usuario_id_producto INT(11) NOT NULL,
  nombre_producto VARCHAR(100) NOT NULL,
  descripcion_producto TEXT DEFAULT NULL,
  codigo_producto VARCHAR(100) DEFAULT NULL,
  precio_producto DECIMAL(10,2) NOT NULL,
  unidad_medida_id_producto INT DEFAULT NULL,
  PRIMARY KEY (id_producto),
  KEY fk_producto_usuario (usuario_id_producto),
  CONSTRAINT fk_producto_usuario FOREIGN KEY (usuario_id_producto) REFERENCES tbl_usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO tbl_productos 
(usuario_id_producto, nombre_producto, descripcion_producto, codigo_producto, precio_producto, unidad_medida_id_producto)
VALUES
(1, 'Huevos AA caja x30', 'Caja de 30 huevos frescos categoría AA', 'P001', 28000.00, 70),
(1, 'Gallina ponedora Isa Brown', 'Ave lista para producción de huevos', 'P002', 45000.00, 70),
(1, 'Desinfectante avícola', 'Líquido desinfectante para galpones', 'P003', 18500.00, 70),
(2, 'Calcio aviar suplemento', 'Suplemento mineral para aves ponedoras', 'P004', 22000.00, 70),
(2, 'Bebedero plástico 10L', 'Recipiente plástico para agua de aves', 'P005', 25000.00, 70);

-- --------------------------------------------------------
-- 🧾 TABLA: tbl_facturas
-- --------------------------------------------------------
CREATE TABLE tbl_facturas (
  id_factura INT(11) NOT NULL AUTO_INCREMENT,
  usuario_id_factura INT(11) DEFAULT NULL,
  cliente_id_factura INT(11) DEFAULT NULL,
  total_factura DECIMAL(12,2) DEFAULT NULL,
  fecha_factura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacion_factura TEXT DEFAULT NULL,
  estado_factura VARCHAR(20) DEFAULT 'pendiente',
  PRIMARY KEY (id_factura),
  KEY fk_factura_usuario (usuario_id_factura),
  KEY fk_factura_cliente (cliente_id_factura),
  CONSTRAINT fk_factura_usuario FOREIGN KEY (usuario_id_factura) REFERENCES tbl_usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_factura_cliente FOREIGN KEY (cliente_id_factura) REFERENCES tbl_clientes (id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO tbl_facturas 
(usuario_id_factura, cliente_id_factura, total_factura, observacion_factura, estado_factura)
VALUES
(1, 1, 102000.00, 'Factura generada por venta directa', 'pagada'),
(1, 2, 198000.00, 'Factura con productos varios', 'pendiente'),
(2, 3, 500000.00, 'Factura por suministro de materiales', 'pagada');

-- --------------------------------------------------------
-- 🧩 TABLA: tbl_factura_detalle
-- --------------------------------------------------------
CREATE TABLE tbl_factura_detalle (
  id_detalle INT(11) NOT NULL AUTO_INCREMENT,
  factura_id_detalle INT(11) NOT NULL,
  producto_id_detalle INT(11) DEFAULT NULL,
  codigo_referencia_detalle VARCHAR(100) DEFAULT NULL,
  nombre_detalle VARCHAR(200) NOT NULL,
  cantidad_detalle DECIMAL(10,2) NOT NULL DEFAULT 1,
  precio_unitario_detalle DECIMAL(12,2) NOT NULL,
  descuento_porcentaje_detalle DECIMAL(5,2) DEFAULT 0.00,
  descuento_valor_detalle DECIMAL(12,2) GENERATED ALWAYS AS (precio_unitario_detalle * (descuento_porcentaje_detalle / 100)) STORED,
  subtotal_detalle DECIMAL(12,2) GENERATED ALWAYS AS (cantidad_detalle * (precio_unitario_detalle - descuento_valor_detalle)) STORED,
  impuesto_porcentaje_detalle DECIMAL(5,2) DEFAULT 19.00,
  impuesto_valor_detalle DECIMAL(12,2) GENERATED ALWAYS AS (subtotal_detalle * (impuesto_porcentaje_detalle / 100)) STORED,
  total_detalle DECIMAL(12,2) GENERATED ALWAYS AS (subtotal_detalle + impuesto_valor_detalle) STORED,
  unidad_medida_id_detalle INT DEFAULT NULL,
  tributo_id_detalle INT DEFAULT NULL,
  excluido_detalle TINYINT(1) DEFAULT 0,
  observacion_detalle TEXT DEFAULT NULL,
  PRIMARY KEY (id_detalle),
  KEY idx_factura_detalle (factura_id_detalle),
  CONSTRAINT fk_detalle_factura FOREIGN KEY (factura_id_detalle) REFERENCES tbl_facturas (id_factura) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id_detalle) REFERENCES tbl_productos (id_producto) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO tbl_factura_detalle 
(factura_id_detalle, producto_id_detalle, codigo_referencia_detalle, nombre_detalle, cantidad_detalle, precio_unitario_detalle, descuento_porcentaje_detalle, impuesto_porcentaje_detalle, unidad_medida_id_detalle, tributo_id_detalle, excluido_detalle, observacion_detalle)
VALUES
(1, 1, 'P001', 'Huevos AA caja x30', 2, 28000, 0, 19, 70, 1, 0, 'Venta regular con IVA'),
(1, 3, 'P003', 'Desinfectante avícola', 1, 18500, 0, 19, 70, 1, 0, 'Producto higiénico'),
(2, 2, 'P002', 'Gallina ponedora Isa Brown', 3, 45000, 5, 19, 70, 1, 0, 'Descuento por volumen'),
(2, 4, 'P004', 'Calcio aviar suplemento', 2, 22000, 0, 0, 70, 1, 1, 'Exento de IVA'),
(3, 5, 'P005', 'Bebedero plástico 10L', 10, 25000, 10, 19, 70, 1, 0, 'Venta con descuento especial');

CREATE TABLE tbl_factura_archivos (
  id_archivo INT AUTO_INCREMENT PRIMARY KEY,
  factura_id INT NOT NULL,
  tipo_archivo ENUM('PDF', 'XML') NOT NULL,
  url_archivo VARCHAR(500) DEFAULT NULL,
  contenido_base64 LONGTEXT DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_archivo_factura FOREIGN KEY (factura_id) REFERENCES tbl_facturas(id_factura) ON DELETE CASCADE
);
COMMIT;