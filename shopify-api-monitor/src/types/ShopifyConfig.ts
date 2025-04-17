/**
 * ShopifyConfig.ts
 * Defines the configuration interface for Shopify API credentials and settings.
 */

/**
 * Core Shopify API configuration interface
 * Contains all required credentials and configuration settings
 */
export interface ShopifyConfig {
  /**
   * Shopify store domain (e.g., 'your-store.myshopify.com')
   */
  shop: string;
  
  /**
   * Shopify API key for authentication
   */
  apiKey: string;
  
  /**
   * Shopify API secret key
   */
  apiSecretKey: string;
  
  /**
   * Optional access token (used for private apps or when OAuth flow is complete)
   */
  accessToken?: string;
  
  /**
   * API version to use (e.g., '2025-04')
   * @default 'latest'
   */
  apiVersion?: string;
  
  /**
   * Shopify plan type (affects rate limits)
   * @default 'standard'
   */
  plan?: 'standard' | 'advanced' | 'plus' | 'enterprise';
  
  /**
   * OAuth-related settings
   */
  oauth?: {
    /**
     * OAuth scopes required by the application
     */
    scopes: string[];
    
    /**
     * Redirect URI for OAuth flow
     */
    redirectUri: string;
    
    /**
     * Whether to use online or offline access mode
     * @default false
     */
    online?: boolean;
  };
  
  /**
   * Webhook configuration
   */
  webhooks?: {
    /**
     * Secret used to validate webhook signatures
     */
    secret?: string;
    
    /**
     * Base URL for webhook endpoints
     */
    baseUrl?: string;
  };
  
  /**
   * Advanced configuration options
   */
  advanced?: {
    /**
     * Maximum retry attempts for failed API calls
     * @default 3
     */
    maxRetries?: number;
    
    /**
     * Base delay in milliseconds between retries (exponential backoff applied)
     * @default 1000
     */
    retryDelay?: number;
    
    /**
     * Timeout in milliseconds for API requests
     * @default 30000
     */
    timeout?: number;
    
    /**
     * Whether to use HTTPS for all requests
     * @default true
     */
    useHttps?: boolean;
    
    /**
     * Custom headers to include with API requests
     */
    customHeaders?: Record<string, string>;
  };
}