# Mapeo Completo de Nombres de Tablas
## De Prefijos Abreviados a Nombres Descriptivos en Español

---

## 📊 LISTADO COMPLETO DE CAMBIOS

| # | Nombre ACTUAL (Abreviado) | Nombre NUEVO (Descriptivo) | Descripción |
|---|---------------------------|----------------------------|-------------|
| 1 | `abscontrolhorario` | `ausencias_empleados` | Registro de ausencias (vacaciones, bajas médicas, permisos) |
| 2 | `audcontrolhorario` | `auditoria_sistema` | Registro de auditoría de todas las acciones |
| 3 | `clfcontrolhorario` | `calendario_festivos` | Calendario de días festivos y eventos de empresa |
| 4 | `clicontrolhorario` | `clientes` | Datos de clientes de la empresa |
| 5 | `cmpcontrolhorario` | `empresas` | Datos de las empresas (multiempresa) |
| 6 | `dptcontrolhorario` | `departamentos` | Departamentos de la empresa |
| 7 | `emlcolacontrolhorario` | `cola_emails` | Cola de emails pendientes de envío |
| 8 | `geocontrolhorario` | `ubicaciones_geograficas` | Ubicaciones de geolocalización (oficinas, sucursales) |
| 9 | `ntfcontrolhorario` | `notificaciones` | Notificaciones para usuarios |
| 10 | `ntfpreferenciascontrolhorario` | `preferencias_notificaciones` | Preferencias de notificación de cada usuario |
| 11 | `ovtcontrolhorario` | `horas_extras` | Registro de horas extras trabajadas |
| 12 | `prjcontrolhorario` | `proyectos` | Proyectos de la empresa |
| 13 | `schcontrolhorario` | `horarios_trabajo` | Horarios de trabajo (plantillas) |
| 14 | `schusuariocontrolhorario` | `asignacion_horarios_empleados` | Asignación de horarios a empleados |
| 15 | `setcontrolhorario` | `configuraciones_sistema` | Configuraciones del sistema por empresa |
| 16 | `shfasignacioncontrolhorario` | `asignacion_turnos` | Asignación de turnos a empleados |
| 17 | `shfintercambiocontrolhorario` | `intercambios_turnos` | Solicitudes de intercambio de turnos |
| 18 | `shfpatroncontrolhorario` | `patrones_turnos` | Patrones de turnos (plantillas) |
| 19 | `tktcontrolhorario` | `tickets_soporte` | Tickets de soporte técnico |
| 20 | `tktrespuestascontrolhorario` | `respuestas_tickets` | Respuestas a tickets de soporte |
| 21 | `tmrcontrolhorario` | `registros_horarios` | **PRINCIPAL**: Registros de entrada/salida |
| 22 | `tmrproyectocontrolhorario` | `tiempo_proyectos` | Tiempo dedicado a proyectos |
| 23 | `tskcontrolhorario` | `tareas` | Tareas de proyectos |
| 24 | `usrcontrolhorario` | `empleados` | **PRINCIPAL**: Usuarios/Empleados del sistema |
| 25 | `wbhcontrolhorario` | `webhooks` | Webhooks configurados |
| 26 | `wbhentregascontrolhorario` | `entregas_webhooks` | Log de entregas de webhooks |

---

## 🔑 SIGNIFICADO DE LOS PREFIJOS ACTUALES

