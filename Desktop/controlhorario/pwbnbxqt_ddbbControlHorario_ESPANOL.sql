-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 29-11-2025 a las 10:50:42
-- Versión del servidor: 10.6.20-MariaDB-cll-lve
-- Versión de PHP: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pwbnbxqt_ddbbControlHorario`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ausencias_empleados`
--

CREATE TABLE `ausencias_empleados` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `tipo` enum('vacation','sick','personal','unpaid_leave','medical_leave','other') NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias_totales` decimal(5,2) NOT NULL,
  `motivo` text DEFAULT NULL,
  `estado` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_sistema`
--

CREATE TABLE `auditoria_sistema` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) DEFAULT NULL,
  `id_empresa` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `tipo_entidad` varchar(50) NOT NULL,
  `id_entidad` int(11) DEFAULT NULL,
  `valores_antiguos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`valores_antiguos`)),
  `valores_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`valores_nuevos`)),
  `direccion_ip` varchar(45) DEFAULT NULL,
  `agente_usuario` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calendario_festivos`
--

CREATE TABLE `calendario_festivos` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `tipo` enum('holiday','company_event','training','other') DEFAULT 'holiday',
  `es_dia_laboral` tinyint(1) DEFAULT 0,
  `es_recurrente` tinyint(1) DEFAULT 0,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `persona_contacto` varchar(255) DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT 1,
  `id_empresa` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empresas`
