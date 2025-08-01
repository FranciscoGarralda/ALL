/**
 * Intelligent lazy loading system with predictive preloading
 * Optimizes component loading based on user behavior and usage patterns
 */

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { trackNavigation } from './performance';

// Loading states for better UX
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
  PRELOADING: 'preloading'
};

// Component usage analytics
const componentUsage = new Map();
const preloadQueue = new Set();
const loadedComponents = new Map();

/**
 * Enhanced lazy loading with analytics and preloading
 */
export const createLazyComponent = (importFunction, componentName, options = {}) => {
  const {
    preloadDelay = 2000,
    enablePreload = true,
    fallback = null,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  // Track component usage
  const trackUsage = () => {
    const usage = componentUsage.get(componentName) || {
      loadCount: 0,
      lastLoaded: null,
      averageLoadTime: 0,
      errors: 0
    };
    
    usage.loadCount++;
    usage.lastLoaded = Date.now();
    componentUsage.set(componentName, usage);
  };

  // Retry mechanism for failed loads
  const loadWithRetry = async (attempt = 1) => {
    try {
      const startTime = performance.now();
      const module = await importFunction();
      const loadTime = performance.now() - startTime;
      
      // Update usage analytics
      const usage = componentUsage.get(componentName) || { averageLoadTime: 0, loadCount: 0 };
      usage.averageLoadTime = (usage.averageLoadTime * (usage.loadCount - 1) + loadTime) / usage.loadCount;
      componentUsage.set(componentName, usage);
      
      loadedComponents.set(componentName, module);
      return module;
    } catch (error) {
      console.warn(`Failed to load ${componentName} (attempt ${attempt}):`, error);
      
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return loadWithRetry(attempt + 1);
      }
      
      // Update error count
      const usage = componentUsage.get(componentName) || { errors: 0 };
      usage.errors++;
      componentUsage.set(componentName, usage);
      
      throw error;
    }
  };

  // Create lazy component with enhanced features
  const LazyComponent = React.lazy(() => {
    trackUsage();
    return loadWithRetry();
  });

  // Preload function
  const preload = () => {
    if (!loadedComponents.has(componentName) && !preloadQueue.has(componentName)) {
      preloadQueue.add(componentName);
      
      setTimeout(() => {
        loadWithRetry().then(() => {
          preloadQueue.delete(componentName);
        }).catch(() => {
          preloadQueue.delete(componentName);
        });
      }, preloadDelay);
    }
  };

  // Enhanced wrapper component
  const EnhancedLazyComponent = React.forwardRef((props, ref) => {
    const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
    const navigationTracker = useRef(null);

    useEffect(() => {
      // Start navigation tracking
      navigationTracker.current = trackNavigation('LazyLoad', componentName);
      setLoadingState(LOADING_STATES.LOADING);

      return () => {
        // End navigation tracking
        if (navigationTracker.current) {
          navigationTracker.current.end();
        }
      };
    }, []);

    const handleLoad = () => {
      setLoadingState(LOADING_STATES.LOADED);
      if (navigationTracker.current) {
        navigationTracker.current.end();
      }
    };

    const handleError = (error) => {
      setLoadingState(LOADING_STATES.ERROR);
      console.error(`Error loading ${componentName}:`, error);
    };

    // Enhanced fallback with loading state
    const enhancedFallback = fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-sm text-gray-600">Cargando {componentName}...</p>
          {loadingState === LOADING_STATES.ERROR && (
            <p className="text-xs text-red-600">Error al cargar. Reintentando...</p>
          )}
        </div>
      </div>
    );

    return (
      <Suspense fallback={enhancedFallback}>
        <LazyComponent 
          {...props} 
          ref={ref}
          onLoad={handleLoad}
          onError={handleError}
        />
      </Suspense>
    );
  });

  // Attach preload method
  EnhancedLazyComponent.preload = preload;
  EnhancedLazyComponent.componentName = componentName;

  return EnhancedLazyComponent;
};

/**
 * Predictive preloader based on user behavior
 */
export class PredictivePreloader {
  constructor() {
    this.userPatterns = new Map();
    this.currentRoute = null;
    this.sessionStartTime = Date.now();
  }

  // Track user navigation patterns
  trackNavigation(from, to) {
    if (!this.userPatterns.has(from)) {
      this.userPatterns.set(from, new Map());
    }
    
    const fromPatterns = this.userPatterns.get(from);
    const currentCount = fromPatterns.get(to) || 0;
    fromPatterns.set(to, currentCount + 1);
    
    this.currentRoute = to;
  }

