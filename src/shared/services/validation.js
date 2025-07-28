/**
 * Advanced validation system for financial operations
 * Provides flexible, extensible validation rules with detailed error reporting
 */

// Validation rule types
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  CUSTOM: 'custom',
  NUMERIC: 'numeric',
  POSITIVE: 'positive',
  CURRENCY: 'currency',
  DATE: 'date',
  EMAIL: 'email',
  PHONE: 'phone',
  CONDITIONAL: 'conditional'
};

// Pre-defined validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[0-9\s\-\(\)]{10,}$/,
  NUMERIC: /^\d*\.?\d+$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s\-_]+$/
};

// Error messages in Spanish
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  MIN_LENGTH: 'Debe tener al menos {min} caracteres',
  MAX_LENGTH: 'No puede tener más de {max} caracteres',
  PATTERN: 'Formato inválido',
  NUMERIC: 'Debe ser un número válido',
  POSITIVE: 'Debe ser un número positivo',
  CURRENCY: 'Debe ser un monto válido (ej: 100.50)',
  DATE: 'Debe ser una fecha válida',
  EMAIL: 'Debe ser un email válido',
  PHONE: 'Debe ser un teléfono válido',
  CONDITIONAL: 'Este campo es requerido bajo las condiciones actuales'
};

/**
 * Validation rule builder class
 */
export class ValidationRule {
  constructor(type, config = {}) {
    this.type = type;
    this.config = config;
    this.message = config.message || VALIDATION_MESSAGES[type];
  }
  
  static required(message) {
    return new ValidationRule(VALIDATION_TYPES.REQUIRED, { message });
  }
  
  static minLength(min, message) {
    return new ValidationRule(VALIDATION_TYPES.MIN_LENGTH, { 
      min, 
      message: message || VALIDATION_MESSAGES.MIN_LENGTH.replace('{min}', min) 
    });
  }
  
  static maxLength(max, message) {
    return new ValidationRule(VALIDATION_TYPES.MAX_LENGTH, { 
      max, 
      message: message || VALIDATION_MESSAGES.MAX_LENGTH.replace('{max}', max) 
    });
  }
  
  static pattern(pattern, message) {
    return new ValidationRule(VALIDATION_TYPES.PATTERN, { pattern, message });
  }
  
  static numeric(message) {
    return new ValidationRule(VALIDATION_TYPES.NUMERIC, { message });
  }
  
  static positive(message) {
    return new ValidationRule(VALIDATION_TYPES.POSITIVE, { message });
  }
  
  static currency(message) {
    return new ValidationRule(VALIDATION_TYPES.CURRENCY, { message });
  }
  
  static date(message) {
    return new ValidationRule(VALIDATION_TYPES.DATE, { message });
  }
  
  static email(message) {
    return new ValidationRule(VALIDATION_TYPES.EMAIL, { message });
  }
  
  static phone(message) {
    return new ValidationRule(VALIDATION_TYPES.PHONE, { message });
  }
  
  static conditional(condition, message) {
    return new ValidationRule(VALIDATION_TYPES.CONDITIONAL, { condition, message });
  }
  
  static custom(validator, message) {
    return new ValidationRule(VALIDATION_TYPES.CUSTOM, { validator, message });
  }
}

/**
 * Field validation schema
 */
export const FIELD_VALIDATION_SCHEMA = {
  // Basic client info
  cliente: [
    ValidationRule.required('Debe seleccionar un cliente')
  ],
  
  fecha: [
    ValidationRule.required('La fecha es requerida'),
    ValidationRule.date('Formato de fecha inválido')
  ],
  
  detalle: [
    ValidationRule.required('El detalle es requerido'),
    ValidationRule.minLength(3, 'El detalle debe tener al menos 3 caracteres'),
    ValidationRule.maxLength(200, 'El detalle no puede exceder 200 caracteres')
  ],
  
  // Operation details
  operacion: [
    ValidationRule.required('Debe seleccionar una operación')
  ],
  
  subOperacion: [
    ValidationRule.conditional(
      (formData) => formData.operacion && formData.operacion !== 'INTERNAS',
      'Debe seleccionar el detalle de la operación'
    )
  ],
  
  // Financial data
  monto: [
    ValidationRule.required('El monto es requerido'),
    ValidationRule.numeric('Debe ser un número válido'),
    ValidationRule.positive('El monto debe ser positivo'),
    ValidationRule.custom(
      (value) => parseFloat(value) > 0,
      'El monto debe ser mayor a 0'
    )
  ],
  
  moneda: [
    ValidationRule.required('Debe seleccionar una moneda')
  ],
  
  tc: [
    ValidationRule.conditional(
      (formData) => ['COMPRA', 'VENTA'].includes(formData.subOperacion),
      'El tipo de cambio es requerido para operaciones de compra/venta'
    ),
    ValidationRule.numeric('Debe ser un número válido'),
    ValidationRule.positive('El tipo de cambio debe ser positivo')
  ],
  
  monedaTC: [
    ValidationRule.conditional(
      (formData) => ['COMPRA', 'VENTA'].includes(formData.subOperacion),
      'Debe seleccionar la moneda del tipo de cambio'
    )
  ],
  
  // Status and assignment
  estado: [
    ValidationRule.required('Debe seleccionar un estado')
  ],
  
  por: [
    ValidationRule.required('Debe seleccionar quién realiza la operación')
  ],
  
  nombreOtro: [
    ValidationRule.conditional(
      (formData) => formData.por === 'otro',
      'Debe especificar el nombre cuando selecciona "Otro"'
    ),
    ValidationRule.minLength(2, 'El nombre debe tener al menos 2 caracteres')
  ],
  
  // Mixed payments validation
  mixedPayments: [
    ValidationRule.custom(
      (value, formData) => {
        if (formData.walletTC !== 'pago_mixto') return true;
        
        const payments = Array.isArray(value) ? value : [];
        if (payments.length === 0) {
          return false;
        }
        
        // Validate each payment
        for (const payment of payments) {
          if (!payment.socio || !payment.tipo || !payment.monto) {
            return false;
          }
          
          if (parseFloat(payment.monto) <= 0) {
            return false;
          }
        }
        
        // Validate total matches expected
        const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
        const expectedTotal = parseFloat(formData.expectedTotalForMixedPayments) || 0;
        
        return Math.abs(totalPayments - expectedTotal) < 0.01;
      },
      'Los pagos mixtos deben estar completos y balanceados'
    )
  ]
};

