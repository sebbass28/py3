# Guía Completa de Renombrado de Base de Datos
## Sistema de Control Horario - Nombres Descriptivos en Español

---

## 📋 RESUMEN EJECUTIVO

Esta guía te permite transformar **TODAS** las tablas y columnas de tu base de datos de control horario de nombres abreviados en inglés a nombres **completamente descriptivos en español**.

### ¿Qué se cambia?

✅ **26 tablas** renombradas
✅ **Más de 200 columnas** renombradas
✅ **100% en español**
✅ **Nombres autodocumentados**

### Ejemplo de Transformación

**ANTES:**
```sql
SELECT u.first_name, t.check_in, t.check_out
FROM usrcontrolhorario u
JOIN tmrcontrolhorario t ON u.id = t.user_id;
```

**DESPUÉS:**
```sql
SELECT e.nombre, r.hora_entrada, r.hora_salida
FROM empleados e
JOIN registros_horarios r ON e.id_empleado = r.id_empleado;
```

---

## 🚀 EJECUCIÓN RÁPIDA (3 PASOS)

### Paso 1: Backup
```bash
mysqldump -u root -p pwbnbxqt_ddbbControlHorario > backup_$(date +%Y%m%d).sql
```

### Paso 2: Renombrar Tablas
```bash
mysql -u root -p pwbnbxqt_ddbbControlHorario < database/renombrar_todas_tablas.sql
```

### Paso 3: Renombrar Columnas
```bash
mysql -u root -p pwbnbxqt_ddbbControlHorario < database/renombrar_columnas_completo.sql
```

---

## 📊 TABLAS PRINCIPALES TRANSFORMADAS

### Top 5 Tablas Más Importantes

| Antes | Después | Uso |
|-------|---------|-----|
| `usrcontrolhorario` | `empleados` | 👥 Usuarios del sistema |
| `tmrcontrolhorario` | `registros_horarios` | ⏰ Fichajes entrada/salida |
| `cmpcontrolhorario` | `empresas` | 🏢 Datos de empresas |
| `prjcontrolhorario` | `proyectos` | 📊 Proyectos |
| `abscontrolhorario` | `ausencias_empleados` | 📅 Vacaciones y ausencias |

---

## 🔄 TRANSFORMACIÓN COMPLETA DE COLUMNAS

### Tabla: empleados (Principal)

| Columna Antes | Columna Después | Tipo |
|---------------|-----------------|------|
| `id` | `id_empleado` | INT |
| `company_id` | `id_empresa` | INT |
| `department_id` | `id_departamento` | INT |
| `email` | `correo_electronico` | VARCHAR(255) |
| `password` | `contrasena_hash` | VARCHAR(255) |
| `first_name` | `nombre` | VARCHAR(100) |
| `last_name` | `apellidos` | VARCHAR(100) |
| `phone` | `telefono` | VARCHAR(50) |
| `avatar` | `foto_perfil` | VARCHAR(255) |
| `role` | `tipo_usuario` | ENUM |
| `employee_code` | `codigo_empleado` | VARCHAR(50) |
| `hire_date` | `fecha_contratacion` | DATE |
| `hourly_rate` | `tarifa_hora` | DECIMAL(10,2) |
| `weekly_hours` | `horas_semanales` | INT |
| `is_active` | `esta_activo` | TINYINT(1) |
| `last_login` | `ultimo_acceso` | TIMESTAMP |
| `created_at` | `fecha_creacion` | TIMESTAMP |
| `updated_at` | `fecha_actualizacion` | TIMESTAMP |

### Tabla: registros_horarios (Principal)

| Columna Antes | Columna Después | Tipo |
|---------------|-----------------|------|
| `id` | `id_registro` | INT |
| `user_id` | `id_empleado` | INT |
| `company_id` | `id_empresa` | INT |
| `check_in` | `hora_entrada` | TIMESTAMP |
| `check_out` | `hora_salida` | TIMESTAMP |
| `check_in_latitude` | `latitud_entrada` | DECIMAL(10,8) |
| `check_in_longitude` | `longitud_entrada` | DECIMAL(11,8) |
| `check_out_latitude` | `latitud_salida` | DECIMAL(10,8) |
| `check_out_longitude` | `longitud_salida` | DECIMAL(11,8) |
| `check_in_ip` | `ip_entrada` | VARCHAR(45) |
| `check_out_ip` | `ip_salida` | VARCHAR(45) |
| `total_hours` | `horas_totales` | DECIMAL(5,2) |
| `break_minutes` | `minutos_descanso` | INT |
| `notes` | `notas` | TEXT |
| `status` | `estado` | ENUM |
| `approved_by` | `aprobado_por` | INT |
| `approved_at` | `fecha_aprobacion` | TIMESTAMP |
| `created_at` | `fecha_creacion` | TIMESTAMP |
| `updated_at` | `fecha_actualizacion` | TIMESTAMP |

