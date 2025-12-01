-- ===========================================================
-- CONSULTAS ÚTILES - Control Horario con Nombres Descriptivos
-- ===========================================================

USE control_horario_empleados;

-- ===========================================================
-- CONSULTAS BÁSICAS
-- ===========================================================

-- Ver todos los empleados activos
SELECT
    id_empleado,
    nombre_completo,
    correo_electronico,
    tipo_usuario,
    DATE_FORMAT(fecha_creacion, '%d/%m/%Y') AS fecha_alta
FROM empleados
WHERE estado_activo = TRUE
ORDER BY nombre_completo;

-- Ver empleados por tipo
SELECT
    tipo_usuario,
    COUNT(*) AS total
FROM empleados
WHERE estado_activo = TRUE
GROUP BY tipo_usuario;

-- Ver registros del día actual
SELECT
    r.id_registro,
    e.nombre_completo,
    TIME(r.hora_entrada) AS entrada,
    TIME(r.hora_salida) AS salida,
    r.horas_trabajadas
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id_empleado
WHERE r.fecha_registro = CURDATE()
ORDER BY r.hora_entrada DESC;

-- ===========================================================
-- CONSULTAS DE ESTADO ACTUAL
-- ===========================================================

-- Ver quién está actualmente trabajando (fichado sin salida)
SELECT
    e.id_empleado,
    e.nombre_completo,
    e.correo_electronico,
    r.hora_entrada,
    TIMESTAMPDIFF(MINUTE, r.hora_entrada, NOW()) AS minutos_trabajados,
    TIME_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, r.hora_entrada, NOW())), '%H:%i') AS tiempo_trabajado
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id_empleado
WHERE r.hora_salida IS NULL
ORDER BY r.hora_entrada;

-- Ver quién NO ha fichado hoy
SELECT
    e.id_empleado,
    e.nombre_completo,
    e.correo_electronico,
    e.tipo_usuario
FROM empleados e
WHERE e.estado_activo = TRUE
AND e.id_empleado NOT IN (
    SELECT DISTINCT id_empleado
    FROM registros_horarios
    WHERE fecha_registro = CURDATE()
)
ORDER BY e.nombre_completo;

-- ===========================================================
-- CONSULTAS DE RESUMEN DIARIO
-- ===========================================================

-- Resumen de horas trabajadas HOY por empleado
SELECT
    e.nombre_completo,
    COUNT(r.id_registro) AS registros_hoy,
    SUM(r.horas_trabajadas) AS total_horas,
    MIN(TIME(r.hora_entrada)) AS primera_entrada,
    MAX(TIME(r.hora_salida)) AS ultima_salida
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
    AND r.fecha_registro = CURDATE()
    AND r.hora_salida IS NOT NULL
WHERE e.estado_activo = TRUE
GROUP BY e.id_empleado, e.nombre_completo
ORDER BY total_horas DESC;

-- Resumen diario con detalles
SELECT
    r.fecha_registro,
    COUNT(DISTINCT r.id_empleado) AS empleados_trabajaron,
    COUNT(r.id_registro) AS total_registros,
    SUM(r.horas_trabajadas) AS total_horas_empresa,
    AVG(r.horas_trabajadas) AS promedio_horas_empleado
FROM registros_horarios r
WHERE r.hora_salida IS NOT NULL
GROUP BY r.fecha_registro
ORDER BY r.fecha_registro DESC
LIMIT 30;

-- ===========================================================
-- CONSULTAS DE RESUMEN SEMANAL
-- ===========================================================

-- Resumen de la semana actual por empleado
SELECT
    e.nombre_completo,
    COUNT(DISTINCT r.fecha_registro) AS dias_trabajados,
    SUM(r.horas_trabajadas) AS total_horas_semana,
    AVG(r.horas_trabajadas) AS promedio_horas_dia
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
    AND YEARWEEK(r.fecha_registro, 1) = YEARWEEK(CURDATE(), 1)
    AND r.hora_salida IS NOT NULL
WHERE e.estado_activo = TRUE
GROUP BY e.id_empleado, e.nombre_completo
ORDER BY total_horas_semana DESC;

-- ===========================================================
-- CONSULTAS DE RESUMEN MENSUAL
-- ===========================================================