| Prefijo | Significado | Ejemplo |
|---------|-------------|---------|
| `abs` | Absences (Ausencias) | abscontrolhorario |
| `aud` | Audit (Auditoría) | audcontrolhorario |
| `clf` | Calendar (Calendario) | clfcontrolhorario |
| `cli` | Client (Cliente) | clicontrolhorario |
| `cmp` | Company (Empresa) | cmpcontrolhorario |
| `dpt` | Department (Departamento) | dptcontrolhorario |
| `eml` | Email | emlcolacontrolhorario |
| `geo` | Geographic (Geográfico) | geocontrolhorario |
| `ntf` | Notification (Notificación) | ntfcontrolhorario |
| `ovt` | Overtime (Horas extras) | ovtcontrolhorario |
| `prj` | Project (Proyecto) | prjcontrolhorario |
| `sch` | Schedule (Horario) | schcontrolhorario |
| `set` | Settings (Configuración) | setcontrolhorario |
| `shf` | Shift (Turno) | shfpatroncontrolhorario |
| `tkt` | Ticket | tktcontrolhorario |
| `tmr` | Timer (Tiempo) | tmrcontrolhorario |
| `tsk` | Task (Tarea) | tskcontrolhorario |
| `usr` | User (Usuario) | usrcontrolhorario |
| `wbh` | Webhook | wbhcontrolhorario |

---

## 📋 DESGLOSE POR CATEGORÍA

### 👥 GESTIÓN DE PERSONAL

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `usrcontrolhorario` | `empleados` | Datos de empleados |
| `dptcontrolhorario` | `departamentos` | Departamentos |
| `abscontrolhorario` | `ausencias_empleados` | Ausencias y permisos |

### ⏰ CONTROL HORARIO

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `tmrcontrolhorario` | `registros_horarios` | Fichajes entrada/salida |
| `schcontrolhorario` | `horarios_trabajo` | Plantillas de horarios |
| `schusuariocontrolhorario` | `asignacion_horarios_empleados` | Horarios asignados |
| `ovtcontrolhorario` | `horas_extras` | Horas extras |

### 🔄 GESTIÓN DE TURNOS

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `shfpatroncontrolhorario` | `patrones_turnos` | Plantillas de turnos |
| `shfasignacioncontrolhorario` | `asignacion_turnos` | Turnos asignados |
| `shfintercambiocontrolhorario` | `intercambios_turnos` | Intercambios entre empleados |

### 📊 PROYECTOS Y TAREAS

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `prjcontrolhorario` | `proyectos` | Proyectos |
| `tskcontrolhorario` | `tareas` | Tareas de proyectos |
| `tmrproyectocontrolhorario` | `tiempo_proyectos` | Tiempo en proyectos |
| `clicontrolhorario` | `clientes` | Clientes |

### 🏢 EMPRESA Y CONFIGURACIÓN

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `cmpcontrolhorario` | `empresas` | Datos de empresas |
| `setcontrolhorario` | `configuraciones_sistema` | Configuración |
| `clfcontrolhorario` | `calendario_festivos` | Festivos |
| `geocontrolhorario` | `ubicaciones_geograficas` | Geolocalización |

### 🔔 NOTIFICACIONES Y COMUNICACIÓN

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `ntfcontrolhorario` | `notificaciones` | Notificaciones |
| `ntfpreferenciascontrolhorario` | `preferencias_notificaciones` | Preferencias |
| `emlcolacontrolhorario` | `cola_emails` | Cola de emails |

### 🎫 SOPORTE Y AUDITORÍA

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `tktcontrolhorario` | `tickets_soporte` | Tickets |
| `tktrespuestascontrolhorario` | `respuestas_tickets` | Respuestas |
| `audcontrolhorario` | `auditoria_sistema` | Auditoría |

### 🔗 INTEGRACIONES

| Actual | Nuevo | Propósito |
|--------|-------|-----------|
| `wbhcontrolhorario` | `webhooks` | Webhooks |
| `wbhentregascontrolhorario` | `entregas_webhooks` | Log de entregas |

---

## 🎯 VENTAJAS DE LOS NUEVOS NOMBRES

### ✅ Claridad Total
- `registros_horarios` es inmediatamente comprensible vs `tmrcontrolhorario`
- `ausencias_empleados` es obvio vs `abscontrolhorario`
- `horas_extras` es directo vs `ovtcontrolhorario`

