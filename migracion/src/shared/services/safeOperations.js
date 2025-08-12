/**
 * Safe operations utilities to prevent crashes and NaN errors
 * Critical error prevention for financial operations
 */

/**
 * Safe number parsing with improved decimal handling
 */
export const safeParseFloat = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Convert to string and clean basic characters
  const stringValue = value.toString().replace(/[$\s]/g, '');
  
  // Handle empty string after cleaning
  if (stringValue === '') {
    return defaultValue;
  }
  
  // Improved decimal parsing for Spanish formats
  let cleanValue = stringValue;
  
  // Check if we have both dots and commas
  const hasComma = cleanValue.includes(',');
  const hasDot = cleanValue.includes('.');
  
  if (hasComma && hasDot) {
    // Format like 1.000.000,50 or 1,000,000.50
    const lastCommaIndex = cleanValue.lastIndexOf(',');
    const lastDotIndex = cleanValue.lastIndexOf('.');
    
    if (lastCommaIndex > lastDotIndex) {
      // Spanish format: 1.000.000,50
      // Remove dots (thousands separators) and replace comma with dot
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,000,000.50
      // Remove commas (thousands separators)
      cleanValue = cleanValue.replace(/,/g, '');
    }
  } else if (hasComma && !hasDot) {
    // Only comma - could be decimal separator or thousands separator
    const commaIndex = cleanValue.indexOf(',');
    const afterComma = cleanValue.substring(commaIndex + 1);
    
    // If there are 1-4 digits after comma, treat as decimal separator
    // If more digits or multiple commas, treat as thousands separator
    if (afterComma.length <= 4 && afterComma.length > 0 && !afterComma.includes(',')) {
      cleanValue = cleanValue.replace(',', '.');
    } else {
      // Thousands separator - remove commas
      cleanValue = cleanValue.replace(/,/g, '');
    }
  } else if (hasDot && !hasComma) {
    // Only dots - could be decimal separator or thousands separator
    const parts = cleanValue.split('.');
    
    if (parts.length === 2) {
      // Single dot
      const beforeDot = parts[0];
      const afterDot = parts[1];
      
      // Better heuristic for determining if it's a thousands separator:
      // - If after dot has exactly 3 digits AND before dot has 1-3 digits, likely thousands
      // - BUT if the user is typing and afterDot is still incomplete, keep as decimal
      // - If afterDot has 0, 1, 2, or 4+ digits, it's definitely a decimal
      if (afterDot.length === 3 && beforeDot.length >= 1 && beforeDot.length <= 3) {
        // Additional check: if the number makes more sense as decimal, keep it
        // For example: 10.000 could be 10 with 3 decimal places (uncommon) or 10000 (more likely)
        const asDecimal = parseFloat(cleanValue);
        const asThousands = parseFloat(cleanValue.replace('.', ''));
        
        // If the decimal interpretation is less than 100 and thousands interpretation is >= 1000,
        // it's probably meant to be thousands
        if (asDecimal < 100 && asThousands >= 1000) {
          cleanValue = cleanValue.replace('.', '');
        }
        // Otherwise, keep as decimal (user probably wants 10.000 as a precise decimal)
      }
      // For any other case, keep the dot as decimal separator
    } else if (parts.length > 2) {
      // Multiple dots - thousands separators: 1.000.000
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 3) {
        // All dots are thousands separators
        cleanValue = cleanValue.replace(/\./g, '');
      } else {
        // Last dot might be decimal separator
        const beforeLastDot = parts.slice(0, -1).join('');
        cleanValue = beforeLastDot + '.' + lastPart;
      }
    }
  }
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseInt = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Safe array operations
 */
export const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

export const safeArrayMap = (array, mapFn, defaultValue = []) => {
  if (!Array.isArray(array)) {
    return defaultValue;
  }
  
  try {
    return array.map(mapFn);
  } catch (error) {
    console.warn('Error in safeArrayMap:', error);
    return defaultValue;
  }
};

export const safeArrayFilter = (array, filterFn, defaultValue = []) => {
  if (!Array.isArray(array)) {
    return defaultValue;
  }
  
  try {
    return array.filter(filterFn);
  } catch (error) {
    console.warn('Error in safeArrayFilter:', error);
    return defaultValue;
  }
};

export const safeArrayFind = (array, findFn, defaultValue = null) => {
  if (!Array.isArray(array)) {
    return defaultValue;
  }
  
  try {
    const result = array.find(findFn);
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    console.warn('Error in safeArrayFind:', error);
    return defaultValue;
  }
};

