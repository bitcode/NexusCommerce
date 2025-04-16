# Shopify API Usage Monitor

A comprehensive Node.js/TypeScript library for real-time monitoring and management of Shopify API usage, with a focus on rate limit tracking, analytics, and proactive notifications.

## Features

- **Centralized API Client**: All Shopify Admin GraphQL API calls are routed through a single service that tracks rate limits.
- **Real-time Rate Limit Monitoring**: Parses `throttleStatus` from every API response to track available points.
- **Usage Analytics**: Tracks and visualizes API usage patterns over time.
- **In-app Notifications**: Proactive alerts when approaching or exceeding rate limits.
- **Plan Configuration**: Support for different Shopify plans (Standard, Advanced, Plus, Enterprise) with appropriate thresholds.
- **Automatic Throttling & Backoff**: Implements leaky bucket algorithm and exponential backoff for rate-limited requests.
- **Efficient State Management**: Intelligent caching with privacy controls to minimize API requests while ensuring data protection.
- **Dashboard Components**: Framework-agnostic UI components for displaying analytics and notifications.
- **Full CRUD Operations**: Standardized data operations for all Shopify resources with validation and optimistic updates.
- **React Integration**: React hooks and components for seamless integration with React applications.

## Installation

```bash
npm install shopify-api-monitor
```

## Quick Start

```typescript
import { createShopifyMonitor, ShopifyResourceType } from 'shopify-api-monitor';

// Create a fully configured monitor
const monitor = createShopifyMonitor({
  shop: 'your-store.myshopify.com',
  accessToken: 'your-admin-api-access-token',
  plan: 'standard', // or 'advanced', 'plus', 'enterprise'
  stateManager: {
    defaultTTL: 300000, // 5 minutes default cache TTL
    maxEntries: 1000,   // Maximum cache entries
    persistCache: true, // Persist cache to localStorage
    sanitizeData: true, // Automatically sanitize sensitive data
  },
});

// Use the Data Operations Layer for CRUD operations
async function fetchProducts() {
  try {
    // Read products with caching
    const result = await monitor.read(
      ShopifyResourceType.PRODUCT,
      {
        first: 10,
        cacheOptions: {
          cacheKey: 'products-list',
          ttl: 600000, // 10 minutes cache
          sanitizeFields: ['metafields.value'] // Fields to sanitize
        }
      }
    );
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Create a new product
async function createProduct() {
  const newProduct = {
    title: 'New Product',
    description: 'Product description',
    productType: 'Test',
    vendor: 'Test Vendor'
  };
  
  try {
    // Create with optimistic updates
    const result = await monitor.create(
      ShopifyResourceType.PRODUCT,
      newProduct,
      { optimisticUpdate: true }
    );
    
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// Get current API usage analytics
function displayAnalytics() {
  const summary = monitor.analytics.getSummary();
  console.log(`API Usage: ${summary.usagePercentage.toFixed(1)}%`);
  console.log(`Points remaining: ${summary.currentStatus?.currentlyAvailable || 0}`);
  console.log(`Throttled requests: ${summary.throttledRequests}`);
}

// Update Shopify plan if it changes
function updatePlan(newPlan) {
  monitor.planConfig.updatePlan(newPlan);
}

// Get recent notifications
function displayNotifications() {
  const notifications = monitor.notifications.getUnread();
  notifications.forEach(n => console.log(`${n.type}: ${n.message}`));
}
```

## Components

### DataOperations

Provides standardized CRUD operations for all Shopify resources with validation and optimistic updates.

```typescript
import { DataOperations, ShopifyResourceType } from 'shopify-api-monitor';

// Create a DataOperations instance
const dataOps = new DataOperations(apiClient, stateManager, mutationManager);

// Create a resource
const newProduct = await dataOps.create(
  ShopifyResourceType.PRODUCT,
  {
    title: 'New Product',
    description: 'Product description',
    productType: 'Test'
  },
  { optimisticUpdate: true }
);

// Read resources
const products = await dataOps.read(
  ShopifyResourceType.PRODUCT,
  { first: 10 }
);

// Update a resource
const updatedProduct = await dataOps.update(
  ShopifyResourceType.PRODUCT,
  productId,
  { title: 'Updated Title' }
);

// Delete a resource
const success = await dataOps.delete(
  ShopifyResourceType.PRODUCT,
  productId
);
```

### MutationManager

Handles optimistic updates and error recovery for mutations.

```typescript
import { MutationManager } from 'shopify-api-monitor';

const mutationManager = new MutationManager(stateManager, notifications);

// Register a mutation with optimistic update
const operationId = mutationManager.registerMutation(
  {
    type: 'create',
    resourceType: ShopifyResourceType.PRODUCT,
    input: productData
  },
  (stateManager) => {
    // Apply optimistic update to cache
  }
);

// Complete a mutation
mutationManager.completeMutation(operationId, result);

// Handle a failed mutation
mutationManager.failMutation(operationId, error);
```

### ValidationService

Provides validation for Shopify resource data.

```typescript
import { ValidationService, ShopifyResourceType } from 'shopify-api-monitor';

const validationService = new ValidationService();

// Validate data against schema
const validationResult = validationService.validate(
  ShopifyResourceType.PRODUCT,
  productData
);

if (!validationResult.valid) {
  console.error('Validation errors:', validationResult.errors);
}
```

