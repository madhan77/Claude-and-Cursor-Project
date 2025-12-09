/**
 * Simple in-memory cache for API responses
 * Caches flight status data to avoid hitting API rate limits
 */
interface CacheEntry {
  data: any;
  timestamp: number;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes cache

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export default new CacheService();

// Run cleanup every 10 minutes
setInterval(() => {
  const cache = require('./cache.service').default;
  cache.cleanup();
}, 10 * 60 * 1000);
