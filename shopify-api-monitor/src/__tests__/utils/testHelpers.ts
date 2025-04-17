/**
 * testHelpers.ts
 * Utility functions for Storefront API tests.
 */

import { StorefrontApiClient } from '../../StorefrontApiClient';
import { StorefrontContext } from '../../types/StorefrontConfig';
import { TreeNode } from '../../dashboard/dual-view/types/TreeNode';

/**
 * Creates a mocked StorefrontApiClient instance
 * 
 * @param mockImplementation - Optional mock implementation for the request method
 * @returns Mocked StorefrontApiClient instance
 */
export function createMockStorefrontApiClient(
  mockImplementation?: jest.Mock
): jest.Mocked<StorefrontApiClient> {
  const mockClient = new StorefrontApiClient({}) as jest.Mocked<StorefrontApiClient>;
  
  // Clear any existing mocks
  jest.clearAllMocks();
  
  // Mock the request method
  mockClient.request = mockImplementation || jest.fn();
  
  // Mock other methods as needed
  mockClient.setContext = jest.fn();
  mockClient.getStoreDomain = jest.fn().mockReturnValue('test-store.myshopify.com');
  mockClient.getStorefrontApiVersion = jest.fn().mockReturnValue('2025-04');
  
  return mockClient;
}

/**
 * Creates a default StorefrontContext object
 * 
 * @param overrides - Optional overrides for the context
 * @returns StorefrontContext object
 */
export function createDefaultContext(overrides?: Partial<StorefrontContext>): StorefrontContext {
  return {
    country: 'US',
    language: 'EN',
    ...overrides
  };
}

/**
 * Validates that a TreeNode array has the expected structure
 * 
 * @param treeNodes - TreeNode array to validate
 * @param expectedRootName - Expected name of the root node
 * @param expectedChildCount - Expected number of child nodes
 * @returns Boolean indicating whether the validation passed
 */
export function validateTreeNodeStructure(
  treeNodes: TreeNode[],
  expectedRootName: string,
  expectedChildCount: number
): boolean {
  // Check that we have at least one node
  if (!treeNodes || treeNodes.length === 0) {
    return false;
  }
  
  // Check the root node
  const rootNode = treeNodes[0];
  if (rootNode.name !== expectedRootName) {
    return false;
  }
  
  // Check that the root node has children
  if (!rootNode.children || !Array.isArray(rootNode.children)) {
    return false;
  }
  
  // Check the number of children
  if (rootNode.children.length !== expectedChildCount) {
    return false;
  }
  
  return true;
}

/**
 * Validates that a raw data string is valid JSON
 * 
 * @param rawData - Raw data string to validate
 * @returns Boolean indicating whether the validation passed
 */
export function validateRawJsonData(rawData: string): boolean {
  try {
    const parsed = JSON.parse(rawData);
    return typeof parsed === 'object' && parsed !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Measures the execution time of a function
 * 
 * @param fn - Function to measure
 * @returns Object containing the result and execution time
 */
export async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T, executionTime: number }> {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  return { result, executionTime };
}

/**
 * Waits for a specified number of milliseconds
 * 
 * @param ms - Number of milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a mock GraphQL response with the specified data
 * 
 * @param data - Response data
 * @returns Mock GraphQL response
 */
export function createMockGraphQLResponse(data: any): any {
  return {
    data,
    errors: undefined
  };
}

/**
 * Creates a mock GraphQL error response
 * 
 * @param message - Error message
 * @param code - Error code
 * @returns Mock GraphQL error response
 */
export function createMockGraphQLErrorResponse(message: string, code: string = 'GRAPHQL_VALIDATION_FAILED'): any {
  return {
    data: null,
    errors: [
      {
        message,
        locations: [{ line: 1, column: 1 }],
        path: ['query'],
        extensions: {
          code
        }
      }
    ]
  };
}
