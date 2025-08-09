const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('Ejecutando migración de permisos...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/add_permissions_to_users.sql'),
      'utf8'
    );
    
    await pool.query(migrationSQL);
    
    console.log('Migración completada exitosamente');
    
    // Verificar el resultado
    const result = await pool.query(
      'SELECT id, name, role, permissions, active FROM users'
    );
    
    console.log('\nUsuarios actualizados:');
    result.rows.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user.permissions.length} permisos`);
    });
    
  } catch (error) {
    console.error('Error ejecutando migración:', error);
  } finally {
    await pool.end();
  }
}

runMigration();