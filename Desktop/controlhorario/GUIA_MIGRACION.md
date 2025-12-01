# Guía de Migración a Nombres Descriptivos

## 📋 Resumen de Cambios

Esta migración actualiza la base de datos del sistema de control horario con nombres más descriptivos e identificativos en español.

### Cambios en la Base de Datos

| Elemento Anterior | Nuevo Nombre | Descripción |
|-------------------|--------------|-------------|
| **Base de Datos** |
| `controlhorario_basico` | `control_horario_empleados` | Nombre más descriptivo |
| **Tablas** |
| `usuarios` | `empleados` | Identifica claramente que son empleados |
| `fichajes` | `registros_horarios` | Más específico sobre qué se registra |

### Cambios en Columnas - Tabla `empleados`

| Columna Anterior | Nueva Columna | Tipo | Descripción |
|------------------|---------------|------|-------------|
| `id` | `id_empleado` | INT | ID único del empleado |
| `nombre` | `nombre_completo` | VARCHAR(100) | Nombre completo del empleado |
| `email` | `correo_electronico` | VARCHAR(100) | Correo electrónico |
| `password` | `contrasena_hash` | VARCHAR(255) | Hash de la contraseña |
| `rol` | `tipo_usuario` | ENUM | 'admin'→'administrador', 'usuario'→'empleado' |
| `creado_en` | `fecha_creacion` | TIMESTAMP | Fecha de creación del registro |
| `actualizado_en` | `fecha_actualizacion` | TIMESTAMP | Fecha de última actualización |
| - | `estado_activo` | BOOLEAN | **NUEVA**: Estado del empleado |

### Cambios en Columnas - Tabla `registros_horarios`

| Columna Anterior | Nueva Columna | Tipo | Descripción |
|------------------|---------------|------|-------------|
| `id` | `id_registro` | INT | ID único del registro |
| `usuario_id` | `id_empleado` | INT | ID del empleado (FK) |
| `fecha` | `fecha_registro` | DATE | Fecha del registro |
| `hora_entrada` | `hora_entrada` | DATETIME | Sin cambios |
| `hora_salida` | `hora_salida` | DATETIME | Sin cambios |
| `creado_en` | `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `actualizado_en` | `fecha_modificacion` | TIMESTAMP | Fecha de modificación |
| - | `horas_trabajadas` | DECIMAL(5,2) | **NUEVA**: Calculada automáticamente |

## 🚀 Proceso de Migración

### Paso 1: Backup de la Base de Datos Actual

```bash
mysqldump -u root -p controlhorario_basico > backup_controlhorario_$(date +%Y%m%d).sql
```

### Paso 2: Ejecutar el Script de Migración

```bash
mysql -u root -p < database/migracion_nombres_descriptivos.sql
```

### Paso 3: Verificar la Migración

Accede a MySQL y ejecuta:

```sql
USE control_horario_empleados;

-- Verificar empleados
SELECT COUNT(*) AS total_empleados FROM empleados;

-- Verificar registros horarios
SELECT COUNT(*) AS total_registros FROM registros_horarios;

-- Ver estructura de empleados
DESCRIBE empleados;

