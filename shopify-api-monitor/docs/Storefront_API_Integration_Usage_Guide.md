# Shopify Storefront API Integration Usage Guide

This guide provides comprehensive documentation for using the Storefront API integration in the Shopify API Monitor project. It covers basic usage, advanced features, best practices, and common use cases.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Basic Usage](#basic-usage)
4. [Advanced Features](#advanced-features)
5. [Error Handling](#error-handling)
6. [Caching](#caching)
7. [Performance Optimization](#performance-optimization)
8. [Best Practices](#best-practices)
9. [Common Use Cases](#common-use-cases)
10. [Troubleshooting](#troubleshooting)

## Introduction

The Storefront API integration provides a robust and efficient way to interact with Shopify's Storefront API. It includes features such as:

- Type-safe GraphQL query execution
- Automatic context handling for localization
- Comprehensive error handling and retry mechanisms
- Performance optimization through caching
- Support for both Admin API and Storefront API

This integration is designed to work seamlessly with the dashboard components, providing a unified interface for managing Shopify resources.

## Getting Started

### Prerequisites

- Shopify store with Storefront API access
- Storefront API access token (public or private)
- Node.js environment

### Installation

The Storefront API integration is part of the Shopify API Monitor package. No additional installation is required.

### Configuration

Create a `.env` file in the root of your project with the following variables:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=your-storefront-api-token
SHOPIFY_STOREFRONT_API_VERSION=2025-04
```

Alternatively, you can provide these values directly when initializing the client.

## Basic Usage

### Initializing the Client

```typescript
import { StorefrontApiClient } from '../src/StorefrontApiClient';
import { NotificationSystem } from '../src/NotificationSystem';

// Create a notification system for error handling
const notificationSystem = new NotificationSystem();

// Initialize the client with environment variables
const client = new StorefrontApiClient({
  notificationSystem,
  enableCaching: true
});

// Or initialize with explicit values
const clientWithExplicitValues = new StorefrontApiClient({
  storeDomain: 'your-store.myshopify.com',
  publicStorefrontToken: 'your-storefront-api-token',
  storefrontApiVersion: '2025-04',
  notificationSystem,
  useEnvConfig: false
});
```

### Executing a Simple Query

```typescript
import { STOREFRONT_PRODUCTS_QUERY } from '../src/queries';

async function fetchProducts() {
  try {
    const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 10
    });
    
    console.log('Products:', response.data.products);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
```

### Using Context for Localization

```typescript
// Set context for localization
client.setContext({
  country: 'US',
  language: 'EN'
});

// Execute a query with the context
const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
  first: 10
});

// Products will be returned with US pricing and English content
```

## Advanced Features

### Working with Multiple Queries

```typescript
import { 
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY
} from '../src/queries';

async function fetchProductsAndCollections() {
  // Fetch products
  const productsResponse = await client.request(STOREFRONT_PRODUCTS_QUERY, {
    first: 10
  });
  
  // Fetch collections
  const collectionsResponse = await client.request(STOREFRONT_COLLECTIONS_QUERY, {
    first: 10
  });
  
  return {
    products: productsResponse.data.products,
    collections: collectionsResponse.data.collections
  };
}
```

### Pagination

```typescript
import { extractPaginationInfo, extractNodesFromEdges } from '../src/queries/StorefrontQueries';

async function fetchAllProducts() {
  let hasNextPage = true;
  let after: string | null = null;
  const allProducts = [];
  
  while (hasNextPage) {
    const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 50,
      after
    });
    
    const products = extractNodesFromEdges(response.data.products.edges);
    allProducts.push(...products);
    
    // Get pagination info
    const paginationInfo = extractPaginationInfo(response.data, 'products');
    hasNextPage = paginationInfo.hasNextPage;
    after = paginationInfo.endCursor || null;
  }
  
  return allProducts;
}
```

### Using the Fetch All Pages Utility

```typescript
import { fetchAllPages } from '../src/queries/StorefrontQueries';

async function fetchAllProducts() {
  const allProducts = await fetchAllPages(
    client,
    STOREFRONT_PRODUCTS_QUERY,
    { first: 50 },
    'products'
  );
  
  return allProducts;
}
```

## Error Handling

The Storefront API integration includes comprehensive error handling with retry mechanisms for transient errors.

### Basic Error Handling

```typescript
try {
  const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
    first: 10
  });
  
  // Process response
} catch (error) {
  console.error('Error fetching products:', error);
  
  // Handle error appropriately
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('authentication')) {
    // Handle authentication errors
  } else {
    // Handle other errors
  }
}
```

### Using the Error Handling Utilities

```typescript
import { handleError, ErrorCategory } from '../src/ErrorHandlingUtils';

try {
  const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
    first: 10
  });
  
  // Process response
} catch (error) {
  // Use the error handling utilities
  const userMessage = handleError(error, notificationSystem, {
    operation: 'fetchProducts',
    component: 'ProductsPage'
  });
  
  // Display the user-friendly message
  console.error(userMessage);
}
```

### Retry Mechanisms

The client automatically retries transient errors such as network issues and rate limiting. You can customize the retry behavior:

```typescript
const clientWithCustomRetry = new StorefrontApiClient({
  retryOptions: {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  }
});
```

## Caching

The Storefront API integration includes a caching system to improve performance and reduce API calls.

### Basic Caching

Caching is enabled by default. The client automatically caches responses and uses them for subsequent identical requests:

```typescript
// First request - fetches from API
const response1 = await client.request(STOREFRONT_PRODUCTS_QUERY, {
  first: 10
});

