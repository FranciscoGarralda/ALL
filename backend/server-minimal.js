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

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

// Función simplificada de inicialización de base de datos
async function initDatabase() {
  try {
    // 1. Crear tablas si no existen (SOLO EN MINÚSCULAS)
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS movements (
        id SERIAL PRIMARY KEY,
        cliente VARCHAR(255),
        fecha DATE NOT NULL,
        nombreDia VARCHAR(20),
        detalle TEXT,
        operacion VARCHAR(100),
        subOperacion VARCHAR(100),
        proveedorCC VARCHAR(255),
        monto DECIMAL(15,2),
        moneda VARCHAR(20),
        cuenta VARCHAR(100),
        total DECIMAL(15,2),
        estado VARCHAR(50),
        por VARCHAR(100),
        nombreOtro VARCHAR(255),
        tc DECIMAL(15,4),
        monedaTC VARCHAR(20),
        monedaTCCmpra VARCHAR(20),
        monedaTCVenta VARCHAR(20),
        monedaVenta VARCHAR(20),
        tcVenta DECIMAL(15,4),
        comision DECIMAL(15,2),
        comisionPorcentaje DECIMAL(5,2),
        montoComision DECIMAL(15,2),
        montoReal DECIMAL(15,2),
        monedaComision VARCHAR(20),
        cuentaComision VARCHAR(100),
        interes DECIMAL(5,2),
        lapso VARCHAR(50),
        fechaLimite DATE,
        socioSeleccionado VARCHAR(100),
        totalCompra DECIMAL(15,2),
        totalVenta DECIMAL(15,2),
        montoVenta DECIMAL(15,2),
        cuentaSalida VARCHAR(100),
        cuentaIngreso VARCHAR(100),
        profit DECIMAL(15,2),
        monedaProfit VARCHAR(20),
        walletTC VARCHAR(50),
        mixedPayments JSONB,
        expectedTotalForMixedPayments DECIMAL(15,2),
        utilidadCalculada DECIMAL(15,2),
        utilidadPorcentaje DECIMAL(5,2),
        costoPromedio DECIMAL(15,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
        permissions TEXT[] DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Agregar columnas faltantes a clients si es necesario
    const columnsToAdd = [
      { name: 'telefono', type: 'VARCHAR(100)' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'direccion', type: 'TEXT' },
      { name: 'notas', type: 'TEXT' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const column of columnsToAdd) {
      await pool.query(
        `ALTER TABLE clients ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`
      ).catch(err => {
        console.log(`Columna ${column.name} ya existe o error:`, err.message);
      });
    }

    // 3. Crear índices básicos
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`).catch(() => {});
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha)`).catch(() => {});
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre)`).catch(() => {});

    console.log('✅ Base de datos lista');
  } catch (error) {
    console.error('Error inicializando BD:', error);
  }
}

// Inicializar base de datos al arrancar
initDatabase().catch(console.error);

// ==========================================
// RUTAS DE API
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: pool ? 'connected' : 'disconnected'
  });
});

// ==========================================
// AUTENTICACIÓN
// ==========================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Buscar usuario por username o email
    const userQuery = username 
      ? 'SELECT * FROM users WHERE username = $1'
      : 'SELECT * FROM users WHERE email = $1';
    
    const result = await pool.query(userQuery, [username || email]);
    
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
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '30d' }
    );
    
    // Parsear permisos si vienen como string de PostgreSQL
    if (user.permissions && typeof user.permissions === 'string') {
      user.permissions = user.permissions
        .replace(/[{}]/g, '')
        .split(',')
        .filter(p => p);
    }
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión' 
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
    const result = await pool.query(
      'SELECT id, name, username, email, role, permissions, active FROM users ORDER BY created_at DESC'
    );
    
    // Parsear permisos para cada usuario
    const users = result.rows.map(user => {
      let permissions = user.permissions || [];
      if (typeof permissions === 'string' && permissions.startsWith('{')) {
        permissions = permissions
          .replace(/^{/, '')
          .replace(/}$/, '')
          .split(',')
          .filter(p => p && p.trim());
      }
      return {
        ...user,
        permissions
      };
    });
    
    res.json({ success: true, data: users });
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
    
    // Formatear permisos para PostgreSQL array
    const formattedPermissions = `{${permissions.join(',')}}`;
    
    // Insertar usuario con permisos
    const result = await pool.query(`
      INSERT INTO users (name, username, email, password, role, permissions, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, username, email, role, permissions
    `, [name, username, email, hashedPassword, role, formattedPermissions, active]);
    
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
    const { name, email, password, role, permissions, active } = req.body;
    
    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (permissions !== undefined) {
      // Formatear permisos para PostgreSQL
      const formattedPermissions = Array.isArray(permissions) 
        ? `{${permissions.join(',')}}` 
        : permissions;
      updates.push(`permissions = $${paramCount++}`);
      values.push(formattedPermissions);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      values.push(active);
    }
    
    query += updates.join(', ');
    query += ` WHERE id = $${paramCount} RETURNING id, name, username, email, role, permissions, active`;
    values.push(id);
    
    const result = await pool.query(query, values);
    
    // Parsear permisos en la respuesta
    const user = result.rows[0];
    if (user && typeof user.permissions === 'string' && user.permissions.startsWith('{')) {
      user.permissions = user.permissions
        .replace(/^{/, '')
        .replace(/}$/, '')
        .split(',')
        .filter(p => p && p.trim());
    }
    
    res.json({ 
      success: true, 
      data: user 
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

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, username, email, role, permissions FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    
    // Parsear permisos si vienen como string de PostgreSQL
    let userPermissions = user.permissions || [];
    if (typeof userPermissions === 'string' && userPermissions.startsWith('{')) {
      userPermissions = userPermissions
        .replace(/^{/, '')
        .replace(/}$/, '')
        .split(',')
        .filter(p => p);
    }
    
    res.json({
      success: true,
      user: {
        ...user,
        permissions: userPermissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rutas básicas para movements
app.get('/api/movements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movements ORDER BY fecha DESC, created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error getting movements:', error);
    res.json({ success: true, data: [] }); // Fallback para no romper el frontend
  }
});

app.post('/api/movements', authMiddleware, async (req, res) => {
  try {
    const movementData = req.body;
    const columns = Object.keys(movementData).filter(key => key !== 'id');
    const values = columns.map(col => movementData[col]);
    const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
    
    const query = `
      INSERT INTO movements (${columns.join(', ')}, created_at, updated_at)
      VALUES (${placeholders}, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating movement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/movements/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const movementData = req.body;
    const columns = Object.keys(movementData).filter(key => key !== 'id' && key !== 'created_at');
    const values = columns.map(col => movementData[col]);
    const setClause = columns.map((col, idx) => `${col} = $${idx + 2}`).join(', ');
    
    const query = `
      UPDATE movements 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, ...values]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating movement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/movements/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM movements WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting movement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rutas básicas para clients
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY nombre');
    
    // Parsear los campos adicionales desde las notas
    const clients = result.rows.map(client => {
      const parts = client.nombre.split(' ');
      const nombre = parts[0] || '';
      const apellido = parts.slice(1).join(' ') || '';
      
      // Extraer DNI y tipo de las notas
      let dni = '';
      let tipoCliente = '';
      
      if (client.notas) {
        const dniMatch = client.notas.match(/DNI:\s*([^|]+)/);
        const tipoMatch = client.notas.match(/Tipo:\s*([^|]+)/);
        
        if (dniMatch) dni = dniMatch[1].trim();
        if (tipoMatch) tipoCliente = tipoMatch[1].trim();
      }
      
      return {
        ...client,
        nombre,
        apellido,
        dni,
        tipoCliente
      };
    });
    
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error getting clients:', error);
    res.json({ success: true, data: [] }); // Fallback para no romper el frontend
  }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  try {
    const { 
      nombre, 
      apellido = '', 
      telefono = '', 
      email = '', 
      direccion = '', 
      dni = '',
      tipoCliente = '',
      notas = '' 
    } = req.body;
    
    // Combinar nombre y apellido para el campo nombre en la BD
    const nombreCompleto = apellido ? `${nombre} ${apellido}`.trim() : nombre;
    
    // Crear notas con información adicional
    const notasCompletas = [
      dni ? `DNI: ${dni}` : '',
      tipoCliente ? `Tipo: ${tipoCliente}` : '',
      notas
    ].filter(Boolean).join(' | ');
    
    const result = await pool.query(`
      INSERT INTO clients (nombre, telefono, email, direccion, notas, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [nombreCompleto, telefono, email, direccion, notasCompletas]);
    
    // Devolver el cliente con los campos separados para el frontend
    const client = result.rows[0];
    res.status(201).json({ 
      success: true, 
      data: {
        ...client,
        apellido,
        dni,
        tipoCliente
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      apellido = '', 
      telefono, 
      email, 
      direccion, 
      dni = '',
      tipoCliente = '',
      notas 
    } = req.body;
    
    // Combinar nombre y apellido para el campo nombre en la BD
    const nombreCompleto = apellido ? `${nombre} ${apellido}`.trim() : nombre;
    
    // Crear notas con información adicional
    const notasCompletas = [
      dni ? `DNI: ${dni}` : '',
      tipoCliente ? `Tipo: ${tipoCliente}` : '',
      notas
    ].filter(Boolean).join(' | ');
    
    const result = await pool.query(`
      UPDATE clients 
      SET nombre = $1, telefono = $2, email = $3, direccion = $4, notas = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [nombreCompleto, telefono, email, direccion, notasCompletas, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    
    // Devolver el cliente con los campos separados para el frontend
    const client = result.rows[0];
    res.json({ 
      success: true, 
      data: {
        ...client,
        apellido,
        dni,
        tipoCliente
      }
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  // No terminar el proceso
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  // No terminar el proceso
});