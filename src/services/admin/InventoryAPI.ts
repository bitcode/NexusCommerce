/**
 * InventoryAPI.ts
 * Service for Shopify Admin API inventory operations
 */

import { ShopifyApiClient } from '../../utils/ShopifyApiClient';

// GraphQL mutations for inventory management
const INVENTORY_ACTIVATE = `
  mutation InventoryActivate($inventoryItemId: ID!, $locationId: ID!) {
    inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
      inventoryLevel {
        id
        available
        item {
          id
          tracked
        }
        location {
          id
          name
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const INVENTORY_DEACTIVATE = `
  mutation InventoryDeactivate($inventoryItemId: ID!, $locationId: ID!) {
    inventoryDeactivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
      userErrors {
        field
        message
      }
    }
  }
`;

const INVENTORY_ADJUST_QUANTITY = `
  mutation InventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
    inventoryAdjustQuantity(input: $input) {
      inventoryLevel {
        id
        available
        item {
          id
          tracked
        }
        location {
          id
          name
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const INVENTORY_ITEM_UPDATE = `
  mutation InventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
    inventoryItemUpdate(id: $id, input: $input) {
      inventoryItem {
        id
        tracked
        sku
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const INVENTORY_BULK_ADJUST_QUANTITY_AT_LOCATION = `
  mutation InventoryBulkAdjustQuantityAtLocation($inventoryItemAdjustments: [InventoryAdjustItemInput!]!, $locationId: ID!) {
    inventoryBulkAdjustQuantityAtLocation(
      inventoryItemAdjustments: $inventoryItemAdjustments,
      locationId: $locationId
    ) {
      inventoryLevels {
        id
        available
        item {
          id
          tracked
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// GraphQL queries for inventory management
const GET_INVENTORY_ITEM = `
  query GetInventoryItem($id: ID!) {
    inventoryItem(id: $id) {
      id
      tracked
      sku
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
  }
`;

const GET_INVENTORY_ITEMS = `
  query GetInventoryItems($first: Int!, $after: String, $query: String, $sortKey: InventoryItemSortKeys, $reverse: Boolean) {
    inventoryItems(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          id
          tracked
          sku
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

const GET_LOCATIONS = `
  query GetLocations($first: Int!) {
    locations(first: $first) {
      edges {
        node {
          id
          name
          address {
            formatted
          }
          isActive
        }
      }
    }
  }
`;

/**
 * InventoryAPI class
 * Provides methods for interacting with Shopify's inventory API
 */
export class InventoryAPI {
  constructor(private apiClient: ShopifyApiClient) {}

  /**
   * Get a single inventory item by ID
   * @param id Inventory item ID
   * @returns Inventory item data
   */
  async getInventoryItem(id: string) {
    const variables = { id };
    const response = await this.apiClient.request(GET_INVENTORY_ITEM, variables);
    return response.data?.inventoryItem;
  }

  /**
   * Get a list of inventory items
   * @param options Query options
   * @returns Inventory items connection
   */
  async getInventoryItems(options: any = {}) {
    const variables = {
      first: options.first || 20,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_INVENTORY_ITEMS, variables);
    return response.data?.inventoryItems;
  }

  /**
   * Get a list of locations
   * @param first Number of locations to fetch
   * @returns Locations connection
   */
  async getLocations(first: number = 20) {
    const variables = { first };
    const response = await this.apiClient.request(GET_LOCATIONS, variables);
    return response.data?.locations;
  }

  /**
   * Activate inventory tracking for an item at a location
   * @param inventoryItemId Inventory item ID
   * @param locationId Location ID
   * @returns Inventory level data
   */
  async activateInventory(inventoryItemId: string, locationId: string) {
    const variables = { inventoryItemId, locationId };
    const response = await this.apiClient.request(INVENTORY_ACTIVATE, variables);

    if (response.data?.inventoryActivate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to activate inventory: ${response.data.inventoryActivate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.inventoryActivate?.inventoryLevel;
  }

  /**
   * Deactivate inventory tracking for an item at a location
   * @param inventoryItemId Inventory item ID
   * @param locationId Location ID
   * @returns Success status
   */
  async deactivateInventory(inventoryItemId: string, locationId: string) {
    const variables = { inventoryItemId, locationId };
    const response = await this.apiClient.request(INVENTORY_DEACTIVATE, variables);

    if (response.data?.inventoryDeactivate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to deactivate inventory: ${response.data.inventoryDeactivate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return true;
  }

  /**
   * Adjust inventory quantity
   * @param inventoryLevelId Inventory level ID
   * @param availableDelta Change in available quantity
   * @returns Updated inventory level
   */
  async adjustInventoryQuantity(inventoryLevelId: string, availableDelta: number) {
    const variables = {
      input: {
        inventoryLevelId,
        availableDelta
      }
    };

    const response = await this.apiClient.request(INVENTORY_ADJUST_QUANTITY, variables);

    if (response.data?.inventoryAdjustQuantity?.userErrors?.length > 0) {
      throw new Error(
        `Failed to adjust inventory quantity: ${response.data.inventoryAdjustQuantity.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.inventoryAdjustQuantity?.inventoryLevel;
  }

  /**
   * Update inventory item
   * @param id Inventory item ID
   * @param input Inventory item input
   * @returns Updated inventory item
   */
  async updateInventoryItem(id: string, input: any) {
    const variables = { id, input };
    const response = await this.apiClient.request(INVENTORY_ITEM_UPDATE, variables);

    if (response.data?.inventoryItemUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update inventory item: ${response.data.inventoryItemUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.inventoryItemUpdate?.inventoryItem;
  }

  /**
   * Bulk adjust inventory quantities at a location
   * @param inventoryItemAdjustments Array of inventory item adjustments
   * @param locationId Location ID
   * @returns Updated inventory levels
   */
  async bulkAdjustQuantityAtLocation(inventoryItemAdjustments: any[], locationId: string) {
    const variables = { inventoryItemAdjustments, locationId };
    const response = await this.apiClient.request(INVENTORY_BULK_ADJUST_QUANTITY_AT_LOCATION, variables);

    if (response.data?.inventoryBulkAdjustQuantityAtLocation?.userErrors?.length > 0) {
      throw new Error(
        `Failed to bulk adjust inventory quantities: ${response.data.inventoryBulkAdjustQuantityAtLocation.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.inventoryBulkAdjustQuantityAtLocation?.inventoryLevels;
  }

  /**
   * Set inventory tracking for an item
   * @param inventoryItemId Inventory item ID
   * @param tracked Whether the item should be tracked
   * @returns Updated inventory item
   */
  async setInventoryTracking(inventoryItemId: string, tracked: boolean) {
    return this.updateInventoryItem(inventoryItemId, { tracked });
  }
}

export default InventoryAPI;