export const safeArrayReduce = (array, reduceFn, initialValue = 0) => {
  if (!Array.isArray(array)) {
    return initialValue;
  }
  
  try {
    return array.reduce(reduceFn, initialValue);
  } catch (error) {
    console.warn('Error in safeArrayReduce:', error);
    return initialValue;
  }
};

/**
 * Safe object operations
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || !(key in result)) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    console.warn('Error in safeGet:', error);
    return defaultValue;
  }
};

/**
 * Safe date operations
 */
export const validateDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }
  
  try {
    // Handle different date formats
    let dateToValidate = dateString;
    
    // If it's in YYYY-MM-DD format, add time to avoid timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      dateToValidate = dateString + 'T12:00:00';
    }
    
    const date = new Date(dateToValidate);
    
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Additional validation: check if the date is reasonable
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn('Error validating date:', error);
    return null;
  }
};

export const formatSafeDate = (dateString, options = {}) => {
  const validDate = validateDate(dateString);
  
  if (!validDate) {
    return options.fallback || 'Fecha inválida';
  }
  
  try {
    const {
      locale = 'es-ES',
      weekday = false,
      format = 'short'
    } = options;
    
    const formatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    if (weekday) {
      formatOptions.weekday = 'long';
    }
    
    return validDate.toLocaleDateString(locale, formatOptions);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return options.fallback || 'Error de formato';
  }
};

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available' };
      }
      
      localStorage.setItem(key, JSON.stringify(value));
      return { success: true };
    } catch (error) {
      console.warn(`Error saving to localStorage (${key}):`, error);
      return { success: false, error: error.message };
    }
  },
  
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') {
        return { success: false, data: defaultValue };
      }
      
      const item = localStorage.getItem(key);
      if (item === null) {
        return { success: true, data: defaultValue };
      }
      
      const parsed = JSON.parse(item);
      return { success: true, data: parsed };
    } catch (error) {
      console.warn(`Error reading from localStorage (${key}):`, error);
      return { success: false, data: defaultValue, error: error.message };
    }
  },
  
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined') {
        return { success: false, error: 'localStorage not available' };
      }
      
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.warn(`Error removing from localStorage (${key}):`, error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Safe financial calculations with improved precision
 */
export const safeCalculation = {
  multiply: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    
    // Use more precise calculation for financial operations
    const result = numA * numB;
    // Round to avoid floating point precision issues
    return Math.round(result * 100000000) / 100000000;
  },
  
  divide: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    
    if (numB === 0) {
      console.warn('Division by zero attempted');
      return 0;
    }
    
    const result = numA / numB;
    // Round to avoid floating point precision issues
    return Math.round(result * 100000000) / 100000000;
  },
  
  add: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    
    const result = numA + numB;
    // Round to avoid floating point precision issues
    return Math.round(result * 100000000) / 100000000;
  },
  
  subtract: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    
    const result = numA - numB;
    // Round to avoid floating point precision issues
    return Math.round(result * 100000000) / 100000000;
  },
  
  percentage: (value, percentage) => {
    const numValue = safeParseFloat(value);
    const numPercentage = safeParseFloat(percentage);
    
    // More precise percentage calculation
    const result = (numValue * numPercentage) / 100;
    // Round to avoid floating point precision issues
    return Math.round(result * 100000000) / 100000000;
  },
  
  // New helper for formatting financial results
  formatFinancial: (value, decimals = 2) => {
    const num = safeParseFloat(value);
    return num.toFixed(decimals);
  }
};

/**
 * Safe string operations
 */
export const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  return String(value);
};

export const safeTrim = (value, defaultValue = '') => {
  const str = safeString(value, defaultValue);
  return str.trim();
};

/**
 * Validation helpers
 */
export const isValidNumber = (value) => {
  const num = safeParseFloat(value, 0);
  return !isNaN(num) && isFinite(num);
};

export const isValidInteger = (value) => {
  const num = parseInt(value, 10);
  return !isNaN(num) && isFinite(num) && num.toString() === value.toString();
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(safeString(email));
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(safeString(phone));
};

/**
 * Error boundary helper
 */
export const safeExecute = (fn, fallback = null, context = 'Unknown') => {
  try {
    return fn();
  } catch (error) {
    console.warn(`Error in ${context}:`, error);
    return fallback;
  }
};

export default {
  safeParseFloat,
  safeParseInt,
  safeArray,
  safeArrayMap,
  safeArrayFilter,
  safeArrayFind,
  safeArrayReduce,
  safeGet,
  validateDate,
  formatSafeDate,
  safeLocalStorage,
  safeCalculation,
  safeString,
  safeTrim,
  isValidNumber,
  isValidInteger,
  isValidEmail,
  isValidPhone,
  safeExecute
};