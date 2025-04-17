/**
 * ProductEcosystemDataTransformer.ts
 * Transforms Product Ecosystem API data to TreeNode format and raw data for dual-view dashboard.
 */

import { DataTransformer, TreeNode } from '../types';

/**
 * Expects data shape:
 * {
 *   products: { edges: [...] },
 *   collections: { edges: [...] },
 *   inventory: { ... },
 *   relationships: [ ... ] // optional, for cross-linking
 * }
 */
export class ProductEcosystemDataTransformer implements DataTransformer {
  /**
   * Transforms product ecosystem data to TreeNode format
   * @param data - Product ecosystem data from API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[] {
    if (!data) return [];

    // Products
    const products = (data.products?.edges || []).map((edge: any) => edge.node);
    // Collections
    const collections = (data.collections?.edges || []).map((edge: any) => edge.node);
    // Inventory (optional, keyed by product/variant/location)
    const inventory = data.inventory || {};

    // Product nodes
    const productNodes: TreeNode[] = products.map((product: any) => ({
      id: product.id,
      name: product.title,
      type: 'product',
      expanded: false,
      data: product,
      children: [
        // Variants
        ...(product.variants?.edges?.length
          ? [{
              id: `${product.id}-variants`,
              name: 'Variants',
              type: 'folder',
              children: product.variants.edges.map((vEdge: any) => {
                const variant = vEdge.node;
                return {
                  id: variant.id,
                  name: variant.title,
                  type: 'product',
                  data: variant,
                  // Inventory by location (if available)
                  children: (variant.inventoryItem?.inventoryLevels?.edges || []).map((iEdge: any) => {
                    const inv = iEdge.node;
                    return {
                      id: inv.id,
                      name: `Inventory: ${inv.available} @ ${inv.location?.name || 'Unknown'}`,
                      type: 'inventory',
                      data: inv
                    };
                  })
                };
              })
            }]
          : []),
        // Images
        ...(product.images?.edges?.length
          ? [{
              id: `${product.id}-images`,
              name: 'Images',
              type: 'folder',
              children: product.images.edges.map((imgEdge: any) => {
                const img = imgEdge.node;
                return {
                  id: img.id,
                  name: img.altText || img.url,
                  type: 'file',
                  data: img
                };
              })
            }]
          : []),
        // Collections this product belongs to
        ...(product.collections?.edges?.length
          ? [{
              id: `${product.id}-collections`,
              name: 'Collections',
              type: 'folder',
              children: product.collections.edges.map((cEdge: any) => {
                const col = cEdge.node;
                return {
                  id: col.id,
                  name: col.title,
                  type: 'collection',
                  data: col
                };
              })
            }]
          : [])
      ]
    }));

    // Collection nodes
    const collectionNodes: TreeNode[] = collections.map((collection: any) => ({
      id: collection.id,
      name: collection.title,
      type: 'collection',
      expanded: false,
      data: collection,
      children: [
        // Products in collection
        ...(collection.products?.edges?.length
          ? [{
              id: `${collection.id}-products`,
              name: 'Products',
              type: 'folder',
              children: collection.products.edges.map((pEdge: any) => {
                const prod = pEdge.node;
                return {
                  id: prod.id,
                  name: prod.title,
                  type: 'product',
                  data: prod
                };
              })
            }]
          : []),
        // Image
        ...(collection.image
          ? [{
              id: `${collection.id}-image`,
              name: 'Image',
              type: 'file',
              data: collection.image
            }]
          : [])
      ]
    }));

    // Inventory summary node (optional)
    const inventoryNode: TreeNode | null = inventory && Object.keys(inventory).length
      ? {
          id: 'inventory-root',
          name: 'Inventory Overview',
          type: 'inventory',
          expanded: false,
          data: inventory,
          children: Object.entries(inventory).map(([key, value]: [string, any]) => ({
            id: `inventory-${key}`,
            name: `${key}: ${value}`,
            type: 'inventory',
            data: value
          }))
        }
      : null;

    // Root node
    const root: TreeNode = {
      id: 'product-ecosystem-root',
      name: 'Product Ecosystem',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: 'products-group',
          name: `Products (${productNodes.length})`,
          type: 'folder',
          expanded: false,
          children: productNodes
        },
        {
          id: 'collections-group',
          name: `Collections (${collectionNodes.length})`,
          type: 'folder',
          expanded: false,
          children: collectionNodes
        },
        ...(inventoryNode ? [inventoryNode] : [])
      ],
      data: data
    };

    return [root];
  }

  /**
   * Transforms product ecosystem data to raw data format
   * @param data - Product ecosystem data from API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    // Simple YAML conversion (for demo; use js-yaml in production)
    const convertObject = (obj: any, indent: number = 0): string => {
      const indentStr = ' '.repeat(indent);
      return Object.entries(obj).map(([key, value]) => {
        if (value === null) {
          return `${indentStr}${key}: null`;
        }
        if (typeof value === 'object' && !Array.isArray(value)) {
          return `${indentStr}${key}:\n${convertObject(value, indent + 2)}`;
        }
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return `${indentStr}${key}: []`;
          }
          return `${indentStr}${key}:\n${value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return `${indentStr}- \n${convertObject(item, indent + 4)}`;
            }
            return `${indentStr}- ${item}`;
          }).join('\n')}`;
        }
        return `${indentStr}${key}: ${value}`;
      }).join('\n');
    };
    return convertObject(data);
  }
}