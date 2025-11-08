-- --------------------------------------------------------
-- 📦 Base de datos: db_facturabot
-- --------------------------------------------------------

-- --------------------------------------------------------
-- Tabla tbl_usuarios
-- --------------------------------------------------------
CREATE TABLE tbl_usuarios (
  id_usuario int(11) NOT NULL AUTO_INCREMENT,
  cedula_usuario varchar(20) NOT NULL,
  contrasena_usuario varchar(255) NOT NULL,
  nombre_usuario varchar(100) NOT NULL,
  correo_usuario varchar(100) NOT NULL,
  telefono_usuario varchar(20) DEFAULT NULL,
  direccion_usuario varchar(255) DEFAULT NULL,
  municipio_id_usuario int(11) NOT NULL,
  rol_usuario varchar(50) DEFAULT 'usuario',
  estado_usuario tinyint(1) DEFAULT 1,
  fecha_registro_usuario timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_usuario),
  UNIQUE KEY unique_cedula (cedula_usuario),
  UNIQUE KEY unique_correo (correo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabla tbl_clientes
-- --------------------------------------------------------
CREATE TABLE tbl_clientes (
  id_cliente int(11) NOT NULL AUTO_INCREMENT,
  usuario_id_cliente int(11) NOT NULL,
  cedula_cliente varchar(20) NOT NULL,
  digito_verificacion_cliente varchar(2) DEFAULT NULL,
  nombre_cliente varchar(100) NOT NULL,
  razon_social_cliente varchar(150) DEFAULT NULL,
  nombre_comercial_cliente varchar(150) DEFAULT NULL,
  telefono_cliente varchar(20) DEFAULT NULL,
  direccion_cliente varchar(255) DEFAULT NULL,
  correo_cliente varchar(100) DEFAULT NULL,
  tipo_organizacion_id_cliente int(11) DEFAULT NULL,
  regimen_tributario_id_cliente int(11) DEFAULT NULL,
  tipo_documento_id_cliente int(11) DEFAULT NULL,
  municipio_id_cliente int(11) NOT NULL,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY unique_cedula_cliente (cedula_cliente),
  KEY fk_cliente_usuario (usuario_id_cliente),
  CONSTRAINT fk_cliente_usuario FOREIGN KEY (usuario_id_cliente) REFERENCES tbl_usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabla tbl_productos
-- --------------------------------------------------------
CREATE TABLE tbl_productos (
  id_producto int(11) NOT NULL AUTO_INCREMENT,
  usuario_id_producto int(11) NOT NULL,
  nombre_producto varchar(100) NOT NULL,
  descripcion_producto text DEFAULT NULL,
  codigo_producto varchar(100) DEFAULT NULL,
  precio_producto decimal(10,2) NOT NULL,
  unidad_medida_id_producto int(11) DEFAULT 70,
  PRIMARY KEY (id_producto),
  KEY fk_producto_usuario (usuario_id_producto),
  CONSTRAINT fk_producto_usuario FOREIGN KEY (usuario_id_producto) REFERENCES tbl_usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabla tbl_facturas
-- --------------------------------------------------------
CREATE TABLE tbl_facturas (
  id_factura int(11) NOT NULL AUTO_INCREMENT,
  usuario_id_factura int(11) DEFAULT NULL,
  cliente_id_factura int(11) DEFAULT NULL,
  total_factura decimal(12,2) DEFAULT NULL,
  fecha_factura timestamp NOT NULL DEFAULT current_timestamp(),
  observacion_factura text DEFAULT NULL,
  estado_factura varchar(20) DEFAULT 'pendiente',
  PRIMARY KEY (id_factura),
  KEY fk_factura_usuario (usuario_id_factura),
  KEY fk_factura_cliente (cliente_id_factura),
  CONSTRAINT fk_factura_usuario FOREIGN KEY (usuario_id_factura) REFERENCES tbl_usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_factura_cliente FOREIGN KEY (cliente_id_factura) REFERENCES tbl_clientes (id_cliente) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabla tbl_factura_archivos
-- --------------------------------------------------------
CREATE TABLE tbl_factura_archivos (
  id_archivo int(11) NOT NULL AUTO_INCREMENT,
  factura_id int(11) NOT NULL,
  tipo_archivo enum('PDF','XML') NOT NULL,
  url_archivo varchar(500) DEFAULT NULL,
  contenido_base64 longtext DEFAULT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_archivo),
  KEY fk_archivo_factura (factura_id),
  CONSTRAINT fk_archivo_factura FOREIGN KEY (factura_id) REFERENCES tbl_facturas (id_factura) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabla tbl_factura_detalle
-- --------------------------------------------------------
CREATE TABLE tbl_factura_detalle (
  id_detalle int(11) NOT NULL AUTO_INCREMENT,
  factura_id_detalle int(11) NOT NULL,
  producto_id_detalle int(11) DEFAULT NULL,
  codigo_referencia_detalle varchar(100) DEFAULT NULL,
  nombre_detalle varchar(200) NOT NULL,
  cantidad_detalle decimal(10,2) NOT NULL DEFAULT 1.00,
  precio_unitario_detalle decimal(12,2) NOT NULL,
  descuento_porcentaje_detalle decimal(5,2) DEFAULT 0.00,
  descuento_valor_detalle decimal(12,2) GENERATED ALWAYS AS (precio_unitario_detalle * (descuento_porcentaje_detalle / 100)) STORED,
  subtotal_detalle decimal(12,2) GENERATED ALWAYS AS (cantidad_detalle * (precio_unitario_detalle - descuento_valor_detalle)) STORED,
  impuesto_porcentaje_detalle decimal(5,2) DEFAULT 19.00,
  impuesto_valor_detalle decimal(12,2) GENERATED ALWAYS AS (subtotal_detalle * (impuesto_porcentaje_detalle / 100)) STORED,
  total_detalle decimal(12,2) GENERATED ALWAYS AS (subtotal_detalle + impuesto_valor_detalle) STORED,
  unidad_medida_id_detalle int(11) DEFAULT NULL,
  tributo_id_detalle int(11) DEFAULT NULL,
  excluido_detalle tinyint(1) DEFAULT 0,
  observacion_detalle text DEFAULT NULL,
  PRIMARY KEY (id_detalle),
  KEY idx_factura_detalle (factura_id_detalle),
  KEY fk_detalle_producto (producto_id_detalle),
  CONSTRAINT fk_detalle_factura FOREIGN KEY (factura_id_detalle) REFERENCES tbl_facturas (id_factura) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id_detalle) REFERENCES tbl_productos (id_producto) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
