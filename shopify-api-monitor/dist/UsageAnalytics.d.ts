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
    hourlyUsage: {
        timestamp: number;
        totalCost: number;
        count: number;
    }[];
    dailyUsage: {
        timestamp: number;
        totalCost: number;
        count: number;
    }[];
    throttledRequests: number;
    averageCostPerRequest: number;
}
export interface UsageAnalyticsOptions {
    maxHistoryLength?: number;
    storageKey?: string;
    persistData?: boolean;
}
export declare class UsageAnalytics {
    private usageHistory;
    private currentStatus;
    private maxHistoryLength;
    private storageKey;
    private persistData;
    constructor(options?: UsageAnalyticsOptions);
    /**
     * Records a new API usage entry
     */
    recordApiUsage(cost: ShopifyCostExtensions, endpoint?: string, operation?: string, success?: boolean, throttled?: boolean): void;
    /**
     * Records a throttled API request
     */
    recordThrottledRequest(lastKnownStatus: ShopifyThrottleStatus | undefined, endpoint?: string, operation?: string): void;
    /**
     * Gets the current usage analytics summary
     */
    getSummary(): UsageAnalyticsSummary;
    /**
     * Calculates time-based usage aggregation (hourly, daily, etc.)
     */
    private calculateTimeBasedUsage;
    /**
     * Clears all usage history
     */
    clearHistory(): void;
    /**
     * Saves usage history to local storage
     */
    private saveToStorage;
    /**
     * Loads usage history from local storage
     */
    private loadFromStorage;
}
