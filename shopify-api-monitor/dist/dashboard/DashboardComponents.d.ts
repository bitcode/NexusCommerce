/**
 * DashboardComponents.ts
 * UI components for displaying API usage analytics and notifications in the admin dashboard.
 * These are framework-agnostic interfaces that can be implemented in React, Vue, or other UI frameworks.
 */
import { ShopifyThrottleStatus } from '../ShopifyApiClient';
import { ApiUsageRecord, UsageAnalyticsSummary } from '../UsageAnalytics';
import { Notification } from '../NotificationSystem';
import { ShopifyPlan, PlanRateLimits } from '../PlanConfig';
/**
 * Component for displaying current rate limit status as a gauge/meter
 */
export interface RateLimitGaugeProps {
    currentStatus: ShopifyThrottleStatus | null;
    usagePercentage: number;
    showLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
    warningThreshold?: number;
    criticalThreshold?: number;
}
/**
 * Component for displaying usage analytics charts
 */
export interface UsageAnalyticsChartProps {
    data: UsageAnalyticsSummary;
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    chartType?: 'line' | 'bar' | 'area';
    height?: number;
    width?: number;
}
/**
 * Component for displaying recent API requests in a table
 */
export interface ApiRequestsTableProps {
    records: ApiUsageRecord[];
    pageSize?: number;
    showPagination?: boolean;
    onRecordClick?: (record: ApiUsageRecord) => void;
}
/**
 * Component for displaying notifications
 */
export interface NotificationsListProps {
    notifications: Notification[];
    maxItems?: number;
    showDismissAll?: boolean;
    onDismiss?: (id: string) => void;
    onDismissAll?: () => void;
    onNotificationClick?: (notification: Notification) => void;
}
/**
 * Component for configuring the Shopify plan
 */
export interface PlanConfigFormProps {
    currentPlan: ShopifyPlan;
    availablePlans: Record<ShopifyPlan, PlanRateLimits>;
    onPlanChange: (plan: ShopifyPlan) => void;
}
/**
 * Main dashboard component that combines all monitoring UI elements
 */
export interface ApiMonitorDashboardProps {
    apiStatus: {
        currentStatus: ShopifyThrottleStatus | null;
        usagePercentage: number;
    };
    analytics: UsageAnalyticsSummary;
    notifications: Notification[];
    planConfig: {
        currentPlan: ShopifyPlan;
        availablePlans: Record<ShopifyPlan, PlanRateLimits>;
    };
    onPlanChange: (plan: ShopifyPlan) => void;
    onDismissNotification: (id: string) => void;
    onDismissAllNotifications: () => void;
    onRefresh?: () => void;
}
/**
 * Example implementation of how to render the dashboard in HTML/CSS
 * This is a simple template that can be adapted to any framework
 */
export declare function renderBasicDashboardHTML(props: ApiMonitorDashboardProps): string;
