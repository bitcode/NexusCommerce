/**
 * ShopifyApiClient.ts
 * Centralized service for all Shopify Admin GraphQL API calls,
 * real-time rate limit monitoring, and automated throttling/backoff.
 */

import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { ShopifyConfig } from './types/ShopifyConfig';
import ConfigManager from './ConfigManager';

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
  /**
   * Shopify store domain (e.g., 'your-store.myshopify.com')
   * Can be loaded from environment via ConfigManager
   */
  shop?: string;
  
  /**
   * Shopify access token for API authentication
   * Can be loaded from environment via ConfigManager
   */
  accessToken?: string;
  
  /**
   * Shopify API version (e.g., '2025-04')
   * Can be loaded from environment via ConfigManager
   */
  apiVersion?: string;
  
  /**
   * Shopify plan type (affects rate limits)
   * Can be loaded from environment via ConfigManager
   */
  plan?: 'standard' | 'advanced' | 'plus' | 'enterprise';
  
  /**
   * Callback when rate limit is approaching threshold
   */
  onRateLimitApproaching?: (status: ShopifyThrottleStatus) => void;
  
  /**
   * Callback when request is throttled
   */
  onThrottled?: (status: ShopifyThrottleStatus) => void;
  
  /**
   * Use environment variables from ConfigManager
   * @default true
   */
  useEnvConfig?: boolean;
}

export class ShopifyApiClient {
  private client: GraphQLClient;
  private plan: ShopifyApiClientOptions['plan'];
  private onRateLimitApproaching?: (status: ShopifyThrottleStatus) => void;
  private onThrottled?: (status: ShopifyThrottleStatus) => void;
  private lastThrottleStatus?: ShopifyThrottleStatus;
  private static RATE_LIMIT_THRESHOLDS = {
    standard: 100,
    advanced: 200,
    plus: 1000,
    enterprise: 2000,
  };

  constructor(private options: ShopifyApiClientOptions) {
    // Load configuration from environment if enabled
    let shop: string;
    let accessToken: string;
    let apiVersion: string;
    let plan: ShopifyApiClientOptions['plan'];
    
    if (options.useEnvConfig !== false) {
      // Get config from ConfigManager
      const config = ConfigManager.getConfig();
      
      // Use options if provided, otherwise use config values
      shop = options.shop || config.shop || '';
      accessToken = options.accessToken || config.accessToken || '';
      apiVersion = options.apiVersion || config.apiVersion || '2023-10';
      plan = options.plan || (config.plan as ShopifyApiClientOptions['plan']) || 'standard';
      
      // Validate required fields
      if (!shop) {
        throw new Error('Missing required configuration: shop. Provide it in options or .env file.');
      }
      
      if (!accessToken) {
        throw new Error('Missing required configuration: accessToken. Provide it in options or .env file.');
      }
    } else {
      // Use only the provided options
      shop = options.shop || '';
      accessToken = options.accessToken || '';
      apiVersion = options.apiVersion || '2023-10';
      plan = options.plan || 'standard';
      
      // Validate required fields
      if (!shop) {
        throw new Error('Missing required option: shop');
      }
      
      if (!accessToken) {
        throw new Error('Missing required option: accessToken');
      }
    }
    
    this.plan = plan;
    this.onRateLimitApproaching = options.onRateLimitApproaching;
    this.onThrottled = options.onThrottled;
    
    this.client = new GraphQLClient(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * Executes a GraphQL query/mutation with rate limit monitoring and backoff.
   */
  async request<T = any>(
    document: RequestDocument,
    variables?: Variables
  ): Promise<ShopifyApiResponse<T>> {
    let attempt = 0;
    const maxAttempts = 5;
    let lastThrottleStatus: ShopifyThrottleStatus | undefined;

    while (attempt < maxAttempts) {
      try {
        // Ensure document is a string (GraphQLClient expects string, not DocumentNode)
        const queryString = typeof document === 'string' ? document : (document as any).loc?.source?.body;
        if (!queryString) {
          throw new Error('GraphQL query must be a string or have a loc.source.body property.');
        }
        const response = await this.client.rawRequest<T>(queryString, variables);
        const cost = (response.extensions as any)?.cost as ShopifyCostExtensions | undefined;
        if (cost && cost.throttleStatus) {
          lastThrottleStatus = cost.throttleStatus;
          this.lastThrottleStatus = cost.throttleStatus;
          this.handleRateLimit(cost.throttleStatus);
        }
        return {
          data: response.data,
          errors: (response as any).errors,
          extensions: { cost },
        };
      } catch (error: any) {
        // Check for throttling in error response
        const isThrottled =
          error?.response?.errors?.some(
            (e: any) => e.extensions?.code === 'THROTTLED'
          ) || error?.response?.status === 429;
        if (isThrottled && lastThrottleStatus) {
          if (this.onThrottled) this.onThrottled(lastThrottleStatus);
          const backoff = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((res) => setTimeout(res, backoff));
          attempt++;
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retry attempts reached for Shopify API request.');
  }

  /**
   * Handles rate limit events and triggers notifications if thresholds are crossed.
   */
  private handleRateLimit(status: ShopifyThrottleStatus) {
    const planKey = this.plan || 'standard';
    const threshold = Math.floor(
      ShopifyApiClient.RATE_LIMIT_THRESHOLDS[planKey] * 0.8
    );
    if (status.currentlyAvailable < threshold && this.onRateLimitApproaching) {
      this.onRateLimitApproaching(status);
    }
  }

  /**
   * Returns the last known throttle status.
   */
  getLastThrottleStatus(): ShopifyThrottleStatus | undefined {
    return this.lastThrottleStatus;
  }

  /**
   * Allows updating the Shopify plan (affects thresholds).
   */
  setPlan(plan: ShopifyApiClientOptions['plan']) {
    this.plan = plan;
  }
}