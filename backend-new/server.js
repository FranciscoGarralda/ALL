// SERVIDOR BACKEND OPTIMIZADO PARA RAILWAY
// Sistema Financiero Alliance F&R v2.0

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// INFORMACIÓN DE CONFIGURACIÓN
// ==========================================
console.log('🔧 CONFIGURACIÓN DEL SERVIDOR:');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ NO CONFIGURADA');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurada' : '⚠️ Usando default');

// ==========================================
// CONFIGURACIÓN DE BASE DE DATOS
// ==========================================
let pool = null;
let dbConnected = false;

// Solo intentar conectar si DATABASE_URL existe
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    connectionTimeoutMillis: 5000,
    max: 3
  });

  // Verificar conexión a la base de datos
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Error conectando a PostgreSQL:', err.message);
      dbConnected = false;
    } else {
      console.log('✅ PostgreSQL conectado:', res.rows[0].now);
      dbConnected = true;
      // Intentar crear las tablas
      initializeTables();
    }
  });
} else {
  console.log('⚠️ Servidor arrancando sin base de datos');
}

// Función para crear tablas si no existen
async function initializeTables() {
  if (!pool || !dbConnected) return;
  
  try {
    // Crear tabla users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'operator',
        permissions TEXT[] DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(100),
        email VARCHAR(255),
        direccion TEXT,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla movements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movements (
        id SERIAL PRIMARY KEY,
        fecha DATE DEFAULT CURRENT_DATE,
        hora TIME DEFAULT CURRENT_TIME,
        cliente VARCHAR(255),
        operacion VARCHAR(100),
        suboperacion VARCHAR(100),
        moneda_entrada VARCHAR(10),
        cantidad_entrada DECIMAL(15,2),
        cotizacion DECIMAL(15,4),
        moneda_salida VARCHAR(10),
        cantidad_salida DECIMAL(15,2),
        metodo_pago VARCHAR(50),
        referencia_pago VARCHAR(255),
        notas TEXT,
        estado VARCHAR(50) DEFAULT 'completado',
        usuario VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tablas verificadas/creadas');
    
    // Crear usuario admin si no existe
    const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('garralda1', 10);
      await pool.query(
        `INSERT INTO users (name, username, email, password, role, permissions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Administrador', 'admin', 'admin@alliance.com', hashedPassword, 'admin', ['all']]
      );
      console.log('✅ Usuario admin creado (contraseña: garralda1)');
    }
  } catch (error) {
    console.error('⚠️ Error creando tablas:', error.message);
  }
}

// ==========================================
// CONFIGURACIÓN DE CORS
// ==========================================
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir cualquier origen de Vercel y localhost
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/
    ];
    
    if (!origin || allowedPatterns.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS bloqueó:', origin);
      callback(new Error('No autorizado por CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// RUTAS DE HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    // Si no hay DB, usar credenciales hardcodeadas para prueba
    if (!pool || !dbConnected) {
      const { username, password } = req.body;
      if (username === 'admin' && password === 'garralda1') {
        const token = jwt.sign(
          { id: 1, username: 'admin', role: 'admin' },
          process.env.JWT_SECRET || 'secret-key-desarrollo',
          { expiresIn: '30d' }
        );
        
        return res.json({
          success: true,
          token,
          user: {
            id: 1,
            name: 'Administrador',
            username: 'admin',
            email: 'admin@alliance.com',
            role: 'admin',
            permissions: ['all']
          }
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario o contraseña incorrectos' 
        });
      }
    }
    
    const { username, password } = req.body;
    
    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }
    
    const user = result.rows[0];
    
    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }
    
    // Generar token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret-key-desarrollo',
      { expiresIn: '30d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, username, email, role, permissions FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// ==========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ==========================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token no proporcionado' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret-key-desarrollo', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// RUTAS DE CLIENTES
// ==========================================
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY nombre');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { nombre, telefono, email, direccion, notas } = req.body;
    
    const result = await pool.query(
      'INSERT INTO clients (nombre, telefono, email, direccion, notas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, telefono, email, direccion, notas]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, direccion, notas } = req.body;
    
    const result = await pool.query(
      'UPDATE clients SET nombre = $1, telefono = $2, email = $3, direccion = $4, notas = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [nombre, telefono, email, direccion, notas, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// RUTAS DE MOVIMIENTOS
// ==========================================
app.get('/api/movements', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movements ORDER BY fecha DESC, id DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/movements', authenticateToken, async (req, res) => {
  try {
    const columns = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO movements (${columns.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/movements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM movements WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo movimiento:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/movements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const columns = Object.keys(req.body);
    const values = Object.values(req.body);
    
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE movements 
      SET ${setClause}, updated_at = NOW() 
      WHERE id = $${columns.length + 1} 
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando movimiento:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/movements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM movements WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }
    
    res.json({ success: true, message: 'Movimiento eliminado' });
  } catch (error) {
    console.error('Error eliminando movimiento:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`
    ========================================
    🚀 Backend Alliance F&R v2.0
    ========================================
    ✅ Servidor corriendo en puerto ${PORT}
    ✅ Entorno: ${process.env.NODE_ENV || 'development'}
    ✅ Base de datos: ${process.env.DATABASE_URL ? 'Configurada' : 'No configurada'}
    ========================================
  `);
});