### ShopifyApiClient

Handles all API calls with built-in rate limit tracking and automatic retry with exponential backoff.

```typescript
import { ShopifyApiClient } from 'shopify-api-monitor';

const client = new ShopifyApiClient({
  shop: 'your-store.myshopify.com',
  accessToken: 'your-admin-api-access-token',
  plan: 'standard',
  onRateLimitApproaching: (status) => {
    console.warn(`Rate limit approaching: ${status.currentlyAvailable}/${status.maximumAvailable}`);
  },
  onThrottled: (status) => {
    console.error(`Request throttled! Available: ${status.currentlyAvailable}`);
  },
});

// Make GraphQL requests
const response = await client.request(query, variables);
```

### UsageAnalytics

Tracks and analyzes API usage patterns over time.

```typescript
import { UsageAnalytics } from 'shopify-api-monitor';

const analytics = new UsageAnalytics({
  maxHistoryLength: 1000,
  persistData: true,
});

// Record API usage
analytics.recordApiUsage(costData, endpoint, operation);

// Get usage summary
const summary = analytics.getSummary();
```

### PlanConfig

Manages Shopify plan configuration and associated rate limits.

```typescript
import { PlanConfig } from 'shopify-api-monitor';

const planConfig = new PlanConfig({
  initialPlan: 'standard',
  onPlanChange: (plan, limits) => {
    console.log(`Plan updated to ${plan} with ${limits.pointsPerSecond} points/second`);
  },
});

// Update plan
planConfig.updatePlan('plus');

// Get current limits
const limits = planConfig.getCurrentRateLimits();
```

### NotificationSystem

Provides in-app notifications for rate limit alerts and API usage events.

```typescript
import { NotificationSystem, NotificationType, NotificationTopic } from 'shopify-api-monitor';

const notifications = new NotificationSystem({
  maxNotifications: 100,
  onNewNotification: (notification) => {
    console.log(`New notification: ${notification.message}`);
  },
});

// Create notifications
notifications.notifyRateLimitApproaching(status, percentageUsed);
notifications.notifyRateLimitExceeded(status);

// Custom notifications
notifications.notify(
  'Custom message',
  NotificationType.INFO,
  NotificationTopic.SYSTEM
);
```

### StateManager

Provides efficient state management with intelligent caching and data privacy controls.

```typescript
import { StateManager, RefreshPolicy, DataCategory } from 'shopify-api-monitor';

const stateManager = new StateManager(apiClient, {
  defaultTTL: 300000, // 5 minutes default cache TTL
  maxEntries: 1000,   // Maximum cache entries
  persistCache: true, // Persist cache to localStorage
  sanitizeData: true, // Automatically sanitize sensitive data
});

// Query with caching and privacy controls
const products = await stateManager.query(
  productsQuery,
  {}, // Variables
  {
    cacheKey: 'products-list',
    category: DataCategory.OPERATIONAL,
    ttl: 600000, // 10 minutes cache
    refreshPolicy: RefreshPolicy.BACKGROUND,
    sanitizeFields: ['customer.email', 'metafields.value'], // Fields to remove
  }
);

// Cache management
stateManager.invalidateCache('products-');
stateManager.clearCache();
const stats = stateManager.getCacheStats();
```

See [StateManager documentation](./docs/StateManager.md) for more details on data privacy best practices.

## Dashboard Integration

The library includes framework-agnostic UI components that can be implemented in any frontend framework.

```typescript
import { renderBasicDashboardHTML } from 'shopify-api-monitor/dashboard';

// Get data from monitor
const dashboardProps = {
  apiStatus: {
    currentStatus: monitor.apiClient.getLastThrottleStatus() || null,
    usagePercentage: monitor.analytics.getSummary().usagePercentage,
  },
  analytics: monitor.analytics.getSummary(),
  notifications: monitor.notifications.getAll(),
  planConfig: {
    currentPlan: monitor.planConfig.getCurrentPlan(),
    availablePlans: monitor.planConfig.getAllPlans(),
  },
  onPlanChange: (plan) => monitor.planConfig.updatePlan(plan),
  onDismissNotification: (id) => monitor.notifications.dismiss(id),
  onDismissAllNotifications: () => monitor.notifications.clearAll(),
};

// Render basic HTML dashboard
const dashboardHTML = renderBasicDashboardHTML(dashboardProps);
document.getElementById('dashboard-container').innerHTML = dashboardHTML;

// Or implement in your framework of choice using the component interfaces
```

## Best Practices

- Always use this library for all Shopify API calls to ensure accurate rate limit tracking.
- Monitor the dashboard regularly to identify usage patterns and optimize API calls.
- Use the Data Operations Layer for all CRUD operations to benefit from validation and optimistic updates.
- Use the StateManager for custom queries to benefit from intelligent caching and data privacy controls.
- Configure appropriate TTLs and refresh policies based on data volatility:
  - Use short TTLs (1-5 minutes) for inventory and time-sensitive data
  - Use medium TTLs (10-60 minutes) for product and collection data
  - Use longer TTLs (1+ hours) for shop settings and configuration
- Always sanitize sensitive customer data before caching using the `sanitizeFields` option.
- Use the bulk operations API for large data tasks to bypass standard rate limits.
- Implement optimistic updates for a better user experience with faster perceived performance.
- Validate data before sending to the API to prevent errors and improve reliability.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.