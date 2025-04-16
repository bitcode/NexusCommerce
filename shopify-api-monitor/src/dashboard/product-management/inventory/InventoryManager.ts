/**
 * InventoryManager.ts
 * Component for managing Shopify inventory
 */

import { ShopifyApiClient } from '../../../ShopifyApiClient';
import { StateManager } from '../../../StateManager';
import { DataOperations } from '../../../DataOperations';
import { NotificationSystem, NotificationType, NotificationTopic } from '../../../NotificationSystem';
import { MutationManager } from '../../../MutationManager';
import { ShopifyResourceType, ReadOptions } from '../../../types/ShopifyResourceTypes';

/**
 * Props for the InventoryManager component
 */
export interface InventoryManagerProps {
  /** Callback when a notification is triggered */
  onNotification?: (message: string, type: NotificationType) => void;
}

/**
 * Inventory item with location data
 */
export interface InventoryItemWithLocations {
  id: string;
  sku: string;
  tracked: boolean;
  variant: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
    };
  };
  locations: {
    id: string;
    name: string;
    available: number;
    locationId: string;
    inventoryLevelId: string;
  }[];
}

/**
 * Inventory location
 */
export interface Location {
  id: string;
  name: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  isActive: boolean;
}

/**
 * Inventory transfer
 */
export interface InventoryTransfer {
  id: string;
  number?: string;
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'OPEN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  trackingInfo?: {
    company?: string;
    number?: string;
    url?: string;
  };
  expectedDeliveryDate?: string;
  shipmentStatus?: string;
  locationId: string;
  location?: {
    id: string;
    name: string;
  };
  destinationLocationId: string;
  destinationLocation?: {
    id: string;
    name: string;
  };
  items: {
    inventoryItemId: string;
    quantity: number;
    sku?: string;
    title?: string;
  }[];
}

/**
 * Inventory filters
 */
export interface InventoryFilters {
  /** Search query (SKU, product title) */
  query?: string;
  
  /** Location ID */
  locationId?: string;
  
  /** Inventory status */
  status?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  
  /** Sort field */
  sortField?: 'title' | 'sku' | 'quantity';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Class for managing Shopify inventory
 */
export class InventoryManager {
  private dataOperations: DataOperations;
  private notificationSystem: NotificationSystem;
  
  /**
   * Creates a new InventoryManager
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
   * Fetches inventory items with location data
   * 
   * @param filters - Inventory filters
   * @param pageSize - Number of items per page
   * @param cursor - Pagination cursor
   * @returns Promise resolving to inventory items and pagination info
   */
  async fetchInventoryItems(
    filters: InventoryFilters = {},
    pageSize: number = 20,
    cursor?: string
  ): Promise<{ items: InventoryItemWithLocations[], hasNextPage: boolean, endCursor?: string }> {
    try {
      // Build GraphQL query filter
      let queryFilter = '';
      const filterParts: string[] = [];
      
      if (filters.query) {
        // Search by SKU or product title
        filterParts.push(`(sku:*${filters.query}* OR variant_title:*${filters.query}* OR product_title:*${filters.query}*)`);
      }
      
      if (filterParts.length > 0) {
        queryFilter = filterParts.join(' AND ');
      }
      
      // Build sort parameter
      let sortKey = 'PRODUCT_TITLE';
      if (filters.sortField) {
        switch (filters.sortField) {
          case 'title': sortKey = 'PRODUCT_TITLE'; break;
          case 'sku': sortKey = 'SKU'; break;
          // Note: quantity sorting is handled client-side as it's across locations
        }
      }
      
      // Fetch inventory items
      const query = `
        query GetInventoryItems($first: Int!, $after: String, $query: String, $sortKey: InventoryItemSortKeys, $reverse: Boolean) {
          inventoryItems(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                id
                sku
                tracked
                variant {
                  id
                  title
                  product {
                    id
                    title
                  }
                }
                inventoryLevels(first: 20) {
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
              cursor
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;
      
      const variables = {
        first: pageSize,
        after: cursor,
        query: queryFilter || undefined,
        sortKey,
        reverse: filters.sortDirection === 'desc'
      };
      
      const response = await this.apiClient.request<any>(query, variables);
      
      // Process the response
      const edges = response.data?.inventoryItems?.edges || [];
      const pageInfo = response.data?.inventoryItems?.pageInfo || { hasNextPage: false };
      
      // Transform the data
      const items: InventoryItemWithLocations[] = edges.map((edge: any) => {
        const node = edge.node;
        const locations = (node.inventoryLevels?.edges || []).map((levelEdge: any) => {
          const levelNode = levelEdge.node;
          return {
            id: levelNode.id,
            inventoryLevelId: levelNode.id,
            locationId: levelNode.location.id,
            name: levelNode.location.name,
            available: levelNode.available
          };
        });
        
        return {
          id: node.id,
          sku: node.sku || '',
          tracked: node.tracked,
          variant: node.variant,
          locations
        };
      });
      
      // Filter by location if specified
      let filteredItems = items;
      if (filters.locationId) {
        filteredItems = items.filter(item => 
          item.locations.some(loc => loc.locationId === filters.locationId)
        );
      }
      
      // Filter by inventory status if specified
      if (filters.status && filters.status !== 'ALL') {
        filteredItems = filteredItems.filter(item => {
          const totalQuantity = item.locations.reduce((sum, loc) => sum + loc.available, 0);
          
          switch (filters.status) {
            case 'IN_STOCK':
              return totalQuantity > 0;
            case 'OUT_OF_STOCK':
              return totalQuantity === 0;
            case 'LOW_STOCK':
              return totalQuantity > 0 && totalQuantity <= 5; // Arbitrary threshold
            default:
              return true;
          }
        });
      }
      
      // Sort by quantity if specified
      if (filters.sortField === 'quantity') {
        filteredItems.sort((a, b) => {
          const aTotal = a.locations.reduce((sum, loc) => sum + loc.available, 0);
          const bTotal = b.locations.reduce((sum, loc) => sum + loc.available, 0);
          
          return filters.sortDirection === 'desc' ? bTotal - aTotal : aTotal - bTotal;
        });
      }
      
      return {
        items: filteredItems,
        hasNextPage: pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor
      };
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      this.notificationSystem.notify(
        `Failed to fetch inventory items: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return { items: [], hasNextPage: false };
    }
  }
  