-- Ver estructura de registros horarios
DESCRIBE registros_horarios;
```

### Paso 4: Actualizar Variables de Entorno

Edita el archivo `.env` en el directorio `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=control_horario_empleados
JWT_SECRET=tu_secreto_jwt
PORT=3000
```

### Paso 5: Actualizar el Backend

Opción A - Reemplazar el archivo actual:
```bash
cd backend
cp server.js server_antiguo.js.bak
cp server_mejorado.js server.js
```

Opción B - Mantener ambos y cambiar el arranque:
```bash
# En package.json, cambia:
# "start": "node server.js"
# por:
# "start": "node server_mejorado.js"
```

### Paso 6: Reiniciar el Servidor

```bash
cd backend
npm start
```

### Paso 7: Verificar Funcionamiento

Accede a:
- Health check: http://localhost:3000/api/health
- Debe responder: `{"status":"ok","database":"connected"}`

## 📊 Nuevas Funcionalidades

### Columna Calculada: `horas_trabajadas`

Esta columna se calcula automáticamente:
- Calcula los minutos entre `hora_entrada` y `hora_salida`
- Convierte a horas decimales
- Se actualiza automáticamente cuando se registra la salida

### Estado del Empleado

Nueva columna `estado_activo`:
- Permite desactivar empleados sin eliminarlos
- El login solo funciona para empleados activos
- Útil para gestión de bajas temporales

### Vistas Creadas

#### `vista_resumen_horas_empleado`
Resumen mensual de horas por empleado:
```sql
SELECT * FROM vista_resumen_horas_empleado WHERE mes = '2025-11';
```

#### `vista_registros_activos`
Registros sin salida registrada:
```sql
SELECT * FROM vista_registros_activos;
```

### Procedimientos Almacenados

#### `sp_registrar_entrada`
```sql
CALL sp_registrar_entrada(1); -- ID del empleado
```

#### `sp_registrar_salida`
```sql
CALL sp_registrar_salida(1); -- ID del empleado
```

## 🔄 Actualización del Frontend

Si tienes un frontend, deberás actualizar las rutas de la API:

### Cambios en las URLs de la API

| Ruta Anterior | Nueva Ruta | Método |
|---------------|------------|--------|
| `/api/fichajes` | `/api/registros` | GET/POST |
| `/api/fichajes/estado` | `/api/registros/estado` | GET |
| `/api/admin/usuarios` | `/api/admin/empleados` | GET |
| `/api/admin/fichajes` | `/api/admin/registros` | GET |

### Nuevas Rutas Disponibles

- `GET /api/registros/resumen-mes` - Resumen mensual del empleado
- `GET /api/admin/resumen-empleados` - Resumen de todos los empleados

### Ejemplo de Actualización en JavaScript

```javascript
// Antes:
fetch('/api/fichajes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tipo: 'entrada' })
});

// Ahora:
fetch('/api/registros', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tipo: 'entrada' })
});
```

## 🔍 Compatibilidad Temporal

Si necesitas mantener compatibilidad con el sistema antiguo mientras migras el frontend:

1. Mantén el archivo `server.js` original
2. Usa `server_mejorado.js` en un puerto diferente (ej: 3001)
3. Migra gradualmente las llamadas del frontend
4. Una vez completado, elimina el servidor antiguo

## ⚠️ Consideraciones Importantes

### Tipos de Usuario
- `'admin'` se convierte en `'administrador'`
- `'usuario'` se convierte en `'empleado'`
- El middleware de autenticación debe verificar `rol === 'administrador'` en lugar de `rol === 'admin'`

### Respuestas de la API
El backend mejorado devuelve objetos con nombres más descriptivos:
```javascript
// Antes:
{
  "id": 1,
  "usuario_id": 5,
  "fecha": "2025-11-29"
}

// Ahora:
{
  "id": 1,
  "empleadoId": 5,
  "fecha": "2025-11-29",
  "horasTrabajadas": 8.5
}
```

## 🧪 Pruebas Recomendadas

1. **Login con credenciales existentes**
   - Verifica que los usuarios antiguos puedan iniciar sesión

2. **Registro de entrada/salida**
   - Prueba el flujo completo de fichaje

3. **Consulta de registros**
   - Verifica que se muestren los registros antiguos

4. **Panel de administrador**
   - Comprueba las funcionalidades admin

5. **Cálculo de horas**
   - Verifica que `horas_trabajadas` se calcule correctamente

## 🗑️ Limpieza Final

Una vez verificado que todo funciona correctamente:

1. Eliminar la base de datos antigua:
```sql
DROP DATABASE controlhorario_basico;
```

2. Eliminar archivos de backup del código:
```bash
rm backend/server_antiguo.js.bak
```

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Verifica los logs del servidor
2. Comprueba que las credenciales de la base de datos son correctas
3. Revisa que todas las dependencias npm estén instaladas
4. Consulta el archivo de backup si necesitas revertir cambios

## 📝 Checklist de Migración

- [ ] Backup de la base de datos realizado
- [ ] Script de migración ejecutado
- [ ] Datos verificados en la nueva base de datos
- [ ] Archivo `.env` actualizado
- [ ] Backend actualizado
- [ ] Servidor reiniciado
- [ ] Health check exitoso
- [ ] Login probado
- [ ] Registro de entrada/salida probado
- [ ] Panel admin verificado
- [ ] Frontend actualizado (si aplica)
- [ ] Documentación actualizada
- [ ] Base de datos antigua eliminada (opcional)

---

**Fecha de creación**: 2025-11-29
**Versión**: 1.0
