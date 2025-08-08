const { Sequelize } = require('sequelize');
require('dotenv').config();

// Verificar que tenemos la URL de la base de datos
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en las variables de entorno');
  console.error('Por favor, asegúrate de agregar PostgreSQL a tu proyecto en Railway');
  process.exit(1);
}

// Crear conexión con PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;