/**
 * Format number input in real-time as user types
 * @param {string} value - Raw input value
 * @param {string} currency - Currency code (default: PESO)
 * @returns {object} { formatted, raw } - Formatted display value and raw numeric value
 */
export const formatCurrencyInput = (value, currency = 'PESO') => {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.toString().replace(/[^\d.,]/g, '');
  
  // Handle empty or invalid input
  if (!cleanValue || cleanValue === '') {
    return { formatted: '', raw: '' };
  }
  
  // Convert to number, handling both . and , as decimal separators
  let numericValue = cleanValue.replace(/\./g, '').replace(',', '.');
  
  // If it's just a decimal point, return empty
  if (numericValue === '.' || numericValue === ',') {
    return { formatted: '', raw: '' };
  }
  
  // Parse as float
  const number = parseFloat(numericValue);
  
  // Handle invalid numbers
  if (isNaN(number)) {
    return { formatted: '', raw: '' };
  }
  
  // Format with thousands separator
  const formatted = number.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  });
  
  // Add currency symbol
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const displayValue = `${symbol}${formatted}`;
  
  return {
    formatted: displayValue,
    raw: number.toString()
  };
};

/**
 * Parse formatted currency input back to raw number
 * @param {string} formattedValue - Formatted currency string like "$1.000,50"
 * @returns {string} Raw numeric value
 */
export const parseCurrencyInput = (formattedValue) => {
  if (!formattedValue) return '';
  
  // Remove currency symbols and spaces
  const cleaned = formattedValue.replace(/[\$€₮₿ΞR\$US\$\$U\s]/g, '');
  
  // Handle Argentine format: 1.000,50 -> 1000.50
  const withDot = cleaned.replace(/\./g, '').replace(',', '.');
  
  const number = parseFloat(withDot);
  return isNaN(number) ? '' : number.toString();
};

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
  });

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
  
  // Fix timezone issue: parse date as local time instead of UTC
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    // If it's a string in YYYY-MM-DD format, parse as local time
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      dateObj = new Date(date);
    }
  }
  
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

/**
 * Utility functions for formatting data in the application
 */

/**
 * Format currency amount with proper locale and currency symbol
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (PESO, USD, EUR, etc.)
 * @param {string} locale - Locale for formatting (default: 'es-ES')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'PESO', locale = 'es-ES') => {
  if (!amount && amount !== 0) return '0';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '0';
  
  const formatted = numericAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Currency symbols mapping
  const currencySymbols = {
    'PESO': '$',
    'USD': 'US$',
    'EUR': '€',
    'BRL': 'R$',
    'UYU': '$U'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${formatted}`;
};

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'es-ES')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'es-ES', options = {}) => {
  if (!date) return 'Sin fecha';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
};

/**
 * Format phone number to a consistent format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length >= 10) {
    // Assume Argentine format: +54 11 1234-5678
    const countryCode = cleaned.slice(0, 2);
    const areaCode = cleaned.slice(2, 4);
    const firstPart = cleaned.slice(4, 8);
    const secondPart = cleaned.slice(8, 12);
    
    return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Get client full name from client ID
 * @param {string|number} clientId - The client ID to look up
 * @param {Array} clients - Array of client objects
 * @returns {string} Full client name or fallback text
 */
export const getClientName = (clientId, clients = []) => {
  if (!clientId) return 'Sin cliente';
  
  const client = clients.find(c => c.id === clientId || c.id === parseInt(clientId));
  
  if (!client) return `Cliente ${clientId}`;
  
  const fullName = `${client.nombre || ''} ${client.apellido || ''}`.trim();
  return fullName || `Cliente ${clientId}`;
};

/**
 * Get client full info object from client ID
 * @param {string|number} clientId - The client ID to look up
 * @param {Array} clients - Array of client objects
 * @returns {Object|null} Client object or null if not found
 */
export const getClientInfo = (clientId, clients = []) => {
  if (!clientId) return null;
  
  return clients.find(c => c.id === clientId || c.id === parseInt(clientId)) || null;
};

/**
 * Format percentage value
 * @param {number|string} value - Percentage value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return '0%';
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '0%';
  
  return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get operation status badge configuration
 * @param {string} status - Operation status
 * @returns {Object} Badge configuration with bg, text, and label
 */
export const getStatusBadge = (status) => {
  const badges = {
    'pendiente_retiro': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Pendiente de retiro'
    },
    'pendiente_entrega': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      label: 'Pendiente de entrega'
    },
    'realizado': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Realizado'
    },
    'pendiente': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      label: 'Pendiente'
    }
  };
  
  return badges[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: status || 'Sin estado'
  };
};