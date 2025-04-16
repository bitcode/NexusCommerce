/**
 * index.ts
 * Main entry point for the Shopify API Usage Monitoring and Management system.
 * Exports all components and provides a convenient factory function.
 */

import { ShopifyApiClient, ShopifyApiClientOptions, ShopifyThrottleStatus } from './ShopifyApiClient';
import { UsageAnalytics, UsageAnalyticsOptions } from './UsageAnalytics';
import { PlanConfig, PlanConfigOptions, ShopifyPlan } from './PlanConfig';
import { NotificationSystem, NotificationSystemOptions, NotificationType, NotificationTopic } from './NotificationSystem';
import { StateManager, CacheConfig, RefreshPolicy, DataCategory, StateRequestOptions } from './StateManager';
import { MutationManager } from './MutationManager';
import { ValidationService, ValidationResult, ValidationError } from './ValidationService';
import { DataOperations } from './DataOperations';
import { 
  ShopifyResourceType, 
  ReadOptions, 
  MutationOptions, 
  QueryResult,
  MutationOperation,
  OptimisticUpdateFunction
} from './types/ShopifyResourceTypes';

export {
  // ShopifyApiClient exports
  ShopifyApiClient,
  ShopifyApiClientOptions,
  ShopifyThrottleStatus,
  
  // UsageAnalytics exports
  UsageAnalytics,
  UsageAnalyticsOptions,
  
  // PlanConfig exports
  PlanConfig,
  PlanConfigOptions,
  ShopifyPlan,
  
  // NotificationSystem exports
  NotificationSystem,
  NotificationSystemOptions,
  NotificationType,
  NotificationTopic,
  
  // StateManager exports
  StateManager,
  CacheConfig,
  RefreshPolicy,
  DataCategory,
  StateRequestOptions,
  
  // New Data Operations Layer exports
  MutationManager,
  ValidationService,
  ValidationResult,
  ValidationError,
  DataOperations,
  
  // Resource Types exports
  ShopifyResourceType,
  ReadOptions,
  MutationOptions,
  QueryResult,
  MutationOperation,
  OptimisticUpdateFunction
};

export interface ShopifyMonitorOptions {
  shop: string;
  accessToken: string;
  apiVersion?: string;
  plan?: ShopifyPlan;
  analytics?: UsageAnalyticsOptions;
  notifications?: NotificationSystemOptions;
  planConfig?: PlanConfigOptions;
  stateManager?: {
    defaultTTL?: number;
    maxEntries?: number;
    persistCache?: boolean;
    sanitizeData?: boolean;
  };
}

export interface ShopifyMonitor {
  apiClient: ShopifyApiClient;
  analytics: UsageAnalytics;
  planConfig: PlanConfig;
  notifications: NotificationSystem;
  stateManager: StateManager;
  mutationManager: MutationManager;
  dataOperations: DataOperations;
  
  // Convenience methods for data operations
  query: <T>(document: string, variables?: any, options?: Partial<StateRequestOptions>) => Promise<T>;
  create: <T>(resourceType: ShopifyResourceType, data: Partial<T>, options?: MutationOptions) => Promise<T>;
  read: <T>(resourceType: ShopifyResourceType, options?: ReadOptions) => Promise<QueryResult<T>>;
  update: <T>(resourceType: ShopifyResourceType, id: string, data: Partial<T>, options?: MutationOptions) => Promise<T>;
  delete: (resourceType: ShopifyResourceType, id: string, options?: MutationOptions) => Promise<boolean>;
}

/**
 * Creates a fully configured Shopify API monitoring system with all components
 * wired together for real-time rate limit tracking, analytics, and notifications.
 */
export function createShopifyMonitor(options: ShopifyMonitorOptions): ShopifyMonitor {
  // Initialize components
  const analytics = new UsageAnalytics(options.analytics);
  const notifications = new NotificationSystem(options.notifications);
  
  // Initialize plan config with callback to notify on plan changes
  const planConfig = new PlanConfig({
    ...options.planConfig,
    initialPlan: options.plan,
    onPlanChange: (plan, limits) => {
      notifications.notifyPlanChanged(plan, limits);
    },
  });
  
  // Initialize API client with callbacks for rate limit events
  const apiClient = new ShopifyApiClient({
    shop: options.shop,
    accessToken: options.accessToken,
    apiVersion: options.apiVersion,
    plan: planConfig.getCurrentPlan(),
    onRateLimitApproaching: (status: ShopifyThrottleStatus) => {
      // Calculate percentage used
      const percentageUsed = 100 - (status.currentlyAvailable / status.maximumAvailable * 100);
      
      // Notify through notification system
      notifications.notifyRateLimitApproaching(status, percentageUsed);
    },
    onThrottled: (status: ShopifyThrottleStatus) => {
      // Record throttled request in analytics
      analytics.recordThrottledRequest(status);
      
      // Notify through notification system
      notifications.notifyRateLimitExceeded(status);
    },
  });
  
  // Wrap the original request method to track analytics
  const originalRequest = apiClient.request.bind(apiClient);
  apiClient.request = async (document, variables) => {
    try {
      const response = await originalRequest(document, variables);
      
      // Record successful API usage if cost data is available
      if (response.extensions?.cost) {
        analytics.recordApiUsage(
          response.extensions.cost,
          typeof document === 'string' 
            ? document.substring(0, 50) 
            : (document as any)?.loc?.source?.body?.substring(0, 50) || 'unknown',
          variables ? JSON.stringify(variables).substring(0, 50) : undefined
        );
      }
      
      return response;
    } catch (error) {
      // Notify of API errors (non-throttling related)
      notifications.notifyApiError(error);
      throw error;
    }
  };
  
  // Initialize state manager for efficient caching and data privacy
  const stateManager = new StateManager(apiClient, {
    defaultTTL: options.stateManager?.defaultTTL || 300000, // 5 minutes default
    maxEntries: options.stateManager?.maxEntries || 1000,
    persistCache: options.stateManager?.persistCache !== undefined ? options.stateManager.persistCache : true,
    sanitizeData: options.stateManager?.sanitizeData !== undefined ? options.stateManager.sanitizeData : true,
  });
  
  // Initialize mutation manager for optimistic updates
  const mutationManager = new MutationManager(stateManager, notifications);
  
  // Initialize data operations for CRUD functionality
  const dataOperations = new DataOperations(apiClient, stateManager, mutationManager);

  return {
    apiClient,
    analytics,
    planConfig,
    notifications,
    stateManager,
    mutationManager,
    dataOperations,
    
    // Convenience methods
    query: <T>(document: string, variables?: any, options?: Partial<StateRequestOptions>) => 
      dataOperations.query<T>(document, variables, options),
      
    create: <T>(resourceType: ShopifyResourceType, data: Partial<T>, options?: MutationOptions) => 
      dataOperations.create<T>(resourceType, data, options),
      
    read: <T>(resourceType: ShopifyResourceType, options?: ReadOptions) => 
      dataOperations.read<T>(resourceType, options),
      
    update: <T>(resourceType: ShopifyResourceType, id: string, data: Partial<T>, options?: MutationOptions) => 
      dataOperations.update<T>(resourceType, id, data, options),
      
    delete: (resourceType: ShopifyResourceType, id: string, options?: MutationOptions) => 
      dataOperations.delete(resourceType, id, options)
  };
}

// Default export for convenience
export default createShopifyMonitor;