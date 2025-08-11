require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.config');

const app = express();
const PORT = process.env.PORT || 8080;

// Validar variables de entorno críticas
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada');
  console.error('Variables de entorno disponibles:', Object.keys(process.env).filter(k => !k.includes('SECRET')));
  // En Railway, DATABASE_URL podría venir de otra variable
  if (process.env.DATABASE_PRIVATE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_PRIVATE_URL;
    console.log('✅ Usando DATABASE_PRIVATE_URL como DATABASE_URL');
  } else if (process.env.DATABASE_PUBLIC_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_PUBLIC_URL;
    console.log('✅ Usando DATABASE_PUBLIC_URL como DATABASE_URL');
  } else {
    console.error('❌ No se encontró ninguna variable de conexión a la base de datos');
    process.exit(1);
  }
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret-key') {
  console.error('⚠️ ADVERTENCIA: JWT_SECRET no está configurada o está usando el valor por defecto');
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR CRÍTICO: JWT_SECRET es obligatoria en producción');
    console.error('Por favor, configura JWT_SECRET con un valor seguro y único');
    process.exit(1);
  } else {
    // Solo en desarrollo, generar una temporal
    process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
    console.log('⚠️ Generando JWT_SECRET temporal para desarrollo');
  }
}

// Configuración de CORS más estricta
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://all-production.up.railway.app',
      'https://all-blush.vercel.app',
      'https://all-franciscos-projects-deafa96a.vercel.app',
      'https://all-9086179cm-franciscos-projects-deafa96a.vercel.app'
    ];
    
    // Agregar el FRONTEND_URL si está configurado
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // Permitir solicitudes sin origen (Postman, healthchecks, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origen está permitido
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Manejo de wildcards para Vercel
        const pattern = allowed.replace(/\*/g, '.*').replace(/\./g, '\\.');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return allowed === origin;
    });
    
    // PERMITIR CUALQUIER DOMINIO DE VERCEL.APP
    if (!isAllowed && origin) {
      // Verificar si es un dominio de Vercel (más flexible)
      const vercelDomainRegex = /^https?:\/\/[a-zA-Z0-9-]+(-[a-zA-Z0-9]+)*\.vercel\.app$/;
      if (vercelDomainRegex.test(origin) || origin.includes('vercel.app')) {
        console.log(`✅ Permitiendo dominio de Vercel: ${origin}`);
        return callback(null, true);
      }
    }
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`⚠️ CORS bloqueó origen no autorizado: ${origin}`);
      callback(new Error('No autorizado por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Documentación API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Alliance F&R API Docs'
}));

// Configuración de PostgreSQL con mejor manejo de errores
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // reducir conexiones máximas
  idleTimeoutMillis: 0, // 0 = nunca cerrar conexiones por inactividad
  connectionTimeoutMillis: 0, // 0 = sin timeout de conexión
  allowExitOnIdle: false, // NO permitir que el proceso termine
  // Configuración adicional para Railway
  statement_timeout: 0, // sin timeout
  query_timeout: 0, // sin timeout
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Configuración específica para evitar desconexiones
  idle_in_transaction_session_timeout: 0, // Sin timeout para transacciones
  tcp_keepalives_idle: 60, // Enviar keepalive cada 60 segundos
  tcp_keepalives_interval: 10, // Reintentar cada 10 segundos
  tcp_keepalives_count: 10 // 10 intentos antes de cerrar
};

const pool = new Pool(poolConfig);

// Variable para controlar el estado del servidor
let isShuttingDown = false;
let serverReady = false;
let persistentClient = null;

