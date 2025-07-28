/**
 * Performance monitoring and optimization utilities
 * Tracks component performance, memory usage, and provides optimization insights
 */

// Performance metrics storage
const performanceMetrics = {
  componentRenders: new Map(),
  memoryUsage: [],
  navigationTimes: [],
  formValidationTimes: [],
  apiCallTimes: []
};

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  COMPONENT_RENDER: 16, // 60fps = 16.67ms per frame
  NAVIGATION: 100,
  FORM_VALIDATION: 50,
  API_CALL: 1000,
  MEMORY_WARNING: 50 * 1024 * 1024 // 50MB
};

/**
 * High-precision timer for accurate measurements
 */
export class PerformanceTimer {
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.endTime = null;
  }
  
  start() {
    this.startTime = performance.now();
    return this;
  }
  
  end() {
    this.endTime = performance.now();
    return this.getDuration();
  }
  
  getDuration() {
    if (!this.startTime || !this.endTime) {
      return null;
    }
    return this.endTime - this.startTime;
  }
  
  log(threshold = null) {
    const duration = this.getDuration();
    if (duration === null) return;
    
    const shouldLog = threshold ? duration > threshold : true;
    
    if (shouldLog) {
      console.log(`⏱️ ${this.name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
}

/**
 * React component performance tracker
 */
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  return React.memo(React.forwardRef((props, ref) => {
    const renderTimer = React.useRef(null);
    const renderCount = React.useRef(0);
    
    // Track render start
    React.useLayoutEffect(() => {
      renderTimer.current = new PerformanceTimer(`${componentName} render`);
      renderTimer.current.start();
    });
    
    // Track render end
    React.useEffect(() => {
      if (renderTimer.current) {
        const duration = renderTimer.current.end();
        renderCount.current++;
        
        // Store metrics
        if (!performanceMetrics.componentRenders.has(componentName)) {
          performanceMetrics.componentRenders.set(componentName, []);
        }
        
        performanceMetrics.componentRenders.get(componentName).push({
          duration,
          timestamp: Date.now(),
          renderCount: renderCount.current,
          props: Object.keys(props).length
        });
        
        // Warn if render is slow
        if (duration > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
          console.warn(`🐌 Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
        }
      }
    });
    
    return React.createElement(WrappedComponent, { ...props, ref });
  }));
};

/**
 * Memory usage tracker
 */
export const trackMemoryUsage = () => {
  if (!performance.memory) {
    console.warn('Performance.memory not available in this browser');
    return null;
  }
  
  const memoryInfo = {
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit,
    timestamp: Date.now()
  };
  
  performanceMetrics.memoryUsage.push(memoryInfo);
  
  // Keep only last 100 measurements
  if (performanceMetrics.memoryUsage.length > 100) {
    performanceMetrics.memoryUsage.shift();
  }
  
  // Warn if memory usage is high
  if (memoryInfo.used > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
    console.warn(`🧠 High memory usage: ${(memoryInfo.used / 1024 / 1024).toFixed(2)}MB`);
  }
  
  return memoryInfo;
};

/**
 * Navigation performance tracker
 */
