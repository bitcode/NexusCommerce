# Storefront GraphQL Queries Implementation Guide

This document provides implementation guidelines for the GraphQL queries needed to interact with the Shopify Storefront API. These queries will be used by the StorefrontApiClient to fetch data for our dashboard.

## Overview

The Shopify Storefront API is GraphQL-only, requiring well-structured queries to fetch the data needed for our dashboard. This guide covers:

1. Basic query structure for the Storefront API
2. Queries for each resource type (Products, Collections, etc.)
3. Implementation of the `@inContext` directive for localization
4. Handling pagination for large datasets
5. Error handling and response processing

## File Structure

```
shopify-api-monitor/src/queries/
├── StorefrontQueries.ts
├── ProductQueries.ts
├── CollectionQueries.ts
├── ContentQueries.ts
├── MetaobjectQueries.ts
└── MenuQueries.ts
```

## Basic Query Structure

All Storefront API queries should follow this basic structure:

```graphql
query OperationName($variable1: Type!, $variable2: Type) @inContext(country: COUNTRY_CODE) {
  resourceName(first: $variable1, after: $variable2) {
    edges {
      node {
        id
        field1
        field2
        nestedResource {
          edges {
            node {
              id
              nestedField1
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Key components:
- **Operation name**: Descriptive name for the query
- **Variables**: Input parameters for the query
- **@inContext directive**: Optional directive for localization
- **Pagination fields**: `first` and `after` for cursor-based pagination
- **PageInfo**: For handling multi-page results

## Product Queries

### Fetch Products

```typescript
export const STOREFRONT_PRODUCTS_QUERY = `#graphql
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          description
          descriptionHtml
          handle
          productType
          tags
          vendor
          availableForSale
          options {
            id
            name
            values
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          images(first: 20) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Fetch Single Product

```typescript
export const STOREFRONT_PRODUCT_BY_ID_QUERY = `#graphql
  query ProductById($id: ID!) {
    product(id: $id) {
      id
      title
      description
      descriptionHtml
      handle
      productType
      tags
      vendor
      availableForSale
      options {
        id
        name
        values
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 20) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;
```

### Fetch Products by Collection

