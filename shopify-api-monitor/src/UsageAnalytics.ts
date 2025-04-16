/**
 * UsageAnalytics.ts
 * Tracks and analyzes Shopify API usage patterns, stores historical data,
 * and provides analytics for visualization in the admin dashboard.
 */

import { ShopifyThrottleStatus, ShopifyCostExtensions } from './ShopifyApiClient';

export interface ApiUsageRecord {
  timestamp: number;
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: ShopifyThrottleStatus;
  endpoint?: string;
  operation?: string;
  success: boolean;
  throttled: boolean;
}

export interface UsageAnalyticsSummary {
  currentStatus: ShopifyThrottleStatus | null;
  usagePercentage: number;
  recentRecords: ApiUsageRecord[];
  hourlyUsage: { timestamp: number; totalCost: number; count: number }[];
  dailyUsage: { timestamp: number; totalCost: number; count: number }[];
  throttledRequests: number;
  averageCostPerRequest: number;
}

export interface UsageAnalyticsOptions {
  maxHistoryLength?: number;
  storageKey?: string;
  persistData?: boolean;
}

export class UsageAnalytics {
  private usageHistory: ApiUsageRecord[] = [];
  private currentStatus: ShopifyThrottleStatus | null = null;
  private maxHistoryLength: number;
  private storageKey: string;
  private persistData: boolean;

  constructor(options: UsageAnalyticsOptions = {}) {
    this.maxHistoryLength = options.maxHistoryLength || 1000;
    this.storageKey = options.storageKey || 'shopify-api-usage-history';
    this.persistData = options.persistData !== undefined ? options.persistData : true;
    
    // Load history from storage if enabled
    if (this.persistData) {
      this.loadFromStorage();
    }
  }

  /**
   * Records a new API usage entry
   */
  recordApiUsage(
    cost: ShopifyCostExtensions,
    endpoint?: string,
    operation?: string,
    success: boolean = true,
    throttled: boolean = false
  ): void {
    const record: ApiUsageRecord = {
      timestamp: Date.now(),
      requestedQueryCost: cost.requestedQueryCost,
      actualQueryCost: cost.actualQueryCost,
      throttleStatus: cost.throttleStatus,
      endpoint,
      operation,
      success,
      throttled,
    };

    this.usageHistory.unshift(record);
    this.currentStatus = cost.throttleStatus;
    
    // Trim history if it exceeds max length
    if (this.usageHistory.length > this.maxHistoryLength) {
      this.usageHistory = this.usageHistory.slice(0, this.maxHistoryLength);
    }
    
    // Persist to storage if enabled
    if (this.persistData) {
      this.saveToStorage();
    }
  }

  /**
   * Records a throttled API request
   */
  recordThrottledRequest(
    lastKnownStatus: ShopifyThrottleStatus | undefined,
    endpoint?: string,
    operation?: string
  ): void {
    // If we have a last known status, use it, otherwise create a placeholder
    const status = lastKnownStatus || {
      maximumAvailable: 0,
      currentlyAvailable: 0,
      restoreRate: 0,
    };
    
    const record: ApiUsageRecord = {
      timestamp: Date.now(),
      requestedQueryCost: 0, // Unknown since request was throttled
      actualQueryCost: 0,
      throttleStatus: status,
      endpoint,
      operation,
      success: false,
      throttled: true,
    };

    this.usageHistory.unshift(record);
    
    // Trim history if it exceeds max length
    if (this.usageHistory.length > this.maxHistoryLength) {
      this.usageHistory = this.usageHistory.slice(0, this.maxHistoryLength);
    }
    
    // Persist to storage if enabled
    if (this.persistData) {
      this.saveToStorage();
    }
  }

  /**
   * Gets the current usage analytics summary
   */
  getSummary(): UsageAnalyticsSummary {
    const recentRecords = this.usageHistory.slice(0, 50);
    
    // Calculate usage percentage
    const usagePercentage = this.currentStatus 
      ? 100 - (this.currentStatus.currentlyAvailable / this.currentStatus.maximumAvailable * 100)
      : 0;
    
    // Calculate hourly usage
    const hourlyUsage = this.calculateTimeBasedUsage(3600000); // 1 hour in ms
    
    // Calculate daily usage
    const dailyUsage = this.calculateTimeBasedUsage(86400000); // 24 hours in ms
    
    // Count throttled requests
    const throttledRequests = this.usageHistory.filter(r => r.throttled).length;
    
    // Calculate average cost per request
    const successfulRequests = this.usageHistory.filter(r => r.success);
    const averageCostPerRequest = successfulRequests.length > 0
      ? successfulRequests.reduce((sum, r) => sum + r.actualQueryCost, 0) / successfulRequests.length
      : 0;
    
    return {
      currentStatus: this.currentStatus,
      usagePercentage,
      recentRecords,
      hourlyUsage,
      dailyUsage,
      throttledRequests,
      averageCostPerRequest,
    };
  }

  /**
   * Calculates time-based usage aggregation (hourly, daily, etc.)
   */
  private calculateTimeBasedUsage(timeWindow: number) {
    const now = Date.now();
    const result: { timestamp: number; totalCost: number; count: number }[] = [];
    
    // Group by time windows
    const timeWindows = new Map<number, { totalCost: number; count: number }>();
    
    this.usageHistory.forEach(record => {
      if (!record.success) return;
      
      // Calculate the time window this record belongs to
      const windowStart = Math.floor(record.timestamp / timeWindow) * timeWindow;
      
      if (!timeWindows.has(windowStart)) {
        timeWindows.set(windowStart, { totalCost: 0, count: 0 });
      }
      
      const window = timeWindows.get(windowStart)!;
      window.totalCost += record.actualQueryCost;
      window.count++;
    });
    
    // Convert map to array and sort by timestamp
    timeWindows.forEach((value, timestamp) => {
      result.push({
        timestamp,
        totalCost: value.totalCost,
        count: value.count,
      });
    });
    
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Clears all usage history
   */
  clearHistory(): void {
    this.usageHistory = [];
    if (this.persistData) {
      this.saveToStorage();
    }
  }

  /**
   * Saves usage history to local storage
   */
  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.usageHistory));
      }
    } catch (error) {
      console.error('Failed to save API usage history to storage:', error);
    }
  }

  /**
   * Loads usage history from local storage
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.usageHistory = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load API usage history from storage:', error);
    }
  }
}