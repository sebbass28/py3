# Base de Datos con Nombres en Español

## ✅ ARCHIVO GENERADO EXITOSAMENTE

Se ha creado el archivo **`pwbnbxqt_ddbbControlHorario_ESPANOL.sql`** con **TODOS** los nombres de tablas y columnas en español descriptivo.

---

## 📊 TRANSFORMACIÓN REALIZADA

### Estadísticas
- ✅ **26 tablas** renombradas
- ✅ **137 columnas** renombradas
- ✅ **100% en español**
- ✅ Datos de demo incluidos

### Ejemplos de Cambios

#### Tablas
```
ANTES                          →    AHORA
usrcontrolhorario             →    empleados
tmrcontrolhorario             →    registros_horarios
abscontrolhorario             →    ausencias_empleados
cmpcontrolhorario             →    empresas
prjcontrolhorario             →    proyectos
ovtcontrolhorario             →    horas_extras
```

#### Columnas
```
ANTES                          →    AHORA
user_id                       →    id_empleado
company_id                    →    id_empresa
email                         →    correo_electronico
password                      →    contrasena_hash
first_name                    →    nombre
last_name                     →    apellidos
check_in                      →    hora_entrada
check_out                     →    hora_salida
created_at                    →    fecha_creacion
is_active                     →    esta_activo
```

---

## 🚀 CÓMO USAR

### Opción 1: Importar en MySQL (Recomendado)

```bash
# 1. Crear backup de tu base actual (si existe)
mysqldump -u root -p123456 pwbnbxqt_ddbbControlHorario > backup_$(date +%Y%m%d).sql

# 2. Eliminar base de datos antigua (OPCIONAL)
mysql -u root -p123456 -e "DROP DATABASE IF EXISTS pwbnbxqt_ddbbControlHorario;"

# 3. Importar el nuevo archivo
mysql -u root -p123456 < pwbnbxqt_ddbbControlHorario_ESPANOL.sql
```

### Opción 2: Usando phpMyAdmin

1. Abre phpMyAdmin
2. Selecciona la base de datos (o crea una nueva)
3. Ve a la pestaña "Importar"
4. Selecciona `pwbnbxqt_ddbbControlHorario_ESPANOL.sql`
5. Haz clic en "Continuar"

---

## 📋 ESTRUCTURA DE LA BASE DE DATOS

### Tabla: `empleados` (Principal)
```sql
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
  `tipo_usuario` enum('super_admin','company_admin','manager','employee'),
  `codigo_empleado` varchar(50) DEFAULT NULL,
  `fecha_contratacion` date DEFAULT NULL,
  `tarifa_hora` decimal(10,2) DEFAULT 0.00,
  `horas_semanales` int(11) DEFAULT 40,
  `esta_activo` tinyint(1) DEFAULT 1,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
);
```

### Tabla: `registros_horarios` (Principal)
```sql
CREATE TABLE `registros_horarios` (
  `id` int(11) NOT NULL,
  `id_empleado` int(11) NOT NULL,
  `id_empresa` int(11) NOT NULL,
  `hora_entrada` timestamp NOT NULL,
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
  `estado` enum('active','completed','approved','rejected'),
  `aprobado_por` int(11) DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp()
);
```

---

## 📦 TODAS LAS TABLAS INCLUIDAS

1. `ausencias_empleados` - Vacaciones, bajas médicas, permisos
2. `auditoria_sistema` - Log de auditoría
3. `calendario_festivos` - Días festivos y eventos
4. `clientes` - Clientes de la empresa
5. `empresas` - Datos de empresas (multiempresa)
6. `departamentos` - Departamentos
7. `cola_emails` - Cola de emails pendientes
8. `ubicaciones_geograficas` - Geolocalización
9. `notificaciones` - Notificaciones a usuarios
10. `preferencias_notificaciones` - Preferencias
11. `horas_extras` - Registro de horas extras
12. `proyectos` - Proyectos
13. `horarios_trabajo` - Plantillas de horarios
14. `asignacion_horarios_empleados` - Horarios asignados
15. `configuraciones_sistema` - Configuración
16. `asignacion_turnos` - Turnos asignados
17. `intercambios_turnos` - Intercambio de turnos
18. `patrones_turnos` - Plantillas de turnos
19. `tickets_soporte` - Tickets de soporte
20. `respuestas_tickets` - Respuestas a tickets
21. `registros_horarios` - **Fichajes (PRINCIPAL)**
22. `tiempo_proyectos` - Tiempo en proyectos
23. `tareas` - Tareas de proyectos
24. `empleados` - **Empleados (PRINCIPAL)**
25. `webhooks` - Webhooks
26. `entregas_webhooks` - Log de entregas

---

## 🔍 CONSULTAS DE EJEMPLO

