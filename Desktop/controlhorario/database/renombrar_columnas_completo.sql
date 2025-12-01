-- ===========================================================
-- SCRIPT DE RENOMBRADO DE COLUMNAS
-- De nombres en inglés a español descriptivo
-- ===========================================================
--
-- IMPORTANTE: Ejecutar DESPUÉS de renombrar_todas_tablas.sql
-- Este script renombra columnas en TODAS las tablas
--
-- ===========================================================

USE pwbnbxqt_ddbbControlHorario;

SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================================
-- TABLA: empleados (antes usrcontrolhorario)
-- ===========================================================
ALTER TABLE `empleados`
    CHANGE `id` `id_empleado` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `department_id` `id_departamento` INT(11) DEFAULT NULL,
    CHANGE `email` `correo_electronico` VARCHAR(255) NOT NULL,
    CHANGE `password` `contrasena_hash` VARCHAR(255) NOT NULL,
    CHANGE `first_name` `nombre` VARCHAR(100) NOT NULL,
    CHANGE `last_name` `apellidos` VARCHAR(100) NOT NULL,
    CHANGE `phone` `telefono` VARCHAR(50) DEFAULT NULL,
    CHANGE `avatar` `foto_perfil` VARCHAR(255) DEFAULT NULL,
    CHANGE `role` `tipo_usuario` ENUM('super_admin','company_admin','manager','employee') DEFAULT 'employee',
    CHANGE `employee_code` `codigo_empleado` VARCHAR(50) DEFAULT NULL,
    CHANGE `hire_date` `fecha_contratacion` DATE DEFAULT NULL,
    CHANGE `hourly_rate` `tarifa_hora` DECIMAL(10,2) DEFAULT 0.00,
    CHANGE `weekly_hours` `horas_semanales` INT(11) DEFAULT 40,
    CHANGE `is_active` `esta_activo` TINYINT(1) DEFAULT 1,
    CHANGE `last_login` `ultimo_acceso` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: empresas (antes cmpcontrolhorario)
-- ===========================================================
ALTER TABLE `empresas`
    CHANGE `id` `id_empresa` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `name` `nombre_empresa` VARCHAR(255) NOT NULL,
    CHANGE `email` `correo_electronico` VARCHAR(255) NOT NULL,
    CHANGE `phone` `telefono` VARCHAR(50) DEFAULT NULL,
    CHANGE `address` `direccion` TEXT DEFAULT NULL,
    CHANGE `logo` `logo_url` VARCHAR(255) DEFAULT NULL,
    CHANGE `config` `configuracion` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}',
    CHANGE `is_active` `esta_activa` TINYINT(1) DEFAULT 1,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: departamentos (antes dptcontrolhorario)
-- ===========================================================
ALTER TABLE `departamentos`
    CHANGE `id` `id_departamento` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `name` `nombre_departamento` VARCHAR(255) NOT NULL,
    CHANGE `description` `descripcion` TEXT DEFAULT NULL,
    CHANGE `manager_id` `id_responsable` INT(11) DEFAULT NULL,
    CHANGE `is_active` `esta_activo` TINYINT(1) DEFAULT 1,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: registros_horarios (antes tmrcontrolhorario) ⭐ PRINCIPAL
-- ===========================================================
ALTER TABLE `registros_horarios`
    CHANGE `id` `id_registro` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `user_id` `id_empleado` INT(11) NOT NULL,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `check_in` `hora_entrada` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHANGE `check_out` `hora_salida` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `check_in_latitude` `latitud_entrada` DECIMAL(10,8) DEFAULT NULL,
    CHANGE `check_in_longitude` `longitud_entrada` DECIMAL(11,8) DEFAULT NULL,
    CHANGE `check_out_latitude` `latitud_salida` DECIMAL(10,8) DEFAULT NULL,
    CHANGE `check_out_longitude` `longitud_salida` DECIMAL(11,8) DEFAULT NULL,
    CHANGE `check_in_ip` `ip_entrada` VARCHAR(45) DEFAULT NULL,
    CHANGE `check_out_ip` `ip_salida` VARCHAR(45) DEFAULT NULL,
    CHANGE `total_hours` `horas_totales` DECIMAL(5,2) DEFAULT 0.00,
    CHANGE `break_minutes` `minutos_descanso` INT(11) DEFAULT 0,
    CHANGE `notes` `notas` TEXT DEFAULT NULL,
    CHANGE `status` `estado` ENUM('active','completed','approved','rejected') DEFAULT 'active',
    CHANGE `approved_by` `aprobado_por` INT(11) DEFAULT NULL,
    CHANGE `approved_at` `fecha_aprobacion` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: ausencias_empleados (antes abscontrolhorario)
