/**
 * Performance monitoring utilities for production
 */

import { logger } from './error-handler';
import { isProduction } from './env-validation';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    try {
      // Observe Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.recordMetric('LCP', lastEntry.startTime, {
            element: lastEntry.element?.tagName,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime, {
              eventType: entry.name,
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      }
    } catch (error) {
      logger.error('Failed to initialize performance observers', error);
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log in development, send to analytics in production
    if (isProduction()) {
      this.sendToAnalytics(metric);
    } else {
      logger.debug('Performance metric recorded', { 
        name: metric.name, 
        value: metric.value, 
        timestamp: metric.timestamp 
      });
    }
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(`function_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`function_${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(`async_function_${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`async_function_${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all recorded metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Send metrics to analytics service (implement based on your analytics provider)
   */
  private sendToAnalytics(metric: PerformanceMetric) {
    // In a real application, you would send this to your analytics service
    // For example: Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Example for Google Analytics
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_parameter_1: metric.metadata,
      });
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 */
export function usePerfMeasure(componentName: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    performanceMonitor.recordMetric(`component_render_${componentName}`, duration);
  };
}

/**
 * Decorator for measuring method execution time
 */
export function measurePerformance(metricName: string) {
  return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureFunction(metricName, () => method.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * Report Core Web Vitals to console in development
 */
export function reportWebVitals() {
  if (!isProduction()) {
    // Only report in development
    setTimeout(() => {
      const metrics = performanceMonitor.getMetrics();
      const webVitals = metrics.filter(m => ['LCP', 'FID', 'CLS'].includes(m.name));
      
      if (webVitals.length > 0) {
        console.group('🚀 Core Web Vitals');
        webVitals.forEach(metric => {
          const status = getMetricStatus(metric.name, metric.value);
          console.log(`${metric.name}: ${metric.value.toFixed(2)}ms ${status}`);
        });
        console.groupEnd();
      }
    }, 3000); // Wait 3 seconds for metrics to be collected
  }
}

function getMetricStatus(name: string, value: number): string {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return '';

  if (value <= threshold.good) return '✅ Good';
  if (value <= threshold.poor) return '⚠️ Needs Improvement';
  return '❌ Poor';
}