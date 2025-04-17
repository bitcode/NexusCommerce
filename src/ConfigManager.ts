/**
 * ConfigManager.ts
 * Centralized configuration management for the application.
 * Loads configuration from environment variables or defaults.
 */

export interface Config {
  // Shopify store configuration
  storeDomain: string;
  publicStorefrontToken?: string;
  privateStorefrontToken?: string;
  storefrontApiVersion: string;
  
  // API client configuration
  shop?: string;
  accessToken?: string;
  apiVersion?: string;
  plan?: 'standard' | 'advanced' | 'plus' | 'enterprise';
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    // Initialize with environment variables or defaults
    this.config = {
      storeDomain: process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || '',
      publicStorefrontToken: process.env.REACT_APP_SHOPIFY_PUBLIC_STOREFRONT_TOKEN,
      privateStorefrontToken: process.env.REACT_APP_SHOPIFY_PRIVATE_STOREFRONT_TOKEN,
      storefrontApiVersion: process.env.REACT_APP_SHOPIFY_STOREFRONT_API_VERSION || '2025-04',
      shop: process.env.REACT_APP_SHOPIFY_SHOP,
      accessToken: process.env.REACT_APP_SHOPIFY_ACCESS_TOKEN,
      apiVersion: process.env.REACT_APP_SHOPIFY_API_VERSION || '2023-10',
      plan: (process.env.REACT_APP_SHOPIFY_PLAN || 'standard') as Config['plan'],
    };
  }

  /**
   * Get the singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the current configuration
   */
  public static getConfig(): Config {
    return ConfigManager.getInstance().config;
  }

  /**
   * Update the configuration
   * @param newConfig - New configuration values to merge
   */
  public static updateConfig(newConfig: Partial<Config>): void {
    const instance = ConfigManager.getInstance();
    instance.config = {
      ...instance.config,
      ...newConfig,
    };
  }
}

export default ConfigManager;
