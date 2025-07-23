/**
 * Currency symbols configuration
 */
export const CURRENCY_SYMBOLS = {
  PESO: '$',
  USD: 'US$',
  EURO: '€',
  USDT: '₮',
  BTC: '₿',
  ETH: 'Ξ',
  ARS: '$',
  BRL: 'R$',
  CLP: '$',
  COP: '$',
  MXN: '$',
  UYU: '$U'
};

/**
 * Currency display names
 */
export const CURRENCY_NAMES = {
  PESO: 'Peso Argentino',
  USD: 'Dólar Estadounidense',
  EURO: 'Euro',
  USDT: 'Tether USD',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ARS: 'Peso Argentino',
  BRL: 'Real Brasileño',
  CLP: 'Peso Chileno',
  COP: 'Peso Colombiano',
  MXN: 'Peso Mexicano',
  UYU: 'Peso Uruguayo'
};

/**
 * Format amount with currency symbol and proper number formatting
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (PESO, USD, EURO, etc.)
 * @param {object} options - Formatting options
 * @returns {string} Formatted amount with currency symbol
 */
export const formatAmountWithCurrency = (amount, currency = 'PESO', options = {}) => {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 2,
    thousandSeparator = '.',
    decimalSeparator = ',',
    position = 'before' // 'before' or 'after'
  } = options;

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid amounts
  if (isNaN(numAmount)) {
    return showSymbol ? `${CURRENCY_SYMBOLS[currency] || '$'} 0${decimalSeparator}00` : '0.00';
  }

  // Format number with proper separators
  const formattedNumber = numAmount.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true
  }).replace(/\./g, thousandSeparator).replace(/,/g, decimalSeparator);

  // Get currency symbol
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  
  // Build formatted string
  let result = formattedNumber;
  
  if (showSymbol) {
    result = position === 'before' 
      ? `${symbol} ${formattedNumber}`
      : `${formattedNumber} ${symbol}`;
  }
  
  if (showCode) {
    result += ` ${currency}`;
  }
  
  return result;
};

/**
 * Parse formatted currency string back to number
 * @param {string} formattedAmount - Formatted currency string
 * @returns {number} Parsed number
 */
export const parseCurrencyAmount = (formattedAmount) => {
  if (!formattedAmount) return 0;
  
  // Remove currency symbols and codes
  let cleanAmount = formattedAmount.toString();
  Object.values(CURRENCY_SYMBOLS).forEach(symbol => {
    cleanAmount = cleanAmount.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  });
  
  // Remove currency codes
  Object.keys(CURRENCY_SYMBOLS).forEach(code => {
    cleanAmount = cleanAmount.replace(new RegExp(`\\b${code}\\b`, 'g'), '');
  });
  
  // Clean up and convert
  cleanAmount = cleanAmount.replace(/\./g, '').replace(/,/g, '.').trim();
  
  return parseFloat(cleanAmount) || 0;
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date with day of week
 * @param {Date|string} date - Date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date with day of week
 */
export const formatDateWithDay = (date, options = {}) => {
  const {
    showDay = true,
    format = 'dd/MM/yyyy',
    locale = 'es-AR'
  } = options;
  
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return '';
  
  const dayNames = {
    'es-AR': ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  let formattedDate = format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year);
  
  if (showDay) {
    const dayName = dayNames[locale] || dayNames['es-AR'];
    const weekDay = dayName[dateObj.getDay()];
    formattedDate = `${weekDay}, ${formattedDate}`;
  }
  
  return formattedDate;
};

/**
 * Calculate operation totals for buy/sell operations
 * @param {object} operation - Operation data
 * @returns {object} Calculated totals
 */
export const calculateOperationTotals = (operation) => {
  const { cantidad = 0, precio = 0, comision = 0, impuestos = 0 } = operation;
  
  const subtotal = cantidad * precio;
  const totalComision = subtotal * (comision / 100);
  const totalImpuestos = subtotal * (impuestos / 100);
  const total = subtotal + totalComision + totalImpuestos;
  
  return {
    subtotal,
    totalComision,
    totalImpuestos,
    total
  };
};

/**
 * Validate currency code
 * @param {string} currency - Currency code to validate
 * @returns {boolean} True if valid currency
 */
export const isValidCurrency = (currency) => {
  return Object.keys(CURRENCY_SYMBOLS).includes(currency);
};

/**
 * Get available currencies for a provider
 * @param {string} provider - Provider name
 * @returns {Array} Available currencies for the provider
 */
export const getProviderCurrencies = (provider) => {
  const providerCurrencies = {
    'BANCO_NACION': ['PESO', 'USD'],
    'BANCO_PROVINCIA': ['PESO', 'USD'],
    'MERCADO_PAGO': ['PESO', 'USD'],
    'BINANCE': ['USD', 'USDT', 'BTC', 'ETH'],
    'CRYPTO_COM': ['USD', 'USDT', 'BTC', 'ETH'],
    'WESTERN_UNION': ['USD', 'EURO'],
    'PAYPAL': ['USD', 'EURO'],
    'DEFAULT': Object.keys(CURRENCY_SYMBOLS)
  };
  
  return providerCurrencies[provider] || providerCurrencies.DEFAULT;
};