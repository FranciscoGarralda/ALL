/**
 * Comprehensive error handling system
 * Provides consistent error handling across the application
 */

import { devError, devWarn } from './productionOptimizer';

// Error types
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  CALCULATION: 'CALCULATION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  NETWORK: 'NETWORK_ERROR',
  PARSING: 'PARSING_ERROR',
  BUSINESS_LOGIC: 'BUSINESS_LOGIC_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.userNotificationCallbacks = [];
  }

  // Register callback for user notifications
  onUserNotification(callback) {
    this.userNotificationCallbacks.push(callback);
  }

  // Handle error with context
  handleError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: error.message || error,
      stack: error.stack,
      type: context.type || ERROR_TYPES.VALIDATION,
      severity: context.severity || ERROR_SEVERITY.MEDIUM,
      context: context.context || 'Unknown',
      component: context.component || 'Unknown',
      userId: context.userId || 'anonymous',
      ...context
    };

    // Add to error log
    this.addToLog(errorInfo);

    // Console logging based on severity
    switch (errorInfo.severity) {
      case ERROR_SEVERITY.CRITICAL:
        devError('🚨 CRITICAL ERROR:', errorInfo);
        this.notifyUser('Error crítico detectado. Por favor, recarga la página.', 'error');
        break;
      case ERROR_SEVERITY.HIGH:
        devError('🔴 HIGH SEVERITY ERROR:', errorInfo);
        this.notifyUser('Ha ocurrido un error. Revisa los datos ingresados.', 'warning');
        break;
      case ERROR_SEVERITY.MEDIUM:
        devWarn('🟡 MEDIUM SEVERITY ERROR:', errorInfo);
        break;
      case ERROR_SEVERITY.LOW:
        devWarn('🟢 LOW SEVERITY ERROR:', errorInfo);
        break;
    }

    return errorInfo;
  }

  // Add error to log with size management
  addToLog(errorInfo) {
    this.errorLog.unshift(errorInfo);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }
  }

  // Notify user through registered callbacks
  notifyUser(message, type = 'info') {
    this.userNotificationCallbacks.forEach(callback => {
      try {
        callback(message, type);
      } catch (e) {
        devError('Error in notification callback:', e);
      }
    });
  }

  // Connect with notification system
  connectNotificationSystem(notificationHandler) {
    this.onUserNotification(notificationHandler);
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      byComponent: {},
      recent: this.errorLog.slice(0, 10)
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      stats.byComponent[error.component] = (stats.byComponent[error.component] || 0) + 1;
    });

    return stats;
  }

  // Clear error log
  clearLog() {
    this.errorLog = [];
  }

  // Export errors for debugging
  exportErrors() {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Convenient wrapper functions
export const handleValidationError = (error, context = {}) => {
  return errorHandler.handleError(error, {
    ...context,
    type: ERROR_TYPES.VALIDATION,
    severity: ERROR_SEVERITY.MEDIUM
  });
};

export const handleCalculationError = (error, context = {}) => {
  return errorHandler.handleError(error, {
    ...context,
    type: ERROR_TYPES.CALCULATION,
    severity: ERROR_SEVERITY.HIGH
  });
};

export const handleStorageError = (error, context = {}) => {
  return errorHandler.handleError(error, {
    ...context,
    type: ERROR_TYPES.STORAGE,
    severity: ERROR_SEVERITY.MEDIUM
  });
};

export const handleParsingError = (error, context = {}) => {
  return errorHandler.handleError(error, {
    ...context,
    type: ERROR_TYPES.PARSING,
    severity: ERROR_SEVERITY.HIGH
  });
};

export const handleBusinessLogicError = (error, context = {}) => {
  return errorHandler.handleError(error, {
    ...context,
    type: ERROR_TYPES.BUSINESS_LOGIC,
    severity: ERROR_SEVERITY.HIGH
  });
};

export const handleCriticalError = (error, context = {}) => {
  return errorHandler.handleError(error, {
    ...context,
    severity: ERROR_SEVERITY.CRITICAL
  });
};

// Safe execution wrapper
export const safeExecute = async (fn, context = {}) => {
  try {
    return await fn();
  } catch (error) {
    handleValidationError(error, {
      ...context,
      context: 'Safe execution wrapper'
    });
    return null;
  }
};

// Safe async execution with retry
export const safeExecuteWithRetry = async (fn, maxRetries = 3, context = {}) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        handleValidationError(error, {
          ...context,
          context: `Safe execution with retry (${attempt}/${maxRetries})`
        });
      } else {
        devWarn(`Retry attempt ${attempt}/${maxRetries} failed:`, error.message);
      }
    }
  }
  
  return null;
};

export default errorHandler;