# 📋 Control Horario Básico

Versión simplificada del sistema de control horario. Frontend en HTML/CSS/JavaScript vanilla y backend en Node.js con Express.

## ✨ Características

### Funcionalidades Principales:
- ✅ Login con autenticación JWT
- ✅ Registro de entrada y salida (fichajes)
- ✅ Historial de fichajes del usuario
- ✅ Filtrado de fichajes por fecha
- ✅ Panel de administración (ver todos los usuarios y fichajes)
- ✅ Interfaz responsive y moderna

### Tecnologías:
- **Backend**: Node.js + Express + MySQL
- **Frontend**: HTML5 + CSS3 + JavaScript (vanilla, sin frameworks)
- **Autenticación**: JWT (JSON Web Tokens)
- **Base de Datos**: MySQL

---

## 🚀 Instalación Rápida

### 1. Requisitos Previos
- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- Navegador web moderno

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3. Configurar Base de Datos

#### Opción A: Manual
1. Abrir MySQL:
   ```bash
   mysql -u root -p
   ```

2. Ejecutar el schema:
   ```sql
   source database/schema.sql
   ```

3. Generar usuarios de prueba:
   ```bash
   cd database
   node generar-usuarios.js
   ```

4. Copiar el SQL generado y ejecutarlo en MySQL

#### Opción B: phpMyAdmin
1. Crear base de datos: `controlhorario_basico`
2. Importar: `database/schema.sql`
3. Ejecutar `node database/generar-usuarios.js` y copiar el SQL
4. Pegar y ejecutar el SQL en la pestaña SQL de phpMyAdmin

### 4. Configurar Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=controlhorario_basico
JWT_SECRET=cambiar_este_secret_por_uno_seguro
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Iniciar el Servidor

```bash
cd backend
npm start
```

Verás:
```
✓ Conectado a MySQL
✓ Servidor corriendo en puerto 3000
```

### 6. Abrir el Frontend

Simplemente abre `frontend/index.html` en tu navegador, o usa un servidor local:

**Opción 1: Servidor Python (si tienes Python instalado)**
```bash
cd frontend
python -m http.server 8080
```
Luego abre: http://localhost:8080

**Opción 2: Live Server de VSCode**
- Instala la extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

**Opción 3: Directamente**
- Abre `frontend/index.html` en tu navegador

---

## 🔐 Credenciales de Prueba

**Administrador:**
- Email: `admin@demo.com`
- Password: `admin123`

**Usuario Normal:**
- Email: `juan@demo.com`
- Password: `user123`

---

## 📁 Estructura del Proyecto

```
controlhorario-basico/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── package.json       # Dependencias
│   ├── .env.example       # Template de configuración
│   └── .env               # Configuración (crear)
│
├── frontend/
│   ├── index.html         # Página de login
│   ├── dashboard.html     # Dashboard principal
│   ├── styles.css         # Estilos
│   ├── config.js          # Configuración del frontend
│   ├── login.js           # Lógica de login
│   └── dashboard.js       # Lógica del dashboard
│
├── database/
│   ├── schema.sql         # Schema de la base de datos
│   └── generar-usuarios.js # Script para generar usuarios
│
└── README.md              # Este archivo
```

---

## 🎯 Uso de la Aplicación

### Para Usuarios:

1. **Login**
   - Ir a `index.html`
   - Ingresar email y contraseña
   - Click en "Iniciar Sesión"

2. **Fichar Entrada**
   - En el dashboard, click en "Registrar Entrada"
   - Se guardará la hora actual como hora de entrada

3. **Fichar Salida**
   - Click en "Registrar Salida"
   - Se completa el fichaje con la hora de salida

4. **Ver Historial**
   - Los fichajes aparecen automáticamente debajo
   - Puedes filtrar por fecha usando el selector de fecha

### Para Administradores:

Además de las funciones de usuario, los admin pueden:

1. **Ver Todos los Usuarios**
   - Lista completa de usuarios registrados
   - Muestra nombre, email y rol

2. **Ver Fichajes de Todos**
   - Historial completo de fichajes de todos los usuarios
   - Filtrado por fecha
   - Muestra quién fichó, cuándo y duración

---

## 📡 API Endpoints

### Autenticación

**POST** `/api/auth/login`
```json
{
  "email": "admin@demo.com",
  "password": "admin123"
}
```

**GET** `/api/auth/perfil` (requiere token)

### Fichajes

**POST** `/api/fichajes` (requiere token)
```json
{
  "tipo": "entrada"  // o "salida"
}
```

**GET** `/api/fichajes` (requiere token)
- Query params: `?fecha=2024-01-15` (opcional)

