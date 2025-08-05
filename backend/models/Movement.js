const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic information
  cliente: {
    type: String,
    required: [true, 'Cliente es requerido'],
    trim: true
  },
  fecha: {
    type: Date,
    required: [true, 'Fecha es requerida']
  },
  nombreDia: {
    type: String,
    trim: true
  },
  detalle: {
    type: String,
    trim: true,
    maxlength: [500, 'El detalle no puede tener más de 500 caracteres']
  },
  
  // Operation details
  operacion: {
    type: String,
    required: [true, 'Operación es requerida'],
    enum: ['TRANSACCIONES', 'CUENTAS_CORRIENTES', 'SOCIOS', 'ADMINISTRATIVAS', 'PRESTAMISTAS', 'INTERNAS']
  },
  subOperacion: {
    type: String,
    required: [true, 'Sub-operación es requerida']
  },
  
  // Financial data
  monto: {
    type: Number,
    required: [true, 'Monto es requerido'],
    min: [0, 'El monto debe ser mayor a 0']
  },
  moneda: {
    type: String,
    required: [true, 'Moneda es requerida'],
    enum: ['PESO', 'USD', 'EURO', 'USDT', 'REAL', 'LIBRA', 'CLP']
  },
  cuenta: {
    type: String,
    required: [true, 'Cuenta es requerida']
  },
  total: {
    type: Number,
    default: 0
  },
  
  // Status
  estado: {
    type: String,
    enum: ['pendiente_retiro', 'pendiente_entrega', 'realizado'],
    default: 'pendiente_retiro'
  },
  por: {
    type: String,
    trim: true
  },
  
  // Exchange rates
  tc: {
    type: Number,
    default: 0
  },
  monedaTC: {
    type: String,
    enum: ['PESO', 'USD', 'EURO', 'USDT', 'REAL', 'LIBRA', 'CLP', '']
  },
  
  // Commission
  comision: {
    type: Number,
    default: 0
  },
  tipoComision: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  monedaComision: {
    type: String,
    enum: ['PESO', 'USD', 'EURO', 'USDT', 'REAL', 'LIBRA', 'CLP', '']
  },
  cuentaComision: {
    type: String
  },
  
  // Interest (for loans)
  interes: {
    type: Number,
    default: 0
  },
  lapso: {
    type: String
  },
  fechaLimite: {
    type: Date
  },
  
  // Additional fields for specific operations
  proveedorCC: {
    type: String
  },
  nombreOtro: {
    type: String
  },
  socioSeleccionado: {
    type: String
  },
  
  // Arbitrage specific
  monedaTCCmpra: {
    type: String
  },
  monedaTCVenta: {
    type: String
  },
  monedaVenta: {
    type: String
  },
  tcVenta: {
    type: Number
  },
  totalCompra: {
    type: Number
  },
  totalVenta: {
    type: Number
  },
  montoVenta: {
    type: Number
  },
  
  // Internal movements
  cuentaSalida: {
    type: String
  },
  cuentaIngreso: {
    type: String
  },
  
  // Wallet selections
  walletCompra: {
    type: String
  },
  walletTC: {
    type: String
  },
  
  // Mixed payments
  mixedPayments: [{
    tipoPago: String,
    monto: Number,
    cuenta: String
  }],
  expectedTotalForMixedPayments: {
    type: Number
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on any update
movementSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for better query performance
movementSchema.index({ user: 1, fecha: -1 });
movementSchema.index({ user: 1, operacion: 1 });
movementSchema.index({ user: 1, estado: 1 });
movementSchema.index({ user: 1, cliente: 1 });

module.exports = mongoose.model('Movement', movementSchema);