/**
 * ConfigManager.ts
 * Centralized configuration management for the application.
 * Handles loading environment variables, validation, and providing access to configuration.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ShopifyConfig } from './types/ShopifyConfig';

export interface ConfigManagerOptions {
  /**
   * Path to the .env file
   * @default '.env'
   */
  envPath?: string;
  
  /**
   * Whether to throw errors on missing required variables
   * @default true
   */
  strict?: boolean;
  
  /**
   * Environment to use (development, production, test)
   * Will look for .env.{environment} file if specified
   */
  environment?: string;
  
  /**
   * Default values to use if not found in environment
   */
  defaults?: Partial<ShopifyConfig>;
}

/**
 * ConfigManager class for centralized configuration management
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Partial<ShopifyConfig> = {};
  private envLoaded = false;
  private options: ConfigManagerOptions;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(options: ConfigManagerOptions = {}) {
    this.options = {
      envPath: '.env',
      strict: true,
      ...options
    };
    
    this.loadEnv();
  }
  
  /**
   * Get the singleton instance of ConfigManager
   */
  public static getInstance(options?: ConfigManagerOptions): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(options);
    }
    return ConfigManager.instance;
  }
  
  /**
   * Load environment variables from .env file
   */
  private loadEnv(): void {
    try {
      // Determine which .env file to load based on environment
      let envPath = this.options.envPath || '.env';
      
      if (this.options.environment) {
        const envSpecificPath = `${envPath}.${this.options.environment}`;
        if (fs.existsSync(envSpecificPath)) {
          envPath = envSpecificPath;
        }
      }
      
      // Load .env file
      try {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const envVars = this.parseEnvFile(envContent);
          
          // Add parsed variables to process.env
          Object.keys(envVars).forEach(key => {
            process.env[key] = envVars[key];
          });
          
          this.envLoaded = true;
          console.log(`Loaded environment variables from ${envPath}`);
        } else {
          console.warn(`Warning: .env file not found at ${envPath}`);
        }
      } catch (error) {
        console.warn(`Warning: Could not load .env file from ${envPath}`, error);
      }
      
      // Initialize config with defaults
      this.config = { ...this.options.defaults };
      
      // Parse environment variables into config
      this.parseEnvToConfig();
      
    } catch (error) {
      console.error('Error loading environment variables:', error);
      if (this.options.strict) {
        throw error;
      }
    }
  }
  
  /**
   * Parse a .env file content into an object
   * @param content The content of the .env file
   * @returns An object with the parsed environment variables
   */
  private parseEnvFile(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    
    // Split by lines and process each line
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Parse key=value format
      const equalSignIndex = trimmedLine.indexOf('=');
      if (equalSignIndex > 0) {
        const key = trimmedLine.substring(0, equalSignIndex).trim();
        let value = trimmedLine.substring(equalSignIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Parse environment variables into the config object
   */
  private parseEnvToConfig(): void {
    // Core Shopify settings
    this.config.shop = process.env.SHOPIFY_SHOP || this.config.shop;
    this.config.apiKey = process.env.SHOPIFY_API_KEY || this.config.apiKey;
    this.config.apiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || this.config.apiSecretKey;
    this.config.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || this.config.accessToken;
    this.config.apiVersion = process.env.SHOPIFY_API_VERSION || this.config.apiVersion;
    this.config.plan = (process.env.SHOPIFY_PLAN as ShopifyConfig['plan']) || this.config.plan;
    
    // OAuth settings
    if (process.env.SHOPIFY_OAUTH_SCOPES || process.env.SHOPIFY_OAUTH_REDIRECT_URI) {
      this.config.oauth = this.config.oauth || {
        scopes: [],
        redirectUri: ''
      };
      
      if (process.env.SHOPIFY_OAUTH_SCOPES && this.config.oauth) {
        this.config.oauth.scopes = process.env.SHOPIFY_OAUTH_SCOPES.split(',').map(scope => scope.trim());
      }
      
      if (process.env.SHOPIFY_OAUTH_REDIRECT_URI && this.config.oauth) {
        this.config.oauth.redirectUri = process.env.SHOPIFY_OAUTH_REDIRECT_URI;
      }
      
      if (process.env.SHOPIFY_OAUTH_ONLINE && this.config.oauth) {
        this.config.oauth.online = process.env.SHOPIFY_OAUTH_ONLINE === 'true';
      }
    }
    
    // Webhook settings
    if (process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_WEBHOOK_BASE_URL) {
      this.config.webhooks = this.config.webhooks || {};
      
      if (process.env.SHOPIFY_WEBHOOK_SECRET) {
        this.config.webhooks.secret = process.env.SHOPIFY_WEBHOOK_SECRET;
      }
      
      if (process.env.SHOPIFY_WEBHOOK_BASE_URL) {
        this.config.webhooks.baseUrl = process.env.SHOPIFY_WEBHOOK_BASE_URL;
      }
    }
    
    // Advanced settings
    if (
      process.env.SHOPIFY_MAX_RETRIES ||
      process.env.SHOPIFY_RETRY_DELAY ||
      process.env.SHOPIFY_TIMEOUT ||
      process.env.SHOPIFY_USE_HTTPS
    ) {
      this.config.advanced = this.config.advanced || {};
      
      if (process.env.SHOPIFY_MAX_RETRIES) {
        this.config.advanced.maxRetries = parseInt(process.env.SHOPIFY_MAX_RETRIES, 10);
      }
      
      if (process.env.SHOPIFY_RETRY_DELAY) {
        this.config.advanced.retryDelay = parseInt(process.env.SHOPIFY_RETRY_DELAY, 10);
      }
      
      if (process.env.SHOPIFY_TIMEOUT) {
        this.config.advanced.timeout = parseInt(process.env.SHOPIFY_TIMEOUT, 10);
      }
      
      if (process.env.SHOPIFY_USE_HTTPS) {
        this.config.advanced.useHttps = process.env.SHOPIFY_USE_HTTPS === 'true';
      }
    }
    
    // Parse any custom headers from environment
    const customHeaderPrefix = 'SHOPIFY_HEADER_';
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
   * Get the complete configuration object
   */
  public getConfig(): Partial<ShopifyConfig> {
    return { ...this.config };
  }
  
  /**
   * Get a specific configuration value
   */
  public get<K extends keyof ShopifyConfig>(key: K): ShopifyConfig[K] | undefined {
    return this.config[key];
  }
  
  /**
   * Set a specific configuration value
   */
  public set<K extends keyof ShopifyConfig>(key: K, value: ShopifyConfig[K]): void {
    this.config[key] = value;
  }
  
  /**
   * Check if the configuration is valid (has all required fields)
   */
  public validate(): { valid: boolean; missing: string[] } {
    const requiredFields: (keyof ShopifyConfig)[] = ['shop', 'apiKey', 'apiSecretKey'];
    const missing = requiredFields.filter(field => !this.config[field]);
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
  
  /**
   * Create a sample .env file with all available options
   */
  public static createSampleEnvFile(outputPath: string = '.env.sample'): void {
    const sampleContent = `# Shopify API Configuration
# Core Settings
SHOPIFY_SHOP=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET_KEY=your_api_secret_key
SHOPIFY_ACCESS_TOKEN=your_access_token
SHOPIFY_API_VERSION=2025-04
SHOPIFY_PLAN=standard # standard, advanced, plus, enterprise

# OAuth Settings
SHOPIFY_OAUTH_SCOPES=read_products,write_products,read_orders
SHOPIFY_OAUTH_REDIRECT_URI=https://your-app.com/auth/callback
SHOPIFY_OAUTH_ONLINE=false

# Webhook Settings
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
SHOPIFY_WEBHOOK_BASE_URL=https://your-app.com/webhooks

# Advanced Settings
SHOPIFY_MAX_RETRIES=3
SHOPIFY_RETRY_DELAY=1000
SHOPIFY_TIMEOUT=30000
SHOPIFY_USE_HTTPS=true

# Custom Headers (prefix with SHOPIFY_HEADER_)
SHOPIFY_HEADER_X_CUSTOM_HEADER=custom_value
`;

    fs.writeFileSync(outputPath, sampleContent);
    console.log(`Sample .env file created at ${outputPath}`);
  }
}

// Export a default instance
export default ConfigManager.getInstance();