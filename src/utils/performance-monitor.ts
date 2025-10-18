// Performance monitoring utility for high-load scenarios
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private thresholds: Map<string, number> = new Map();
  private alerts: string[] = [];
  private isEnabled: boolean = true;

  constructor() {
    // Set default thresholds
    this.thresholds.set('apiResponseTime', 500); // 500ms
    this.thresholds.set('renderTime', 100); // 100ms
    this.thresholds.set('memoryUsage', 50); // 50MB
  }

  // Enable or disable monitoring
  enable(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
  }

  // Start timing an operation
  startTimer(operationName: string): () => void {
    if (!this.isEnabled) return () => {};
    
    const startTime = performance.now();
    
    // Return function to stop timer and record metric
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(operationName, duration);
      
      // Check if duration exceeds threshold
      const threshold = this.thresholds.get(operationName);
      if (threshold && duration > threshold) {
        this.recordAlert(`${operationName} took ${duration.toFixed(2)}ms, exceeding threshold of ${threshold}ms`);
      }
    };
  }

  // Record a metric value
  recordMetric(metricName: string, value: number): void {
    if (!this.isEnabled) return;
    
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    
    this.metrics.get(metricName)?.push(value);
    
    // Keep only the last 100 values to limit memory usage
    const values = this.metrics.get(metricName);
    if (values && values.length > 100) {
      this.metrics.set(metricName, values.slice(-100));
    }
  }

  // Set a threshold for a metric
  setThreshold(metricName: string, threshold: number): void {
    this.thresholds.set(metricName, threshold);
  }

  // Record an alert
  recordAlert(message: string): void {
    this.alerts.push(`[${new Date().toISOString()}] ${message}`);
    
    // Keep only the last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn(`Performance Alert: ${message}`);
    }
  }

  // Get metrics summary
  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, metricName) => {
      if (values.length === 0) return;
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      summary[metricName] = {
        avg,
        min,
        max,
        count: values.length
      };
    });
    
    return summary;
  }

  // Get recent alerts
  getAlerts(): string[] {
    return [...this.alerts];
  }

  // Clear all metrics and alerts
  clear(): void {
    this.metrics.clear();
    this.alerts = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();