/**
 * NotificationSystem.ts
 * Provides in-app notifications for rate limit alerts and API usage events.
 * Can be extended to support additional notification channels.
 */
import { ShopifyThrottleStatus } from './ShopifyApiClient';
export declare enum NotificationType {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    SUCCESS = "success"
}
export declare enum NotificationTopic {
    RATE_LIMIT_APPROACHING = "rate-limit-approaching",
    RATE_LIMIT_EXCEEDED = "rate-limit-exceeded",
    API_ERROR = "api-error",
    PLAN_CHANGED = "plan-changed",
    SYSTEM = "system"
}
export interface Notification {
    id: string;
    type: NotificationType;
    topic: NotificationTopic;
    message: string;
    timestamp: number;
    details?: any;
    read: boolean;
    dismissed: boolean;
}
export interface NotificationSystemOptions {
    maxNotifications?: number;
    storageKey?: string;
    persistNotifications?: boolean;
    onNewNotification?: (notification: Notification) => void;
}
export declare class NotificationSystem {
    private notifications;
    private maxNotifications;
    private storageKey;
    private persistNotifications;
    private onNewNotification?;
    constructor(options?: NotificationSystemOptions);
    /**
     * Creates a new notification for approaching rate limits
     */
    notifyRateLimitApproaching(status: ShopifyThrottleStatus, percentageUsed: number): Notification;
    /**
     * Creates a new notification for exceeded rate limits (throttled)
     */
    notifyRateLimitExceeded(status: ShopifyThrottleStatus | undefined): Notification;
    /**
     * Creates a new notification for API errors
     */
    notifyApiError(error: any): Notification;
    /**
     * Creates a new notification for plan changes
     */
    notifyPlanChanged(plan: string, limits: any): Notification;
    /**
     * Creates a custom notification
     */
    notify(message: string, type?: NotificationType, topic?: NotificationTopic, details?: any): Notification;
    /**
     * Adds a new notification to the system
     */
    private addNotification;
    /**
     * Marks a notification as read
     */
    markAsRead(id: string): boolean;
    /**
     * Marks a notification as dismissed
     */
    dismiss(id: string): boolean;
    /**
     * Gets all notifications
     */
    getAll(): Notification[];
    /**
     * Gets unread notifications
     */
    getUnread(): Notification[];
    /**
     * Gets notifications by topic
     */
    getByTopic(topic: NotificationTopic): Notification[];
    /**
     * Clears all notifications
     */
    clearAll(): void;
    /**
     * Generates a unique ID for notifications
     */
    private generateId;
    /**
     * Saves notifications to local storage
     */
    private saveToStorage;
    /**
     * Loads notifications from local storage
     */
    private loadFromStorage;
}
