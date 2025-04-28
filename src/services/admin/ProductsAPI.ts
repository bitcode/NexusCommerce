/**
 * ProductsAPI.ts
 * Service for Shopify Admin API product operations
 */

import { ShopifyApiClient } from '../../shopify-api-monitor/src/ShopifyApiClient';
import {
  GET_PRODUCT,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS,
  GET_PRODUCTS_BASIC,
  GET_PRODUCT_VARIANTS,
  GET_PRODUCT_MEDIA,
  GET_PRODUCT_METAFIELDS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  DUPLICATE_PRODUCT,
  CHANGE_PRODUCT_STATUS,
  PUBLISH_PRODUCT,
  UNPUBLISH_PRODUCT,
  CREATE_PRODUCT_MEDIA,
  DELETE_PRODUCT_MEDIA,
  UPDATE_PRODUCT_MEDIA,
  REORDER_PRODUCT_MEDIA,
  BULK_CREATE_PRODUCT_VARIANTS,
  BULK_UPDATE_PRODUCT_VARIANTS,
  BULK_DELETE_PRODUCT_VARIANTS,
  REORDER_PRODUCT_VARIANTS
} from '../../graphql/admin/products';

/**
 * Service class for Shopify Admin API product operations
 */
export class ProductsAPI {
  private apiClient: ShopifyApiClient;

  /**
   * Constructor
   * @param apiClient ShopifyApiClient instance
   */
  constructor(apiClient: ShopifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get a product by ID
   * @param id Product ID
   * @param options Optional query options
   * @returns Product data
   */
  async getProduct(id: string, options: any = {}) {
    const variables = {
      id,
      variantsFirst: options.variantsFirst || 50,
      mediaFirst: options.mediaFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(GET_PRODUCT, variables);
    return response.data?.product;
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
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(GET_PRODUCT_BY_HANDLE, variables);
    return response.data?.productByHandle;
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
      metafieldsFirst: options.metafieldsFirst || 5
    };

    const response = await this.apiClient.request(GET_PRODUCTS, variables);
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
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_PRODUCTS_BASIC, variables);
    return response.data?.products;
  }

  /**
   * Get variants for a product
   * @param productId Product ID
   * @param options Query options
   * @returns Product variants connection
   */
  async getProductVariants(productId: string, options: any = {}) {
    const variables = {
      productId,
      first: options.first || 50,
      after: options.after || null
    };

    const response = await this.apiClient.request(GET_PRODUCT_VARIANTS, variables);
    return response.data?.product?.variants;
  }

  /**
   * Get media for a product
   * @param productId Product ID
   * @param options Query options
   * @returns Product media connection
   */
  async getProductMedia(productId: string, options: any = {}) {
    const variables = {
      productId,
      first: options.first || 20,
      after: options.after || null
    };

    const response = await this.apiClient.request(GET_PRODUCT_MEDIA, variables);
    return response.data?.product?.media;
  }

  /**
   * Get metafields for a product
   * @param productId Product ID
   * @param options Query options
   * @returns Product metafields connection
   */
  async getProductMetafields(productId: string, options: any = {}) {
    const variables = {
      productId,
      first: options.first || 20,
      after: options.after || null,
      namespace: options.namespace || null,
      key: options.key || null
    };

    const response = await this.apiClient.request(GET_PRODUCT_METAFIELDS, variables);
    return response.data?.product?.metafields;
  }

