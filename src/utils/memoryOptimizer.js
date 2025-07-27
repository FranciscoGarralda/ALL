/**
 * Advanced memory optimization system
 * Prevents memory leaks, manages component lifecycle, and optimizes memory usage
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';

// Memory usage tracking
const memoryMetrics = {
  componentInstances: new Map(),
  eventListeners: new Map(),
  timers: new Set(),
  subscriptions: new Set(),
  caches: new Map(),
  lastCleanup: Date.now()
};

// Memory thresholds
const MEMORY_THRESHOLDS = {
  COMPONENT_INSTANCES: 50,
  EVENT_LISTENERS: 100,
  CACHE_SIZE: 10 * 1024 * 1024, // 10MB
  CLEANUP_INTERVAL: 30000, // 30 seconds
  FORCE_CLEANUP_THRESHOLD: 100 * 1024 * 1024 // 100MB
};

/**
 * Component lifecycle manager for memory optimization
 */
export class ComponentLifecycleManager {
  constructor() {
    this.instances = new Map();
    this.cleanupTasks = new Map();
  }

  // Register component instance
  registerComponent(componentName, instanceId, cleanupFn) {
    if (!this.instances.has(componentName)) {
      this.instances.set(componentName, new Set());
    }
    
    this.instances.get(componentName).add(instanceId);
    
    if (cleanupFn) {
      this.cleanupTasks.set(instanceId, cleanupFn);
    }

    // Update metrics
    memoryMetrics.componentInstances.set(componentName, 
      (memoryMetrics.componentInstances.get(componentName) || 0) + 1
    );

    // Check for memory leaks
    this.checkForLeaks(componentName);
  }

  // Unregister component instance
  unregisterComponent(componentName, instanceId) {
    if (this.instances.has(componentName)) {
      this.instances.get(componentName).delete(instanceId);
      
      if (this.instances.get(componentName).size === 0) {
        this.instances.delete(componentName);
      }
    }

    // Run cleanup tasks
    const cleanupFn = this.cleanupTasks.get(instanceId);
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (error) {
        console.warn(`Cleanup error for ${componentName}:`, error);
      }
      this.cleanupTasks.delete(instanceId);
    }

    // Update metrics
    const currentCount = memoryMetrics.componentInstances.get(componentName) || 0;
    if (currentCount > 0) {
      memoryMetrics.componentInstances.set(componentName, currentCount - 1);
    }
  }

  // Check for potential memory leaks
  checkForLeaks(componentName) {
    const instanceCount = this.instances.get(componentName)?.size || 0;
    
    if (instanceCount > MEMORY_THRESHOLDS.COMPONENT_INSTANCES) {
      console.warn(`⚠️ Potential memory leak: ${componentName} has ${instanceCount} instances`);
      
      // Force cleanup of oldest instances
      this.forceCleanupOldInstances(componentName);
    }
  }

  // Force cleanup of old instances
  forceCleanupOldInstances(componentName) {
    const instances = this.instances.get(componentName);
    if (!instances) return;

    const instancesArray = Array.from(instances);
    const oldInstances = instancesArray.slice(0, Math.floor(instancesArray.length / 2));
    
    oldInstances.forEach(instanceId => {
      this.unregisterComponent(componentName, instanceId);
    });
  }

  // Get component statistics
  getStats() {
    const stats = {
      totalComponents: this.instances.size,
      totalInstances: 0,
      componentBreakdown: {},
      potentialLeaks: []
    };

    for (const [componentName, instances] of this.instances) {
      const count = instances.size;
      stats.totalInstances += count;
      stats.componentBreakdown[componentName] = count;

      if (count > MEMORY_THRESHOLDS.COMPONENT_INSTANCES) {
        stats.potentialLeaks.push({
          component: componentName,
          instances: count,
          severity: count > MEMORY_THRESHOLDS.COMPONENT_INSTANCES * 2 ? 'high' : 'medium'
        });
      }
    }

    return stats;
  }
}

// Global lifecycle manager
export const lifecycleManager = new ComponentLifecycleManager();

/**
 * Memory-optimized React hook for component lifecycle
 */