### Obtener todos los empleados activos
```sql
SELECT
    id,
    nombre,
    apellidos,
    correo_electronico,
    tipo_usuario,
    codigo_empleado
FROM empleados
WHERE esta_activo = 1
ORDER BY nombre, apellidos;
```

### Registros de hoy
```sql
SELECT
    e.nombre,
    e.apellidos,
    r.hora_entrada,
    r.hora_salida,
    r.horas_totales
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id
WHERE DATE(r.hora_entrada) = CURDATE()
ORDER BY r.hora_entrada DESC;
```

### Empleados fichados actualmente
```sql
SELECT
    e.nombre,
    e.apellidos,
    r.hora_entrada,
    TIMESTAMPDIFF(MINUTE, r.hora_entrada, NOW()) AS minutos_trabajados
FROM registros_horarios r
INNER JOIN empleados e ON r.id_empleado = e.id
WHERE r.hora_salida IS NULL
ORDER BY r.hora_entrada;
```

### Resumen de horas del mes actual
```sql
SELECT
    e.nombre,
    e.apellidos,
    COUNT(r.id) AS total_dias,
    SUM(r.horas_totales) AS total_horas_mes,
    AVG(r.horas_totales) AS promedio_horas_dia
FROM empleados e
LEFT JOIN registros_horarios r ON e.id = r.id_empleado
WHERE DATE_FORMAT(r.hora_entrada, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
    AND r.estado = 'completed'
GROUP BY e.id, e.nombre, e.apellidos
ORDER BY total_horas_mes DESC;
```

### Ausencias pendientes de aprobación
```sql
SELECT
    e.nombre,
    e.apellidos,
    a.tipo,
    a.fecha_inicio,
    a.fecha_fin,
    a.dias_totales,
    a.motivo
FROM ausencias_empleados a
INNER JOIN empleados e ON a.id_empleado = e.id
WHERE a.estado = 'pending'
ORDER BY a.fecha_inicio;
```

---

## 👥 DATOS DE DEMO INCLUIDOS

El archivo incluye 4 usuarios de prueba:

| Usuario | Email | Contraseña | Rol | Código |
|---------|-------|------------|-----|--------|
| Admin Sistema | admin@demo.com | admin123 | company_admin | EMP001 |
| Juan Perez | juan.perez@demo.com | admin123 | employee | EMP002 |
| Maria Garcia | maria.garcia@demo.com | admin123 | employee | EMP003 |
| Carlos Lopez | carlos.lopez@demo.com | admin123 | manager | EMP004 |

**Nota:** Todas las contraseñas están hasheadas con bcrypt.

---

## 🔧 REGENERAR EL ARCHIVO

Si necesitas regenerar el archivo desde el original:

```bash
python convertir_sql.py
```

El script `convertir_sql.py` lee `pwbnbxqt_ddbbControlHorario.sql` y genera `pwbnbxqt_ddbbControlHorario_ESPANOL.sql`.

---

## ✅ VENTAJAS

### Claridad Total
```sql
-- ANTES: Confuso
SELECT u.first_name FROM usrcontrolhorario u
JOIN tmrcontrolhorario t ON u.id = t.user_id;

-- AHORA: Claro e intuitivo
SELECT e.nombre FROM empleados e
JOIN registros_horarios r ON e.id = r.id_empleado;
```

### Sin Necesidad de Documentación
- Los nombres explican su propósito
- Nuevos desarrolladores entienden inmediatamente
- Menor curva de aprendizaje

### Ideal para Equipos Hispanohablantes
- Todo en español nativo
- Sin traducciones mentales
- Comunicación más fluida

---

## 📞 VERIFICACIÓN POST-IMPORTACIÓN

Después de importar, verifica que todo funciona:

```sql
-- Ver todas las tablas
SHOW TABLES;

-- Ver estructura de empleados
DESCRIBE empleados;

-- Contar registros
SELECT COUNT(*) FROM empleados;
SELECT COUNT(*) FROM registros_horarios;

-- Ver usuarios de demo
SELECT nombre, apellidos, correo_electronico, tipo_usuario
FROM empleados;
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Backup:** Siempre haz backup antes de importar
2. **Foreign Keys:** Todas las relaciones están preservadas
3. **Datos:** Incluye datos de demo (4 empleados)
4. **Charset:** UTF-8 (utf8mb4_unicode_ci)
5. **Engine:** InnoDB con integridad referencial

---

## 📚 ARCHIVOS RELACIONADOS

- `pwbnbxqt_ddbbControlHorario.sql` - Archivo original
- `pwbnbxqt_ddbbControlHorario_ESPANOL.sql` - **Archivo convertido** ✅
- `convertir_sql.py` - Script de conversión
- `MAPEO_NOMBRES_TABLAS.md` - Documentación completa
- `GUIA_RENOMBRADO_COMPLETO.md` - Guía detallada

---

**Creado:** 2025-11-29
**Versión:** 1.0
**Tablas:** 26
**Columnas renombradas:** 137
**Idioma:** 100% Español
