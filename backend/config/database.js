const { Sequelize } = require('sequelize');

// Railway proporciona DATABASE_URL automáticamente cuando agregas PostgreSQL
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: No se encontró DATABASE_URL');
  console.log('Asegúrate de haber agregado PostgreSQL a tu proyecto en Railway');
  process.exit(1);
}

// Crear conexión con PostgreSQL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;