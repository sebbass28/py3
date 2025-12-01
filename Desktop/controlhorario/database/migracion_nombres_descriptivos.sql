-- ===========================================================
-- SCRIPT DE MIGRACIÓN: De nombres genéricos a descriptivos
-- ===========================================================
--
-- Este script migra datos de:
--   controlhorario_basico → control_horario_empleados
--   usuarios → empleados
--   fichajes → registros_horarios
--
-- IMPORTANTE: Ejecuta este script DESPUÉS de crear el nuevo esquema
-- ===========================================================

USE controlhorario_basico;

-- ===========================================================
-- PASO 1: Crear la nueva base de datos si no existe
-- ===========================================================

CREATE DATABASE IF NOT EXISTS control_horario_empleados
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- ===========================================================
-- PASO 2: Crear las nuevas tablas en la nueva base de datos
-- ===========================================================

USE control_horario_empleados;

-- Tabla: empleados
CREATE TABLE IF NOT EXISTS empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('administrador', 'empleado') DEFAULT 'empleado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estado_activo BOOLEAN DEFAULT TRUE,
    INDEX idx_correo (correo_electronico),
    INDEX idx_tipo_usuario (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: registros_horarios
CREATE TABLE IF NOT EXISTS registros_horarios (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    fecha_registro DATE NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME NULL,
    horas_trabajadas DECIMAL(5,2) AS (
        CASE
            WHEN hora_salida IS NOT NULL
            THEN TIMESTAMPDIFF(MINUTE, hora_entrada, hora_salida) / 60
            ELSE NULL
        END
    ) STORED,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado) ON DELETE CASCADE,
    INDEX idx_empleado_fecha (id_empleado, fecha_registro),
    INDEX idx_fecha (fecha_registro),
    INDEX idx_hora_entrada (hora_entrada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================
-- PASO 3: Migrar datos de usuarios → empleados
-- ===========================================================

INSERT INTO control_horario_empleados.empleados
    (id_empleado, nombre_completo, correo_electronico, contrasena_hash, tipo_usuario, fecha_creacion, fecha_actualizacion, estado_activo)
SELECT
    id AS id_empleado,
    nombre AS nombre_completo,
    email AS correo_electronico,
    password AS contrasena_hash,
    CASE
        WHEN rol = 'admin' THEN 'administrador'
        WHEN rol = 'usuario' THEN 'empleado'
        ELSE 'empleado'
    END AS tipo_usuario,
    creado_en AS fecha_creacion,
    actualizado_en AS fecha_actualizacion,
    TRUE AS estado_activo
FROM controlhorario_basico.usuarios;

-- ===========================================================
-- PASO 4: Migrar datos de fichajes → registros_horarios
-- ===========================================================

INSERT INTO control_horario_empleados.registros_horarios
    (id_registro, id_empleado, fecha_registro, hora_entrada, hora_salida, fecha_creacion, fecha_modificacion)
SELECT
    id AS id_registro,
    usuario_id AS id_empleado,
    fecha AS fecha_registro,
    hora_entrada,
    hora_salida,
    creado_en AS fecha_creacion,
    actualizado_en AS fecha_modificacion
FROM controlhorario_basico.fichajes;

-- ===========================================================
-- PASO 5: Verificar la migración
-- ===========================================================

-- Contar registros migrados
SELECT 'Empleados migrados:' AS detalle, COUNT(*) AS cantidad
FROM control_horario_empleados.empleados
UNION ALL
SELECT 'Registros horarios migrados:' AS detalle, COUNT(*) AS cantidad
FROM control_horario_empleados.registros_horarios;

-- Comparar totales
SELECT
    'Usuarios originales:' AS tabla,
    COUNT(*) AS cantidad
FROM controlhorario_basico.usuarios
UNION ALL
SELECT
    'Empleados nuevos:' AS tabla,
    COUNT(*) AS cantidad
FROM control_horario_empleados.empleados
UNION ALL
SELECT
    'Fichajes originales:' AS tabla,
    COUNT(*) AS cantidad
FROM controlhorario_basico.fichajes
UNION ALL
SELECT
    'Registros horarios nuevos:' AS tabla,
    COUNT(*) AS cantidad
FROM control_horario_empleados.registros_horarios;

-- ===========================================================
-- PASO 6 (OPCIONAL): Eliminar base de datos antigua
-- ===========================================================
-- PRECAUCIÓN: Descomenta solo después de verificar que todo funciona
-- DROP DATABASE controlhorario_basico;

-- ===========================================================
-- INFORMACIÓN ADICIONAL
-- ===========================================================
--
-- Después de ejecutar esta migración:
-- 1. Actualiza el archivo .env con el nuevo nombre de base de datos:
--    DB_NAME=control_horario_empleados
--
-- 2. Actualiza todas las consultas SQL en server.js para usar los nuevos nombres
--
-- 3. Verifica que todas las relaciones funcionen correctamente
--
-- ===========================================================