  /**
   * Fetches locations
   * 
   * @returns Promise resolving to locations
   */
  async fetchLocations(): Promise<Location[]> {
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
                  address1
                  address2
                  city
                  province
                  zip
                  country
                }
              }
            }
          }
        }
      `;
      
      const response = await this.apiClient.request<any>(query);
      
      const locations = (response.data?.locations?.edges || []).map((edge: any) => edge.node);
      
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
  
  /**
   * Updates inventory quantity
   * 
   * @param inventoryLevelId - Inventory level ID
   * @param availableDelta - Change in available quantity
   * @returns Promise resolving to success status
   */
  async updateInventoryQuantity(inventoryLevelId: string, availableDelta: number): Promise<boolean> {
    try {
      const mutation = `
        mutation InventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
          inventoryAdjustQuantity(input: $input) {
            inventoryLevel {
              id
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
          inventoryLevelId,
          availableDelta
        }
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
        const errors = response.data.inventoryAdjustQuantity.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = !!response.data?.inventoryAdjustQuantity?.inventoryLevel;
      
      if (success) {
        const newQuantity = response.data.inventoryAdjustQuantity.inventoryLevel.available;
        this.notificationSystem.notify(
          `Inventory quantity updated to ${newQuantity}`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error updating inventory quantity for level ${inventoryLevelId}:`, error);
      this.notificationSystem.notify(
        `Failed to update inventory quantity: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Activates inventory tracking at a location
   * 
   * @param inventoryItemId - Inventory item ID
   * @param locationId - Location ID
   * @returns Promise resolving to success status
   */
  async activateInventoryTracking(inventoryItemId: string, locationId: string): Promise<boolean> {
    try {
      const mutation = `
        mutation InventoryActivate($inventoryItemId: ID!, $locationId: ID!) {
          inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
            inventoryLevel {
              id
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
        inventoryItemId,
        locationId
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.inventoryActivate?.userErrors?.length > 0) {
        const errors = response.data.inventoryActivate.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = !!response.data?.inventoryActivate?.inventoryLevel;
      
      if (success) {
        this.notificationSystem.notify(
          `Inventory tracking activated at location`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error activating inventory tracking for item ${inventoryItemId} at location ${locationId}:`, error);
      this.notificationSystem.notify(
        `Failed to activate inventory tracking: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Deactivates inventory tracking at a location
   * 
   * @param inventoryItemId - Inventory item ID
   * @param locationId - Location ID
   * @returns Promise resolving to success status
   */
  async deactivateInventoryTracking(inventoryItemId: string, locationId: string): Promise<boolean> {
    try {
      const mutation = `
        mutation InventoryDeactivate($inventoryItemId: ID!, $locationId: ID!) {
          inventoryDeactivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const variables = {
        inventoryItemId,
        locationId
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.inventoryDeactivate?.userErrors?.length > 0) {
        const errors = response.data.inventoryDeactivate.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const success = response.data?.inventoryDeactivate !== undefined;
      
      if (success) {
        this.notificationSystem.notify(
          `Inventory tracking deactivated at location`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
      }
      
      return success;
    } catch (error) {
      console.error(`Error deactivating inventory tracking for item ${inventoryItemId} at location ${locationId}:`, error);
      this.notificationSystem.notify(
        `Failed to deactivate inventory tracking: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return false;
    }
  }
  
  /**
   * Creates an inventory transfer
   * 
   * @param transfer - Transfer data
   * @returns Promise resolving to the created transfer
   */
  async createInventoryTransfer(transfer: Partial<InventoryTransfer>): Promise<InventoryTransfer | null> {
    try {
      const mutation = `
        mutation InventoryTransferCreate($input: InventoryTransferInput!) {
          inventoryTransferCreate(input: $input) {
            inventoryTransfer {
              id
              number
              createdAt
              updatedAt
              status
              trackingInfo {
                company
                number
                url
              }
              expectedDeliveryDate
              shipmentStatus
              location {
                id
                name
              }
              destinationLocation {
                id
                name
              }
              inventoryTransferItems {
                edges {
                  node {
                    inventoryItem {
                      id
                      sku
                    }
                    quantity
                  }
                }
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
        input: {
          locationId: transfer.locationId,
          destinationLocationId: transfer.destinationLocationId,
          trackingInfo: transfer.trackingInfo,
          expectedDeliveryDate: transfer.expectedDeliveryDate,
          inventoryTransferItems: transfer.items?.map(item => ({
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity
          })) || []
        }
      };
      
      const response = await this.apiClient.request<any>(mutation, variables);
      
      if (response.data?.inventoryTransferCreate?.userErrors?.length > 0) {
        const errors = response.data.inventoryTransferCreate.userErrors;
        throw new Error(`Validation errors: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
      }
      
      const createdTransfer = response.data?.inventoryTransferCreate?.inventoryTransfer;
      
      if (createdTransfer) {
        // Transform the response to match our interface
        const transformedTransfer: InventoryTransfer = {
          id: createdTransfer.id,
          number: createdTransfer.number,
          createdAt: createdTransfer.createdAt,
          updatedAt: createdTransfer.updatedAt,
          status: createdTransfer.status,
          trackingInfo: createdTransfer.trackingInfo,
          expectedDeliveryDate: createdTransfer.expectedDeliveryDate,
          shipmentStatus: createdTransfer.shipmentStatus,
          locationId: createdTransfer.location.id,
          location: createdTransfer.location,
          destinationLocationId: createdTransfer.destinationLocation.id,
          destinationLocation: createdTransfer.destinationLocation,
          items: (createdTransfer.inventoryTransferItems?.edges || []).map((edge: any) => {
            const node = edge.node;
            return {
              inventoryItemId: node.inventoryItem.id,
              quantity: node.quantity,
              sku: node.inventoryItem.sku
            };
          })
        };
        
        this.notificationSystem.notify(
          `Inventory transfer created successfully`,
          NotificationType.SUCCESS,
          NotificationTopic.SYSTEM
        );
        
        return transformedTransfer;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating inventory transfer:', error);
      this.notificationSystem.notify(
        `Failed to create inventory transfer: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return null;
    }
  }
  
  /**
   * Fetches inventory transfers
   * 
   * @param pageSize - Number of transfers per page
   * @param cursor - Pagination cursor
   * @returns Promise resolving to transfers and pagination info
   */
  async fetchInventoryTransfers(
    pageSize: number = 20,
    cursor?: string
  ): Promise<{ transfers: InventoryTransfer[], hasNextPage: boolean, endCursor?: string }> {
    try {
      const query = `
        query GetInventoryTransfers($first: Int!, $after: String) {
          inventoryTransfers(first: $first, after: $after) {
            edges {
              node {
                id
                number
                createdAt
                updatedAt
                status
                trackingInfo {
                  company
                  number
                  url
                }
                expectedDeliveryDate
                shipmentStatus
                location {
                  id
                  name
                }
                destinationLocation {
                  id
                  name
                }
                inventoryTransferItems {
                  edges {
                    node {
                      inventoryItem {
                        id
                        sku
                        variant {
                          title
                        }
                      }
                      quantity
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
      `;
      
      const variables = {
        first: pageSize,
        after: cursor
      };
      
      const response = await this.apiClient.request<any>(query, variables);
      
      const edges = response.data?.inventoryTransfers?.edges || [];
      const pageInfo = response.data?.inventoryTransfers?.pageInfo || { hasNextPage: false };
      
      // Transform the data
      const transfers: InventoryTransfer[] = edges.map((edge: any) => {
        const node = edge.node;
        return {
          id: node.id,
          number: node.number,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
          status: node.status,
          trackingInfo: node.trackingInfo,
          expectedDeliveryDate: node.expectedDeliveryDate,
          shipmentStatus: node.shipmentStatus,
          locationId: node.location.id,
          location: node.location,
          destinationLocationId: node.destinationLocation.id,
          destinationLocation: node.destinationLocation,
          items: (node.inventoryTransferItems?.edges || []).map((itemEdge: any) => {
            const itemNode = itemEdge.node;
            return {
              inventoryItemId: itemNode.inventoryItem.id,
              quantity: itemNode.quantity,
              sku: itemNode.inventoryItem.sku,
              title: itemNode.inventoryItem.variant?.title
            };
          })
        };
      });
      
      return {
        transfers,
        hasNextPage: pageInfo.hasNextPage,
        endCursor: pageInfo.endCursor
      };
    } catch (error) {
      console.error('Error fetching inventory transfers:', error);
      this.notificationSystem.notify(
        `Failed to fetch inventory transfers: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.API_ERROR
      );
      return { transfers: [], hasNextPage: false };
    }
  }
}