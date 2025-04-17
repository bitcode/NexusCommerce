# StateManager

The StateManager component provides efficient state management for Shopify API requests, implementing intelligent caching strategies while ensuring data privacy and compliance with data protection regulations.

## Key Features

- **Intelligent Caching**: Reduces API calls by caching responses with configurable TTL (Time-To-Live)
- **Privacy-First Design**: Automatically sanitizes PII and sensitive data before caching
- **Configurable Refresh Policies**: Different strategies for time-sensitive vs. stable data
- **Data Categorization**: Organize data by sensitivity and retention requirements
- **Memory Management**: Limits cache size with LRU (Least Recently Used) eviction
- **Environment Variable Support**: Configure via .env file for consistent deployment across environments

## Configuration

The StateManager can be configured in three ways, with a clear precedence order:

1. **Direct Configuration**: Passed directly to the constructor (highest precedence)
2. **Environment Variables**: Loaded from .env file (middle precedence)
3. **Default Values**: Built-in defaults (lowest precedence)

### Environment Variable Configuration

The StateManager supports the following environment variables in your `.env` file:

| Environment Variable | Description | Default Value | Type |
|----------------------|-------------|---------------|------|
| `STATE_MANAGER_DEFAULT_TTL` | Default time-to-live for cached items in milliseconds | 300000 (5 minutes) | Number |
| `STATE_MANAGER_MAX_ENTRIES` | Maximum number of entries in the cache | 1000 | Number |
| `STATE_MANAGER_PERSIST_CACHE` | Whether to persist cache to localStorage | true | Boolean |
| `STATE_MANAGER_STORAGE_KEY` | Key used for localStorage persistence | 'shopify-api-state-cache' | String |
| `STATE_MANAGER_SANITIZE_DATA` | Whether to automatically sanitize sensitive data | true | Boolean |
| `STATE_MANAGER_CONFIG_TTL` | TTL for CONFIG category items in milliseconds | 86400000 (24 hours) | Number |
| `STATE_MANAGER_OPERATIONAL_TTL` | TTL for OPERATIONAL category items in milliseconds | 300000 (5 minutes) | Number |
| `STATE_MANAGER_ANALYTICS_TTL` | TTL for ANALYTICS category items in milliseconds | 3600000 (1 hour) | Number |
| `STATE_MANAGER_TEMPORARY_TTL` | TTL for TEMPORARY category items in milliseconds | 60000 (1 minute) | Number |

Example `.env` file configuration:

```
# StateManager Configuration
STATE_MANAGER_DEFAULT_TTL=300000
STATE_MANAGER_MAX_ENTRIES=1000
STATE_MANAGER_PERSIST_CACHE=true
STATE_MANAGER_STORAGE_KEY=shopify-api-state-cache
STATE_MANAGER_SANITIZE_DATA=true

# StateManager Category TTLs
STATE_MANAGER_CONFIG_TTL=86400000
STATE_MANAGER_OPERATIONAL_TTL=300000
STATE_MANAGER_ANALYTICS_TTL=3600000
STATE_MANAGER_TEMPORARY_TTL=60000
```

### Configuration Precedence

The StateManager follows these rules when determining configuration values:

1. If a value is explicitly provided in the constructor options, it is used
2. If not provided in constructor options, the corresponding environment variable is used (if available)
3. If neither is available, the built-in default value is used

This allows for flexible configuration across different environments while still enabling local overrides when needed.

## Usage

### Basic Usage with Environment Variables

The simplest way to use the StateManager is to configure it through environment variables:

```typescript
// First, ensure ConfigManager is initialized to load environment variables
import { ConfigManager, createShopifyMonitor, DataCategory, RefreshPolicy } from '../src';

// Initialize ConfigManager with path to your .env file
ConfigManager.getInstance({
  envPath: '.env',
  environment: process.env.NODE_ENV // Optional: 'development', 'production', etc.
});

// Create the monitor - StateManager will use environment variables automatically
const monitor = createShopifyMonitor({
  shop: process.env.SHOPIFY_SHOP || 'your-store.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token',
  // No need to specify stateManager options unless you want to override env vars
});

// Use the StateManager for API requests
const products = await monitor.stateManager.query(
  `query { products(first: 10) { edges { node { id title } } } }`,
  {}, // Variables
  {
    cacheKey: 'products-list',
    category: DataCategory.OPERATIONAL,
    ttl: 600000, // 10 minutes cache (overrides category default)
    refreshPolicy: RefreshPolicy.ON_EXPIRE,
    sanitizeFields: ['customer.email', 'metafields.value'],
  }
);
```

### Overriding Environment Variables

You can override environment variables by providing direct configuration:

