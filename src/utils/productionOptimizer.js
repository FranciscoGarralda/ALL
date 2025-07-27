/**
 * Production code optimizer
 * Removes console statements and optimizes code for production
 */

// Remove console statements in production
const removeConsoleStatements = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Override console methods in production
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
};

// Initialize production optimizations
if (typeof window !== 'undefined') {
  removeConsoleStatements();
}

/**
 * Performance optimized logger for development
 */
export const devLogger = {
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, but format them better in production
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    } else {
      // In production, log to error reporting service
      // For now, silent handling
    }
  }
};

/**
 * Clean up unused code patterns
 */
export const cleanupPatterns = {
  // Remove debug comments
  removeDebugComments: (code) => {
    return code.replace(/\/\/ DEBUG:.*$/gm, '');
  },
  
  // Remove TODO comments in production
  removeTodoComments: (code) => {
    if (process.env.NODE_ENV === 'production') {
      return code.replace(/\/\/ TODO:.*$/gm, '');
    }
    return code;
  },
  
  // Optimize import statements
  optimizeImports: (code) => {
    // Remove unused React import if only using JSX
    return code.replace(/import React,\s*{([^}]+)}\s*from\s*['"]react['"]/, 'import { $1 } from "react"');
  }
};

export default {
  devLogger,
  cleanupPatterns,
  removeConsoleStatements
};