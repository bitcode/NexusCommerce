/**
 * ConfigManagerExtension.ts
 * Extends the ConfigManager to support Storefront API configuration.
 */

import { ConfigManager } from './ConfigManager';
import { StorefrontConfig, StorefrontContext } from './types/StorefrontConfig';

/**
 * Extends the ConfigManager class with Storefront API configuration support
 */
export class StorefrontConfigManager {
  private static instance: StorefrontConfigManager;
  private config: Partial<StorefrontConfig> = {};
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(private configManager: ConfigManager) {
    this.parseEnvToConfig();
  }
  
  /**
   * Get the singleton instance of StorefrontConfigManager
   */
  public static getInstance(configManager: ConfigManager = ConfigManager.getInstance()): StorefrontConfigManager {
    if (!StorefrontConfigManager.instance) {
      StorefrontConfigManager.instance = new StorefrontConfigManager(configManager);
    }
    return StorefrontConfigManager.instance;
  }
  
  /**
   * Parse environment variables into the Storefront config object
   */
  private parseEnvToConfig(): void {
    // Core Storefront settings
    this.config.storeDomain = process.env.SHOPIFY_STORE_DOMAIN || '';
    this.config.publicStorefrontToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN || undefined;
    this.config.privateStorefrontToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN || undefined;
    this.config.storefrontApiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || '2025-04';
    
    // Context settings
    if (process.env.SHOPIFY_STOREFRONT_COUNTRY || process.env.SHOPIFY_STOREFRONT_LANGUAGE) {
      this.config.context = this.config.context || {};
      
      if (process.env.SHOPIFY_STOREFRONT_COUNTRY) {
        this.config.context.country = process.env.SHOPIFY_STOREFRONT_COUNTRY;
      }
      
      if (process.env.SHOPIFY_STOREFRONT_LANGUAGE) {
        this.config.context.language = process.env.SHOPIFY_STOREFRONT_LANGUAGE;
      }
    }
    
    // Buyer identity settings
    if (
      process.env.SHOPIFY_STOREFRONT_CUSTOMER_ACCESS_TOKEN ||
      process.env.SHOPIFY_STOREFRONT_CUSTOMER_EMAIL ||
      process.env.SHOPIFY_STOREFRONT_CUSTOMER_PHONE ||
      process.env.SHOPIFY_STOREFRONT_CUSTOMER_COUNTRY_CODE
    ) {
      if (!this.config.context) {
        this.config.context = {};
      }
      
      this.config.context.buyerIdentity = {};
      
      if (process.env.SHOPIFY_STOREFRONT_CUSTOMER_ACCESS_TOKEN) {
        this.config.context.buyerIdentity.customerAccessToken = process.env.SHOPIFY_STOREFRONT_CUSTOMER_ACCESS_TOKEN;
      }
      
      if (process.env.SHOPIFY_STOREFRONT_CUSTOMER_EMAIL) {
        this.config.context.buyerIdentity.email = process.env.SHOPIFY_STOREFRONT_CUSTOMER_EMAIL;
      }
      
      if (process.env.SHOPIFY_STOREFRONT_CUSTOMER_PHONE) {
        this.config.context.buyerIdentity.phone = process.env.SHOPIFY_STOREFRONT_CUSTOMER_PHONE;
      }
      
      if (process.env.SHOPIFY_STOREFRONT_CUSTOMER_COUNTRY_CODE) {
        this.config.context.buyerIdentity.countryCode = process.env.SHOPIFY_STOREFRONT_CUSTOMER_COUNTRY_CODE;
      }
    }
    
    // Advanced settings
    if (
      process.env.SHOPIFY_STOREFRONT_MAX_RETRIES ||
      process.env.SHOPIFY_STOREFRONT_RETRY_DELAY ||
      process.env.SHOPIFY_STOREFRONT_TIMEOUT ||
      process.env.SHOPIFY_STOREFRONT_USE_HTTPS ||
      process.env.SHOPIFY_STOREFRONT_INCLUDE_BUYER_IP
    ) {
      this.config.advanced = this.config.advanced || {};
      
      if (process.env.SHOPIFY_STOREFRONT_MAX_RETRIES) {
        this.config.advanced.maxRetries = parseInt(process.env.SHOPIFY_STOREFRONT_MAX_RETRIES, 10);
      }
      
      if (process.env.SHOPIFY_STOREFRONT_RETRY_DELAY) {
        this.config.advanced.retryDelay = parseInt(process.env.SHOPIFY_STOREFRONT_RETRY_DELAY, 10);
      }
      
      if (process.env.SHOPIFY_STOREFRONT_TIMEOUT) {
        this.config.advanced.timeout = parseInt(process.env.SHOPIFY_STOREFRONT_TIMEOUT, 10);
      }
      
      if (process.env.SHOPIFY_STOREFRONT_USE_HTTPS) {
        this.config.advanced.useHttps = process.env.SHOPIFY_STOREFRONT_USE_HTTPS === 'true';
      }
      
      if (process.env.SHOPIFY_STOREFRONT_INCLUDE_BUYER_IP) {
        this.config.advanced.includeBuyerIp = process.env.SHOPIFY_STOREFRONT_INCLUDE_BUYER_IP === 'true';
      }
    }
    
    // Parse any custom headers from environment
    const customHeaderPrefix = 'SHOPIFY_STOREFRONT_HEADER_';
    Object.keys(process.env)
      .filter(key => key.startsWith(customHeaderPrefix))
      .forEach(key => {
        const headerName = key.substring(customHeaderPrefix.length).toLowerCase();
        if (!this.config.advanced) {
          this.config.advanced = {};
        }
        if (!this.config.advanced.customHeaders) {
          this.config.advanced.customHeaders = {};
        }
        this.config.advanced.customHeaders[headerName] = process.env[key] || '';
      });
  }
  