/**
 * Validate a single field
 */
export const validateField = (fieldName, value, formData = {}, rules = FIELD_VALIDATION_SCHEMA[fieldName]) => {
  if (!rules || rules.length === 0) {
    return { isValid: true, errors: [] };
  }
  
  const errors = [];
  
  for (const rule of rules) {
    let isValid = true;
    
    switch (rule.type) {
      case VALIDATION_TYPES.REQUIRED:
        isValid = value !== null && value !== undefined && value !== '';
        break;
        
      case VALIDATION_TYPES.MIN_LENGTH:
        isValid = !value || value.toString().length >= rule.config.min;
        break;
        
      case VALIDATION_TYPES.MAX_LENGTH:
        isValid = !value || value.toString().length <= rule.config.max;
        break;
        
      case VALIDATION_TYPES.PATTERN:
        isValid = !value || rule.config.pattern.test(value.toString());
        break;
        
      case VALIDATION_TYPES.NUMERIC:
        isValid = !value || VALIDATION_PATTERNS.NUMERIC.test(value.toString());
        break;
        
      case VALIDATION_TYPES.POSITIVE:
        isValid = !value || (parseFloat(value) > 0);
        break;
        
      case VALIDATION_TYPES.CURRENCY:
        isValid = !value || VALIDATION_PATTERNS.CURRENCY.test(value.toString());
        break;
        
      case VALIDATION_TYPES.DATE:
        isValid = !value || VALIDATION_PATTERNS.DATE.test(value.toString());
        break;
        
      case VALIDATION_TYPES.EMAIL:
        isValid = !value || VALIDATION_PATTERNS.EMAIL.test(value.toString());
        break;
        
      case VALIDATION_TYPES.PHONE:
        isValid = !value || VALIDATION_PATTERNS.PHONE.test(value.toString());
        break;
        
      case VALIDATION_TYPES.CONDITIONAL:
        const conditionMet = rule.config.condition(formData);
        isValid = !conditionMet || (value !== null && value !== undefined && value !== '');
        break;
        
      case VALIDATION_TYPES.CUSTOM:
        isValid = rule.config.validator(value, formData);
        break;
        
      default:
        isValid = true;
    }
    
    if (!isValid) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate entire form
 */
export const validateForm = (formData, schema = FIELD_VALIDATION_SCHEMA) => {
  const results = {};
  let isFormValid = true;
  
  // Validate each field in schema
  for (const [fieldName, rules] of Object.entries(schema)) {
    const fieldValue = formData[fieldName];
    const validation = validateField(fieldName, fieldValue, formData, rules);
    
    results[fieldName] = validation;
    
    if (!validation.isValid) {
      isFormValid = false;
    }
  }
  
  return {
    isValid: isFormValid,
    fields: results,
    errors: Object.fromEntries(
      Object.entries(results)
        .filter(([_, validation]) => !validation.isValid)
        .map(([fieldName, validation]) => [fieldName, validation.errors[0]]) // Take first error
    )
  };
};

/**
 * Get validation rules for a specific field
 */
export const getFieldRules = (fieldName) => {
  return FIELD_VALIDATION_SCHEMA[fieldName] || [];
};

/**
 * Add custom validation rule to a field
 */
export const addFieldRule = (fieldName, rule) => {
  if (!FIELD_VALIDATION_SCHEMA[fieldName]) {
    FIELD_VALIDATION_SCHEMA[fieldName] = [];
  }
  FIELD_VALIDATION_SCHEMA[fieldName].push(rule);
};

/**
 * Remove validation rules for a field
 */
export const removeFieldRules = (fieldName) => {
  delete FIELD_VALIDATION_SCHEMA[fieldName];
};

/**
 * Business logic validation helpers
 */
export const businessValidation = {
  // Validate mixed payment totals
  validateMixedPaymentBalance: (payments, expectedTotal) => {
    const totalPayments = payments.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    const expected = parseFloat(expectedTotal) || 0;
    const difference = Math.abs(totalPayments - expected);
    
    return {
      isBalanced: difference < 0.01,
      difference,
      totalPayments,
      expectedTotal: expected
    };
  },
  
  // Validate exchange rate operations
  validateExchangeOperation: (formData) => {
    const { subOperacion, monto, tc, moneda, monedaTC } = formData;
    
    if (!['COMPRA', 'VENTA'].includes(subOperacion)) {
      return { isValid: true };
    }
    
    const errors = [];
    
    if (!monto || parseFloat(monto) <= 0) {
      errors.push('Monto debe ser mayor a 0');
    }
    
    if (!tc || parseFloat(tc) <= 0) {
      errors.push('Tipo de cambio debe ser mayor a 0');
    }
    
    if (!moneda) {
      errors.push('Debe seleccionar moneda de origen');
    }
    
    if (!monedaTC) {
      errors.push('Debe seleccionar moneda de destino');
    }
    
    if (moneda === monedaTC) {
      errors.push('Las monedas de origen y destino deben ser diferentes');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};