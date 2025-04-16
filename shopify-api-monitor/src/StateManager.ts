/**
 * StateManager.ts
 * Implements efficient state management to minimize API requests while ensuring data privacy.
 * Features:
 * - Intelligent caching with configurable TTL (Time-To-Live)
 * - Data sanitization to remove PII and sensitive information
 * - Configurable refresh policies for time-sensitive data
 * - Memory and storage management with size limits
 */

import { ShopifyApiClient, ShopifyApiResponse } from './ShopifyApiClient';

/**
 * Cache entry with metadata for intelligent refresh
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  queryHash: string;
  sanitized: boolean;
  accessCount: number;
  lastAccessed: number;
}

/**
 * Cache configuration options
 */
export interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTTL: number;
  /** Maximum cache size in entries */
  maxEntries: number;
  /** Whether to persist cache to storage */
  persistCache: boolean;
  /** Storage key for persisted cache */
  storageKey: string;
  /** Whether to sanitize data before caching */
  sanitizeData: boolean;
}

/**
 * Refresh policy types
 */
export enum RefreshPolicy {
  /** Never refresh automatically */
  NEVER = 'never',
  /** Refresh when TTL expires */
  ON_EXPIRE = 'on_expire',
  /** Refresh in background before TTL expires */
  BACKGROUND = 'background',
  /** Always fetch fresh data */
  ALWAYS = 'always'
}

/**
 * Data category for privacy and retention policies
 */
export enum DataCategory {
  /** Configuration data (no PII, long retention) */
  CONFIG = 'config',
  /** Operational data (no PII, medium retention) */
  OPERATIONAL = 'operational',
  /** Analytics data (aggregated, no individual PII) */
  ANALYTICS = 'analytics',
  /** Temporary data (short retention, may contain sanitized business data) */
  TEMPORARY = 'temporary'
}

/**
 * Request options for state manager
 */
export interface StateRequestOptions {
  /** Cache key */
  cacheKey: string;
  /** Data category for privacy policy */
  category: DataCategory;
  /** TTL override in milliseconds */
  ttl?: number;
  /** Refresh policy */
  refreshPolicy?: RefreshPolicy;
  /** Fields to sanitize (remove) before caching */
  sanitizeFields?: string[];
  /** Whether to force refresh */
  forceRefresh?: boolean;
}

/**
 * State manager for efficient API request caching and data privacy
 */
