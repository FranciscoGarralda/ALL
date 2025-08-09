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
      cliente VARCHAR(255),
      fecha DATE NOT NULL,
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
      socioSeleccionado VARCHAR(100),
      totalCompra DECIMAL(15,2),
      totalVenta DECIMAL(15,2),
      montoVenta DECIMAL(15,2),
      cuentaSalida VARCHAR(100),
      cuentaIngreso VARCHAR(100),
      profit DECIMAL(15,2),
      monedaProfit VARCHAR(20),
      walletTC VARCHAR(50),
      mixedPayments JSONB,
      expectedTotalForMixedPayments DECIMAL(15,2),
      utilidadCalculada DECIMAL(15,2),
      utilidadPorcentaje DECIMAL(5,2),
      costoPromedio DECIMAL(15,4),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL UNIQUE,
      telefono VARCHAR(100),
      email VARCHAR(255),
      direccion TEXT,
      notas TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
};

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
  'CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha)',
  'CREATE INDEX IF NOT EXISTS idx_movements_cliente ON movements(cliente)',
  'CREATE INDEX IF NOT EXISTS idx_movements_operacion ON movements(operacion)',
  'CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre)'
];

async function initializeDatabase() {
  console.log('🚀 Inicializando base de datos...');
  
  try {
    // 1. Crear todas las tablas
    for (const [tableName, schema] of Object.entries(TABLES_SCHEMA)) {
      try {
        console.log(`📋 Verificando tabla ${tableName}...`);
        await pool.query(schema);
        console.log(`✅ Tabla ${tableName} lista`);
      } catch (tableError) {
        console.log(`⚠️ Error con tabla ${tableName}:`, tableError.message);
      }
    }
    
    // 2. Crear índices
    console.log('\n📑 Creando índices...');
    for (const index of INDEXES) {
      try {
        await pool.query(index);
      } catch (indexError) {
        // Ignorar errores de índices duplicados
      }
    }
    console.log('✅ Índices procesados');
    
    // 3. Crear usuario admin si no existe
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (name, username, email, password, role, permissions, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (username) DO NOTHING
      `, [
        'Administrador',
        'admin',
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
      
      console.log('✅ Usuario admin verificado');
    } catch (userError) {
      console.log('⚠️ Error con usuario admin:', userError.message);
    }
    
    console.log('\n✅ Base de datos lista');
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    return false;
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
      },
      {
        name: 'update_movements_clients_structure',
        query: `
          DO $$
          BEGIN
            -- Solo hacer la migración si las tablas tienen la estructura antigua
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'movements' AND column_name = 'date') THEN
              
              -- Hacer backup
              ALTER TABLE movements RENAME TO movements_old;
              ALTER TABLE IF EXISTS clients RENAME TO clients_old;
              
              -- Crear nuevas tablas
              CREATE TABLE movements (
                id SERIAL PRIMARY KEY,
                cliente VARCHAR(255),
                fecha DATE NOT NULL,
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
                socioSeleccionado VARCHAR(100),
                totalCompra DECIMAL(15,2),
                totalVenta DECIMAL(15,2),
                montoVenta DECIMAL(15,2),
                cuentaSalida VARCHAR(100),
                cuentaIngreso VARCHAR(100),
                profit DECIMAL(15,2),
                monedaProfit VARCHAR(20),
                walletTC VARCHAR(50),
                mixedPayments JSONB,
                expectedTotalForMixedPayments DECIMAL(15,2),
                utilidadCalculada DECIMAL(15,2),
                utilidadPorcentaje DECIMAL(5,2),
                costoPromedio DECIMAL(15,4),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );
              
              CREATE TABLE clients (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                telefono VARCHAR(100),
                email VARCHAR(255),
                direccion TEXT,
                notas TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );
              
              -- Migrar datos si existen
              INSERT INTO movements (fecha, detalle, monto, moneda, created_at, updated_at)
              SELECT date, concept, amount, currency, created_at, updated_at
              FROM movements_old
              WHERE EXISTS (SELECT 1 FROM movements_old LIMIT 1);
              
              INSERT INTO clients (nombre, telefono, notas, created_at, updated_at)
              SELECT name, contact, notes, created_at, updated_at
              FROM clients_old
              WHERE EXISTS (SELECT 1 FROM clients_old LIMIT 1);
              
              -- Eliminar tablas antiguas
              DROP TABLE IF EXISTS movements_old CASCADE;
              DROP TABLE IF EXISTS clients_old CASCADE;
            END IF;
          END $$;
        `
      },
      {
        name: 'fix_clients_table_columns',
        query: `
          DO $$
          BEGIN
            -- Verificar si la columna 'nombre' existe
            IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'clients' 
              AND column_name = 'nombre'
            ) THEN
              -- Agregar columna nombre si no existe
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);
              
              -- Agregar otras columnas si no existen
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS telefono VARCHAR(100);
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS direccion TEXT;
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS notas TEXT;
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
              ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
              
              -- Si la tabla tenía 'name' en lugar de 'nombre'
              IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'clients' 
                AND column_name = 'name'
              ) THEN
                UPDATE clients SET nombre = name WHERE nombre IS NULL;
              END IF;
              
              -- Si tenía 'phone' en lugar de 'telefono'
              IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'clients' 
                AND column_name = 'phone'
              ) THEN
                UPDATE clients SET telefono = phone WHERE telefono IS NULL;
              END IF;
              
              -- Si tenía 'address' en lugar de 'direccion'
              IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'clients' 
                AND column_name = 'address'
              ) THEN
                UPDATE clients SET direccion = address WHERE direccion IS NULL;
              END IF;
              
              -- Si tenía 'notes' en lugar de 'notas'
              IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'clients' 
                AND column_name = 'notes'
              ) THEN
                UPDATE clients SET notas = notes WHERE notas IS NULL;
              END IF;
              
              -- Hacer nombre NOT NULL si tiene datos
              UPDATE clients SET nombre = COALESCE(nombre, 'Cliente ' || id) WHERE nombre IS NULL;
              ALTER TABLE clients ALTER COLUMN nombre SET NOT NULL;
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