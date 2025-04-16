/**
 * DataOperations.ts
 * Provides standardized CRUD operations for Shopify resources
 */

import { ShopifyApiClient } from './ShopifyApiClient';
import { StateManager, StateRequestOptions } from './StateManager';
import { MutationManager } from './MutationManager';
import { ValidationService } from './ValidationService';
import { 
  ShopifyResourceType, 
  ReadOptions, 
  MutationOptions, 
  QueryResult,
  MutationOperation
} from './types/ShopifyResourceTypes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Provides standardized CRUD operations for Shopify resources
 */
export class DataOperations {
  private validationService: ValidationService;
  
  /**
   * Creates a new DataOperations instance
   * 
   * @param apiClient - ShopifyApiClient instance
   * @param stateManager - StateManager instance
   * @param mutationManager - MutationManager instance
   */
  constructor(
    private apiClient: ShopifyApiClient,
    private stateManager: StateManager,
    private mutationManager: MutationManager
  ) {
    this.validationService = new ValidationService();
  }
  
  /**
   * Executes a GraphQL query with caching and type safety
   * 
   * @param document - GraphQL query document
   * @param variables - Query variables
   * @param options - StateManager request options
   * @returns Query result
   */
  async query<T>(
    document: string,
    variables?: any,
    options?: Partial<StateRequestOptions>
  ): Promise<T> {
    return this.stateManager.query<T>(document, variables, options);
  }
  
