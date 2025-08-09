const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Crear pool aquí directamente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

const TABLES_SCHEMA = {
  users: `
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
  `,
  movements: `
    CREATE TABLE IF NOT EXISTS movements (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      concept VARCHAR(255) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(100),
      subcategory VARCHAR(100),
      client_id INTEGER,
      payment_method VARCHAR(50),
      currency VARCHAR(10) DEFAULT 'USD',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      balance DECIMAL(15,2) DEFAULT 0,
      contact VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
};

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
  'CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(date)',
  'CREATE INDEX IF NOT EXISTS idx_movements_client ON movements(client_id)',
  'CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type)'
];

async function initializeDatabase() {
  console.log('🚀 Inicializando base de datos...');
  
  try {
    // 1. Crear todas las tablas
    for (const [tableName, schema] of Object.entries(TABLES_SCHEMA)) {
      console.log(`📋 Verificando tabla ${tableName}...`);
      await pool.query(schema);
      console.log(`✅ Tabla ${tableName} lista`);
    }
    
    // 2. Crear índices
    console.log('\n📑 Creando índices...');
    for (const index of INDEXES) {
      await pool.query(index);
    }
    console.log('✅ Índices creados');
    
    // 3. Verificar si existe usuario admin
    let adminCount = 0;
    try {
      const adminCheck = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin'"
      );
      adminCount = parseInt(adminCheck.rows?.[0]?.count || 0);
    } catch (error) {
      console.log('⚠️ No se pudo verificar usuarios admin:', error.message);
      adminCount = 0;
    }
    
    if (adminCount === 0) {
      console.log('\n👤 Creando usuario administrador por defecto...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (name, username, email, password, role, permissions, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'Administrador',
        'admin',  // username
        'admin@sistema.com',
        hashedPassword,
        'admin',
        [
          'operaciones', 'clientes', 'movimientos', 'pendientes',
          'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
          'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
          'stock', 'saldos-iniciales', 'usuarios'
        ],
        true
      ]);
      
      console.log('✅ Usuario admin creado (admin@sistema.com / admin123)');
    }
    
    // 4. Ejecutar migraciones pendientes
    await runMigrations();
    
    console.log('\n✅ Base de datos inicializada correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

async function runMigrations() {
  console.log('\n🔄 Ejecutando migraciones...');
  
  try {
    // Crear tabla de migraciones si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Lista de migraciones
    const migrations = [
      {
        name: 'add_permissions_to_users',
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'users' AND column_name = 'permissions') THEN
              ALTER TABLE users ADD COLUMN permissions TEXT[] DEFAULT '{}';
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'users' AND column_name = 'active') THEN
              ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true;
            END IF;
          END $$;
        `
      },
      {
        name: 'add_username_column',
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'users' AND column_name = 'username') THEN
              ALTER TABLE users ADD COLUMN username VARCHAR(255);
              
              -- Actualizar usuarios existentes para que username = email sin el dominio
              UPDATE users 
              SET username = SPLIT_PART(email, '@', 1)
              WHERE username IS NULL;
              
              -- Hacer username NOT NULL y UNIQUE
              ALTER TABLE users ALTER COLUMN username SET NOT NULL;
              ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
            END IF;
          END $$;
        `
      }
    ];
    
    // Ejecutar migraciones pendientes
    for (const migration of migrations) {
      const executed = await pool.query(
        'SELECT 1 FROM migrations WHERE name = $1',
        [migration.name]
      );
      
      if (executed.rows.length === 0) {
        console.log(`  Ejecutando migración: ${migration.name}`);
        await pool.query(migration.query);
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        console.log(`  ✅ Migración ${migration.name} completada`);
      }
    }
    
    console.log('✅ Migraciones completadas');
    
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    throw error;
  }
}

// Función para verificar el estado de la base de datos
async function checkDatabaseHealth() {
  try {
    // Verificar conexión
    await pool.query('SELECT 1');
    
    // Verificar tablas críticas
    const tables = ['users', 'movements', 'clients'];
    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [table]
      );
      
      if (!result.rows[0].exists) {
        return { healthy: false, message: `Tabla ${table} no existe` };
      }
    }
    
    return { healthy: true, message: 'Base de datos operativa' };
    
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}

module.exports = {
  initializeDatabase,
  checkDatabaseHealth,
  runMigrations
};