-- Resumen del mes actual por empleado
SELECT
    e.nombre_completo,
    e.correo_electronico,
    COUNT(DISTINCT r.fecha_registro) AS dias_trabajados,
    SUM(r.horas_trabajadas) AS total_horas_mes,
    AVG(r.horas_trabajadas) AS promedio_horas_dia,
    MIN(r.horas_trabajadas) AS minimo_horas_dia,
    MAX(r.horas_trabajadas) AS maximo_horas_dia
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
    AND DATE_FORMAT(r.fecha_registro, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
    AND r.hora_salida IS NOT NULL
WHERE e.estado_activo = TRUE
GROUP BY e.id_empleado, e.nombre_completo, e.correo_electronico
ORDER BY total_horas_mes DESC;

-- Resumen mensual comparativo (últimos 3 meses)
SELECT
    DATE_FORMAT(r.fecha_registro, '%Y-%m') AS mes,
    COUNT(DISTINCT r.id_empleado) AS empleados_activos,
    COUNT(r.id_registro) AS total_registros,
    SUM(r.horas_trabajadas) AS total_horas,
    AVG(r.horas_trabajadas) AS promedio_horas
FROM registros_horarios r
WHERE r.hora_salida IS NOT NULL
    AND r.fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
GROUP BY mes
ORDER BY mes DESC;

-- ===========================================================
-- CONSULTAS DE ANÁLISIS Y ESTADÍSTICAS
-- ===========================================================

-- Top 10 empleados con más horas este mes
SELECT
    e.nombre_completo,
    COUNT(DISTINCT r.fecha_registro) AS dias,
    SUM(r.horas_trabajadas) AS total_horas,
    AVG(r.horas_trabajadas) AS promedio_horas
FROM empleados e
INNER JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE DATE_FORMAT(r.fecha_registro, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
    AND r.hora_salida IS NOT NULL
GROUP BY e.id_empleado, e.nombre_completo
ORDER BY total_horas DESC
LIMIT 10;

-- Empleados con jornadas irregulares (más de 10 horas o menos de 4)
SELECT
    e.nombre_completo,
    r.fecha_registro,
    TIME(r.hora_entrada) AS entrada,
    TIME(r.hora_salida) AS salida,
    r.horas_trabajadas,
    CASE
        WHEN r.horas_trabajadas > 10 THEN 'Jornada extensa'
        WHEN r.horas_trabajadas < 4 THEN 'Jornada corta'
    END AS tipo_irregularidad
FROM empleados e
INNER JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE r.hora_salida IS NOT NULL
    AND (r.horas_trabajadas > 10 OR r.horas_trabajadas < 4)
ORDER BY r.fecha_registro DESC, r.horas_trabajadas DESC;

-- Promedio de hora de entrada por empleado
SELECT
    e.nombre_completo,
    COUNT(*) AS total_dias,
    TIME_FORMAT(
        SEC_TO_TIME(AVG(TIME_TO_SEC(TIME(r.hora_entrada)))),
        '%H:%i'
    ) AS hora_promedio_entrada,
    MIN(TIME(r.hora_entrada)) AS entrada_mas_temprana,
    MAX(TIME(r.hora_entrada)) AS entrada_mas_tardia
FROM empleados e
INNER JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE r.fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY e.id_empleado, e.nombre_completo
ORDER BY hora_promedio_entrada;

-- ===========================================================
-- CONSULTAS DE AUDITORÍA
-- ===========================================================

-- Registros sin salida (posibles olvidos)
SELECT
    e.nombre_completo,
    e.correo_electronico,
    r.fecha_registro,
    r.hora_entrada,
    DATEDIFF(CURDATE(), r.fecha_registro) AS dias_sin_cerrar
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id_empleado
WHERE r.hora_salida IS NULL
    AND r.fecha_registro < CURDATE()
ORDER BY r.fecha_registro DESC;

-- Registros modificados recientemente
SELECT
    e.nombre_completo,
    r.fecha_registro,
    TIME(r.hora_entrada) AS entrada,
    TIME(r.hora_salida) AS salida,
    r.fecha_creacion,
    r.fecha_modificacion,
    TIMESTAMPDIFF(MINUTE, r.fecha_creacion, r.fecha_modificacion) AS minutos_hasta_modificacion
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id_empleado
WHERE r.fecha_modificacion > r.fecha_creacion
    AND r.fecha_modificacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY r.fecha_modificacion DESC;

-- Empleados creados recientemente
SELECT
    nombre_completo,
    correo_electronico,
    tipo_usuario,
    estado_activo,
    DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') AS fecha_alta
FROM empleados
WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY fecha_creacion DESC;

-- ===========================================================
-- CONSULTAS PARA NÓMINA
-- ===========================================================

-- Reporte mensual para nómina (mes anterior)
SELECT
    e.id_empleado,
    e.nombre_completo,
    e.correo_electronico,
    COUNT(DISTINCT r.fecha_registro) AS dias_trabajados,
    SUM(r.horas_trabajadas) AS total_horas_mes,
    ROUND(SUM(r.horas_trabajadas), 2) AS horas_facturables
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
    AND DATE_FORMAT(r.fecha_registro, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
    AND r.hora_salida IS NOT NULL
WHERE e.estado_activo = TRUE
GROUP BY e.id_empleado, e.nombre_completo, e.correo_electronico
ORDER BY e.nombre_completo;

-- Detalle diario para un empleado específico en un mes
SELECT
    r.fecha_registro,
    DAYNAME(r.fecha_registro) AS dia_semana,
    TIME(r.hora_entrada) AS entrada,
    TIME(r.hora_salida) AS salida,
    r.horas_trabajadas
FROM registros_horarios r
WHERE r.id_empleado = 1 -- Cambiar por el ID del empleado
    AND DATE_FORMAT(r.fecha_registro, '%Y-%m') = '2025-11' -- Cambiar por el mes deseado
    AND r.hora_salida IS NOT NULL
ORDER BY r.fecha_registro;

-- ===========================================================
-- CONSULTAS DE RENDIMIENTO
-- ===========================================================

-- Índice de puntualidad (comparado con hora de inicio estándar 9:00)
SELECT
    e.nombre_completo,
    COUNT(*) AS total_dias,
    SUM(CASE WHEN TIME(r.hora_entrada) <= '09:00:00' THEN 1 ELSE 0 END) AS dias_puntuales,
    ROUND(
        (SUM(CASE WHEN TIME(r.hora_entrada) <= '09:00:00' THEN 1 ELSE 0 END) / COUNT(*)) * 100,
        2
    ) AS porcentaje_puntualidad
FROM empleados e
INNER JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE r.fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    AND e.estado_activo = TRUE
GROUP BY e.id_empleado, e.nombre_completo
HAVING total_dias >= 10
ORDER BY porcentaje_puntualidad DESC;

-- Asistencia por día de la semana
SELECT
    DAYNAME(r.fecha_registro) AS dia_semana,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT r.id_empleado) AS empleados_diferentes,
    AVG(r.horas_trabajadas) AS promedio_horas
FROM registros_horarios r
WHERE r.hora_salida IS NOT NULL
    AND r.fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
GROUP BY dia_semana, DAYOFWEEK(r.fecha_registro)
ORDER BY DAYOFWEEK(r.fecha_registro);

-- ===========================================================
-- CONSULTAS ADMINISTRATIVAS
-- ===========================================================

-- Total de empleados y su distribución
SELECT
    tipo_usuario,
    estado_activo,
    COUNT(*) AS total
FROM empleados
GROUP BY tipo_usuario, estado_activo
ORDER BY tipo_usuario, estado_activo DESC;

-- Empleados sin registros en los últimos 30 días
SELECT
    e.nombre_completo,
    e.correo_electronico,
    e.tipo_usuario,
    MAX(r.fecha_registro) AS ultimo_registro
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE e.estado_activo = TRUE
GROUP BY e.id_empleado, e.nombre_completo, e.correo_electronico, e.tipo_usuario
HAVING ultimo_registro IS NULL
    OR ultimo_registro < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY ultimo_registro DESC;

-- Estadísticas generales del sistema
SELECT
    (SELECT COUNT(*) FROM empleados WHERE estado_activo = TRUE) AS total_empleados_activos,
    (SELECT COUNT(*) FROM empleados WHERE tipo_usuario = 'administrador') AS total_administradores,
    (SELECT COUNT(*) FROM registros_horarios WHERE fecha_registro = CURDATE()) AS registros_hoy,
    (SELECT COUNT(*) FROM registros_horarios WHERE hora_salida IS NULL) AS registros_sin_cerrar,
    (SELECT SUM(horas_trabajadas) FROM registros_horarios WHERE DATE_FORMAT(fecha_registro, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS horas_mes_actual;

-- ===========================================================
-- FIN DE CONSULTAS ÚTILES
-- ===========================================================
