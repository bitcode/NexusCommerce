/**
 * StorefrontProductsAPI.ts
 * Service for Shopify Storefront API product operations
 */

import { StorefrontApiClient } from '../../shopify-api-monitor/src/StorefrontApiClient';
import {
  GET_STOREFRONT_PRODUCT_BY_HANDLE,
  GET_STOREFRONT_PRODUCT_BY_ID,
  GET_STOREFRONT_PRODUCTS,
  GET_STOREFRONT_PRODUCTS_BASIC,
  GET_STOREFRONT_PRODUCT_RECOMMENDATIONS,
  GET_STOREFRONT_PRODUCT_VARIANTS
} from '../../graphql/storefront/products';

/**
 * Service class for Shopify Storefront API product operations
 */
export class StorefrontProductsAPI {
  private apiClient: StorefrontApiClient;

  /**
   * Constructor
   * @param apiClient StorefrontApiClient instance
   */
  constructor(apiClient: StorefrontApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get a product by handle
   * @param handle Product handle
   * @param options Optional query options
   * @returns Product data
   */
  async getProductByHandle(handle: string, options: any = {}) {
    const variables = {
      handle,
      variantsFirst: options.variantsFirst || 50,
      mediaFirst: options.mediaFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20,
      metafieldIdentifiers: options.metafieldIdentifiers || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_PRODUCT_BY_HANDLE, variables);
    return response.data?.product;
  }

  /**
   * Get a product by ID
   * @param id Product ID
   * @param options Optional query options
   * @returns Product data
   */
  async getProductById(id: string, options: any = {}) {
    const variables = {
      id,
      variantsFirst: options.variantsFirst || 50,
      mediaFirst: options.mediaFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20,
      metafieldIdentifiers: options.metafieldIdentifiers || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_PRODUCT_BY_ID, variables);
    return response.data?.product;
  }

  /**
   * Get a list of products
   * @param options Query options
   * @returns Products connection
   */
  async getProducts(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      variantsFirst: options.variantsFirst || 10,
      mediaFirst: options.mediaFirst || 5,
      metafieldsFirst: options.metafieldsFirst || 5,
      metafieldIdentifiers: options.metafieldIdentifiers || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_PRODUCTS, variables);
    return response.data?.products;
  }

  /**
   * Get a list of products with basic information
   * @param options Query options
   * @returns Products connection with basic information
   */
  async getProductsBasic(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_PRODUCTS_BASIC, variables);
    return response.data?.products;
  }

  /**
   * Get product recommendations
   * @param productId Product ID
   * @param options Query options
   * @returns Product recommendations
   */
  async getProductRecommendations(productId: string, options: any = {}) {
    const variables = {
      productId,
      first: options.first || 10,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_PRODUCT_RECOMMENDATIONS, variables);
    return response.data?.productRecommendations;
  }

  /**
   * Get variants for a product
   * @param handle Product handle
   * @param options Query options
   * @returns Product variants connection
   */
  async getProductVariants(handle: string, options: any = {}) {
    const variables = {
      handle,
      first: options.first || 50,
      after: options.after || null,
      country: options.country || null,
      language: options.language || null
    };

    const response = await this.apiClient.request(GET_STOREFRONT_PRODUCT_VARIANTS, variables);
    return response.data?.product?.variants;
  }
}
