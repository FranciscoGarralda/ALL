const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic information
  nombre: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'Apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
  },
  tipoCliente: {
    type: String,
    required: [true, 'Tipo de cliente es requerido'],
    enum: ['operaciones', 'prestamistas']
  },
  
  // Contact information
  telefono: {
    type: String,
    trim: true,
    maxlength: [20, 'El teléfono no puede tener más de 20 caracteres']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingrese un email válido'
    ]
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: [200, 'La dirección no puede tener más de 200 caracteres']
  },
  
  // Additional information
  notas: {
    type: String,
    trim: true,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres']
  },
  
  // Statistics (calculated fields)
  ultimaOperacion: {
    type: Date
  },
  totalOperaciones: {
    type: Number,
    default: 0
  },
  volumenTotal: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
clientSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Create compound index for unique client per user
clientSchema.index({ user: 1, nombre: 1, apellido: 1 }, { unique: true });

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Ensure virtual fields are serialized
clientSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Client', clientSchema);