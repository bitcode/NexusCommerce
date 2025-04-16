/**
 * ProductsManager.ts
 * Component for managing Shopify products
 */

import { ShopifyApiClient } from '../../../ShopifyApiClient';
import { StateManager } from '../../../StateManager';
import { DataOperations } from '../../../DataOperations';
import { NotificationSystem, NotificationType, NotificationTopic } from '../../../NotificationSystem';
import { MutationManager } from '../../../MutationManager';
import { ShopifyResourceType, Product, ProductVariant, ReadOptions } from '../../../types/ShopifyResourceTypes';

/**
 * Props for the ProductsManager component
 */
export interface ProductsManagerProps {
  /** Callback when a product is selected */
  onProductSelect?: (productId: string) => void;
  
  /** Callback when a product is created */
  onProductCreate?: (product: Product) => void;
  
  /** Callback when a product is updated */
  onProductUpdate?: (product: Product) => void;
  
  /** Callback when a product is deleted */
  onProductDelete?: (productId: string) => void;
  
  /** Callback when a notification is triggered */
  onNotification?: (message: string, type: NotificationType) => void;
}

/**
 * Product list filters
 */
export interface ProductFilters {
  /** Search query */
  query?: string;
  
  /** Product status */
  status?: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'ALL';
  
  /** Product vendor */
  vendor?: string;
  
  /** Product type */
  productType?: string;
  
  /** Created after date */
  createdAfter?: string;
  
  /** Updated after date */
  updatedAfter?: string;
  
  /** Sort field */
  sortField?: 'title' | 'createdAt' | 'updatedAt' | 'vendor' | 'productType';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Class for managing Shopify products
 */
export class ProductsManager {
  private dataOperations: DataOperations;
  private notificationSystem: NotificationSystem;
  
  /**
   * Creates a new ProductsManager
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
   * Fetches products with optional filtering
   * 
   * @param filters - Product filters
   * @param pageSize - Number of products per page
   * @param cursor - Pagination cursor
   * @returns Promise resolving to products and pagination info
   */
  async fetchProducts(
    filters: ProductFilters = {},
    pageSize: number = 20,
    cursor?: string
  ): Promise<{ products: Product[], hasNextPage: boolean, endCursor?: string }> {
    try {
      // Build GraphQL query filter
      let queryFilter = '';
      const filterParts: string[] = [];
      
      if (filters.query) {
        filterParts.push(`title:*${filters.query}*`);
      }
      
      if (filters.status && filters.status !== 'ALL') {
        filterParts.push(`status:${filters.status}`);
      }
      
      if (filters.vendor) {
        filterParts.push(`vendor:${filters.vendor}`);
      }
      
      if (filters.productType) {
        filterParts.push(`product_type:${filters.productType}`);
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
          case 'vendor': sortKey = 'VENDOR'; break;
          case 'productType': sortKey = 'PRODUCT_TYPE'; break;
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
      
      // Fetch products
      const result = await this.dataOperations.read<Product[]>(ShopifyResourceType.PRODUCT, options);
      
      return {
        products: result.data || [],
        hasNextPage: result.pageInfo?.hasNextPage || false,
        endCursor: result.pageInfo?.endCursor
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      this.notificationSystem.notify(
        `Failed to fetch products: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return { products: [], hasNextPage: false };
    }
  }
  
  /**
   * Fetches a single product by ID
   * 
   * @param id - Product ID
   * @returns Promise resolving to the product
   */
  async fetchProduct(id: string): Promise<Product | null> {
    try {
      const result = await this.dataOperations.read<Product>(ShopifyResourceType.PRODUCT, { id });
      return result.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to fetch product: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Creates a new product
   * 
   * @param productData - Product data
   * @returns Promise resolving to the created product
   */
  async createProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const result = await this.dataOperations.create<Product>(
        ShopifyResourceType.PRODUCT,
        productData,
        {
          onSuccess: (data) => {
            this.notificationSystem.notify(
              `Product "${data.title}" created successfully`,
              NotificationType.SUCCESS,
              NotificationTopic.SYSTEM
            );
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      this.notificationSystem.notify(
        `Failed to create product: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Updates an existing product
   * 
   * @param id - Product ID
   * @param productData - Updated product data
   * @returns Promise resolving to the updated product
   */
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      const result = await this.dataOperations.update<Product>(
        ShopifyResourceType.PRODUCT,
        id,
        productData,
        {
          onSuccess: (data) => {
            this.notificationSystem.notify(
              `Product "${data.title}" updated successfully`,
              NotificationType.SUCCESS,
              NotificationTopic.SYSTEM
            );
          }
        }
      );
      return result;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to update product: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Deletes a product
   * 
   * @param id - Product ID
   * @returns Promise resolving to success status
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const success = await this.dataOperations.delete(
        ShopifyResourceType.PRODUCT,
        id,
        {
          onSuccess: () => {
            this.notificationSystem.notify(
              'Product deleted successfully',
              NotificationType.SUCCESS,
              NotificationTopic.SYSTEM
            );
          }
        }
      );
      return success;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      this.notificationSystem.notify(
        `Failed to delete product: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
}
