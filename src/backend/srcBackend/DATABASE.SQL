-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Base de datos: `db_facturabot`
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `db_facturabot` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `db_facturabot`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_clientes`
--

CREATE TABLE `tbl_clientes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_clientes`
--

INSERT INTO `tbl_clientes` (`id`, `usuario_id`, `cedula`, `nombre`, `telefono`, `direccion`, `correo`) VALUES
(19, 5, '9991153451222', 'Mari5345345ana Torres', '555345345-6767', 'Car545345rera 8 #55-23, Bucaramanga', 'maria5345345na.torres@mail.com'),
(21, 3, '333666555', 'Andrés Ramírez', '555-3434', 'Calle 72 #14-08, Barranquilla', 'andres.ramirez@empresa.com'),
(22, 5, '444999888', 'Laura Gutiérrez', '555-7878', 'Avenida 68 #20-15, Cali', 'laura.gutierrez@mail.com'),
(23, 3, '777222333', 'Carlos Mendoza', '555-8989', 'Carrera 10 #34-22, Medellín', 'carlos.mendoza@correo.com'),
(24, 5, '555888999', 'Tatiana Rojas', '555-1212', 'Calle 45 #12-09, Bogotá', 'tatiana@empresa.com'),
(34, 6, '555555', 'pa', '33333333333', 'Avenida 68 #20-15, Cali', 'laura.gutierrez@mail.com'),
(50, 6, '1234568989', 'karol suarez', '3105555', 'Avenida 68 #20-15, Cali', 'karol@example.com'),
(51, 10, '3243', 'gfg', '5557878', 'Avenida 68 #20-15, Cali', 'da@fsdfs.com'),
(52, 6, '1065233368', 'Juan David Totoza', '3224538784', 'Avenida 68 #20-15, Cali', 'davidtolozajuan@gmail.com'),
(53, 6, '123455', 'Juan David Toloza', '3224538784', 'Avenida 68 #20-15, Cali', 'davidtoloza1234@gmail.com'),
(54, 13, '998348484', 'Ronal Manrique', '3156565656', 'Avenida 68 #20-15, Cali', 'ronalman@example.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_facturas`
--

CREATE TABLE `tbl_facturas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_facturas`
--

