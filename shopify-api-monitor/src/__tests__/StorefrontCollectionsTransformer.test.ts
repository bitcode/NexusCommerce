/**
 * StorefrontCollectionsTransformer.test.ts
 * Tests for the StorefrontCollectionsTransformer class.
 */

import { StorefrontCollectionsTransformer } from '../dashboard/dual-view/transformers/StorefrontCollectionsTransformer';
import { TreeNode } from '../dashboard/dual-view/types/TreeNode';
import { 
  generateMockCollection, 
  generateLargeCollectionDataset 
} from './utils/mockDataGenerators';
import { 
  validateTreeNodeStructure, 
  validateRawJsonData,
  measureExecutionTime 
} from './utils/testHelpers';
import { MOCK_COLLECTIONS_RESPONSE } from './fixtures/storefrontApiResponses';

describe('StorefrontCollectionsTransformer', () => {
  let transformer: StorefrontCollectionsTransformer;
  
  beforeEach(() => {
    transformer = new StorefrontCollectionsTransformer();
  });
  
  describe('transformToTreeNodes', () => {
    test('should transform collections data to tree nodes', () => {
      const result = transformer.transformToTreeNodes(MOCK_COLLECTIONS_RESPONSE.data);
      
      // Validate structure
      expect(validateTreeNodeStructure(result, 'Collections', 2)).toBe(true);
      
      // Check root node
      expect(result[0].id).toBe('collections-root');
      expect(result[0].name).toBe('Collections');
      expect(result[0].type).toBe('folder');
      expect(result[0].expanded).toBe(true);
      
      // Check collection nodes
      const collectionNodes = result[0].children as TreeNode[];
      expect(collectionNodes[0].id).toBe('gid://shopify/Collection/1');
      expect(collectionNodes[0].name).toBe('Test Collection 1');
      expect(collectionNodes[0].type).toBe('collection');
      
      expect(collectionNodes[1].id).toBe('gid://shopify/Collection/2');
      expect(collectionNodes[1].name).toBe('Test Collection 2');
      
      // Check product nodes within collection
      const productNodes = collectionNodes[0].children as TreeNode[];
      expect(productNodes[0].id).toBe('gid://shopify/Product/1');
      expect(productNodes[0].name).toBe('Test Product 1');
      expect(productNodes[0].type).toBe('product');
      
      // Check data is preserved
      expect(collectionNodes[0].data).toBeDefined();
      expect(collectionNodes[0].data.title).toBe('Test Collection 1');
      expect(collectionNodes[0].data.description).toBe('This is a test collection description.');
    });
    
    test('should handle empty data', () => {
      const result = transformer.transformToTreeNodes({});
      expect(result).toEqual([]);
    });
    
    test('should handle null data', () => {
      const result = transformer.transformToTreeNodes(null);
      expect(result).toEqual([]);
    });
    
    test('should handle missing edges', () => {
      const result = transformer.transformToTreeNodes({ collections: {} });
      expect(result).toEqual([]);
    });
    
    test('should handle empty edges array', () => {
      const result = transformer.transformToTreeNodes({ collections: { edges: [] } });
      expect(validateTreeNodeStructure(result, 'Collections', 0)).toBe(true);
    });
    
    test('should handle collections without products', () => {
      const data = {
        collections: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Collection/1',
                title: 'Collection without products',
                handle: 'collection-without-products',
                description: 'This is a collection without products',
                image: {
                  id: 'gid://shopify/CollectionImage/1',
                  url: 'https://example.com/images/collection-1.jpg',
                  altText: 'Collection Image'
                }
              }
            }
          ]
        }
      };
      
      const result = transformer.transformToTreeNodes(data);
      
      expect(validateTreeNodeStructure(result, 'Collections', 1)).toBe(true);
      
      const collectionNodes = result[0].children as TreeNode[];
      expect(collectionNodes[0].id).toBe('gid://shopify/Collection/1');
      expect(collectionNodes[0].name).toBe('Collection without products');
      expect(collectionNodes[0].children).toEqual([]);
    });
    
    test('should handle collections without images', () => {
      const data = {
        collections: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Collection/1',
                title: 'Collection without image',
                handle: 'collection-without-image',
                description: 'This is a collection without an image',
                products: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/Product/1',
                        title: 'Product 1'
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      };
      
      const result = transformer.transformToTreeNodes(data);
      
      expect(validateTreeNodeStructure(result, 'Collections', 1)).toBe(true);
      
      const collectionNodes = result[0].children as TreeNode[];
      expect(collectionNodes[0].id).toBe('gid://shopify/Collection/1');
      expect(collectionNodes[0].name).toBe('Collection without image');
      
      // Should still have product nodes
      const productNodes = collectionNodes[0].children as TreeNode[];
      expect(productNodes[0].id).toBe('gid://shopify/Product/1');
    });
    
    test('should handle large datasets efficiently', async () => {
      const largeDataset = generateLargeCollectionDataset(100);
      
      const { result, executionTime } = await measureExecutionTime(async () => {
        return transformer.transformToTreeNodes(largeDataset);
      });
      
      expect(validateTreeNodeStructure(result, 'Collections', 100)).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should transform in less than 1 second
      
      console.log(`Transformed 100 collections to tree nodes in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  describe('transformToRawData', () => {
    test('should transform collections data to JSON format', () => {
      const result = transformer.transformToRawData(MOCK_COLLECTIONS_RESPONSE.data, 'json');
      
      expect(validateRawJsonData(result)).toBe(true);
      expect(result).toContain('Test Collection 1');
      expect(result).toContain('Test Collection 2');
    });
    
    test('should transform collections data to YAML format', () => {
      const result = transformer.transformToRawData(MOCK_COLLECTIONS_RESPONSE.data, 'yaml');
      
      // Basic YAML validation
      expect(result).toContain('collections:');
      expect(result).toContain('  - id:');
      expect(result).toContain('    title: Test Collection 1');
    });
    
    test('should handle empty data', () => {
      const jsonResult = transformer.transformToRawData({}, 'json');
      const yamlResult = transformer.transformToRawData({}, 'yaml');
      
      expect(jsonResult).toBe('{}');
      expect(yamlResult).toBe('{}');
    });
    
    test('should handle null data', () => {
      const jsonResult = transformer.transformToRawData(null, 'json');
      const yamlResult = transformer.transformToRawData(null, 'yaml');
      
      expect(jsonResult).toBe('null');
      expect(yamlResult).toBe('null');
    });
    
    test('should handle large datasets efficiently', async () => {
      const largeDataset = generateLargeCollectionDataset(100);
      
      const { result, executionTime } = await measureExecutionTime(async () => {
        return transformer.transformToRawData(largeDataset, 'json');
      });
      
      expect(validateRawJsonData(result)).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should transform in less than 1 second
      
      console.log(`Transformed 100 collections to JSON in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  describe('transformCollectionToTreeNode', () => {
    test('should transform a collection to a tree node', () => {
      const collection = generateMockCollection(1);
      
      // Access the private method using type assertion
      const result = (transformer as any).transformCollectionToTreeNode(collection);
      
      expect(result.id).toBe('gid://shopify/Collection/1');
      expect(result.name).toBe('Collection 1');
      expect(result.type).toBe('collection');
      expect(result.data).toBe(collection);
      
      // Check product nodes
      expect(result.children).toHaveLength(5);
      expect(result.children[0].id).toBe('gid://shopify/Product/10');
      expect(result.children[0].name).toBe('Product 10');
      expect(result.children[0].type).toBe('product');
    });
    
    test('should handle collection without products', () => {
      const collection = {
        id: 'gid://shopify/Collection/1',
        title: 'Collection without products',
        handle: 'collection-without-products',
        description: 'This is a collection without products'
      };
      
      // Access the private method using type assertion
      const result = (transformer as any).transformCollectionToTreeNode(collection);
      
      expect(result.id).toBe('gid://shopify/Collection/1');
      expect(result.name).toBe('Collection without products');
      expect(result.children).toEqual([]);
    });
    
    test('should handle collection with empty products', () => {
      const collection = {
        id: 'gid://shopify/Collection/1',
        title: 'Collection with empty products',
        products: {
          edges: []
        }
      };
      
      // Access the private method using type assertion
      const result = (transformer as any).transformCollectionToTreeNode(collection);
      
      expect(result.id).toBe('gid://shopify/Collection/1');
      expect(result.name).toBe('Collection with empty products');
      expect(result.children).toEqual([]);
    });
  });
});
