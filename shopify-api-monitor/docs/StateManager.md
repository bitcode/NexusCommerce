# StateManager

The StateManager component provides efficient state management for Shopify API requests, implementing intelligent caching strategies while ensuring data privacy and compliance with data protection regulations.

## Key Features

- **Intelligent Caching**: Reduces API calls by caching responses with configurable TTL (Time-To-Live)
- **Privacy-First Design**: Automatically sanitizes PII and sensitive data before caching
- **Configurable Refresh Policies**: Different strategies for time-sensitive vs. stable data
- **Data Categorization**: Organize data by sensitivity and retention requirements
- **Memory Management**: Limits cache size with LRU (Least Recently Used) eviction

## Usage

### Basic Usage

```typescript
// Initialize with the Shopify API Monitor
const monitor = createShopifyMonitor({
  shop: 'your-store.myshopify.com',
  accessToken: 'your-access-token',
  stateManager: {
    defaultTTL: 300000, // 5 minutes default cache TTL
    maxEntries: 1000,   // Maximum cache entries
    persistCache: true, // Persist cache to localStorage
    sanitizeData: true, // Automatically sanitize sensitive data
  },
});

// Use the StateManager for API requests
const products = await monitor.stateManager.query(
  `query { products(first: 10) { edges { node { id title } } } }`,
  {}, // Variables
  {
    cacheKey: 'products-list',
    category: DataCategory.OPERATIONAL,
    ttl: 600000, // 10 minutes cache
    refreshPolicy: RefreshPolicy.ON_EXPIRE,
    sanitizeFields: ['customer.email', 'metafields.value'],
  }
);
```

### Refresh Policies

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

### Data Categories

Data is organized into categories that determine default TTL and handling:

- **CONFIG**: Configuration data (no PII, long retention)
- **OPERATIONAL**: Operational data (no PII, medium retention)
- **ANALYTICS**: Analytics data (aggregated, no individual PII)
- **TEMPORARY**: Temporary data (short retention, may contain sanitized business data)

### Data Privacy

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

### Cache Management

```typescript
// Invalidate specific cache entries by key pattern
monitor.stateManager.invalidateCache('products-');

// Clear entire cache
monitor.stateManager.clearCache();

// Get cache statistics
const stats = monitor.stateManager.getCacheStats();
console.log(`Total Entries: ${stats.totalEntries}`);
console.log(`Sanitized Entries: ${stats.sanitizedEntries}`);
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

1. **Always sanitize sensitive fields** before caching using the `sanitizeFields` option
2. **Use appropriate data categories** to ensure proper retention policies
3. **Set appropriate TTLs** based on data volatility
4. **Choose the right refresh policy** for your data type
5. **Invalidate cache** when data is known to be stale
6. **Monitor cache statistics** to ensure efficient memory usage

## Example

See the [state-management-example.ts](../examples/state-management-example.ts) file for a complete example of how to use the StateManager effectively.