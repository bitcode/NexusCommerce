# Storefront Data Transformers Implementation Guide

This document provides implementation guidelines for the Storefront API data transformers, which are essential components for converting Shopify Storefront API data to the format expected by our dashboard.

## Overview

The data transformers are responsible for:

1. Converting Storefront API GraphQL responses to TreeNode format for visualization
2. Formatting raw data for display in the raw data view
3. Handling the edges/nodes pattern used by GraphQL
4. Maintaining relationships between different resource types

## Transformer Interfaces

### Base Interfaces

```typescript
/**
 * Interface for data transformers
 */
export interface DataTransformer {
  /**
   * Transforms data from the API format to the TreeNode format
   * 
   * @param data - Data from the API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[];
  
  /**
   * Transforms data from the API format to the raw data format
   * 
   * @param data - Data from the API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string;
}

/**
 * Factory for creating data transformers based on section
 */
export interface DataTransformerFactory {
  /**
   * Creates a data transformer for the specified section
   * 
   * @param section - Section ID
   * @returns DataTransformer instance
   */
  createTransformer(section: string): DataTransformer;
}
```

## Implementation Details

### File Structure

```
shopify-api-monitor/src/dashboard/dual-view/transformers/
├── DataTransformerFactory.ts
├── StorefrontProductsTransformer.ts
├── StorefrontCollectionsTransformer.ts
├── StorefrontContentTransformer.ts
├── StorefrontMetaobjectsTransformer.ts
└── StorefrontMenusTransformer.ts
```

### StorefrontDataTransformerFactory Implementation

```typescript
/**
 * Factory for creating Storefront API data transformers
 */
export class StorefrontDataTransformerFactory implements DataTransformerFactory {
  /**
   * Creates a data transformer for the specified section
   * 
   * @param section - Section ID
   * @returns DataTransformer instance
   */
  createTransformer(section: string): DataTransformer {
    switch (section) {
      case 'products':
        return new StorefrontProductsTransformer();
      case 'collections':
        return new StorefrontCollectionsTransformer();
      case 'content':
        return new StorefrontContentTransformer();
      case 'metaobjects':
        return new StorefrontMetaobjectsTransformer();
      case 'menus':
        return new StorefrontMenusTransformer();
      default:
        throw new Error(`No transformer available for section: ${section}`);
    }
  }
}
```

### StorefrontProductsTransformer Implementation

```typescript
/**
 * Transforms Storefront API product data to TreeNode format
 */
export class StorefrontProductsTransformer implements DataTransformer {
  /**
   * Transforms products data to TreeNode format
   * 
   * @param data - Products data from Storefront API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[] {
    if (!data || !data.products || !data.products.edges) {
      return [];
    }
    
    const products = data.products.edges.map((edge: any) => edge.node);
    
    return [
      {
        id: 'products-root',
        name: 'Products',
        type: 'folder',
        expanded: true,
        children: products.map((product: any) => this.transformProductToTreeNode(product))
      }
    ];
  }
  
  /**
   * Transforms a single product to a TreeNode
   * 
   * @param product - Product data from Storefront API
   * @returns TreeNode representation of the product
   */
  private transformProductToTreeNode(product: any): TreeNode {
    return {
      id: product.id,
      name: product.title,
      type: 'product',
      expanded: false,
      data: product,
      children: [
        // Variants group
        {
          id: `${product.id}-variants`,
          name: 'Variants',
          type: 'folder',
          expanded: false,
          children: product.variants?.edges?.map((edge: any) => {
            const variant = edge.node;
            return {
              id: variant.id,
              name: variant.title,
              type: 'product',
              data: variant
            };
          }) || []
        },
        // Images group
        {
          id: `${product.id}-images`,
          name: 'Images',
          type: 'folder',
          expanded: false,
          children: product.images?.edges?.map((edge: any) => {
            const image = edge.node;
            return {
              id: image.id,
              name: image.altText || 'Image',
              type: 'file',
              data: image
            };
          }) || []
        }
      ]
    };
  }
  
  /**
   * Transforms products data to raw data format
   * 
   * @param data - Products data from Storefront API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // For YAML, use a library like js-yaml
    // This is a simplified implementation
    return this.convertToYaml(data);
  }
  
  /**
   * Converts data to YAML format
   * 
   * @param data - Data to convert
   * @returns YAML string
   */
  private convertToYaml(data: any): string {
    // Implementation details omitted for brevity
    // Use a library like js-yaml in the actual implementation
    return JSON.stringify(data, null, 2);
  }
}
```

### StorefrontCollectionsTransformer Implementation

