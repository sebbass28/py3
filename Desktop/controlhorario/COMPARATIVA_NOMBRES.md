# Comparativa de Nombres: Antes vs Después

## 📊 Resumen Visual de Cambios

### Base de Datos

```
ANTES: controlhorario_basico
  ↓
AHORA: control_horario_empleados
```

---

## 📋 Tabla: EMPLEADOS (antes: usuarios)

### Estructura Comparativa

| # | Nombre ANTERIOR | Nombre NUEVO | Tipo | Cambios |
|---|-----------------|--------------|------|---------|
| 🔑 | `id` | `id_empleado` | INT | ✅ Más descriptivo |
| 👤 | `nombre` | `nombre_completo` | VARCHAR(100) | ✅ Más específico |
| 📧 | `email` | `correo_electronico` | VARCHAR(100) | ✅ Español completo |
| 🔒 | `password` | `contrasena_hash` | VARCHAR(255) | ✅ Indica que es hash |
| 🎭 | `rol` | `tipo_usuario` | ENUM | ✅ Valores en español |
| 📅 | `creado_en` | `fecha_creacion` | TIMESTAMP | ✅ Más claro |
| 🔄 | `actualizado_en` | `fecha_actualizacion` | TIMESTAMP | ✅ Más claro |
| ⭐ | - | `estado_activo` | BOOLEAN | 🆕 **NUEVA COLUMNA** |

### Valores de tipo_usuario

```
ANTES          →    AHORA
'admin'        →    'administrador'
'usuario'      →    'empleado'
```

---

## 🕐 Tabla: REGISTROS_HORARIOS (antes: fichajes)

### Estructura Comparativa

| # | Nombre ANTERIOR | Nombre NUEVO | Tipo | Cambios |
|---|-----------------|--------------|------|---------|
| 🔑 | `id` | `id_registro` | INT | ✅ Más descriptivo |
| 👤 | `usuario_id` | `id_empleado` | INT | ✅ Consistente con tabla empleados |
| 📅 | `fecha` | `fecha_registro` | DATE | ✅ Más específico |
| 🕐 | `hora_entrada` | `hora_entrada` | DATETIME | Sin cambios |
| 🕑 | `hora_salida` | `hora_salida` | DATETIME | Sin cambios |
| 📅 | `creado_en` | `fecha_creacion` | TIMESTAMP | ✅ Más claro |
| 🔄 | `actualizado_en` | `fecha_modificacion` | TIMESTAMP | ✅ Más específico |
| ⏱️ | - | `horas_trabajadas` | DECIMAL(5,2) | 🆕 **COLUMNA CALCULADA** |

### Columna Calculada

La columna `horas_trabajadas` se calcula automáticamente:

```sql
horas_trabajadas = (hora_salida - hora_entrada) / 60 minutos
```

**Ejemplo:**
- Entrada: 09:00:00
- Salida: 18:30:00
- Horas trabajadas: 9.50

---

## 🔄 Endpoints API - Cambios

### Autenticación

| Endpoint | Cambios |
|----------|---------|
| `POST /api/auth/login` | Devuelve `tipo_usuario` en lugar de `rol` |
| `GET /api/auth/perfil` | Devuelve `tipo_usuario` en lugar de `rol` |

### Registros (antes: fichajes)

| Endpoint ANTERIOR | Endpoint NUEVO |
|-------------------|----------------|
| `POST /api/fichajes` | `POST /api/registros` |
| `GET /api/fichajes` | `GET /api/registros` |
| `GET /api/fichajes/estado` | `GET /api/registros/estado` |
| - | `GET /api/registros/resumen-mes` 🆕 |

### Admin

| Endpoint ANTERIOR | Endpoint NUEVO |
|-------------------|----------------|
| `GET /api/admin/usuarios` | `GET /api/admin/empleados` |
| `GET /api/admin/fichajes` | `GET /api/admin/registros` |
| - | `GET /api/admin/resumen-empleados` 🆕 |

---

## 📦 Ejemplo de Respuesta API

### Antes (fichajes)

```json
{
  "id": 123,
  "usuario_id": 5,
  "fecha": "2025-11-29",
  "hora_entrada": "2025-11-29T09:00:00",
  "hora_salida": "2025-11-29T18:00:00",
  "creado_en": "2025-11-29T09:00:00",
  "actualizado_en": "2025-11-29T18:00:00"
}
```

### Ahora (registros_horarios)

```json
{
  "id": 123,
  "empleadoId": 5,
  "fecha": "2025-11-29",
  "horaEntrada": "2025-11-29T09:00:00",
  "horaSalida": "2025-11-29T18:00:00",
  "horasTrabajadas": 9.00
}
```

---

## 🎯 Ventajas del Nuevo Esquema

### ✅ Nombres Descriptivos
- `empleados` es más claro que `usuarios`
- `registros_horarios` es más específico que `fichajes`
- `id_empleado` es más descriptivo que `usuario_id`

### ✅ Todo en Español
- `correo_electronico` en lugar de `email`
- `contrasena_hash` en lugar de `password`
- `administrador` y `empleado` en lugar de `admin` y `usuario`