// Mantener una conexión persistente SIEMPRE
async function maintainPersistentConnection() {
  if (isShuttingDown) return;
  
  try {
    // Si no hay cliente o se desconectó, crear uno nuevo
    if (!persistentClient) {
      persistentClient = await pool.connect();
      console.log('📌 Conexión persistente a PostgreSQL establecida');
      
      // Manejar errores en el cliente persistente
      persistentClient.on('error', (err) => {
        console.error('❌ Error en conexión persistente:', err.message);
        persistentClient = null;
        // Reconectar en 2 segundos
        setTimeout(maintainPersistentConnection, 2000);
      });
    }
    
    // Hacer una query simple para mantenerla activa
    await persistentClient.query('SELECT 1');
  } catch (err) {
    console.error('❌ Error manteniendo conexión persistente:', err.message);
    persistentClient = null;
    // Reintentar en 2 segundos
    setTimeout(maintainPersistentConnection, 2000);
  }
}

// Iniciar la conexión persistente después de 3 segundos
setTimeout(maintainPersistentConnection, 3000);

// Mantener la conexión activa cada 10 segundos
setInterval(async () => {
  if (!isShuttingDown && persistentClient) {
    try {
      await persistentClient.query('SELECT 1');
      // console.log('✓ Conexión persistente activa');
    } catch (err) {
      console.error('❌ Error en keep-alive persistente:', err.message);
      persistentClient = null;
      maintainPersistentConnection();
    }
  }
}, 10000); // Cada 10 segundos

// Manejo robusto de errores de PostgreSQL
pool.on('error', (err, client) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  // No terminar el proceso, intentar reconectar
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    console.log('🔄 Intentando reconectar a PostgreSQL en 5 segundos...');
    setTimeout(() => {
      pool.connect().then(client => {
        console.log('✅ Reconectado a PostgreSQL');
        client.release();
      }).catch(err => {
        console.error('❌ Fallo al reconectar:', err.message);
      });
    }, 5000);
  }
});

// Verificar conexión periódicamente (keep-alive)
const keepAliveInterval = setInterval(() => {
  if (!isShuttingDown && serverReady) {
    pool.query('SELECT 1', (err, result) => {
      if (err) {
        console.error('❌ Health check de PostgreSQL falló:', err.message);
      } else {
        // Log silencioso para confirmar que está vivo
        // console.log('✓ PostgreSQL keep-alive');
      }
    });
  }
}, 30000); // Cada 30 segundos

// Manejar señales de proceso para limpiar el interval
process.on('SIGTERM', () => {
  clearInterval(keepAliveInterval);
});
process.on('SIGINT', () => {
  clearInterval(keepAliveInterval);
});

// NO verificar conexión al inicio - dejar que sea lazy
console.log('🔧 Pool de PostgreSQL configurado');

// Función helper para ejecutar queries con reintentos
async function executeQuery(query, params = [], retries = 3) {
  // Si estamos cerrando, no ejecutar queries
  if (isShuttingDown) {
    throw new Error('Servidor cerrándose, no se pueden ejecutar queries');
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query(query, params);
      return result;
    } catch (error) {
      console.error(`Error en query (intento ${i + 1}/${retries}):`, error.message);
      
      // Si es un error de conexión y no es el último intento, reintentar
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === '57P01') {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        } else {
          throw error;
        }
      } else {
        // Para otros errores, no reintentar
        throw error;
      }
    }
  }
}

