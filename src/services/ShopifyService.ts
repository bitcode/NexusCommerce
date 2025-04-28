/**
 * ShopifyService.ts
 * Main service for all Shopify API operations
 */

import { ShopifyApiClient } from '../shopify-api-monitor/src/ShopifyApiClient';
import { StorefrontApiClient } from '../shopify-api-monitor/src/StorefrontApiClient';
import * as AdminAPI from './admin';
import * as StorefrontAPI from './storefront';

/**
 * Main service class for all Shopify API operations
 * Provides access to both Admin API and Storefront API services
 */
export class ShopifyService {
  // Admin API clients
  private adminApiClient: ShopifyApiClient;
  private productsAPI: AdminAPI.ProductsAPI;
  private collectionsAPI: AdminAPI.CollectionsAPI;
  private customersAPI: AdminAPI.CustomersAPI;
  private ordersAPI: AdminAPI.OrdersAPI;
  private inventoryAPI: AdminAPI.InventoryAPI;
  // Add other Admin API services as they are implemented

  // Storefront API clients
  private storefrontApiClient: StorefrontApiClient;
  private storefrontProductsAPI: StorefrontAPI.StorefrontProductsAPI;
  private storefrontCollectionsAPI: StorefrontAPI.StorefrontCollectionsAPI;
  // Add other Storefront API services as they are implemented

  /**
   * Constructor
   * @param adminApiOptions Options for the Admin API client
   * @param storefrontApiOptions Options for the Storefront API client
   */
  constructor(adminApiOptions: any = {}, storefrontApiOptions: any = {}) {
    // Initialize Admin API client
    this.adminApiClient = new ShopifyApiClient({
      useEnvConfig: true,
      ...adminApiOptions
    });

    // Initialize Admin API services
    this.productsAPI = new AdminAPI.ProductsAPI(this.adminApiClient);
    this.collectionsAPI = new AdminAPI.CollectionsAPI(this.adminApiClient);
    this.customersAPI = new AdminAPI.CustomersAPI(this.adminApiClient);
    this.ordersAPI = new AdminAPI.OrdersAPI(this.adminApiClient);
    this.inventoryAPI = new AdminAPI.InventoryAPI(this.adminApiClient);
    // Initialize other Admin API services as they are implemented

    // Initialize Storefront API client
    this.storefrontApiClient = new StorefrontApiClient({
      useEnvConfig: true,
      ...storefrontApiOptions
    });

    // Initialize Storefront API services
    this.storefrontProductsAPI = new StorefrontAPI.StorefrontProductsAPI(this.storefrontApiClient);
    this.storefrontCollectionsAPI = new StorefrontAPI.StorefrontCollectionsAPI(this.storefrontApiClient);
    // Initialize other Storefront API services as they are implemented
  }

  /**
   * Get the Admin API client
   * @returns ShopifyApiClient instance
   */
  getAdminApiClient(): ShopifyApiClient {
    return this.adminApiClient;
  }

  /**
   * Get the Storefront API client
   * @returns StorefrontApiClient instance
   */
  getStorefrontApiClient(): StorefrontApiClient {
    return this.storefrontApiClient;
  }

  /**
   * Get the Products API service
   * @returns ProductsAPI instance
   */
  get products(): AdminAPI.ProductsAPI {
    return this.productsAPI;
  }

  /**
   * Get the Collections API service
   * @returns CollectionsAPI instance
   */
  get collections(): AdminAPI.CollectionsAPI {
    return this.collectionsAPI;
  }

  /**
   * Get the Customers API service
   * @returns CustomersAPI instance
   */
  get customers(): AdminAPI.CustomersAPI {
    return this.customersAPI;
  }

  /**
   * Get the Orders API service
   * @returns OrdersAPI instance
   */
  get orders(): AdminAPI.OrdersAPI {
    return this.ordersAPI;
  }

  /**
   * Get the Inventory API service
   * @returns InventoryAPI instance
   */
  get inventory(): AdminAPI.InventoryAPI {
    return this.inventoryAPI;
  }

  /**
   * Get the Storefront Products API service
   * @returns StorefrontProductsAPI instance
   */
  get storefrontProducts(): StorefrontAPI.StorefrontProductsAPI {
    return this.storefrontProductsAPI;
  }

  /**
   * Get the Storefront Collections API service
   * @returns StorefrontCollectionsAPI instance
   */
  get storefrontCollections(): StorefrontAPI.StorefrontCollectionsAPI {
    return this.storefrontCollectionsAPI;
  }

  // Add getters for other API services as they are implemented
}
