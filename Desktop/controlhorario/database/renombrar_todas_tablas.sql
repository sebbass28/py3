-- ===========================================================
-- SCRIPT DE RENOMBRADO DE TABLAS
-- De nombres abreviados a nombres descriptivos en español
-- ===========================================================
--
-- IMPORTANTE: Este script RENOMBRA las tablas existentes
-- NO crea nuevas tablas ni migra datos
-- Ejecutar en la base de datos: pwbnbxqt_ddbbControlHorario
--
-- ===========================================================

USE pwbnbxqt_ddbbControlHorario;

-- ===========================================================
-- DESACTIVAR COMPROBACIONES DE FOREIGN KEYS TEMPORALMENTE
-- ===========================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================================
-- RENOMBRAR TABLAS (orden alfabético)
-- ===========================================================

-- A
ALTER TABLE `abscontrolhorario` RENAME TO `ausencias_empleados`;

-- AU
ALTER TABLE `audcontrolhorario` RENAME TO `auditoria_sistema`;

-- C
ALTER TABLE `clfcontrolhorario` RENAME TO `calendario_festivos`;
ALTER TABLE `clicontrolhorario` RENAME TO `clientes`;
ALTER TABLE `cmpcontrolhorario` RENAME TO `empresas`;

-- D
ALTER TABLE `dptcontrolhorario` RENAME TO `departamentos`;

-- E
ALTER TABLE `emlcolacontrolhorario` RENAME TO `cola_emails`;

-- G
ALTER TABLE `geocontrolhorario` RENAME TO `ubicaciones_geograficas`;

-- N
ALTER TABLE `ntfcontrolhorario` RENAME TO `notificaciones`;
ALTER TABLE `ntfpreferenciascontrolhorario` RENAME TO `preferencias_notificaciones`;

-- O
ALTER TABLE `ovtcontrolhorario` RENAME TO `horas_extras`;

-- P
ALTER TABLE `prjcontrolhorario` RENAME TO `proyectos`;

-- S
ALTER TABLE `schcontrolhorario` RENAME TO `horarios_trabajo`;
ALTER TABLE `schusuariocontrolhorario` RENAME TO `asignacion_horarios_empleados`;
ALTER TABLE `setcontrolhorario` RENAME TO `configuraciones_sistema`;
ALTER TABLE `shfasignacioncontrolhorario` RENAME TO `asignacion_turnos`;
ALTER TABLE `shfintercambiocontrolhorario` RENAME TO `intercambios_turnos`;
ALTER TABLE `shfpatroncontrolhorario` RENAME TO `patrones_turnos`;

-- T
ALTER TABLE `tktcontrolhorario` RENAME TO `tickets_soporte`;
ALTER TABLE `tktrespuestascontrolhorario` RENAME TO `respuestas_tickets`;
ALTER TABLE `tmrcontrolhorario` RENAME TO `registros_horarios`;
ALTER TABLE `tmrproyectocontrolhorario` RENAME TO `tiempo_proyectos`;
ALTER TABLE `tskcontrolhorario` RENAME TO `tareas`;

-- U
ALTER TABLE `usrcontrolhorario` RENAME TO `empleados`;

-- W
ALTER TABLE `wbhcontrolhorario` RENAME TO `webhooks`;
ALTER TABLE `wbhentregascontrolhorario` RENAME TO `entregas_webhooks`;

-- ===========================================================
-- REACTIVAR COMPROBACIONES DE FOREIGN KEYS
-- ===========================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================================
-- VERIFICAR RENOMBRADO
-- ===========================================================
SELECT
    TABLE_NAME as 'Tablas Renombradas',
    TABLE_ROWS as 'Filas'
FROM
    INFORMATION_SCHEMA.TABLES
WHERE
    TABLE_SCHEMA = 'pwbnbxqt_ddbbControlHorario'
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY
    TABLE_NAME;

-- ===========================================================
-- RESUMEN DE CAMBIOS
-- ===========================================================
SELECT
    'Total de tablas renombradas:' AS Detalle,
    COUNT(*) AS Cantidad
FROM
    INFORMATION_SCHEMA.TABLES
WHERE
    TABLE_SCHEMA = 'pwbnbxqt_ddbbControlHorario'
    AND TABLE_TYPE = 'BASE TABLE';

-- ===========================================================
-- NOTAS IMPORTANTES
-- ===========================================================
--
-- 1. Las FOREIGN KEYS se mantienen intactas
-- 2. Los ÍNDICES conservan sus nombres originales
-- 3. Los datos NO se modifican
-- 4. Las vistas pueden dejar de funcionar (si existen)
-- 5. Los procedimientos almacenados pueden fallar (si existen)
--
-- SIGUIENTE PASO: Actualizar el código backend para usar los nuevos nombres
--
-- ===========================================================