  /**
   * Get the complete Storefront configuration object
   */
  public getStorefrontConfig(): Partial<StorefrontConfig> {
    return { ...this.config };
  }
  
  /**
   * Get a specific Storefront configuration value
   */
  public get<K extends keyof StorefrontConfig>(key: K): StorefrontConfig[K] | undefined {
    return this.config[key];
  }
  
  /**
   * Set a specific Storefront configuration value
   */
  public set<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]): void {
    this.config[key] = value;
  }
  
  /**
   * Check if the Storefront configuration is valid (has all required fields)
   */
  public validate(): { valid: boolean; missing: string[]; tokenMissing: boolean } {
    const requiredFields: (keyof StorefrontConfig)[] = ['storeDomain'];
    const missing = requiredFields.filter(field => !this.config[field]);
    
    // Either publicStorefrontToken or privateStorefrontToken is required
    const tokenMissing = !this.config.publicStorefrontToken && !this.config.privateStorefrontToken;
    
    return {
      valid: missing.length === 0 && !tokenMissing,
      missing,
      tokenMissing
    };
  }
  
  /**
   * Create a sample .env file with all Storefront API options
   */
  public static createSampleStorefrontEnvFile(outputPath: string = '.env.storefront.sample'): void {
    const sampleContent = `# Shopify Storefront API Configuration
# Core Settings
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=your_public_storefront_token
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=your_private_storefront_token
SHOPIFY_STOREFRONT_API_VERSION=2025-04

# Context Settings
SHOPIFY_STOREFRONT_COUNTRY=US
SHOPIFY_STOREFRONT_LANGUAGE=EN

# Buyer Identity Settings
SHOPIFY_STOREFRONT_CUSTOMER_ACCESS_TOKEN=your_customer_access_token
SHOPIFY_STOREFRONT_CUSTOMER_EMAIL=customer@example.com
SHOPIFY_STOREFRONT_CUSTOMER_PHONE=+1234567890
SHOPIFY_STOREFRONT_CUSTOMER_COUNTRY_CODE=US

# Advanced Settings
SHOPIFY_STOREFRONT_MAX_RETRIES=3
SHOPIFY_STOREFRONT_RETRY_DELAY=1000
SHOPIFY_STOREFRONT_TIMEOUT=30000
SHOPIFY_STOREFRONT_USE_HTTPS=true
SHOPIFY_STOREFRONT_INCLUDE_BUYER_IP=true

# Custom Headers (prefix with SHOPIFY_STOREFRONT_HEADER_)
SHOPIFY_STOREFRONT_HEADER_X_CUSTOM_HEADER=custom_value
`;
    
    const fs = require('fs');
    fs.writeFileSync(outputPath, sampleContent);
    console.log(`Sample Storefront .env file created at ${outputPath}`);
  }
  
  /**
   * Update the ConfigManager's createSampleEnvFile method to include Storefront API options
   */
  public static updateSampleEnvFile(): void {
    const originalCreateSampleEnvFile = ConfigManager.createSampleEnvFile;
    
    ConfigManager.createSampleEnvFile = function(outputPath: string = '.env.sample'): void {
      originalCreateSampleEnvFile(outputPath);
      
      const fs = require('fs');
      const storefrontSample = `
# Storefront API Settings
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=your_public_storefront_token
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=your_private_storefront_token
SHOPIFY_STOREFRONT_API_VERSION=2025-04
SHOPIFY_STOREFRONT_COUNTRY=US
SHOPIFY_STOREFRONT_LANGUAGE=EN
`;
      
      fs.appendFileSync(outputPath, storefrontSample);
      console.log(`Updated sample .env file with Storefront API options at ${outputPath}`);
    };
  }
}

// Export a default instance
export default StorefrontConfigManager.getInstance();