  /**
   * Creates a new resource
   * 
   * @param resourceType - Type of resource to create
   * @param data - Resource data
   * @param options - Mutation options
   * @returns Created resource
   */
  async create<T>(
    resourceType: ShopifyResourceType,
    data: Partial<T>,
    options?: MutationOptions
  ): Promise<T> {
    // Validate data against schema
    const validationResult = this.validationService.validate(resourceType, data);
    if (!validationResult.valid) {
      throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`);
    }
    
    // Generate mutation
    const mutation = this.generateMutation('create', resourceType);
    
    // Create mutation operation
    const operation: Omit<MutationOperation, 'id' | 'timestamp'> = {
      type: 'create',
      resourceType,
      input: data
    };
    
    // Apply optimistic update if enabled
    let operationId: string | undefined;
    if (options?.optimisticUpdate) {
      operationId = this.mutationManager.registerMutation(
        operation,
        options.optimisticResponse ? 
          (stateManager) => {
            // Generate optimistic response and update cache
            const optimisticData = options.optimisticResponse!(data);
            // Implementation depends on how cache is structured
          } : 
          undefined
      );
    }
    
    try {
      // Execute mutation
      const result = await this.executeMutation<T>(
        mutation, 
        { input: data },
        options
      );
      
      // Complete mutation if registered
      if (operationId) {
        this.mutationManager.completeMutation(operationId, result);
      }
      
      // Invalidate cache if needed
      if (options?.invalidateCache !== false) {
        const pattern = options?.invalidateCachePattern || `${resourceType}-`;
        this.stateManager.invalidateCache(pattern);
      }
      
      // Trigger success callback
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Handle failure
      if (operationId) {
        this.mutationManager.failMutation(operationId, error as Error);
      }
      
      // Trigger error callback
      if (options?.onError) {
        options.onError(error as Error);
      }
      
      throw error;
    }
  }
  
  /**
   * Reads a resource or list of resources
   * 
   * @param resourceType - Type of resource to read
   * @param options - Read options
   * @returns Query result
   */
  async read<T>(
    resourceType: ShopifyResourceType,
    options: ReadOptions = {}
  ): Promise<QueryResult<T>> {
    // Generate query based on options
    const query = this.generateQuery(resourceType, options);
    
    // Execute query
    const result = await this.query<any>(
      query, 
      options.variables || {}, 
      options.cacheOptions
    );
    
    // Extract data and page info
    const resourceKey = this.getResourceKey(resourceType, options.id !== undefined);
    const data = result[resourceKey];
    
    // Handle pagination for list queries
    let pageInfo;
    if (!options.id && data?.pageInfo) {
      pageInfo = data.pageInfo;
    }
    
    // Extract edges/nodes for list queries
    let processedData: T | null = null;
    if (!options.id && data?.edges) {
      processedData = data.edges.map((edge: any) => edge.node) as unknown as T;
    } else {
      processedData = data as T;
    }
    
    return {
      data: processedData,
      pageInfo,
      fromCache: result.__fromCache || false,
      lastFetched: result.__lastFetched
    };
  }
  
  /**
   * Updates an existing resource
   * 
   * @param resourceType - Type of resource to update
   * @param id - Resource ID
   * @param data - Update data
   * @param options - Mutation options
   * @returns Updated resource
   */
  async update<T>(
    resourceType: ShopifyResourceType,
    id: string,
    data: Partial<T>,
    options?: MutationOptions
  ): Promise<T> {
    // Validate data against schema
    const validationResult = this.validationService.validate(resourceType, data);
    if (!validationResult.valid) {
      throw new Error(`Validation failed: ${JSON.stringify(validationResult.errors)}`);
    }
    
    // Generate mutation
    const mutation = this.generateMutation('update', resourceType);
    
    // Create mutation operation
    const operation: Omit<MutationOperation, 'id' | 'timestamp'> = {
      type: 'update',
      resourceType,
      resourceId: id,
      input: data
    };
    
    // Apply optimistic update if enabled
    let operationId: string | undefined;
    if (options?.optimisticUpdate) {
      operationId = this.mutationManager.registerMutation(
        operation,
        options.optimisticResponse ? 
          (stateManager) => {
            // Generate optimistic response and update cache
            const optimisticData = options.optimisticResponse!(data);
            // Implementation depends on how cache is structured
          } : 
          undefined
      );
    }
    
    try {
      // Execute mutation
      const result = await this.executeMutation<T>(
        mutation, 
        { id, input: data },
        options
      );
      
      // Complete mutation if registered
      if (operationId) {
        this.mutationManager.completeMutation(operationId, result);
      }
      
      // Invalidate cache if needed
      if (options?.invalidateCache !== false) {
        const pattern = options?.invalidateCachePattern || `${resourceType}-${id}`;
        this.stateManager.invalidateCache(pattern);
      }
      
      // Trigger success callback
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Handle failure
      if (operationId) {
        this.mutationManager.failMutation(operationId, error as Error);
      }
      
      // Trigger error callback
      if (options?.onError) {
        options.onError(error as Error);
      }
      
      throw error;
    }
  }
  
  /**
   * Deletes a resource
   * 
   * @param resourceType - Type of resource to delete
   * @param id - Resource ID
   * @param options - Mutation options
   * @returns Whether deletion was successful
   */
  async delete(
    resourceType: ShopifyResourceType,
    id: string,
    options?: MutationOptions
  ): Promise<boolean> {
    // Generate mutation
    const mutation = this.generateMutation('delete', resourceType);
    
    // Create mutation operation
    const operation: Omit<MutationOperation, 'id' | 'timestamp'> = {
      type: 'delete',
      resourceType,
      resourceId: id
    };
    
    // Apply optimistic update if enabled
    let operationId: string | undefined;
    if (options?.optimisticUpdate) {
      operationId = this.mutationManager.registerMutation(
        operation,
        (stateManager) => {
          // Optimistically remove from cache
          // Implementation depends on how cache is structured
        }
      );
    }
    
    try {
      // Execute mutation
      const result = await this.executeMutation<{ userErrors: any[] }>(
        mutation,
        { id },
        options
      );
      
      // Check for user errors
      const success = result.userErrors.length === 0;
      
      // Complete mutation if registered
      if (operationId) {
        this.mutationManager.completeMutation(operationId, result);
      }
      
      // Invalidate cache if needed
      if (success && options?.invalidateCache !== false) {
        const pattern = options?.invalidateCachePattern || `${resourceType}-`;
        this.stateManager.invalidateCache(pattern);
      }
      
      // Trigger success callback
      if (success && options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return success;
    } catch (error) {
      // Handle failure
      if (operationId) {
        this.mutationManager.failMutation(operationId, error as Error);
      }
      
      // Trigger error callback
      if (options?.onError) {
        options.onError(error as Error);
      }
      
      throw error;
    }
  }
  
  /**
   * Executes a mutation
   * 
   * @param mutation - GraphQL mutation document
   * @param variables - Mutation variables
   * @param options - Mutation options
   * @returns Mutation result
   */
  private async executeMutation<T>(
    mutation: string,
    variables: any,
    options?: MutationOptions
  ): Promise<T> {
    const response = await this.apiClient.request<any>(mutation, variables);
    
    // Extract data from response
    const operationName = this.extractOperationName(mutation);
    if (!operationName || !response.data || !response.data[operationName]) {
      throw new Error('Invalid mutation response');
    }
    
    // Check for user errors
    const result = response.data[operationName];
    if (result.userErrors && result.userErrors.length > 0) {
      throw new Error(`Mutation failed: ${JSON.stringify(result.userErrors)}`);
    }
    
    return result;
  }
  
  /**
   * Generates a GraphQL query for a resource
   * 
   * @param resourceType - Resource type
   * @param options - Read options
   * @returns GraphQL query
   */
  private generateQuery(resourceType: ShopifyResourceType, options: ReadOptions): string {
    const isSingleResource = options.id !== undefined;
    const resourceKey = this.getResourceKey(resourceType, isSingleResource);
    
    // Get fields to include
    const fields = this.getDefaultFields(resourceType);
    
    if (isSingleResource) {
      // Single resource query
      return `
        query Get${this.capitalize(resourceType)}($id: ID!) {
          ${resourceKey}(id: $id) {
            ${fields}
          }
        }
      `;
    } else {
      // List query
      const args = this.buildQueryArgs(options);
      return `
        query Get${this.capitalize(resourceType)}List(
          ${options.first ? '$first: Int' : ''}
          ${options.after ? ', $after: String' : ''}
          ${options.filter ? ', $query: String' : ''}
          ${options.sortKey ? ', $sortKey: String' : ''}
          ${options.reverse ? ', $reverse: Boolean' : ''}
        ) {
          ${resourceKey}(
            ${args}
          ) {
            edges {
              node {
                ${fields}
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      `;
    }
  }
  
  /**
   * Generates a GraphQL mutation for a resource
   * 
   * @param operation - Operation type
   * @param resourceType - Resource type
   * @returns GraphQL mutation
   */
  private generateMutation(
    operation: 'create' | 'update' | 'delete',
    resourceType: ShopifyResourceType
  ): string {
    const capitalizedType = this.capitalize(resourceType);
    
    switch (operation) {
      case 'create':
        return `
          mutation Create${capitalizedType}($input: ${capitalizedType}Input!) {
            ${resourceType}Create(input: $input) {
              ${resourceType} {
                ${this.getDefaultFields(resourceType)}
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
      
      case 'update':
        return `
          mutation Update${capitalizedType}($id: ID!, $input: ${capitalizedType}Input!) {
            ${resourceType}Update(id: $id, input: $input) {
              ${resourceType} {
                ${this.getDefaultFields(resourceType)}
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
      
      case 'delete':
        return `
          mutation Delete${capitalizedType}($id: ID!) {
            ${resourceType}Delete(id: $id) {
              deletedId
              userErrors {
                field
                message
              }
            }
          }
        `;
      
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
  
  /**
   * Gets the GraphQL resource key for a resource type
   * 
   * @param resourceType - Resource type
   * @param isSingle - Whether it's a single resource query
   * @returns Resource key
   */
  private getResourceKey(resourceType: ShopifyResourceType, isSingle: boolean): string {
    // Handle special cases
    switch (resourceType) {
      case ShopifyResourceType.PRODUCT:
        return isSingle ? 'product' : 'products';
      case ShopifyResourceType.PRODUCT_VARIANT:
        return isSingle ? 'productVariant' : 'productVariants';
      case ShopifyResourceType.COLLECTION:
        return isSingle ? 'collection' : 'collections';
      case ShopifyResourceType.CUSTOMER:
        return isSingle ? 'customer' : 'customers';
      case ShopifyResourceType.ORDER:
        return isSingle ? 'order' : 'orders';
      case ShopifyResourceType.DRAFT_ORDER:
        return isSingle ? 'draftOrder' : 'draftOrders';
      case ShopifyResourceType.INVENTORY_ITEM:
        return isSingle ? 'inventoryItem' : 'inventoryItems';
      case ShopifyResourceType.INVENTORY_LEVEL:
        return isSingle ? 'inventoryLevel' : 'inventoryLevels';
      case ShopifyResourceType.FULFILLMENT:
        return isSingle ? 'fulfillment' : 'fulfillments';
      case ShopifyResourceType.SHOP:
        return 'shop';
      case ShopifyResourceType.METAFIELD:
        return isSingle ? 'metafield' : 'metafields';
      case ShopifyResourceType.DISCOUNT:
        return isSingle ? 'discount' : 'discounts';
      case ShopifyResourceType.PRICE_RULE:
        return isSingle ? 'priceRule' : 'priceRules';
      default:
        return isSingle ? resourceType : `${resourceType}s`;
    }
  }
  
  /**
   * Gets default fields for a resource type
   * 
   * @param resourceType - Resource type
   * @returns GraphQL fields
   */
  private getDefaultFields(resourceType: ShopifyResourceType): string {
    // Return default fields based on resource type
    switch (resourceType) {
      case ShopifyResourceType.PRODUCT:
        return `
          id
          title
          description
          descriptionHtml
          productType
          vendor
          status
          createdAt
          updatedAt
          tags
          options {
            id
            name
            values
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                sku
                inventoryQuantity
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                src
                altText
              }
            }
          }
        `;
      
      case ShopifyResourceType.CUSTOMER:
        return `
          id
          firstName
          lastName
          email
          phone
          acceptsMarketing
          createdAt
          updatedAt
          tags
          defaultAddress {
            id
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        `;
      
      case ShopifyResourceType.ORDER:
        return `
          id
          name
          email
          phone
          createdAt
          updatedAt
          totalPrice
          subtotalPrice
          totalTax
          currencyCode
          financialStatus
          fulfillmentStatus
          tags
          customer {
            id
            email
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  title
                  price
                }
              }
            }
          }
        `;
      
      // Add more resource types as needed
      
      default:
        return `
          id
          createdAt
          updatedAt
        `;
    }
  }
  
  /**
   * Builds query arguments for list queries
   * 
   * @param options - Read options
   * @returns Query arguments
   */
  private buildQueryArgs(options: ReadOptions): string {
    const args: string[] = [];
    
    if (options.first) {
      args.push(`first: $first`);
    }
    
    if (options.after) {
      args.push(`after: $after`);
    }
    
    if (options.filter) {
      args.push(`query: $query`);
    }
    
    if (options.sortKey) {
      args.push(`sortKey: $sortKey`);
    }
    
    if (options.reverse) {
      args.push(`reverse: $reverse`);
    }
    
    return args.join(', ');
  }
  
  /**
   * Extracts operation name from a GraphQL mutation
   * 
   * @param mutation - GraphQL mutation
   * @returns Operation name
   */
  private extractOperationName(mutation: string): string | null {
    // Simple regex to extract the operation name
    const match = mutation.match(/mutation\s+\w+\s*\([^)]*\)\s*{\s*(\w+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Capitalizes a string
   * 
   * @param str - String to capitalize
   * @returns Capitalized string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}