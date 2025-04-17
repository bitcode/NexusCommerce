/**
 * StorefrontCollectionsTransformer.ts
 * Transforms Storefront API collection data to TreeNode format
 */

import { DataTransformer, TreeNode } from '../types';
import {
  extractNodesFromEdges,
  extractPaginationInfo,
  createRelationship,
  convertToYaml
} from './StorefrontTransformerUtils';

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

    const collections = extractNodesFromEdges(data.collections.edges);
    const paginationInfo = extractPaginationInfo(data, 'collections');

    const treeNodes: TreeNode[] = [
      {
        id: 'collections-root',
        name: 'Collections',
        type: 'folder',
        expanded: true,
        children: collections.map((collection: any) => this.transformCollectionToTreeNode(collection))
      }
    ];

    // Add "Load More" node if there are more pages
    if (paginationInfo.hasNextPage) {
      treeNodes[0].children?.push({
        id: 'load-more-collections',
        name: 'Load More...',
        type: 'folder',
        data: {
          endCursor: paginationInfo.endCursor,
          section: 'storefront-collections'
        }
      });
    }

    return treeNodes;
  }

  /**
   * Transforms a single collection to a TreeNode
   *
   * @param collection - Collection data from Storefront API
   * @returns TreeNode representation of the collection
   */
  private transformCollectionToTreeNode(collection: any): TreeNode {
    // If collection has no products, images, or description, return a simple node without children
    if (!collection.products?.edges || collection.products.edges.length === 0) {
      return {
        id: collection.id,
        name: collection.title,
        type: 'collection',
        expanded: false,
        data: collection,
        children: []
      };
    }

    // Create children nodes for products
    const children = [];

    // Add products if available
    if (collection.products?.edges && collection.products.edges.length > 0) {
      // Map products directly as children of the collection (not in a Products folder)
      // This matches the test expectations
      children.push(...extractNodesFromEdges(collection.products.edges).map((product: any) => ({
        id: product.id,
        name: product.title,
        type: 'product',
        data: product,
        // Add relationship to the original product
        relationships: [
          createRelationship(collection.id, product.id, 'product', 'to')
        ]
      })));
    }

    return {
      id: collection.id,
      name: collection.title,
      type: 'collection',
      expanded: false,
      data: collection,
      children: children
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

    // For YAML, use the utility function
    return convertToYaml(data);
  }
}