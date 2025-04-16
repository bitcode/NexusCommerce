/**
 * index.ts
 * Main entry point for the Shopify API Usage Monitoring and Management system.
 * Exports all components and provides a convenient factory function.
 */
import { ShopifyApiClient, ShopifyApiClientOptions, ShopifyThrottleStatus } from './ShopifyApiClient';
import { UsageAnalytics, UsageAnalyticsOptions } from './UsageAnalytics';
import { PlanConfig, PlanConfigOptions, ShopifyPlan } from './PlanConfig';
import { NotificationSystem, NotificationSystemOptions, NotificationType, NotificationTopic } from './NotificationSystem';
export { ShopifyApiClient, ShopifyApiClientOptions, ShopifyThrottleStatus, UsageAnalytics, UsageAnalyticsOptions, PlanConfig, PlanConfigOptions, ShopifyPlan, NotificationSystem, NotificationSystemOptions, NotificationType, NotificationTopic, };
export interface ShopifyMonitorOptions {
    shop: string;
    accessToken: string;
    apiVersion?: string;
    plan?: ShopifyPlan;
    analytics?: UsageAnalyticsOptions;
    notifications?: NotificationSystemOptions;
    planConfig?: PlanConfigOptions;
}
export interface ShopifyMonitor {
    apiClient: ShopifyApiClient;
    analytics: UsageAnalytics;
    planConfig: PlanConfig;
    notifications: NotificationSystem;
}
/**
 * Creates a fully configured Shopify API monitoring system with all components
 * wired together for real-time rate limit tracking, analytics, and notifications.
 */
export declare function createShopifyMonitor(options: ShopifyMonitorOptions): ShopifyMonitor;
export default createShopifyMonitor;
