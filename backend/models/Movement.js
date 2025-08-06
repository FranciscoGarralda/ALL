const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Basic information
  cliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  nombreDia: {
    type: DataTypes.STRING
  },
  detalle: {
    type: DataTypes.TEXT
  },
  
  // Operation details
  operacion: {
    type: DataTypes.ENUM('TRANSACCIONES', 'CUENTAS_CORRIENTES', 'SOCIOS', 'ADMINISTRATIVAS', 'PRESTAMISTAS', 'INTERNAS'),
    allowNull: false
  },
  subOperacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Financial data
  monto: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  moneda: {
    type: DataTypes.ENUM('PESO', 'USD', 'EURO', 'USDT', 'REAL', 'LIBRA', 'CLP'),
    allowNull: false
  },
  cuenta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  
  // Status
  estado: {
    type: DataTypes.ENUM('pendiente_retiro', 'pendiente_entrega', 'realizado'),
    defaultValue: 'pendiente_retiro'
  },
  por: {
    type: DataTypes.STRING
  },
  
  // Exchange rates
  tc: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 0
  },
  monedaTC: {
    type: DataTypes.STRING
  },
  
  // Wallet fields
  walletCompra: {
    type: DataTypes.STRING
  },
  walletTC: {
    type: DataTypes.STRING
  },
  
  // Commission
  comision: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  tipoComision: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage'
  },
  monedaComision: {
    type: DataTypes.STRING
  },
  cuentaComision: {
    type: DataTypes.STRING
  },
  
  // Interest (for loans)
  interes: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  lapso: {
    type: DataTypes.STRING
  },
  fechaLimite: {
    type: DataTypes.DATE
  },
  
  // Additional fields
  proveedorCC: {
    type: DataTypes.STRING
  },
  nombreOtro: {
    type: DataTypes.STRING
  },
  socioSeleccionado: {
    type: DataTypes.STRING
  },
  
  // Arbitrage specific
  monedaTCCmpra: {
    type: DataTypes.STRING
  },
  monedaTCVenta: {
    type: DataTypes.STRING
  },
  monedaVenta: {
    type: DataTypes.STRING
  },
  tcVenta: {
    type: DataTypes.DECIMAL(10, 4)
  },
  montoVenta: {
    type: DataTypes.DECIMAL(15, 2)
  },
  totalCompra: {
    type: DataTypes.DECIMAL(15, 2)
  },
  totalVenta: {
    type: DataTypes.DECIMAL(15, 2)
  },
  walletCompraCmpra: {
    type: DataTypes.STRING
  },
  walletTCCmpra: {
    type: DataTypes.STRING
  },
  walletCompraVenta: {
    type: DataTypes.STRING
  },
  walletTCVenta: {
    type: DataTypes.STRING
  },
  
  // Internal movements
  cuentaSalida: {
    type: DataTypes.STRING
  },
  cuentaIngreso: {
    type: DataTypes.STRING
  },
  cuentaDestino: {
    type: DataTypes.STRING
  },
  
  // Payment methods
  metodoPago: {
    type: DataTypes.STRING
  },
  cuentaPago: {
    type: DataTypes.STRING
  },
  
  // Mixed payment
  pagoMixto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  montoEfectivo: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  montoDigital: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  cuentaEfectivo: {
    type: DataTypes.STRING
  },
  cuentaDigital: {
    type: DataTypes.STRING
  },
  
  // User reference
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Movement;