```typescript
// Override environment variables with direct configuration
const monitor = createShopifyMonitor({
  shop: 'your-store.myshopify.com',
  accessToken: 'your-access-token',
  stateManager: {
    defaultTTL: 600000, // 10 minutes default cache TTL (overrides env var)
    maxEntries: 2000,   // Maximum cache entries (overrides env var)
    persistCache: true, // Persist cache to localStorage
    sanitizeData: true, // Automatically sanitize sensitive data
  },
});
```

### Checking Current Configuration

You can check the current configuration by examining the StateManager instance:

```typescript
// Display current configuration
console.log('Current StateManager Configuration:');
console.log(`Default TTL: ${monitor.stateManager['config'].defaultTTL}ms`);
console.log(`Max Entries: ${monitor.stateManager['config'].maxEntries}`);
console.log(`Persist Cache: ${monitor.stateManager['config'].persistCache}`);
console.log(`Storage Key: ${monitor.stateManager['config'].storageKey}`);
console.log(`Sanitize Data: ${monitor.stateManager['config'].sanitizeData}`);

// Display category TTLs
console.log('Category TTLs:');
console.log(`CONFIG: ${monitor.stateManager['categoryTTLs'].get(DataCategory.CONFIG)}ms`);
console.log(`OPERATIONAL: ${monitor.stateManager['categoryTTLs'].get(DataCategory.OPERATIONAL)}ms`);
console.log(`ANALYTICS: ${monitor.stateManager['categoryTTLs'].get(DataCategory.ANALYTICS)}ms`);
console.log(`TEMPORARY: ${monitor.stateManager['categoryTTLs'].get(DataCategory.TEMPORARY)}ms`);
```

### Environment-Specific Configuration

You can use different environment files for different environments:

```typescript
// For development
ConfigManager.getInstance({
  envPath: '.env.development',
  environment: 'development'
});

// For production
ConfigManager.getInstance({
  envPath: '.env.production',
  environment: 'production'
});

// For testing
ConfigManager.getInstance({
  envPath: '.env.test',
  environment: 'test'
});
```

## Refresh Policies

The StateManager supports different refresh policies to handle various types of data:

- **NEVER**: Never refresh automatically, only when explicitly invalidated
- **ON_EXPIRE**: Refresh when TTL expires (default)
- **BACKGROUND**: Refresh in background before TTL expires (proactive)
- **ALWAYS**: Always fetch fresh data, bypass cache

```typescript
// Time-sensitive data (inventory levels)
const inventory = await monitor.stateManager.query(
  inventoryQuery,
  {},
  {
    cacheKey: 'inventory-levels',
    category: DataCategory.TEMPORARY,
    ttl: 60000, // 1 minute
    refreshPolicy: RefreshPolicy.ALWAYS, // Always fresh
  }
);

// Relatively stable data (products)
const products = await monitor.stateManager.query(
  productsQuery,
  {},
  {
    cacheKey: 'products-list',
    category: DataCategory.OPERATIONAL,
    ttl: 3600000, // 1 hour
    refreshPolicy: RefreshPolicy.BACKGROUND, // Refresh proactively
  }
);

// Configuration data (shop settings)
const settings = await monitor.stateManager.query(
  settingsQuery,
  {},
  {
    cacheKey: 'shop-settings',
    category: DataCategory.CONFIG,
    ttl: 86400000, // 24 hours
    refreshPolicy: RefreshPolicy.ON_EXPIRE, // Refresh when expired
  }
);
```

## Data Categories

Data is organized into categories that determine default TTL and handling:

| Category | Description | Default TTL | Environment Variable |
|----------|-------------|-------------|---------------------|
| **CONFIG** | Configuration data (no PII, long retention) | 86400000 (24 hours) | STATE_MANAGER_CONFIG_TTL |
| **OPERATIONAL** | Operational data (no PII, medium retention) | 300000 (5 minutes) | STATE_MANAGER_OPERATIONAL_TTL |
| **ANALYTICS** | Analytics data (aggregated, no individual PII) | 3600000 (1 hour) | STATE_MANAGER_ANALYTICS_TTL |
| **TEMPORARY** | Temporary data (short retention, may contain sanitized business data) | 60000 (1 minute) | STATE_MANAGER_TEMPORARY_TTL |

You can override the default TTL for a category at runtime:

```typescript
// Update the TTL for the OPERATIONAL category
monitor.stateManager.setCategoryTTL(DataCategory.OPERATIONAL, 600000); // 10 minutes
```

## Data Privacy

The StateManager automatically sanitizes sensitive data before caching:

```typescript
// Specify fields to sanitize (remove) before caching
const orders = await monitor.stateManager.query(
  ordersQuery,
  {},
  {
    cacheKey: 'recent-orders',
    category: DataCategory.OPERATIONAL,
    sanitizeFields: [
      'customer.email',
      'customer.phone',
      'shippingAddress.address1',
      'shippingAddress.address2',
      'shippingAddress.phone',
      'billingAddress',
      'metafields.value',
    ],
  }
);
```

