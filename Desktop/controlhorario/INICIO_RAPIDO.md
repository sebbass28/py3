# 🚀 Inicio Rápido - Control Horario Básico

## 📦 Instalación en 5 Minutos

### 1️⃣ Instalar Dependencias del Backend
```bash
cd backend
npm install
```

### 2️⃣ Crear Base de Datos

Abre MySQL y ejecuta:
```sql
source database/schema.sql
```

O si usas phpMyAdmin:
1. Crear BD: `controlhorario_basico`
2. Importar: `database/schema.sql`

### 3️⃣ Generar Usuarios de Prueba
```bash
cd database
node generar-usuarios.js
```

Copia el SQL que aparece y ejecútalo en MySQL/phpMyAdmin.

### 4️⃣ Configurar Backend

```bash
cd backend
cp .env.example .env
```

Edita `.env`:
```env
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=controlhorario_basico
JWT_SECRET=cambia_esto_por_algo_seguro
```

### 5️⃣ Iniciar Servidor

```bash
cd backend
npm start
```

Deberías ver:
```
✓ Conectado a MySQL
✓ Servidor corriendo en puerto 3000
```

### 6️⃣ Abrir Frontend

Abre `frontend/index.html` en tu navegador.

**O usa un servidor local:**
```bash
cd frontend
python -m http.server 8080
# Luego abre: http://localhost:8080
```

---

## 🔐 Credenciales de Prueba

**Admin:**
- Email: `admin@demo.com`
- Password: `admin123`

**Usuario:**
- Email: `juan@demo.com`
- Password: `user123`

---

## ✅ Verificar que Todo Funciona

1. **Backend corriendo:**
   - Ve a: http://localhost:3000/api/health
   - Deberías ver: `{"status":"ok","database":"connected"}`

2. **Frontend:**
   - Abre: `frontend/index.html`
   - Haz login con las credenciales de prueba
   - Deberías ver el dashboard

3. **Fichajes:**
   - Click en "Registrar Entrada"
   - Debería aparecer confirmación
   - Click en "Registrar Salida"
   - Debería completar el fichaje

---

## 🐛 Problemas Comunes

**❌ Error: "Cannot connect to database"**
→ Verifica las credenciales en `backend/.env`

**❌ Login no funciona**
→ Asegúrate de haber ejecutado el script `generar-usuarios.js` y el SQL

**❌ CORS error**
→ El backend ya tiene CORS habilitado, verifica que el servidor esté corriendo

**❌ "Module not found"**
→ Ejecuta `cd backend && npm install`

---

## 🎯 Próximos Pasos

1. Lee el [README.md](README.md) completo para más detalles
2. Personaliza los colores en `frontend/styles.css`
3. Agrega más usuarios si lo necesitas
4. ¡Empieza a usar el sistema!

---

**¡Listo! Ya tienes tu sistema de control horario funcionando.** 🎉
