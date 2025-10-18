import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

// Hook to monitor component render performance
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    const stopTimer = performanceMonitor.startTimer(`${componentName}_render`);
    
    // Record render count
    renderCount.current += 1;
    performanceMonitor.recordMetric(`${componentName}_renderCount`, renderCount.current);
    
    return () => {
      stopTimer();
    };
  });
  
  // Return monitoring utilities
  return {
    // Track a specific operation within the component
    trackOperation: (operationName: string) => {
      return performanceMonitor.startTimer(`${componentName}_${operationName}`);
    },
    
    // Record a custom metric
    recordMetric: (metricName: string, value: number) => {
      performanceMonitor.recordMetric(`${componentName}_${metricName}`, value);
    }
  };
}