// Función simplificada de inicialización de base de datos
async function initDatabase() {
  try {
    console.log('🔍 Verificando base de datos...');
    
    // Primero verificar si podemos conectar
    try {
      await executeQuery('SELECT 1', [], 1); // Solo 1 intento
    } catch (connError) {
      console.error('❌ No se puede conectar a la base de datos:', connError.message);
      throw connError;
    }
    
    // 1. Verificar si las tablas existen y tienen la estructura correcta
    const tablesCheck = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'clients', 'movements')
    `);
    
    const existingTables = tablesCheck.rows.map(r => r.table_name);
    console.log('Tablas existentes:', existingTables);
    
    // 2. Solo crear tablas si NO existen
    if (!existingTables.includes('users')) {
      console.log('Creando tabla users...');
      await executeQuery(`
        CREATE TABLE users (
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
      
      // Crear índices
      await executeQuery('CREATE INDEX idx_users_email ON users(email)');
      await executeQuery('CREATE INDEX idx_users_username ON users(username)');
    }
    
    if (!existingTables.includes('clients')) {
      console.log('Creando tabla clients...');
      await executeQuery(`
        CREATE TABLE clients (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          apellido VARCHAR(255),
          dni VARCHAR(50),
          telefono VARCHAR(100),
          email VARCHAR(255),
          direccion TEXT,
          notas TEXT,
          tipo_cliente VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Crear índices
      await executeQuery('CREATE INDEX idx_clients_nombre ON clients(nombre)');
      await executeQuery('CREATE INDEX idx_clients_dni ON clients(dni)');
    }
    
    if (!existingTables.includes('movements')) {
      console.log('Creando tabla movements...');
      await executeQuery(`
        CREATE TABLE movements (
          id SERIAL PRIMARY KEY,
          cliente VARCHAR(255),
          fecha DATE NOT NULL DEFAULT CURRENT_DATE,
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
          cuotas INTEGER,
          utilidad DECIMAL(15,2),
          monedaUtilidad VARCHAR(20),
          cuentaUtilidad VARCHAR(100),
          totalUtilidad DECIMAL(15,2),
          fechaVencimiento DATE,
          formData JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER REFERENCES users(id),
          is_deleted BOOLEAN DEFAULT false,
          deleted_at TIMESTAMP
        )
      `);
      
      // Crear índices
      await executeQuery('CREATE INDEX idx_movements_fecha ON movements(fecha)');
      await executeQuery('CREATE INDEX idx_movements_cliente ON movements(cliente)');
      await executeQuery('CREATE INDEX idx_movements_estado ON movements(estado)');
    }
    
    // 3. Verificar si existe el usuario admin
    const adminCheck = await executeQuery(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    if (adminCheck.rows.length === 0) {
      console.log('Creando usuario admin por defecto...');
      
      // SEGURIDAD: Forzar contraseña desde variable de entorno
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        console.error('❌ ERROR CRÍTICO: ADMIN_PASSWORD no está configurada');
        console.error('Por favor, configura ADMIN_PASSWORD en las variables de entorno');
        throw new Error('ADMIN_PASSWORD es requerida para crear el usuario admin');
      }
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await executeQuery(
        `INSERT INTO users (name, username, email, password, role, permissions) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Administrador', 'admin', 'admin@sistema.com', hashedPassword, 'admin', '{}']
      );
      console.log('✅ Usuario admin creado (use ADMIN_PASSWORD para login)');
    }
    
    console.log('✅ Base de datos verificada y lista');
    return true;
  } catch (error) {
    console.error('❌ Error en initDatabase:', error);
    throw error;
  }
}

// Variable para controlar el estado de la DB
let dbInitialized = false;
let dbInitRetries = 0;
const MAX_DB_INIT_RETRIES = 10; // Aumentar reintentos

