const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  operacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subOperacion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'activo'
  },
  por: {
    type: DataTypes.STRING,
    defaultValue: 'Sistema'
  },
  
  // Campos comunes
  cliente: DataTypes.STRING,
  monto: DataTypes.DECIMAL(20, 2),
  moneda: DataTypes.STRING,
  tc: DataTypes.DECIMAL(20, 4),
  monedaTC: DataTypes.STRING,
  total: DataTypes.DECIMAL(20, 2),
  cuenta: DataTypes.STRING,
  comision: DataTypes.DECIMAL(20, 2),
  tipoComision: DataTypes.STRING,
  monedaComision: DataTypes.STRING,
  cuentaComision: DataTypes.STRING,
  observaciones: DataTypes.TEXT,
  
  // Campos para arbitraje
  montoCompra: DataTypes.DECIMAL(20, 2),
  monedaCompra: DataTypes.STRING,
  tcCompra: DataTypes.DECIMAL(20, 4),
  monedaTCCmpra: DataTypes.STRING,
  totalCompra: DataTypes.DECIMAL(20, 2),
  montoVenta: DataTypes.DECIMAL(20, 2),
  monedaVenta: DataTypes.STRING,
  tcVenta: DataTypes.DECIMAL(20, 4),
  monedaTCVenta: DataTypes.STRING,
  totalVenta: DataTypes.DECIMAL(20, 2),
  profit: DataTypes.DECIMAL(20, 2),
  monedaProfit: DataTypes.STRING,
  
  // Cuentas de arbitraje
  walletCompra: DataTypes.STRING,
  walletTC: DataTypes.STRING,
  walletCompraVenta: DataTypes.STRING,
  walletTCVenta: DataTypes.STRING,
  
  // Campos adicionales
  proveedorCC: DataTypes.STRING,
  cuentaDestino: DataTypes.STRING,
  metodoPago: DataTypes.STRING,
  cuentaPago: DataTypes.STRING,
  
  // Campos para pagos mixtos
  pagoMixto: DataTypes.BOOLEAN,
  mixedPayments: DataTypes.JSON,
  montoEfectivo: DataTypes.DECIMAL(20, 2),
  montoDigital: DataTypes.DECIMAL(20, 2),
  cuentaEfectivo: DataTypes.STRING,
  cuentaDigital: DataTypes.STRING,
  
  // Campos de utilidad (stock)
  utilidadCalculada: DataTypes.DECIMAL(20, 2),
  utilidadPorcentaje: DataTypes.DECIMAL(10, 2),
  costoPromedio: DataTypes.DECIMAL(20, 4),
  
  // Campos adicionales
  interes: DataTypes.DECIMAL(10, 2),
  lapso: DataTypes.STRING,
  fechaLimite: DataTypes.DATEONLY,
  socioSeleccionado: DataTypes.STRING,
  
  // Usuario que creó el movimiento
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Movement;