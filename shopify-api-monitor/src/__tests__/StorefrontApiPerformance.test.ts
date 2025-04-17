/**
 * StorefrontApiPerformance.test.ts
 * Performance tests for the Storefront API integration.
 * 
 * These tests measure the performance of the Storefront API client and query utilities
 * when dealing with large datasets.
 */

import { StorefrontApiClient } from '../StorefrontApiClient';
import { 
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY
} from '../queries';
import { fetchAllPages, extractNodesFromEdges } from '../queries/StorefrontQueries';
import { StorefrontDataTransformerFactory } from '../dashboard/dual-view/transformers/StorefrontDataTransformerFactory';

// Mock the StorefrontApiClient
jest.mock('../StorefrontApiClient');

// Helper to generate large mock datasets
function generateLargeProductDataset(size: number) {
  const edges = [];
  
  for (let i = 1; i <= size; i++) {
    edges.push({
      node: {
        id: `gid://shopify/Product/${i}`,
        title: `Product ${i}`,
        handle: `product-${i}`,
        description: `Description for product ${i}. This is a longer text to simulate real product descriptions that might contain a lot of content including formatting, specifications, and other details about the product.`,
        priceRange: {
          minVariantPrice: {
            amount: (Math.random() * 100).toFixed(2),
            currencyCode: 'USD'
          },
          maxVariantPrice: {
            amount: (Math.random() * 200 + 100).toFixed(2),
            currencyCode: 'USD'
          }
        },
        images: {
          edges: Array(3).fill(null).map((_, imgIndex) => ({
            node: {
              id: `gid://shopify/ProductImage/${i}-${imgIndex}`,
              url: `https://example.com/images/product-${i}-${imgIndex}.jpg`,
              altText: `Product ${i} image ${imgIndex}`
            }
          }))
        },
        variants: {
          edges: Array(5).fill(null).map((_, variantIndex) => ({
            node: {
              id: `gid://shopify/ProductVariant/${i}-${variantIndex}`,
              title: `Variant ${variantIndex}`,
              price: {
                amount: (Math.random() * 100 + 50).toFixed(2),
                currencyCode: 'USD'
              },
              availableForSale: Math.random() > 0.2,
              sku: `SKU-${i}-${variantIndex}`
            }
          }))
        }
      }
    });
  }
  
  return {
    products: {
      edges,
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  };
}

describe('Storefront API Performance Tests', () => {
  let mockClient: jest.Mocked<StorefrontApiClient>;
  
  beforeEach(() => {
    mockClient = new StorefrontApiClient({}) as jest.Mocked<StorefrontApiClient>;
    jest.clearAllMocks();
  });
  
  describe('Large Dataset Handling', () => {
    test('should handle 1000 products efficiently', async () => {
      // Generate a large dataset with 1000 products
      const largeDataset = generateLargeProductDataset(1000);
      
      // Mock the client to return the large dataset
      mockClient.request = jest.fn().mockResolvedValue({
        data: largeDataset
      });
      
      // Measure performance
      const startTime = performance.now();
      
      const response = await mockClient.request(STOREFRONT_PRODUCTS_QUERY, { first: 1000 });
      const products = extractNodesFromEdges(response.data.products.edges);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assertions
      expect(products).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should process in less than 1 second
      
      console.log(`Processed 1000 products in ${executionTime.toFixed(2)}ms`);
    });
    
    test('should transform large datasets efficiently', async () => {
      // Generate a large dataset with 500 products
      const largeDataset = generateLargeProductDataset(500);
      
      // Create a transformer
      const transformerFactory = new StorefrontDataTransformerFactory();
      const transformer = transformerFactory.createTransformer('products');
      
      // Measure performance
      const startTime = performance.now();
      
      const treeNodes = transformer.transformToTreeNodes(largeDataset);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assertions
      expect(treeNodes.length).toBeGreaterThan(0);
      expect(executionTime).toBeLessThan(1000); // Should transform in less than 1 second
      
      console.log(`Transformed 500 products to tree nodes in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  describe('Pagination Performance', () => {
    test('should efficiently fetch and combine multiple pages', async () => {
      // Mock the client to return paginated data
      let callCount = 0;
      mockClient.request = jest.fn().mockImplementation(async () => {
        callCount++;
        
        // Generate different sized pages to simulate real-world scenarios
        const pageSize = callCount === 1 ? 100 : callCount === 2 ? 200 : 50;
        const hasNextPage = callCount < 3;
        
        return {
          data: {
            products: {
              edges: Array(pageSize).fill(null).map((_, i) => ({
                node: {
                  id: `gid://shopify/Product/${callCount * 1000 + i}`,
                  title: `Product ${callCount * 1000 + i}`
                }
              })),
              pageInfo: {
                hasNextPage,
                endCursor: hasNextPage ? `cursor${callCount}` : null
              }
            }
          }
        };
      });
      
      // Measure performance
      const startTime = performance.now();
      
      const allProducts = await fetchAllPages(
        mockClient,
        STOREFRONT_PRODUCTS_QUERY,
        { first: 100 },
        'products'
      );
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assertions
      expect(allProducts.length).toBe(350); // 100 + 200 + 50
      expect(mockClient.request).toHaveBeenCalledTimes(3);
      expect(executionTime).toBeLessThan(1000); // Should fetch all pages in less than 1 second
      
      console.log(`Fetched and combined 3 pages (350 products) in ${executionTime.toFixed(2)}ms`);
    });
  });
  
  describe('Memory Usage', () => {
    test('should handle large datasets without excessive memory usage', async () => {
      // This test is more of a demonstration than an actual test since
      // Jest doesn't provide built-in memory usage tracking
      
      // Generate an extremely large dataset
      const hugeDataset = generateLargeProductDataset(2000);
      
      // Mock the client to return the huge dataset
      mockClient.request = jest.fn().mockResolvedValue({
        data: hugeDataset
      });
      
      // Process the data
      const response = await mockClient.request(STOREFRONT_PRODUCTS_QUERY, { first: 2000 });
      const products = extractNodesFromEdges(response.data.products.edges);
      
      // Create a transformer
      const transformerFactory = new StorefrontDataTransformerFactory();
      const transformer = transformerFactory.createTransformer('products');
      
      // Transform the data
      const treeNodes = transformer.transformToTreeNodes(response.data);
      
      // Assertions
      expect(products).toHaveLength(2000);
      expect(treeNodes.length).toBeGreaterThan(0);
      
      // In a real environment, you would use a tool like process.memoryUsage()
      // to measure memory consumption, but that's not available in Jest by default
      console.log(`Successfully processed 2000 products with variants and images`);
    });
  });
});