-- ===========================================================
ALTER TABLE `ausencias_empleados`
    CHANGE `id` `id_ausencia` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `user_id` `id_empleado` INT(11) NOT NULL,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `type` `tipo_ausencia` ENUM('vacation','sick','personal','unpaid_leave','medical_leave','other') NOT NULL,
    CHANGE `start_date` `fecha_inicio` DATE NOT NULL,
    CHANGE `end_date` `fecha_fin` DATE NOT NULL,
    CHANGE `total_days` `dias_totales` DECIMAL(5,2) NOT NULL,
    CHANGE `reason` `motivo` TEXT DEFAULT NULL,
    CHANGE `status` `estado` ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
    CHANGE `approved_by` `aprobado_por` INT(11) DEFAULT NULL,
    CHANGE `approved_at` `fecha_aprobacion` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `rejection_reason` `motivo_rechazo` TEXT DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: horas_extras (antes ovtcontrolhorario)
-- ===========================================================
ALTER TABLE `horas_extras`
    CHANGE `id` `id_hora_extra` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `user_id` `id_empleado` INT(11) NOT NULL,
    CHANGE `date` `fecha` DATE NOT NULL,
    CHANGE `hours` `horas` DECIMAL(5,2) NOT NULL,
    CHANGE `overtime_type` `tipo_hora_extra` ENUM('weekday','weekend','holiday','night_shift') NOT NULL DEFAULT 'weekday',
    CHANGE `multiplier` `multiplicador` DECIMAL(3,2) NOT NULL DEFAULT 1.50,
    CHANGE `rate_per_hour` `tarifa_por_hora` DECIMAL(10,2) DEFAULT NULL,
    CHANGE `total_amount` `monto_total` DECIMAL(10,2) DEFAULT NULL,
    CHANGE `status` `estado` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    CHANGE `reason` `motivo` TEXT DEFAULT NULL,
    CHANGE `is_paid` `esta_pagada` TINYINT(1) DEFAULT 0,
    CHANGE `paid_date` `fecha_pago` DATE DEFAULT NULL,
    CHANGE `approved_by` `aprobado_por` INT(11) DEFAULT NULL,
    CHANGE `approved_at` `fecha_aprobacion` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `rejection_reason` `motivo_rechazo` TEXT DEFAULT NULL,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: proyectos (antes prjcontrolhorario)
-- ===========================================================
ALTER TABLE `proyectos`
    CHANGE `id` `id_proyecto` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `name` `nombre_proyecto` VARCHAR(255) NOT NULL,
    CHANGE `description` `descripcion` TEXT DEFAULT NULL,
    CHANGE `client_id` `id_cliente` INT(11) DEFAULT NULL,
    CHANGE `manager_id` `id_responsable` INT(11) DEFAULT NULL,
    CHANGE `start_date` `fecha_inicio` DATE DEFAULT NULL,
    CHANGE `end_date` `fecha_fin` DATE DEFAULT NULL,
    CHANGE `estimated_hours` `horas_estimadas` DECIMAL(10,2) DEFAULT 0.00,
    CHANGE `budget` `presupuesto` DECIMAL(12,2) DEFAULT 0.00,
    CHANGE `status` `estado` ENUM('planning','active','on_hold','completed','cancelled') DEFAULT 'planning',
    CHANGE `priority` `prioridad` ENUM('low','medium','high') DEFAULT 'medium',
    CHANGE `color` `color` VARCHAR(7) DEFAULT '#3B82F6',
    CHANGE `is_billable` `es_facturable` TINYINT(1) DEFAULT 1,
    CHANGE `is_active` `esta_activo` TINYINT(1) DEFAULT 1,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: tareas (antes tskcontrolhorario)
-- ===========================================================
ALTER TABLE `tareas`
    CHANGE `id` `id_tarea` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `project_id` `id_proyecto` INT(11) NOT NULL,
    CHANGE `title` `titulo` VARCHAR(255) NOT NULL,
    CHANGE `description` `descripcion` TEXT DEFAULT NULL,
    CHANGE `status` `estado` ENUM('todo','in_progress','review','done') DEFAULT 'todo',
    CHANGE `priority` `prioridad` ENUM('low','medium','high') DEFAULT 'medium',
    CHANGE `assigned_to` `asignado_a` INT(11) DEFAULT NULL,
    CHANGE `estimated_hours` `horas_estimadas` DECIMAL(8,2) DEFAULT 0.00,
    CHANGE `actual_hours` `horas_reales` DECIMAL(8,2) DEFAULT 0.00,
    CHANGE `due_date` `fecha_vencimiento` DATE DEFAULT NULL,
    CHANGE `completed_at` `fecha_completado` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `order_index` `orden` INT(11) DEFAULT 0,
    CHANGE `created_by` `creado_por` INT(11) NOT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: clientes (antes clicontrolhorario)
