const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'alliance-secret-key-2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT,
      role TEXT DEFAULT 'operator',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients table
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT,
      dni TEXT,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      tipo_cliente TEXT,
      notas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Movements table
  db.run(`
    CREATE TABLE IF NOT EXISTS movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_operacion TEXT,
      sub_operacion TEXT,
      monto REAL,
      moneda TEXT,
      fecha DATE,
      cliente_id INTEGER,
      cliente_nombre TEXT,
      descripcion TEXT,
      estado TEXT DEFAULT 'pendiente',
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clients (id)
    )
  `);

  // Create default admin user if not exists
  const hashedPassword = bcrypt.hashSync('garralda1', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, password, name, email, role)
    VALUES ('admin', ?, 'Administrador', 'admin@alliance.com', 'admin')
  `, [hashedPassword]);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error del servidor' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Sesión cerrada' });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Clients endpoints
app.get('/api/clients', authenticateToken, (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', (err, clients) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener clientes' });
    }
    res.json(clients);
  });
});

app.post('/api/clients', authenticateToken, (req, res) => {
  const { nombre, apellido, dni, telefono, email, direccion, tipo_cliente, notas } = req.body;
  
  db.run(
    `INSERT INTO clients (nombre, apellido, dni, telefono, email, direccion, tipo_cliente, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, dni, telefono, email, direccion, tipo_cliente, notas],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al crear cliente' });
      }
      
      db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (err, client) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al obtener cliente creado' });
        }
        res.json({ success: true, client });
      });
    }
  );
});

app.put('/api/clients/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, telefono, email, direccion, tipo_cliente, notas } = req.body;
  
  db.run(
    `UPDATE clients 
     SET nombre = ?, apellido = ?, dni = ?, telefono = ?, email = ?, 
         direccion = ?, tipo_cliente = ?, notas = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nombre, apellido, dni, telefono, email, direccion, tipo_cliente, notas, id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar cliente' });
      }
      
      db.get('SELECT * FROM clients WHERE id = ?', [id], (err, client) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al obtener cliente actualizado' });
        }
        res.json({ success: true, client });
      });
    }
  );
});

app.delete('/api/clients/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al eliminar cliente' });
    }
    res.json({ success: true, message: 'Cliente eliminado' });
  });
});

// Movements endpoints
app.get('/api/movements', authenticateToken, (req, res) => {
  db.all('SELECT * FROM movements ORDER BY created_at DESC', (err, movements) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener movimientos' });
    }
    res.json(movements);
  });
});

app.post('/api/movements', authenticateToken, (req, res) => {
  const {
    tipo_operacion,
    sub_operacion,
    monto,
    moneda,
    fecha,
    cliente_id,
    cliente_nombre,
    descripcion,
    estado,
    metadata
  } = req.body;
  
  db.run(
    `INSERT INTO movements (tipo_operacion, sub_operacion, monto, moneda, fecha, 
                           cliente_id, cliente_nombre, descripcion, estado, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipo_operacion, sub_operacion, monto, moneda, fecha, cliente_id, 
     cliente_nombre, descripcion, estado, JSON.stringify(metadata)],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al crear movimiento' });
      }
      
      db.get('SELECT * FROM movements WHERE id = ?', [this.lastID], (err, movement) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al obtener movimiento creado' });
        }
        if (movement && movement.metadata) {
          movement.metadata = JSON.parse(movement.metadata);
        }
        res.json({ success: true, movement });
      });
    }
  );
});

app.put('/api/movements/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    tipo_operacion,
    sub_operacion,
    monto,
    moneda,
    fecha,
    cliente_id,
    cliente_nombre,
    descripcion,
    estado,
    metadata
  } = req.body;
  
  db.run(
    `UPDATE movements 
     SET tipo_operacion = ?, sub_operacion = ?, monto = ?, moneda = ?, fecha = ?,
         cliente_id = ?, cliente_nombre = ?, descripcion = ?, estado = ?, 
         metadata = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [tipo_operacion, sub_operacion, monto, moneda, fecha, cliente_id,
     cliente_nombre, descripcion, estado, JSON.stringify(metadata), id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al actualizar movimiento' });
      }
      
      db.get('SELECT * FROM movements WHERE id = ?', [id], (err, movement) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al obtener movimiento actualizado' });
        }
        if (movement && movement.metadata) {
          movement.metadata = JSON.parse(movement.metadata);
        }
        res.json({ success: true, movement });
      });
    }
  );
});

app.delete('/api/movements/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM movements WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al eliminar movimiento' });
    }
    res.json({ success: true, message: 'Movimiento eliminado' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🔐 Default admin credentials: admin / garralda1`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});