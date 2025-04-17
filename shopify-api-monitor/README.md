# Shopify API Monitor

A comprehensive Node.js/TypeScript library for real-time monitoring and management of Shopify API usage, with a focus on rate limit tracking, analytics, proactive notifications, efficient state management, and developer-friendly data operations.

## Features

- **Centralized API Clients**:
  - `ShopifyApiClient` for Admin GraphQL API calls
  - `StorefrontApiClient` for Storefront GraphQL API calls
- **Real-time Rate Limit Monitoring**
- **Usage Analytics**
- **In-app Notifications**
- **Plan Configuration**
- **Automatic Throttling & Backoff**
- **Efficient State Management**
- **Dashboard Components**
- **Full CRUD Operations**
- **Optimistic Updates**
- **React Integration**
- **Comprehensive Product Ecosystem Management**

## Installation

```bash
npm install shopify-api-monitor
```

## Quick Start

### Admin API Usage

```typescript
import { ShopifyApiClient } from 'shopify-api-monitor';

// Create client using environment variables
const client = new ShopifyApiClient({
  useEnvConfig: true
});

// Execute a query
const response = await client.request(`
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`);

console.log(response.data);
```

### Storefront API Usage

```typescript
import { StorefrontApiClient } from 'shopify-api-monitor';

// Create client using environment variables
const client = new StorefrontApiClient({
  useEnvConfig: true
});

// Execute a query
const response = await client.request(`
  query Products {
    products(first: 5) {
      edges {
        node {
          id
          title
          description
        }
      }
    }
  }
`);

console.log(response.data);
```

### Using Context for Localization

```typescript
import { StorefrontApiClient } from 'shopify-api-monitor';

// Create client with context
const client = new StorefrontApiClient({
  useEnvConfig: true,
  context: {
    country: 'US',
    language: 'EN'
  }
});

// Execute a query with context
const response = await client.request(`
  query Products {
    products(first: 5) {
      edges {
        node {
          id
          title
          description
        }
      }
    }
  }
`);

console.log(response.data);
```

## Configuration

Create a `.env` file in your project root:

```
# Admin API Settings
SHOPIFY_SHOP=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET_KEY=your_api_secret_key
SHOPIFY_ACCESS_TOKEN=your_access_token
SHOPIFY_API_VERSION=2025-04

# Storefront API Settings
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=your_public_storefront_token
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=your_private_storefront_token
SHOPIFY_STOREFRONT_API_VERSION=2025-04
SHOPIFY_STOREFRONT_COUNTRY=US
SHOPIFY_STOREFRONT_LANGUAGE=EN
```

## Dashboard Components

The library includes a set of dashboard components for visualizing API usage and managing Shopify resources:

```typescript
import { ProductManagementDashboard } from 'shopify-api-monitor';

// Create dashboard
const dashboard = new ProductManagementDashboard(
  apiClient,
  stateManager,
  mutationManager,
  notificationSystem
);

// Render dashboard
const container = document.getElementById('dashboard-container');
container.innerHTML = dashboard.renderDashboardHTML({ activeSection: 'products' }, metrics);
```

## Dual-View Data Presentation

The library includes a dual-view data presentation system for visualizing Shopify data in both tree and raw formats:

```typescript
import { DualViewPresentation } from 'shopify-api-monitor';

// Create dual-view presentation
const dualView = new DualViewPresentation({
  section: 'products',
  options: {
    initialView: 'tree',
    expandAll: false,
    rawFormat: 'json',
    syntaxHighlight: true
  }
});

// Render dual-view
const container = document.getElementById('dual-view-container');
container.innerHTML = dualView.render(data);
```

## Documentation

For more detailed documentation, see the following guides:

- [Shopify Storefront API Integration Plan](./docs/Shopify_Storefront_API_Integration_Plan.md)
- [StorefrontApiClient Implementation Guide](./docs/StorefrontApiClient_Implementation_Guide.md)
- [Storefront Data Transformers Guide](./docs/Storefront_Data_Transformers_Guide.md)
- [Storefront GraphQL Queries Guide](./docs/Storefront_GraphQL_Queries_Guide.md)
- [Dashboard Storefront Integration Guide](./docs/Dashboard_Storefront_Integration_Guide.md)
- [Storefront API Integration Testing Guide](./docs/Storefront_API_Integration_Testing_Guide.md)

## License

MIT