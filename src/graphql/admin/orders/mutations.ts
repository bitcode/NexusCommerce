/**
 * Order mutations for Admin API
 * These mutations are used to create, update, and delete orders in the Shopify Admin API
 */

import {
  ORDER_BASIC_FRAGMENT,
  ORDER_COMPLETE_FRAGMENT,
  DRAFT_ORDER_BASIC_FRAGMENT,
  DRAFT_ORDER_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Mutation to cancel an order
 * 
 * Variables:
 * - id: Order ID (required)
 * - reason: Reason for cancellation (optional)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 * - fulfillmentsFirst: Number of fulfillments to fetch in response (optional, default: 10)
 * - transactionsFirst: Number of transactions to fetch in response (optional, default: 10)
 * - refundsFirst: Number of refunds to fetch in response (optional, default: 10)
 * - shippingLinesFirst: Number of shipping lines to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const CANCEL_ORDER = `
  mutation CancelOrder(
    $id: ID!,
    $reason: OrderCancelReason,
    $lineItemsFirst: Int = 50,
    $fulfillmentsFirst: Int = 10,
    $transactionsFirst: Int = 10,
    $refundsFirst: Int = 10,
    $shippingLinesFirst: Int = 10,
    $metafieldsFirst: Int = 20
  ) {
    orderCancel(input: {
      id: $id,
      reason: $reason
    }) {
      order {
        ...OrderCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to close an order
 * 
 * Variables:
 * - id: Order ID (required)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 * - fulfillmentsFirst: Number of fulfillments to fetch in response (optional, default: 10)
 * - transactionsFirst: Number of transactions to fetch in response (optional, default: 10)
 * - refundsFirst: Number of refunds to fetch in response (optional, default: 10)
 * - shippingLinesFirst: Number of shipping lines to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const CLOSE_ORDER = `
  mutation CloseOrder(
    $id: ID!,
    $lineItemsFirst: Int = 50,
    $fulfillmentsFirst: Int = 10,
    $transactionsFirst: Int = 10,
    $refundsFirst: Int = 10,
    $shippingLinesFirst: Int = 10,
    $metafieldsFirst: Int = 20
  ) {
    orderClose(input: {
      id: $id
    }) {
      order {
        ...OrderCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to reopen a closed order
 * 
 * Variables:
 * - id: Order ID (required)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 * - fulfillmentsFirst: Number of fulfillments to fetch in response (optional, default: 10)
 * - transactionsFirst: Number of transactions to fetch in response (optional, default: 10)
 * - refundsFirst: Number of refunds to fetch in response (optional, default: 10)
 * - shippingLinesFirst: Number of shipping lines to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const REOPEN_ORDER = `
  mutation ReopenOrder(
    $id: ID!,
    $lineItemsFirst: Int = 50,
    $fulfillmentsFirst: Int = 10,
    $transactionsFirst: Int = 10,
    $refundsFirst: Int = 10,
    $shippingLinesFirst: Int = 10,
    $metafieldsFirst: Int = 20
  ) {
    orderOpen(input: {
      id: $id
    }) {
      order {
        ...OrderCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to update an order
 * 
 * Variables:
 * - id: Order ID (required)
 * - input: OrderInput object with order details (required)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 * - fulfillmentsFirst: Number of fulfillments to fetch in response (optional, default: 10)
 * - transactionsFirst: Number of transactions to fetch in response (optional, default: 10)
 * - refundsFirst: Number of refunds to fetch in response (optional, default: 10)
 * - shippingLinesFirst: Number of shipping lines to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const UPDATE_ORDER = `
  mutation UpdateOrder(
    $id: ID!,
    $input: OrderInput!,
    $lineItemsFirst: Int = 50,
    $fulfillmentsFirst: Int = 10,
    $transactionsFirst: Int = 10,
    $refundsFirst: Int = 10,
    $shippingLinesFirst: Int = 10,
    $metafieldsFirst: Int = 20
  ) {
    orderUpdate(input: {
      id: $id,
      ...($input)
    }) {
      order {
        ...OrderCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to create a fulfillment
 * 
 * Variables:
 * - orderId: Order ID (required)
 * - lineItems: Array of line items to fulfill (required)
 * - notifyCustomer: Whether to notify the customer (optional)
 * - trackingInfo: Tracking information (optional)
 * - locationId: Location ID (optional)
 */
export const CREATE_FULFILLMENT = `
  mutation CreateFulfillment(
    $orderId: ID!,
    $lineItems: [FulfillmentLineItemInput!]!,
    $notifyCustomer: Boolean,
    $trackingInfo: [FulfillmentTrackingInput!],
    $locationId: ID
  ) {
    fulfillmentCreate(input: {
      orderId: $orderId,
      lineItems: $lineItems,
      notifyCustomer: $notifyCustomer,
      trackingInfo: $trackingInfo,
      locationId: $locationId
    }) {
      fulfillment {
        id
        status
        trackingInfo {
          company
          number
          url
        }
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to update a fulfillment
 * 
 * Variables:
 * - id: Fulfillment ID (required)
 * - trackingInfo: Tracking information (optional)
 * - notifyCustomer: Whether to notify the customer (optional)
 */
export const UPDATE_FULFILLMENT = `
  mutation UpdateFulfillment(
    $id: ID!,
    $trackingInfo: [FulfillmentTrackingInput!],
    $notifyCustomer: Boolean
  ) {
    fulfillmentUpdate(input: {
      id: $id,
      trackingInfo: $trackingInfo,
      notifyCustomer: $notifyCustomer
    }) {
      fulfillment {
        id
        status
        trackingInfo {
          company
          number
          url
        }
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to cancel a fulfillment
 * 
 * Variables:
 * - id: Fulfillment ID (required)
 */
export const CANCEL_FULFILLMENT = `
  mutation CancelFulfillment($id: ID!) {
    fulfillmentCancel(input: {
      id: $id
    }) {
      fulfillment {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to create a refund
 * 
 * Variables:
 * - orderId: Order ID (required)
 * - refundLineItems: Array of line items to refund (optional)
 * - shipping: Shipping refund (optional)
 * - note: Note for the refund (optional)
 * - transactions: Array of transactions for the refund (optional)
 */
export const CREATE_REFUND = `
  mutation CreateRefund(
    $orderId: ID!,
    $refundLineItems: [RefundLineItemInput!],
    $shipping: ShippingRefundInput,
    $note: String,
    $transactions: [OrderTransactionInput!]
  ) {
    refundCreate(input: {
      orderId: $orderId,
      refundLineItems: $refundLineItems,
      shipping: $shipping,
      note: $note,
      transactions: $transactions
    }) {
      refund {
        id
        createdAt
        note
        totalRefundedSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        refundLineItems(first: 50) {
          edges {
            node {
              id
              quantity
              lineItem {
                id
                title
              }
              restockType
            }
          }
        }
      }
      order {
        id
        name
        displayFinancialStatus
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to create a draft order
 * 
 * Variables:
 * - input: DraftOrderInput object with draft order details (required)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 */
export const CREATE_DRAFT_ORDER = `
  mutation CreateDraftOrder(
    $input: DraftOrderInput!,
    $lineItemsFirst: Int = 50
  ) {
    draftOrderCreate(input: $input) {
      draftOrder {
        ...DraftOrderCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${DRAFT_ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to update a draft order
 * 
 * Variables:
 * - id: Draft Order ID (required)
 * - input: DraftOrderInput object with draft order details (required)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 */
export const UPDATE_DRAFT_ORDER = `
  mutation UpdateDraftOrder(
    $id: ID!,
    $input: DraftOrderInput!,
    $lineItemsFirst: Int = 50
  ) {
    draftOrderUpdate(input: {
      id: $id,
      ...($input)
    }) {
      draftOrder {
        ...DraftOrderCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${DRAFT_ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to delete a draft order
 * 
 * Variables:
 * - id: Draft Order ID (required)
 */
export const DELETE_DRAFT_ORDER = `
  mutation DeleteDraftOrder($id: ID!) {
    draftOrderDelete(input: {
      id: $id
    }) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to complete a draft order
 * 
 * Variables:
 * - id: Draft Order ID (required)
 * - paymentPending: Whether payment is pending (optional)
 * - lineItemsFirst: Number of line items to fetch in response (optional, default: 50)
 * - fulfillmentsFirst: Number of fulfillments to fetch in response (optional, default: 10)
 * - transactionsFirst: Number of transactions to fetch in response (optional, default: 10)
 * - refundsFirst: Number of refunds to fetch in response (optional, default: 10)
 * - shippingLinesFirst: Number of shipping lines to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const COMPLETE_DRAFT_ORDER = `
  mutation CompleteDraftOrder(
    $id: ID!,
    $paymentPending: Boolean,
    $lineItemsFirst: Int = 50,
    $fulfillmentsFirst: Int = 10,
    $transactionsFirst: Int = 10,
    $refundsFirst: Int = 10,
    $shippingLinesFirst: Int = 10,
    $metafieldsFirst: Int = 20
  ) {
    draftOrderComplete(input: {
      id: $id,
      paymentPending: $paymentPending
    }) {
      draftOrder {
        id
        status
        completedAt
        order {
          ...OrderCompleteFields
        }
      }
      userErrors {
        field
        message
      }
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to add tags to an order
 * 
 * Variables:
 * - id: Order ID (required)
 * - tags: Array of tags to add (required)
 */
export const ADD_ORDER_TAGS = `
  mutation AddOrderTags(
    $id: ID!,
    $tags: [String!]!
  ) {
    tagsAdd(
      id: $id,
      tags: $tags
    ) {
      node {
        id
        ... on Order {
          tags
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to remove tags from an order
 * 
 * Variables:
 * - id: Order ID (required)
 * - tags: Array of tags to remove (required)
 */
export const REMOVE_ORDER_TAGS = `
  mutation RemoveOrderTags(
    $id: ID!,
    $tags: [String!]!
  ) {
    tagsRemove(
      id: $id,
      tags: $tags
    ) {
      node {
        id
        ... on Order {
          tags
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
