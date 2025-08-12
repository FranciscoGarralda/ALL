/**
 * Production optimization utilities
 * Removes console statements and optimizes performance for production
 */

// Only disable console in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Store original console methods for critical errors
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Disable non-critical console methods
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // Keep warnings and errors but filter them
  console.warn = (...args) => {
    // Only show critical warnings
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('memory leak') ||
      message.includes('High memory usage') ||
      message.includes('Stock insuficiente')
    )) {
      originalWarn(...args);
    }
  };
  
  console.error = (...args) => {
    // Always show errors in production
    originalError(...args);
  };
}

// Development mode - enhanced logging
export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

export const devWarn = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};

export const devError = (...args) => {
  // Always log errors regardless of environment
  console.error(...args);
};

// Performance optimization for production
export const optimizeForProduction = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Disable React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null;
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = null;
    }
    
    // Optimize garbage collection
    if (window.gc) {
      setInterval(() => {
        try {
          window.gc();
        } catch (e) {
          // Ignore if gc is not available
        }
      }, 30000); // Every 30 seconds
    }
  }
};

// Initialize optimization
if (typeof window !== 'undefined') {
  optimizeForProduction();
}

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
  devLog,
  devWarn,
  devError,
  cleanupPatterns,
  optimizeForProduction
};