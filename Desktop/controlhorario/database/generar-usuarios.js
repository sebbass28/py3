#!/usr/bin/env node

/**
 * Script para generar usuarios de prueba con contraseñas hasheadas
 * Ejecutar: node generar-usuarios.js
 */

const bcrypt = require('bcryptjs');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  GENERADOR DE USUARIOS - Control Horario      ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Generar hashes
const adminHash = bcrypt.hashSync('admin123', 10);
const userHash = bcrypt.hashSync('user123', 10);

console.log('✓ Hashes generados correctamente\n');

console.log('════════════════════════════════════════════════');
console.log('  SQL PARA INSERTAR USUARIOS');
console.log('════════════════════════════════════════════════\n');

console.log(`-- Usuario Admin (admin@demo.com / admin123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@demo.com', '${adminHash}', 'admin');

-- Usuario Normal (juan@demo.com / user123)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Juan Pérez', 'juan@demo.com', '${userHash}', 'usuario');
`);

console.log('\n════════════════════════════════════════════════');
console.log('  CREDENCIALES DE PRUEBA');
console.log('════════════════════════════════════════════════\n');

console.log('Admin:');
console.log('  Email: admin@demo.com');
console.log('  Password: admin123\n');

console.log('Usuario:');
console.log('  Email: juan@demo.com');
console.log('  Password: user123\n');

console.log('════════════════════════════════════════════════\n');
console.log('Copia el SQL de arriba y ejecútalo en tu base de datos.\n');
