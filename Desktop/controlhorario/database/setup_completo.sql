-- ===========================================================
-- CONTROL HORARIO BÁSICO - Instalación Completa
-- ===========================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS controlhorario_basico
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE controlhorario_basico;

-- ===========================================================
-- TABLA: usuarios
-- ===========================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================
-- TABLA: fichajes
-- ===========================================================
CREATE TABLE IF NOT EXISTS fichajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada DATETIME NOT NULL,
    hora_salida DATETIME NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_fecha (usuario_id, fecha),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================
-- INSERTAR USUARIOS DE PRUEBA
-- ===========================================================

-- Usuario Admin (admin@demo.com / admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@demo.com', '$2a$10$UA/WFIi.OGL2kkc0gSC87.WNq487Oky1NBaKTxkkfYA7EzsPz4yDq', 'admin');

-- Usuario Normal (juan@demo.com / user123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Juan Pérez', 'juan@demo.com', '$2a$10$k3NyLGqP8XglmHZo0/C5EufzeVyTRLKFjzoAWTsvfPvnz5Yh0C8YC', 'usuario');

-- ===========================================================
-- VERIFICACIÓN
-- ===========================================================
SELECT 'Base de datos creada exitosamente!' as mensaje;
SELECT * FROM usuarios;
