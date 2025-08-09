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

// Login simple
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const user = result.rows[0];
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      });
    }
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, username: user.username || user.email },
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
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor mínimo corriendo en puerto ${PORT}`);
});