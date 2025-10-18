// Simple in-memory cache implementation for high-performance data access
type CacheEntry<T> = {
  value: T;
  expiry: number | null;
};

class Cache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Set a value in the cache with optional TTL
  set<T>(key: string, value: T, ttlMs: number | null = this.DEFAULT_TTL): void {
    const expiry = ttlMs ? Date.now() + ttlMs : null;
    this.cache.set(key, { value, expiry });
  }

  // Get a value from the cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // Return null if entry doesn't exist
    if (!entry) return null;
    
    // Check if entry has expired
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  // Remove a value from the cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear all entries from the cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance
export const cache = new Cache();