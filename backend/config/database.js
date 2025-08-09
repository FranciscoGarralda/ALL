const { Sequelize } = require('sequelize');
require('dotenv').config();

// Verificar que tenemos la URL de la base de datos
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en las variables de entorno');
  console.error('Por favor, asegúrate de agregar PostgreSQL a tu proyecto en Railway');
  process.exit(1);
}

// Crear conexión con PostgreSQL - Optimizada para Railway pago
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Timeouts más agresivos para Railway pago
    statement_timeout: 5000, // 5 segundos
    connect_timeout: 5
  },
  logging: false, // Desactivar logs para mejor rendimiento
  pool: {
    max: 20, // Más conexiones para Railway pago
    min: 5,  // Mantener mínimo 5 conexiones activas
    acquire: 5000, // 5 segundos máximo para adquirir conexión
    idle: 10000,
    evict: 1000 // Verificar conexiones cada segundo
  },
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ]
  }
});

module.exports = sequelize;