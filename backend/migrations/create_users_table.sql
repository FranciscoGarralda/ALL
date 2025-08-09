-- Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insertar usuario admin por defecto (password: admin123)
-- El hash es para 'admin123' con bcrypt
INSERT INTO users (name, email, password, role, permissions, active)
VALUES (
  'Administrador',
  'admin@sistema.com',
  '$2a$10$YourHashHere', -- Este hash debe ser generado con bcrypt
  'admin',
  ARRAY[
    'operaciones', 'clientes', 'movimientos', 'pendientes',
    'gastos', 'cuentas-corrientes', 'prestamistas', 'comisiones',
    'utilidad', 'arbitraje', 'saldos', 'caja', 'rentabilidad',
    'stock', 'saldos-iniciales', 'usuarios'
  ],
  true
) ON CONFLICT (email) DO NOTHING;