INSERT INTO `tbl_facturas` (`id`, `usuario_id`, `cliente_id`, `total`, `fecha`) VALUES
(7, 6, 34, 104000.00, '2025-10-23 15:52:41'),
(9, 6, 50, 102500.00, '2025-10-25 16:16:49'),
(36, 13, 54, 1800000.00, '2025-10-25 21:08:23'),
(37, 13, 54, 1800000.00, '2025-10-25 21:08:23'),
(38, 13, 54, 1800000.00, '2025-10-25 21:12:44'),
(39, 13, 54, 1800000.00, '2025-10-25 21:12:44'),
(40, 6, 50, 193000.00, '2025-10-25 22:28:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_factura_detalle`
--

CREATE TABLE `tbl_factura_detalle` (
  `id` int(11) NOT NULL,
  `factura_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_factura_detalle`
--

INSERT INTO `tbl_factura_detalle` (`id`, `factura_id`, `producto_id`, `cantidad`, `precio`) VALUES
(13, 7, 71, 1, 82000.00),
(14, 7, 73, 1, 22000.00),
(17, 9, 69, 2, 42000.00),
(18, 9, 70, 1, 18500.00),
(45, 36, 79, 150, 12000.00),
(46, 37, 79, 150, 12000.00),
(47, 38, 79, 150, 12000.00),
(48, 39, 79, 150, 12000.00),
(49, 40, 76, 1, 2000.00),
(50, 40, 73, 3, 22000.00),
(51, 40, 68, 5, 25000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_productos`
--

CREATE TABLE `tbl_productos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_productos`
--

INSERT INTO `tbl_productos` (`id`, `usuario_id`, `nombre`, `precio`) VALUES
(65, 6, 'Huevos AA caja x30', 28000.00),
(66, 6, 'Gallina ponedora Isa Brown', 45000.00),
(67, 6, 'Antibiótico aviar 250ml', 48000.00),
(68, 6, 'Bebedero plástico 10L', 25000.00),
(69, 6, 'Comedero metálico 5kg', 42000.00),
(70, 6, 'Desinfectante avícola', 18500.00),
(71, 6, 'Maíz molido saco 50kg', 82000.00),
(72, 6, 'Pollito bebé línea ponedora', 16000.00),
(73, 6, 'Calcio aviar suplemento', 22000.00),
(76, 6, 'pan', 2000.00),
(77, 6, 'Bateria MAGNA Power N200', 140000.00),
(78, 6, 'Bateria MAGNA N200', 140000.00),
(79, 13, 'Huevos', 12000.00),
(80, 6, 'mango', 500.00),
(81, 6, 'arepa', 3000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuarios`
--

CREATE TABLE `tbl_usuarios` (
  `id` int(11) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_usuarios`
--

INSERT INTO `tbl_usuarios` (`id`, `cedula`, `contrasena`, `nombre`, `correo`, `telefono`) VALUES
(3, '', '$2b$10$1vbpUQRJ6Tx8pTcE124GO.DNEwYFf5eNl0SzMdiVskm2SIo4hBs6O', '555666777', 'tolozaortega99@hotmail.com', '3224538784'),
(5, '123456789', '$2b$10$aYJc5LWkLivXppQoLX5jduTyHns1rEYQ9YvMq7oTqpP8LtRG1tN1W', 'Admin', 'admin@empresa.com', '555-9999'),
(6, '1065233368', '$2b$10$mg3FOJnA/KuNQqZHXewBguXDBp2rIMP3RBAIcAsUWBtarUStrpYiy', 'Juan david Toloza Ortega', 'r2hub0000@gmail.com', '3227093117'),
(7, '1001', 'pass1', 'Juan David Toloza', 'juan@mail.com', '3001111111'),
(8, '1002', 'pass2', 'Tatiana Rojas', 'tatiana@mail.com', '3002222222'),
(9, '1003', 'pass3', 'Laura Gutiérrez', 'laura@mail.com', '3003333333'),
(10, '1097303784', '$2b$10$8HikStfYkhnBrVld11EbS.DX8B6QIIRwdBmNF98rSIp5/Z6bH7OAm', 'Tatiana', 'jdtolozao@unadvirtual.edu.co', '55555555555555555555'),
(11, '55565666', '$2b$10$fbMwPm7eir6skeGsmZP0e.qvjaM8NWJ/wIZrfPDVlGEds5xKIqZJ6', 'pepito', 'pepito@exaple.com', '777777777777'),
(12, '4234234', '$2b$10$k4zybd7xlkz07ej8h2qsQeheWuq8k8Oopy0qc/6ZLifpOfWC6dbKu', 'Tatiana', 'maria.lopez@mail.com', '3102393699'),
(13, '0000000000', '$2b$10$fAj9Kenv3Zq87sifoPUJ1ex6At0//qiJpzQzlKxYgqaW/dykad7y6', 'karol suarez', 'karito@example.com', '3154629997');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tbl_clientes`
--
ALTER TABLE `tbl_clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_clientes_nombre` (`nombre`);

--
-- Indices de la tabla `tbl_facturas`
--
ALTER TABLE `tbl_facturas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indices de la tabla `tbl_factura_detalle`
--
ALTER TABLE `tbl_factura_detalle`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factura_id` (`factura_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `tbl_productos`
--
ALTER TABLE `tbl_productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_productos_nombre` (`nombre`);

--
-- Indices de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idx_usuarios_correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tbl_clientes`
--
ALTER TABLE `tbl_clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de la tabla `tbl_facturas`
--
ALTER TABLE `tbl_facturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT de la tabla `tbl_factura_detalle`
--
ALTER TABLE `tbl_factura_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `tbl_productos`
--
ALTER TABLE `tbl_productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tbl_clientes`
--
ALTER TABLE `tbl_clientes`
  ADD CONSTRAINT `tbl_clientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_facturas`
--
ALTER TABLE `tbl_facturas`
  ADD CONSTRAINT `tbl_facturas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_facturas_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `tbl_clientes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_factura_detalle`
--
ALTER TABLE `tbl_factura_detalle`
  ADD CONSTRAINT `tbl_factura_detalle_ibfk_1` FOREIGN KEY (`factura_id`) REFERENCES `tbl_facturas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_factura_detalle_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `tbl_productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_productos`
--
ALTER TABLE `tbl_productos`
  ADD CONSTRAINT `tbl_productos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`id`) ON DELETE CASCADE;
--

COMMIT;
