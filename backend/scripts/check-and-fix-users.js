const pool = require('../config/database');

async function checkAndFixUsers() {
  console.log('🔍 Verificando sistema de usuarios...\n');
  
  try {
    // 1. Verificar si existe la tabla users
    console.log('1. Verificando tabla users...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla users no existe. Creándola...');
      await createUsersTable();
    } else {
      console.log('✅ Tabla users existe');
    }
    
    // 2. Verificar columnas necesarias
    console.log('\n2. Verificando columnas...');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    
    const existingColumns = columns.rows.map(col => col.column_name);
    console.log('Columnas existentes:', existingColumns);
    
    // Agregar columna permissions si no existe
    if (!existingColumns.includes('permissions')) {
      console.log('❌ Falta columna permissions. Agregándola...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN permissions TEXT[] DEFAULT '{}';
      `);
      console.log('✅ Columna permissions agregada');
    }
    
    // Agregar columna active si no existe
    if (!existingColumns.includes('active')) {
      console.log('❌ Falta columna active. Agregándola...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN active BOOLEAN DEFAULT true;
      `);
      console.log('✅ Columna active agregada');
    }
    
    // 3. Verificar si hay usuarios admin
    console.log('\n3. Verificando usuarios admin...');
    const adminCheck = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin'"
    );
    
    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log('❌ No hay usuarios admin. Creando admin por defecto...');
      await createDefaultAdmin();
    } else {
      console.log(`✅ Hay ${adminCheck.rows[0].count} usuario(s) admin`);
    }
    
    // 4. Actualizar permisos de usuarios existentes
    console.log('\n4. Actualizando permisos...');
    
    // Dar todos los permisos a admins
    await pool.query(`
      UPDATE users 
      SET permissions = ARRAY[
        'operaciones', 'clientes', 'movimientos', 'pendientes',
        'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
        'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
        'stock', 'saldos-iniciales'
      ]
      WHERE role = 'admin' AND (permissions IS NULL OR permissions = '{}');
    `);
    
    // Dar permisos básicos a otros usuarios
    await pool.query(`
      UPDATE users 
      SET permissions = ARRAY['operaciones', 'movimientos', 'saldos']
      WHERE role != 'admin' AND (permissions IS NULL OR permissions = '{}');
    `);
    
    console.log('✅ Permisos actualizados');
    
    // 5. Mostrar estado final
    console.log('\n5. Estado final del sistema:');
    const allUsers = await pool.query(`
      SELECT id, name, email, role, 
             array_length(permissions, 1) as permission_count, 
             active 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('\nUsuarios en el sistema:');
    console.table(allUsers.rows);
    
    console.log('\n✅ Sistema de usuarios verificado y actualizado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

async function createUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'operator',
      permissions TEXT[] DEFAULT '{}',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function createDefaultAdmin() {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await pool.query(`
    INSERT INTO users (name, email, password, role, permissions, active)
    VALUES (
      'Administrador',
      'admin@sistema.com',
      $1,
      'admin',
      ARRAY[
        'operaciones', 'clientes', 'movimientos', 'pendientes',
        'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
        'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
        'stock', 'saldos-iniciales'
      ],
      true
    )
  `, [hashedPassword]);
  
  console.log('👤 Usuario admin creado:');
  console.log('   Email: admin@sistema.com');
  console.log('   Password: admin123');
}

// Ejecutar
checkAndFixUsers();