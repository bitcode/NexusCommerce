/**
 * CacheManager.ts
 * Provides caching functionality for API responses and frequently accessed data.
 * Implements various caching strategies including TTL (Time-To-Live) and LRU (Least Recently Used).
 */

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  /** The cached data */
  data: T;
  
  /** When the entry was created */
  createdAt: number;
  
  /** When the entry expires (0 for no expiration) */
  expiresAt: number;
  
  /** When the entry was last accessed */
  lastAccessed: number;
  
  /** Tags for cache invalidation */
  tags: string[];
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Maximum number of entries in the cache */
  maxEntries?: number;
  
  /** Default TTL in milliseconds (0 for no expiration) */
  defaultTTL?: number;
  
  /** Whether to persist the cache to localStorage */
  persistToStorage?: boolean;
  
  /** Storage key for persistence */
  storageKey?: string;
  
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Default cache options
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  maxEntries: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  persistToStorage: false,
  storageKey: 'shopify-api-cache',
  debug: false
};

/**
 * Cache manager for API responses and frequently accessed data
 */
export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private options: CacheOptions;
  
  /**
   * Creates a new CacheManager
   * 
   * @param options - Cache configuration options
   */
  constructor(options: CacheOptions = {}) {
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
    
    // Load cache from storage if enabled
    if (this.options.persistToStorage) {
      this.loadFromStorage();
    }
    
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 60 * 1000); // Run cleanup every minute
  }
  
  /**
   * Sets a value in the cache
   * 
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time-to-live in milliseconds (0 for no expiration)
   * @param tags - Tags for cache invalidation
   * @returns The cached data
   */
  set<T>(key: string, data: T, ttl: number = this.options.defaultTTL || 0, tags: string[] = []): T {
    // Ensure the cache doesn't exceed the maximum size
    if (this.cache.size >= (this.options.maxEntries || 100)) {
      this.evictLRU();
    }
    
    const now = Date.now();
    const expiresAt = ttl > 0 ? now + ttl : 0;
    
    const entry: CacheEntry<T> = {
      data,
      createdAt: now,
      expiresAt,
      lastAccessed: now,
      tags
    };
    
    this.cache.set(key, entry);
    
    if (this.options.debug) {
      console.log(`Cache: Set "${key}" (expires: ${expiresAt > 0 ? new Date(expiresAt).toISOString() : 'never'})`);
    }
    
    // Persist to storage if enabled
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
    
    return data;
  }
  
  /**
   * Gets a value from the cache
   * 
   * @param key - Cache key
   * @returns The cached data or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.options.debug) {
        console.log(`Cache: Miss "${key}" (not found)`);
      }
      return undefined;
    }
    
    // Check if the entry has expired
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      if (this.options.debug) {
        console.log(`Cache: Miss "${key}" (expired)`);
      }
      this.cache.delete(key);
      
      // Persist to storage if enabled
      if (this.options.persistToStorage) {
        this.saveToStorage();
      }
      
      return undefined;
    }
    
    // Update last accessed time
    entry.lastAccessed = Date.now();
    
    if (this.options.debug) {
      console.log(`Cache: Hit "${key}"`);
    }
    
    return entry.data as T;
  }
  
  /**
   * Gets a value from the cache or computes it if not found
   * 
   * @param key - Cache key
   * @param fn - Function to compute the value if not found
   * @param ttl - Time-to-live in milliseconds (0 for no expiration)
   * @param tags - Tags for cache invalidation
   * @returns The cached or computed data
   */
  async getOrCompute<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.options.defaultTTL || 0,
    tags: string[] = []
  ): Promise<T> {
    const cachedValue = this.get<T>(key);
    
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // Compute the value
    const computedValue = await fn();
    
    // Cache the computed value
    this.set(key, computedValue, ttl, tags);
    
    return computedValue;
  }
  
  /**
   * Checks if a key exists in the cache and is not expired
   * 
   * @param key - Cache key
   * @returns Whether the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if the entry has expired
    if (entry.expiresAt > 0 && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      
      // Persist to storage if enabled
      if (this.options.persistToStorage) {
        this.saveToStorage();
      }
      
      return false;
    }
    
    return true;
  }
  
  /**
   * Deletes a value from the cache
   * 
   * @param key - Cache key
   * @returns Whether the key was found and deleted
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    
    if (result && this.options.debug) {
      console.log(`Cache: Deleted "${key}"`);
    }
    
    // Persist to storage if enabled
    if (result && this.options.persistToStorage) {
      this.saveToStorage();
    }
    
    return result;
  }
  
  /**
   * Invalidates cache entries by tag
   * 
   * @param tag - Tag to invalidate
   * @returns Number of entries invalidated
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
        
        if (this.options.debug) {
          console.log(`Cache: Invalidated "${key}" by tag "${tag}"`);
        }
      }
    }
    
    // Persist to storage if enabled
    if (count > 0 && this.options.persistToStorage) {
      this.saveToStorage();
    }
    
    return count;
  }
  
  /**
   * Clears the entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    
    if (this.options.debug) {
      console.log(`Cache: Cleared ${size} entries`);
    }
    
    // Persist to storage if enabled
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }
  
  /**
   * Gets cache statistics
   * 
   * @returns Cache statistics
   */
  getStats(): { size: number; oldestEntry: number; newestEntry: number } {
    let oldestEntry = Date.now();
    let newestEntry = 0;
    
    for (const entry of this.cache.values()) {
      if (entry.createdAt < oldestEntry) {
        oldestEntry = entry.createdAt;
      }
      
      if (entry.createdAt > newestEntry) {
        newestEntry = entry.createdAt;
      }
    }
    
    return {
      size: this.cache.size,
      oldestEntry,
      newestEntry
    };
  }
  
  /**
   * Cleans up expired entries
   * 
   * @returns Number of entries removed
   */
  private cleanup(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt > 0 && entry.expiresAt < now) {
        this.cache.delete(key);
        count++;
        
        if (this.options.debug) {
          console.log(`Cache: Cleaned up expired entry "${key}"`);
        }
      }
    }
    
    // Persist to storage if enabled
    if (count > 0 && this.options.persistToStorage) {
      this.saveToStorage();
    }
    
    return count;
  }
  
  /**
   * Evicts the least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruKey = key;
        lruTime = entry.lastAccessed;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
      
      if (this.options.debug) {
        console.log(`Cache: Evicted LRU entry "${lruKey}"`);
      }
      
      // Persist to storage if enabled
      if (this.options.persistToStorage) {
        this.saveToStorage();
      }
    }
  }
  
  /**
   * Saves the cache to localStorage
   */
  private saveToStorage(): void {
    if (!this.options.persistToStorage || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem(this.options.storageKey || 'shopify-api-cache', serialized);
      
      if (this.options.debug) {
        console.log(`Cache: Saved to storage (${this.cache.size} entries)`);
      }
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }
  
  /**
   * Loads the cache from localStorage
   */
  private loadFromStorage(): void {
    if (!this.options.persistToStorage || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const serialized = localStorage.getItem(this.options.storageKey || 'shopify-api-cache');
      
      if (serialized) {
        const entries = JSON.parse(serialized) as [string, CacheEntry<any>][];
        this.cache = new Map(entries);
        
        if (this.options.debug) {
          console.log(`Cache: Loaded from storage (${this.cache.size} entries)`);
        }
        
        // Clean up expired entries
        this.cleanup();
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

export default cacheManager;