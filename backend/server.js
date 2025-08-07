const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import database and models
const { sequelize, User, Movement, Client } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movementRoutes = require('./routes/movements');
const clientRoutes = require('./routes/clients');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Trust proxy for Railway
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// TEMPORAL: Hacer todas las rutas públicas
app.use((req, res, next) => {
  // Si es una ruta de API, simular un usuario autenticado
  if (req.path.startsWith('/api/')) {
    req.user = { id: 1, role: 'admin' };
  }
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/clients', clientRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// TEMPORAL: Endpoint público para crear datos de prueba
app.post('/api/public/test-data', async (req, res) => {
  try {
    const { Movement } = require('./models');
    
    // Crear algunos movimientos de prueba
    const testMovements = [
      {
        fecha: new Date(),
        operacion: 'TRANSACCIONES',
        subOperacion: 'COMPRA',
        cliente: 'Cliente Test 1',
        moneda: 'USD',
        monto: 1000,
        montoTC: 950000,
        monedaTC: 'PESO',
        comision: 50,
        montoTotal: 950000,
        estado: 'completado',
        socio: 'socio1',
        tipoEgreso: 'digital',
        tipoIngreso: 'efectivo',
        userId: 1
      },
      {
        fecha: new Date(),
        operacion: 'TRANSACCIONES',
        subOperacion: 'VENTA',
        cliente: 'Cliente Test 2',
        moneda: 'USD',
        monto: 500,
        montoTC: 475000,
        monedaTC: 'PESO',
        comision: 25,
        montoTotal: 475000,
        estado: 'completado',
        socio: 'socio2',
        tipoEgreso: 'efectivo',
        tipoIngreso: 'digital',
        userId: 1
      }
    ];
    
    const created = await Movement.bulkCreate(testMovements);
    
    res.json({
      success: true,
      message: 'Datos de prueba creados',
      count: created.length
    });
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear datos de prueba',
      error: error.message
    });
  }
});

// TEMPORAL: Endpoint público para obtener movimientos
app.get('/api/public/movements', async (req, res) => {
  try {
    const { Movement } = require('./models');
    const movements = await Movement.findAll({
      order: [['fecha', 'DESC']],
      limit: 100
    });
    
    res.json({
      success: true,
      data: movements,
      total: movements.length
    });
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos',
      error: error.message
    });
  }
});

// Root route
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

// Error handler (must be last)
app.use(errorHandler);

// Initialize admin user
const initializeAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'FranciscoGarralda';
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ 
      where: { 
        username: adminUsername 
      } 
    });
    
    if (!existingAdmin) {
      // Create admin user
      const adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Francisco Garralda',
        username: adminUsername,
        password: process.env.ADMIN_PASSWORD || 'garralda1',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Usuario administrador creado exitosamente');
      console.log(`👤 Username: ${adminUsername}`);
    } else {
      console.log('ℹ️  Usuario administrador ya existe');
    }
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
  }
};

// Connect to database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada');
    
    // Initialize admin user
    await initializeAdmin();
    
    // Start server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM recibido, cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        sequelize.close();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Start the server
startServer();