--

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `correo_electronico` varchar(255) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `configuracion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' CHECK (json_valid(`configuracion`)),
  `esta_activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empresas`
--

INSERT INTO `empresas` (`id`, `nombre`, `correo_electronico`, `telefono`, `direccion`, `logo_url`, `configuracion`, `esta_activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Demo Company', 'demo@controlhorario.com', '+34 600 000 000', 'Calle Principal, 123, Madrid, Espa├▒a', NULL, '{\"timezone\": \"Europe/Madrid\", \"date_format\": \"DD/MM/YYYY\", \"time_format\": \"24h\", \"currency\": \"EUR\", \"overtime_enabled\": true, \"geolocation_required\": false, \"approval_required\": false}', 1, '2025-10-28 11:40:14', '2025-10-28 11:40:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamentos`
--

CREATE TABLE `departamentos` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_responsable` int(11) DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `departamentos`
--

INSERT INTO `departamentos` (`id`, `id_empresa`, `nombre`, `descripcion`, `id_responsable`, `esta_activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 1, 'Desarrollo', 'Departamento de desarrollo de software', NULL, 1, '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(2, 1, 'Recursos Humanos', 'Departamento de gesti├│n de personal', NULL, 1, '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(3, 1, 'Ventas', 'Departamento comercial', NULL, 1, '2025-10-28 11:40:14', '2025-10-28 11:40:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cola_emails`
--

CREATE TABLE `cola_emails` (
  `id` int(11) NOT NULL,
  `plantilla` varchar(100) NOT NULL,
  `destinatarios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Array of email addresses' CHECK (json_valid(`destinatarios`)),
  `asunto` varchar(500) NOT NULL,
  `datos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos`)),
  `prioridad` enum('low','normal','high') DEFAULT 'normal',
  `estado` enum('pending','processing','sent','failed') DEFAULT 'pending',
  `intentos` int(11) DEFAULT 0,
  `max_intentos` int(11) DEFAULT 3,
  `mensaje_error` text DEFAULT NULL,
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones_geograficas`
--

CREATE TABLE `ubicaciones_geograficas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `radio_metros` int(11) NOT NULL DEFAULT 100,
  `tipo` enum('office','branch','client','construction_site','warehouse','other') DEFAULT 'office',
  `codigo_color` varchar(7) DEFAULT '#3B82F6',
  `auto_check_in_enabled` tinyint(1) DEFAULT 0,
  `auto_check_out_enabled` tinyint(1) DEFAULT 0,
  `auto_check_in_delay_minutes` int(11) DEFAULT 0,
  `auto_check_out_delay_minutes` int(11) DEFAULT 0,
  `allow_check_in_outside` tinyint(1) DEFAULT 1,
  `require_approval_outside` tinyint(1) DEFAULT 0,
  `alert_on_entry` tinyint(1) DEFAULT 0,
  `alert_on_exit` tinyint(1) DEFAULT 0,
  `alert_managers` tinyint(1) DEFAULT 0,
  `esta_activo` tinyint(1) DEFAULT 1,
  `id_empresa` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `prioridad` enum('low','normal','high','urgent') DEFAULT 'normal',
  `categoria` varchar(50) DEFAULT 'general',
  `esta_leido` tinyint(1) DEFAULT 0,
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  `url_accion` varchar(500) DEFAULT NULL,
  `enlace` varchar(255) DEFAULT NULL,
  `metadatos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadatos`)),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preferencias_notificaciones`
--

CREATE TABLE `preferencias_notificaciones` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `email_enabled` tinyint(1) DEFAULT 1,
  `push_enabled` tinyint(1) DEFAULT 1,
  `time_entry_notifications` tinyint(1) DEFAULT 1,
  `absence_notifications` tinyint(1) DEFAULT 1,
  `overtime_notifications` tinyint(1) DEFAULT 1,
  `shift_notifications` tinyint(1) DEFAULT 1,
  `task_notifications` tinyint(1) DEFAULT 1,
  `quiet_hours_start` time DEFAULT '22:00:00',
  `quiet_hours_end` time DEFAULT '08:00:00',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `preferencias_notificaciones`
--

INSERT INTO `preferencias_notificaciones` (`id`, `id_empleado`, `email_enabled`, `push_enabled`, `time_entry_notifications`, `absence_notifications`, `overtime_notifications`, `shift_notifications`, `task_notifications`, `quiet_hours_start`, `quiet_hours_end`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, '22:00:00', '08:00:00', '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(2, 4, 1, 1, 1, 1, 1, 1, 1, '22:00:00', '08:00:00', '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(3, 2, 1, 1, 1, 1, 1, 1, 1, '22:00:00', '08:00:00', '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(4, 3, 1, 1, 1, 1, 1, 1, 1, '22:00:00', '08:00:00', '2025-10-28 11:40:14', '2025-10-28 11:40:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horas_extras`
--

CREATE TABLE `horas_extras` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `horas` decimal(5,2) NOT NULL,
  `tipo_hora_extra` enum('weekday','weekend','holiday','night_shift') NOT NULL DEFAULT 'weekday',
  `multiplicador` decimal(3,2) NOT NULL DEFAULT 1.50,
  `tarifa_por_hora` decimal(10,2) DEFAULT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `estado` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `motivo` text DEFAULT NULL,
  `esta_pagado` tinyint(1) DEFAULT 0,
  `fecha_pago` date DEFAULT NULL,
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `id_empresa` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_responsable` int(11) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `horas_estimadas` decimal(10,2) DEFAULT 0.00,
  `presupuesto` decimal(12,2) DEFAULT 0.00,
  `estado` enum('planning','active','on_hold','completed','cancelled') DEFAULT 'planning',
  `prioridad` enum('low','medium','high') DEFAULT 'medium',
  `color` varchar(7) DEFAULT '#3B82F6',
  `es_facturable` tinyint(1) DEFAULT 1,
  `esta_activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_trabajo`
--

CREATE TABLE `horarios_trabajo` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `lunes_inicio` time DEFAULT NULL,
  `lunes_fin` time DEFAULT NULL,
  `martes_inicio` time DEFAULT NULL,
  `martes_fin` time DEFAULT NULL,
  `miercoles_inicio` time DEFAULT NULL,
  `miercoles_fin` time DEFAULT NULL,
  `jueves_inicio` time DEFAULT NULL,
  `jueves_fin` time DEFAULT NULL,
  `viernes_inicio` time DEFAULT NULL,
  `viernes_fin` time DEFAULT NULL,
  `sabado_inicio` time DEFAULT NULL,
  `sabado_fin` time DEFAULT NULL,
  `domingo_inicio` time DEFAULT NULL,
  `domingo_fin` time DEFAULT NULL,
  `minutos_descanso` int(11) DEFAULT 0,
  `esta_activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios_trabajo`
--

INSERT INTO `horarios_trabajo` (`id`, `id_empresa`, `nombre`, `descripcion`, `lunes_inicio`, `lunes_fin`, `martes_inicio`, `martes_fin`, `miercoles_inicio`, `miercoles_fin`, `jueves_inicio`, `jueves_fin`, `viernes_inicio`, `viernes_fin`, `sabado_inicio`, `sabado_fin`, `domingo_inicio`, `domingo_fin`, `minutos_descanso`, `esta_activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 1, 'Horario Est├índar', 'Lunes a Viernes 9:00 - 18:00', '09:00:00', '18:00:00', '09:00:00', '18:00:00', '09:00:00', '18:00:00', '09:00:00', '18:00:00', '09:00:00', '18:00:00', NULL, NULL, NULL, NULL, 60, 1, '2025-10-28 11:40:14', '2025-10-28 11:40:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_horarios_empleados`
--

CREATE TABLE `asignacion_horarios_empleados` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_horario` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `asignacion_horarios_empleados`
--

INSERT INTO `asignacion_horarios_empleados` (`id`, `id_empleado`, `id_horario`, `fecha_inicio`, `fecha_fin`, `fecha_creacion`) VALUES
(1, 1, 1, '2024-01-01', NULL, '2025-10-28 11:40:14'),
(2, 2, 1, '2024-01-01', NULL, '2025-10-28 11:40:14'),
(3, 3, 1, '2024-01-01', NULL, '2025-10-28 11:40:14'),
(4, 4, 1, '2024-01-01', NULL, '2025-10-28 11:40:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones_sistema`
--

CREATE TABLE `configuraciones_sistema` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `clave_configuracion` varchar(100) NOT NULL,
  `valor_configuracion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`valor_configuracion`)),
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_turnos`
--

CREATE TABLE `asignacion_turnos` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_patron_turno` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT 1,
  `creado_por` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intercambios_turnos`
--

CREATE TABLE `intercambios_turnos` (
  `id` int(11) NOT NULL,
  `id_solicitante` int(11) NOT NULL,
  `id_objetivo` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `id_turno_solicitante` int(11) NOT NULL,
  `id_turno_objetivo` int(11) NOT NULL,
  `estado` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `motivo` text DEFAULT NULL,
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `patrones_turnos`
--

CREATE TABLE `patrones_turnos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `tipo_rotacion` enum('fixed','weekly','custom') NOT NULL DEFAULT 'fixed',
  `dias_rotacion` int(11) DEFAULT NULL,
  `dias_trabajo` varchar(50) DEFAULT NULL COMMENT 'Comma-separated days: 1=Monday, 7=Sunday',
  `dias_descanso` varchar(50) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `esta_activo` tinyint(1) DEFAULT 1,
  `id_empresa` int(11) NOT NULL,
  `creado_por` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tickets_soporte`
--

CREATE TABLE `tickets_soporte` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `asunto` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `categoria` enum('technical','billing','feature_request','bug','other') DEFAULT 'other',
  `prioridad` enum('low','medium','high','urgent') DEFAULT 'medium',
  `estado` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `asignado_a` int(11) DEFAULT NULL,
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `respuestas_tickets`
--

CREATE TABLE `respuestas_tickets` (
  `id` int(11) NOT NULL,
  `id_ticket` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `es_interno` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_horarios`
--

CREATE TABLE `registros_horarios` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `hora_entrada` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hora_salida` timestamp NULL DEFAULT NULL,
  `latitud_entrada` decimal(10,8) DEFAULT NULL,
  `longitud_entrada` decimal(11,8) DEFAULT NULL,
  `latitud_salida` decimal(10,8) DEFAULT NULL,
  `longitud_salida` decimal(11,8) DEFAULT NULL,
  `ip_entrada` varchar(45) DEFAULT NULL,
  `ip_salida` varchar(45) DEFAULT NULL,
  `horas_totales` decimal(5,2) DEFAULT 0.00,
  `minutos_descanso` int(11) DEFAULT 0,
  `notas` text DEFAULT NULL,
  `estado` enum('active','completed','approved','rejected') DEFAULT 'active',
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiempo_proyectos`
--

CREATE TABLE `tiempo_proyectos` (
  `id` int(11) NOT NULL,
  `id_registro_tiempo` int(11) NOT NULL,
  `id_proyecto` int(11) NOT NULL,
  `horas` decimal(5,2) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id` int(11) NOT NULL,
  `id_proyecto` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('todo','in_progress','review','done') DEFAULT 'todo',
  `prioridad` enum('low','medium','high') DEFAULT 'medium',
  `asignado_a` int(11) DEFAULT NULL,
  `horas_estimadas` decimal(8,2) DEFAULT 0.00,
  `horas_reales` decimal(8,2) DEFAULT 0.00,
  `fecha_vencimiento` date DEFAULT NULL,
  `fecha_completado` timestamp NULL DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `creado_por` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `id_departamento` int(11) DEFAULT NULL,
  `correo_electronico` varchar(255) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `tipo_usuario` enum('super_admin','company_admin','manager','employee') DEFAULT 'employee',
  `codigo_empleado` varchar(50) DEFAULT NULL,
  `fecha_contratacion` date DEFAULT NULL,
  `tarifa_hora` decimal(10,2) DEFAULT 0.00,
  `horas_semanales` int(11) DEFAULT 40,
  `esta_activo` tinyint(1) DEFAULT 1,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id`, `id_empresa`, `id_departamento`, `correo_electronico`, `contrasena_hash`, `nombre`, `apellidos`, `telefono`, `foto_perfil`, `tipo_usuario`, `codigo_empleado`, `fecha_contratacion`, `tarifa_hora`, `horas_semanales`, `esta_activo`, `ultimo_acceso`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 1, 1, 'admin@demo.com', '$2a$10$qNUVFvWveNywPWSnVycYP.u8CkveX3ATuesIL0f8xR/ZomSkx5D6y', 'Admin', 'Sistema', NULL, NULL, 'company_admin', 'EMP001', '2024-01-01', 0.00, 40, 1, NULL, '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(2, 1, 1, 'juan.perez@demo.com', '$2a$10$qNUVFvWveNywPWSnVycYP.u8CkveX3ATuesIL0f8xR/ZomSkx5D6y', 'Juan', 'Perez', NULL, NULL, 'employee', 'EMP002', '2024-01-15', 0.00, 40, 1, NULL, '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(3, 1, 1, 'maria.garcia@demo.com', '$2a$10$qNUVFvWveNywPWSnVycYP.u8CkveX3ATuesIL0f8xR/ZomSkx5D6y', 'Maria', 'Garcia', NULL, NULL, 'employee', 'EMP003', '2024-02-01', 0.00, 40, 1, NULL, '2025-10-28 11:40:14', '2025-10-28 11:40:14'),
(4, 1, 2, 'carlos.lopez@demo.com', '$2a$10$qNUVFvWveNywPWSnVycYP.u8CkveX3ATuesIL0f8xR/ZomSkx5D6y', 'Carlos', 'Lopez', NULL, NULL, 'manager', 'EMP004', '2024-01-10', 0.00, 40, 1, NULL, '2025-10-28 11:40:14', '2025-10-28 11:40:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `webhooks`
--

CREATE TABLE `webhooks` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `secreto` varchar(255) DEFAULT NULL,
  `eventos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Array of event types to listen to' CHECK (json_valid(`eventos`)),
  `esta_activo` tinyint(1) DEFAULT 1,
  `ultima_ejecucion` timestamp NULL DEFAULT NULL,
  `id_empresa` int(11) NOT NULL,
  `creado_por` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas_webhooks`
--

CREATE TABLE `entregas_webhooks` (
  `id` int(11) NOT NULL,
  `id_webhook` int(11) NOT NULL,
  `tipo_evento` varchar(100) NOT NULL,
  `datos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`datos`)),
  `codigo_estado` int(11) DEFAULT NULL,
  `respuesta` text DEFAULT NULL,
  `exitoso` tinyint(1) DEFAULT 0,
  `mensaje_error` text DEFAULT NULL,
  `fecha_entrega` timestamp NOT NULL DEFAULT current_timestamp(),
  `duracion_ms` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ausencias_empleados`
--
ALTER TABLE `ausencias_empleados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aprobado_por` (`aprobado_por`),
  ADD KEY `idx_absence_user` (`id_empleado`),
  ADD KEY `idx_absence_company` (`id_empresa`),
  ADD KEY `idx_absence_date` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_absence_status` (`estado`);

--
-- Indices de la tabla `auditoria_sistema`
--
ALTER TABLE `auditoria_sistema`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_company` (`id_empresa`),
  ADD KEY `idx_audit_user` (`id_empleado`),
  ADD KEY `idx_audit_date` (`fecha_creacion`);

--
-- Indices de la tabla `calendario_festivos`
--
ALTER TABLE `calendario_festivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `idx_calendar_company` (`id_empresa`),
  ADD KEY `idx_calendar_date` (`fecha`),
  ADD KEY `idx_calendar_type` (`tipo`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company` (`id_empresa`),
  ADD KEY `idx_active` (`esta_activo`);

--
-- Indices de la tabla `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo_electronico` (`correo_electronico`),
  ADD KEY `idx_company_active` (`esta_activo`);

--
-- Indices de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_department_company` (`id_empresa`),
  ADD KEY `idx_department_active` (`esta_activo`),
  ADD KEY `fk_department_manager` (`id_responsable`);

--
-- Indices de la tabla `cola_emails`
--
ALTER TABLE `cola_emails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`estado`),
  ADD KEY `idx_priority` (`prioridad`),
  ADD KEY `idx_created` (`fecha_creacion`);

--
-- Indices de la tabla `ubicaciones_geograficas`
--
ALTER TABLE `ubicaciones_geograficas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company` (`id_empresa`),
  ADD KEY `idx_active` (`esta_activo`),
  ADD KEY `idx_coordinates` (`latitud`,`longitud`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_empresa` (`id_empresa`),
  ADD KEY `idx_user_read` (`id_empleado`,`esta_leido`),
  ADD KEY `idx_created` (`fecha_creacion`),
  ADD KEY `idx_priority` (`prioridad`);

--
-- Indices de la tabla `preferencias_notificaciones`
--
ALTER TABLE `preferencias_notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_empleado` (`id_empleado`);

--
-- Indices de la tabla `horas_extras`
--
ALTER TABLE `horas_extras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aprobado_por` (`aprobado_por`),
  ADD KEY `idx_user_date` (`id_empleado`,`fecha`),
  ADD KEY `idx_status` (`estado`),
  ADD KEY `idx_company` (`id_empresa`),
  ADD KEY `idx_overtime_user` (`id_empleado`),
  ADD KEY `idx_overtime_date` (`fecha`),
  ADD KEY `idx_overtime_paid` (`esta_pagado`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_responsable` (`id_responsable`),
  ADD KEY `idx_project_company` (`id_empresa`),
  ADD KEY `idx_project_active` (`esta_activo`),
  ADD KEY `idx_status` (`estado`);

--
-- Indices de la tabla `horarios_trabajo`
--
ALTER TABLE `horarios_trabajo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_schedule_company` (`id_empresa`);

--
-- Indices de la tabla `asignacion_horarios_empleados`
--
ALTER TABLE `asignacion_horarios_empleados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_horario` (`id_horario`),
  ADD KEY `idx_user_schedule` (`id_empleado`,`fecha_inicio`,`fecha_fin`);

--
-- Indices de la tabla `configuraciones_sistema`
--
ALTER TABLE `configuraciones_sistema`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_company_setting` (`id_empresa`,`clave_configuracion`),
  ADD KEY `idx_company_settings` (`id_empresa`,`clave_configuracion`);

--
-- Indices de la tabla `asignacion_turnos`
--
ALTER TABLE `asignacion_turnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_patron_turno` (`id_patron_turno`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `idx_user` (`id_empleado`),
  ADD KEY `idx_dates` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_active` (`esta_activo`);

--
-- Indices de la tabla `intercambios_turnos`
--
ALTER TABLE `intercambios_turnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_solicitante` (`id_solicitante`),
  ADD KEY `id_objetivo` (`id_objetivo`),
  ADD KEY `id_turno_solicitante` (`id_turno_solicitante`),
  ADD KEY `id_turno_objetivo` (`id_turno_objetivo`),
  ADD KEY `aprobado_por` (`aprobado_por`),
  ADD KEY `idx_status` (`estado`),
  ADD KEY `idx_date` (`fecha`);

--
-- Indices de la tabla `patrones_turnos`
--
ALTER TABLE `patrones_turnos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `idx_company` (`id_empresa`),
  ADD KEY `idx_active` (`esta_activo`);

--
-- Indices de la tabla `tickets_soporte`
--
ALTER TABLE `tickets_soporte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asignado_a` (`asignado_a`),
  ADD KEY `idx_ticket_company` (`id_empresa`),
  ADD KEY `idx_ticket_user` (`id_empleado`),
  ADD KEY `idx_ticket_status` (`estado`);

--
-- Indices de la tabla `respuestas_tickets`
--
ALTER TABLE `respuestas_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_empleado` (`id_empleado`),
  ADD KEY `idx_reply_ticket` (`id_ticket`);

--
-- Indices de la tabla `registros_horarios`
--
ALTER TABLE `registros_horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aprobado_por` (`aprobado_por`),
  ADD KEY `idx_entry_user` (`id_empleado`),
  ADD KEY `idx_entry_company` (`id_empresa`),
  ADD KEY `idx_entry_date` (`hora_entrada`),
  ADD KEY `idx_entry_status` (`estado`);

--
-- Indices de la tabla `tiempo_proyectos`
--
ALTER TABLE `tiempo_proyectos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_registro_tiempo` (`id_registro_tiempo`),
  ADD KEY `idx_project_time` (`id_proyecto`,`id_registro_tiempo`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `idx_project_status` (`id_proyecto`,`estado`),
  ADD KEY `idx_assigned` (`asignado_a`),
  ADD KEY `idx_order` (`orden`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_company_email` (`id_empresa`,`correo_electronico`),
  ADD KEY `idx_user_company` (`id_empresa`),
  ADD KEY `idx_user_department` (`id_departamento`),
  ADD KEY `idx_user_role` (`tipo_usuario`),
  ADD KEY `idx_user_active` (`esta_activo`);

--
-- Indices de la tabla `webhooks`
--
ALTER TABLE `webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `idx_company` (`id_empresa`),
  ADD KEY `idx_active` (`esta_activo`);

--
-- Indices de la tabla `entregas_webhooks`
--
ALTER TABLE `entregas_webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_webhook` (`id_webhook`),
  ADD KEY `idx_delivered` (`fecha_entrega`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ausencias_empleados`
--
ALTER TABLE `ausencias_empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auditoria_sistema`
--
ALTER TABLE `auditoria_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `calendario_festivos`
--
ALTER TABLE `calendario_festivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `departamentos`
--
ALTER TABLE `departamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cola_emails`
--
ALTER TABLE `cola_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ubicaciones_geograficas`
--
ALTER TABLE `ubicaciones_geograficas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preferencias_notificaciones`
--
ALTER TABLE `preferencias_notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `horas_extras`
--
ALTER TABLE `horas_extras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios_trabajo`
--
ALTER TABLE `horarios_trabajo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `asignacion_horarios_empleados`
--
ALTER TABLE `asignacion_horarios_empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `configuraciones_sistema`
--
ALTER TABLE `configuraciones_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignacion_turnos`
--
ALTER TABLE `asignacion_turnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `intercambios_turnos`
--
ALTER TABLE `intercambios_turnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `patrones_turnos`
--
ALTER TABLE `patrones_turnos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tickets_soporte`
--
ALTER TABLE `tickets_soporte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `respuestas_tickets`
--
ALTER TABLE `respuestas_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `registros_horarios`
--
ALTER TABLE `registros_horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tiempo_proyectos`
--
ALTER TABLE `tiempo_proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `webhooks`
--
ALTER TABLE `webhooks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `entregas_webhooks`
--
ALTER TABLE `entregas_webhooks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ausencias_empleados`
--
ALTER TABLE `ausencias_empleados`
  ADD CONSTRAINT `abscontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `abscontrolhorario_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `abscontrolhorario_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `auditoria_sistema`
--
ALTER TABLE `auditoria_sistema`
  ADD CONSTRAINT `audcontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `audcontrolhorario_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `calendario_festivos`
--
ALTER TABLE `calendario_festivos`
  ADD CONSTRAINT `clfcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `clfcontrolhorario_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clicontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `departamentos`
--
ALTER TABLE `departamentos`
  ADD CONSTRAINT `dptcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_department_manager` FOREIGN KEY (`id_responsable`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ubicaciones_geograficas`
--
ALTER TABLE `ubicaciones_geograficas`
  ADD CONSTRAINT `geocontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `ntfcontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ntfcontrolhorario_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `preferencias_notificaciones`
--
ALTER TABLE `preferencias_notificaciones`
  ADD CONSTRAINT `ntfpreferenciascontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horas_extras`
--
ALTER TABLE `horas_extras`
  ADD CONSTRAINT `ovtcontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ovtcontrolhorario_ibfk_2` FOREIGN KEY (`aprobado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ovtcontrolhorario_ibfk_3` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD CONSTRAINT `prjcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prjcontrolhorario_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `prjcontrolhorario_ibfk_3` FOREIGN KEY (`id_responsable`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `horarios_trabajo`
--
ALTER TABLE `horarios_trabajo`
  ADD CONSTRAINT `schcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asignacion_horarios_empleados`
--
ALTER TABLE `asignacion_horarios_empleados`
  ADD CONSTRAINT `schusuariocontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schusuariocontrolhorario_ibfk_2` FOREIGN KEY (`id_horario`) REFERENCES `horarios_trabajo` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `configuraciones_sistema`
--
ALTER TABLE `configuraciones_sistema`
  ADD CONSTRAINT `setcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asignacion_turnos`
--
ALTER TABLE `asignacion_turnos`
  ADD CONSTRAINT `shfasignacioncontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfasignacioncontrolhorario_ibfk_2` FOREIGN KEY (`id_patron_turno`) REFERENCES `patrones_turnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfasignacioncontrolhorario_ibfk_3` FOREIGN KEY (`creado_por`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `intercambios_turnos`
--
ALTER TABLE `intercambios_turnos`
  ADD CONSTRAINT `shfintercambiocontrolhorario_ibfk_1` FOREIGN KEY (`id_solicitante`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfintercambiocontrolhorario_ibfk_2` FOREIGN KEY (`id_objetivo`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfintercambiocontrolhorario_ibfk_3` FOREIGN KEY (`id_turno_solicitante`) REFERENCES `patrones_turnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfintercambiocontrolhorario_ibfk_4` FOREIGN KEY (`id_turno_objetivo`) REFERENCES `patrones_turnos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfintercambiocontrolhorario_ibfk_5` FOREIGN KEY (`aprobado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `patrones_turnos`
--
ALTER TABLE `patrones_turnos`
  ADD CONSTRAINT `shfpatroncontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shfpatroncontrolhorario_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tickets_soporte`
--
ALTER TABLE `tickets_soporte`
  ADD CONSTRAINT `tktcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tktcontrolhorario_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tktcontrolhorario_ibfk_3` FOREIGN KEY (`asignado_a`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `respuestas_tickets`
--
ALTER TABLE `respuestas_tickets`
  ADD CONSTRAINT `tktrespuestascontrolhorario_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `tickets_soporte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tktrespuestascontrolhorario_ibfk_2` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `registros_horarios`
--
ALTER TABLE `registros_horarios`
  ADD CONSTRAINT `tmrcontrolhorario_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tmrcontrolhorario_ibfk_2` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tmrcontrolhorario_ibfk_3` FOREIGN KEY (`aprobado_por`) REFERENCES `empleados` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tiempo_proyectos`
--
ALTER TABLE `tiempo_proyectos`
  ADD CONSTRAINT `tmrproyectocontrolhorario_ibfk_1` FOREIGN KEY (`id_registro_tiempo`) REFERENCES `registros_horarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tmrproyectocontrolhorario_ibfk_2` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tskcontrolhorario_ibfk_1` FOREIGN KEY (`id_proyecto`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tskcontrolhorario_ibfk_2` FOREIGN KEY (`asignado_a`) REFERENCES `empleados` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tskcontrolhorario_ibfk_3` FOREIGN KEY (`creado_por`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `usrcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usrcontrolhorario_ibfk_2` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `webhooks`
--
ALTER TABLE `webhooks`
  ADD CONSTRAINT `wbhcontrolhorario_ibfk_1` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wbhcontrolhorario_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `empleados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `entregas_webhooks`
--
ALTER TABLE `entregas_webhooks`
  ADD CONSTRAINT `wbhentregascontrolhorario_ibfk_1` FOREIGN KEY (`id_webhook`) REFERENCES `webhooks` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
