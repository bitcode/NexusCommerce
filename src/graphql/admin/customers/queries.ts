/**
 * Customer queries for Admin API
 * These queries are used to fetch customer data from the Shopify Admin API
 */

import {
  CUSTOMER_BASIC_FRAGMENT,
  CUSTOMER_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Query to fetch a single customer by ID
 * 
 * Variables:
 * - id: Customer ID (required)
 * - addressesFirst: Number of addresses to fetch (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 * - ordersFirst: Number of orders to fetch (optional, default: 10)
 */
export const GET_CUSTOMER = `
  query GetCustomer(
    $id: ID!,
    $addressesFirst: Int = 10,
    $metafieldsFirst: Int = 20,
    $ordersFirst: Int = 10
  ) {
    customer(id: $id) {
      ...CustomerCompleteFields
    }
  }
  ${CUSTOMER_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch multiple customers with pagination
 * 
 * Variables:
 * - first: Number of customers to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 * - addressesFirst: Number of addresses to fetch (optional, default: 1)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 0)
 * - ordersFirst: Number of orders to fetch (optional, default: 0)
 */
export const GET_CUSTOMERS = `
  query GetCustomers(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: CustomerSortKeys,
    $reverse: Boolean,
    $addressesFirst: Int = 1,
    $metafieldsFirst: Int = 0,
    $ordersFirst: Int = 0
  ) {
    customers(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...CustomerCompleteFields
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
  ${CUSTOMER_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a list of customers with basic information
 * Optimized for listing pages where complete details aren't needed
 * 
 * Variables:
 * - first: Number of customers to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_CUSTOMERS_BASIC = `
  query GetCustomersBasic(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: CustomerSortKeys,
    $reverse: Boolean
  ) {
    customers(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...CustomerBasicFields
          defaultAddress {
            id
            formatted
          }
          totalSpentV2 {
            amount
            currencyCode
          }
          ordersCount
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
  ${CUSTOMER_BASIC_FRAGMENT}
`;

/**
 * Query to fetch customer orders
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - first: Number of orders to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders(
    $customerId: ID!,
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: OrderSortKeys,
    $reverse: Boolean
  ) {
    customer(id: $customerId) {
      id
      firstName
      lastName
      email
      orders(
        first: $first,
        after: $after,
        query: $query,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            fulfillmentStatus
            financialStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            cancelledAt
            cancelReason
            currentTotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            currentSubtotalLineItemsQuantity
            customerLocale
            customerUrl
            edited
            email
            phone
            tags
            test
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
 * Query to fetch customer addresses
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - first: Number of addresses to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const GET_CUSTOMER_ADDRESSES = `
  query GetCustomerAddresses(
    $customerId: ID!,
    $first: Int!,
    $after: String
  ) {
    customer(id: $customerId) {
      id
      firstName
      lastName
      email
      addresses(
        first: $first,
        after: $after
      ) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            provinceCode
            zip
            country
            countryCode
            firstName
            lastName
            name
            company
            phone
            formatted
            formattedArea
            default
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
      defaultAddress {
        id
        formatted
      }
    }
  }
`;

/**
 * Query to fetch customer metafields
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - first: Number of metafields to fetch (required)
 * - after: Cursor for pagination (optional)
 * - namespace: Metafield namespace filter (optional)
 * - key: Metafield key filter (optional)
 */
export const GET_CUSTOMER_METAFIELDS = `
  query GetCustomerMetafields(
    $customerId: ID!,
    $first: Int!,
    $after: String,
    $namespace: String,
    $key: String
  ) {
    customer(id: $customerId) {
      id
      metafields(
        first: $first,
        after: $after,
        namespace: $namespace,
        key: $key
      ) {
        edges {
          node {
            id
            namespace
            key
            value
            type
            createdAt
            updatedAt
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
