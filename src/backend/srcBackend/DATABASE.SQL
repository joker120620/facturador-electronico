-- ============================================
-- CREAR BASE DE DATOS COMPLETA: FACTURABOT
-- ============================================

-- 1️⃣ Crear la base de datos
CREATE DATABASE IF NOT EXISTS DB_FACTURABOT
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

-- 2️⃣ Usar la base de datos
USE DB_FACTURABOT;

-- ============================================
-- 3️⃣ CREAR TABLAS
-- ============================================

-- Eliminar tablas si ya existen (opcional)
DROP TABLE IF EXISTS tbl_facturas;
DROP TABLE IF EXISTS tbl_productos;
DROP TABLE IF EXISTS tbl_clientes;
DROP TABLE IF EXISTS tbl_usuarios;

-- ===============================
-- TABLA USUARIOS
-- ===============================
CREATE TABLE tbl_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(20)
) ENGINE=InnoDB;

-- ===============================
-- TABLA CLIENTES
-- ===============================
CREATE TABLE tbl_clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  correo VARCHAR(100),
  FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===============================
-- TABLA PRODUCTOS
-- ===============================
CREATE TABLE tbl_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===============================
-- TABLA FACTURAS
-- ===============================
CREATE TABLE tbl_facturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,     -- vendedor
  cliente_id INT NOT NULL,     -- cliente
  producto_id INT NOT NULL,    -- producto vendido
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  cantidad INT DEFAULT 1,
  total DECIMAL(10,2),
  FOREIGN KEY (usuario_id) REFERENCES tbl_usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES tbl_clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES tbl_productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 4️⃣ CREAR ÍNDICES (opcional)
-- ============================================
CREATE INDEX idx_usuarios_correo ON tbl_usuarios(correo);
CREATE INDEX idx_clientes_nombre ON tbl_clientes(nombre);
CREATE INDEX idx_productos_nombre ON tbl_productos(nombre);
CREATE INDEX idx_facturas_fecha ON tbl_facturas(fecha);

-- ============================================
-- 5️⃣ INSERTAR DATOS DE EJEMPLO
-- ============================================
INSERT INTO tbl_usuarios (cedula, contrasena, nombre, correo, telefono)
VALUES 
('123456789', '1234', 'Administrador', 'admin@empresa.com', '555-1234'),
('987654321', '4321', 'María Gómez', 'maria@empresa.com', '555-5678');

INSERT INTO tbl_clientes (usuario_id, cedula, nombre, telefono, direccion, correo)
VALUES 
(1, '100200300', 'Juan Pérez', '555-9999', 'Calle 45 #12-09, Bogotá', 'juanperez@mail.com'),
(1, '555888999', 'Tatiana Rojas', '555-1212', 'Carrera 10 #34-22, Medellín', 'tatiana@empresa.com'),
(1, '777222333', 'Carlos Mendoza', '555-8989', 'Carrera 10 #34-22, Medellín', 'carlos.mendoza@correo.com'),
(1, '444999888', 'Laura Gutiérrez', '555-7878', 'Avenida 68 #20-15, Cali', 'laura.gutierrez@mail.com'),
(1, '333666555', 'Andrés Ramírez', '555-3434', 'Calle 72 #14-08, Barranquilla', 'andres.ramirez@empresa.com'),
(1, '999111222', 'Mariana Torres', '555-6767', 'Carrera 8 #55-23, Bucaramanga', 'mariana.torres@mail.com');

INSERT INTO tbl_productos (usuario_id, nombre, precio)
VALUES 
(1, 'Computador portátil', 1200.00),
(1, 'Mouse inalámbrico', 25.50),
(2, 'Teclado mecánico', 45.00);

INSERT INTO tbl_facturas (usuario_id, cliente_id, producto_id, cantidad, total)
VALUES 
(1, 1, 1, 1, 1200.00),
(1, 1, 2, 2, 51.00);