  // Get likely next destinations
  getPredictedRoutes(currentRoute, threshold = 0.3) {
    const patterns = this.userPatterns.get(currentRoute);
    if (!patterns) return [];

    const total = Array.from(patterns.values()).reduce((sum, count) => sum + count, 0);
    const predictions = [];

    for (const [route, count] of patterns) {
      const probability = count / total;
      if (probability >= threshold) {
        predictions.push({ route, probability });
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  // Preload predicted components
  preloadPredicted(componentMap) {
    const predictions = this.getPredictedRoutes(this.currentRoute);
    
    predictions.forEach(({ route, probability }) => {
      const component = componentMap[route];
      if (component && component.preload) {
        console.log(`🔮 Preloading ${route} (${(probability * 100).toFixed(1)}% probability)`);
        component.preload();
      }
    });
  }
}

// Global preloader instance
export const globalPreloader = new PredictivePreloader();

/**
 * Hook for intelligent preloading
 */
export const useIntelligentPreloading = (componentMap, options = {}) => {
  const { enablePredictive = true, preloadThreshold = 0.3 } = options;
  
  useEffect(() => {
    if (!enablePredictive) return;

    const preloadTimer = setTimeout(() => {
      globalPreloader.preloadPredicted(componentMap);
    }, 1000);

    return () => clearTimeout(preloadTimer);
  }, [componentMap, enablePredictive, preloadThreshold]);
};

/**
 * Intersection Observer based preloading
 */
export const useVisibilityPreloader = (componentRef, component) => {
  useEffect(() => {
    if (!componentRef.current || !component.preload) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            component.preload();
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' } // Preload when component is 100px away
    );

    observer.observe(componentRef.current);

    return () => observer.disconnect();
  }, [componentRef, component]);
};

/**
 * Bundle analyzer for optimization insights
 */
export const analyzeBundleUsage = () => {
  const analysis = {
    totalComponents: componentUsage.size,
    loadedComponents: loadedComponents.size,
    averageLoadTime: 0,
    mostUsedComponents: [],
    slowestComponents: [],
    errorProneComponents: [],
    recommendations: []
  };

  let totalLoadTime = 0;
  let totalLoads = 0;

  for (const [componentName, usage] of componentUsage) {
    totalLoadTime += usage.averageLoadTime * usage.loadCount;
    totalLoads += usage.loadCount;

    // Most used components
    analysis.mostUsedComponents.push({
      name: componentName,
      loadCount: usage.loadCount,
      lastLoaded: usage.lastLoaded
    });

    // Slowest components
    if (usage.averageLoadTime > 100) {
      analysis.slowestComponents.push({
        name: componentName,
        averageLoadTime: usage.averageLoadTime,
        loadCount: usage.loadCount
      });
    }

    // Error prone components
    if (usage.errors > 0) {
      analysis.errorProneComponents.push({
        name: componentName,
        errors: usage.errors,
        errorRate: usage.errors / usage.loadCount
      });
    }
  }

  analysis.averageLoadTime = totalLoads > 0 ? totalLoadTime / totalLoads : 0;

  // Sort arrays
  analysis.mostUsedComponents.sort((a, b) => b.loadCount - a.loadCount);
  analysis.slowestComponents.sort((a, b) => b.averageLoadTime - a.averageLoadTime);
  analysis.errorProneComponents.sort((a, b) => b.errorRate - a.errorRate);

  // Generate recommendations
  if (analysis.slowestComponents.length > 0) {
    analysis.recommendations.push({
      type: 'performance',
      priority: 'high',
      message: `Consider optimizing ${analysis.slowestComponents[0].name} - average load time: ${analysis.slowestComponents[0].averageLoadTime.toFixed(2)}ms`
    });
  }

  if (analysis.errorProneComponents.length > 0) {
    analysis.recommendations.push({
      type: 'reliability',
      priority: 'high',
      message: `${analysis.errorProneComponents[0].name} has ${analysis.errorProneComponents[0].errors} load errors`
    });
  }

  if (analysis.loadedComponents / analysis.totalComponents < 0.5) {
    analysis.recommendations.push({
      type: 'optimization',
      priority: 'medium',
      message: 'Consider implementing more aggressive preloading for frequently used components'
    });
  }

  return analysis;
};

/**
 * Advanced loading fallback component
 */
export const AdvancedLoadingFallback = ({ 
  componentName, 
  estimatedLoadTime = 1000,
  showProgress = true 
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      if (showProgress) {
        const progressPercent = Math.min((elapsed / estimatedLoadTime) * 100, 95);
        setProgress(progressPercent);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [estimatedLoadTime, showProgress]);

  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <div className="flex flex-col items-center space-y-4 max-w-sm">
        {/* Animated loader */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
          {showProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-primary-600">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>

        {/* Component info */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            Cargando {componentName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {elapsedTime < 1000 
              ? 'Preparando componente...' 
              : 'Esto está tomando más tiempo del esperado'
            }
          </p>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Long loading warning */}
        {elapsedTime > 3000 && (
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              La carga está tomando más tiempo del esperado. 
              Esto puede deberse a una conexión lenta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Export usage analytics
 */
export const exportLazyLoadingAnalytics = () => {
  return {
    componentUsage: Object.fromEntries(componentUsage),
    loadedComponents: Array.from(loadedComponents.keys()),
    preloadQueue: Array.from(preloadQueue),
    userPatterns: Object.fromEntries(
      Array.from(globalPreloader.userPatterns.entries()).map(([key, value]) => [
        key,
        Object.fromEntries(value)
      ])
    ),
    analysis: analyzeBundleUsage(),
    exportTime: Date.now()
  };
};