-- ===========================================================
ALTER TABLE `clientes`
    CHANGE `id` `id_cliente` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `name` `nombre_cliente` VARCHAR(255) NOT NULL,
    CHANGE `email` `correo_electronico` VARCHAR(255) DEFAULT NULL,
    CHANGE `phone` `telefono` VARCHAR(50) DEFAULT NULL,
    CHANGE `address` `direccion` TEXT DEFAULT NULL,
    CHANGE `contact_person` `persona_contacto` VARCHAR(255) DEFAULT NULL,
    CHANGE `website` `sitio_web` VARCHAR(255) DEFAULT NULL,
    CHANGE `notes` `notas` TEXT DEFAULT NULL,
    CHANGE `is_active` `esta_activo` TINYINT(1) DEFAULT 1,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: horarios_trabajo (antes schcontrolhorario)
-- ===========================================================
ALTER TABLE `horarios_trabajo`
    CHANGE `id` `id_horario` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `name` `nombre_horario` VARCHAR(255) NOT NULL,
    CHANGE `description` `descripcion` TEXT DEFAULT NULL,
    CHANGE `monday_start` `lunes_inicio` TIME DEFAULT NULL,
    CHANGE `monday_end` `lunes_fin` TIME DEFAULT NULL,
    CHANGE `tuesday_start` `martes_inicio` TIME DEFAULT NULL,
    CHANGE `tuesday_end` `martes_fin` TIME DEFAULT NULL,
    CHANGE `wednesday_start` `miercoles_inicio` TIME DEFAULT NULL,
    CHANGE `wednesday_end` `miercoles_fin` TIME DEFAULT NULL,
    CHANGE `thursday_start` `jueves_inicio` TIME DEFAULT NULL,
    CHANGE `thursday_end` `jueves_fin` TIME DEFAULT NULL,
    CHANGE `friday_start` `viernes_inicio` TIME DEFAULT NULL,
    CHANGE `friday_end` `viernes_fin` TIME DEFAULT NULL,
    CHANGE `saturday_start` `sabado_inicio` TIME DEFAULT NULL,
    CHANGE `saturday_end` `sabado_fin` TIME DEFAULT NULL,
    CHANGE `sunday_start` `domingo_inicio` TIME DEFAULT NULL,
    CHANGE `sunday_end` `domingo_fin` TIME DEFAULT NULL,
    CHANGE `break_minutes` `minutos_descanso` INT(11) DEFAULT 0,
    CHANGE `is_active` `esta_activo` TINYINT(1) DEFAULT 1,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: asignacion_horarios_empleados (antes schusuariocontrolhorario)
-- ===========================================================
ALTER TABLE `asignacion_horarios_empleados`
    CHANGE `id` `id_asignacion` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `user_id` `id_empleado` INT(11) NOT NULL,
    CHANGE `schedule_id` `id_horario` INT(11) NOT NULL,
    CHANGE `start_date` `fecha_inicio` DATE NOT NULL,
    CHANGE `end_date` `fecha_fin` DATE DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: notificaciones (antes ntfcontrolhorario)
-- ===========================================================
ALTER TABLE `notificaciones`
    CHANGE `id` `id_notificacion` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `user_id` `id_empleado` INT(11) NOT NULL,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `type` `tipo` VARCHAR(50) NOT NULL,
    CHANGE `title` `titulo` VARCHAR(255) NOT NULL,
    CHANGE `message` `mensaje` TEXT NOT NULL,
    CHANGE `priority` `prioridad` ENUM('low','normal','high','urgent') DEFAULT 'normal',
    CHANGE `category` `categoria` VARCHAR(50) DEFAULT 'general',
    CHANGE `is_read` `esta_leida` TINYINT(1) DEFAULT 0,
    CHANGE `read_at` `fecha_lectura` TIMESTAMP NULL DEFAULT NULL,
    CHANGE `action_url` `url_accion` VARCHAR(500) DEFAULT NULL,
    CHANGE `link` `enlace` VARCHAR(255) DEFAULT NULL,
    CHANGE `metadata` `metadatos` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: calendario_festivos (antes clfcontrolhorario)
