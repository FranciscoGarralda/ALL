// Script simple para agregar username
const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');
    
    // Agregar columna
    try {
      await client.query('ALTER TABLE users ADD COLUMN username VARCHAR(255)');
      console.log('✅ Columna username agregada');
    } catch (e) {
      console.log('⚠️ Columna ya existe');
    }
    
    // Actualizar admin
    await client.query(`
      UPDATE users 
      SET username = 'admin' 
      WHERE email = 'admin@sistema.com'
    `);
    console.log('✅ Usuario admin actualizado');
    
    // Ver resultado
    const res = await client.query('SELECT username, email FROM users WHERE role = $1', ['admin']);
    console.log('Usuarios admin:', res.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fix();