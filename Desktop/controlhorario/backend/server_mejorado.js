const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
      database: process.env.DB_NAME || 'control_horario_empleados'
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

    const [empleados] = await db.query(
      'SELECT * FROM empleados WHERE correo_electronico = ? AND estado_activo = TRUE',
      [email]
    );

    if (empleados.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const empleado = empleados[0];
    const validPassword = await bcrypt.compare(password, empleado.contrasena_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: empleado.id_empleado,
        email: empleado.correo_electronico,
        nombre: empleado.nombre_completo,
        rol: empleado.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: empleado.id_empleado,
        nombre: empleado.nombre_completo,
        email: empleado.correo_electronico,
        rol: empleado.tipo_usuario
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
    const [empleados] = await db.query(
      'SELECT id_empleado, nombre_completo, correo_electronico, tipo_usuario FROM empleados WHERE id_empleado = ? AND estado_activo = TRUE',
      [req.user.id]
    );

    if (empleados.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const empleado = empleados[0];
    res.json({
      id: empleado.id_empleado,
      nombre: empleado.nombre_completo,
      email: empleado.correo_electronico,
      rol: empleado.tipo_usuario
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================================
// RUTAS DE REGISTROS HORARIOS
// ==========================================

// REGISTRAR ENTRADA/SALIDA
app.post('/api/registros', authenticateToken, async (req, res) => {
  try {
    const { tipo } = req.body; // 'entrada' o 'salida'
    const idEmpleado = req.user.id;

    if (!tipo || !['entrada', 'salida'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de registro inválido' });
    }

    // Verificar si hay un registro de entrada sin salida
    if (tipo === 'entrada') {
      const [registrosActivos] = await db.query(
        'SELECT * FROM registros_horarios WHERE id_empleado = ? AND hora_salida IS NULL ORDER BY id_registro DESC LIMIT 1',
        [idEmpleado]
      );

      if (registrosActivos.length > 0) {
        return res.status(400).json({ error: 'Ya tienes un registro de entrada activo' });
      }

      // Crear nuevo registro de entrada
      const [result] = await db.query(
        'INSERT INTO registros_horarios (id_empleado, hora_entrada, fecha_registro) VALUES (?, NOW(), CURDATE())',
        [idEmpleado]
      );

      res.json({
        mensaje: 'Entrada registrada correctamente',
        registroId: result.insertId
      });
    } else {
      // Registrar salida
      const [registrosActivos] = await db.query(
        'SELECT * FROM registros_horarios WHERE id_empleado = ? AND hora_salida IS NULL ORDER BY id_registro DESC LIMIT 1',
        [idEmpleado]
      );

      if (registrosActivos.length === 0) {
        return res.status(400).json({ error: 'No tienes un registro de entrada activo' });
      }

      const registro = registrosActivos[0];

      await db.query(
        'UPDATE registros_horarios SET hora_salida = NOW() WHERE id_registro = ?',
        [registro.id_registro]
      );

      res.json({
        mensaje: 'Salida registrada correctamente',
        registroId: registro.id_registro
      });
    }
  } catch (error) {
    console.error('Error registrando horario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER REGISTROS HORARIOS DEL EMPLEADO
app.get('/api/registros', authenticateToken, async (req, res) => {
  try {
    const idEmpleado = req.user.id;
    const { fecha } = req.query;

    let query = 'SELECT * FROM registros_horarios WHERE id_empleado = ?';
    const params = [idEmpleado];

    if (fecha) {
      query += ' AND fecha_registro = ?';
      params.push(fecha);
    }

    query += ' ORDER BY fecha_registro DESC, hora_entrada DESC LIMIT 50';

    const [registros] = await db.query(query, params);

    // Formatear respuesta
    const registrosFormateados = registros.map(r => ({
      id: r.id_registro,
      fecha: r.fecha_registro,
      horaEntrada: r.hora_entrada,
      horaSalida: r.hora_salida,
      horasTrabajadas: r.horas_trabajadas
    }));

    res.json(registrosFormateados);
  } catch (error) {
    console.error('Error obteniendo registros:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER ESTADO ACTUAL (si está fichado o no)
app.get('/api/registros/estado', authenticateToken, async (req, res) => {
  try {
    const idEmpleado = req.user.id;

    const [registrosActivos] = await db.query(
      'SELECT * FROM registros_horarios WHERE id_empleado = ? AND hora_salida IS NULL ORDER BY id_registro DESC LIMIT 1',
      [idEmpleado]
    );

    if (registrosActivos.length > 0) {
      const registro = registrosActivos[0];
      res.json({
        fichado: true,
        registro: {
          id: registro.id_registro,
          fecha: registro.fecha_registro,
          horaEntrada: registro.hora_entrada
        }
      });
    } else {
      res.json({
        fichado: false,
        registro: null
      });
    }
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER RESUMEN DE HORAS DEL MES
app.get('/api/registros/resumen-mes', authenticateToken, async (req, res) => {
  try {
    const idEmpleado = req.user.id;
    const { mes } = req.query; // formato: YYYY-MM

    let query = `
      SELECT
        DATE_FORMAT(fecha_registro, '%Y-%m') AS mes,
        COUNT(*) AS total_dias,
        SUM(horas_trabajadas) AS total_horas,
        AVG(horas_trabajadas) AS promedio_horas
      FROM registros_horarios
      WHERE id_empleado = ? AND hora_salida IS NOT NULL
    `;

    const params = [idEmpleado];

    if (mes) {
      query += ` AND DATE_FORMAT(fecha_registro, '%Y-%m') = ?`;
      params.push(mes);
    } else {
      query += ` AND DATE_FORMAT(fecha_registro, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`;
    }

    query += ' GROUP BY mes';

    const [resultado] = await db.query(query, params);

    if (resultado.length === 0) {
      res.json({
        mes: mes || new Date().toISOString().slice(0, 7),
        totalDias: 0,
        totalHoras: 0,
        promedioHoras: 0
      });
    } else {
      res.json({
        mes: resultado[0].mes,
        totalDias: resultado[0].total_dias,
        totalHoras: parseFloat(resultado[0].total_horas || 0).toFixed(2),
        promedioHoras: parseFloat(resultado[0].promedio_horas || 0).toFixed(2)
      });
    }
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================================
// RUTAS ADMIN (solo para administrador)
// ==========================================

// OBTENER TODOS LOS EMPLEADOS
app.get('/api/admin/empleados', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [empleados] = await db.query(
      'SELECT id_empleado, nombre_completo, correo_electronico, tipo_usuario, estado_activo, fecha_creacion FROM empleados ORDER BY nombre_completo'
    );

    const empleadosFormateados = empleados.map(e => ({
      id: e.id_empleado,
      nombre: e.nombre_completo,
      email: e.correo_electronico,
      rol: e.tipo_usuario,
      activo: e.estado_activo,
      fechaCreacion: e.fecha_creacion
    }));

    res.json(empleadosFormateados);
  } catch (error) {
    console.error('Error obteniendo empleados:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER REGISTROS HORARIOS DE TODOS LOS EMPLEADOS
app.get('/api/admin/registros', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { fecha } = req.query;
    let query = `
      SELECT
        r.id_registro,
        r.id_empleado,
        r.fecha_registro,
        r.hora_entrada,
        r.hora_salida,
        r.horas_trabajadas,
        e.nombre_completo,
        e.correo_electronico
      FROM registros_horarios r
      INNER JOIN empleados e ON r.id_empleado = e.id_empleado
    `;
    const params = [];

    if (fecha) {
      query += ' WHERE r.fecha_registro = ?';
      params.push(fecha);
    }

    query += ' ORDER BY r.fecha_registro DESC, r.hora_entrada DESC LIMIT 100';

    const [registros] = await db.query(query, params);

    const registrosFormateados = registros.map(r => ({
      id: r.id_registro,
      empleadoId: r.id_empleado,
      empleadoNombre: r.nombre_completo,
      empleadoEmail: r.correo_electronico,
      fecha: r.fecha_registro,
      horaEntrada: r.hora_entrada,
      horaSalida: r.hora_salida,
      horasTrabajadas: r.horas_trabajadas
    }));

    res.json(registrosFormateados);
  } catch (error) {
    console.error('Error obteniendo registros:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// OBTENER RESUMEN POR EMPLEADO
app.get('/api/admin/resumen-empleados', authenticateToken, async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { mes } = req.query; // formato: YYYY-MM

    let query = `
      SELECT
        e.id_empleado,
        e.nombre_completo,
        e.correo_electronico,
        COUNT(r.id_registro) AS total_registros,
        SUM(r.horas_trabajadas) AS total_horas,
        AVG(r.horas_trabajadas) AS promedio_horas
      FROM empleados e
      LEFT JOIN registros_horarios r ON e.id_empleado = r.id_empleado AND r.hora_salida IS NOT NULL
    `;

    const params = [];

    if (mes) {
      query += ` AND DATE_FORMAT(r.fecha_registro, '%Y-%m') = ?`;
      params.push(mes);
    } else {
      query += ` AND DATE_FORMAT(r.fecha_registro, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`;
    }

    query += ' GROUP BY e.id_empleado, e.nombre_completo, e.correo_electronico ORDER BY e.nombre_completo';

    const [resumen] = await db.query(query, params);

    const resumenFormateado = resumen.map(r => ({
      empleadoId: r.id_empleado,
      nombre: r.nombre_completo,
      email: r.correo_electronico,
      totalRegistros: r.total_registros,
      totalHoras: parseFloat(r.total_horas || 0).toFixed(2),
      promedioHoras: parseFloat(r.promedio_horas || 0).toFixed(2)
    }));

    res.json(resumenFormateado);
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
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

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   Control Horario - Backend Mejorado  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`✓ Servidor corriendo en puerto ${PORT}`);
    console.log(`✓ URL: http://localhost:${PORT}`);
    console.log(`✓ Health: http://localhost:${PORT}/api/health`);
    console.log('');
  });
}

startServer();
