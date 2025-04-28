/**
 * CustomersAPI.ts
 * Service for Shopify Admin API customer operations
 */

import { ShopifyApiClient } from '../../shopify-api-monitor/src/ShopifyApiClient';
import {
  GET_CUSTOMER,
  GET_CUSTOMERS,
  GET_CUSTOMERS_BASIC,
  GET_CUSTOMER_ORDERS,
  GET_CUSTOMER_ADDRESSES,
  GET_CUSTOMER_METAFIELDS,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  CREATE_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_ADDRESS,
  DELETE_CUSTOMER_ADDRESS,
  SET_DEFAULT_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_TAX_EXEMPTIONS,
  CREATE_CUSTOMER_METAFIELD,
  DELETE_CUSTOMER_METAFIELD
} from '../../graphql/admin/customers';

/**
 * Service class for Shopify Admin API customer operations
 */
export class CustomersAPI {
  private apiClient: ShopifyApiClient;

  /**
   * Constructor
   * @param apiClient ShopifyApiClient instance
   */
  constructor(apiClient: ShopifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get a customer by ID
   * @param id Customer ID
   * @param options Optional query options
   * @returns Customer data
   */
  async getCustomer(id: string, options: any = {}) {
    const variables = {
      id,
      addressesFirst: options.addressesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20,
      ordersFirst: options.ordersFirst || 10
    };

    const response = await this.apiClient.request(GET_CUSTOMER, variables);
    return response.data?.customer;
  }

  /**
   * Get a list of customers
   * @param options Query options
   * @returns Customers connection
   */
  async getCustomers(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      addressesFirst: options.addressesFirst || 1,
      metafieldsFirst: options.metafieldsFirst || 0,
      ordersFirst: options.ordersFirst || 0
    };

    const response = await this.apiClient.request(GET_CUSTOMERS, variables);
    return response.data?.customers;
  }

