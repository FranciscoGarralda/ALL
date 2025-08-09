const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const sequelize = require('./config/database');
const { User, Movement, Client } = require('./models');

// Importar rutas
const authRoutes = require('./routes/auth');
const movementRoutes = require('./routes/movements');
const clientRoutes = require('./routes/clients');
const userRoutes = require('./routes/users');
const systemRoutes = require('./routes/system');

const app = express();

// Configuración de seguridad
app.use(helmet());
app.use(compression());

// Configuración CORS
const allowedOrigins = [
  'https://all-blush.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (ej: Postman, apps móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Temporalmente permitir todos los orígenes
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware adicional para headers CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  // Responder a pre-flight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar trust proxy para Railway
app.set('trust proxy', 1);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system', systemRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Financial System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      movements: '/api/movements',
      clients: '/api/clients',
      health: '/api/health'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Función para inicializar usuario admin
async function initializeAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'francisco@garralda.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'FranciscoGarralda';
    
    // Buscar si ya existe el admin
    const existingAdmin = await User.findOne({ 
      where: { username: adminUsername }
    });
    
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Francisco Garralda',
        username: adminUsername,
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'garralda1',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Usuario administrador creado exitosamente');
      console.log(`👤 Username: ${adminUsername}`);
    } else {
      console.log('ℹ️ Usuario administrador ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
  }
}

// Inicializar servidor
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente');
    
    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada');
    
    // Crear usuario admin si no existe
    await initializeAdmin();
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();