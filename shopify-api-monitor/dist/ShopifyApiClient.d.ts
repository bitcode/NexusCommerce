/**
 * ShopifyApiClient.ts
 * Centralized service for all Shopify Admin GraphQL API calls,
 * real-time rate limit monitoring, and automated throttling/backoff.
 */
import { RequestDocument, Variables } from 'graphql-request';
export interface ShopifyThrottleStatus {
    maximumAvailable: number;
    currentlyAvailable: number;
    restoreRate: number;
}
export interface ShopifyCostExtensions {
    requestedQueryCost: number;
    actualQueryCost: number;
    throttleStatus: ShopifyThrottleStatus;
}
export interface ShopifyApiResponse<T = any> {
    data?: T;
    errors?: any[];
    extensions?: {
        cost?: ShopifyCostExtensions;
    };
}
export interface ShopifyApiClientOptions {
    shop: string;
    accessToken: string;
    apiVersion?: string;
    plan?: 'standard' | 'advanced' | 'plus' | 'enterprise';
    onRateLimitApproaching?: (status: ShopifyThrottleStatus) => void;
    onThrottled?: (status: ShopifyThrottleStatus) => void;
}
export declare class ShopifyApiClient {
    private options;
    private client;
    private plan;
    private onRateLimitApproaching?;
    private onThrottled?;
    private lastThrottleStatus?;
    private static RATE_LIMIT_THRESHOLDS;
    constructor(options: ShopifyApiClientOptions);
    /**
     * Executes a GraphQL query/mutation with rate limit monitoring and backoff.
     */
    request<T = any>(document: RequestDocument, variables?: Variables): Promise<ShopifyApiResponse<T>>;
    /**
     * Handles rate limit events and triggers notifications if thresholds are crossed.
     */
    private handleRateLimit;
    /**
     * Returns the last known throttle status.
     */
    getLastThrottleStatus(): ShopifyThrottleStatus | undefined;
    /**
     * Allows updating the Shopify plan (affects thresholds).
     */
    setPlan(plan: ShopifyApiClientOptions['plan']): void;
}
