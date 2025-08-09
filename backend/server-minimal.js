const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(cors());
app.use(express.json());

// Pool de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Debug - Ver usuarios
app.get('/api/debug-users', async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, name, username, email, role FROM users'
    );
    res.json({ 
      success: true, 
      count: users.rows.length,
      users: users.rows 
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Fix username endpoint
app.get('/api/fix-username', async (req, res) => {
  try {
    // Intentar agregar columna
    try {
      await pool.query('ALTER TABLE users ADD COLUMN username VARCHAR(255)');
    } catch (e) {}
    
    // Actualizar admin
    await pool.query(`
      UPDATE users SET username = 'admin' 
      WHERE email = 'admin@sistema.com'
    `);
    
    res.json({ success: true, message: 'Username agregado' });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Crear usuario admin
app.get('/api/create-admin', async (req, res) => {
  try {
    // Verificar si ya existe
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@sistema.com' OR username = 'admin'"
    );
    
    if (existing.rows.length > 0) {
      return res.json({ success: true, message: 'Admin ya existe' });
    }
    
    // Crear contraseña hasheada
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insertar admin - intentar con active, si falla sin active
    let result;
    try {
      result = await pool.query(`
        INSERT INTO users (name, username, email, password, role, permissions, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, username, email
      `, [
        'Administrador',
        'admin',
        'admin@sistema.com',
        hashedPassword,
        'admin',
        ['operaciones', 'clientes', 'movimientos', 'pendientes', 'gastos', 'usuarios'],
        true
      ]);
    } catch (err) {
      // Si falla, intentar sin active
      result = await pool.query(`
        INSERT INTO users (name, username, email, password, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, email
      `, [
        'Administrador',
        'admin',
        'admin@sistema.com',
        hashedPassword,
        'admin'
      ]);
    }
    
    res.json({ 
      success: true, 
      message: 'Usuario admin creado exitosamente',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creando admin:', error);
    res.json({ 
      success: false, 
      error: error.message,
      detail: error.detail 
    });
  }
});

// Login simple
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username });
    
    // Buscar usuario por username O email
    const result = await pool.query(`
      SELECT * FROM users 
      WHERE username = $1 
         OR email = $1 
         OR (username IS NULL AND email = 'admin@sistema.com' AND $1 = 'admin')
    `, [username]);
    
    console.log('Users found:', result.rows.length);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado. Intenta con: admin' 
      });
    }
    
    const user = result.rows[0];
    console.log('User found:', { id: user.id, username: user.username, email: user.email });
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta. Usa: admin123' 
      });
    }
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, username: user.username || user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username || user.email,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error: ' + error.message 
    });
  }
});

// GET /api/me - Obtener usuario actual
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username || user.email,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
});

// Middleware de autenticación simple
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// GET usuarios
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, name, username, email, role, permissions FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST crear usuario
app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role = 'operator', permissions = [], active = true } = req.body;
    
    // Generar username desde email
    const username = email.split('@')[0];
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insertar usuario
    const result = await pool.query(`
      INSERT INTO users (name, username, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, username, email, role
    `, [name, username, email, hashedPassword, role]);
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: error.detail || error.message 
    });
  }
});

// PUT actualizar usuario
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, active } = req.body;
    
    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];
    let paramCount = 1;
    
    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    if (role) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    query += updates.join(', ');
    query += ` WHERE id = $${paramCount} RETURNING id, name, username, email, role`;
    values.push(id);
    
    const result = await pool.query(query, values);
    
    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE usuario
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir borrar el último admin
    const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    const userToDelete = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
    
    if (userToDelete.rows[0]?.role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar el último administrador' 
      });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Rutas básicas para que funcione el sistema
app.get('/api/movements', (req, res) => res.json({ success: true, data: [] }));
app.get('/api/clients', (req, res) => res.json({ success: true, data: [] }));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor mínimo corriendo en puerto ${PORT}`);
});