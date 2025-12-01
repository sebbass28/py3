# 📁 Estructura del Proyecto - Control Horario Básico

```
controlhorario-basico/
│
├── 📄 README.md                    # Documentación completa
├── 📄 INICIO_RAPIDO.md             # Guía de inicio rápido
├── 📄 ESTRUCTURA.md                # Este archivo
├── 📄 package.json                 # Scripts npm del proyecto
├── 📄 .gitignore                   # Archivos ignorados por git
│
├── 📁 backend/                     # ← SERVIDOR NODE.JS
│   ├── 📄 server.js                # Servidor Express principal
│   ├── 📄 package.json             # Dependencias del backend
│   ├── 📄 .env.example             # Template de configuración
│   └── 📄 .env                     # Configuración (crear este archivo)
│
├── 📁 frontend/                    # ← APLICACIÓN WEB
│   ├── 📄 index.html               # Página de login
│   ├── 📄 dashboard.html           # Dashboard principal
│   ├── 📄 styles.css               # Estilos CSS
│   ├── 📄 config.js                # Configuración de la API
│   ├── 📄 login.js                 # Lógica del login
│   └── 📄 dashboard.js             # Lógica del dashboard
│
└── 📁 database/                    # ← BASE DE DATOS
    ├── 📄 schema.sql               # Schema MySQL
    └── 📄 generar-usuarios.js      # Script para crear usuarios
```

---

## 🎨 Detalles de Cada Archivo

### Backend

#### `server.js` (318 líneas)
**Servidor principal de Node.js con Express**

Contiene:
- Configuración de Express y middleware
- Conexión a MySQL
- Rutas de autenticación (`/api/auth/login`, `/api/auth/perfil`)
- Rutas de fichajes (`/api/fichajes`, `/api/fichajes/estado`)
- Rutas de admin (`/api/admin/usuarios`, `/api/admin/fichajes`)
- Middleware de autenticación JWT

**Endpoints:**
```
POST   /api/auth/login          # Login
GET    /api/auth/perfil         # Obtener perfil (requiere token)
POST   /api/fichajes            # Registrar entrada/salida (requiere token)
GET    /api/fichajes            # Obtener fichajes (requiere token)
GET    /api/fichajes/estado     # Estado actual (requiere token)
GET    /api/admin/usuarios      # Listar usuarios (admin)
GET    /api/admin/fichajes      # Listar fichajes (admin)
GET    /api/health              # Health check
```

#### `package.json`
Dependencias:
- `express` - Framework web
- `cors` - Habilitar CORS
- `mysql2` - Cliente MySQL
- `bcryptjs` - Hash de contraseñas
- `jsonwebtoken` - Autenticación JWT
- `dotenv` - Variables de entorno

#### `.env`
Variables de configuración:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=controlhorario_basico
JWT_SECRET=tu_secret_seguro
```

---

### Frontend

#### `index.html`
**Página de Login**

Elementos:
- Logo SVG (reloj)
- Formulario de login (email + password)
- Credenciales de prueba
- Mensaje de error dinámico

#### `dashboard.html`
**Dashboard Principal**

Secciones:
1. **Navbar** - Nombre de usuario y botón de logout
2. **Welcome Card** - Saludo personalizado y fecha
3. **Fichar Card** - Botones de entrada/salida y estado actual
4. **Historial Card** - Lista de fichajes con filtro por fecha
5. **Admin Panel** - Solo visible para administradores
   - Lista de usuarios
   - Fichajes de todos los usuarios

#### `styles.css`
**Estilos Completos**

Incluye:
- Reset CSS y variables globales
- Estilos de login (gradiente, card, formulario)
- Navbar y navegación
- Dashboard y cards
- Botones y estados (entrada/salida)
- Listas de fichajes y usuarios
- Responsive design (móvil y desktop)
- Colores y animaciones

**Paleta de Colores:**
- Primary: `#667eea` → `#764ba2` (gradiente morado)
- Success: `#4caf50` (verde)
- Error: `#f44336` (rojo)
- Warning: `#ff9800` (naranja)

#### `config.js`
**Configuración y Utilidades**

Funciones:
- `getToken()`, `setToken()`, `removeToken()`
- `getUser()`, `setUser()`, `removeUser()`
- `logout()`, `checkAuth()`
- `formatDate()`, `formatTime()`
- `calcularDuracion()`

Variables:
- `API_URL` - URL del backend

#### `login.js`
**Lógica del Login**

