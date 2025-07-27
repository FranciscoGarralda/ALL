/**
 * Currency options with flags and symbols
 */
export const monedas = [
  { value: 'PESO', label: '🇦🇷 PESO' },
  { value: 'USD', label: '💵 USD' },
  { value: 'EURO', label: '🇪🇺 EURO' },
  { value: 'USDT', label: '₿ USDT' },
  { value: 'REAL', label: '🇧🇷 REAL' },
  { value: 'LIBRA', label: '🇬🇧 LIBRA' },
  { value: 'CLP', label: '🇨🇱 CLP' },
];

/**
 * Account types configuration
 */
export const cuentas = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'bancaria_socio1', label: 'Cuenta Bancaria Socio1' },
  { value: 'bancaria_socio2', label: 'Cuenta Bancaria Socio2' },
  { value: 'bancaria_alliance', label: 'Cuenta Bancaria Alliance' },
  { value: 'usdt_socio1', label: 'Cuenta Socio1 (USDT)' },
  { value: 'usdt_socio2', label: 'Cuenta Socio2 (USDT)' },
  { value: 'cliente', label: 'Cliente' },
];

/**
 * Partners/associates configuration
 */
export const socios = [
  { value: 'socio1', label: 'Socio 1' },
  { value: 'socio2', label: 'Socio 2' },
  { value: 'otro', label: 'Otro' },
];

/**
 * Operation status options - Updated for Estado de retiro
 */
export const estados = [
  { value: 'pendiente_retiro', label: 'Pendiente de retiro' },
  { value: 'pendiente_entrega', label: 'Pendiente de entrega' },
  { value: 'realizado', label: 'Realizado' },
];

/**
 * Current account providers with allowed currencies
 */
export const proveedoresCC = [
  { value: '', label: 'Seleccionar proveedor', allowedCurrencies: [] },
  { value: 'ALL', label: 'ALL', allowedCurrencies: ['PESO', 'USD', 'EURO', 'USDT', 'REAL', 'LIBRA', 'CLP'] },
  { value: 'ME', label: 'ME', allowedCurrencies: ['USD'] },
  { value: 'SS', label: 'SS', allowedCurrencies: ['USD', 'EURO', 'PESO'] },
  { value: 'AL', label: 'AL', allowedCurrencies: ['PESO', 'USDT', 'USD'] },
];

/**
 * Main operation types with icons and sub-operations
 */
export const operaciones = {
  TRANSACCIONES: { icon: '💱', subMenu: ['COMPRA', 'VENTA', 'ARBITRAJE'] },
  CUENTAS_CORRIENTES: { icon: '🤝', subMenu: ['INGRESO', 'EGRESO'] },
  SOCIOS: { icon: '👥', subMenu: ['INGRESO', 'SALIDA', 'PRESTAMO', 'DEVOLUCION'] },
  ADMINISTRATIVAS: { icon: '🔧', subMenu: ['AJUSTE', 'GASTO'] },
  PRESTAMISTAS: { icon: '🏦', subMenu: ['PRESTAMO', 'RETIRO'] },
  INTERNAS: { icon: '🔄', subMenu: ['TRANSFERENCIA'] },
};

/**
 * Wallet types for operations (without mixed payment)
 */
export const walletTypes = [
  // Socio 1 Wallets
  { value: 'socio1_peso_fisico', label: 'Socio 1 - Peso Físico' },
  { value: 'socio1_peso_digital', label: 'Socio 1 - Peso Digital' },
  { value: 'socio1_usd_fisico', label: 'Socio 1 - USD Físico' },
  { value: 'socio1_usd_digital', label: 'Socio 1 - USD Digital' },
  { value: 'socio1_usdt_digital', label: 'Socio 1 - USDT Digital' },
  { value: 'socio1_euro_fisico', label: 'Socio 1 - Euro Físico' },
  { value: 'socio1_real_fisico', label: 'Socio 1 - Real Físico' },
  { value: 'socio1_libra_fisico', label: 'Socio 1 - Libra Físico' },
  { value: 'socio1_clp_fisico', label: 'Socio 1 - CLP Físico' },
  
  // Socio 2 Wallets
  { value: 'socio2_peso_fisico', label: 'Socio 2 - Peso Físico' },
  { value: 'socio2_peso_digital', label: 'Socio 2 - Peso Digital' },
  { value: 'socio2_usd_fisico', label: 'Socio 2 - USD Físico' },
  { value: 'socio2_usd_digital', label: 'Socio 2 - USD Digital' },
  { value: 'socio2_usdt_digital', label: 'Socio 2 - USDT Digital' },
  { value: 'socio2_euro_fisico', label: 'Socio 2 - Euro Físico' },
  { value: 'socio2_real_fisico', label: 'Socio 2 - Real Físico' },
  { value: 'socio2_libra_fisico', label: 'Socio 2 - Libra Físico' },
  { value: 'socio2_clp_fisico', label: 'Socio 2 - CLP Físico' },
];

