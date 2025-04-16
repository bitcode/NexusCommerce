"use strict";
/**
 * NotificationSystem.ts
 * Provides in-app notifications for rate limit alerts and API usage events.
 * Can be extended to support additional notification channels.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSystem = exports.NotificationTopic = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "info";
    NotificationType["WARNING"] = "warning";
    NotificationType["ERROR"] = "error";
    NotificationType["SUCCESS"] = "success";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationTopic;
(function (NotificationTopic) {
    NotificationTopic["RATE_LIMIT_APPROACHING"] = "rate-limit-approaching";
    NotificationTopic["RATE_LIMIT_EXCEEDED"] = "rate-limit-exceeded";
    NotificationTopic["API_ERROR"] = "api-error";
    NotificationTopic["PLAN_CHANGED"] = "plan-changed";
    NotificationTopic["SYSTEM"] = "system";
})(NotificationTopic || (exports.NotificationTopic = NotificationTopic = {}));
class NotificationSystem {
    constructor(options = {}) {
        this.notifications = [];
        this.maxNotifications = options.maxNotifications || 100;
        this.storageKey = options.storageKey || 'shopify-api-notifications';
        this.persistNotifications = options.persistNotifications !== undefined ? options.persistNotifications : true;
        this.onNewNotification = options.onNewNotification;
        // Load notifications from storage if enabled
        if (this.persistNotifications) {
            this.loadFromStorage();
        }
    }
    /**
     * Creates a new notification for approaching rate limits
     */
    notifyRateLimitApproaching(status, percentageUsed) {
        const message = `API rate limit approaching: ${percentageUsed.toFixed(1)}% used (${status.currentlyAvailable}/${status.maximumAvailable} points remaining)`;
        return this.addNotification({
            type: NotificationType.WARNING,
            topic: NotificationTopic.RATE_LIMIT_APPROACHING,
            message,
            details: status,
        });
    }
    /**
     * Creates a new notification for exceeded rate limits (throttled)
     */
    notifyRateLimitExceeded(status) {
        const message = status
            ? `API rate limit exceeded: ${status.currentlyAvailable}/${status.maximumAvailable} points remaining. Request throttled.`
            : 'API rate limit exceeded. Request throttled.';
        return this.addNotification({
            type: NotificationType.ERROR,
            topic: NotificationTopic.RATE_LIMIT_EXCEEDED,
            message,
            details: status,
        });
    }
    /**
     * Creates a new notification for API errors
     */
    notifyApiError(error) {
        const message = `API Error: ${error.message || 'Unknown error occurred'}`;
        return this.addNotification({
            type: NotificationType.ERROR,
            topic: NotificationTopic.API_ERROR,
            message,
            details: error,
        });
    }
    /**
     * Creates a new notification for plan changes
     */
    notifyPlanChanged(plan, limits) {
        const message = `Shopify plan updated to: ${plan.toUpperCase()}`;
        return this.addNotification({
            type: NotificationType.INFO,
            topic: NotificationTopic.PLAN_CHANGED,
            message,
            details: { plan, limits },
        });
    }
    /**
     * Creates a custom notification
     */
    notify(message, type = NotificationType.INFO, topic = NotificationTopic.SYSTEM, details) {
        return this.addNotification({
            type,
            topic,
            message,
            details,
        });
    }
    /**
     * Adds a new notification to the system
     */
    addNotification(params) {
        const notification = {
            id: this.generateId(),
            timestamp: Date.now(),
            read: false,
            dismissed: false,
            ...params,
        };
        this.notifications.unshift(notification);
        // Trim notifications if they exceed max count
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
        // Persist to storage if enabled
        if (this.persistNotifications) {
            this.saveToStorage();
        }
        // Trigger callback if provided
        if (this.onNewNotification) {
            this.onNewNotification(notification);
        }
        return notification;
    }
    /**
     * Marks a notification as read
     */
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            if (this.persistNotifications) {
                this.saveToStorage();
            }
            return true;
        }
        return false;
    }
    /**
     * Marks a notification as dismissed
     */
    dismiss(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.dismissed = true;
            if (this.persistNotifications) {
                this.saveToStorage();
            }
            return true;
        }
        return false;
    }
    /**
     * Gets all notifications
     */
    getAll() {
        return [...this.notifications];
    }
    /**
     * Gets unread notifications
     */
    getUnread() {
        return this.notifications.filter(n => !n.read);
    }
    /**
     * Gets notifications by topic
     */
    getByTopic(topic) {
        return this.notifications.filter(n => n.topic === topic);
    }
    /**
     * Clears all notifications
     */
    clearAll() {
        this.notifications = [];
        if (this.persistNotifications) {
            this.saveToStorage();
        }
    }
    /**
     * Generates a unique ID for notifications
     */
    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Saves notifications to local storage
     */
    saveToStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
            }
        }
        catch (error) {
            console.error('Failed to save notifications to storage:', error);
        }
    }
    /**
     * Loads notifications from local storage
     */
    loadFromStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    this.notifications = JSON.parse(stored);
                }
            }
        }
        catch (error) {
            console.error('Failed to load notifications from storage:', error);
        }
    }
}
exports.NotificationSystem = NotificationSystem;
//# sourceMappingURL=NotificationSystem.js.map