async function initializeDatabaseWithRetry() {
  // Si ya está inicializada o estamos cerrando, no hacer nada
  if (dbInitialized || isShuttingDown) {
    return;
  }
  
  while (!dbInitialized && dbInitRetries < MAX_DB_INIT_RETRIES && !isShuttingDown) {
    try {
      await initDatabase();
      dbInitialized = true;
      serverReady = true;
      console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
      dbInitRetries++;
      console.error(`❌ Error inicializando DB (intento ${dbInitRetries}/${MAX_DB_INIT_RETRIES}):`, error.message);
      
      if (dbInitRetries < MAX_DB_INIT_RETRIES && !isShuttingDown) {
        const waitTime = Math.min(dbInitRetries * 3000, 30000); // Máximo 30 segundos
        console.log(`Reintentando en ${waitTime/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ No se pudo inicializar la base de datos después de varios intentos');
        // El servidor continuará funcionando, pero sin DB
      }
    }
  }
}

// NO iniciar la DB inmediatamente, esperar un poco para que PostgreSQL esté listo
setTimeout(() => {
  if (!isShuttingDown) {
    console.log('🚀 Iniciando proceso de inicialización de base de datos...');
    initializeDatabaseWithRetry().then(() => {
      console.log('✅ Proceso de inicialización completado');
    }).catch(err => {
      console.error('❌ Error en el proceso de inicialización:', err);
    });
  }
}, 5000); // Esperar 5 segundos antes de intentar

// Middleware para verificar si la DB está lista
const databaseCheckMiddleware = async (req, res, next) => {
  // Si estamos cerrando, rechazar requests
  if (isShuttingDown) {
    return res.status(503).json({
      success: false,
      message: 'Servidor cerrándose'
    });
  }
  
  if (!dbInitialized) {
    // Intentar inicializar si aún no está lista
    await initializeDatabaseWithRetry();
    
    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: 'Base de datos no disponible temporalmente. Por favor, intente más tarde.'
      });
    }
  }
  next();
};

// Aplicar el middleware a todas las rutas que necesitan DB
app.use('/api/auth', databaseCheckMiddleware);
app.use('/api/users', databaseCheckMiddleware);
app.use('/api/movements', databaseCheckMiddleware);
app.use('/api/clients', databaseCheckMiddleware);

// ==========================================
// RUTAS DE API
// ==========================================

// Endpoint simple para mantener el servidor activo
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Health check básico (no depende de DB)
app.get('/api/health', (req, res) => {
  // Si estamos cerrando, indicar que no estamos saludables
  if (isShuttingDown) {
    return res.status(503).json({ 
      status: 'shutting_down',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dbInitialized: dbInitialized,
    serverReady: serverReady
  });
});

// Health check detallado
app.get('/api/health/detailed', async (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ 
      status: 'shutting_down',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    let dbStatus = 'not_initialized';
    let dbResponseTime = null;
    
    if (dbInitialized) {
      const start = Date.now();
      try {
        await executeQuery('SELECT 1 as check', [], 1);
        dbResponseTime = Date.now() - start;
        dbStatus = 'connected';
      } catch (error) {
        dbStatus = 'error';
      }
    }
    
    res.json({ 
      status: serverReady ? 'ok' : 'starting', 
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        initialized: dbInitialized,
        retries: dbInitRetries
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Error en health check detallado:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Helper para verificar si una tabla existe
async function checkTableExists(tableName) {
  try {
    const result = await executeQuery(
      'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)',
      [tableName]
    );
    return result.rows[0].exists;
  } catch {
    return false;
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario (requerido si no se envía username)
 *               username:
 *                 type: string
 *                 description: Username del usuario (requerido si no se envía email)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Buscar usuario por username o email
    const userQuery = username 
      ? 'SELECT * FROM users WHERE username = $1'
      : 'SELECT * FROM users WHERE email = $1';
    
    const result = await executeQuery(userQuery, [username || email]);
    
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
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no configurado');
      return res.status(500).json({ 
        success: false, 
        message: 'Error de configuración del servidor' 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
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

// Middleware de autenticación simple
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });
  
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no configurado');
      return res.status(500).json({ success: false, message: 'Error de configuración del servidor' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const result = await executeQuery(
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
    const result = await executeQuery(`
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
    
    const result = await executeQuery(query, values);
    
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
    const adminCount = await executeQuery("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    const userToDelete = await executeQuery("SELECT role FROM users WHERE id = $1", [id]);
    
    if (userToDelete.rows[0]?.role === 'admin' && parseInt(adminCount.rows[0].count) <= 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar el último administrador' 
      });
    }
    
    await executeQuery('DELETE FROM users WHERE id = $1', [id]);
    
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
    const result = await executeQuery(
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
app.get('/api/movements', authMiddleware, async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM movements ORDER BY fecha DESC, created_at DESC');
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
    
    const result = await executeQuery(query, values);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating movement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET movement by ID
app.get('/api/movements/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM movements WHERE id = $1';
    const result = await executeQuery(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error getting movement:', error);
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
    
    const result = await executeQuery(query, [id, ...values]);
    
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
    await executeQuery('DELETE FROM movements WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting movement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rutas básicas para clients
app.get('/api/clients', authMiddleware, async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM clients ORDER BY nombre');
    
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
    
    const result = await executeQuery(`
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
        nombre: nombre, // Devolver solo el nombre, sin el apellido
        apellido: apellido || '',
        dni: dni || '',
        tipoCliente: tipoCliente || 'operaciones'
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET client by ID
app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM clients WHERE id = $1';
    const result = await executeQuery(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    
    const client = result.rows[0];
    
    // Parsear los campos adicionales
    const parts = client.nombre.split(' ');
    const nombre = parts[0] || '';
    const apellido = parts.slice(1).join(' ') || '';
    
    // Extraer DNI y tipo de las notas
    let dni = '';
    let tipoCliente = 'operaciones';
    
    if (client.notas) {
      const dniMatch = client.notas.match(/DNI:\s*([^|]+)/);
      const tipoMatch = client.notas.match(/Tipo:\s*([^|]+)/);
      
      if (dniMatch) dni = dniMatch[1].trim();
      if (tipoMatch) tipoCliente = tipoMatch[1].trim();
    }
    
    res.json({ 
      success: true, 
      data: {
        ...client,
        nombre,
        apellido,
        dni,
        tipoCliente
      }
    });
  } catch (error) {
    console.error('Error getting client:', error);
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
    
    const result = await executeQuery(`
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
        nombre: nombre, // Devolver solo el nombre, sin el apellido
        apellido: apellido || '',
        dni: dni || '',
        tipoCliente: tipoCliente || 'operaciones'
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
    await executeQuery('DELETE FROM clients WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: error.message });
  }
  });

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

// Manejo correcto de cierre para evitar que PostgreSQL se corrompa
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando servidor gracefully...`);
  
  // Marcar que el servidor está cerrando
  isShuttingDown = true;
  serverReady = false;
  
  // Dar tiempo a las conexiones activas para terminar
  const shutdownTimeout = setTimeout(() => {
    console.error('⚠️ Timeout de cierre alcanzado, forzando salida...');
    process.exit(1);
  }, 30000); // 30 segundos máximo
  
  try {
    // 1. Cerrar servidor HTTP primero
    await new Promise((resolve) => {
      server.close((err) => {
        if (err) {
          console.error('Error cerrando servidor HTTP:', err);
        } else {
          console.log('✅ Servidor HTTP cerrado');
        }
        resolve();
      });
    });
    
    // 2. Esperar un poco para que las queries activas terminen
    console.log('Esperando que las queries activas terminen...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Cerrar la conexión persistente primero
    if (persistentClient) {
      try {
        await persistentClient.release();
        console.log('✅ Conexión persistente liberada');
      } catch (err) {
        console.error('Error liberando conexión persistente:', err);
      }
      persistentClient = null;
    }
    
    // 4. Cerrar pool de PostgreSQL
    try {
      await pool.end();
      console.log('✅ Pool de PostgreSQL cerrado correctamente');
    } catch (err) {
      console.error('Error cerrando pool de PostgreSQL:', err);
    }
    
    // 5. Limpiar el timeout
    clearTimeout(shutdownTimeout);
    
    console.log('✅ Cierre graceful completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre graceful:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Escuchar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados (pero no terminar el proceso)
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  // Si estamos en producción y es un error crítico, hacer shutdown
  if (process.env.NODE_ENV === 'production' && !isShuttingDown) {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  // No terminar el proceso a menos que sea crítico
});

// Agregar un health check específico para Railway
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  res.json({ 
    status: serverReady ? 'ready' : 'starting',
    service: 'financial-system-backend',
    timestamp: new Date().toISOString(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: PORT,
      DATABASE_CONFIGURED: !!process.env.DATABASE_URL,
      JWT_CONFIGURED: !!process.env.JWT_SECRET
    },
    database: {
      initialized: dbInitialized,
      retries: dbInitRetries
    }
  });
});