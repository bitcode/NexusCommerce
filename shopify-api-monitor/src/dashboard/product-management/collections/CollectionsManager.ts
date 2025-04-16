/**
 * CollectionsManager.ts
 * Component for managing Shopify collections
 */

import { ShopifyApiClient } from '../../../ShopifyApiClient';
import { StateManager } from '../../../StateManager';
import { DataOperations } from '../../../DataOperations';
import { NotificationSystem, NotificationType, NotificationTopic } from '../../../NotificationSystem';
import { MutationManager } from '../../../MutationManager';
import { ShopifyResourceType, Collection, ReadOptions } from '../../../types/ShopifyResourceTypes';

/**
 * Props for the CollectionsManager component
 */
export interface CollectionsManagerProps {
  /** Callback when a collection is selected */
  onCollectionSelect?: (collectionId: string) => void;
  
  /** Callback when a collection is created */
  onCollectionCreate?: (collection: Collection) => void;
  
  /** Callback when a collection is updated */
  onCollectionUpdate?: (collection: Collection) => void;
  
  /** Callback when a collection is deleted */
  onCollectionDelete?: (collectionId: string) => void;
  
  /** Callback when a notification is triggered */
  onNotification?: (message: string, type: NotificationType) => void;
}

/**
 * Collection list filters
 */
export interface CollectionFilters {
  /** Search query */
  query?: string;
  
  /** Collection type */
  collectionType?: 'SMART' | 'CUSTOM' | 'ALL';
  
  /** Created after date */
  createdAfter?: string;
  
  /** Updated after date */
  updatedAfter?: string;
  
  /** Sort field */
  sortField?: 'title' | 'createdAt' | 'updatedAt';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Class for managing Shopify collections
 */
export class CollectionsManager {
  private dataOperations: DataOperations;
  private notificationSystem: NotificationSystem;
  
  /**
   * Creates a new CollectionsManager
   * 
   * @param apiClient - ShopifyApiClient instance
   * @param stateManager - StateManager instance
   * @param mutationManager - MutationManager instance
   * @param notificationSystem - NotificationSystem instance
   */
  constructor(
    private apiClient: ShopifyApiClient,
    private stateManager: StateManager,
    private mutationManager: MutationManager,
    notificationSystem: NotificationSystem
  ) {
    this.dataOperations = new DataOperations(apiClient, stateManager, mutationManager);
    this.notificationSystem = notificationSystem;
  }
  
