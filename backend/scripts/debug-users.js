const pool = require('../config/database');

async function debugUsers() {
  console.log('🔍 DEBUG: Verificando sistema de usuarios...\n');
  
  try {
    // 1. Verificar conexión
    console.log('1. Probando conexión a la base de datos...');
    const testQuery = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', testQuery.rows[0].now);
    
    // 2. Verificar tabla users
    console.log('\n2. Verificando tabla users...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log('Tabla users existe:', tableCheck.rows[0].exists);
    
    // 3. Mostrar estructura de la tabla
    console.log('\n3. Estructura de la tabla users:');
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.table(columns.rows);
    
    // 4. Intentar insertar un usuario de prueba
    console.log('\n4. Intentando crear usuario de prueba...');
    const bcrypt = require('bcryptjs');
    const testPassword = await bcrypt.hash('test123', 10);
    
    try {
      const testUser = await pool.query(`
        INSERT INTO users (name, email, password, role, permissions, active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        'Usuario Test',
        `test${Date.now()}@test.com`,
        testPassword,
        'operator',
        ['operaciones', 'movimientos'],
        true
      ]);
      
      console.log('✅ Usuario de prueba creado exitosamente:');
      console.log(testUser.rows[0]);
      
      // Eliminar usuario de prueba
      await pool.query('DELETE FROM users WHERE id = $1', [testUser.rows[0].id]);
      console.log('✅ Usuario de prueba eliminado');
      
    } catch (insertError) {
      console.log('❌ Error al crear usuario de prueba:');
      console.log('Código:', insertError.code);
      console.log('Mensaje:', insertError.message);
      console.log('Detalle:', insertError.detail);
    }
    
    // 5. Mostrar usuarios existentes
    console.log('\n5. Usuarios existentes:');
    const users = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        role,
        array_length(permissions, 1) as permission_count,
        active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    if (users.rows.length > 0) {
      console.table(users.rows);
    } else {
      console.log('❌ No hay usuarios en el sistema');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n✅ Conexión cerrada');
  }
}

// Ejecutar
debugUsers();