The `sanitizeFields` option supports dot notation for nested fields. The StateManager will recursively traverse the object and remove the specified fields before caching.

## Cache Management

```typescript
// Invalidate specific cache entries by key pattern
monitor.stateManager.invalidateCache('products-');

// Clear entire cache
monitor.stateManager.clearCache();

// Get cache statistics
const stats = monitor.stateManager.getCacheStats();
console.log(`Total Entries: ${stats.totalEntries}`);
console.log(`Sanitized Entries: ${stats.sanitizedEntries}`);
console.log(`Average Access Count: ${stats.averageAccessCount.toFixed(2)}`);
console.log(`Estimated Cache Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
```

## Developer Guidelines

### What to Cache

- **DO Cache**: Product data, collection data, shop settings, metafield definitions
- **DO Cache**: Aggregated analytics data, inventory levels (with short TTL)
- **DO Cache**: UI configuration, localization data, feature flags

### What NOT to Cache

- **DON'T Cache**: Customer PII (emails, addresses, phone numbers)
- **DON'T Cache**: Payment details, order details with PII
- **DON'T Cache**: Authentication tokens, API keys
- **DON'T Cache**: Raw analytics data that could identify individuals

### Best Practices

1. **Use environment variables** for consistent configuration across environments
   - Store environment-specific configurations in separate .env files (.env.development, .env.production)
   - Use environment variables for all configuration values that might change between environments
   - Document all environment variables in your project README

2. **Always sanitize sensitive fields** before caching
   - Use the `sanitizeFields` option to remove PII and sensitive data
   - Be thorough in identifying all fields that might contain sensitive information
   - Consider using a whitelist approach instead of a blacklist for maximum security

3. **Use appropriate data categories** to ensure proper retention policies
   - Match the data category to the sensitivity and volatility of the data
   - Consider regulatory requirements (GDPR, CCPA, etc.) when choosing categories
   - Document your categorization strategy for team consistency

4. **Set appropriate TTLs** based on data volatility
   - Use shorter TTLs for frequently changing data
   - Use longer TTLs for stable data
   - Consider business requirements when setting TTLs (e.g., inventory levels might need to be very fresh)

5. **Choose the right refresh policy** for your data type
   - Use BACKGROUND for important data that should be proactively refreshed
   - Use ALWAYS for critical data that must always be fresh
   - Use ON_EXPIRE for most data to balance freshness and performance

6. **Invalidate cache** when data is known to be stale
   - Invalidate related cache entries after mutations
   - Use patterns to invalidate groups of related entries
   - Consider implementing a webhook-based cache invalidation strategy

7. **Monitor cache statistics** to ensure efficient memory usage
   - Regularly check cache statistics in development and production
   - Adjust maxEntries based on memory usage patterns
   - Consider implementing alerts for cache-related issues

## Integration with ConfigManager

The StateManager integrates with the ConfigManager to load environment variables. The ConfigManager is responsible for:

1. Loading environment variables from .env files
2. Providing type-safe access to configuration values
3. Supporting environment-specific configuration files

This integration ensures consistent configuration across all components of the application.

## Example Implementation

Here's a complete example showing how to use the StateManager with environment variables:

```typescript
import { createShopifyMonitor, ConfigManager, DataCategory, RefreshPolicy } from '../src';

// Initialize ConfigManager with environment-specific configuration
ConfigManager.getInstance({
  envPath: `.env.${process.env.NODE_ENV || 'development'}`,
  environment: process.env.NODE_ENV || 'development'
});

// Create the monitor with StateManager using environment variables
const monitor = createShopifyMonitor({
  shop: process.env.SHOPIFY_SHOP || 'your-store.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token',
});

// Example function to fetch products with caching
async function fetchProducts() {
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
          }
        }
      }
    }
  `;
  
  // First request - will hit the API and cache the result
  console.log('First request (API call)...');
  const response = await monitor.stateManager.query(
    query,
    {}, // No variables
    {
      cacheKey: 'products-list',
      category: DataCategory.OPERATIONAL,
      refreshPolicy: RefreshPolicy.BACKGROUND,
      sanitizeFields: ['customer.email', 'metafields.value'],
    }
  );
  
  // Second request - will use cached data
  console.log('Second request (from cache)...');
  const cachedResponse = await monitor.stateManager.query(
    query,
    {},
    {
      cacheKey: 'products-list',
      category: DataCategory.OPERATIONAL,
    }
  );
  
  // Display cache statistics
  const stats = monitor.stateManager.getCacheStats();
  console.log(`Total Entries: ${stats.totalEntries}`);
  console.log(`Sanitized Entries: ${stats.sanitizedEntries}`);
  
  return response;
}

// Run the example
fetchProducts().catch(console.error);
```

## Complete Example

See the [state-management-example.ts](../shopify-api-monitor/examples/state-management-example.ts) file for a complete example of how to use the StateManager effectively, including environment variable configuration, different refresh policies, and cache management.