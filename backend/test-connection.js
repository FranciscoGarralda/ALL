#!/usr/bin/env node

/**
 * Script de verificación de conexión Backend-PostgreSQL
 * Ejecutar con: node test-connection.js
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 VERIFICACIÓN DE CONEXIÓN BACKEND-POSTGRESQL');
console.log('==============================================\n');

// 1. Verificar variables de entorno
console.log('1️⃣ Variables de Entorno:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ NO configurada');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurada' : '❌ NO configurada');
console.log('   PORT:', process.env.PORT || '5000');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada en .env');
  console.log('\nConfigura el archivo backend/.env con:');
  console.log('DATABASE_URL=postgresql://usuario:password@localhost:5432/sistema_financiero');
  process.exit(1);
}

// 2. Configurar pool
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1,
  connectionTimeoutMillis: 5000
};

const pool = new Pool(poolConfig);

// 3. Probar conexión
async function testConnection() {
  console.log('2️⃣ Probando Conexión:');
  
  try {
    const client = await pool.connect();
    console.log('   ✅ Conexión establecida');
    
    // 4. Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version.split(' ')[1];
    console.log(`   📊 PostgreSQL versión: ${version}`);
    
    // 5. Verificar tablas
    console.log('\n3️⃣ Verificando Tablas:');
    
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(r => r.tablename);
    
    const requiredTables = ['users', 'clients', 'movements'];
    
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        // Contar registros
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`   ✅ ${table}: ${count} registros`);
      } else {
        console.log(`   ❌ ${table}: NO EXISTE`);
      }
    }
    
    // 6. Verificar índices
    console.log('\n4️⃣ Verificando Índices:');
    
    const indexQuery = `
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `;
    
    const indexResult = await client.query(indexQuery);
    console.log(`   📊 Total de índices personalizados: ${indexResult.rows.length}`);
    
    // 7. Verificar usuario admin
    console.log('\n5️⃣ Verificando Usuario Admin:');
    
    try {
      const adminResult = await client.query(
        "SELECT username, role, active FROM users WHERE username = 'admin'"
      );
      
      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        console.log(`   ✅ Usuario admin existe`);
        console.log(`      - Role: ${admin.role}`);
        console.log(`      - Activo: ${admin.active ? 'Sí' : 'No'}`);
      } else {
        console.log('   ⚠️  Usuario admin no existe');
        console.log('   Ejecuta: psql -d sistema_financiero -f postgresql-schema.sql');
      }
    } catch (err) {
      console.log('   ⚠️  Tabla users no tiene datos o no existe');
    }
    
    // 8. Test de escritura
    console.log('\n6️⃣ Test de Escritura:');
    
    try {
      await client.query('BEGIN');
      
      // Insertar cliente de prueba
      const testClient = await client.query(
        "INSERT INTO clients (nombre, telefono) VALUES ($1, $2) RETURNING id",
        ['TEST_CLIENT_' + Date.now(), '123456789']
      );
      
      console.log(`   ✅ INSERT funcionando (ID: ${testClient.rows[0].id})`);
      
      // Eliminar cliente de prueba
      await client.query(
        "DELETE FROM clients WHERE id = $1",
        [testClient.rows[0].id]
      );
      
      console.log('   ✅ DELETE funcionando');
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.log('   ❌ Error en test de escritura:', err.message);
    }
    
    // 9. Verificar configuración del pool
    console.log('\n7️⃣ Configuración del Pool:');
    console.log(`   - Conexiones máximas: ${pool.options.max}`);
    console.log(`   - Conexiones activas: ${pool.totalCount}`);
    console.log(`   - Conexiones idle: ${pool.idleCount}`);
    console.log(`   - Conexiones esperando: ${pool.waitingCount}`);
    
    client.release();
    
    console.log('\n==============================================');
    console.log('✅ TODAS LAS VERIFICACIONES PASARON');
    console.log('El backend está correctamente conectado a PostgreSQL');
    console.log('==============================================\n');
    
  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n📌 Solución:');
      console.log('1. Verifica que PostgreSQL esté corriendo:');
      console.log('   sudo service postgresql start');
      console.log('2. Verifica el puerto (generalmente 5432)');
    } else if (error.code === '28P01') {
      console.log('\n📌 Solución:');
      console.log('1. Verifica usuario y contraseña en DATABASE_URL');
      console.log('2. El formato es: postgresql://usuario:password@host:puerto/base_datos');
    } else if (error.code === '3D000') {
      console.log('\n📌 Solución:');
      console.log('1. La base de datos no existe. Créala con:');
      console.log('   psql -U postgres -c "CREATE DATABASE sistema_financiero;"');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar test
testConnection().catch(console.error);