const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const pool = require('../config/database');

// GET all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, permissions, active, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// CREATE new user (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  const { name, email, password, role, permissions, active } = req.body;
  
  console.log('Creating user with data:', { name, email, role, permissions, active });
  
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, permissions, active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role, permissions, active, created_at`,
      [name, email, hashedPassword, role || 'operator', permissions || [], active !== false]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Manejo específico de errores de PostgreSQL
    if (error.code === '23505') { // Duplicate key
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    if (error.code === '23502') { // Not null violation
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    if (error.code === '42703') { // Column does not exist
      return res.status(500).json({
        success: false,
        message: 'Error de base de datos: columna no existe. Use el botón "Reparar Sistema"',
        requiresFix: true
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario: ' + error.message
    });
  }
});

// UPDATE user (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, permissions, active } = req.body;
  
  try {
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    
    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }
    
    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }
    
    if (permissions !== undefined) {
      updates.push(`permissions = $${paramCount}`);
      values.push(permissions);
      paramCount++;
    }
    
    if (active !== undefined) {
      updates.push(`active = $${paramCount}`);
      values.push(active);
      paramCount++;
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE users 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, name, email, role, permissions, active, created_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
});

// DELETE user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Don't allow deleting the last admin
    const adminCount = await pool.query(
      'SELECT COUNT(*) FROM users WHERE role = $1 AND id != $2',
      ['admin', id]
    );
    
    const userToDelete = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );
    
    if (userToDelete.rows[0]?.role === 'admin' && parseInt(adminCount.rows[0].count) === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el último administrador'
      });
    }
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
});

module.exports = router;