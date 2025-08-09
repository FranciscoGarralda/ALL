-- Primero hacer backup de las tablas existentes
ALTER TABLE IF EXISTS movements RENAME TO movements_old;
ALTER TABLE IF EXISTS clients RENAME TO clients_old;

-- Crear las nuevas tablas con la estructura correcta
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

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(100),
  email VARCHAR(255),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_movements_fecha ON movements(fecha);
CREATE INDEX IF NOT EXISTS idx_movements_cliente ON movements(cliente);
CREATE INDEX IF NOT EXISTS idx_movements_operacion ON movements(operacion);
CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);

-- Migrar datos si existen tablas antiguas
-- movements_old -> movements
INSERT INTO movements (fecha, detalle, monto, moneda, created_at, updated_at)
SELECT date, concept, amount, currency, created_at, updated_at
FROM movements_old
WHERE EXISTS (SELECT 1 FROM movements_old LIMIT 1);

-- clients_old -> clients
INSERT INTO clients (nombre, telefono, notas, created_at, updated_at)
SELECT name, contact, notes, created_at, updated_at
FROM clients_old
WHERE EXISTS (SELECT 1 FROM clients_old LIMIT 1);

-- Eliminar tablas antiguas si la migración fue exitosa
DROP TABLE IF EXISTS movements_old CASCADE;
DROP TABLE IF EXISTS clients_old CASCADE;