**GET** `/api/fichajes/estado` (requiere token)
- Retorna si el usuario está fichado actualmente

### Admin (solo para rol admin)

**GET** `/api/admin/usuarios` (requiere token + rol admin)

**GET** `/api/admin/fichajes` (requiere token + rol admin)
- Query params: `?fecha=2024-01-15` (opcional)

### Health Check

**GET** `/api/health`
- Verifica conexión a base de datos

---

## 🛠️ Desarrollo

### Ejecutar en Modo Desarrollo

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend (con live reload)
cd frontend
# Usar Live Server de VSCode o Python server
```

### Modificar la URL de la API

Si tu backend no está en `http://localhost:3000`, edita `frontend/config.js`:

```javascript
const API_URL = 'http://tu-dominio.com:3000/api';
```

---

## 🌐 Despliegue en cPanel

### 1. Preparar Archivos

**Backend:**
- Sube toda la carpeta `backend/` a `/home/usuario/controlhorario-basico/`
- No olvides el archivo `.env` con las credenciales correctas

**Frontend:**
- Sube todo el contenido de `frontend/` a `/home/usuario/public_html/`

### 2. Configurar Base de Datos

1. cPanel → MySQL Databases
2. Crear base de datos: `controlhorario_basico`
3. Crear usuario y asignar privilegios
4. phpMyAdmin → Importar `database/schema.sql`
5. Generar usuarios con `node generar-usuarios.js` y ejecutar el SQL

### 3. Configurar Backend

1. Editar `.env` en el servidor con credenciales reales
2. cPanel → Setup Node.js App
   - Application root: `/home/usuario/controlhorario-basico/backend`
   - Application startup file: `server.js`
   - Node.js version: 14.x o superior
3. Click "Create"
4. Click "Run NPM Install"
5. Click "Start App"

### 4. Actualizar URL en Frontend

Editar `public_html/config.js`:
```javascript
const API_URL = 'https://tudominio.com/api';
```

### 5. Verificar

- Backend: `https://tudominio.com/api/health`
- Frontend: `https://tudominio.com`

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
1. Verificar credenciales en `.env`
2. Verificar que MySQL esté corriendo
3. Verificar que la base de datos existe

```bash
mysql -u root -p
SHOW DATABASES;
USE controlhorario_basico;
SHOW TABLES;
```

### Error: "CORS" en el navegador

**Solución:**
1. El backend ya tiene CORS habilitado
2. Si usas dominios diferentes, actualiza el backend:

```javascript
// En server.js
app.use(cors({
    origin: 'https://tudominio.com'
}));
```

### No aparecen los fichajes

**Solución:**
1. Abrir DevTools (F12) → Console
2. Verificar errores de JavaScript
3. Verificar que el token esté guardado (Application → Local Storage)
4. Verificar que la API responda: `http://localhost:3000/api/health`

### Login no funciona

**Solución:**
1. Verificar que el backend esté corriendo
2. Verificar que ejecutaste el script de generar usuarios
3. Verificar en la base de datos:

```sql
SELECT * FROM usuarios;
```

---

## 📊 Base de Datos

### Tabla: usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único |
| nombre | VARCHAR(100) | Nombre completo |
| email | VARCHAR(100) | Email (único) |
| password | VARCHAR(255) | Hash bcrypt |
| rol | ENUM | 'admin' o 'usuario' |

### Tabla: fichajes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único |
| usuario_id | INT | FK a usuarios |
| fecha | DATE | Fecha del fichaje |
| hora_entrada | DATETIME | Hora de entrada |
| hora_salida | DATETIME | Hora de salida (NULL si en curso) |

---

## 🎨 Personalización

### Cambiar Colores

Editar `frontend/styles.css`:

```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cambiar a otro color, por ejemplo azul-verde */
background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
```

### Agregar Más Campos a Usuarios

1. Agregar columna en BD:
```sql
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
```

2. Modificar formulario de login o crear uno de registro

3. Actualizar backend para manejar el nuevo campo

---

## 📝 Licencia

Este proyecto es de código abierto y libre para uso personal y comercial.

---

## 🤝 Contribuir

Si encuentras bugs o quieres agregar funcionalidades:

1. Fork el proyecto
2. Crea una rama con tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

---

## ✅ Próximas Funcionalidades (Roadmap)

- [ ] Registro de nuevos usuarios desde el frontend
- [ ] Editar perfil de usuario
- [ ] Reportes en PDF
- [ ] Gráficas de horas trabajadas
- [ ] Notificaciones
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

---

**¡Gracias por usar Control Horario Básico!** 🎉

Para soporte o preguntas, abre un issue en GitHub.