  /**
   * Create a new product
   * @param input Product input
   * @param options Optional query options
   * @returns Created product
   */
  async createProduct(input: any, options: any = {}) {
    const variables = {
      input,
      variantsFirst: options.variantsFirst || 50,
      mediaFirst: options.mediaFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(CREATE_PRODUCT, variables);
    
    if (response.data?.productCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create product: ${response.data.productCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productCreate?.product;
  }

  /**
   * Update an existing product
   * @param id Product ID
   * @param input Product input
   * @param options Optional query options
   * @returns Updated product
   */
  async updateProduct(id: string, input: any, options: any = {}) {
    const variables = {
      id,
      input,
      variantsFirst: options.variantsFirst || 50,
      mediaFirst: options.mediaFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(UPDATE_PRODUCT, variables);
    
    if (response.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update product: ${response.data.productUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productUpdate?.product;
  }

  /**
   * Delete a product
   * @param id Product ID
   * @returns Boolean indicating success
   */
  async deleteProduct(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(DELETE_PRODUCT, variables);
    
    if (response.data?.productDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete product: ${response.data.productDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productDelete?.deletedProductId === id;
  }

  /**
   * Duplicate a product
   * @param productId Product ID to duplicate
   * @param options Optional parameters
   * @returns Duplicated product
   */
  async duplicateProduct(productId: string, options: any = {}) {
    const variables = {
      productId,
      newTitle: options.newTitle || null,
      includeImages: options.includeImages !== false,
      variantsFirst: options.variantsFirst || 50,
      mediaFirst: options.mediaFirst || 20,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(DUPLICATE_PRODUCT, variables);
    
    if (response.data?.productDuplicate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to duplicate product: ${response.data.productDuplicate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productDuplicate?.newProduct;
  }

  /**
   * Change product status
   * @param id Product ID
   * @param status New product status (ACTIVE, ARCHIVED, DRAFT)
   * @returns Updated product
   */
  async changeProductStatus(id: string, status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT') {
    const variables = { id, status };

    const response = await this.apiClient.request(CHANGE_PRODUCT_STATUS, variables);
    
    if (response.data?.productChangeStatus?.userErrors?.length > 0) {
      throw new Error(
        `Failed to change product status: ${response.data.productChangeStatus.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productChangeStatus?.product;
  }

  /**
   * Publish a product
   * @param id Product ID
   * @returns Published product
   */
  async publishProduct(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(PUBLISH_PRODUCT, variables);
    
    if (response.data?.productPublish?.userErrors?.length > 0) {
      throw new Error(
        `Failed to publish product: ${response.data.productPublish.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productPublish?.product;
  }

  /**
   * Unpublish a product
   * @param id Product ID
   * @returns Unpublished product
   */
  async unpublishProduct(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(UNPUBLISH_PRODUCT, variables);
    
    if (response.data?.productUnpublish?.userErrors?.length > 0) {
      throw new Error(
        `Failed to unpublish product: ${response.data.productUnpublish.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productUnpublish?.product;
  }

  /**
   * Create product media
   * @param productId Product ID
   * @param media Media input
   * @returns Created media
   */
  async createProductMedia(productId: string, media: any[]) {
    const variables = { productId, media };

    const response = await this.apiClient.request(CREATE_PRODUCT_MEDIA, variables);
    
    if (response.data?.productCreateMedia?.mediaUserErrors?.length > 0) {
      throw new Error(
        `Failed to create product media: ${response.data.productCreateMedia.mediaUserErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productCreateMedia?.media;
  }

  /**
   * Delete product media
   * @param productId Product ID
   * @param mediaIds Media IDs to delete
   * @returns Deleted media IDs
   */
  async deleteProductMedia(productId: string, mediaIds: string[]) {
    const variables = { productId, mediaIds };

    const response = await this.apiClient.request(DELETE_PRODUCT_MEDIA, variables);
    
    if (response.data?.productDeleteMedia?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete product media: ${response.data.productDeleteMedia.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productDeleteMedia?.deletedMediaIds;
  }

  /**
   * Update product media
   * @param productId Product ID
   * @param mediaId Media ID
   * @param alt New alt text
   * @returns Updated media
   */
  async updateProductMedia(productId: string, mediaId: string, alt: string) {
    const variables = { productId, mediaId, alt };

    const response = await this.apiClient.request(UPDATE_PRODUCT_MEDIA, variables);
    
    if (response.data?.productUpdateMedia?.mediaUserErrors?.length > 0) {
      throw new Error(
        `Failed to update product media: ${response.data.productUpdateMedia.mediaUserErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productUpdateMedia?.media;
  }

  /**
   * Reorder product media
   * @param productId Product ID
   * @param moves Media moves
   * @returns Boolean indicating success
   */
  async reorderProductMedia(productId: string, moves: any[]) {
    const variables = { productId, moves };

    const response = await this.apiClient.request(REORDER_PRODUCT_MEDIA, variables);
    
    if (response.data?.productReorderMedia?.mediaUserErrors?.length > 0) {
      throw new Error(
        `Failed to reorder product media: ${response.data.productReorderMedia.mediaUserErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return true;
  }

  /**
   * Create product variants in bulk
   * @param productId Product ID
   * @param variants Variant inputs
   * @returns Created variants
   */
  async bulkCreateProductVariants(productId: string, variants: any[]) {
    const variables = { productId, variants };

    const response = await this.apiClient.request(BULK_CREATE_PRODUCT_VARIANTS, variables);
    
    if (response.data?.productVariantsBulkCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create product variants: ${response.data.productVariantsBulkCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productVariantsBulkCreate?.productVariants;
  }

  /**
   * Update product variants in bulk
   * @param productId Product ID
   * @param variants Variant update inputs
   * @returns Updated variants
   */
  async bulkUpdateProductVariants(productId: string, variants: any[]) {
    const variables = { productId, variants };

    const response = await this.apiClient.request(BULK_UPDATE_PRODUCT_VARIANTS, variables);
    
    if (response.data?.productVariantsBulkUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update product variants: ${response.data.productVariantsBulkUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productVariantsBulkUpdate?.productVariants;
  }

  /**
   * Delete product variants in bulk
   * @param productId Product ID
   * @param variantIds Variant IDs to delete
   * @returns Boolean indicating success
   */
  async bulkDeleteProductVariants(productId: string, variantIds: string[]) {
    const variables = { productId, variantIds };

    const response = await this.apiClient.request(BULK_DELETE_PRODUCT_VARIANTS, variables);
    
    if (response.data?.productVariantsBulkDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete product variants: ${response.data.productVariantsBulkDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return true;
  }

  /**
   * Reorder product variants
   * @param productId Product ID
   * @param moves Variant position moves
   * @returns Updated variant positions
   */
  async reorderProductVariants(productId: string, moves: any[]) {
    const variables = { productId, moves };

    const response = await this.apiClient.request(REORDER_PRODUCT_VARIANTS, variables);
    
    if (response.data?.productVariantsBulkReorder?.userErrors?.length > 0) {
      throw new Error(
        `Failed to reorder product variants: ${response.data.productVariantsBulkReorder.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.productVariantsBulkReorder?.productVariants;
  }
}