```typescript
export const STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY = `#graphql
  query ProductsByCollection($collectionId: ID!, $first: Int!, $after: String) {
    collection(id: $collectionId) {
      id
      title
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            description
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
```

## Collection Queries

### Fetch Collections

```typescript
export const STOREFRONT_COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          id
          title
          description
          descriptionHtml
          handle
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 5) {
            edges {
              node {
                id
                title
              }
            }
            totalCount
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Fetch Single Collection

```typescript
export const STOREFRONT_COLLECTION_BY_ID_QUERY = `#graphql
  query CollectionById($id: ID!) {
    collection(id: $id) {
      id
      title
      description
      descriptionHtml
      handle
      image {
        id
        url
        altText
        width
        height
      }
      products(first: 10) {
        edges {
          node {
            id
            title
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
        totalCount
      }
    }
  }
`;
```

## Content Queries

### Fetch Pages

```typescript
export const STOREFRONT_PAGES_QUERY = `#graphql
  query Pages($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          bodySummary
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Fetch Blogs and Articles

```typescript
export const STOREFRONT_BLOGS_QUERY = `#graphql
  query Blogs($first: Int!, $after: String) {
    blogs(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          articles(first: 5) {
            edges {
              node {
                id
                title
                handle
                publishedAt
                content
                excerpt
                image {
                  id
                  url
                  altText
                }
              }
            }
            totalCount
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

## Metaobject Queries

### Fetch Metaobject Definitions

```typescript
export const STOREFRONT_METAOBJECT_DEFINITIONS_QUERY = `#graphql
  query MetaobjectDefinitions($first: Int!, $after: String) {
    metaobjectDefinitions(first: $first, after: $after) {
      edges {
        node {
          id
          name
          type
          fieldDefinitions {
            name
            key
            type
            required
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

### Fetch Metaobjects

```typescript
export const STOREFRONT_METAOBJECTS_QUERY = `#graphql
  query Metaobjects($type: String!, $first: Int!, $after: String) {
    metaobjects(type: $type, first: $first, after: $after) {
      edges {
        node {
          id
          handle
          type
          fields {
            key
            value
            type
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

## Menu Queries

### Fetch Menus

```typescript
export const STOREFRONT_MENUS_QUERY = `#graphql
  query Menus($first: Int!, $after: String) {
    menus(first: $first, after: $after) {
      edges {
        node {
          id
          handle
          title
          items {
            id
            title
            url
            type
            items {
              id
              title
              url
              type
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

## Shop Information Query

```typescript
export const STOREFRONT_SHOP_INFO_QUERY = `#graphql
  query ShopInfo {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
      brand {
        logo {
          image {
            url
          }
        }
        colors {
          primary {
            background
            foreground
          }
          secondary {
            background
            foreground
          }
        }
      }
    }
  }
`;
```

## Implementing the @inContext Directive

The `@inContext` directive allows for localized queries. Here's how to implement it:

```typescript
/**
 * Applies the @inContext directive to a query
 * 
 * @param query - GraphQL query string
 * @param context - Context parameters
 * @returns Modified query with context directive
 */
export function applyContextToQuery(
  query: string,
  context?: {
    country?: string;
    language?: string;
    buyerIdentity?: {
      customerAccessToken?: string;
      email?: string;
      phone?: string;
      countryCode?: string;
    };
  }
): string {
  if (!context) {
    return query;
  }
  
  const contextDirective = [];
  
  if (context.country) {
    contextDirective.push(`country: ${context.country}`);
  }
  
  if (context.language) {
    contextDirective.push(`language: ${context.language}`);
  }
  
  if (context.buyerIdentity) {
    const buyerIdentity = context.buyerIdentity;
    const buyerIdentityParams = [];
    
    if (buyerIdentity.customerAccessToken) {
      buyerIdentityParams.push(`customerAccessToken: "${buyerIdentity.customerAccessToken}"`);
    }
    
    if (buyerIdentity.email) {
      buyerIdentityParams.push(`email: "${buyerIdentity.email}"`);
    }
    
    if (buyerIdentity.phone) {
      buyerIdentityParams.push(`phone: "${buyerIdentity.phone}"`);
    }
    
    if (buyerIdentity.countryCode) {
      buyerIdentityParams.push(`countryCode: ${buyerIdentity.countryCode}`);
    }
    
    if (buyerIdentityParams.length > 0) {
      contextDirective.push(`buyerIdentity: {${buyerIdentityParams.join(', ')}}`);
    }
  }
  
  if (contextDirective.length === 0) {
    return query;
  }
  
  // Insert @inContext directive after the query keyword
  return query.replace(
    /query\s+([a-zA-Z0-9_]*)/,
    `query $1 @inContext(${contextDirective.join(', ')})`
  );
}
```

## Handling Pagination

Cursor-based pagination is used for fetching large datasets:

```typescript
/**
 * Fetches all pages of a paginated query
 * 
 * @param client - StorefrontApiClient instance
 * @param query - GraphQL query
 * @param variables - Initial variables
 * @param resourcePath - Path to the resource in the response (e.g., 'products')
 * @returns Combined results from all pages
 */
export async function fetchAllPages(
  client: StorefrontApiClient,
  query: string,
  variables: any,
  resourcePath: string
): Promise<any[]> {
  const results: any[] = [];
  let hasNextPage = true;
  let after: string | null = null;
  
  while (hasNextPage) {
    const response = await client.request(query, {
      ...variables,
      after
    });
    
    // Extract the resource from the response
    const resource = resourcePath.split('.').reduce((obj, key) => obj?.[key], response.data);
    
    if (!resource || !resource.edges) {
      break;
    }
    
    // Add the nodes to the results
    results.push(...resource.edges.map((edge: any) => edge.node));
    
    // Check if there are more pages
    hasNextPage = resource.pageInfo?.hasNextPage || false;
    after = resource.pageInfo?.endCursor || null;
    
    // Safety check to prevent infinite loops
    if (!after) {
      break;
    }
  }
  
  return results;
}
```

## Error Handling

Proper error handling for GraphQL responses:

```typescript
/**
 * Processes a GraphQL response and extracts data or throws an error
 * 
 * @param response - GraphQL response
 * @returns Extracted data
 * @throws Error if the response contains errors
 */
export function processGraphQLResponse(response: any): any {
  if (response.errors && response.errors.length > 0) {
    // Format the error message
    const errorMessage = response.errors
      .map((error: any) => error.message)
      .join('\n');
    
    throw new Error(`GraphQL Error: ${errorMessage}`);
  }
  
  return response.data;
}
```

## Usage Examples

### Basic Query

```typescript
import { StorefrontApiClient } from '../StorefrontApiClient';
import { STOREFRONT_PRODUCTS_QUERY } from './ProductQueries';

async function fetchProducts() {
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
    first: 10
  });
  
  return response.data.products.edges.map((edge: any) => edge.node);
}
```

### Query with Context

```typescript
import { StorefrontApiClient } from '../StorefrontApiClient';
import { STOREFRONT_PRODUCTS_QUERY } from './ProductQueries';
import { applyContextToQuery } from './StorefrontQueries';

async function fetchProductsWithContext() {
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  const contextualQuery = applyContextToQuery(STOREFRONT_PRODUCTS_QUERY, {
    country: 'US',
    language: 'EN'
  });
  
  const response = await client.request(contextualQuery, {
    first: 10
  });
  
  return response.data.products.edges.map((edge: any) => edge.node);
}
```

### Fetching All Pages

```typescript
import { StorefrontApiClient } from '../StorefrontApiClient';
import { STOREFRONT_PRODUCTS_QUERY } from './ProductQueries';
import { fetchAllPages } from './StorefrontQueries';

async function fetchAllProducts() {
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  const products = await fetchAllPages(
    client,
    STOREFRONT_PRODUCTS_QUERY,
    { first: 50 },
    'products'
  );
  
  return products;
}
```

## Testing Considerations

1. **Mock Responses**: Create mock responses for testing without hitting the actual API
2. **Error Scenarios**: Test various error scenarios (network errors, GraphQL errors)
3. **Pagination**: Test pagination with mock multi-page responses
4. **Context Directive**: Verify that the context directive is correctly applied

## Next Steps

After implementing the GraphQL queries, the next steps are:

1. Integrate the queries with the StorefrontApiClient
2. Update the data transformers to handle the query responses
3. Implement the dashboard UI to display the data