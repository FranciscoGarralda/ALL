const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// Endpoint para verificar y arreglar el sistema de usuarios
router.post('/fix-users', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('Ejecutando verificación del sistema de usuarios...');
    
    // Verificar columnas
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
        'stock', 'saldos-iniciales'
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

module.exports = router;