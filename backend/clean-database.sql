-- SCRIPT DE LIMPIEZA TOTAL DE BASE DE DATOS
-- Ejecutar en PostgreSQL para resolver todos los problemas

-- 1. Eliminar TODAS las tablas de backup y duplicadas
DROP TABLE IF EXISTS movements_backup_old CASCADE;
DROP TABLE IF EXISTS clients_backup_old CASCADE;
DROP TABLE IF EXISTS users_backup_old CASCADE;
DROP TABLE IF EXISTS movements_backup_broken CASCADE;
DROP TABLE IF EXISTS clients_backup_broken CASCADE;
DROP TABLE IF EXISTS users_backup_broken CASCADE;
DROP TABLE IF EXISTS "Movements" CASCADE;
DROP TABLE IF EXISTS "Clients" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- 2. Verificar si movements tiene la columna fecha
DO $$ 
BEGIN
    -- Si movements existe pero no tiene fecha, eliminarla
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movements') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'fecha') THEN
        DROP TABLE movements CASCADE;
    END IF;
END $$;

-- 3. Crear tabla movements con estructura correcta
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

-- 4. Crear tabla clients con estructura correcta
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

-- 5. Crear tabla users con estructura correcta
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

-- 6. Crear índices (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha);
CREATE INDEX IF NOT EXISTS idx_movements_cliente ON movements(cliente);
CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);

-- 7. Insertar usuario admin si no existe
INSERT INTO users (name, username, email, password, role, permissions)
SELECT 
  'Administrador',
  'admin',
  'admin@sistema.com',
  '$2a$10$xKzPPEYLKRRtLBNVPfBUH.GhVGKgQ3kJoWKQWxRLnYq0TcPHqKqNy', -- admin123
  'admin',
  ARRAY['operaciones', 'clientes', 'movimientos', 'pendientes', 'gastos', 'cuentas-corrientes',
        'prestamistas', 'comisiones', 'utilidad', 'arbitraje', 'saldos', 'caja',
        'rentabilidad', 'stock', 'saldos-iniciales', 'usuarios']
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- 8. Verificar resultado
SELECT 'LIMPIEZA COMPLETADA' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'USUARIO ADMIN:' as info;
SELECT id, username, email, role FROM users WHERE username = 'admin';