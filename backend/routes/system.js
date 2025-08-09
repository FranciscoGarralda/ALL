const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { protect, authorize } = require('../middleware/auth');

// Crear pool directamente aquí
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Endpoint para verificar y arreglar el sistema de usuarios
router.post('/fix-users', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('Ejecutando verificación del sistema de usuarios...');
    
    // Primero verificar si la tabla existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('La tabla users no existe. Creándola...');
      
      // Crear la tabla
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
          permissions TEXT[] DEFAULT '{}',
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Crear índices
      await pool.query('CREATE INDEX idx_users_email ON users(email)');
      await pool.query('CREATE INDEX idx_users_role ON users(role)');
      
      // Crear usuario admin por defecto
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (name, username, email, password, role, permissions, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'Administrador',
        'admin',
        'admin@sistema.com',
        hashedPassword,
        'admin',
        [
          'operaciones', 'clientes', 'movimientos', 'pendientes',
          'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
          'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
          'stock', 'saldos-iniciales', 'usuarios'
        ],
        true
      ]);
      
      return res.json({
        success: true,
        message: 'Tabla users creada exitosamente. Usuario admin creado (email: admin@sistema.com, password: admin123)'
      });
    }
    
    // Si la tabla existe, verificar columnas
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    const existingColumns = columnsCheck.rows.map(col => col.column_name);
    
    // Agregar columnas faltantes
    if (!existingColumns.includes('permissions')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN permissions TEXT[] DEFAULT '{}';
      `);
    }
    
    if (!existingColumns.includes('active')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN active BOOLEAN DEFAULT true;
      `);
    }
    
    // Actualizar permisos
    await pool.query(`
      UPDATE users 
      SET permissions = ARRAY[
        'operaciones', 'clientes', 'movimientos', 'pendientes',
        'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
        'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
        'stock', 'saldos-iniciales', 'usuarios'
      ]
      WHERE role = 'admin' AND (permissions IS NULL OR permissions = '{}');
    `);
    
    res.json({
      success: true,
      message: 'Sistema de usuarios actualizado correctamente'
    });
    
  } catch (error) {
    console.error('Error fixing users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sistema de usuarios',
      error: error.message
    });
  }
});

// Endpoint para verificar el estado del sistema
router.get('/status', protect, authorize('admin'), async (req, res) => {
  try {
    // Verificar tabla users
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    // Verificar columnas
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    // Contar usuarios
    const userCount = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN role = \'admin\' THEN 1 END) as admins FROM users'
    );
    
    res.json({
      success: true,
      status: {
        usersTable: tableCheck.rows[0].exists,
        columns: columnsCheck.rows.map(col => col.column_name),
        userCount: userCount.rows[0]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar estado del sistema',
      error: error.message
    });
  }
});

// Endpoint TEMPORAL para arreglar username - SIN AUTENTICACIÓN
router.get('/fix-username', async (req, res) => {
  try {
    console.log('Ejecutando fix de username...');
    
    // Primero intentar agregar la columna
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN username VARCHAR(255)`);
      console.log('Columna username agregada');
    } catch (err) {
      console.log('La columna ya existe o error:', err.message);
    }
    
    // Actualizar usuarios
    try {
      // Actualizar admin específicamente
      await pool.query(`
        UPDATE users 
        SET username = 'admin' 
        WHERE email = 'admin@sistema.com' AND username IS NULL
      `);
      
      // Actualizar otros usuarios
      await pool.query(`
        UPDATE users 
        SET username = SPLIT_PART(email, '@', 1) 
        WHERE username IS NULL AND email IS NOT NULL
      `);
      
      console.log('Usuarios actualizados');
    } catch (err) {
      console.log('Error actualizando usuarios:', err.message);
    }
    
    // Verificar resultado
    const users = await pool.query(`
      SELECT id, name, username, email, role 
      FROM users 
      WHERE role = 'admin'
      LIMIT 5
    `);
    
    res.json({
      success: true,
      message: 'Fix ejecutado. Usuarios admin:',
      users: users.rows
    });
    
  } catch (error) {
    console.error('Error general:', error);
    res.json({
      success: false,
      message: error.message,
      detail: 'Revisa los logs de Railway para más información'
    });
  }
});

module.exports = router;