---

## 📁 ARCHIVOS CREADOS

### Documentación

1. **[MAPEO_NOMBRES_TABLAS.md](MAPEO_NOMBRES_TABLAS.md)**
   - Listado completo de 26 tablas
   - Significado de prefijos
   - Categorización por módulo
   - Orden de migración recomendado

2. **[GUIA_RENOMBRADO_COMPLETO.md](GUIA_RENOMBRADO_COMPLETO.md)** (este archivo)
   - Guía paso a paso
   - Ejemplos de uso
   - Troubleshooting

### Scripts SQL

3. **[renombrar_todas_tablas.sql](database/renombrar_todas_tablas.sql)**
   - Renombra las 26 tablas
   - Preserva foreign keys
   - Muestra verificación

4. **[renombrar_columnas_completo.sql](database/renombrar_columnas_completo.sql)**
   - Renombra todas las columnas
   - Mantiene tipos de datos
   - Actualiza índices

---

## ⚙️ PROCESO DETALLADO

### 1. Preparación

```bash
# Conectar a MySQL
mysql -u root -p

# Verificar base de datos actual
USE pwbnbxqt_ddbbControlHorario;
SHOW TABLES;

# Ver una tabla de ejemplo
DESCRIBE usrcontrolhorario;
```

### 2. Backup Completo

```bash
# Backup completo
mysqldump -u root -p pwbnbxqt_ddbbControlHorario > backup_completo.sql

# Backup solo estructura
mysqldump -u root -p --no-data pwbnbxqt_ddbbControlHorario > backup_estructura.sql

# Backup solo datos
mysqldump -u root -p --no-create-info pwbnbxqt_ddbbControlHorario > backup_datos.sql
```

### 3. Renombrar Tablas

```bash
mysql -u root -p pwbnbxqt_ddbbControlHorario < database/renombrar_todas_tablas.sql
```

Verifica que funcionó:
```sql
SHOW TABLES;
-- Deberías ver: empleados, registros_horarios, empresas, etc.
```

### 4. Renombrar Columnas

```bash
mysql -u root -p pwbnbxqt_ddbbControlHorario < database/renombrar_columnas_completo.sql
```

Verifica que funcionó:
```sql
DESCRIBE empleados;
-- Deberías ver: id_empleado, nombre, apellidos, correo_electronico, etc.
```

### 5. Verificación Final

```sql
-- Ver todas las tablas renombradas
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'pwbnbxqt_ddbbControlHorario'
ORDER BY TABLE_NAME;

-- Ver columnas de tabla principal
SELECT COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'pwbnbxqt_ddbbControlHorario'
AND TABLE_NAME = 'empleados'
ORDER BY ORDINAL_POSITION;

-- Contar registros (deben ser los mismos)
SELECT COUNT(*) FROM empleados;
SELECT COUNT(*) FROM registros_horarios;
```

---

## 🔍 CONSULTAS DE EJEMPLO

### Antes del Renombrado
```sql
-- Obtener empleados con sus fichajes de hoy
SELECT
    u.first_name,
    u.last_name,
    t.check_in,
    t.check_out,
    t.total_hours
FROM usrcontrolhorario u
LEFT JOIN tmrcontrolhorario t ON u.id = t.user_id
WHERE DATE(t.check_in) = CURDATE()
  AND u.company_id = 1;
```

### Después del Renombrado
```sql
-- Obtener empleados con sus fichajes de hoy
SELECT
    e.nombre,
    e.apellidos,
    r.hora_entrada,
    r.hora_salida,
    r.horas_totales
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE DATE(r.hora_entrada) = CURDATE()
  AND e.id_empresa = 1;
```

### Resumen de Horas por Empleado
```sql
SELECT
    e.nombre,
    e.apellidos,
    e.correo_electronico,
    COUNT(r.id_registro) AS total_fichajes,
    SUM(r.horas_totales) AS total_horas_mes,
    AVG(r.horas_totales) AS promedio_horas_dia
FROM empleados e
LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE DATE_FORMAT(r.hora_entrada, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
  AND r.estado = 'completed'
GROUP BY e.id_empleado, e.nombre, e.apellidos, e.correo_electronico
ORDER BY total_horas_mes DESC;
```

### Ausencias Pendientes
```sql
SELECT
    e.nombre,
    e.apellidos,
    a.tipo_ausencia,
    a.fecha_inicio,
    a.fecha_fin,
    a.dias_totales,
    a.motivo
FROM ausencias_empleados a
INNER JOIN empleados e ON a.id_empleado = e.id_empleado
WHERE a.estado = 'pending'
  AND a.id_empresa = 1
ORDER BY a.fecha_inicio;
```

---

## 🛠️ ACTUALIZACIÓN DEL CÓDIGO BACKEND

### Actualizar Consultas

