/**
 * StorefrontQueries.test.ts
 * Tests for the Storefront API query definitions and utilities.
 */

import { 
  applyContextToQuery, 
  extractPaginationInfo, 
  extractNodesFromEdges, 
  fetchAllPages, 
  processGraphQLResponse 
} from '../queries/StorefrontQueries';
import { 
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_PAGES_QUERY,
  STOREFRONT_BLOGS_QUERY,
  STOREFRONT_METAOBJECTS_BY_TYPE_QUERY,
  STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY
} from '../queries';
import { StorefrontApiClient } from '../StorefrontApiClient';
import { StorefrontContext } from '../types/StorefrontConfig';

// Mock the StorefrontApiClient
jest.mock('../StorefrontApiClient');

describe('StorefrontQueries Utilities', () => {
  describe('applyContextToQuery', () => {
    test('should apply country context to query', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { country: 'US' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('@inContext(country: US)');
      expect(result).toMatch(/query Products @inContext\(country: US\)/);
    });
    
    test('should apply language context to query', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { language: 'EN' };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('@inContext(language: EN)');
    });
    
    test('should apply multiple context parameters', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      const context: StorefrontContext = { 
        country: 'US', 
        language: 'EN',
        buyerIdentity: {
          email: 'test@example.com'
        }
      };
      
      const result = applyContextToQuery(query, context);
      
      expect(result).toContain('country: US');
      expect(result).toContain('language: EN');
      expect(result).toContain('buyerIdentity: {email: "test@example.com"}');
    });
    
    test('should return original query if no context provided', () => {
      const query = 'query Products { products { edges { node { id } } } }';
      
      const result = applyContextToQuery(query);
      
      expect(result).toBe(query);
    });
  });
  
  describe('extractPaginationInfo', () => {
    test('should extract pagination info from response', () => {
      const data = {
        products: {
          pageInfo: {
            hasNextPage: true,
            endCursor: 'cursor123'
          }
        }
      };
      
      const result = extractPaginationInfo(data, 'products');
      
      expect(result.hasNextPage).toBe(true);
      expect(result.endCursor).toBe('cursor123');
    });
    
    test('should handle nested resource paths', () => {
      const data = {
        collection: {
          products: {
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor123'
            }
          }
        }
      };
      
      const result = extractPaginationInfo(data, 'collection.products');
      
      expect(result.hasNextPage).toBe(true);
      expect(result.endCursor).toBe('cursor123');
    });
    
    test('should return hasNextPage: false if data is null', () => {
      const result = extractPaginationInfo(null, 'products');
      
      expect(result.hasNextPage).toBe(false);
      expect(result.endCursor).toBeUndefined();
    });
    
    test('should return hasNextPage: false if resource not found', () => {
      const data = { shop: {} };
      
      const result = extractPaginationInfo(data, 'products');
      
      expect(result.hasNextPage).toBe(false);
      expect(result.endCursor).toBeUndefined();
    });
  });
  
  describe('extractNodesFromEdges', () => {
    test('should extract nodes from edges array', () => {
      const edges = [
        { node: { id: '1', title: 'Product 1' } },
        { node: { id: '2', title: 'Product 2' } }
      ];
      
      const result = extractNodesFromEdges(edges);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].title).toBe('Product 2');
    });
    
    test('should return empty array if edges is null', () => {
      const result = extractNodesFromEdges(null as any);
      
      expect(result).toEqual([]);
    });
    
    test('should return empty array if edges is not an array', () => {
      const result = extractNodesFromEdges({} as any);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('processGraphQLResponse', () => {
    test('should return data if no errors', () => {
      const response = {
        data: { products: [] }
      };
      
      const result = processGraphQLResponse(response);
      
      expect(result).toEqual({ products: [] });
    });
    
    test('should throw error if response contains errors', () => {
      const response = {
        data: null,
        errors: [
          { message: 'Error 1' },
          { message: 'Error 2' }
        ]
      };
      
      expect(() => processGraphQLResponse(response)).toThrow('GraphQL Error: Error 1\nError 2');
    });
  });
});

