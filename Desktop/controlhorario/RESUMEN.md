# ✅ Control Horario Básico - Versión Simplificada

## 🎯 ¿Qué es esto?

Una versión **MUY BÁSICA** del sistema de control horario, con solo las funcionalidades esenciales:

✅ Login con usuario y contraseña
✅ Registrar entrada (fichar)
✅ Registrar salida
✅ Ver historial de fichajes
✅ Panel de admin (ver todos los usuarios y fichajes)

---

## 🚀 Tecnologías

**Sin frameworks complejos, solo lo esencial:**

- **Backend**: Node.js + Express (1 solo archivo)
- **Frontend**: HTML + CSS + JavaScript vanilla (sin React, sin frameworks)
- **Base de Datos**: MySQL (2 tablas simples)
- **Autenticación**: JWT básico

---

## 📦 Archivos Creados

### Backend (carpeta `backend/`)
- ✅ `server.js` - Servidor completo en 1 archivo
- ✅ `package.json` - Dependencias
- ✅ `.env.example` - Template de configuración

### Frontend (carpeta `frontend/`)
- ✅ `index.html` - Página de login
- ✅ `dashboard.html` - Dashboard principal
- ✅ `styles.css` - Todos los estilos
- ✅ `config.js` - Configuración y utilidades
- ✅ `login.js` - Lógica del login
- ✅ `dashboard.js` - Lógica del dashboard

### Base de Datos (carpeta `database/`)
- ✅ `schema.sql` - Schema completo de MySQL
- ✅ `generar-usuarios.js` - Script para crear usuarios de prueba

### Documentación
- ✅ `README.md` - Documentación completa
- ✅ `INICIO_RAPIDO.md` - Guía de 5 minutos
- ✅ `ESTRUCTURA.md` - Detalles de cada archivo
- ✅ `RESUMEN.md` - Este archivo

---

## 🎨 Características

### Para Usuarios:
1. **Login** - Ingresar con email y contraseña
2. **Fichar Entrada** - Registrar hora de llegada
3. **Fichar Salida** - Registrar hora de salida
4. **Ver Historial** - Ver todos mis fichajes
5. **Filtrar por Fecha** - Ver fichajes de un día específico

### Para Administradores:
Todo lo anterior, más:
1. **Ver Todos los Usuarios** - Lista completa
2. **Ver Todos los Fichajes** - De todos los usuarios
3. **Filtrar Fichajes por Fecha** - De toda la empresa

---

## 🔐 Credenciales de Prueba

**Admin:**
- Email: `admin@demo.com`
- Password: `admin123`

**Usuario:**
- Email: `juan@demo.com`
- Password: `user123`

---

## 📱 Capturas

### Login
```
┌────────────────────────────┐
│                            │
│         [RELOJ]            │
│    Control Horario         │
│  Sistema de Gestión        │
│                            │
│   Email: ____________      │
│   Password: ________       │
│                            │
│   [Iniciar Sesión]         │
│                            │
│   Credenciales prueba:     │
│   Admin: admin@demo.com    │
│   Usuario: juan@demo.com   │
│                            │
└────────────────────────────┘
```

### Dashboard
```
┌────────────────────────────────────┐
│ Control Horario      Juan | Salir  │
├────────────────────────────────────┤
│                                    │
│ Bienvenido, Juan                   │
│ 24 de noviembre de 2024            │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ Fichaje                      │  │
│ │ ✓ Fichado desde 09:00        │  │
│ │                              │  │
│ │ [Entrada]  [Salida]          │  │
│ └──────────────────────────────┘  │
│                                    │
│ ┌──────────────────────────────┐  │
│ │ Mis Fichajes                 │  │
│ │ Filtrar: [____] [Ver Todos]  │  │
│ │                              │  │
│ │ 24 Nov 2024    ✓ Completo    │  │
│ │ Entrada: 09:00               │  │
│ │ Salida: 18:00                │  │
│ │ Duración: 9h 0m              │  │
│ └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

## ⚡ Instalación Súper Rápida

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar
cp .env.example .env
# Editar .env con tus datos

# 3. Crear BD e importar schema
mysql -u root -p < database/schema.sql

# 4. Generar usuarios
cd database
node generar-usuarios.js
# Copiar el SQL y ejecutarlo

# 5. Iniciar servidor
cd backend
npm start

# 6. Abrir frontend
# Abre frontend/index.html en el navegador
```

