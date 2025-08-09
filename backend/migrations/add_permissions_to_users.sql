-- Agregar columna permissions a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';

-- Agregar columna active si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Actualizar usuarios existentes para dar permisos completos a los admins
UPDATE users 
SET permissions = ARRAY[
  'operaciones',
  'clientes', 
  'movimientos',
  'pendientes',
  'gastos',
  'cuentas-corrientes',
  'prestamistas',
  'comisiones',
  'utilidad',
  'arbitraje',
  'saldos',
  'caja',
  'rentabilidad',
  'stock',
  'saldos-iniciales'
]
WHERE role = 'admin';

-- Dar permisos básicos a usuarios existentes que no son admin
UPDATE users 
SET permissions = ARRAY[
  'operaciones',
  'movimientos',
  'saldos'
]
WHERE role != 'admin' AND permissions = '{}';