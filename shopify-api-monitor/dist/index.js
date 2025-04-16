"use strict";
/**
 * index.ts
 * Main entry point for the Shopify API Usage Monitoring and Management system.
 * Exports all components and provides a convenient factory function.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTopic = exports.NotificationType = exports.NotificationSystem = exports.PlanConfig = exports.UsageAnalytics = exports.ShopifyApiClient = void 0;
exports.createShopifyMonitor = createShopifyMonitor;
const ShopifyApiClient_1 = require("./ShopifyApiClient");
Object.defineProperty(exports, "ShopifyApiClient", { enumerable: true, get: function () { return ShopifyApiClient_1.ShopifyApiClient; } });
const UsageAnalytics_1 = require("./UsageAnalytics");
Object.defineProperty(exports, "UsageAnalytics", { enumerable: true, get: function () { return UsageAnalytics_1.UsageAnalytics; } });
const PlanConfig_1 = require("./PlanConfig");
Object.defineProperty(exports, "PlanConfig", { enumerable: true, get: function () { return PlanConfig_1.PlanConfig; } });
const NotificationSystem_1 = require("./NotificationSystem");
Object.defineProperty(exports, "NotificationSystem", { enumerable: true, get: function () { return NotificationSystem_1.NotificationSystem; } });
Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function () { return NotificationSystem_1.NotificationType; } });
Object.defineProperty(exports, "NotificationTopic", { enumerable: true, get: function () { return NotificationSystem_1.NotificationTopic; } });
/**
 * Creates a fully configured Shopify API monitoring system with all components
 * wired together for real-time rate limit tracking, analytics, and notifications.
 */
function createShopifyMonitor(options) {
    // Initialize components
    const analytics = new UsageAnalytics_1.UsageAnalytics(options.analytics);
    const notifications = new NotificationSystem_1.NotificationSystem(options.notifications);
    // Initialize plan config with callback to notify on plan changes
    const planConfig = new PlanConfig_1.PlanConfig({
        ...options.planConfig,
        initialPlan: options.plan,
        onPlanChange: (plan, limits) => {
            notifications.notifyPlanChanged(plan, limits);
        },
    });
    // Initialize API client with callbacks for rate limit events
    const apiClient = new ShopifyApiClient_1.ShopifyApiClient({
        shop: options.shop,
        accessToken: options.accessToken,
        apiVersion: options.apiVersion,
        plan: planConfig.getCurrentPlan(),
        onRateLimitApproaching: (status) => {
            // Calculate percentage used
            const percentageUsed = 100 - (status.currentlyAvailable / status.maximumAvailable * 100);
            // Notify through notification system
            notifications.notifyRateLimitApproaching(status, percentageUsed);
        },
        onThrottled: (status) => {
            // Record throttled request in analytics
            analytics.recordThrottledRequest(status);
            // Notify through notification system
            notifications.notifyRateLimitExceeded(status);
        },
    });
    // Wrap the original request method to track analytics
    const originalRequest = apiClient.request.bind(apiClient);
    apiClient.request = async (document, variables) => {
        var _a, _b, _c, _d;
        try {
            const response = await originalRequest(document, variables);
            // Record successful API usage if cost data is available
            if ((_a = response.extensions) === null || _a === void 0 ? void 0 : _a.cost) {
                analytics.recordApiUsage(response.extensions.cost, typeof document === 'string'
                    ? document.substring(0, 50)
                    : ((_d = (_c = (_b = document === null || document === void 0 ? void 0 : document.loc) === null || _b === void 0 ? void 0 : _b.source) === null || _c === void 0 ? void 0 : _c.body) === null || _d === void 0 ? void 0 : _d.substring(0, 50)) || 'unknown', variables ? JSON.stringify(variables).substring(0, 50) : undefined);
            }
            return response;
        }
        catch (error) {
            // Notify of API errors (non-throttling related)
            notifications.notifyApiError(error);
            throw error;
        }
    };
    return {
        apiClient,
        analytics,
        planConfig,
        notifications,
    };
}
// Default export for convenience
exports.default = createShopifyMonitor;
//# sourceMappingURL=index.js.map