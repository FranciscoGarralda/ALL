-- SCRIPT PARA ARREGLAR LA BASE DE DATOS EN RAILWAY
-- Ejecutar este script en la consola de PostgreSQL de Railway

-- 1. Limpiar tablas viejas si existen
DROP TABLE IF EXISTS movements_backup_old CASCADE;
DROP TABLE IF EXISTS movements_backup CASCADE;

-- 2. Eliminar y recrear la tabla movements con TODAS las columnas necesarias
DROP TABLE IF EXISTS movements CASCADE;

CREATE TABLE movements (
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
  monedaTCCompra VARCHAR(20),
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

-- 3. Crear índices para movements
CREATE INDEX idx_movements_fecha ON movements(fecha);
CREATE INDEX idx_movements_cliente ON movements(cliente);
CREATE INDEX idx_movements_operacion ON movements(operacion);
CREATE INDEX idx_movements_estado ON movements(estado);

-- 4. Recrear tabla users con constraints correctos
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
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

-- 5. Crear índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);

-- 6. Recrear tabla clients
DROP TABLE IF EXISTS clients CASCADE;

CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(100),
  email VARCHAR(255),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crear índices para clients
CREATE INDEX idx_clients_nombre ON clients(nombre);
CREATE INDEX idx_clients_email ON clients(email);

-- 8. Insertar usuario admin por defecto
-- Password: admin123 (hasheado con bcrypt)
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

-- 9. Verificar que todo está correcto
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'clients' as tabla, COUNT(*) as registros FROM clients
UNION ALL
SELECT 'movements' as tabla, COUNT(*) as registros FROM movements;

-- 10. Mostrar el usuario admin creado
SELECT username, email, role FROM users WHERE username = 'admin';