// Second request - uses cached response
const response2 = await client.request(STOREFRONT_PRODUCTS_QUERY, {
  first: 10
});

console.log('From cache:', response2.fromCache); // true
```

### Customizing Cache Behavior

```typescript
// Skip cache for this request
const response = await client.request(
  STOREFRONT_PRODUCTS_QUERY,
  { first: 10 },
  { skipCache: true }
);

// Custom TTL (time-to-live) for this request
const responseWithCustomTTL = await client.request(
  STOREFRONT_PRODUCTS_QUERY,
  { first: 10 },
  { ttl: 60 * 1000 } // 1 minute
);

// Custom cache tags for invalidation
const responseWithTags = await client.request(
  STOREFRONT_PRODUCTS_QUERY,
  { first: 10 },
  { tags: ['featured-products'] }
);
```

### Cache Invalidation

```typescript
// Invalidate specific resource types
client.invalidateCache(['products', 'collections']);

// Clear entire cache
client.clearCache();
```

## Performance Optimization

### Optimizing Queries

Request only the fields you need to minimize response size and improve performance:

```typescript
const OPTIMIZED_PRODUCTS_QUERY = `
  query OptimizedProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          # Only request fields you need
        }
      }
    }
  }
`;

const response = await client.request(OPTIMIZED_PRODUCTS_QUERY, {
  first: 10
});
```

### Using Fragments for Reusable Field Sets

```typescript
const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const PRODUCTS_WITH_FRAGMENT_QUERY = `
  ${PRODUCT_FRAGMENT}
  
  query ProductsWithFragment($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;
```

### Virtualization for Large Datasets

When displaying large datasets in the UI, use virtualization to render only the visible items:

```typescript
// Example using a virtualization library like react-window
import { FixedSizeList } from 'react-window';

function ProductList({ products }) {
  return (
    <FixedSizeList
      height={500}
      width={300}
      itemCount={products.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>
          {products[index].title}
        </div>
      )}
    </FixedSizeList>
  );
}
```

## Best Practices

### 1. Use the Provided Query Definitions

The project includes predefined query definitions in the `queries` directory. Use these instead of writing your own queries to ensure consistency and maintainability.

### 2. Handle Pagination Properly

Always check for pagination information and implement proper pagination handling for large datasets.

