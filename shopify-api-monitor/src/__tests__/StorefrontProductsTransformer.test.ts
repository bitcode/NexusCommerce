/**
 * StorefrontProductsTransformer.test.ts
 * Tests for the StorefrontProductsTransformer class.
 */

import { StorefrontProductsTransformer } from '../dashboard/dual-view/transformers/StorefrontProductsTransformer';
import { TreeNode } from '../dashboard/dual-view/types/TreeNode';
import { 
  generateMockProduct, 
  generateLargeProductDataset 
} from './utils/mockDataGenerators';
import { 
  validateTreeNodeStructure, 
  validateRawJsonData,
  measureExecutionTime 
} from './utils/testHelpers';
import { MOCK_PRODUCTS_RESPONSE } from './fixtures/storefrontApiResponses';

describe('StorefrontProductsTransformer', () => {
  let transformer: StorefrontProductsTransformer;
  
  beforeEach(() => {
    transformer = new StorefrontProductsTransformer();
  });
  
  describe('transformToTreeNodes', () => {
    test('should transform products data to tree nodes', () => {
      const result = transformer.transformToTreeNodes(MOCK_PRODUCTS_RESPONSE.data);
      
      // Validate structure
      expect(validateTreeNodeStructure(result, 'Products', 2)).toBe(true);
      
      // Check root node
      expect(result[0].id).toBe('products-root');
      expect(result[0].name).toBe('Products');
      expect(result[0].type).toBe('folder');
      expect(result[0].expanded).toBe(true);
      
      // Check product nodes
      const productNodes = result[0].children as TreeNode[];
      expect(productNodes[0].id).toBe('gid://shopify/Product/1');
      expect(productNodes[0].name).toBe('Test Product 1');
      expect(productNodes[0].type).toBe('product');
      
      expect(productNodes[1].id).toBe('gid://shopify/Product/2');
      expect(productNodes[1].name).toBe('Test Product 2');
      
      // Check variant nodes
      const variantNodes = productNodes[0].children as TreeNode[];
      expect(variantNodes[0].id).toBe('gid://shopify/ProductVariant/1');
      expect(variantNodes[0].name).toBe('Default');
      expect(variantNodes[0].type).toBe('variant');
      
      // Check data is preserved
      expect(productNodes[0].data).toBeDefined();
      expect(productNodes[0].data.title).toBe('Test Product 1');
      expect(productNodes[0].data.priceRange.minVariantPrice.amount).toBe('10.00');
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
      const result = transformer.transformToTreeNodes({ products: {} });
      expect(result).toEqual([]);
    });
    
    test('should handle empty edges array', () => {
      const result = transformer.transformToTreeNodes({ products: { edges: [] } });
      expect(validateTreeNodeStructure(result, 'Products', 0)).toBe(true);
    });
    
    test('should handle products without variants', () => {
      const data = {
        products: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/1',
                title: 'Product without variants',
                handle: 'product-without-variants',
                description: 'This is a product without variants',
                priceRange: {
                  minVariantPrice: {
                    amount: '10.00',
                    currencyCode: 'USD'
                  },
                  maxVariantPrice: {
                    amount: '10.00',
                    currencyCode: 'USD'
                  }
                }
              }
            }
          ]
        }
      };
      
      const result = transformer.transformToTreeNodes(data);
      
      expect(validateTreeNodeStructure(result, 'Products', 1)).toBe(true);
      
      const productNodes = result[0].children as TreeNode[];
      expect(productNodes[0].id).toBe('gid://shopify/Product/1');
      expect(productNodes[0].name).toBe('Product without variants');
      expect(productNodes[0].children).toEqual([]);
    });
    
    test('should handle products without images', () => {
      const data = {
        products: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/1',
                title: 'Product without images',
                handle: 'product-without-images',
                description: 'This is a product without images',
                priceRange: {
                  minVariantPrice: {
                    amount: '10.00',
                    currencyCode: 'USD'
                  },
                  maxVariantPrice: {
                    amount: '10.00',
                    currencyCode: 'USD'
                  }
                },
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/1',
                        title: 'Default',
                        price: {
                          amount: '10.00',
                          currencyCode: 'USD'
                        }
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
      
      expect(validateTreeNodeStructure(result, 'Products', 1)).toBe(true);
      
      const productNodes = result[0].children as TreeNode[];
      expect(productNodes[0].id).toBe('gid://shopify/Product/1');
      expect(productNodes[0].name).toBe('Product without images');
      
      // Should still have variant nodes
      const variantNodes = productNodes[0].children as TreeNode[];
      expect(variantNodes[0].id).toBe('gid://shopify/ProductVariant/1');
    });
    
    test('should handle large datasets efficiently', async () => {
      const largeDataset = generateLargeProductDataset(500);
      
      const { result, executionTime } = await measureExecutionTime(async () => {
        return transformer.transformToTreeNodes(largeDataset);
      });
      
      expect(validateTreeNodeStructure(result, 'Products', 500)).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should transform in less than 1 second
      
      console.log(`Transformed 500 products to tree nodes in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  describe('transformToRawData', () => {
    test('should transform products data to JSON format', () => {
      const result = transformer.transformToRawData(MOCK_PRODUCTS_RESPONSE.data, 'json');
      
      expect(validateRawJsonData(result)).toBe(true);
      expect(result).toContain('Test Product 1');
      expect(result).toContain('Test Product 2');
    });
    
    test('should transform products data to YAML format', () => {
      const result = transformer.transformToRawData(MOCK_PRODUCTS_RESPONSE.data, 'yaml');
      
      // Basic YAML validation
      expect(result).toContain('products:');
      expect(result).toContain('  - id:');
      expect(result).toContain('    title: Test Product 1');
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
      const largeDataset = generateLargeProductDataset(500);
      
      const { result, executionTime } = await measureExecutionTime(async () => {
        return transformer.transformToRawData(largeDataset, 'json');
      });
      
      expect(validateRawJsonData(result)).toBe(true);
      expect(executionTime).toBeLessThan(1000); // Should transform in less than 1 second
      
      console.log(`Transformed 500 products to JSON in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  describe('transformProductToTreeNode', () => {
    test('should transform a product to a tree node', () => {
      const product = generateMockProduct(1);
      
      // Access the private method using type assertion
      const result = (transformer as any).transformProductToTreeNode(product);
      
      expect(result.id).toBe('gid://shopify/Product/1');
      expect(result.name).toBe('Product 1');
      expect(result.type).toBe('product');
      expect(result.data).toBe(product);
      
      // Check variant nodes
      expect(result.children).toHaveLength(3);
      expect(result.children[0].id).toBe('gid://shopify/ProductVariant/1-0');
      expect(result.children[0].name).toBe('Variant 0');
      expect(result.children[0].type).toBe('variant');
    });
    
    test('should handle product without variants', () => {
      const product = {
        id: 'gid://shopify/Product/1',
        title: 'Product without variants',
        handle: 'product-without-variants',
        description: 'This is a product without variants'
      };
      
      // Access the private method using type assertion
      const result = (transformer as any).transformProductToTreeNode(product);
      
      expect(result.id).toBe('gid://shopify/Product/1');
      expect(result.name).toBe('Product without variants');
      expect(result.children).toEqual([]);
    });
    
    test('should handle product with empty variants', () => {
      const product = {
        id: 'gid://shopify/Product/1',
        title: 'Product with empty variants',
        variants: {
          edges: []
        }
      };
      
      // Access the private method using type assertion
      const result = (transformer as any).transformProductToTreeNode(product);
      
      expect(result.id).toBe('gid://shopify/Product/1');
      expect(result.name).toBe('Product with empty variants');
      expect(result.children).toEqual([]);
    });
  });
});