export const useMemoryOptimizedLifecycle = (componentName) => {
  const instanceId = useRef(`${componentName}_${Date.now()}_${Math.random()}`);
  const cleanupTasks = useRef([]);

  useEffect(() => {
    const cleanup = () => {
      cleanupTasks.current.forEach(task => {
        try {
          task();
        } catch (error) {
          console.warn(`Cleanup task error in ${componentName}:`, error);
        }
      });
      cleanupTasks.current = [];
    };

    lifecycleManager.registerComponent(componentName, instanceId.current, cleanup);

    return () => {
      lifecycleManager.unregisterComponent(componentName, instanceId.current);
    };
  }, [componentName]);

  const addCleanupTask = useCallback((task) => {
    cleanupTasks.current.push(task);
  }, []);

  return { addCleanupTask, instanceId: instanceId.current };
};

/**
 * Event listener manager with automatic cleanup
 */
export class EventListenerManager {
  constructor() {
    this.listeners = new Map();
  }

  // Add event listener with automatic cleanup
  addEventListener(element, event, handler, options, componentId) {
    const listenerId = `${componentId}_${event}_${Date.now()}`;
    
    // Wrap handler to track usage
    const wrappedHandler = (...args) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`Event handler error (${event}):`, error);
      }
    };

    element.addEventListener(event, wrappedHandler, options);

    // Store for cleanup
    this.listeners.set(listenerId, {
      element,
      event,
      handler: wrappedHandler,
      options,
      componentId,
      addedAt: Date.now()
    });

    // Update metrics
    const componentListeners = memoryMetrics.eventListeners.get(componentId) || 0;
    memoryMetrics.eventListeners.set(componentId, componentListeners + 1);

    return listenerId;
  }

  // Remove specific event listener
  removeEventListener(listenerId) {
    const listener = this.listeners.get(listenerId);
    if (!listener) return;

    listener.element.removeEventListener(listener.event, listener.handler, listener.options);
    this.listeners.delete(listenerId);

    // Update metrics
    const componentListeners = memoryMetrics.eventListeners.get(listener.componentId) || 0;
    if (componentListeners > 0) {
      memoryMetrics.eventListeners.set(listener.componentId, componentListeners - 1);
    }
  }

  // Remove all listeners for a component
  removeComponentListeners(componentId) {
    const toRemove = [];
    
    for (const [listenerId, listener] of this.listeners) {
      if (listener.componentId === componentId) {
        toRemove.push(listenerId);
      }
    }

    toRemove.forEach(id => this.removeEventListener(id));
  }

  // Get listener statistics
  getStats() {
    const stats = {
      totalListeners: this.listeners.size,
      byComponent: {},
      oldListeners: []
    };

    const now = Date.now();
    const OLD_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    for (const [listenerId, listener] of this.listeners) {
      // Count by component
      stats.byComponent[listener.componentId] = 
        (stats.byComponent[listener.componentId] || 0) + 1;

      // Check for old listeners
      if (now - listener.addedAt > OLD_THRESHOLD) {
        stats.oldListeners.push({
          id: listenerId,
          component: listener.componentId,
          event: listener.event,
          age: now - listener.addedAt
        });
      }
    }

    return stats;
  }
}

// Global event listener manager
export const eventListenerManager = new EventListenerManager();

/**
 * Hook for memory-safe event listeners
 */
export const useMemorySafeEventListener = (componentName) => {
  const { instanceId, addCleanupTask } = useMemoryOptimizedLifecycle(componentName);

  const addEventListener = useCallback((element, event, handler, options) => {
    const listenerId = eventListenerManager.addEventListener(
      element, event, handler, options, instanceId
    );

    // Add to cleanup tasks
    addCleanupTask(() => {
      eventListenerManager.removeEventListener(listenerId);
    });

    return listenerId;
  }, [instanceId, addCleanupTask]);

  const removeEventListener = useCallback((listenerId) => {
    eventListenerManager.removeEventListener(listenerId);
  }, []);

  return { addEventListener, removeEventListener };
};

/**
 * Timer manager with automatic cleanup
 */
export class TimerManager {
  constructor() {
    this.timers = new Map();
  }

