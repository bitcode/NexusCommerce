/**
 * StorefrontApiClient.ts
 * Type definitions for the Storefront API client.
 */

export interface StorefrontContext {
  country?: string;
  language?: string;
  preferredLocation?: {
    country?: string;
    language?: string;
  };
}

export interface StorefrontApiClientOptions {
  /**
   * Shopify store domain (e.g., 'your-store.myshopify.com')
   */
  storeDomain?: string;
  
  /**
   * Shopify Storefront API public access token
   */
  publicStorefrontToken?: string;
  
  /**
   * Shopify Storefront API private access token (if available)
   */
  privateStorefrontToken?: string;
  
  /**
   * Shopify Storefront API version (e.g., '2025-04')
   */
  storefrontApiVersion?: string;
  
  /**
   * Context for localization and personalization
   */
  context?: StorefrontContext;
  
  /**
   * Use environment variables from ConfigManager
   * @default true
   */
  useEnvConfig?: boolean;
  
  /**
   * Advanced configuration options
   */
  advanced?: {
    /**
     * Custom headers to include with requests
     */
    customHeaders?: Record<string, string>;
    
    /**
     * Whether to include buyer IP in requests
     * @default true
     */
    includeBuyerIp?: boolean;
  };
}