### ✅ Columnas Calculadas
- `horas_trabajadas` se calcula automáticamente
- Elimina la necesidad de calcular en el backend

### ✅ Nuevas Funcionalidades
- `estado_activo` permite desactivar empleados sin eliminarlos
- Vistas predefinidas para consultas comunes
- Procedimientos almacenados para operaciones frecuentes

### ✅ Mejor Organización
- Índices optimizados para consultas frecuentes
- Foreign keys con cascade para integridad
- Timestamps para auditoría completa

---

## 🔍 Consultas SQL - Comparativa

### Obtener registros de un empleado

**ANTES:**
```sql
SELECT *
FROM fichajes
WHERE usuario_id = 5
ORDER BY fecha DESC;
```

**AHORA:**
```sql
SELECT
    id_registro,
    fecha_registro,
    hora_entrada,
    hora_salida,
    horas_trabajadas
FROM registros_horarios
WHERE id_empleado = 5
ORDER BY fecha_registro DESC;
```

### Obtener empleados activos

**ANTES:**
```sql
SELECT id, nombre, email, rol
FROM usuarios;
```

**AHORA:**
```sql
SELECT
    id_empleado,
    nombre_completo,
    correo_electronico,
    tipo_usuario
FROM empleados
WHERE estado_activo = TRUE;
```

### Resumen de horas del mes

**ANTES (requiere cálculo manual):**
```sql
SELECT
    u.nombre,
    COUNT(*) as dias,
    SUM(TIMESTAMPDIFF(MINUTE, f.hora_entrada, f.hora_salida) / 60) as horas
FROM usuarios u
JOIN fichajes f ON u.id = f.usuario_id
WHERE DATE_FORMAT(f.fecha, '%Y-%m') = '2025-11'
    AND f.hora_salida IS NOT NULL
GROUP BY u.id, u.nombre;
```

**AHORA (usando columna calculada):**
```sql
SELECT
    e.nombre_completo,
    COUNT(*) AS dias_trabajados,
    SUM(r.horas_trabajadas) AS total_horas
FROM empleados e
JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE DATE_FORMAT(r.fecha_registro, '%Y-%m') = '2025-11'
    AND r.hora_salida IS NOT NULL
GROUP BY e.id_empleado, e.nombre_completo;
```

---

## 📝 Migración de Código Frontend

### Actualizar llamadas fetch()

**ANTES:**
```javascript
// Fichar entrada
fetch('/api/fichajes', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tipo: 'entrada' })
});

// Obtener fichajes
const response = await fetch('/api/fichajes');
const fichajes = await response.json();
```

**AHORA:**
```javascript
// Registrar entrada
fetch('/api/registros', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tipo: 'entrada' })
});

// Obtener registros
const response = await fetch('/api/registros');
const registros = await response.json();
```

### Actualizar manejo de respuestas

**ANTES:**
```javascript
fichajes.forEach(fichaje => {
    console.log(fichaje.usuario_id);
    console.log(fichaje.fecha);
});
```

**AHORA:**
```javascript
registros.forEach(registro => {
    console.log(registro.empleadoId);
    console.log(registro.fecha);
    console.log(registro.horasTrabajadas); // Nueva propiedad
});
```

---

## 🗂️ Archivos Creados

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `schema_mejorado.sql` | `/database/` | Esquema nuevo completo |
| `migracion_nombres_descriptivos.sql` | `/database/` | Script de migración |
| `consultas_utiles.sql` | `/database/` | Consultas de ejemplo |
| `server_mejorado.js` | `/backend/` | Backend actualizado |
| `GUIA_MIGRACION.md` | `/` | Guía paso a paso |
| `COMPARATIVA_NOMBRES.md` | `/` | Este archivo |
| `.env.example` | `/backend/` | Configuración actualizada |

---

## ⚡ Inicio Rápido

### 1. Ejecutar Migración

```bash
mysql -u root -p < database/migracion_nombres_descriptivos.sql
```

### 2. Actualizar .env

```bash
cd backend
# Editar .env y cambiar:
DB_NAME=control_horario_empleados
```

### 3. Usar nuevo servidor

```bash
# Opción A: Reemplazar el archivo
cp server_mejorado.js server.js

# Opción B: Cambiar el comando de inicio
node server_mejorado.js
```

---

## 📞 Verificación Post-Migración

### ✅ Checklist

- [ ] Base de datos `control_horario_empleados` creada
- [ ] Tabla `empleados` con datos migrados
- [ ] Tabla `registros_horarios` con datos migrados
- [ ] Columna `horas_trabajadas` calculándose correctamente
- [ ] `.env` actualizado con `DB_NAME=control_horario_empleados`
- [ ] Backend iniciado sin errores
- [ ] Login funcionando correctamente
- [ ] Registro de entrada/salida operativo
- [ ] API devolviendo datos correctamente

### 🔍 Comandos de Verificación

```bash
# Verificar que el servidor responde
curl http://localhost:3000/api/health

# Debería devolver:
# {"status":"ok","database":"connected"}
```

```sql
-- Verificar migración en MySQL
USE control_horario_empleados;
SELECT COUNT(*) FROM empleados;
SELECT COUNT(*) FROM registros_horarios;
```

---

**Última actualización**: 2025-11-29
