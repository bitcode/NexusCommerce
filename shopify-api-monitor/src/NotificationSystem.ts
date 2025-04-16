/**
 * NotificationSystem.ts
 * Provides in-app notifications for rate limit alerts and API usage events.
 * Can be extended to support additional notification channels.
 */

import { ShopifyThrottleStatus } from './ShopifyApiClient';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum NotificationTopic {
  RATE_LIMIT_APPROACHING = 'rate-limit-approaching',
  RATE_LIMIT_EXCEEDED = 'rate-limit-exceeded',
  API_ERROR = 'api-error',
  PLAN_CHANGED = 'plan-changed',
  SYSTEM = 'system',
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

export class NotificationSystem {
  private notifications: Notification[] = [];
  private maxNotifications: number;
  private storageKey: string;
  private persistNotifications: boolean;
  private onNewNotification?: (notification: Notification) => void;

  constructor(options: NotificationSystemOptions = {}) {
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
  notifyRateLimitApproaching(status: ShopifyThrottleStatus, percentageUsed: number): Notification {
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
  notifyRateLimitExceeded(status: ShopifyThrottleStatus | undefined): Notification {
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
  notifyApiError(error: any): Notification {
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
  notifyPlanChanged(plan: string, limits: any): Notification {
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
  notify(
    message: string,
    type: NotificationType = NotificationType.INFO,
    topic: NotificationTopic = NotificationTopic.SYSTEM,
    details?: any
  ): Notification {
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
  private addNotification(
    params: {
      type: NotificationType;
      topic: NotificationTopic;
      message: string;
      details?: any;
    }
  ): Notification {
    const notification: Notification = {
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
  markAsRead(id: string): boolean {
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
  dismiss(id: string): boolean {
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
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Gets unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Gets notifications by topic
   */
  getByTopic(topic: NotificationTopic): Notification[] {
    return this.notifications.filter(n => n.topic === topic);
  }

  /**
   * Clears all notifications
   */
  clearAll(): void {
    this.notifications = [];
    if (this.persistNotifications) {
      this.saveToStorage();
    }
  }

  /**
   * Generates a unique ID for notifications
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Saves notifications to local storage
   */
  private saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
      }
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  /**
   * Loads notifications from local storage
   */
  private loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.notifications = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }
}