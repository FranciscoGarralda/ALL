const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function createUsersTable() {
  console.log('🔨 Creando tabla users...\n');
  
  try {
    // 1. Eliminar tabla si existe (CUIDADO: esto borrará todos los datos)
    console.log('1. Verificando si existe tabla anterior...');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ Tabla anterior eliminada (si existía)');
    
    // 2. Crear tabla users
    console.log('\n2. Creando nueva tabla users...');
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
        permissions TEXT[] DEFAULT '{}',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla users creada exitosamente');
    
    // 3. Crear índices
    console.log('\n3. Creando índices...');
    await pool.query('CREATE INDEX idx_users_email ON users(email)');
    await pool.query('CREATE INDEX idx_users_role ON users(role)');
    console.log('✅ Índices creados');
    
    // 4. Crear usuario administrador por defecto
    console.log('\n4. Creando usuario administrador por defecto...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await pool.query(`
      INSERT INTO users (name, email, password, role, permissions, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, role
    `, [
      'Administrador',
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
    
    console.log('✅ Usuario administrador creado:');
    console.log('   Email: admin@sistema.com');
    console.log('   Password: admin123');
    console.log('   ID:', adminUser.rows[0].id);
    
    // 5. Verificar que todo está correcto
    console.log('\n5. Verificando instalación...');
    const verification = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✅ Tabla users tiene ${verification.rows[0].count} usuario(s)`);
    
    // 6. Mostrar estructura final
    console.log('\n6. Estructura de la tabla:');
    const structure = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.table(structure.rows);
    
    console.log('\n✅ ¡TABLA USERS CREADA EXITOSAMENTE!');
    console.log('\n📝 Puedes iniciar sesión con:');
    console.log('   Email: admin@sistema.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Detalle:', error);
  } finally {
    await pool.end();
    console.log('\n✅ Conexión cerrada');
  }
}

// Ejecutar
createUsersTable();