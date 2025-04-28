/**
 * StorefrontCollectionsAPI.ts
 * Service for Shopify Storefront API collection operations
 */

import { StorefrontApiClient } from '../../shopify-api-monitor/src/StorefrontApiClient';
import {
  GET_STOREFRONT_COLLECTION_BY_HANDLE,
  GET_STOREFRONT_COLLECTION_BY_ID,
  GET_STOREFRONT_COLLECTIONS,
  GET_STOREFRONT_COLLECTIONS_BASIC,
  GET_STOREFRONT_COLLECTION_PRODUCTS
} from '../../graphql/storefront/collections';

/**
 * Service class for Shopify Storefront API collection operations
 */
export class StorefrontCollectionsAPI {
  private apiClient: StorefrontApiClient;

  /**
   * Constructor
   * @param apiClient StorefrontApiClient instance
   */
  constructor(apiClient: StorefrontApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get a collection by handle
   * @param handle Collection handle
   * @param options Optional query options
   * @returns Collection data
   */
  async getCollectionByHandle(handle: string, options: any = {}) {
    const variables = {
      handle,
      productsFirst: options.productsFirst || 20,
      productsAfter: options.productsAfter || null,
      productsSortKey: options.productsSortKey || null,
      productsReverse: options.productsReverse || null,
      metafieldsFirst: options.metafieldsFirst || 20,
      metafieldIdentifiers: options.metafieldIdentifiers || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_COLLECTION_BY_HANDLE, variables);
    return response.data?.collection;
  }

  /**
   * Get a collection by ID
   * @param id Collection ID
   * @param options Optional query options
   * @returns Collection data
   */
  async getCollectionById(id: string, options: any = {}) {
    const variables = {
      id,
      productsFirst: options.productsFirst || 20,
      productsAfter: options.productsAfter || null,
      productsSortKey: options.productsSortKey || null,
      productsReverse: options.productsReverse || null,
      metafieldsFirst: options.metafieldsFirst || 20,
      metafieldIdentifiers: options.metafieldIdentifiers || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_COLLECTION_BY_ID, variables);
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
      productsFirst: options.productsFirst || 5,
      metafieldsFirst: options.metafieldsFirst || 5,
      metafieldIdentifiers: options.metafieldIdentifiers || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_COLLECTIONS, variables);
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
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_COLLECTIONS_BASIC, variables);
    return response.data?.collections;
  }

  /**
   * Get products in a collection
   * @param handle Collection handle
   * @param options Query options
   * @returns Collection products connection
   */
  async getCollectionProducts(handle: string, options: any = {}) {
    const variables = {
      handle,
      first: options.first || 20,
      after: options.after || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_COLLECTION_PRODUCTS, variables);
    return response.data?.collection?.products;
  }
}
