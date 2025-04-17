/**
 * StorefrontConfig.ts
 * Defines the configuration interface for Shopify Storefront API credentials and settings.
 */

/**
 * Core Shopify Storefront API configuration interface
 * Contains all required credentials and configuration settings
 */
export interface StorefrontConfig {
  /**
   * Shopify store domain (e.g., 'your-store.myshopify.com')
   */
  storeDomain: string;
  
  /**
   * Public Storefront API token for client-side access
   */
  publicStorefrontToken?: string;
  
  /**
   * Private Storefront API token for server-side access
   */
  privateStorefrontToken?: string;
  
  /**
   * Storefront API version to use (e.g., '2025-04')
   * @default 'latest'
   */
  storefrontApiVersion?: string;
  
  /**
   * Context settings for the Storefront API
   */
  context?: StorefrontContext;
  
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
    
    /**
     * Whether to include the Buyer IP header in requests
     * @default true
     */
    includeBuyerIp?: boolean;
  };
}

/**
 * Context settings for the Storefront API
 * Used for localization and buyer identity
 */
export interface StorefrontContext {
  /**
   * Country code for localization (e.g., 'US', 'CA')
   */
  country?: string;
  
  /**
   * Language code for localization (e.g., 'EN', 'FR')
   */
  language?: string;
  
  /**
   * Buyer identity information
   */
  buyerIdentity?: {
    /**
     * Customer access token for authenticated requests
     */
    customerAccessToken?: string;
    
    /**
     * Customer email
     */
    email?: string;
    
    /**
     * Customer phone number
     */
    phone?: string;
    
    /**
     * Customer country code
     */
    countryCode?: string;
  };
}