  // Create timer with automatic cleanup
  setTimeout(callback, delay, componentId) {
    const timerId = setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Timer callback error:`, error);
      } finally {
        this.timers.delete(timerId);
        memoryMetrics.timers.delete(timerId);
      }
    }, delay);

    this.timers.set(timerId, {
      type: 'timeout',
      componentId,
      createdAt: Date.now(),
      delay
    });

    memoryMetrics.timers.add(timerId);
    return timerId;
  }

  // Create interval with automatic cleanup
  setInterval(callback, interval, componentId) {
    const intervalId = setInterval(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Interval callback error:`, error);
      }
    }, interval);

    this.timers.set(intervalId, {
      type: 'interval',
      componentId,
      createdAt: Date.now(),
      interval
    });

    memoryMetrics.timers.add(intervalId);
    return intervalId;
  }

  // Clear timer
  clearTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (!timer) return;

    if (timer.type === 'timeout') {
      clearTimeout(timerId);
    } else if (timer.type === 'interval') {
      clearInterval(timerId);
    }

    this.timers.delete(timerId);
    memoryMetrics.timers.delete(timerId);
  }

  // Clear all timers for component
  clearComponentTimers(componentId) {
    const toRemove = [];
    
    for (const [timerId, timer] of this.timers) {
      if (timer.componentId === componentId) {
        toRemove.push(timerId);
      }
    }

    toRemove.forEach(id => this.clearTimer(id));
  }

  // Get timer statistics
  getStats() {
    return {
      totalTimers: this.timers.size,
      byType: {
        timeout: Array.from(this.timers.values()).filter(t => t.type === 'timeout').length,
        interval: Array.from(this.timers.values()).filter(t => t.type === 'interval').length
      },
      byComponent: Array.from(this.timers.values()).reduce((acc, timer) => {
        acc[timer.componentId] = (acc[timer.componentId] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Global timer manager
export const timerManager = new TimerManager();

/**
 * Hook for memory-safe timers
 */
export const useMemorySafeTimers = (componentName) => {
  const { instanceId, addCleanupTask } = useMemoryOptimizedLifecycle(componentName);

  const setTimeout = useCallback((callback, delay) => {
    const timerId = timerManager.setTimeout(callback, delay, instanceId);
    
    addCleanupTask(() => {
      timerManager.clearTimer(timerId);
    });

    return timerId;
  }, [instanceId, addCleanupTask]);

  const setInterval = useCallback((callback, interval) => {
    const intervalId = timerManager.setInterval(callback, interval, instanceId);
    
    addCleanupTask(() => {
      timerManager.clearTimer(intervalId);
    });

    return intervalId;
  }, [instanceId, addCleanupTask]);

  const clearTimer = useCallback((timerId) => {
    timerManager.clearTimer(timerId);
  }, []);

  return { setTimeout, setInterval, clearTimer };
};

/**
 * Intelligent cache with memory limits
 */
export class MemoryCache {
  constructor(maxSize = MEMORY_THRESHOLDS.CACHE_SIZE, maxAge = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
    this.currentSize = 0;
  }

  // Estimate object size in bytes
  estimateSize(obj) {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  }

  // Set cache entry
  set(key, value, customTTL) {
    const size = this.estimateSize(value);
    const ttl = customTTL || this.maxAge;
    const expiresAt = Date.now() + ttl;

    // Check if adding this would exceed size limit
    if (this.currentSize + size > this.maxSize) {
      this.evictLRU(size);
    }

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.currentSize -= this.cache.get(key).size;
    }

    this.cache.set(key, {
      value,
      size,
      expiresAt,
      accessedAt: Date.now(),
      accessCount: 0
    });

    this.currentSize += size;
  }

  // Get cache entry
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessedAt = Date.now();
    entry.accessCount++;

    return entry.value;
  }

  // Delete cache entry
  delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  // Evict least recently used entries
  evictLRU(requiredSpace) {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.accessedAt - b.accessedAt);

    let freedSpace = 0;
    for (const [key, entry] of entries) {
      this.delete(key);
      freedSpace += entry.size;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }
  }

  // Clear expired entries
  clearExpired() {
    const now = Date.now();
    const toDelete = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.delete(key));
  }

  // Get cache statistics
  getStats() {
    this.clearExpired(); // Clean up first

    return {
      size: this.cache.size,
      memoryUsage: this.currentSize,
      memoryLimit: this.maxSize,
      utilizationPercent: (this.currentSize / this.maxSize) * 100,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        size: entry.size,
        accessCount: entry.accessCount,
        age: Date.now() - (entry.expiresAt - this.maxAge)
      }))
    };
  }

  // Clear all entries
  clear() {
    this.cache.clear();
    this.currentSize = 0;
  }
}