export class StateManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private apiClient: ShopifyApiClient;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private categoryTTLs: Map<DataCategory, number> = new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Creates a new StateManager
   */
  constructor(apiClient: ShopifyApiClient, config?: Partial<CacheConfig>) {
    this.apiClient = apiClient;
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxEntries: 1000,
      persistCache: true,
      storageKey: 'shopify-api-state-cache',
      sanitizeData: true,
      ...config
    };

    // Set default TTLs by category
    this.categoryTTLs.set(DataCategory.CONFIG, 86400000); // 24 hours
    this.categoryTTLs.set(DataCategory.OPERATIONAL, 300000); // 5 minutes
    this.categoryTTLs.set(DataCategory.ANALYTICS, 3600000); // 1 hour
    this.categoryTTLs.set(DataCategory.TEMPORARY, 60000); // 1 minute

    // Load cache from storage if enabled
    if (this.config.persistCache) {
      this.loadFromStorage();
    }
  }

  /**
   * Executes a GraphQL query with caching and privacy controls
   */
  async query<T = any>(
    document: string,
    variables?: any,
    options: Partial<StateRequestOptions> = {}
  ): Promise<T> {
    const requestOptions: StateRequestOptions = {
      cacheKey: this.generateCacheKey(document, variables),
      category: DataCategory.OPERATIONAL,
      refreshPolicy: RefreshPolicy.ON_EXPIRE,
      ...options
    };

    // Apply category-specific TTL if not explicitly provided
    if (!requestOptions.ttl && this.categoryTTLs.has(requestOptions.category)) {
      requestOptions.ttl = this.categoryTTLs.get(requestOptions.category);
    }

    // Check if we should use cache
    if (
      !requestOptions.forceRefresh &&
      requestOptions.refreshPolicy !== RefreshPolicy.ALWAYS
    ) {
      const cachedData = this.getFromCache<T>(requestOptions.cacheKey);
      if (cachedData) {
        // If using background refresh and approaching expiry, refresh in background
        if (
          requestOptions.refreshPolicy === RefreshPolicy.BACKGROUND &&
          this.isApproachingExpiry(requestOptions.cacheKey)
        ) {
          this.refreshInBackground(document, variables, requestOptions);
        }
        return cachedData;
      }
    }

    // If there's already a pending request for this cache key, return that promise
    if (this.pendingRequests.has(requestOptions.cacheKey)) {
      return this.pendingRequests.get(requestOptions.cacheKey);
    }

    // Execute the request
    const requestPromise = this.executeRequest<T>(document, variables, requestOptions);
    this.pendingRequests.set(requestOptions.cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestOptions.cacheKey);
    }
  }

  /**
   * Executes the actual API request and handles caching
   */
  private async executeRequest<T>(
    document: string,
    variables: any,
    options: StateRequestOptions
  ): Promise<T> {
    try {
      const response = await this.apiClient.request<T>(document, variables);
      
      // Only cache successful responses
      if (response.data && !response.errors) {
        const data = response.data;
        
        // Sanitize data if needed
        const sanitizedData = options.sanitizeFields && options.sanitizeFields.length > 0
          ? this.sanitizeData(data, options.sanitizeFields)
          : data;
        
        // Store in cache
        this.storeInCache(
          options.cacheKey,
          sanitizedData,
          options.ttl || this.config.defaultTTL,
          document,
          !!(options.sanitizeFields && options.sanitizeFields.length > 0)
        );
        
        return sanitizedData;
      }
      
      return response.data as T;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }

  /**
   * Refreshes data in the background without blocking
   */
  private refreshInBackground<T>(
    document: string,
    variables: any,
    options: StateRequestOptions
  ): void {
    // Don't start another refresh if one is already pending
    if (this.pendingRequests.has(options.cacheKey)) {
      return;
    }

    // Execute in the background
    const refreshPromise = this.executeRequest<T>(document, variables, {
      ...options,
      forceRefresh: true
    });
    
    this.pendingRequests.set(options.cacheKey, refreshPromise);
    
    refreshPromise.finally(() => {
      this.pendingRequests.delete(options.cacheKey);
    });
  }

  /**
   * Generates a cache key from query and variables
   */
  private generateCacheKey(document: string, variables?: any): string {
    const queryHash = this.hashString(document);
    const variablesHash = variables ? this.hashString(JSON.stringify(variables)) : '';
    return `${queryHash}${variablesHash ? `:${variablesHash}` : ''}`;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Sanitizes data by removing specified fields
   */
  private sanitizeData<T>(data: T, fieldsToRemove: string[]): T {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Create a deep copy to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(data));
    
    // Helper function to recursively sanitize objects
    const sanitizeObject = (obj: any, fields: string[]) => {
      if (!obj || typeof obj !== 'object') {
        return;
      }
      
      // Remove specified fields
      for (const field of fields) {
        if (field.includes('.')) {
          // Handle nested fields (e.g., "customer.email")
          const [parent, ...rest] = field.split('.');
          if (obj[parent] && typeof obj[parent] === 'object') {
            sanitizeObject(obj[parent], [rest.join('.')]);
          }
        } else {
          delete obj[field];
        }
      }
      
      // Recursively process arrays and objects
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => sanitizeObject(item, fields));
        } else if (obj[key] && typeof obj[key] === 'object') {
          sanitizeObject(obj[key], fields);
        }
      }
    };
    
    sanitizeObject(sanitized, fieldsToRemove);
    return sanitized;
  }

  /**
   * Stores data in the cache
   */
  private storeInCache(
    key: string,
    data: any,
    ttl: number,
    queryHash: string,
    sanitized: boolean
  ): void {
    const now = Date.now();
    
    // Create cache entry
    const entry: CacheEntry<any> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      queryHash,
      sanitized,
      accessCount: 0,
      lastAccessed: now
    };
    
    // Add to cache
    this.cache.set(key, entry);
    
    // Enforce max entries limit
    if (this.cache.size > this.config.maxEntries) {
      this.evictLeastRecentlyUsed();
    }
    
    // Set up expiration timer
    if (this.refreshTimers.has(key)) {
      clearTimeout(this.refreshTimers.get(key));
    }
    
    this.refreshTimers.set(
      key,
      setTimeout(() => {
        this.cache.delete(key);
        this.refreshTimers.delete(key);
        
        // Persist changes if enabled
        if (this.config.persistCache) {
          this.saveToStorage();
        }
      }, ttl)
    );
    
    // Persist to storage if enabled
    if (this.config.persistCache) {
      this.saveToStorage();
    }
  }

  /**
   * Retrieves data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    
    // Check if expired
    if (entry.expiresAt < now) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.data as T;
  }

  /**
   * Checks if a cache entry is approaching expiry (within 10% of TTL)
   */
  private isApproachingExpiry(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    const totalTTL = entry.expiresAt - entry.timestamp;
    const remainingTime = entry.expiresAt - now;
    
    // If less than 10% of TTL remains, consider it approaching expiry
    return remainingTime < totalTTL * 0.1;
  }

  /**
   * Evicts least recently used entries when cache is full
   */
  private evictLeastRecentlyUsed(): void {
    let oldest: [string, CacheEntry<any>] | null = null;
    
    for (const entry of this.cache.entries()) {
      if (!oldest || entry[1].lastAccessed < oldest[1].lastAccessed) {
        oldest = entry;
      }
    }
    
    if (oldest) {
      this.cache.delete(oldest[0]);
      
      // Clear any associated timer
      if (this.refreshTimers.has(oldest[0])) {
        clearTimeout(this.refreshTimers.get(oldest[0]));
        this.refreshTimers.delete(oldest[0]);
      }
    }
  }

  /**
   * Clears the entire cache
   */
  clearCache(): void {
    this.cache.clear();
    
    // Clear all timers
    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer);
    }
    this.refreshTimers.clear();
    
    // Persist changes if enabled
    if (this.config.persistCache) {
      this.saveToStorage();
    }
  }

  /**
   * Invalidates specific cache entries by key pattern
   */
  invalidateCache(keyPattern: string | RegExp): void {
    const pattern = typeof keyPattern === 'string' 
      ? new RegExp(keyPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      : keyPattern;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        
        // Clear associated timer
        if (this.refreshTimers.has(key)) {
          clearTimeout(this.refreshTimers.get(key));
          this.refreshTimers.delete(key);
        }
      }
    }
    
    // Persist changes if enabled
    if (this.config.persistCache) {
      this.saveToStorage();
    }
  }

  /**
   * Saves cache to storage
   */
  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Convert cache to serializable format
        const serialized = Array.from(this.cache.entries()).map(([key, entry]) => {
          return [key, {
            ...entry,
            // Don't serialize timers
            timer: undefined
          }];
        });
        
        localStorage.setItem(this.config.storageKey, JSON.stringify(serialized));
      }
    } catch (error) {
      console.error('Failed to save state cache to storage:', error);
    }
  }

  /**
   * Loads cache from storage
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.config.storageKey);
        
        if (stored) {
          const entries = JSON.parse(stored) as [string, CacheEntry<any>][];
          const now = Date.now();
          
          for (const [key, entry] of entries) {
            // Skip expired entries
            if (entry.expiresAt > now) {
              this.cache.set(key, entry);
              
              // Set up expiration timer
              const remainingTime = entry.expiresAt - now;
              this.refreshTimers.set(
                key,
                setTimeout(() => {
                  this.cache.delete(key);
                  this.refreshTimers.delete(key);
                }, remainingTime)
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load state cache from storage:', error);
    }
  }

  /**
   * Updates TTL for a specific data category
   */
  setCategoryTTL(category: DataCategory, ttl: number): void {
    this.categoryTTLs.set(category, ttl);
  }

  /**
   * Gets current cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    const stats = {
      totalEntries: this.cache.size,
      entriesByCategory: {
        [DataCategory.CONFIG]: 0,
        [DataCategory.OPERATIONAL]: 0,
        [DataCategory.ANALYTICS]: 0,
        [DataCategory.TEMPORARY]: 0,
      },
      expiredEntries: 0,
      sanitizedEntries: 0,
      averageAccessCount: 0,
      totalSize: 0,
    };
    
    let totalAccessCount = 0;
    
    for (const entry of this.cache.values()) {
      // Count expired entries
      if (entry.expiresAt < now) {
        stats.expiredEntries++;
      }
      
      // Count sanitized entries
      if (entry.sanitized) {
        stats.sanitizedEntries++;
      }
      
      // Track access count
      totalAccessCount += entry.accessCount;
      
      // Estimate size (rough approximation)
      stats.totalSize += JSON.stringify(entry.data).length;
    }
    
    if (this.cache.size > 0) {
      stats.averageAccessCount = totalAccessCount / this.cache.size;
    }
    
    return stats;
  }
}