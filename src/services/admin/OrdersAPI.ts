/**
 * OrdersAPI.ts
 * Service for Shopify Admin API order operations
 */

import { ShopifyApiClient } from '../../shopify-api-monitor/src/ShopifyApiClient';
import {
  GET_ORDER,
  GET_ORDERS,
  GET_ORDERS_BASIC,
  GET_ORDER_FULFILLMENTS,
  GET_ORDER_TRANSACTIONS,
  GET_ORDER_REFUNDS,
  GET_DRAFT_ORDER,
  GET_DRAFT_ORDERS,
  GET_DRAFT_ORDERS_BASIC,
  CANCEL_ORDER,
  CLOSE_ORDER,
  REOPEN_ORDER,
  UPDATE_ORDER,
  CREATE_FULFILLMENT,
  UPDATE_FULFILLMENT,
  CANCEL_FULFILLMENT,
  CREATE_REFUND,
  CREATE_DRAFT_ORDER,
  UPDATE_DRAFT_ORDER,
  DELETE_DRAFT_ORDER,
  COMPLETE_DRAFT_ORDER,
  ADD_ORDER_TAGS,
  REMOVE_ORDER_TAGS
} from '../../graphql/admin/orders';
import {
  ORDER_EDIT_BEGIN,
  ORDER_EDIT_ADD_VARIANT,
  ORDER_EDIT_ADD_CUSTOM_ITEM,
  ORDER_EDIT_SET_QUANTITY,
  ORDER_EDIT_ADD_LINE_ITEM_DISCOUNT,
  ORDER_EDIT_REMOVE_DISCOUNT,
  ORDER_EDIT_ADD_SHIPPING_LINE,
  ORDER_EDIT_UPDATE_SHIPPING_LINE,
  ORDER_EDIT_REMOVE_SHIPPING_LINE,
  ORDER_EDIT_COMMIT,
  GET_CALCULATED_ORDER
} from '../../graphql/admin/orders/orderEditing';

/**
 * Service class for Shopify Admin API order operations
 */
export class OrdersAPI {
  private apiClient: ShopifyApiClient;

  /**
   * Constructor
   * @param apiClient ShopifyApiClient instance
   */
  constructor(apiClient: ShopifyApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get an order by ID
   * @param id Order ID
   * @param options Optional query options
   * @returns Order data
   */
  async getOrder(id: string, options: any = {}) {
    const variables = {
      id,
      lineItemsFirst: options.lineItemsFirst || 50,
      fulfillmentsFirst: options.fulfillmentsFirst || 10,
      transactionsFirst: options.transactionsFirst || 10,
      refundsFirst: options.refundsFirst || 10,
      shippingLinesFirst: options.shippingLinesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(GET_ORDER, variables);
    return response.data?.order;
  }

  /**
   * Get a list of orders
   * @param options Query options
   * @returns Orders connection
   */
  async getOrders(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      lineItemsFirst: options.lineItemsFirst || 5,
      fulfillmentsFirst: options.fulfillmentsFirst || 1,
      transactionsFirst: options.transactionsFirst || 1,
      refundsFirst: options.refundsFirst || 1,
      shippingLinesFirst: options.shippingLinesFirst || 1,
      metafieldsFirst: options.metafieldsFirst || 0
    };

    const response = await this.apiClient.request(GET_ORDERS, variables);
    return response.data?.orders;
  }

  /**
   * Get a list of orders with basic information
   * @param options Query options
   * @returns Orders connection with basic information
   */
  async getOrdersBasic(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_ORDERS_BASIC, variables);
    return response.data?.orders;
  }

  /**
   * Get fulfillments for an order
   * @param orderId Order ID
   * @param options Query options
   * @returns Order fulfillments connection
   */
  async getOrderFulfillments(orderId: string, options: any = {}) {
    const variables = {
      orderId,
      first: options.first || 10,
      after: options.after || null
    };

    const response = await this.apiClient.request(GET_ORDER_FULFILLMENTS, variables);
    return response.data?.order?.fulfillments;
  }

  /**
   * Get transactions for an order
   * @param orderId Order ID
   * @param options Query options
   * @returns Order transactions connection
   */
  async getOrderTransactions(orderId: string, options: any = {}) {
    const variables = {
      orderId,
      first: options.first || 10,
      after: options.after || null
    };

    const response = await this.apiClient.request(GET_ORDER_TRANSACTIONS, variables);
    return response.data?.order?.transactions;
  }