// Global cache instances
export const globalCache = new MemoryCache();
export const formCache = new MemoryCache(5 * 1024 * 1024); // 5MB for form data
export const componentCache = new MemoryCache(10 * 1024 * 1024); // 10MB for components

/**
 * Hook for memory-safe caching
 */
export const useMemoryCache = (cacheName = 'default') => {
  const cache = useMemo(() => {
    switch (cacheName) {
      case 'form': return formCache;
      case 'component': return componentCache;
      default: return globalCache;
    }
  }, [cacheName]);

  const set = useCallback((key, value, ttl) => {
    cache.set(key, value, ttl);
  }, [cache]);

  const get = useCallback((key) => {
    return cache.get(key);
  }, [cache]);

  const remove = useCallback((key) => {
    cache.delete(key);
  }, [cache]);

  return { set, get, remove, stats: cache.getStats() };
};

/**
 * Automatic memory cleanup system
 */
export const startMemoryCleanup = () => {
  const cleanup = () => {
    try {
      // Clear expired cache entries
      globalCache.clearExpired();
      formCache.clearExpired();
      componentCache.clearExpired();

      // Check memory usage
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize;
        
        if (memoryUsage > MEMORY_THRESHOLDS.FORCE_CLEANUP_THRESHOLD) {
          console.warn(`🧠 High memory usage detected: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`);
          
          // Force aggressive cleanup
          globalCache.clear();
          formCache.evictLRU(formCache.currentSize * 0.5); // Remove 50%
          componentCache.evictLRU(componentCache.currentSize * 0.3); // Remove 30%
        }
      }

      memoryMetrics.lastCleanup = Date.now();
    } catch (error) {
      console.error('Memory cleanup error:', error);
    }
  };

  // Run cleanup every 30 seconds
  const intervalId = setInterval(cleanup, MEMORY_THRESHOLDS.CLEANUP_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

/**
 * Generate memory optimization report
 */
export const generateMemoryReport = () => {
  return {
    timestamp: new Date().toISOString(),
    browser: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    } : null,
    components: lifecycleManager.getStats(),
    eventListeners: eventListenerManager.getStats(),
    timers: timerManager.getStats(),
    caches: {
      global: globalCache.getStats(),
      form: formCache.getStats(),
      component: componentCache.getStats()
    },
    recommendations: generateMemoryRecommendations()
  };
};

/**
 * Generate memory optimization recommendations
 */
const generateMemoryRecommendations = () => {
  const recommendations = [];
  const componentStats = lifecycleManager.getStats();
  const listenerStats = eventListenerManager.getStats();
  const timerStats = timerManager.getStats();

  // Component recommendations
  if (componentStats.potentialLeaks.length > 0) {
    recommendations.push({
      type: 'memory-leak',
      priority: 'high',
      message: `Potential memory leaks detected in ${componentStats.potentialLeaks.length} components`,
      details: componentStats.potentialLeaks
    });
  }

  // Event listener recommendations
  if (listenerStats.totalListeners > MEMORY_THRESHOLDS.EVENT_LISTENERS) {
    recommendations.push({
      type: 'event-listeners',
      priority: 'medium',
      message: `High number of event listeners (${listenerStats.totalListeners}). Consider cleanup optimization.`
    });
  }

  // Timer recommendations
  if (timerStats.totalTimers > 20) {
    recommendations.push({
      type: 'timers',
      priority: 'medium',
      message: `Many active timers (${timerStats.totalTimers}). Ensure proper cleanup.`
    });
  }

  // Cache recommendations
  const cacheStats = globalCache.getStats();
  if (cacheStats.utilizationPercent > 80) {
    recommendations.push({
      type: 'cache',
      priority: 'medium',
      message: `Cache utilization high (${cacheStats.utilizationPercent.toFixed(1)}%). Consider increasing limits or more aggressive eviction.`
    });
  }

  return recommendations;
};

// Start automatic cleanup in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  startMemoryCleanup();
}