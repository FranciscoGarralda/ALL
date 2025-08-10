-- ESQUEMA COMPLETO DE POSTGRESQL PARA EL SISTEMA
-- Este archivo documenta la estructura exacta esperada en la base de datos

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  permissions TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(100),
  email VARCHAR(255),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- 3. TABLA DE MOVIMIENTOS
CREATE TABLE IF NOT EXISTS movements (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(255),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  nombreDia VARCHAR(20),
  detalle TEXT,
  operacion VARCHAR(100),
  subOperacion VARCHAR(100),
  proveedorCC VARCHAR(255),
  monto DECIMAL(15,2),
  moneda VARCHAR(20),
  cuenta VARCHAR(100),
  total DECIMAL(15,2),
  estado VARCHAR(50),
  por VARCHAR(100),
  nombreOtro VARCHAR(255),
  tc DECIMAL(15,4),
  monedaTC VARCHAR(20),
  monedaTCCmpra VARCHAR(20),
  monedaTCVenta VARCHAR(20),
  monedaVenta VARCHAR(20),
  tcVenta DECIMAL(15,4),
  comision DECIMAL(15,2),
  comisionPorcentaje DECIMAL(5,2),
  montoComision DECIMAL(15,2),
  montoReal DECIMAL(15,2),
  monedaComision VARCHAR(20),
  cuentaComision VARCHAR(100),
  interes DECIMAL(5,2),
  lapso VARCHAR(50),
  fechaLimite DATE,
  socioSeleccionado VARCHAR(100),
  totalCompra DECIMAL(15,2),
  totalVenta DECIMAL(15,2),
  montoVenta DECIMAL(15,2),
  cuentaSalida VARCHAR(100),
  cuentaIngreso VARCHAR(100),
  profit DECIMAL(15,2),
  monedaProfit VARCHAR(20),
  walletTC VARCHAR(50),
  mixedPayments JSONB,
  expectedTotalForMixedPayments DECIMAL(15,2),
  utilidadCalculada DECIMAL(15,2),
  utilidadPorcentaje DECIMAL(5,2),
  costoPromedio DECIMAL(15,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para movements
CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha);
CREATE INDEX IF NOT EXISTS idx_movements_cliente ON movements(cliente);
CREATE INDEX IF NOT EXISTS idx_movements_operacion ON movements(operacion);
CREATE INDEX IF NOT EXISTS idx_movements_estado ON movements(estado);

-- 4. USUARIO ADMIN POR DEFECTO
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO users (name, username, email, password, role, permissions)
VALUES (
  'Administrador',
  'admin',
  'admin@sistema.com',
  '$2a$10$xKzPPEYLKRRtLBNVPfBUH.GhVGKgQ3kJoWKQWxRLnYq0TcPHqKqNy',
  'admin',
  ARRAY['operaciones', 'clientes', 'movimientos', 'pendientes', 'gastos', 
        'cuentas-corrientes', 'prestamistas', 'comisiones', 'utilidad', 
        'arbitraje', 'saldos', 'caja', 'rentabilidad', 'stock', 
        'saldos-iniciales', 'usuarios']
)
ON CONFLICT (username) DO NOTHING;

-- 5. VERIFICACIÓN DE INTEGRIDAD
-- Query para verificar que todo está correcto
SELECT 
  'users' as tabla,
  COUNT(*) as registros,
  EXISTS(SELECT 1 FROM users WHERE username = 'admin') as admin_existe
FROM users
UNION ALL
SELECT 
  'clients' as tabla,
  COUNT(*) as registros,
  false as admin_existe
FROM clients
UNION ALL
SELECT 
  'movements' as tabla,
  COUNT(*) as registros,
  false as admin_existe
FROM movements;