  /**
   * Get refunds for an order
   * @param orderId Order ID
   * @param options Query options
   * @returns Order refunds connection
   */
  async getOrderRefunds(orderId: string, options: any = {}) {
    const variables = {
      orderId,
      first: options.first || 10,
      after: options.after || null
    };

    const response = await this.apiClient.request(GET_ORDER_REFUNDS, variables);
    return response.data?.order?.refunds;
  }

  /**
   * Cancel an order
   * @param id Order ID
   * @param reason Reason for cancellation (optional)
   * @param options Optional query options
   * @returns Updated order
   */
  async cancelOrder(id: string, reason?: string, options: any = {}) {
    const variables = {
      id,
      reason,
      lineItemsFirst: options.lineItemsFirst || 50,
      fulfillmentsFirst: options.fulfillmentsFirst || 10,
      transactionsFirst: options.transactionsFirst || 10,
      refundsFirst: options.refundsFirst || 10,
      shippingLinesFirst: options.shippingLinesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(CANCEL_ORDER, variables);

    if (response.data?.orderCancel?.userErrors?.length > 0) {
      throw new Error(
        `Failed to cancel order: ${response.data.orderCancel.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderCancel?.order;
  }

  /**
   * Close an order
   * @param id Order ID
   * @param options Optional query options
   * @returns Updated order
   */
  async closeOrder(id: string, options: any = {}) {
    const variables = {
      id,
      lineItemsFirst: options.lineItemsFirst || 50,
      fulfillmentsFirst: options.fulfillmentsFirst || 10,
      transactionsFirst: options.transactionsFirst || 10,
      refundsFirst: options.refundsFirst || 10,
      shippingLinesFirst: options.shippingLinesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(CLOSE_ORDER, variables);

    if (response.data?.orderClose?.userErrors?.length > 0) {
      throw new Error(
        `Failed to close order: ${response.data.orderClose.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderClose?.order;
  }

  /**
   * Reopen a closed order
   * @param id Order ID
   * @param options Optional query options
   * @returns Updated order
   */
  async reopenOrder(id: string, options: any = {}) {
    const variables = {
      id,
      lineItemsFirst: options.lineItemsFirst || 50,
      fulfillmentsFirst: options.fulfillmentsFirst || 10,
      transactionsFirst: options.transactionsFirst || 10,
      refundsFirst: options.refundsFirst || 10,
      shippingLinesFirst: options.shippingLinesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(REOPEN_ORDER, variables);

    if (response.data?.orderOpen?.userErrors?.length > 0) {
      throw new Error(
        `Failed to reopen order: ${response.data.orderOpen.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderOpen?.order;
  }

  /**
   * Update an order
   * @param id Order ID
   * @param input Order input
   * @param options Optional query options
   * @returns Updated order
   */
  async updateOrder(id: string, input: any, options: any = {}) {
    const variables = {
      id,
      input,
      lineItemsFirst: options.lineItemsFirst || 50,
      fulfillmentsFirst: options.fulfillmentsFirst || 10,
      transactionsFirst: options.transactionsFirst || 10,
      refundsFirst: options.refundsFirst || 10,
      shippingLinesFirst: options.shippingLinesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(UPDATE_ORDER, variables);

    if (response.data?.orderUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update order: ${response.data.orderUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderUpdate?.order;
  }

  /**
   * Create a fulfillment
   * @param orderId Order ID
   * @param lineItems Array of line items to fulfill
   * @param options Optional parameters (notifyCustomer, trackingInfo, locationId)
   * @returns Created fulfillment
   */
  async createFulfillment(orderId: string, lineItems: any[], options: any = {}) {
    const variables = {
      orderId,
      lineItems,
      notifyCustomer: options.notifyCustomer,
      trackingInfo: options.trackingInfo,
      locationId: options.locationId
    };

    const response = await this.apiClient.request(CREATE_FULFILLMENT, variables);

    if (response.data?.fulfillmentCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create fulfillment: ${response.data.fulfillmentCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.fulfillmentCreate?.fulfillment;
  }

  /**
   * Update a fulfillment
   * @param id Fulfillment ID
   * @param options Optional parameters (trackingInfo, notifyCustomer)
   * @returns Updated fulfillment
   */
  async updateFulfillment(id: string, options: any = {}) {
    const variables = {
      id,
      trackingInfo: options.trackingInfo,
      notifyCustomer: options.notifyCustomer
    };

    const response = await this.apiClient.request(UPDATE_FULFILLMENT, variables);

    if (response.data?.fulfillmentUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update fulfillment: ${response.data.fulfillmentUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.fulfillmentUpdate?.fulfillment;
  }

  /**
   * Cancel a fulfillment
   * @param id Fulfillment ID
   * @returns Cancelled fulfillment
   */
  async cancelFulfillment(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(CANCEL_FULFILLMENT, variables);

    if (response.data?.fulfillmentCancel?.userErrors?.length > 0) {
      throw new Error(
        `Failed to cancel fulfillment: ${response.data.fulfillmentCancel.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.fulfillmentCancel?.fulfillment;
  }

  /**
   * Create a refund
   * @param orderId Order ID
   * @param options Optional parameters (refundLineItems, shipping, note, transactions)
   * @returns Created refund
   */
  async createRefund(orderId: string, options: any = {}) {
    const variables = {
      orderId,
      refundLineItems: options.refundLineItems,
      shipping: options.shipping,
      note: options.note,
      transactions: options.transactions
    };

    const response = await this.apiClient.request(CREATE_REFUND, variables);

    if (response.data?.refundCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create refund: ${response.data.refundCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return {
      refund: response.data?.refundCreate?.refund,
      order: response.data?.refundCreate?.order
    };
  }

  /**
   * Get a draft order by ID
   * @param id Draft Order ID
   * @param options Optional query options
   * @returns Draft order data
   */
  async getDraftOrder(id: string, options: any = {}) {
    const variables = {
      id,
      lineItemsFirst: options.lineItemsFirst || 50
    };

    const response = await this.apiClient.request(GET_DRAFT_ORDER, variables);
    return response.data?.draftOrder;
  }

  /**
   * Get a list of draft orders
   * @param options Query options
   * @returns Draft orders connection
   */
  async getDraftOrders(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null,
      lineItemsFirst: options.lineItemsFirst || 5
    };

    const response = await this.apiClient.request(GET_DRAFT_ORDERS, variables);
    return response.data?.draftOrders;
  }

  /**
   * Get a list of draft orders with basic information
   * @param options Query options
   * @returns Draft orders connection with basic information
   */
  async getDraftOrdersBasic(options: any = {}) {
    const variables = {
      first: options.first || 10,
      after: options.after || null,
      query: options.query || null,
      sortKey: options.sortKey || null,
      reverse: options.reverse || null
    };

    const response = await this.apiClient.request(GET_DRAFT_ORDERS_BASIC, variables);
    return response.data?.draftOrders;
  }

  /**
   * Create a draft order
   * @param input Draft order input
   * @param options Optional query options
   * @returns Created draft order
   */
  async createDraftOrder(input: any, options: any = {}) {
    const variables = {
      input,
      lineItemsFirst: options.lineItemsFirst || 50
    };

    const response = await this.apiClient.request(CREATE_DRAFT_ORDER, variables);

    if (response.data?.draftOrderCreate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to create draft order: ${response.data.draftOrderCreate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.draftOrderCreate?.draftOrder;
  }

  /**
   * Update a draft order
   * @param id Draft Order ID
   * @param input Draft order input
   * @param options Optional query options
   * @returns Updated draft order
   */
  async updateDraftOrder(id: string, input: any, options: any = {}) {
    const variables = {
      id,
      input,
      lineItemsFirst: options.lineItemsFirst || 50
    };

    const response = await this.apiClient.request(UPDATE_DRAFT_ORDER, variables);

    if (response.data?.draftOrderUpdate?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update draft order: ${response.data.draftOrderUpdate.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.draftOrderUpdate?.draftOrder;
  }

  /**
   * Delete a draft order
   * @param id Draft Order ID
   * @returns Boolean indicating success
   */
  async deleteDraftOrder(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(DELETE_DRAFT_ORDER, variables);

    if (response.data?.draftOrderDelete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to delete draft order: ${response.data.draftOrderDelete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.draftOrderDelete?.deletedId === id;
  }

  /**
   * Complete a draft order
   * @param id Draft Order ID
   * @param paymentPending Whether payment is pending
   * @param options Optional query options
   * @returns Completed draft order with order
   */
  async completeDraftOrder(id: string, paymentPending: boolean = false, options: any = {}) {
    const variables = {
      id,
      paymentPending,
      lineItemsFirst: options.lineItemsFirst || 50,
      fulfillmentsFirst: options.fulfillmentsFirst || 10,
      transactionsFirst: options.transactionsFirst || 10,
      refundsFirst: options.refundsFirst || 10,
      shippingLinesFirst: options.shippingLinesFirst || 10,
      metafieldsFirst: options.metafieldsFirst || 20
    };

    const response = await this.apiClient.request(COMPLETE_DRAFT_ORDER, variables);

    if (response.data?.draftOrderComplete?.userErrors?.length > 0) {
      throw new Error(
        `Failed to complete draft order: ${response.data.draftOrderComplete.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.draftOrderComplete?.draftOrder;
  }

  /**
   * Add tags to an order
   * @param id Order ID
   * @param tags Array of tags to add
   * @returns Updated order with tags
   */
  async addOrderTags(id: string, tags: string[]) {
    const variables = { id, tags };

    const response = await this.apiClient.request(ADD_ORDER_TAGS, variables);

    if (response.data?.tagsAdd?.userErrors?.length > 0) {
      throw new Error(
        `Failed to add tags to order: ${response.data.tagsAdd.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.tagsAdd?.node;
  }

  /**
   * Remove tags from an order
   * @param id Order ID
   * @param tags Array of tags to remove
   * @returns Updated order with tags
   */
  async removeOrderTags(id: string, tags: string[]) {
    const variables = { id, tags };

    const response = await this.apiClient.request(REMOVE_ORDER_TAGS, variables);

    if (response.data?.tagsRemove?.userErrors?.length > 0) {
      throw new Error(
        `Failed to remove tags from order: ${response.data.tagsRemove.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.tagsRemove?.node;
  }

  /**
   * Begin order editing
   * @param id Order ID
   * @returns CalculatedOrder ID
   */
  async beginOrderEdit(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(ORDER_EDIT_BEGIN, variables);

    if (response.data?.orderEditBegin?.userErrors?.length > 0) {
      throw new Error(
        `Failed to begin order editing: ${response.data.orderEditBegin.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditBegin?.calculatedOrder?.id;
  }

  /**
   * Get calculated order
   * @param id CalculatedOrder ID
   * @returns Calculated order data
   */
  async getCalculatedOrder(id: string) {
    const variables = { id };

    const response = await this.apiClient.request(GET_CALCULATED_ORDER, variables);
    return response.data?.calculatedOrder;
  }

  /**
   * Add a variant to an order
   * @param id CalculatedOrder ID
   * @param variantId Variant ID
   * @param quantity Quantity
   * @returns Added line item
   */
  async addVariantToOrder(id: string, variantId: string, quantity: number) {
    const variables = {
      id,
      variantId,
      quantity
    };

    const response = await this.apiClient.request(ORDER_EDIT_ADD_VARIANT, variables);

    if (response.data?.orderEditAddVariant?.userErrors?.length > 0) {
      throw new Error(
        `Failed to add variant to order: ${response.data.orderEditAddVariant.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditAddVariant?.calculatedLineItem;
  }

  /**
   * Add a custom item to an order
   * @param id CalculatedOrder ID
   * @param title Title
   * @param price Price
   * @param quantity Quantity
   * @param requiresShipping Whether the item requires shipping
   * @param taxable Whether the item is taxable
   * @returns Added line item
   */
  async addCustomItemToOrder(
    id: string,
    title: string,
    price: { amount: string, currencyCode: string },
    quantity: number,
    requiresShipping: boolean = true,
    taxable: boolean = true
  ) {
    const variables = {
      id,
      title,
      price,
      quantity,
      requiresShipping,
      taxable
    };

    const response = await this.apiClient.request(ORDER_EDIT_ADD_CUSTOM_ITEM, variables);

    if (response.data?.orderEditAddCustomItem?.userErrors?.length > 0) {
      throw new Error(
        `Failed to add custom item to order: ${response.data.orderEditAddCustomItem.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditAddCustomItem?.calculatedLineItem;
  }

  /**
   * Set the quantity of a line item
   * @param id CalculatedOrder ID
   * @param lineItemId Line Item ID
   * @param quantity Quantity
   * @param restock Whether to restock the item
   * @returns Updated line item
   */
  async setLineItemQuantity(
    id: string,
    lineItemId: string,
    quantity: number,
    restock: boolean = false
  ) {
    const variables = {
      id,
      lineItemId,
      quantity,
      restock
    };

    const response = await this.apiClient.request(ORDER_EDIT_SET_QUANTITY, variables);

    if (response.data?.orderEditSetQuantity?.userErrors?.length > 0) {
      throw new Error(
        `Failed to set line item quantity: ${response.data.orderEditSetQuantity.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditSetQuantity?.calculatedLineItem;
  }

  /**
   * Add a discount to a line item
   * @param id CalculatedOrder ID
   * @param lineItemId Line Item ID
   * @param discount Discount input
   * @returns Updated line item
   */
  async addLineItemDiscount(
    id: string,
    lineItemId: string,
    discount: {
      description: string,
      value: number | string,
      valueType: 'PERCENTAGE' | 'FIXED_AMOUNT'
    }
  ) {
    const variables = {
      id,
      lineItemId,
      discount
    };

    const response = await this.apiClient.request(ORDER_EDIT_ADD_LINE_ITEM_DISCOUNT, variables);

    if (response.data?.orderEditAddLineItemDiscount?.userErrors?.length > 0) {
      throw new Error(
        `Failed to add discount to line item: ${response.data.orderEditAddLineItemDiscount.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditAddLineItemDiscount?.calculatedLineItem;
  }

  /**
   * Remove a discount
   * @param id CalculatedOrder ID
   * @param discountApplicationId Discount Application ID
   * @returns Success status
   */
  async removeDiscount(id: string, discountApplicationId: string) {
    const variables = {
      id,
      discountApplicationId
    };

    const response = await this.apiClient.request(ORDER_EDIT_REMOVE_DISCOUNT, variables);

    if (response.data?.orderEditRemoveDiscount?.userErrors?.length > 0) {
      throw new Error(
        `Failed to remove discount: ${response.data.orderEditRemoveDiscount.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return true;
  }

  /**
   * Add a shipping line
   * @param id CalculatedOrder ID
   * @param title Title
   * @param price Price
   * @returns Updated calculated order
   */
  async addShippingLine(
    id: string,
    title: string,
    price: { amount: string, currencyCode: string }
  ) {
    const variables = {
      id,
      title,
      price
    };

    const response = await this.apiClient.request(ORDER_EDIT_ADD_SHIPPING_LINE, variables);

    if (response.data?.orderEditAddShippingLine?.userErrors?.length > 0) {
      throw new Error(
        `Failed to add shipping line: ${response.data.orderEditAddShippingLine.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditAddShippingLine?.calculatedOrder;
  }

  /**
   * Update a shipping line
   * @param id CalculatedOrder ID
   * @param shippingLineId Shipping Line ID
   * @param title Title
   * @param price Price
   * @returns Updated calculated order
   */
  async updateShippingLine(
    id: string,
    shippingLineId: string,
    title?: string,
    price?: { amount: string, currencyCode: string }
  ) {
    const variables = {
      id,
      shippingLineId,
      title,
      price
    };

    const response = await this.apiClient.request(ORDER_EDIT_UPDATE_SHIPPING_LINE, variables);

    if (response.data?.orderEditUpdateShippingLine?.userErrors?.length > 0) {
      throw new Error(
        `Failed to update shipping line: ${response.data.orderEditUpdateShippingLine.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditUpdateShippingLine?.calculatedOrder;
  }

  /**
   * Remove a shipping line
   * @param id CalculatedOrder ID
   * @param shippingLineId Shipping Line ID
   * @returns Success status
   */
  async removeShippingLine(id: string, shippingLineId: string) {
    const variables = {
      id,
      shippingLineId
    };

    const response = await this.apiClient.request(ORDER_EDIT_REMOVE_SHIPPING_LINE, variables);

    if (response.data?.orderEditRemoveShippingLine?.userErrors?.length > 0) {
      throw new Error(
        `Failed to remove shipping line: ${response.data.orderEditRemoveShippingLine.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return true;
  }

  /**
   * Commit order edits
   * @param id CalculatedOrder ID
   * @param staffNote Staff note
   * @param notifyCustomer Whether to notify the customer
   * @returns Updated order
   */
  async commitOrderEdits(
    id: string,
    staffNote?: string,
    notifyCustomer: boolean = false
  ) {
    const variables = {
      id,
      staffNote,
      notifyCustomer
    };

    const response = await this.apiClient.request(ORDER_EDIT_COMMIT, variables);

    if (response.data?.orderEditCommit?.userErrors?.length > 0) {
      throw new Error(
        `Failed to commit order edits: ${response.data.orderEditCommit.userErrors
          .map((error: any) => error.message)
          .join(', ')}`
      );
    }

    return response.data?.orderEditCommit?.order;
  }
}
