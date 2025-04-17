/**
 * StorefrontApiErrorHandling.test.ts
 * Tests for error handling in the Storefront API integration.
 */

import { StorefrontApiClient } from '../StorefrontApiClient';
import { 
  MOCK_GRAPHQL_ERROR_RESPONSE,
  MOCK_430_SECURITY_ERROR,
  MOCK_RATE_LIMIT_ERROR
} from './fixtures/storefrontApiResponses';
import {
  generateGraphQLErrorResponse,
  generateNetworkError,
  generate430SecurityError
} from './utils/mockDataGenerators';

// Mock the GraphQLClient
jest.mock('graphql-request', () => {
  return {
    GraphQLClient: jest.fn().mockImplementation(() => {
      return {
        rawRequest: jest.fn(),
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

describe('Storefront API Error Handling', () => {
  let client: StorefrontApiClient;
  let mockOnError: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnError = jest.fn();
    
    client = new StorefrontApiClient({
      storeDomain: 'test-store.myshopify.com',
      publicStorefrontToken: 'test-token',
      storefrontApiVersion: '2025-04',
      onError: mockOnError,
      useEnvConfig: false
    });
  });
  
  describe('GraphQL Errors', () => {
    test('should handle validation errors', async () => {
      // Mock the GraphQLClient to return a validation error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockResolvedValue(
            generateGraphQLErrorResponse('Field does not exist on type', 'GRAPHQL_VALIDATION_FAILED')
          ),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query InvalidQuery {
          nonExistentField {
            id
          }
        }
      `;
      
      const response = await client.request(query);
      
      expect(response.data).toBeNull();
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe('Field does not exist on type');
      expect(response.errors?.[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
    });
    
    test('should handle multiple GraphQL errors', async () => {
      // Mock the GraphQLClient to return multiple errors
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockResolvedValue({
            data: null,
            errors: [
              {
                message: 'Error 1',
                locations: [{ line: 1, column: 1 }],
                path: ['query'],
                extensions: { code: 'ERROR_1' }
              },
              {
                message: 'Error 2',
                locations: [{ line: 2, column: 1 }],
                path: ['query'],
                extensions: { code: 'ERROR_2' }
              }
            ]
          }),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query MultipleErrors {
          field1
          field2
        }
      `;
      
      const response = await client.request(query);
      
      expect(response.data).toBeNull();
      expect(response.errors).toBeDefined();
      expect(response.errors?.length).toBe(2);
      expect(response.errors?.[0].message).toBe('Error 1');
      expect(response.errors?.[1].message).toBe('Error 2');
    });
  });
  
  describe('Network Errors', () => {
    test('should handle network errors', async () => {
      // Mock the GraphQLClient to throw a network error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockRejectedValue(
            generateNetworkError('Network request failed')
          ),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      try {
        await client.request(query);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Network request failed');
        expect(mockOnError).toHaveBeenCalled();
      }
    });
    
    test('should handle timeout errors', async () => {
      // Mock the GraphQLClient to throw a timeout error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockRejectedValue(
            generateNetworkError('Request timed out')
          ),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      try {
        await client.request(query);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toBe('Request timed out');
        expect(mockOnError).toHaveBeenCalled();
      }
    });
  });
  
  describe('Security Errors', () => {
    test('should handle 430 security errors', async () => {
      // Mock the GraphQLClient to return a 430 security error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockResolvedValue(MOCK_430_SECURITY_ERROR),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      const response = await client.request(query);
      
      expect(response.data).toBeNull();
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe('Request was rejected due to security concerns');
      expect(response.errors?.[0].extensions.code).toBe('ACCESS_DENIED');
      expect(mockOnError).toHaveBeenCalled();
    });
  });
  
  describe('Rate Limiting', () => {
    test('should handle rate limit errors', async () => {
      // Mock the GraphQLClient to return a rate limit error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockResolvedValue(MOCK_RATE_LIMIT_ERROR),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      const response = await client.request(query);
      
      expect(response.data).toBeNull();
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe('Throttled');
      expect(response.errors?.[0].extensions.code).toBe('THROTTLED');
      expect(mockOnError).toHaveBeenCalled();
    });
  });
  
  describe('Error Callback', () => {
    test('should call onError callback for GraphQL errors', async () => {
      // Mock the GraphQLClient to return a GraphQL error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockResolvedValue(MOCK_GRAPHQL_ERROR_RESPONSE),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query InvalidQuery {
          nonExistentField {
            id
          }
        }
      `;
      
      await client.request(query);
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Field does not exist on type',
          extensions: { code: 'GRAPHQL_VALIDATION_FAILED' }
        })
      );
    });
    
    test('should call onError callback for network errors', async () => {
      // Mock the GraphQLClient to throw a network error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockRejectedValue(
            generateNetworkError('Network request failed')
          ),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      try {
        await client.request(query);
      } catch (error) {
        // Error is expected
      }
      
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network request failed'
        })
      );
    });
    
    test('should not call onError if not provided', async () => {
      // Create a client without onError callback
      const clientWithoutErrorCallback = new StorefrontApiClient({
        storeDomain: 'test-store.myshopify.com',
        publicStorefrontToken: 'test-token',
        storefrontApiVersion: '2025-04',
        useEnvConfig: false
      });
      
      // Mock the GraphQLClient to return a GraphQL error
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: jest.fn().mockResolvedValue(MOCK_GRAPHQL_ERROR_RESPONSE),
          setHeader: jest.fn()
        };
      });
      
      const query = `
        query InvalidQuery {
          nonExistentField {
            id
          }
        }
      `;
      
      // This should not throw an error
      await clientWithoutErrorCallback.request(query);
      
      // onError should not be called
      expect(mockOnError).not.toHaveBeenCalled();
    });
  });
  
  describe('Retry Mechanism', () => {
    test('should retry on network errors if retry is enabled', async () => {
      // Mock the GraphQLClient to fail once then succeed
      const rawRequestMock = jest.fn()
        .mockRejectedValueOnce(generateNetworkError('Network request failed'))
        .mockResolvedValueOnce({
          data: {
            products: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/Product/1',
                    title: 'Test Product'
                  }
                }
              ]
            }
          }
        });
      
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: rawRequestMock,
          setHeader: jest.fn()
        };
      });
      
      // Create a client with retry enabled
      const clientWithRetry = new StorefrontApiClient({
        storeDomain: 'test-store.myshopify.com',
        publicStorefrontToken: 'test-token',
        storefrontApiVersion: '2025-04',
        useEnvConfig: false,
        advanced: {
          retry: {
            maxRetries: 3,
            initialDelay: 100,
            maxDelay: 1000
          }
        }
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      const response = await clientWithRetry.request(query);
      
      // Should have retried and succeeded
      expect(rawRequestMock).toHaveBeenCalledTimes(2);
      expect(response.data).toBeDefined();
      expect(response.data?.products.edges[0].node.title).toBe('Test Product');
    });
    
    test('should not retry on validation errors', async () => {
      // Mock the GraphQLClient to return a validation error
      const rawRequestMock = jest.fn().mockResolvedValue(
        generateGraphQLErrorResponse('Field does not exist on type', 'GRAPHQL_VALIDATION_FAILED')
      );
      
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: rawRequestMock,
          setHeader: jest.fn()
        };
      });
      
      // Create a client with retry enabled
      const clientWithRetry = new StorefrontApiClient({
        storeDomain: 'test-store.myshopify.com',
        publicStorefrontToken: 'test-token',
        storefrontApiVersion: '2025-04',
        useEnvConfig: false,
        advanced: {
          retry: {
            maxRetries: 3,
            initialDelay: 100,
            maxDelay: 1000
          }
        }
      });
      
      const query = `
        query InvalidQuery {
          nonExistentField {
            id
          }
        }
      `;
      
      const response = await clientWithRetry.request(query);
      
      // Should not have retried
      expect(rawRequestMock).toHaveBeenCalledTimes(1);
      expect(response.errors).toBeDefined();
      expect(response.errors?.[0].message).toBe('Field does not exist on type');
    });
    
    test('should retry on rate limit errors if retry is enabled', async () => {
      // Mock the GraphQLClient to return a rate limit error then succeed
      const rawRequestMock = jest.fn()
        .mockResolvedValueOnce(MOCK_RATE_LIMIT_ERROR)
        .mockResolvedValueOnce({
          data: {
            products: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/Product/1',
                    title: 'Test Product'
                  }
                }
              ]
            }
          }
        });
      
      const GraphQLClient = require('graphql-request').GraphQLClient;
      GraphQLClient.mockImplementationOnce(() => {
        return {
          rawRequest: rawRequestMock,
          setHeader: jest.fn()
        };
      });
      
      // Create a client with retry enabled
      const clientWithRetry = new StorefrontApiClient({
        storeDomain: 'test-store.myshopify.com',
        publicStorefrontToken: 'test-token',
        storefrontApiVersion: '2025-04',
        useEnvConfig: false,
        advanced: {
          retry: {
            maxRetries: 3,
            initialDelay: 100,
            maxDelay: 1000
          }
        }
      });
      
      const query = `
        query Products {
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `;
      
      const response = await clientWithRetry.request(query);
      
      // Should have retried and succeeded
      expect(rawRequestMock).toHaveBeenCalledTimes(2);
      expect(response.data).toBeDefined();
      expect(response.data?.products.edges[0].node.title).toBe('Test Product');
    });
  });
});