### 3. Implement Error Handling

Always wrap API calls in try/catch blocks and handle errors appropriately. Use the provided error handling utilities for consistent error handling.

### 4. Use Caching Wisely

Enable caching for read-only operations but disable it for operations that need fresh data. Use appropriate TTL values based on how frequently the data changes.

### 5. Optimize Query Field Selection

Only request the fields you need to minimize response size and improve performance.

### 6. Use Context for Localization

Set the appropriate context for localization to ensure users see content in their preferred language and with the correct currency.

### 7. Implement Retry Mechanisms

Use the provided retry mechanisms for transient errors to improve reliability.

### 8. Monitor API Usage

Use the provided monitoring tools to track API usage and avoid hitting rate limits.

## Common Use Cases

### Fetching Products for a Catalog Page

```typescript
async function fetchProductsForCatalog(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  
  const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
    first: pageSize,
    after: skip > 0 ? `cursor-${skip}` : null
  });
  
  return {
    products: extractNodesFromEdges(response.data.products.edges),
    pagination: extractPaginationInfo(response.data, 'products')
  };
}
```

### Fetching Product Details

```typescript
async function fetchProductDetails(handle) {
  const PRODUCT_BY_HANDLE_QUERY = `
    query ProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        handle
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              sku
            }
          }
        }
      }
    }
  `;
  
  const response = await client.request(PRODUCT_BY_HANDLE_QUERY, {
    handle
  });
  
  return response.data.productByHandle;
}
```

### Fetching Collections with Products

```typescript
async function fetchCollectionsWithProducts(collectionsCount = 5, productsPerCollection = 10) {
  const COLLECTIONS_WITH_PRODUCTS_QUERY = `
    query CollectionsWithProducts($collectionsCount: Int!, $productsCount: Int!) {
      collections(first: $collectionsCount) {
        edges {
          node {
            id
            title
            handle
            products(first: $productsCount) {
              edges {
                node {
                  id
                  title
                  handle
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  
  const response = await client.request(COLLECTIONS_WITH_PRODUCTS_QUERY, {
    collectionsCount,
    productsCount: productsPerCollection
  });
  
  return extractNodesFromEdges(response.data.collections.edges);
}
```

## Troubleshooting

### Common Issues and Solutions

#### Rate Limiting

**Issue**: You're hitting Shopify's rate limits.

**Solution**: 
- Implement caching to reduce the number of API calls
- Use the retry mechanisms with appropriate backoff
- Optimize queries to request only needed fields
- Batch requests where possible

#### Authentication Errors

**Issue**: You're getting authentication errors.

**Solution**:
- Verify your Storefront API token is correct
- Check that your token has the necessary access scopes
- Ensure your token hasn't expired

#### Network Errors

**Issue**: You're experiencing network errors.

**Solution**:
- Use the retry mechanisms with appropriate backoff
- Implement proper error handling
- Check your network connection

#### Large Response Sizes

**Issue**: API responses are too large and slow to process.

**Solution**:
- Optimize queries to request only needed fields
- Implement pagination for large datasets
- Use virtualization for rendering large datasets

### Debugging Tips

1. Enable debug logging in the CacheManager:
   ```typescript
   const client = new StorefrontApiClient({
     advanced: {
       debug: true
     }
   });
   ```

2. Check cache statistics:
   ```typescript
   const stats = client.getCacheStats();
   console.log('Cache stats:', stats);
   ```

3. Monitor API response times:
   ```typescript
   const startTime = performance.now();
   const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
     first: 10
   });
   const endTime = performance.now();
   console.log(`Request took ${endTime - startTime}ms`);
   ```

4. Check if responses are coming from cache:
   ```typescript
   const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
     first: 10
   });
   console.log('From cache:', response.fromCache);
   ```

5. Use the browser developer tools to monitor network requests and responses.

---

This guide covers the basic and advanced usage of the Storefront API integration. For more specific use cases or questions, please refer to the API documentation or contact the development team.