Funciones:
- Manejo del formulario de login
- Llamada a API `/api/auth/login`
- Guardado de token y usuario
- Redirección al dashboard
- Manejo de errores

#### `dashboard.js`
**Lógica del Dashboard**

Funciones:
- `cargarEstadoFichaje()` - Estado actual del usuario
- `fichar(tipo)` - Registrar entrada/salida
- `cargarFichajes()` - Historial del usuario
- `limpiarFiltro()` - Quitar filtro de fecha
- `cargarUsuarios()` - Admin: lista de usuarios
- `cargarFichajesAdmin()` - Admin: fichajes de todos
- `limpiarFiltroAdmin()` - Admin: quitar filtro

---

### Database

#### `schema.sql`
**Schema MySQL**

Tablas:
1. **usuarios**
   - `id` (PK)
   - `nombre`, `email`, `password`, `rol`
   - Timestamps

2. **fichajes**
   - `id` (PK)
   - `usuario_id` (FK)
   - `fecha`, `hora_entrada`, `hora_salida`
   - Timestamps

Índices:
- `idx_email` en usuarios
- `idx_usuario_fecha` en fichajes
- `idx_fecha` en fichajes

#### `generar-usuarios.js`
**Script de Generación de Usuarios**

Genera:
- Hash bcrypt para `admin123` y `user123`
- SQL INSERT para ambos usuarios
- Muestra credenciales de prueba

---

## 🔄 Flujo de Datos

### Login:
```
1. Usuario ingresa email/password en index.html
2. login.js envía POST a /api/auth/login
3. server.js valida credenciales con bcrypt
4. Si OK: genera JWT y devuelve token + usuario
5. login.js guarda en localStorage
6. Redirige a dashboard.html
```

### Fichaje:
```
1. Usuario click en "Registrar Entrada"
2. dashboard.js envía POST a /api/fichajes con tipo="entrada"
3. server.js valida token JWT
4. Verifica que no haya fichaje abierto
5. INSERT en tabla fichajes (solo hora_entrada)
6. Devuelve confirmación
7. dashboard.js actualiza UI y recarga estado
```

### Ver Fichajes:
```
1. dashboard.js llama GET /api/fichajes
2. server.js valida token
3. SELECT de fichajes del usuario
4. Devuelve array de fichajes
5. dashboard.js renderiza la lista con formateo
```

---

## 🎯 Diferencias con la Versión Completa

| Característica | Versión Básica | Versión Completa |
|----------------|----------------|------------------|
| **Frontend** | HTML/CSS/JS | React + TypeScript |
| **Backend** | 1 archivo (server.js) | Arquitectura modular |
| **Base de Datos** | 2 tablas | 15+ tablas |
| **Autenticación** | JWT simple | JWT + roles avanzados |
| **Fichajes** | Entrada/Salida | + Pausas, proyectos, tareas |
| **Reportes** | No | Sí (PDF, Excel) |
| **Gráficas** | No | Sí (Recharts) |
| **Multi-empresa** | No | Sí |
| **Geolocalización** | No | Sí |
| **Notificaciones** | No | Sí |
| **PWA** | No | Posible |
| **Tamaño** | ~500 líneas | ~5000+ líneas |

---

## 📊 Estadísticas del Código

```
Líneas de Código (aprox):
├── Backend:    318 líneas (server.js)
├── Frontend:
│   ├── HTML:   160 líneas (index + dashboard)
│   ├── CSS:    500 líneas (styles.css)
│   └── JS:     250 líneas (config + login + dashboard)
├── Database:   80 líneas (schema.sql)
└── Total:      ~1308 líneas
```

**Peso de archivos:**
- Backend: ~15 KB
- Frontend: ~40 KB
- Total: ~55 KB (sin node_modules)

---

## 🚀 Escalabilidad

### Para agregar funcionalidades:

1. **Nuevo endpoint en backend:**
   ```javascript
   app.get('/api/nueva-ruta', authenticateToken, async (req, res) => {
       // lógica aquí
   });
   ```

2. **Nueva tabla en BD:**
   ```sql
   CREATE TABLE nueva_tabla (...);
   ```

3. **Nueva página en frontend:**
   - Crear `nueva-pagina.html`
   - Crear `nueva-pagina.js`
   - Agregar link en navbar

4. **Nuevos estilos:**
   - Agregar al final de `styles.css`

---

**¡Proyecto simple y fácil de entender!** 🎉

Ideal para aprender o como base para proyectos más complejos.
