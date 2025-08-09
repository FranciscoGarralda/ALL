-- Script de inicialización de base de datos
-- Ejecutar esto en PostgreSQL para crear todas las tablas

-- Tabla de usuarios
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

-- Tabla de clientes
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

-- Tabla de movimientos
CREATE TABLE IF NOT EXISTS movements (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(255),
  fecha DATE NOT NULL,
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

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha);
CREATE INDEX IF NOT EXISTS idx_movements_cliente ON movements(cliente);
CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);

-- Insertar usuario admin por defecto (contraseña: admin123)
INSERT INTO users (name, username, email, password, role, permissions)
VALUES (
  'Administrador',
  'admin',
  'admin@sistema.com',
  '$2a$10$YourHashedPasswordHere', -- Reemplazar con el hash real
  'admin',
  ARRAY['operaciones', 'clientes', 'movimientos', 'pendientes', 'gastos', 'cuentas-corrientes', 
        'prestamistas', 'comisiones', 'utilidad', 'arbitraje', 'saldos', 'caja', 
        'rentabilidad', 'stock', 'saldos-iniciales', 'usuarios']
)
ON CONFLICT (username) DO NOTHING;