export const trackNavigation = (from, to) => {
  const timer = new PerformanceTimer(`Navigation: ${from} → ${to}`);
  timer.start();
  
  return {
    end: () => {
      const duration = timer.end();
      
      performanceMetrics.navigationTimes.push({
        from,
        to,
        duration,
        timestamp: Date.now()
      });
      
      if (duration > PERFORMANCE_THRESHOLDS.NAVIGATION) {
        console.warn(`🚀 Slow navigation: ${from} → ${to} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  };
};

/**
 * Form validation performance tracker
 */
export const trackFormValidation = (formName, fieldCount) => {
  const timer = new PerformanceTimer(`Form validation: ${formName}`);
  timer.start();
  
  return {
    end: () => {
      const duration = timer.end();
      
      performanceMetrics.formValidationTimes.push({
        formName,
        fieldCount,
        duration,
        timestamp: Date.now()
      });
      
      if (duration > PERFORMANCE_THRESHOLDS.FORM_VALIDATION) {
        console.warn(`📝 Slow form validation: ${formName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  };
};

/**
 * API call performance tracker
 */
export const trackApiCall = (endpoint, method = 'GET') => {
  const timer = new PerformanceTimer(`API: ${method} ${endpoint}`);
  timer.start();
  
  return {
    end: (success = true, responseSize = 0) => {
      const duration = timer.end();
      
      performanceMetrics.apiCallTimes.push({
        endpoint,
        method,
        duration,
        success,
        responseSize,
        timestamp: Date.now()
      });
      
      if (duration > PERFORMANCE_THRESHOLDS.API_CALL) {
        console.warn(`🌐 Slow API call: ${method} ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
  };
};

/**
 * Performance report generator
 */
export const generatePerformanceReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalComponents: performanceMetrics.componentRenders.size,
      totalRenders: Array.from(performanceMetrics.componentRenders.values())
        .reduce((sum, renders) => sum + renders.length, 0),
      memorySnapshots: performanceMetrics.memoryUsage.length,
      navigationEvents: performanceMetrics.navigationTimes.length,
      validationEvents: performanceMetrics.formValidationTimes.length,
      apiCalls: performanceMetrics.apiCallTimes.length
    },
    components: {},
    memory: {
      current: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      history: performanceMetrics.memoryUsage.slice(-10) // Last 10 measurements
    },
    slowComponents: [],
    recommendations: []
  };
  
  // Analyze component performance
  for (const [componentName, renders] of performanceMetrics.componentRenders) {
    const avgRenderTime = renders.reduce((sum, r) => sum + r.duration, 0) / renders.length;
    const slowRenders = renders.filter(r => r.duration > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER);
    
    report.components[componentName] = {
      totalRenders: renders.length,
      averageRenderTime: Math.round(avgRenderTime * 100) / 100,
      slowRenders: slowRenders.length,
      lastRender: renders[renders.length - 1]
    };
    
    if (slowRenders.length > 0) {
      report.slowComponents.push({
        name: componentName,
        slowRenderCount: slowRenders.length,
        averageSlowTime: Math.round(
          (slowRenders.reduce((sum, r) => sum + r.duration, 0) / slowRenders.length) * 100
        ) / 100
      });
    }
  }
  
  // Generate recommendations
  if (report.slowComponents.length > 0) {
    report.recommendations.push({
      type: 'performance',
      priority: 'high',
      message: `${report.slowComponents.length} components have slow renders. Consider using React.memo, useMemo, or useCallback.`
    });
  }
  
  if (performance.memory && performance.memory.usedJSHeapSize > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
    report.recommendations.push({
      type: 'memory',
      priority: 'medium',
      message: 'High memory usage detected. Check for memory leaks or consider lazy loading.'
    });
  }
  
  const slowNavigations = performanceMetrics.navigationTimes.filter(
    n => n.duration > PERFORMANCE_THRESHOLDS.NAVIGATION
  );
  
  if (slowNavigations.length > 0) {
    report.recommendations.push({
      type: 'navigation',
      priority: 'medium',
      message: `${slowNavigations.length} slow navigation events detected. Consider code splitting or preloading.`
    });
  }
  
  return report;
};

/**
 * Performance monitoring hook for React components
 */
export const usePerformanceMonitor = (componentName) => {
  const renderCount = React.useRef(0);
  const mountTime = React.useRef(null);
  
  React.useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      if (mountTime.current) {
        const lifetime = performance.now() - mountTime.current;
        console.log(`📊 ${componentName} lifetime: ${lifetime.toFixed(2)}ms, renders: ${renderCount.current}`);
      }
    };
  }, [componentName]);
  
  React.useEffect(() => {
    renderCount.current++;
  });
  
  const trackOperation = React.useCallback((operationName) => {
    return new PerformanceTimer(`${componentName}: ${operationName}`);
  }, [componentName]);
  
  return {
    renderCount: renderCount.current,
    trackOperation,
    trackMemory: trackMemoryUsage
  };
};

/**
 * Debounced performance tracker for high-frequency events
 */
export const createDebouncedTracker = (trackingFunction, delay = 100) => {
  let timeoutId = null;
  let pendingCalls = [];
  
  return (...args) => {
    pendingCalls.push(args);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const timer = new PerformanceTimer(`Batched operation (${pendingCalls.length} calls)`);
      timer.start();
      
      // Process all pending calls
      pendingCalls.forEach(callArgs => {
        trackingFunction(...callArgs);
      });
      
      timer.end();
      pendingCalls = [];
      timeoutId = null;
    }, delay);
  };
};

/**
 * Clear performance metrics (useful for testing or memory management)
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.componentRenders.clear();
  performanceMetrics.memoryUsage.length = 0;
  performanceMetrics.navigationTimes.length = 0;
  performanceMetrics.formValidationTimes.length = 0;
  performanceMetrics.apiCallTimes.length = 0;
};

/**
 * Export performance data for external analysis
 */
export const exportPerformanceData = () => {
  return {
    ...performanceMetrics,
    componentRenders: Object.fromEntries(performanceMetrics.componentRenders),
    exportTime: Date.now()
  };
};

// Auto-track memory usage every 30 seconds in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  setInterval(() => {
    trackMemoryUsage();
  }, 30000);
}