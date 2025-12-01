-- ===========================================================
-- CONTROL HORARIO - Base de Datos con Nombres Descriptivos
-- ===========================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS control_horario_empleados
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE control_horario_empleados;

-- ===========================================================
-- TABLA: empleados (anteriormente 'usuarios')
-- ===========================================================
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

-- ===========================================================
-- TABLA: registros_horarios (anteriormente 'fichajes')
-- ===========================================================
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
-- INSERTAR EMPLEADOS DE PRUEBA
-- ===========================================================

-- Contraseña: admin123 (hash bcrypt)
-- Nota: Debes generar el hash real con bcrypt
INSERT INTO empleados (nombre_completo, correo_electronico, contrasena_hash, tipo_usuario) VALUES
('Administrador del Sistema', 'admin@empresa.com', '$2a$10$YourHashHere', 'administrador');

-- Contraseña: empleado123 (hash bcrypt)
INSERT INTO empleados (nombre_completo, correo_electronico, contrasena_hash, tipo_usuario) VALUES
('Juan Pérez García', 'juan.perez@empresa.com', '$2a$10$YourHashHere', 'empleado');

INSERT INTO empleados (nombre_completo, correo_electronico, contrasena_hash, tipo_usuario) VALUES
('María López Fernández', 'maria.lopez@empresa.com', '$2a$10$YourHashHere', 'empleado');

-- ===========================================================
-- VISTAS ÚTILES
-- ===========================================================

-- Vista: Resumen de horas trabajadas por empleado
CREATE OR REPLACE VIEW vista_resumen_horas_empleado AS
SELECT
    e.id_empleado,
    e.nombre_completo,
    e.correo_electronico,
    DATE_FORMAT(r.fecha_registro, '%Y-%m') AS mes,
    COUNT(r.id_registro) AS total_registros,
    SUM(r.horas_trabajadas) AS total_horas_trabajadas,
    AVG(r.horas_trabajadas) AS promedio_horas_diarias
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE r.hora_salida IS NOT NULL
GROUP BY e.id_empleado, e.nombre_completo, e.correo_electronico, mes;

-- Vista: Registros horarios activos (sin salida)
CREATE OR REPLACE VIEW vista_registros_activos AS
SELECT
    r.id_registro,
    r.id_empleado,
    e.nombre_completo,
    e.correo_electronico,
    r.fecha_registro,
    r.hora_entrada,
    TIMESTAMPDIFF(MINUTE, r.hora_entrada, NOW()) AS minutos_transcurridos
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id_empleado
WHERE r.hora_salida IS NULL
ORDER BY r.hora_entrada DESC;

-- ===========================================================
-- PROCEDIMIENTOS ALMACENADOS
-- ===========================================================

DELIMITER //

-- Procedimiento: Registrar entrada de empleado
CREATE PROCEDURE sp_registrar_entrada(
    IN p_id_empleado INT
)
BEGIN
    DECLARE v_registro_activo INT;

    -- Verificar si hay un registro activo
    SELECT COUNT(*) INTO v_registro_activo
    FROM registros_horarios
    WHERE id_empleado = p_id_empleado
    AND hora_salida IS NULL;

    IF v_registro_activo > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El empleado ya tiene una entrada activa sin salida';
    ELSE
        INSERT INTO registros_horarios (id_empleado, fecha_registro, hora_entrada)
        VALUES (p_id_empleado, CURDATE(), NOW());
    END IF;
END //

-- Procedimiento: Registrar salida de empleado
CREATE PROCEDURE sp_registrar_salida(
    IN p_id_empleado INT
)
BEGIN
    DECLARE v_id_registro INT;

    -- Buscar el registro activo
    SELECT id_registro INTO v_id_registro
    FROM registros_horarios
    WHERE id_empleado = p_id_empleado
    AND hora_salida IS NULL
    ORDER BY id_registro DESC
    LIMIT 1;

    IF v_id_registro IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay una entrada activa para registrar la salida';
    ELSE
        UPDATE registros_horarios
        SET hora_salida = NOW()
        WHERE id_registro = v_id_registro;
    END IF;
END //

DELIMITER ;

-- ===========================================================
-- NOTAS DE MIGRACIÓN
-- ===========================================================
--
-- MAPEO DE NOMBRES:
--
-- Tablas:
--   usuarios → empleados
--   fichajes → registros_horarios
--
-- Columnas de 'empleados':
--   id → id_empleado
--   nombre → nombre_completo
--   email → correo_electronico
--   password → contrasena_hash
--   rol → tipo_usuario ('admin'→'administrador', 'usuario'→'empleado')
--   creado_en → fecha_creacion
--   actualizado_en → fecha_actualizacion
--   + estado_activo (nueva columna)
--
-- Columnas de 'registros_horarios':
--   id → id_registro
--   usuario_id → id_empleado
--   fecha → fecha_registro
--   hora_entrada → (sin cambio)
--   hora_salida → (sin cambio)
--   creado_en → fecha_creacion
--   actualizado_en → fecha_modificacion
--   + horas_trabajadas (columna calculada automáticamente)
--
-- ===========================================================
