#!/usr/bin/env node

/**
 * Script seguro para generar hashes de contraseñas
 * USO: node generate-secure-password.js <contraseña>
 * 
 * NUNCA hardcodees contraseñas en este archivo
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('❌ Error: Debes proporcionar una contraseña como argumento');
    console.error('Uso: node generate-secure-password.js <contraseña>');
    process.exit(1);
  }
  
  if (password.length < 8) {
    console.error('❌ Error: La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
  }
  
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('\n✅ Hash generado exitosamente:');
    console.log(hash);
    console.log('\n⚠️  IMPORTANTE: Nunca compartas este hash públicamente');
  } catch (error) {
    console.error('❌ Error generando hash:', error.message);
    process.exit(1);
  }
}

generateHash();