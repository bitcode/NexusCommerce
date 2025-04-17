/**
 * State Management Example for the Shopify API Monitor
 * 
 * This example demonstrates how to use the StateManager for efficient
 * API request caching and data privacy in a Shopify application.
 * 
 * The StateManager can be configured either through direct options
 * or through environment variables in the .env file.
 */

// Add Node.js type declarations
declare const require: any;
declare const module: { main?: any };

import { createShopifyMonitor, RefreshPolicy, DataCategory, ConfigManager } from '../src';

// Example 1: Using environment variables from .env file
// Make sure you have the following in your .env file:
// STATE_MANAGER_DEFAULT_TTL=300000
// STATE_MANAGER_MAX_ENTRIES=1000
// STATE_MANAGER_PERSIST_CACHE=true
// STATE_MANAGER_STORAGE_KEY=shopify-api-state-cache
// STATE_MANAGER_SANITIZE_DATA=true
// STATE_MANAGER_CONFIG_TTL=86400000
// STATE_MANAGER_OPERATIONAL_TTL=300000
// STATE_MANAGER_ANALYTICS_TTL=3600000
// STATE_MANAGER_TEMPORARY_TTL=60000

// Initialize ConfigManager to load environment variables
ConfigManager.getInstance({
  envPath: '.env', // Path to your .env file
  environment: process.env.NODE_ENV // Optional: 'development', 'production', etc.
});

// Create the monitor with all components including StateManager
// The StateManager will use environment variables from .env file
const monitorWithEnvConfig = createShopifyMonitor({
  // These can be loaded from environment variables too via ConfigManager
  shop: process.env.SHOPIFY_SHOP || 'your-store.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-admin-api-access-token',
  plan: (process.env.SHOPIFY_PLAN as any) || 'standard',
  
  // StateManager will use environment variables by default
  // No need to specify stateManager options unless you want to override
});

// Example 2: Using direct configuration (overrides environment variables)
const monitorWithDirectConfig = createShopifyMonitor({
  shop: process.env.SHOPIFY_SHOP || 'your-store.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-admin-api-access-token',
  plan: (process.env.SHOPIFY_PLAN as any) || 'standard',
  
  // Configure StateManager directly (overrides environment variables)
  stateManager: {
    defaultTTL: 600000, // 10 minutes default cache TTL (overrides env var)
    maxEntries: 2000,   // Maximum cache entries (overrides env var)
    persistCache: true, // Persist cache to localStorage
    sanitizeData: true, // Automatically sanitize sensitive data
  },
});

// Use the monitor with environment variables for this example
const monitor = monitorWithEnvConfig;

// Example: Fetch products with caching
async function fetchProductsWithCaching() {
  console.log('Fetching products with caching...');
  
  const query = `
    query GetProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            createdAt
            updatedAt
          }
        }
      }
    }
  `;
  
  // Fields to sanitize (remove) from the response before caching
  // This ensures no sensitive data is stored in the cache
  const fieldsToSanitize = [
    'customer.email',
    'customer.phone',
    'metafields.value', // Sanitize metafield values that might contain PII
  ];
  
  try {
    // First request - will hit the API and cache the result
    console.log('First request (API call)...');
    const response = await monitor.stateManager.query(
      query,
      {}, // No variables
      {
        cacheKey: 'products-list',
        category: DataCategory.OPERATIONAL,
        ttl: 600000, // 10 minutes cache
        refreshPolicy: RefreshPolicy.BACKGROUND,
        sanitizeFields: fieldsToSanitize,
      }
    );
    
    const products = response?.products?.edges || [];
    console.log(`Fetched ${products.length} products from API`);
    
    // Second request - will use cached data
    console.log('\nSecond request (from cache)...');
    const cachedResponse = await monitor.stateManager.query(
      query,
      {},
      {
        cacheKey: 'products-list',
        category: DataCategory.OPERATIONAL,
      }
    );
    
    const cachedProducts = cachedResponse?.products?.edges || [];
    console.log(`Fetched ${cachedProducts.length} products from cache`);
    
    // Display cache statistics
    displayCacheStats();
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Example: Fetch time-sensitive data with different refresh policies
async function fetchInventoryLevels() {
  console.log('\nFetching inventory levels (time-sensitive data)...');
  
  const query = `
    query GetInventoryLevels {
      inventoryLevels(first: 5) {
        edges {
          node {
            id
            available
            item {
              id
              sku
            }
          }
        }
      }
    }
  `;
  
  try {
    // Use a shorter TTL and ALWAYS refresh policy for time-sensitive data
    const response = await monitor.stateManager.query(
      query,
      {},
      {
        cacheKey: 'inventory-levels',
        category: DataCategory.TEMPORARY, // Short-lived data
        ttl: 60000, // 1 minute cache only
        refreshPolicy: RefreshPolicy.ALWAYS, // Always get fresh data
      }
    );
    
    const levels = response?.inventoryLevels?.edges || [];
    console.log(`Fetched ${levels.length} inventory levels`);
    
    return levels;
  } catch (error) {
    console.error('Error fetching inventory levels:', error);
    return [];
  }
}

// Example: Display cache statistics
function displayCacheStats() {
  console.log('\n--- Cache Statistics ---');
  const stats = monitor.stateManager.getCacheStats();
  console.log(`Total Entries: ${stats.totalEntries}`);
  console.log(`Sanitized Entries: ${stats.sanitizedEntries}`);
  console.log(`Average Access Count: ${stats.averageAccessCount.toFixed(2)}`);
  console.log(`Estimated Cache Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
  console.log('-------------------------\n');
}

// Example: Invalidate specific cache entries
function invalidateProductCache() {
  console.log('Invalidating product cache...');
  monitor.stateManager.invalidateCache('products-');
  console.log('Product cache invalidated');
  
  // Display updated cache statistics
  displayCacheStats();
}

// Example: Display current environment configuration
function displayEnvironmentConfig() {
  console.log('\n--- Environment Configuration ---');
  console.log(`STATE_MANAGER_DEFAULT_TTL: ${process.env.STATE_MANAGER_DEFAULT_TTL || '(not set)'}`);
  console.log(`STATE_MANAGER_MAX_ENTRIES: ${process.env.STATE_MANAGER_MAX_ENTRIES || '(not set)'}`);
  console.log(`STATE_MANAGER_PERSIST_CACHE: ${process.env.STATE_MANAGER_PERSIST_CACHE || '(not set)'}`);
  console.log(`STATE_MANAGER_STORAGE_KEY: ${process.env.STATE_MANAGER_STORAGE_KEY || '(not set)'}`);
  console.log(`STATE_MANAGER_SANITIZE_DATA: ${process.env.STATE_MANAGER_SANITIZE_DATA || '(not set)'}`);
  console.log('-------------------------\n');
}

// Run the example
async function runExample() {
  console.log('Starting Shopify API State Management example...');
  
  // Display environment configuration
  displayEnvironmentConfig();
  
  // Fetch products with caching
  await fetchProductsWithCaching();
  
  // Fetch time-sensitive inventory data
  await fetchInventoryLevels();
  
  // Invalidate product cache
  invalidateProductCache();
  
  console.log('Example completed!');
}

// Run the example if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runExample().catch(error => {
    console.error('Error running example:', error);
  });
}

// Export functions for importing in other files
export { 
  fetchProductsWithCaching, 
  fetchInventoryLevels, 
  displayCacheStats, 
  invalidateProductCache,
  displayEnvironmentConfig,
  runExample 
};