  /**
   * Get a list of customers with basic information
   * @param options Query options
   * @returns Customers connection with basic information
   */
  async getCustomersBasic(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_CUSTOMERS_BASIC, variables);
    return response.data?.customers;
  }

  /**
   * Get orders for a customer
   * @param customerId Customer ID
   * @param options Query options
   * @returns Customer orders connection
   */
  async getCustomerOrders(customerId: string, options: any = {}) {
    const variables = {
      customerId,
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_CUSTOMER_ORDERS, variables);
    return response.data?.customer?.orders;
  }

  /**
   * Get addresses for a customer
   * @param customerId Customer ID
   * @param options Query options
   * @returns Customer addresses connection
   */
  async getCustomerAddresses(customerId: string, options: any = {}) {
    const variables = {
      customerId,
      first: options.first || 10,
      after: options.after || null
    };

    const response = await this.apiClient.request(GET_CUSTOMER_ADDRESSES, variables);
    return response.data?.customer?.addresses;
  }

  /**
   * Get metafields for a customer
   * @param customerId Customer ID
   * @param options Query options
   * @returns Customer metafields connection
   */
  async getCustomerMetafields(customerId: string, options: any = {}) {
    const variables = {
      customerId,
      first: options.first || 20,
      after: options.after || null,
      namespace: options.namespace || null,
      key: options.key || null
    };

    const response = await this.apiClient.request(GET_CUSTOMER_METAFIELDS, variables);
    return response.data?.customer?.metafields;
  }

  /**
   * Create a new customer
   * @param input Customer input
   * @param options Optional query options
   * @returns Created customer
   */
  async createCustomer(input: any, options: any = {}) {
    const variables = {
      input,
      addressesFirst: options.addressesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20,
      ordersFirst: options.ordersFirst || 10
    };

    const response = await this.apiClient.request(CREATE_CUSTOMER, variables);
    
    if (response.data?.customerCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create customer: ${response.data.customerCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerCreate?.customer;
  }

  /**
   * Update an existing customer
   * @param id Customer ID
   * @param input Customer input
   * @param options Optional query options
   * @returns Updated customer
   */
  async updateCustomer(id: string, input: any, options: any = {}) {
    const variables = {
      id,
      input,
      addressesFirst: options.addressesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20,
      ordersFirst: options.ordersFirst || 10
    };

    const response = await this.apiClient.request(UPDATE_CUSTOMER, variables);
    
    if (response.data?.customerUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update customer: ${response.data.customerUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerUpdate?.customer;
  }

  /**
   * Delete a customer
   * @param id Customer ID
   * @returns Boolean indicating success
   */
  async deleteCustomer(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(DELETE_CUSTOMER, variables);
    
    if (response.data?.customerDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete customer: ${response.data.customerDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerDelete?.deletedCustomerId === id;
  }

  /**
   * Create a customer address
   * @param customerId Customer ID
   * @param address Address input
   * @returns Created address
   */
  async createCustomerAddress(customerId: string, address: any) {
    const variables = { customerId, address };

    const response = await this.apiClient.request(CREATE_CUSTOMER_ADDRESS, variables);
    
    if (response.data?.customerAddressCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create customer address: ${response.data.customerAddressCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerAddressCreate?.customerAddress;
  }

  /**
   * Update a customer address
   * @param id Address ID
   * @param address Address input
   * @returns Updated address
   */
  async updateCustomerAddress(id: string, address: any) {
    const variables = { id, address };

    const response = await this.apiClient.request(UPDATE_CUSTOMER_ADDRESS, variables);
    
    if (response.data?.customerAddressUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update customer address: ${response.data.customerAddressUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerAddressUpdate?.customerAddress;
  }

  /**
   * Delete a customer address
   * @param id Address ID
   * @returns Boolean indicating success
   */
  async deleteCustomerAddress(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(DELETE_CUSTOMER_ADDRESS, variables);
    
    if (response.data?.customerAddressDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete customer address: ${response.data.customerAddressDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerAddressDelete?.deletedCustomerAddressId === id;
  }

  /**
   * Set a customer's default address
   * @param customerId Customer ID
   * @param addressId Address ID
   * @returns Updated customer
   */
  async setDefaultCustomerAddress(customerId: string, addressId: string) {
    const variables = { customerId, addressId };

    const response = await this.apiClient.request(SET_DEFAULT_CUSTOMER_ADDRESS, variables);
    
    if (response.data?.customerDefaultAddressUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to set default customer address: ${response.data.customerDefaultAddressUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerDefaultAddressUpdate?.customer;
  }

  /**
   * Update a customer's tax exemptions
   * @param customerId Customer ID
   * @param taxExemptions Array of tax exemption types
   * @returns Updated customer
   */
  async updateCustomerTaxExemptions(customerId: string, taxExemptions: string[]) {
    const variables = { customerId, taxExemptions };

    const response = await this.apiClient.request(UPDATE_CUSTOMER_TAX_EXEMPTIONS, variables);
    
    if (response.data?.customerTaxExemptionUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update customer tax exemptions: ${response.data.customerTaxExemptionUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.customerTaxExemptionUpdate?.customer;
  }

  /**
   * Create a customer metafield
   * @param customerId Customer ID
   * @param namespace Metafield namespace
   * @param key Metafield key
   * @param value Metafield value
   * @param type Metafield type
   * @returns Created metafield
   */
  async createCustomerMetafield(customerId: string, namespace: string, key: string, value: string, type: string) {
    const variables = { customerId, namespace, key, value, type };

    const response = await this.apiClient.request(CREATE_CUSTOMER_METAFIELD, variables);
    
    if (response.data?.metafieldsSet?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create customer metafield: ${response.data.metafieldsSet.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.metafieldsSet?.metafields?.[0];
  }

  /**
   * Delete a customer metafield
   * @param id Metafield ID
   * @returns Boolean indicating success
   */
  async deleteCustomerMetafield(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(DELETE_CUSTOMER_METAFIELD, variables);
    
    if (response.data?.metafieldDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete customer metafield: ${response.data.metafieldDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }
    
    return response.data?.metafieldDelete?.deletedId === id;
  }
}
