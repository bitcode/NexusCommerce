/**
 * VariantsManager.ts
 * Component for managing Shopify product variants
 */

import { ShopifyApiClient } from '../../../ShopifyApiClient';
import { NotificationSystem, NotificationType, NotificationTopic } from '../../../NotificationSystem';
import { ProductVariant } from '../../../types/ShopifyResourceTypes';

/**
 * Class for managing Shopify product variants
 */
export class VariantsManager {
  /**
   * Creates a new VariantsManager
   * 
   * @param apiClient - ShopifyApiClient instance
   * @param notificationSystem - NotificationSystem instance
   */
  constructor(
    private apiClient: ShopifyApiClient,
    private notificationSystem: NotificationSystem
  ) {}
  
  /**
   * Creates a product variant
   * 
   * @param productId - Product ID
   * @param variantData - Variant data
   * @returns Promise resolving to the created variant
   */
  async createProductVariant(productId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant | null> {
    try {
      // For creating variants, we need to use a special mutation
      const mutation = `
        mutation ProductVariantCreate($productId: ID!, $input: ProductVariantInput!) {
          productVariantCreate(productId: $productId, input: $input) {
            productVariant {
              id
              title
              price
              compareAtPrice
              sku
              inventoryQuantity
              selectedOptions {
                name
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        productId,
        input: variantData
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.productVariantCreate?.userErrors?.length > 0) {
        const errors = response.data.productVariantCreate.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const variant = response.data?.productVariantCreate?.productVariant;
      
      if (variant) {
        this.notificationSystem.notify(
          `Variant "${variant.title}" created successfully`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return variant || null;
    } catch (error) {
      console.error(`Error creating variant for product ${productId}:`, error);
      this.notificationSystem.notify(
        `Failed to create variant: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Updates a product variant
   * 
   * @param id - Variant ID
   * @param variantData - Updated variant data
   * @returns Promise resolving to the updated variant
   */
  async updateProductVariant(id: string, variantData: Partial<ProductVariant>): Promise<ProductVariant | null> {
    try {
      // For updating variants, we need to use a special mutation
      const mutation = `
        mutation ProductVariantUpdate($id: ID!, $input: ProductVariantInput!) {
          productVariantUpdate(id: $id, input: $input) {
            productVariant {
              id
              title
              price
              compareAtPrice
              sku
              inventoryQuantity
              selectedOptions {
                name
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        id,
        input: variantData
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.productVariantUpdate?.userErrors?.length > 0) {
        const errors = response.data.productVariantUpdate.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const variant = response.data?.productVariantUpdate?.productVariant;
      
      if (variant) {
        this.notificationSystem.notify(
          `Variant "${variant.title}" updated successfully`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return variant || null;
    } catch (error) {
      console.error(`Error updating variant ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to update variant: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Deletes a product variant
   * 
   * @param id - Variant ID
   * @returns Promise resolving to success status
   */
  async deleteProductVariant(id: string): Promise<boolean> {
    try {
      // For deleting variants, we need to use a special mutation
      const mutation = `
        mutation ProductVariantDelete($id: ID!) {
          productVariantDelete(id: $id) {
            deletedProductVariantId
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        id
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.productVariantDelete?.userErrors?.length > 0) {
        const errors = response.data.productVariantDelete.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = !!response.data?.productVariantDelete?.deletedProductVariantId;
      
      if (success) {
        this.notificationSystem.notify(
          'Variant deleted successfully',
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error deleting variant ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to delete variant: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Updates inventory for a variant
   * 
   * @param inventoryItemId - Inventory item ID
   * @param locationId - Location ID
   * @param quantity - New quantity
   * @returns Promise resolving to success status
   */
  async updateInventoryLevel(
    inventoryItemId: string,
    locationId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const mutation = `
        mutation InventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
          inventoryAdjustQuantity(input: $input) {
            inventoryLevel {
              available
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        input: {
          inventoryItemId,
          locationId,
          availableDelta: quantity
        }
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
        const errors = response.data.inventoryAdjustQuantity.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = !!response.data?.inventoryAdjustQuantity?.inventoryLevel;
      
      if (success) {
        this.notificationSystem.notify(
          'Inventory updated successfully',
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error updating inventory for item ${inventoryItemId}:`, error);
      this.notificationSystem.notify(
        `Failed to update inventory: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Fetches inventory levels for a variant
   * 
   * @param inventoryItemId - Inventory item ID
   * @returns Promise resolving to inventory levels
   */
  async fetchInventoryLevels(inventoryItemId: string): Promise<any[]> {
    try {
      const query = `
        query GetInventoryLevels($inventoryItemId: ID!) {
          inventoryItem(id: $inventoryItemId) {
            id
            inventoryLevels(first: 50) {
              edges {
                node {
                  id
                  available
                  location {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      `;
      
      const variables = {
        inventoryItemId
      };
      
      const response = await this.apiClient.request<any>(query, variables);
      
      const inventoryLevels = response.data?.inventoryItem?.inventoryLevels?.edges?.map((edge: any) => edge.node) || [];
      
      return inventoryLevels;
    } catch (error) {
      console.error(`Error fetching inventory levels for item ${inventoryItemId}:`, error);
      this.notificationSystem.notify(
        `Failed to fetch inventory levels: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return [];
    }
  }
  
  /**
   * Fetches locations for inventory management
   * 
   * @returns Promise resolving to locations
   */
  async fetchLocations(): Promise<any[]> {
    try {
      const query = `
        query GetLocations {
          locations(first: 50) {
            edges {
              node {
                id
                name
                isActive
                address {
                  formatted
                }
              }
            }
          }
        }
      `;
      
      const response = await this.apiClient.request<any>(query);
      
      const locations = response.data?.locations?.edges?.map((edge: any) => edge.node) || [];
      
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      this.notificationSystem.notify(
        `Failed to fetch locations: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return [];
    }
  }
}