/**
 * Wallet types for TC field (includes mixed payment)
 */
export const walletTypesTC = [
  // Socio 1 Wallets
  { value: 'socio1_peso_fisico', label: 'Socio 1 - Peso Físico' },
  { value: 'socio1_peso_digital', label: 'Socio 1 - Peso Digital' },
  { value: 'socio1_usd_fisico', label: 'Socio 1 - USD Físico' },
  { value: 'socio1_usd_digital', label: 'Socio 1 - USD Digital' },
  { value: 'socio1_usdt_digital', label: 'Socio 1 - USDT Digital' },
  { value: 'socio1_euro_fisico', label: 'Socio 1 - Euro Físico' },
  { value: 'socio1_real_fisico', label: 'Socio 1 - Real Físico' },
  { value: 'socio1_libra_fisico', label: 'Socio 1 - Libra Físico' },
  { value: 'socio1_clp_fisico', label: 'Socio 1 - CLP Físico' },
  
  // Socio 2 Wallets
  { value: 'socio2_peso_fisico', label: 'Socio 2 - Peso Físico' },
  { value: 'socio2_peso_digital', label: 'Socio 2 - Peso Digital' },
  { value: 'socio2_usd_fisico', label: 'Socio 2 - USD Físico' },
  { value: 'socio2_usd_digital', label: 'Socio 2 - USD Digital' },
  { value: 'socio2_usdt_digital', label: 'Socio 2 - USDT Digital' },
  { value: 'socio2_euro_fisico', label: 'Socio 2 - Euro Físico' },
  { value: 'socio2_real_fisico', label: 'Socio 2 - Real Físico' },
  { value: 'socio2_libra_fisico', label: 'Socio 2 - Libra Físico' },
  { value: 'socio2_clp_fisico', label: 'Socio 2 - CLP Físico' },
  
  // Pago Mixto
  { value: 'pago_mixto', label: 'Pago Mixto' },
];

/**
 * Payment types for mixed payments
 */
export const tiposPago = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'crypto', label: 'Criptomonedas' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
];

/**
 * Operation priorities
 */
export const prioridades = [
  { value: 'baja', label: 'Baja', color: 'text-green-600' },
  { value: 'media', label: 'Media', color: 'text-yellow-600' },
  { value: 'alta', label: 'Alta', color: 'text-red-600' },
];

/**
 * Time periods for reports
 */
export const periodos = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta Semana' },
  { value: 'mes', label: 'Este Mes' },
  { value: 'trimestre', label: 'Este Trimestre' },
  { value: 'año', label: 'Este Año' },
  { value: 'personalizado', label: 'Período Personalizado' },
];

/**
 * Notification types
 */
export const tiposNotificacion = [
  { value: 'info', label: 'Información', color: 'blue' },
  { value: 'success', label: 'Éxito', color: 'green' },
  { value: 'warning', label: 'Advertencia', color: 'yellow' },
  { value: 'error', label: 'Error', color: 'red' },
];

/**
 * Default prestamista clients - can be extended dynamically
 */
export const prestamistaClientsDefault = [
  { value: '', label: 'Seleccionar cliente' },
  { value: 'cliente1', label: 'Cliente 1' },
  { value: 'cliente2', label: 'Cliente 2' },
  { value: 'cliente3', label: 'Cliente 3' },
];

/**
 * Responsive breakpoints configuration
 */
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Default form validation rules
 */
export const validationRules = {
  required: (value) => value !== '' && value !== null && value !== undefined,
  minAmount: (value, min = 0) => parseFloat(value) >= min,
  maxAmount: (value, max = 999999999) => parseFloat(value) <= max,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[\d\s\-\+\(\)]+$/.test(value),
};

/**
 * Error messages for validation
 */
export const errorMessages = {
  required: 'Este campo es obligatorio',
  minAmount: 'El monto debe ser mayor a 0',
  maxAmount: 'El monto excede el límite permitido',
  email: 'Ingrese un email válido',
  phone: 'Ingrese un teléfono válido',
  invalidCurrency: 'Seleccione una moneda válida',
  invalidAccount: 'Seleccione una cuenta válida',
};