describe('Storefront API Query Definitions', () => {
  let mockClient: jest.Mocked<StorefrontApiClient>;
  
  beforeEach(() => {
    mockClient = new StorefrontApiClient({}) as jest.Mocked<StorefrontApiClient>;
    mockClient.request = jest.fn();
  });
  
  test('STOREFRONT_PRODUCTS_QUERY should be defined', () => {
    expect(STOREFRONT_PRODUCTS_QUERY).toBeDefined();
    expect(typeof STOREFRONT_PRODUCTS_QUERY).toBe('string');
    expect(STOREFRONT_PRODUCTS_QUERY).toContain('query StorefrontProducts');
  });
  
  test('STOREFRONT_COLLECTIONS_QUERY should be defined', () => {
    expect(STOREFRONT_COLLECTIONS_QUERY).toBeDefined();
    expect(typeof STOREFRONT_COLLECTIONS_QUERY).toBe('string');
    expect(STOREFRONT_COLLECTIONS_QUERY).toContain('query StorefrontCollections');
  });
  
  test('STOREFRONT_PAGES_QUERY should be defined', () => {
    expect(STOREFRONT_PAGES_QUERY).toBeDefined();
    expect(typeof STOREFRONT_PAGES_QUERY).toBe('string');
    expect(STOREFRONT_PAGES_QUERY).toContain('query StorefrontPages');
  });
  
  test('STOREFRONT_BLOGS_QUERY should be defined', () => {
    expect(STOREFRONT_BLOGS_QUERY).toBeDefined();
    expect(typeof STOREFRONT_BLOGS_QUERY).toBe('string');
    expect(STOREFRONT_BLOGS_QUERY).toContain('query StorefrontBlogs');
  });
  
  test('STOREFRONT_METAOBJECTS_BY_TYPE_QUERY should be defined', () => {
    expect(STOREFRONT_METAOBJECTS_BY_TYPE_QUERY).toBeDefined();
    expect(typeof STOREFRONT_METAOBJECTS_BY_TYPE_QUERY).toBe('string');
    expect(STOREFRONT_METAOBJECTS_BY_TYPE_QUERY).toContain('query StorefrontMetaobjectsByType');
  });
  
  test('STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY should be defined', () => {
    expect(STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY).toBeDefined();
    expect(typeof STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY).toBe('string');
    expect(STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY).toContain('query StorefrontShopInfoWithMenus');
  });
});

describe('fetchAllPages', () => {
  let mockClient: jest.Mocked<StorefrontApiClient>;
  
  beforeEach(() => {
    mockClient = new StorefrontApiClient({}) as jest.Mocked<StorefrontApiClient>;
    
    // Mock the request method to simulate pagination
    let callCount = 0;
    mockClient.request = jest.fn().mockImplementation(async () => {
      callCount++;
      
      if (callCount === 1) {
        return {
          data: {
            products: {
              edges: [
                { node: { id: '1', title: 'Product 1' } },
                { node: { id: '2', title: 'Product 2' } }
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor1'
              }
            }
          }
        };
      } else if (callCount === 2) {
        return {
          data: {
            products: {
              edges: [
                { node: { id: '3', title: 'Product 3' } },
                { node: { id: '4', title: 'Product 4' } }
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor2'
              }
            }
          }
        };
      } else {
        return {
          data: {
            products: {
              edges: [
                { node: { id: '5', title: 'Product 5' } }
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        };
      }
    });
  });
  
  test('should fetch all pages of data', async () => {
    const query = 'query Products { products { edges { node { id title } } pageInfo { hasNextPage endCursor } } }';
    const variables = { first: 2 };
    
    const result = await fetchAllPages(mockClient, query, variables, 'products');
    
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe('1');
    expect(result[4].id).toBe('5');
    
    // Should have made 3 requests
    expect(mockClient.request).toHaveBeenCalledTimes(3);
    
    // First request should use original variables
    expect(mockClient.request).toHaveBeenNthCalledWith(1, query, variables);
    
    // Second request should include after cursor
    expect(mockClient.request).toHaveBeenNthCalledWith(2, query, {
      ...variables,
      after: 'cursor1'
    });
    
    // Third request should include after cursor
    expect(mockClient.request).toHaveBeenNthCalledWith(3, query, {
      ...variables,
      after: 'cursor2'
    });
  });
  
  test('should handle errors during pagination', async () => {
    mockClient.request = jest.fn()
      .mockResolvedValueOnce({
        data: {
          products: {
            edges: [{ node: { id: '1' } }],
            pageInfo: { hasNextPage: true, endCursor: 'cursor1' }
          }
        }
      })
      .mockResolvedValueOnce({
        data: null,
        errors: [{ message: 'Error fetching page 2' }]
      });
    
    const query = 'query Products { products { edges { node { id } } pageInfo { hasNextPage endCursor } } }';
    const variables = { first: 1 };
    
    const result = await fetchAllPages(mockClient, query, variables, 'products');
    
    // Should only have the first page of results
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    
    // Should have made 2 requests
    expect(mockClient.request).toHaveBeenCalledTimes(2);
  });
});