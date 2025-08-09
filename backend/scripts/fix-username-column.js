const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function fixUsernameColumn() {
  console.log('🔧 Arreglando columna username...\n');
  
  try {
    // 1. Verificar si la columna username existe
    console.log('1. Verificando si existe columna username...');
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'username'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ La columna username NO existe. Agregándola...');
      
      // 2. Agregar columna username
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN username VARCHAR(255)
      `);
      console.log('✅ Columna username agregada');
      
      // 3. Actualizar usuarios existentes
      console.log('\n2. Actualizando usuarios existentes...');
      
      // Para el admin, usar 'admin' como username
      await pool.query(`
        UPDATE users 
        SET username = 'admin' 
        WHERE email = 'admin@sistema.com'
      `);
      
      // Para otros usuarios, usar la parte antes del @ del email
      await pool.query(`
        UPDATE users 
        SET username = SPLIT_PART(email, '@', 1) 
        WHERE username IS NULL
      `);
      console.log('✅ Usuarios actualizados');
      
      // 4. Hacer username NOT NULL y UNIQUE
      console.log('\n3. Aplicando restricciones...');
      await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN username SET NOT NULL
      `);
      
      await pool.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_username_unique UNIQUE (username)
      `);
      console.log('✅ Restricciones aplicadas');
      
    } else {
      console.log('✅ La columna username ya existe');
    }
    
    // 5. Verificar el resultado
    console.log('\n4. Verificando usuarios...');
    const users = await pool.query(`
      SELECT id, name, username, email, role 
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\nUsuarios en el sistema:');
    console.table(users.rows);
    
    console.log('\n✅ ¡LISTO! Ahora puedes entrar con:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Ejecutar
fixUsernameColumn();