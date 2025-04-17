/**
 * StorefrontApiClient.test.ts
 * Tests for the StorefrontApiClient class.
 * 
 * Note: To run these tests, you need to install Jest and its type definitions:
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * Then add the following to your package.json:
 * "jest": {
 *   "preset": "ts-jest",
 *   "testEnvironment": "node"
 * }
 */

import { StorefrontApiClient } from '../StorefrontApiClient';
import { StorefrontContext } from '../types/StorefrontConfig';

// Mock the GraphQLClient
jest.mock('graphql-request', () => {
  return {
    GraphQLClient: jest.fn().mockImplementation(() => {
      return {
        rawRequest: jest.fn().mockImplementation(async (query: string) => {
          if (query.includes('nonExistentField')) {
            return {
              data: null,
              errors: [
                {
                  message: 'Field nonExistentField does not exist',
                  locations: [{ line: 1, column: 1 }],
                  path: ['nonExistentField']
                }
              ]
            };
          }
          
          if (query.includes('@inContext')) {
            return {
              data: {
                products: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/Product/1',
                        title: 'Localized Product',
                        priceRange: {
                          minVariantPrice: {
                            amount: '10.00',
                            currencyCode: query.includes('country: US') ? 'USD' : 'CAD'
                          }
                        }
                      }
                    }
                  ]
                }
              }
            };
          }
          
          return {
            data: {
              products: {
                edges: [
                  {
                    node: {
                      id: 'gid://shopify/Product/1',
                      title: 'Test Product',
                      priceRange: {
                        minVariantPrice: {
                          amount: '10.00',
                          currencyCode: 'USD'
                        }
                      }
                    }
                  }
                ]
              }
            }
          };
        }),
        setHeader: jest.fn()
      };
    })
  };
});

// Mock ConfigManager
jest.mock('../ConfigManager', () => {
  return {
    getConfig: jest.fn().mockReturnValue({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04'
    }),
    getInstance: jest.fn().mockReturnValue({
      getConfig: jest.fn().mockReturnValue({
        storeDomain: 'test-store.myshopify.com',
        publicStorefrontToken: 'test-token',
        storefrontApiVersion: '2025-04'
      })
    })
  };
});

describe('StorefrontApiClient', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should initialize with config options', () => {
    const client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      useEnvConfig: false
    });
    
    expect(client).toBeDefined();
    expect(client.getStoreDomain()).toBe('test-store.myshopify.com');
    expect(client.getStorefrontApiVersion()).toBe('2025-04');
  });
  
  test('should throw error if required options are missing', () => {
    expect(() => {
      new StorefrontApiClient({
        storeDomain: 'test-store.myshopify.com',
        // Missing token
        useEnvConfig: false
      });
    }).toThrow('Missing required option');
  });
  
  test('should execute a GraphQL query successfully', async () => {
    const client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      useEnvConfig: false
    });
    
    const query = `
      query Products {
        products(first: 1) {
          edges {
            node {
              id
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await client.request(query);
    
    expect(response.data).toBeDefined();
    expect(response.data?.products.edges[0].node.title).toBe('Test Product');
    expect(response.errors).toBeUndefined();
  });
  
  test('should apply context directive to query', async () => {
    const context: StorefrontContext = {
      country: 'US',
      language: 'EN'
    };
    
    const client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      context,
      useEnvConfig: false
    });
    
    const query = `
      query Products {
        products(first: 1) {
          edges {
            node {
              id
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;
    
    const response = await client.request(query);
    
    expect(response.data).toBeDefined();
    expect(response.data?.products.edges[0].node.title).toBe('Localized Product');
    expect(response.data?.products.edges[0].node.priceRange.minVariantPrice.currencyCode).toBe('USD');
  });
  
  test('should handle GraphQL errors', async () => {
    const client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      useEnvConfig: false
    });
    
    const invalidQuery = `
      query InvalidQuery {
        nonExistentField {
          id
        }
      }
    `;
    
    const response = await client.request(invalidQuery);
    
    expect(response.errors).toBeDefined();
    expect(response.errors?.[0].message).toBe('Field nonExistentField does not exist');
    expect(response.data).toBeNull();
  });
  
  test('should handle context changes', async () => {
    const client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      context: {
        country: 'US',
        language: 'EN'
      },
      useEnvConfig: false
    });
    
    const query = `
      query Products {
        products(first: 1) {
          edges {
            node {
              id
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;
    
    // First request with US context
    const response1 = await client.request(query);
    expect(response1.data?.products.edges[0].node.priceRange.minVariantPrice.currencyCode).toBe('USD');
    
    // Change context to CA
    client.setContext({
      country: 'CA',
      language: 'EN'
    });
    
    // Second request with CA context
    const response2 = await client.request(query);
    expect(response2.data?.products.edges[0].node.priceRange.minVariantPrice.currencyCode).toBe('CAD');
  });
  
  test('should call onError callback when provided', async () => {
    const mockOnError = jest.fn();
    
    const client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      onError: mockOnError,
      useEnvConfig: false
    });
    
    const invalidQuery = `
      query InvalidQuery {
        nonExistentField {
          id
        }
      }
    `;
    
    await client.request(invalidQuery);
    
    // onError should not be called for GraphQL errors that are returned in the response
    expect(mockOnError).not.toHaveBeenCalled();
    
    // Mock a network error
    const GraphQLClient = require('graphql-request').GraphQLClient;
    GraphQLClient.mockImplementationOnce(() => {
      return {
        rawRequest: jest.fn().mockRejectedValue(new Error('Network error')),
        setHeader: jest.fn()
      };
    });
    
    try {
      await client.request(invalidQuery);
    } catch (error) {
      // Error should be caught
    }
    
    // onError should be called for network errors
    expect(mockOnError).toHaveBeenCalled();
  });
});