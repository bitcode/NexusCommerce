/**
 * CollectionsAPI.ts
 * Service for Shopify Admin API collection operations
 */

import { ShopifyApiClient } from '../../shopify-api-monitor/src/ShopifyApiClient';
import {
  GET_COLLECTION,
  GET_COLLECTIONS,
  GET_COLLECTIONS_BASIC,
  GET_COLLECTION_PRODUCTS,
  GET_COLLECTION_METAFIELDS,
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
  DELETE_COLLECTION,
  ADD_PRODUCTS_TO_COLLECTION,
  REMOVE_PRODUCTS_FROM_COLLECTION,
  REORDER_PRODUCTS_IN_COLLECTION,
  PUBLISH_COLLECTION,
  UNPUBLISH_COLLECTION
} from '../../graphql/admin/collections';

/**
 * Service class for Shopify Admin API collection operations
 */
export class CollectionsAPI {
  private apiClient: ShopifyApiClient;

  /**
   * Constructor
   * @param apiClient ShopifyApiClient instance
   */
  constructor(apiClient: ShopifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get a collection by ID
   * @param id Collection ID
   * @param options Optional query options
   * @returns Collection data
   */
  async getCollection(id: string, options: any = {}) {
    const variables = {
      id,
      productsFirst: options.productsFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(GET_COLLECTION, variables);
    return response.data?.collection;
  }

  /**
   * Get a list of collections
   * @param options Query options
   * @returns Collections connection
   */
  async getCollections(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      productsFirst: options.productsFirst || 5,
      metafieldsFirst: options.metafieldsFirst || 5
    };

    const response = await this.apiClient.request(GET_COLLECTIONS, variables);
    return response.data?.collections;
  }

  /**
   * Get a list of collections with basic information
   * @param options Query options
   * @returns Collections connection with basic information
   */
  async getCollectionsBasic(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_COLLECTIONS_BASIC, variables);
    return response.data?.collections;
  }

  /**
   * Get products in a collection
   * @param collectionId Collection ID
   * @param options Query options
   * @returns Collection products connection
   */
  async getCollectionProducts(collectionId: string, options: any = {}) {
    const variables = {
      collectionId,
      first: options.first || 20,
      after: options.after || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_COLLECTION_PRODUCTS, variables);
    return response.data?.collection?.products;
  }

  /**
   * Get metafields for a collection
   * @param collectionId Collection ID
   * @param options Query options
   * @returns Collection metafields connection
   */
  async getCollectionMetafields(collectionId: string, options: any = {}) {
    const variables = {
      collectionId,
      first: options.first || 20,
      after: options.after || null,
      namespace: options.namespace || null,
      key: options.key || null
    };

    const response = await this.apiClient.request(GET_COLLECTION_METAFIELDS, variables);
    return response.data?.collection?.metafields;
  }

  /**
   * Create a new collection
   * @param input Collection input
   * @param options Optional query options
   * @returns Created collection
   */
  async createCollection(input: any, options: any = {}) {
    const variables = {
      input,
      productsFirst: options.productsFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(CREATE_COLLECTION, variables);
    
    if (response.data?.collectionCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create collection: ${response.data.collectionCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionCreate?.collection;
  }

  /**
   * Update an existing collection
   * @param id Collection ID
   * @param input Collection input
   * @param options Optional query options
   * @returns Updated collection
   */
  async updateCollection(id: string, input: any, options: any = {}) {
    const variables = {
      id,
      input,
      productsFirst: options.productsFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(UPDATE_COLLECTION, variables);
    
    if (response.data?.collectionUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update collection: ${response.data.collectionUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionUpdate?.collection;
  }

  /**
   * Delete a collection
   * @param id Collection ID
   * @returns Boolean indicating success
   */
  async deleteCollection(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(DELETE_COLLECTION, variables);
    
    if (response.data?.collectionDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete collection: ${response.data.collectionDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionDelete?.deletedCollectionId === id;
  }

  /**
   * Add products to a collection
   * @param id Collection ID
   * @param productIds Product IDs to add
   * @returns Updated collection
   */
  async addProductsToCollection(id: string, productIds: string[]) {
    const variables = { id, productIds };

    const response = await this.apiClient.request(ADD_PRODUCTS_TO_COLLECTION, variables);
    
    if (response.data?.collectionAddProducts?.userErrors?.length > 0) {
      throw new Error(
        `Failed to add products to collection: ${response.data.collectionAddProducts.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionAddProducts?.collection;
  }

  /**
   * Remove products from a collection
   * @param id Collection ID
   * @param productIds Product IDs to remove
   * @returns Updated collection
   */
  async removeProductsFromCollection(id: string, productIds: string[]) {
    const variables = { id, productIds };

    const response = await this.apiClient.request(REMOVE_PRODUCTS_FROM_COLLECTION, variables);
    
    if (response.data?.collectionRemoveProducts?.userErrors?.length > 0) {
      throw new Error(
        `Failed to remove products from collection: ${response.data.collectionRemoveProducts.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionRemoveProducts?.collection;
  }

  /**
   * Reorder products in a collection
   * @param id Collection ID
   * @param moves Product moves
   * @returns Updated collection
   */
  async reorderProductsInCollection(id: string, moves: any[]) {
    const variables = { id, moves };

    const response = await this.apiClient.request(REORDER_PRODUCTS_IN_COLLECTION, variables);
    
    if (response.data?.collectionReorderProducts?.userErrors?.length > 0) {
      throw new Error(
        `Failed to reorder products in collection: ${response.data.collectionReorderProducts.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionReorderProducts?.collection;
  }

  /**
   * Publish a collection
   * @param id Collection ID
   * @returns Published collection
   */
  async publishCollection(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(PUBLISH_COLLECTION, variables);
    
    if (response.data?.collectionPublish?.userErrors?.length > 0) {
      throw new Error(
        `Failed to publish collection: ${response.data.collectionPublish.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionPublish?.collection;
  }

  /**
   * Unpublish a collection
   * @param id Collection ID
   * @returns Unpublished collection
   */
  async unpublishCollection(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(UNPUBLISH_COLLECTION, variables);
    
    if (response.data?.collectionUnpublish?.userErrors?.length > 0) {
      throw new Error(
        `Failed to unpublish collection: ${response.data.collectionUnpublish.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.collectionUnpublish?.collection;
  }
}
