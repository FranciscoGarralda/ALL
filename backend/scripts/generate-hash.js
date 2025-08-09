const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL para crear usuario admin:');
  console.log(`
INSERT INTO users (name, email, password, role, permissions, active)
VALUES (
  'Administrador',
  'admin@sistema.com',
  '${hash}',
  'admin',
  ARRAY[
    'operaciones', 'clientes', 'movimientos', 'pendientes',
    'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
    'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
    'stock', 'saldos-iniciales', 'usuarios'
  ],
  true
) ON CONFLICT (email) DO NOTHING;
  `);
}

generateHash();