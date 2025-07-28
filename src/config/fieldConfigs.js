import { monedas, cuentas, socios, proveedoresCC, prestamistaClientsDefault, walletTypes, walletTypesTC } from './constants';

/**
 * Configuration object for specific operation field layouts
 * Each operation type defines its field groups, validation rules, and special behaviors
 */
export const specificFieldsConfig = {
  // Buy operations configuration
  COMPRA: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Wallet Compra', name: 'walletCompra', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'TC (Tipo de Cambio)', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda TC', name: 'monedaTC', type: 'select', options: monedas, required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Wallet TC', name: 'walletTC', type: 'wallet-tc-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Total', name: 'total', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: true,
    includesPagoMixto: true,
    pagoMixtoWalletMode: true, // Nueva flag para usar wallets en pago mixto
    calculations: {
      total: (formData) => {
        const monto = parseFloat(formData.monto) || 0;
        const tc = parseFloat(formData.tc) || 0;
        return monto * tc;
      }
    }
  },

  // Sell operations configuration
  VENTA: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Wallet Venta', name: 'walletCompra', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'TC (Tipo de Cambio)', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda TC', name: 'monedaTC', type: 'select', options: monedas, required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Wallet TC', name: 'walletTC', type: 'wallet-tc-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Total', name: 'total', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: true,
    includesPagoMixto: true,
    pagoMixtoWalletMode: true, // Nueva flag para usar wallets en pago mixto
    calculations: {
      total: (formData) => {
        const monto = parseFloat(formData.monto) || 0;
        const tc = parseFloat(formData.tc) || 0;
        return monto * tc;
      }
    }
  },

  // Arbitrage operations configuration
  ARBITRAJE: {
    groups: [
      [
        { label: 'Monto compra', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda compra', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'TC compra', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda TC compra', name: 'monedaTCCompra', type: 'select', options: monedas, required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Total compra', name: 'totalCompra', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Monto venta', name: 'montoVenta', type: 'number', placeholder: '0.00', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' },
        { label: 'Moneda venta', name: 'monedaVenta', type: 'select', options: monedas, required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'TC venta', name: 'tcVenta', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda TC venta', name: 'monedaTCVenta', type: 'select', options: monedas, required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Total venta', name: 'totalVenta', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Comisión / Profit', name: 'comision', type: 'number', placeholder: '0.00', calculated: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Wallet Comisión', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: true,
    includesPagoMixto: false,
    calculations: {
      totalCompra: (formData) => {
        const monto = parseFloat(formData.monto) || 0;
        const tc = parseFloat(formData.tc) || 0;
        return monto * tc;
      },
      totalVenta: (formData) => {
        const montoVenta = parseFloat(formData.montoVenta) || 0;
        const tcVenta = parseFloat(formData.tcVenta) || 0;
        return montoVenta * tcVenta;
      },
      comision: (formData) => {
        const totalVenta = parseFloat(formData.totalVenta) || 0;
        const totalCompra = parseFloat(formData.totalCompra) || 0;
        return totalVenta - totalCompra;
      }
    }
  },

  // Current accounts income/expense configuration
  CUENTAS_CORRIENTES_INGRESO_EGRESO: {
    groups: (formData) => {
      const selectedProveedor = proveedoresCC.find(p => p.value === formData.proveedorCC);
      const availableMonedas = selectedProveedor 
        ? monedas.filter(m => selectedProveedor.allowedCurrencies.includes(m.value) || m.value === '') 
        : monedas;

      return [
        [
          { label: 'Proveedor', name: 'proveedorCC', type: 'select', options: proveedoresCC, required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: `Monto ${formData.subOperacion || 'Ingreso/Egreso'}`, name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
          { label: 'Moneda', name: 'moneda', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-1' }
        ],
        [
          { label: 'Cuenta', name: 'cuenta', type: 'cuenta-buttons', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Comisión (%)', name: 'comisionPorcentaje', type: 'number', placeholder: '0.00', gridCols: 'col-span-1' },
          { label: 'Monto Comisión', name: 'montoComision', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-1' }
        ],
        [
          { label: 'Moneda Comisión', name: 'monedaComision', type: 'select', options: monedas, readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta Comisión', name: 'cuentaComision', type: 'cuenta-buttons', gridCols: 'col-span-2', readOnly: true, calculated: true }
        ]
      ];
    },
    includesEstadoYPor: true,
    includesPagoMixto: false
  },

  // Partners shared configuration for multiple operations
  SOCIOS_SHARED: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true },
        { label: 'Cuenta', name: 'cuenta', type: 'select', options: cuentas, required: true }
      ],
      [
        { 
          label: 'Socio', 
          name: 'socioSeleccionado', 
          type: 'select', 
          options: [
            { value: '', label: 'Seleccionar socio' }, 
            { value: 'socio1', label: 'Socio 1' }, 
            { value: 'socio2', label: 'Socio 2' }
          ],
          required: true
        }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Administrative adjustment operations
  AJUSTE: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true },
        { label: 'Cuenta', name: 'cuenta', type: 'select', options: cuentas, required: true }
      ],
      [
        { label: 'Motivo (obligatorio)', name: 'detalle', type: 'text', placeholder: 'Descripción del ajuste...', required: true }
      ],
      [
        { label: 'Autorizado por', name: 'por', type: 'select', options: socios, required: true }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Administrative expense operations
  GASTO: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true },
        { label: 'Cuenta', name: 'cuenta', type: 'select', options: cuentas, required: true }
      ],
      [
        { label: 'Motivo (obligatorio)', name: 'detalle', type: 'text', placeholder: 'Descripción del gasto...', required: true }
      ],
      [
        { label: 'Autorizado por', name: 'por', type: 'select', options: socios, required: true }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Loan operations for prestamistas
  PRESTAMISTAS_PRESTAMO: {
    groups: (prestamistaClients = prestamistaClientsDefault) => [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true }
      ],
      [
        { label: '% Interés Anual', name: 'interes', type: 'number', placeholder: '0.00', required: true },
        { label: 'Lapso (días)', name: 'lapso', type: 'number', placeholder: '30', required: true }
      ],
      [
        { label: 'Cuenta', name: 'cuenta', type: 'select', options: cuentas, required: true },
        { label: 'Cliente', name: 'cliente', type: 'select', options: prestamistaClients, required: true }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false,
    calculations: {
      interesTotal: (formData) => {
        const monto = parseFloat(formData.monto) || 0;
        const interes = parseFloat(formData.interes) || 0;
        const lapso = parseFloat(formData.lapso) || 0;
        return (monto * interes * lapso) / (365 * 100);
      },
      montoTotal: (formData) => {
        const monto = parseFloat(formData.monto) || 0;
        const interesTotal = formData.interesTotal || 0;
        return monto + interesTotal;
      }
    }
  },

  // Withdrawal operations for prestamistas
  PRESTAMISTAS_RETIRO: {
    groups: (prestamistaClients = prestamistaClientsDefault) => [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true },
        { label: 'Cuenta', name: 'cuenta', type: 'select', options: cuentas, required: true }
      ],
      [
        { label: 'Cliente', name: 'cliente', type: 'select', options: prestamistaClients, required: true }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Internal transfer operations
  TRANSFERENCIA: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true },
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true }
      ],
      [
        { label: 'Cuenta de Salida', name: 'cuentaSalida', type: 'select', options: cuentas, required: true }
      ],
      [
        { label: 'Cuenta de Ingreso', name: 'cuentaIngreso', type: 'select', options: cuentas, required: true }
      ],
      [
        { label: 'Comisión (opcional)', name: 'comision', type: 'number', placeholder: '0.00' },
        { label: 'Moneda Comisión', name: 'monedaComision', type: 'select', options: monedas }
      ],
      [
        { label: 'Cuenta Comisión', name: 'cuentaComision', type: 'select', options: cuentas }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false,
    validations: {
      differentAccounts: (formData) => {
        return formData.cuentaSalida !== formData.cuentaIngreso;
      }
    }
  }
};

/**
 * Get field configuration for a specific operation type
 * @param {string} operationType - The operation type key
 * @param {object} formData - Current form data for dynamic configurations
 * @param {array} prestamistaClients - Custom prestamista clients if needed
 * @returns {object} Field configuration object
 */
export const getFieldConfig = (operationType, formData = {}, prestamistaClients = null) => {
  const config = specificFieldsConfig[operationType];
  
  if (!config) {
    return null;
  }

  // Handle dynamic groups
  if (typeof config.groups === 'function') {
    return {
      ...config,
      groups: config.groups(prestamistaClients || formData)
    };
  }

  return config;
};

/**
 * Validate field configuration requirements
 * @param {object} formData - Form data to validate
 * @param {string} operationType - Operation type
 * @returns {object} Validation result with errors array
 */
export const validateFieldConfig = (formData, operationType) => {
  const config = getFieldConfig(operationType, formData);
  const errors = [];

  if (!config) {
    return { isValid: false, errors: ['Configuración de operación no encontrada'] };
  }

  // Flatten all fields from groups
  const allFields = config.groups.flat();

  // Check required fields
  allFields.forEach(field => {
    if (field.required && (!formData[field.name] || formData[field.name] === '')) {
      errors.push(`${field.label} es obligatorio`);
    }
  });

  // Run custom validations if they exist
  if (config.validations) {
    Object.entries(config.validations).forEach(([validationName, validationFn]) => {
      if (!validationFn(formData)) {
        errors.push(`Validación ${validationName} falló`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};