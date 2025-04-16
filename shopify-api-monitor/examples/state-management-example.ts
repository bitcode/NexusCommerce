/**
 * State Management Example for the Shopify API Monitor
 * 
 * This example demonstrates how to use the StateManager for efficient
 * API request caching and data privacy in a Shopify application.
 */

// Add Node.js type declarations
declare const require: any;
declare const module: { main?: any };

import { createShopifyMonitor, RefreshPolicy, DataCategory } from '../src';

// Replace these values with your actual Shopify store details
const SHOP = 'your-store.myshopify.com';
const ACCESS_TOKEN = 'your-admin-api-access-token';

// Create the monitor with all components including StateManager
const monitor = createShopifyMonitor({
  shop: SHOP,
  accessToken: ACCESS_TOKEN,
  plan: 'standard',
  
  // Configure StateManager
  stateManager: {
    defaultTTL: 300000, // 5 minutes default cache TTL
    maxEntries: 1000,   // Maximum cache entries
    persistCache: true, // Persist cache to localStorage
    sanitizeData: true, // Automatically sanitize sensitive data
  },
});

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

// Run the example
async function runExample() {
  console.log('Starting Shopify API State Management example...');
  
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
  runExample 
};