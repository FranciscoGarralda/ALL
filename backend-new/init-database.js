// SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
// Ejecutar con: node init-database.js

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function initDatabase() {
  console.log('🔄 Iniciando configuración de base de datos...');
  
  try {
    // 1. Crear tabla users
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
    console.log('✅ Tabla users creada');
    
    // 2. Crear tabla clients
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
    console.log('✅ Tabla clients creada');
    
    // 3. Crear tabla movements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movements (
        id SERIAL PRIMARY KEY,
        cliente VARCHAR(255),
        fecha DATE DEFAULT CURRENT_DATE,
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
        monedaTCCompra VARCHAR(20),
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
        walletCompra VARCHAR(50),
        walletVenta VARCHAR(50),
        walletCompraVenta VARCHAR(50),
        walletTCVenta VARCHAR(50),
        walletPrestamo VARCHAR(50),
        walletPagoPrestamo VARCHAR(50),
        walletAdministrativa VARCHAR(50),
        mixedPayments JSONB,
        expectedTotalForMixedPayments DECIMAL(15,2),
        utilidadCalculada DECIMAL(15,2),
        utilidadPorcentaje DECIMAL(5,2),
        costoPromedio DECIMAL(15,4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla movements creada');
    
    // 4. Crear índices
    await pool.query('CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_movements_cliente ON movements(cliente)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    console.log('✅ Índices creados');
    
    // 5. Crear usuario admin si no existe
    const checkAdmin = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (checkAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (name, username, email, password, role, permissions) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'Administrador',
          'admin',
          'admin@sistema.com',
          hashedPassword,
          'admin',
          ['operaciones', 'clientes', 'movimientos', 'pendientes', 'gastos', 
           'cuentas-corrientes', 'prestamistas', 'comisiones', 'utilidad', 
           'arbitraje', 'saldos', 'caja', 'rentabilidad', 'stock', 
           'saldos-iniciales', 'usuarios']
        ]
      );
      console.log('✅ Usuario admin creado (usuario: admin, contraseña: admin123)');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }
    
    // 6. Verificar tablas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📊 Tablas en la base de datos:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n✅ ¡Base de datos inicializada correctamente!');
    console.log('📌 Usuario admin: admin / admin123');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();