const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a Base de Datos
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'controlhorario_basico'
    });
    console.log('✓ Conectado a MySQL');
  } catch (error) {
    console.error('✗ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
}

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Helper para mapear roles
function mapRole(tipoUsuario) {
  if (tipoUsuario === 'company_admin' || tipoUsuario === 'super_admin') return 'admin';
  if (tipoUsuario === 'manager') return 'manager';
  return 'employee';
}

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    // Schema Change: usuarios -> empleados, email -> correo_electronico
    const [users] = await db.query(
      'SELECT * FROM empleados WHERE correo_electronico = ? AND esta_activo = 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    // Schema Change: password -> contrasena_hash
    const validPassword = await bcrypt.compare(password, user.contrasena_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const rol = mapRole(user.tipo_usuario);

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.correo_electronico, 
        nombre: user.nombre, 
        rol: rol,
        id_empresa: user.id_empresa 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Actualizar último acceso
    await db.query('UPDATE empleados SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.correo_electronico,
        rol: rol,
        id_empresa: user.id_empresa
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER PERFIL
app.get('/api/auth/perfil', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nombre, apellidos, correo_electronico, tipo_usuario, foto_perfil FROM empleados WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = users[0];
    res.json({
      ...user,
      rol: mapRole(user.tipo_usuario)
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================================
// RUTAS DE FICHAJES
// ==========================================

// REGISTRAR ENTRADA/SALIDA
app.post('/api/fichajes', authenticateToken, async (req, res) => {
  try {
    const { tipo } = req.body; // 'entrada' o 'salida'
    const userId = req.user.id;
    const empresaId = req.user.id_empresa;

    if (!tipo || !['entrada', 'salida'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de fichaje inválido' });
    }

    // Schema Change: fichajes -> registros_horarios
    if (tipo === 'entrada') {
      // Verificar si hay una entrada sin salida
      const [fichajesAbiertos] = await db.query(
        'SELECT * FROM registros_horarios WHERE id_empleado = ? AND hora_salida IS NULL ORDER BY id DESC LIMIT 1',
        [userId]
      );

      if (fichajesAbiertos.length > 0) {
        return res.status(400).json({ error: 'Ya tienes un fichaje de entrada activo' });
      }

      // Crear nuevo fichaje
      const [result] = await db.query(
        'INSERT INTO registros_horarios (id_empleado, id_empresa, hora_entrada) VALUES (?, ?, NOW())',
        [userId, empresaId]
      );

      res.json({
        mensaje: 'Entrada registrada correctamente',
        fichajeId: result.insertId
      });
    } else {
      // Registrar salida
      const [fichajesAbiertos] = await db.query(
        'SELECT * FROM registros_horarios WHERE id_empleado = ? AND hora_salida IS NULL ORDER BY id DESC LIMIT 1',
        [userId]
      );

      if (fichajesAbiertos.length === 0) {
        return res.status(400).json({ error: 'No tienes un fichaje de entrada activo' });
      }

      const fichaje = fichajesAbiertos[0];

      await db.query(
        'UPDATE registros_horarios SET hora_salida = NOW(), estado = "completed" WHERE id = ?',
        [fichaje.id]
      );

      res.json({
        mensaje: 'Salida registrada correctamente',
        fichajeId: fichaje.id
      });
    }
  } catch (error) {
    console.error('Error registrando fichaje:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER FICHAJES DEL USUARIO
app.get('/api/fichajes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fecha } = req.query;

    let query = 'SELECT * FROM registros_horarios WHERE id_empleado = ?';
    const params = [userId];

    if (fecha) {
      // Asumiendo que queremos filtrar por el día de la hora_entrada
      query += ' AND DATE(hora_entrada) = ?';
      params.push(fecha);
    }

    query += ' ORDER BY hora_entrada DESC LIMIT 50';

    const [fichajes] = await db.query(query, params);

    res.json(fichajes);
  } catch (error) {
    console.error('Error obteniendo fichajes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER ESTADO ACTUAL
app.get('/api/fichajes/estado', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [fichajesAbiertos] = await db.query(
      'SELECT * FROM registros_horarios WHERE id_empleado = ? AND hora_salida IS NULL ORDER BY id DESC LIMIT 1',
      [userId]
    );

    if (fichajesAbiertos.length > 0) {
      res.json({
        fichado: true,
        fichaje: fichajesAbiertos[0]
      });
    } else {
      res.json({
        fichado: false,
        fichaje: null
      });
    }
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================================
// RUTAS ADMIN
// ==========================================

// OBTENER TODOS LOS EMPLEADOS
app.get('/api/admin/usuarios', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [usuarios] = await db.query(
      'SELECT id, nombre, apellidos, correo_electronico as email, tipo_usuario, esta_activo FROM empleados WHERE id_empresa = ?',
      [req.user.id_empresa]
    );

    res.json(usuarios.map(u => ({
      ...u,
      rol: mapRole(u.tipo_usuario)
    })));
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER FICHAJES GLOBALES
app.get('/api/admin/fichajes', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { fecha } = req.query;
    let query = `
      SELECT r.*, e.nombre, e.apellidos, e.correo_electronico
      FROM registros_horarios r
      JOIN empleados e ON r.id_empleado = e.id
      WHERE r.id_empresa = ?
    `;
    const params = [req.user.id_empresa];

    if (fecha) {
      query += ' AND DATE(r.hora_entrada) = ?';
      params.push(fecha);
    }

    query += ' ORDER BY r.hora_entrada DESC LIMIT 100';

    const [fichajes] = await db.query(query, params);

    res.json(fichajes);
  } catch (error) {
    console.error('Error obteniendo fichajes:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================================
// RUTA DE SALUD
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║   Control Horario - Backend (cPanel)   ║
╚════════════════════════════════════════╝
✓ Servidor corriendo en puerto ${PORT}
✓ URL: http://localhost:${PORT}
✓ Health: http://localhost:${PORT}/api/health
    `);
  });
});
// INICIO DEL SERVIDOR
// ==========================================
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Control Horario Básico - Backend    ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`✓ Servidor corriendo en puerto ${PORT}`);
    console.log(`✓ URL: http://localhost:${PORT}`);
    console.log(`✓ Health: http://localhost:${PORT}/api/health`);
    console.log('');
  });
}

startServer();