### ✅ Sin Necesidad de Documentación
- Cualquier desarrollador entiende qué hace cada tabla
- No necesitas memorizar abreviaturas
- El código se auto-documenta

### ✅ Búsqueda Más Fácil
- Buscar "ausencia" te lleva directamente a la tabla correcta
- Agrupar por prefijos lógicos (no técnicos)
- Mejor para IDEs y herramientas de autocompletado

### ✅ Multiidioma Más Coherente
- Todo en español completo
- Sin mezcla de inglés (usr, tmr, etc.)
- Más profesional para equipos hispanohablantes

---

## 📝 EJEMPLOS DE USO

### Antes (Abreviado)
```sql
SELECT u.first_name, u.last_name, t.check_in, t.check_out
FROM usrcontrolhorario u
JOIN tmrcontrolhorario t ON u.id = t.user_id
WHERE u.company_id = 1;
```

### Después (Descriptivo)
```sql
SELECT e.nombre_completo, e.apellidos, r.hora_entrada, r.hora_salida
FROM empleados e
JOIN registros_horarios r ON e.id_empleado = r.id_empleado
WHERE e.id_empresa = 1;
```

---

## 🔄 ORDEN DE MIGRACIÓN RECOMENDADO

### Fase 1: Tablas Base (sin dependencias)
1. `empresas` (cmpcontrolhorario)
2. `clientes` (clicontrolhorario)
3. `departamentos` (dptcontrolhorario)

### Fase 2: Empleados y Configuración
4. `empleados` (usrcontrolhorario)
5. `configuraciones_sistema` (setcontrolhorario)
6. `calendario_festivos` (clfcontrolhorario)
7. `ubicaciones_geograficas` (geocontrolhorario)

### Fase 3: Horarios y Turnos
8. `horarios_trabajo` (schcontrolhorario)
9. `asignacion_horarios_empleados` (schusuariocontrolhorario)
10. `patrones_turnos` (shfpatroncontrolhorario)
11. `asignacion_turnos` (shfasignacioncontrolhorario)
12. `intercambios_turnos` (shfintercambiocontrolhorario)

### Fase 4: Registros Principales
13. `registros_horarios` (tmrcontrolhorario) ⭐ **TABLA PRINCIPAL**
14. `ausencias_empleados` (abscontrolhorario)
15. `horas_extras` (ovtcontrolhorario)

### Fase 5: Proyectos
16. `proyectos` (prjcontrolhorario)
17. `tareas` (tskcontrolhorario)
18. `tiempo_proyectos` (tmrproyectocontrolhorario)

### Fase 6: Comunicación
19. `notificaciones` (ntfcontrolhorario)
20. `preferencias_notificaciones` (ntfpreferenciascontrolhorario)
21. `cola_emails` (emlcolacontrolhorario)

### Fase 7: Sistema
22. `tickets_soporte` (tktcontrolhorario)
23. `respuestas_tickets` (tktrespuestascontrolhorario)
24. `auditoria_sistema` (audcontrolhorario)
25. `webhooks` (wbhcontrolhorario)
26. `entregas_webhooks` (wbhentregascontrolhorario)

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Longitud de Nombres
- Algunos nombres son largos pero descriptivos
- Alternativas más cortas disponibles si es necesario
- Ejemplo: `preferencias_notificaciones` → `pref_notificaciones`

### 2. Foreign Keys
- Todas las foreign keys deben actualizarse
- Mantener consistencia en nombres de columnas
- Ejemplo: `user_id` → `id_empleado`

### 3. Índices
- Renombrar índices para que coincidan
- Ejemplo: `idx_user_company` → `idx_empleado_empresa`

### 4. Vistas y Procedimientos
- Actualizar todas las vistas
- Recrear procedimientos almacenados
- Actualizar triggers si existen

---

**Creado**: 2025-11-29
**Versión**: 1.0
**Base de datos**: pwbnbxqt_ddbbControlHorario
