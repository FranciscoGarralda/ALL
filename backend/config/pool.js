const { Pool } = require('pg');
require('dotenv').config();

// Pool optimizado para Railway pago
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  // Configuración optimizada para Railway pago
  max: 20, // Máximo de conexiones
  min: 5,  // Mínimo de conexiones activas
  idleTimeoutMillis: 10000, // 10 segundos
  connectionTimeoutMillis: 5000, // 5 segundos para conectar
  statement_timeout: 5000, // 5 segundos para queries
  query_timeout: 5000,
  // Reconexión automática
  allowExitOnIdle: false
});

// Eventos de depuración
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

pool.on('connect', () => {
  console.log('Nueva conexión establecida al pool');
});

// Verificar conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err);
  } else {
    console.log('✅ Pool de PostgreSQL conectado:', res.rows[0].now);
  }
});

module.exports = pool;