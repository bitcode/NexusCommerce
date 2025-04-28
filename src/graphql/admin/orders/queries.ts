/**
 * Order queries for Admin API
 * These queries are used to fetch order data from the Shopify Admin API
 */

import {
  ORDER_BASIC_FRAGMENT,
  ORDER_COMPLETE_FRAGMENT,
  DRAFT_ORDER_BASIC_FRAGMENT,
  DRAFT_ORDER_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Query to fetch a single order by ID
 * 
 * Variables:
 * - id: Order ID (required)
 * - lineItemsFirst: Number of line items to fetch (optional, default: 50)
 * - fulfillmentsFirst: Number of fulfillments to fetch (optional, default: 10)
 * - transactionsFirst: Number of transactions to fetch (optional, default: 10)
 * - refundsFirst: Number of refunds to fetch (optional, default: 10)
 * - shippingLinesFirst: Number of shipping lines to fetch (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 */
export const GET_ORDER = `
  query GetOrder(
    $id: ID!,
    $lineItemsFirst: Int = 50,
    $fulfillmentsFirst: Int = 10,
    $transactionsFirst: Int = 10,
    $refundsFirst: Int = 10,
    $shippingLinesFirst: Int = 10,
    $metafieldsFirst: Int = 20
  ) {
    order(id: $id) {
      ...OrderCompleteFields
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch multiple orders with pagination
 * 
 * Variables:
 * - first: Number of orders to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 * - lineItemsFirst: Number of line items to fetch (optional, default: 5)
 * - fulfillmentsFirst: Number of fulfillments to fetch (optional, default: 1)
 * - transactionsFirst: Number of transactions to fetch (optional, default: 1)
 * - refundsFirst: Number of refunds to fetch (optional, default: 1)
 * - shippingLinesFirst: Number of shipping lines to fetch (optional, default: 1)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 0)
 */
export const GET_ORDERS = `
  query GetOrders(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: OrderSortKeys,
    $reverse: Boolean,
    $lineItemsFirst: Int = 5,
    $fulfillmentsFirst: Int = 1,
    $transactionsFirst: Int = 1,
    $refundsFirst: Int = 1,
    $shippingLinesFirst: Int = 1,
    $metafieldsFirst: Int = 0
  ) {
    orders(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...OrderCompleteFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a list of orders with basic information
 * Optimized for listing pages where complete details aren't needed
 * 
 * Variables:
 * - first: Number of orders to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_ORDERS_BASIC = `
  query GetOrdersBasic(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: OrderSortKeys,
    $reverse: Boolean
  ) {
    orders(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...OrderBasicFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${ORDER_BASIC_FRAGMENT}
`;

/**
 * Query to fetch order fulfillments
 * 
 * Variables:
 * - orderId: Order ID (required)
 * - first: Number of fulfillments to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const GET_ORDER_FULFILLMENTS = `
  query GetOrderFulfillments(
    $orderId: ID!,
    $first: Int!,
    $after: String
  ) {
    order(id: $orderId) {
      id
      name
      fulfillments(
        first: $first,
        after: $after
      ) {
        edges {
          node {
            id
            status
            createdAt
            updatedAt
            trackingInfo {
              company
              number
              url
            }
            deliveredAt
            estimatedDeliveryAt
            displayStatus
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  variant {
                    id
                    title
                    sku
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

/**
 * Query to fetch order transactions
 * 
 * Variables:
 * - orderId: Order ID (required)
 * - first: Number of transactions to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const GET_ORDER_TRANSACTIONS = `
  query GetOrderTransactions(
    $orderId: ID!,
    $first: Int!,
    $after: String
  ) {
    order(id: $orderId) {
      id
      name
      transactions(
        first: $first,
        after: $after
      ) {
        edges {
          node {
            id
            status
            kind
            gateway
            amountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            createdAt
            processedAt
            errorCode
            formattedGateway
            paymentDetails {
              ... on CardPaymentDetails {
                creditCardNumber
                creditCardCompany
                creditCardLastDigits
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

/**
 * Query to fetch order refunds
 * 
 * Variables:
 * - orderId: Order ID (required)
 * - first: Number of refunds to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const GET_ORDER_REFUNDS = `
  query GetOrderRefunds(
    $orderId: ID!,
    $first: Int!,
    $after: String
  ) {
    order(id: $orderId) {
      id
      name
      refunds(
        first: $first,
        after: $after
      ) {
        edges {
          node {
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
                    variant {
                      id
                      title
                      sku
                    }
                  }
                  restockType
                  totalSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            transactions(first: 10) {
              edges {
                node {
                  id
                  status
                  kind
                  gateway
                  amountSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  processedAt
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

/**
 * Query to fetch a single draft order by ID
 * 
 * Variables:
 * - id: Draft Order ID (required)
 * - lineItemsFirst: Number of line items to fetch (optional, default: 50)
 */
export const GET_DRAFT_ORDER = `
  query GetDraftOrder(
    $id: ID!,
    $lineItemsFirst: Int = 50
  ) {
    draftOrder(id: $id) {
      ...DraftOrderCompleteFields
    }
  }
  ${DRAFT_ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch multiple draft orders with pagination
 * 
 * Variables:
 * - first: Number of draft orders to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 * - lineItemsFirst: Number of line items to fetch (optional, default: 5)
 */
export const GET_DRAFT_ORDERS = `
  query GetDraftOrders(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: DraftOrderSortKeys,
    $reverse: Boolean,
    $lineItemsFirst: Int = 5
  ) {
    draftOrders(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...DraftOrderCompleteFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${DRAFT_ORDER_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a list of draft orders with basic information
 * Optimized for listing pages where complete details aren't needed
 * 
 * Variables:
 * - first: Number of draft orders to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_DRAFT_ORDERS_BASIC = `
  query GetDraftOrdersBasic(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: DraftOrderSortKeys,
    $reverse: Boolean
  ) {
    draftOrders(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...DraftOrderBasicFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${DRAFT_ORDER_BASIC_FRAGMENT}
`;