---

## 📊 Comparación con la Versión Completa

| Aspecto | Versión Básica | Versión Completa |
|---------|----------------|------------------|
| **Líneas de código** | ~1300 | ~5000+ |
| **Archivos** | 12 | 100+ |
| **Tecnologías** | HTML/JS/Node | React/TS/Express |
| **Tablas BD** | 2 | 15+ |
| **Tiempo setup** | 5 min | 30 min |
| **Funcionalidades** | 5 básicas | 30+ avanzadas |
| **Curva aprendizaje** | ⭐ Fácil | ⭐⭐⭐⭐ Media-Alta |
| **Ideal para** | Aprender/MVP | Producción |

---

## 🎯 ¿Cuándo usar esta versión?

✅ **Úsala si:**
- Quieres aprender cómo funciona un sistema de fichajes
- Necesitas un MVP rápido para probar la idea
- Prefieres código simple y fácil de entender
- Tu equipo es pequeño (< 10 personas)
- No necesitas funcionalidades avanzadas

❌ **NO la uses si:**
- Necesitas múltiples empresas/departamentos
- Requieres geolocalización o geofences
- Necesitas reportes complejos o gráficas
- Tienes más de 50 usuarios
- Necesitas proyectos, tareas, horas extras, etc.

---

## 🔄 Migración a la Versión Completa

Si empiezas con esta versión básica y luego quieres migrar:

1. **Datos existentes:**
   - Los usuarios y fichajes se pueden exportar
   - Crear script de migración de BD

2. **Frontend:**
   - Reescribir en React (usar la versión completa)
   - Los conceptos son los mismos

3. **Backend:**
   - Refactorizar en arquitectura modular
   - Agregar controladores, rutas, middlewares separados

**Tiempo estimado de migración:** 2-3 días

---

## 📚 Recursos de Aprendizaje

Si eres nuevo en desarrollo web, esta versión básica es perfecta para aprender:

**Backend:**
- Express.js básico
- Conexión a MySQL
- Autenticación JWT
- Manejo de rutas y middleware

**Frontend:**
- DOM manipulation
- Fetch API
- LocalStorage
- Event handling
- CSS Flexbox/Grid

**Base de Datos:**
- MySQL básico
- Foreign keys
- Índices
- Consultas JOIN

---

## 🛠️ Próximas Mejoras Sugeridas

Si quieres practicar, intenta agregar:

1. **Fácil:**
   - [ ] Cambiar colores del tema
   - [ ] Agregar más campos al perfil de usuario
   - [ ] Exportar fichajes a CSV

2. **Medio:**
   - [ ] Página de registro de usuarios
   - [ ] Editar/eliminar fichajes
   - [ ] Búsqueda de fichajes
   - [ ] Modo oscuro

3. **Avanzado:**
   - [ ] Gráficas de horas trabajadas
   - [ ] Reportes en PDF
   - [ ] Notificaciones por email
   - [ ] PWA (funcionar offline)

---

## 💡 Tips

1. **Desarrollo:**
   - Usa Live Server en VSCode para el frontend
   - Usa `nodemon` para auto-restart del backend
   - Prueba con Postman los endpoints

2. **Producción:**
   - Cambia el `JWT_SECRET` por uno seguro
   - Usa HTTPS
   - Habilita logs de errores
   - Haz backup de la BD regularmente

3. **Personalización:**
   - Cambia los colores en `styles.css`
   - Modifica el logo SVG
   - Agrega tu nombre de empresa

---

## 🎉 ¡Eso es Todo!

Tienes un sistema de control horario completamente funcional en **menos de 1500 líneas de código**.

**Características:**
- ✅ Sin complicaciones
- ✅ Fácil de entender
- ✅ Fácil de personalizar
- ✅ Listo para usar

**Siguiente paso:**
Lee el [INICIO_RAPIDO.md](INICIO_RAPIDO.md) y ponte manos a la obra.

---

**¿Preguntas?** Lee el [README.md](README.md) completo.

**¡Disfruta tu nuevo sistema de control horario!** 🚀