**Antes:**
```javascript
const [users] = await db.query(
  'SELECT * FROM usrcontrolhorario WHERE company_id = ?',
  [companyId]
);
```

**Después:**
```javascript
const [empleados] = await db.query(
  'SELECT * FROM empleados WHERE id_empresa = ?',
  [idEmpresa]
);
```

### Actualizar Modelos

**Antes:**
```javascript
class User {
  constructor(data) {
    this.id = data.id;
    this.companyId = data.company_id;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.email = data.email;
  }
}
```

**Después:**
```javascript
class Empleado {
  constructor(data) {
    this.id = data.id_empleado;
    this.idEmpresa = data.id_empresa;
    this.nombre = data.nombre;
    this.apellidos = data.apellidos;
    this.correoElectronico = data.correo_electronico;
  }
}
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Error de Foreign Key
```
ERROR 1217: Cannot delete or update a parent row: a foreign key constraint fails
```

**Solución:**
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Tu ALTER TABLE aquí
SET FOREIGN_KEY_CHECKS = 1;
```

### Problema 2: Tabla no existe
```
ERROR 1146: Table 'pwbnbxqt_ddbbControlHorario.empleados' doesn't exist
```

**Solución:**
Verifica que ejecutaste primero `renombrar_todas_tablas.sql`

### Problema 3: Columna no existe
```
ERROR 1054: Unknown column 'id_empleado' in 'field list'
```

**Solución:**
Verifica que ejecutaste `renombrar_columnas_completo.sql`

### Problema 4: Datos perdidos
```
SELECT COUNT(*) muestra menos registros
```

**Solución:**
Restaura desde backup:
```bash
mysql -u root -p pwbnbxqt_ddbbControlHorario < backup_completo.sql
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Antes de Ejecutar
- [ ] Backup completo realizado
- [ ] Backup verificado (restauración de prueba)
- [ ] Acceso a MySQL confirmado
- [ ] Scripts descargados y revisados

### Durante la Ejecución
- [ ] Script de tablas ejecutado sin errores
- [ ] Verificación de tablas renombradas
- [ ] Script de columnas ejecutado sin errores
- [ ] Verificación de columnas renombradas

### Después de Ejecutar
- [ ] Todas las tablas renombradas correctamente
- [ ] Todas las columnas renombradas correctamente
- [ ] Foreign keys funcionando
- [ ] Datos intactos (conteo de registros)
- [ ] Consultas de prueba ejecutadas
- [ ] Backend actualizado
- [ ] Aplicación funcionando

---

## 🎯 VENTAJAS DEL NUEVO SISTEMA

### ✅ Claridad Total
```sql
-- Antes: ¿Qué es tmr? ¿Qué es usr?
SELECT * FROM tmrcontrolhorario t
JOIN usrcontrolhorario u ON t.user_id = u.id;

-- Ahora: Inmediatamente comprensible
SELECT * FROM registros_horarios r
JOIN empleados e ON r.id_empleado = e.id_empleado;
```

### ✅ Sin Documentación Necesaria
- Los nombres explican su propósito
- Nuevos desarrolladores entienden el sistema rápidamente
- Menor curva de aprendizaje

### ✅ Mejor Mantenibilidad
- Refactorización más sencilla
- Menos errores de comprensión
- Código más limpio

### ✅ Ideal para Equipos Hispanohablantes
- Todo en español nativo
- Sin traducciones mentales
- Comunicación más fluida

---

## 📞 SOPORTE

### Si algo sale mal:

1. **DETÉN TODO**: No ejecutes más comandos
2. **Restaura el backup**:
   ```bash
   mysql -u root -p pwbnbxqt_ddbbControlHorario < backup_completo.sql
   ```
3. **Revisa los logs** de MySQL
4. **Contacta** al equipo de desarrollo

### Logs de MySQL

En Windows:
```
C:\ProgramData\MySQL\MySQL Server X.X\Data\[hostname].err
```

En Linux/Mac:
```bash
tail -f /var/log/mysql/error.log
```

---

## 📝 NOTAS FINALES

### Importante
- ⚠️ Este cambio afecta TODA la aplicación
- ⚠️ Requiere actualizar TODO el código backend
- ⚠️ Frontend también debe actualizarse si hace consultas directas
- ⚠️ Planifica un tiempo de inactividad

### Recomendaciones
- ✅ Ejecuta en entorno de prueba primero
- ✅ Realiza backup antes de producción
- ✅ Actualiza documentación del proyecto
- ✅ Notifica al equipo del cambio

### Tiempo Estimado
- Ejecución SQL: 5-10 minutos
- Actualización backend: 2-4 horas
- Pruebas: 1-2 horas
- **Total: ~4-7 horas**

---

**Creado**: 2025-11-29
**Versión**: 1.0
**Base de datos**: pwbnbxqt_ddbbControlHorario
**Tablas afectadas**: 26
**Autor**: Sistema de Control Horario
