// API Optimizer for high concurrency scenarios
import { cache } from './cache';

// Request queue for handling high concurrency
class RequestQueue {
  private queue: Map<string, Promise<unknown>> = new Map();
  
  // Get or create a request promise for a given key
  async getOrEnqueue<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in progress
    const existingRequest = this.queue.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }
    
    // Create new request promise
    const requestPromise = requestFn().finally(() => {
      // Remove from queue when complete
      this.queue.delete(key);
    });
    
    // Add to queue
    this.queue.set(key, requestPromise);
    
    return requestPromise;
  }
}

// Export singleton instance
export const requestQueue = new RequestQueue();

// API optimization wrapper
export const optimizeApiCall = async <T>(
  cacheKey: string,
  apiFn: () => Promise<T>,
  cacheDuration: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  // Try to get from cache first
  const cachedData = cache.get<T>(cacheKey);
  if (cachedData) return cachedData;
  
  // If not in cache, use request queue to prevent duplicate in-flight requests
  return requestQueue.getOrEnqueue(cacheKey, async () => {
    const result = await apiFn();
    
    // Cache the result
    if (result) {
      cache.set(cacheKey, result, cacheDuration);
    }
    
    return result;
  });
};

// Batch request handler for reducing API calls
export const batchRequests = <T, R>(
  items: T[],
  batchSize: number,
  batchFn: (batch: T[]) => Promise<R[]>
): Promise<R[]> => {
  // Split items into batches
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  // Process all batches and combine results
  return Promise.all(batches.map(batch => batchFn(batch)))
    .then(results => results.flat());
};