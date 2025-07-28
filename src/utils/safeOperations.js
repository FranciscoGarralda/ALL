/**
 * Safe operations utilities to prevent crashes and NaN errors
 * Critical error prevention for financial operations
 */

/**
 * Safe number parsing with validation
 */
export const safeParseFloat = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Convert to string and remove any currency formatting
  const stringValue = value.toString().replace(/[$\s]/g, ''); // Remove $ and spaces
  
  // Simple and reliable approach: 
  // If it contains comma, treat as Spanish format (1.290,50)
  // If it ends with .00, and has more than 3 digits before, treat as thousands (1290.00 -> 1290)
  // Otherwise, treat dots as decimals
  let cleanValue;
  
  if (stringValue.includes(',')) {
    // Spanish format: 1.290,50 -> 1290.50
    cleanValue = stringValue.replace(/\./g, '').replace(',', '.');
  } else if (stringValue.includes('.')) {
    // Handle dots - could be thousands separators or decimals
    const parts = stringValue.split('.');
    if (parts.length === 2 && parts[1].length <= 2 && parts[1].match(/^0+$/)) {
      // Ends with .00 or .0 -> remove decimal part (1290.00 -> 1290)
      cleanValue = stringValue.replace(/\.0+$/, '');
    } else if (parts.length === 2 && parts[1].length <= 2 && !parts[1].match(/^0+$/)) {
      // Has genuine decimal digits (like .45, .25), keep as decimal
      cleanValue = stringValue;
    } else {
      // Multiple dots or patterns like "129.000" -> remove all dots (thousands separators)
      cleanValue = stringValue.replace(/\./g, '');
    }
  } else {
    // No separators - keep as is
    cleanValue = stringValue;
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
      dateToValidate = dateString + 'T00:00:00';
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
        return defaultValue;
      }
      
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
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
 * Safe financial calculations
 */
export const safeCalculation = {
  multiply: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    return numA * numB;
  },
  
  divide: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    
    if (numB === 0) {
      console.warn('Division by zero attempted');
      return 0;
    }
    
    return numA / numB;
  },
  
  add: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    return numA + numB;
  },
  
  subtract: (a, b) => {
    const numA = safeParseFloat(a);
    const numB = safeParseFloat(b);
    return numA - numB;
  },
  
  percentage: (value, percentage) => {
    const numValue = safeParseFloat(value);
    const numPercentage = safeParseFloat(percentage);
    return (numValue * numPercentage) / 100;
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
  const num = parseFloat(value);
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