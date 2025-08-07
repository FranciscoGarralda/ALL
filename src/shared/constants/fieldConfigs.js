import { monedas, cuentas, socios, sociosSinOtro, proveedoresCC, prestamistaClientsDefault, walletTypes, walletTypesTC } from './constants';
import { safeParseFloat } from '../services/safeOperations';

// Helper function to get currency label
const getCurrencyLabel = (value) => {
  const currency = monedas.find(m => m.value === value);
  return currency ? currency.label.split(' ')[1] : value; // Return just the code (ARS, USD, etc.)
};

/**
 * Configuration object for specific operation field layouts
 * Each operation type defines its field groups, validation rules, and special behaviors
 */
export const specificFieldsConfig = {
  // Buy operations configuration
  COMPRA: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta donde Recibimos', name: 'walletCompra', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'TC (Tipo de Cambio)', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda a Pagar', name: 'monedaTC', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta desde donde Pagamos', name: 'walletTC', type: 'wallet-tc-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Total a Pagar', name: 'total', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: true,
    includesPagoMixto: true,
    pagoMixtoWalletMode: true, // Nueva flag para usar wallets en pago mixto
    calculations: {
      total: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const tc = safeParseFloat(formData.tc, 0);
        return monto * tc;
      }
    }
  },

  // Sell operations configuration
  VENTA: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta desde donde Entregamos', name: 'walletCompra', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'TC (Tipo de Cambio)', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda a Cobrar', name: 'monedaTC', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta donde Cobramos', name: 'walletTC', type: 'wallet-tc-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Total a Cobrar', name: 'total', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: true,
    includesPagoMixto: true,
    pagoMixtoWalletMode: true, // Nueva flag para usar wallets en pago mixto
    calculations: {
      total: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const tc = safeParseFloat(formData.tc, 0);
        return monto * tc;
      }
    }
  },

  // Arbitrage operations configuration
  ARBITRAJE: {
    groups: [
      // Monto compra
      [
        { label: 'Monto compra', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      // Moneda
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      // TC compra
      [
        { label: 'TC compra', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      // Moneda TC
      [
        { label: 'Moneda', name: 'monedaTC', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      // Total
      [
        { label: 'Total compra', name: 'totalCompra', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ],
      // Monto venta / Moneda venta
      [
        { label: 'Monto venta', name: 'montoVenta', type: 'number', placeholder: '0.00', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' },
        { label: 'Moneda', name: 'monedaVenta', type: 'text', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' }
      ],
      // TC venta / Moneda TC
      [
        { label: 'TC venta', name: 'tcVenta', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Moneda TC', name: 'monedaTCVenta', type: 'text', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' }
      ],
      // Total
      [
        { label: 'Total venta', name: 'totalVenta', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ],
      // Profit / Moneda
      [
        { label: 'Profit', name: 'profit', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-1' },
        { label: 'Moneda', name: 'monedaProfit', type: 'text', readOnly: true, calculated: true, gridCols: 'col-span-1' }
      ],
      // Cuenta
      [
        { label: 'Cuenta Ingreso', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ]
    ],
    // Configuración especial para mantener campos lado a lado en móvil
    mobileLayout: 'keep-columns',
    includesEstadoYPor: true,
    includesPagoMixto: false,
    calculations: {
      totalCompra: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const tc = safeParseFloat(formData.tc, 0);
        return monto * tc;
      },
      totalVenta: (formData) => {
        const montoVenta = safeParseFloat(formData.montoVenta, 0);
        const tcVenta = safeParseFloat(formData.tcVenta, 0);
        return montoVenta * tcVenta;
      },
      // Campos que se completan automáticamente
      montoVenta: (formData) => formData.monto, // Monto venta = monto compra
      monedaVenta: (formData) => getCurrencyLabel(formData.moneda), // Moneda venta = moneda compra (as label)
      monedaTCVenta: (formData) => getCurrencyLabel(formData.monedaTC), // Moneda TC venta = moneda TC compra (as label)
      monedaProfit: (formData) => getCurrencyLabel(formData.monedaTC), // Moneda profit = moneda TC (as label)
      profit: (formData) => {
        const totalVenta = safeParseFloat(formData.totalVenta, 0);
        const totalCompra = safeParseFloat(formData.totalCompra, 0);
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
          { label: `Monto ${formData.subOperacion || 'Ingreso/Egreso'}`, name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Moneda', name: 'moneda', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Comisión', name: 'comisionPorcentaje', type: 'commission', placeholder: '0.00', gridCols: 'col-span-1' },
          { label: 'Monto Comisión', name: 'montoComision', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-1' }
        ],
        [
          { label: 'Moneda Comisión', name: 'monedaComision', type: 'text', readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta Comisión', name: 'cuentaComision', type: 'wallet-buttons', gridCols: 'col-span-2', required: true }
        ],
        [
          { label: `${formData.subOperacion || 'Ingreso/Egreso'} Real`, name: 'montoReal', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ]
      ];
    },
    includesEstadoYPor: true,
    includesPagoMixto: false
  },

  // Current accounts COMPRA configuration
  CUENTAS_CORRIENTES_COMPRA: {
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
          { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Moneda', name: 'moneda', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta donde Recibimos', name: 'walletCompra', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'TC (Tipo de Cambio)', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Moneda a Pagar', name: 'monedaTC', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta desde donde Pagamos', name: 'walletTC', type: 'wallet-tc-buttons', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Total a Pagar', name: 'total', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ]
      ];
    },
    includesEstadoYPor: true,
    includesPagoMixto: true,
    pagoMixtoWalletMode: true,
    calculations: {
      total: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const tc = safeParseFloat(formData.tc, 0);
        return monto * tc;
      }
    }
  },

  // Current accounts VENTA configuration
  CUENTAS_CORRIENTES_VENTA: {
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
          { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Moneda', name: 'moneda', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta desde donde Entregamos', name: 'walletCompra', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'TC (Tipo de Cambio)', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Moneda a Cobrar', name: 'monedaTC', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Cuenta donde Cobramos', name: 'walletTC', type: 'wallet-tc-buttons', required: true, gridCols: 'col-span-2' }
        ],
        [
          { label: 'Total a Cobrar', name: 'total', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ]
      ];
    },
    includesEstadoYPor: true,
    includesPagoMixto: true,
    pagoMixtoWalletMode: true,
    calculations: {
      total: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const tc = safeParseFloat(formData.tc, 0);
        return monto * tc;
      }
    }
  },

  // Current accounts ARBITRAJE configuration
  CUENTAS_CORRIENTES_ARBITRAJE: {
    groups: (formData) => {
      const selectedProveedor = proveedoresCC.find(p => p.value === formData.proveedorCC);
      const availableMonedas = selectedProveedor 
        ? monedas.filter(m => selectedProveedor.allowedCurrencies.includes(m.value) || m.value === '') 
        : monedas;

      return [
        [
          { label: 'Proveedor', name: 'proveedorCC', type: 'select', options: proveedoresCC, required: true, gridCols: 'col-span-2' }
        ],
        // Monto compra
        [
          { label: 'Monto compra', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        // Moneda
        [
          { label: 'Moneda', name: 'moneda', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        // TC compra
        [
          { label: 'TC compra', name: 'tc', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
        ],
        // Moneda TC
        [
          { label: 'Moneda', name: 'monedaTC', type: 'select', options: availableMonedas, required: true, gridCols: 'col-span-2' }
        ],
        // Total
        [
          { label: 'Total compra', name: 'totalCompra', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ],
        // Monto venta / Moneda venta
        [
          { label: 'Monto venta', name: 'montoVenta', type: 'number', placeholder: '0.00', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' },
          { label: 'Moneda', name: 'monedaVenta', type: 'text', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' }
        ],
        // TC venta / Moneda TC
        [
          { label: 'TC venta', name: 'tcVenta', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
          { label: 'Moneda TC', name: 'monedaTCVenta', type: 'text', required: true, readOnly: true, calculated: true, gridCols: 'col-span-1' }
        ],
        // Total
        [
          { label: 'Total venta', name: 'totalVenta', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-2' }
        ],
        // Profit / Moneda
        [
          { label: 'Profit', name: 'profit', type: 'number', readOnly: true, calculated: true, gridCols: 'col-span-1' },
          { label: 'Moneda', name: 'monedaProfit', type: 'text', readOnly: true, calculated: true, gridCols: 'col-span-1' }
        ],
        // Cuenta
        [
          { label: 'Cuenta Ingreso', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
        ]
      ];
    },
    // Configuración especial para mantener campos lado a lado en móvil
    mobileLayout: 'keep-columns',
    includesEstadoYPor: true,
    includesPagoMixto: false,
    calculations: {
      totalCompra: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const tc = safeParseFloat(formData.tc, 0);
        return monto * tc;
      },
      montoVenta: (formData) => {
        return formData.monto || '0.00';
      },
      monedaVenta: (formData) => {
        return getCurrencyLabel(formData.monedaTC);
      },
      monedaTCVenta: (formData) => {
        return getCurrencyLabel(formData.moneda);
      },
      totalVenta: (formData) => {
        const montoVenta = safeParseFloat(formData.montoVenta, 0);
        const tcVenta = safeParseFloat(formData.tcVenta, 0);
        return montoVenta * tcVenta;
      },
      profit: (formData) => {
        const totalVenta = safeParseFloat(formData.totalVenta, 0);
        const totalCompra = safeParseFloat(formData.totalCompra, 0);
        
        if (formData.monedaTCVenta === formData.monedaTC) {
          return totalVenta - totalCompra;
        }
        return 0;
      },
      monedaProfit: (formData) => {
        return getCurrencyLabel(formData.monedaTC);
      }
    }
  },

  // Partners shared configuration for multiple operations
  SOCIOS_SHARED: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { 
          label: 'Socio', 
          name: 'socioSeleccionado', 
          type: 'select', 
          options: [
            { value: 'socio1', label: 'Socio 1' }, 
            { value: 'socio2', label: 'Socio 2' }
          ],
          required: true,
          gridCols: 'col-span-2'
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
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Motivo (obligatorio)', name: 'detalle', type: 'text', placeholder: 'Descripción del ajuste...', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Autorizado por', name: 'por', type: 'select', options: sociosSinOtro, required: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Administrative expense operations
  GASTO: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Motivo (obligatorio)', name: 'detalle', type: 'text', placeholder: 'Descripción del gasto...', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Autorizado por', name: 'por', type: 'select', options: sociosSinOtro, required: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Loan operations for prestamistas
  PRESTAMISTAS_PRESTAMO: {
    groups: (prestamistaClients = prestamistaClientsDefault) => [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: '% Interés Anual', name: 'interes', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-1' },
        { label: 'Lapso (días)', name: 'lapso', type: 'number', placeholder: '30', required: true, gridCols: 'col-span-1' }
      ],
      [
        { label: 'Cuenta', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cliente', name: 'cliente', type: 'client-autocomplete', options: prestamistaClients, required: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false,
    calculations: {
      interesTotal: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const interes = safeParseFloat(formData.interes, 0);
        const lapso = safeParseFloat(formData.lapso, 0);
        return (monto * interes * lapso) / (365 * 100);
      },
      montoTotal: (formData) => {
        const monto = safeParseFloat(formData.monto, 0);
        const interesTotal = formData.interesTotal || 0;
        return monto + interesTotal;
      }
    }
  },

  // Withdrawal operations for prestamistas
  PRESTAMISTAS_RETIRO: {
    groups: (prestamistaClients = prestamistaClientsDefault) => [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta', name: 'cuenta', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cliente', name: 'cliente', type: 'client-autocomplete', options: prestamistaClients, required: true, gridCols: 'col-span-2' }
      ]
    ],
    includesEstadoYPor: false,
    includesPagoMixto: false
  },

  // Internal transfer operations
  MOV_ENTRE_CUENTAS: {
    groups: [
      [
        { label: 'Monto', name: 'monto', type: 'number', placeholder: '0.00', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda', name: 'moneda', type: 'select', options: monedas, required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta de Salida', name: 'cuentaSalida', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta de Ingreso', name: 'cuentaIngreso', type: 'wallet-buttons', required: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Comisión', name: 'comision', type: 'commission', placeholder: '0.00', gridCols: 'col-span-2' }
      ],
      [
        { label: 'Moneda Comisión', name: 'monedaComision', type: 'select', options: monedas, readOnly: true, calculated: true, gridCols: 'col-span-2' }
      ],
      [
        { label: 'Cuenta Comisión', name: 'cuentaComision', type: 'wallet-buttons', gridCols: 'col-span-2' }
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