-- ===========================================================
ALTER TABLE `calendario_festivos`
    CHANGE `id` `id_festivo` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `name` `nombre_festivo` VARCHAR(255) NOT NULL,
    CHANGE `description` `descripcion` TEXT DEFAULT NULL,
    CHANGE `date` `fecha` DATE NOT NULL,
    CHANGE `type` `tipo` ENUM('holiday','company_event','training','other') DEFAULT 'holiday',
    CHANGE `is_working_day` `es_dia_laboral` TINYINT(1) DEFAULT 0,
    CHANGE `is_recurring` `es_recurrente` TINYINT(1) DEFAULT 0,
    CHANGE `created_by` `creado_por` INT(11) DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLA: ubicaciones_geograficas (antes geocontrolhorario)
-- ===========================================================
ALTER TABLE `ubicaciones_geograficas`
    CHANGE `id` `id_ubicacion` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `name` `nombre_ubicacion` VARCHAR(255) NOT NULL,
    CHANGE `description` `descripcion` TEXT DEFAULT NULL,
    CHANGE `latitude` `latitud` DECIMAL(10,8) NOT NULL,
    CHANGE `longitude` `longitud` DECIMAL(11,8) NOT NULL,
    CHANGE `radius_meters` `radio_metros` INT(11) NOT NULL DEFAULT 100,
    CHANGE `type` `tipo` ENUM('office','branch','client','construction_site','warehouse','other') DEFAULT 'office',
    CHANGE `color_code` `codigo_color` VARCHAR(7) DEFAULT '#3B82F6',
    CHANGE `auto_check_in_enabled` `auto_entrada_habilitada` TINYINT(1) DEFAULT 0,
    CHANGE `auto_check_out_enabled` `auto_salida_habilitada` TINYINT(1) DEFAULT 0,
    CHANGE `auto_check_in_delay_minutes` `minutos_delay_entrada` INT(11) DEFAULT 0,
    CHANGE `auto_check_out_delay_minutes` `minutos_delay_salida` INT(11) DEFAULT 0,
    CHANGE `allow_check_in_outside` `permitir_entrada_fuera` TINYINT(1) DEFAULT 1,
    CHANGE `require_approval_outside` `requiere_aprobacion_fuera` TINYINT(1) DEFAULT 0,
    CHANGE `alert_on_entry` `alerta_entrada` TINYINT(1) DEFAULT 0,
    CHANGE `alert_on_exit` `alerta_salida` TINYINT(1) DEFAULT 0,
    CHANGE `alert_managers` `alertar_supervisores` TINYINT(1) DEFAULT 0,
    CHANGE `is_active` `esta_activa` TINYINT(1) DEFAULT 1,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHANGE `updated_at` `fecha_actualizacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ===========================================================
-- TABLAS RESTANTES (simplificadas)
-- ===========================================================

-- auditoria_sistema
ALTER TABLE `auditoria_sistema`
    CHANGE `id` `id_auditoria` INT(11) NOT NULL AUTO_INCREMENT,
    CHANGE `user_id` `id_empleado` INT(11) DEFAULT NULL,
    CHANGE `company_id` `id_empresa` INT(11) NOT NULL,
    CHANGE `action` `accion` VARCHAR(100) NOT NULL,
    CHANGE `entity_type` `tipo_entidad` VARCHAR(50) NOT NULL,
    CHANGE `entity_id` `id_entidad` INT(11) DEFAULT NULL,
    CHANGE `old_values` `valores_antiguos` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    CHANGE `new_values` `valores_nuevos` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
    CHANGE `ip_address` `direccion_ip` VARCHAR(45) DEFAULT NULL,
    CHANGE `user_agent` `agente_usuario` TEXT DEFAULT NULL,
    CHANGE `created_at` `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Continúa con las demás tablas siguiendo el mismo patrón...

SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================================
-- VERIFICAR CAMBIOS
-- ===========================================================
SELECT
    TABLE_NAME as 'Tabla',
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'Tipo',
    IS_NULLABLE as 'Nulo'
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'pwbnbxqt_ddbbControlHorario'
    AND TABLE_NAME IN ('empleados', 'registros_horarios', 'empresas')
ORDER BY
    TABLE_NAME, ORDINAL_POSITION;

-- ===========================================================
-- FIN DEL SCRIPT
-- ===========================================================