```typescript
/**
 * Transforms Storefront API collection data to TreeNode format
 */
export class StorefrontCollectionsTransformer implements DataTransformer {
  /**
   * Transforms collections data to TreeNode format
   * 
   * @param data - Collections data from Storefront API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[] {
    if (!data || !data.collections || !data.collections.edges) {
      return [];
    }
    
    const collections = data.collections.edges.map((edge: any) => edge.node);
    
    return [
      {
        id: 'collections-root',
        name: 'Collections',
        type: 'folder',
        expanded: true,
        children: collections.map((collection: any) => this.transformCollectionToTreeNode(collection))
      }
    ];
  }
  
  /**
   * Transforms a single collection to a TreeNode
   * 
   * @param collection - Collection data from Storefront API
   * @returns TreeNode representation of the collection
   */
  private transformCollectionToTreeNode(collection: any): TreeNode {
    return {
      id: collection.id,
      name: collection.title,
      type: 'collection',
      expanded: false,
      data: collection,
      children: [
        // Products group
        {
          id: `${collection.id}-products`,
          name: 'Products',
          type: 'folder',
          expanded: false,
          children: collection.products?.edges?.map((edge: any) => {
            const product = edge.node;
            return {
              id: product.id,
              name: product.title,
              type: 'product',
              data: product,
              // Add relationship to the original product
              relationships: [
                {
                  id: product.id,
                  type: 'product',
                  direction: 'to'
                }
              ]
            };
          }) || []
        }
      ]
    };
  }
  
  /**
   * Transforms collections data to raw data format
   * 
   * @param data - Collections data from Storefront API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // For YAML, use a library like js-yaml
    // This is a simplified implementation
    return this.convertToYaml(data);
  }
  
  /**
   * Converts data to YAML format
   * 
   * @param data - Data to convert
   * @returns YAML string
   */
  private convertToYaml(data: any): string {
    // Implementation details omitted for brevity
    // Use a library like js-yaml in the actual implementation
    return JSON.stringify(data, null, 2);
  }
}
```

## Handling GraphQL Edges and Nodes

The Shopify Storefront API uses the GraphQL edges/nodes pattern for collections of items. Here's how to properly handle this pattern:

```typescript
/**
 * Extracts nodes from GraphQL edges
 * 
 * @param edges - Array of edges from GraphQL response
 * @returns Array of nodes
 */
function extractNodesFromEdges(edges: any[]): any[] {
  if (!edges || !Array.isArray(edges)) {
    return [];
  }
  
  return edges.map(edge => edge.node);
}

/**
 * Example usage in a transformer
 */
const products = extractNodesFromEdges(data.products.edges);
```

## Handling Pagination

The Storefront API uses cursor-based pagination. Here's how to handle pagination in the transformers:

```typescript
/**
 * Extracts pagination info from GraphQL response
 * 
 * @param data - GraphQL response data
 * @param resourceName - Name of the resource (e.g., 'products')
 * @returns Pagination info
 */
function extractPaginationInfo(data: any, resourceName: string): {
  hasNextPage: boolean;
  endCursor?: string;
} {
  if (!data || !data[resourceName] || !data[resourceName].pageInfo) {
    return { hasNextPage: false };
  }
  
  const { hasNextPage, endCursor } = data[resourceName].pageInfo;
  
  return {
    hasNextPage: !!hasNextPage,
    endCursor
  };
}

/**
 * Example usage in a transformer
 */
const paginationInfo = extractPaginationInfo(data, 'products');
if (paginationInfo.hasNextPage) {
  // Add a special node to load more
  treeNodes.push({
    id: 'load-more',
    name: 'Load More...',
    type: 'folder',
    data: {
      endCursor: paginationInfo.endCursor
    }
  });
}
```

## Handling Relationships

The TreeNode interface includes a `relationships` property that can be used to represent relationships between nodes:

```typescript
/**
 * Creates a relationship between nodes
 * 
 * @param sourceId - ID of the source node
 * @param targetId - ID of the target node
 * @param type - Type of relationship
 * @param direction - Direction of the relationship
 * @returns Relationship object
 */
function createRelationship(
  sourceId: string,
  targetId: string,
  type: string,
  direction: 'to' | 'from' | 'bidirectional' = 'to'
): Relationship {
  return {
    id: targetId,
    type,
    direction
  };
}

/**
 * Example usage in a transformer
 */
const productNode = {
  id: product.id,
  name: product.title,
  type: 'product',
  relationships: [
    createRelationship(product.id, collection.id, 'collection', 'from')
  ]
};
```

## Testing Considerations

1. **Mock Data**: Create mock Storefront API responses for testing
2. **Edge Cases**: Test with empty data, missing fields, and large datasets
3. **Relationships**: Verify that relationships between nodes are correctly represented
4. **Pagination**: Test pagination handling with multi-page datasets

## Next Steps

After implementing the data transformers, the next steps are:

1. Update the ProductManagementDashboard to use the new transformers
2. Implement the StorefrontApiClient to fetch data from the Storefront API
3. Update the dashboard UI to display the transformed data