  /**
   * Fetches collections with optional filtering
   * 
   * @param filters - Collection filters
   * @param pageSize - Number of collections per page
   * @param cursor - Pagination cursor
   * @returns Promise resolving to collections and pagination info
   */
  async fetchCollections(
    filters: CollectionFilters = {},
    pageSize: number = 20,
    cursor?: string
  ): Promise<{ collections: Collection[], hasNextPage: boolean, endCursor?: string }> {
    try {
      // Build GraphQL query filter
      let queryFilter = '';
      const filterParts: string[] = [];
      
      if (filters.query) {
        filterParts.push(`title:*${filters.query}*`);
      }
      
      if (filters.collectionType && filters.collectionType !== 'ALL') {
        // For collection type, we need to use a different approach
        // as the filter syntax is different
        if (filters.collectionType === 'SMART') {
          filterParts.push(`rule_set:*`);
        } else if (filters.collectionType === 'CUSTOM') {
          // This is a bit of a hack, but we can filter for collections
          // that don't have a rule set by excluding those that do
          filterParts.push(`-rule_set:*`);
        }
      }
      
      if (filters.createdAfter) {
        filterParts.push(`created_at:>=${filters.createdAfter}`);
      }
      
      if (filters.updatedAfter) {
        filterParts.push(`updated_at:>=${filters.updatedAfter}`);
      }
      
      if (filterParts.length > 0) {
        queryFilter = filterParts.join(' AND ');
      }
      
      // Build sort parameter
      let sortKey = 'TITLE';
      if (filters.sortField) {
        switch (filters.sortField) {
          case 'title': sortKey = 'TITLE'; break;
          case 'createdAt': sortKey = 'CREATED_AT'; break;
          case 'updatedAt': sortKey = 'UPDATED_AT'; break;
        }
      }
      
      // Prepare read options
      const options: ReadOptions = {
        first: pageSize,
        filter: queryFilter ? { query: queryFilter } : undefined,
        after: cursor,
        sortKey: sortKey,
        reverse: filters.sortDirection === 'desc'
      };
      
      // Fetch collections
      const result = await this.dataOperations.read<Collection[]>(ShopifyResourceType.COLLECTION, options);
      
      return {
        collections: result.data || [],
        hasNextPage: result.pageInfo?.hasNextPage || false,
        endCursor: result.pageInfo?.endCursor
      };
    } catch (error) {
      console.error('Error fetching collections:', error);
      this.notificationSystem.notify(
        `Failed to fetch collections: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return { collections: [], hasNextPage: false };
    }
  }
  
  /**
   * Fetches a single collection by ID
   * 
   * @param id - Collection ID
   * @returns Promise resolving to the collection
   */
  async fetchCollection(id: string): Promise<Collection | null> {
    try {
      const result = await this.dataOperations.read<Collection>(ShopifyResourceType.COLLECTION, { id });
      return result.data;
    } catch (error) {
      console.error(`Error fetching collection ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to fetch collection: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Creates a new collection
   * 
   * @param collectionData - Collection data
   * @returns Promise resolving to the created collection
   */
  async createCollection(collectionData: Partial<Collection>): Promise<Collection | null> {
    try {
      const result = await this.dataOperations.create<Collection>(
        ShopifyResourceType.COLLECTION,
        collectionData,
        {
          onSuccess: (data) => {
            this.notificationSystem.notify(
              `Collection "${data.title}" created successfully`,
              NotificationType.SUCCESS,
              NotificationTopic.SYSTEM
            );
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error creating collection:', error);
      this.notificationSystem.notify(
        `Failed to create collection: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Updates an existing collection
   * 
   * @param id - Collection ID
   * @param collectionData - Updated collection data
   * @returns Promise resolving to the updated collection
   */
  async updateCollection(id: string, collectionData: Partial<Collection>): Promise<Collection | null> {
    try {
      const result = await this.dataOperations.update<Collection>(
        ShopifyResourceType.COLLECTION,
        id,
        collectionData,
        {
          onSuccess: (data) => {
            this.notificationSystem.notify(
              `Collection "${data.title}" updated successfully`,
              NotificationType.SUCCESS,
              NotificationTopic.SYSTEM
            );
          }
        }
      );
      return result;
    } catch (error) {
      console.error(`Error updating collection ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to update collection: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Deletes a collection
   * 
   * @param id - Collection ID
   * @returns Promise resolving to success status
   */
  async deleteCollection(id: string): Promise<boolean> {
    try {
      const success = await this.dataOperations.delete(
        ShopifyResourceType.COLLECTION,
        id,
        {
          onSuccess: () => {
            this.notificationSystem.notify(
              'Collection deleted successfully',
              NotificationType.SUCCESS,
              NotificationTopic.SYSTEM
            );
          }
        }
      );
      return success;
    } catch (error) {
      console.error(`Error deleting collection ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to delete collection: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Adds products to a collection
   * 
   * @param collectionId - Collection ID
   * @param productIds - Array of product IDs to add
   * @returns Promise resolving to success status
   */
  async addProductsToCollection(collectionId: string, productIds: string[]): Promise<boolean> {
    try {
      // For adding products to a collection, we need to use a special mutation
      const mutation = `
        mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $productIds) {
            collection {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        id: collectionId,
        productIds
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.collectionAddProducts?.userErrors?.length > 0) {
        const errors = response.data.collectionAddProducts.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = !!response.data?.collectionAddProducts?.collection;
      
      if (success) {
        const collection = response.data.collectionAddProducts.collection;
        this.notificationSystem.notify(
          `Added ${productIds.length} product(s) to collection "${collection.title}"`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error adding products to collection ${collectionId}:`, error);
      this.notificationSystem.notify(
        `Failed to add products to collection: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Removes products from a collection
   * 
   * @param collectionId - Collection ID
   * @param productIds - Array of product IDs to remove
   * @returns Promise resolving to success status
   */
  async removeProductsFromCollection(collectionId: string, productIds: string[]): Promise<boolean> {
    try {
      // For removing products from a collection, we need to use a special mutation
      const mutation = `
        mutation CollectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
          collectionRemoveProducts(id: $id, productIds: $productIds) {
            collection {
              id
              title
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        id: collectionId,
        productIds
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.collectionRemoveProducts?.userErrors?.length > 0) {
        const errors = response.data.collectionRemoveProducts.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = !!response.data?.collectionRemoveProducts?.collection;
      
      if (success) {
        const collection = response.data.collectionRemoveProducts.collection;
        this.notificationSystem.notify(
          `Removed ${productIds.length} product(s) from collection "${collection.title}"`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error removing products from collection ${collectionId}:`, error);
      this.notificationSystem.notify(
        `Failed to remove products from collection: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Fetches products in a collection
   * 
   * @param collectionId - Collection ID
   * @param pageSize - Number of products per page
   * @param cursor - Pagination cursor
   * @returns Promise resolving to products and pagination info
   */
  async fetchCollectionProducts(
    collectionId: string,
    pageSize: number = 20,
    cursor?: string
  ): Promise<{ products: any[], hasNextPage: boolean, endCursor?: string }> {
    try {
      const query = `
        query GetCollectionProducts($id: ID!, $first: Int!, $after: String) {
          collection(id: $id) {
            products(first: $first, after: $after) {
              edges {
                node {
                  id
                  title
                  handle
                  productType
                  vendor
                  status
                  images(first: 1) {
                    edges {
                      node {
                        id
                        src
                        altText
                      }
                    }
                  }
                }
                cursor
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;
      
      const variables = {
        id: collectionId,
        first: pageSize,
        after: cursor
      };
      
      const response = await this.apiClient.request<any>(query, variables);
      
      const products = response.data?.collection?.products?.edges?.map((edge: any) => edge.node) || [];
      const pageInfo = response.data?.collection?.products?.pageInfo || { hasNextPage: false };
      
      return {
        products,
        hasNextPage: pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor
      };
    } catch (error) {
      console.error(`Error fetching products for collection ${collectionId}:`, error);
      this.notificationSystem.notify(
        `Failed to fetch collection products: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return { products: [], hasNextPage: false };
    }
  }
}