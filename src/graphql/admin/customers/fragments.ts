/**
 * Customer fragments for Admin API
 * These fragments define reusable parts of GraphQL queries for customers
 */

/**
 * Basic customer fields fragment
 */
export const CUSTOMER_BASIC_FRAGMENT = `
  fragment CustomerBasicFields on Customer {
    id
    firstName
    lastName
    email
    phone
    displayName
    createdAt
    updatedAt
    state
    verifiedEmail
    acceptsMarketing
    taxExempt
  }
`;

/**
 * Customer addresses fragment
 */
export const CUSTOMER_ADDRESSES_FRAGMENT = `
  fragment CustomerAddressesFields on Customer {
    addresses(first: $addressesFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    defaultAddress {
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
  }
`;

/**
 * Customer tax exemptions fragment
 */
export const CUSTOMER_TAX_EXEMPTIONS_FRAGMENT = `
  fragment CustomerTaxExemptionsFields on Customer {
    taxExempt
    taxExemptions
  }
`;

/**
 * Customer metafields fragment
 */
export const CUSTOMER_METAFIELDS_FRAGMENT = `
  fragment CustomerMetafieldsFields on Customer {
    metafields(first: $metafieldsFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Customer orders fragment
 */
export const CUSTOMER_ORDERS_FRAGMENT = `
  fragment CustomerOrdersFields on Customer {
    orders(first: $ordersFirst) {
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
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Complete customer fragment combining all fragments
 */
export const CUSTOMER_COMPLETE_FRAGMENT = `
  fragment CustomerCompleteFields on Customer {
    ...CustomerBasicFields
    ...CustomerAddressesFields
    ...CustomerTaxExemptionsFields
    ...CustomerMetafieldsFields
    ...CustomerOrdersFields
    note
    tags
    locale
    lifetimeDuration
    averageOrderAmountV2 {
      amount
      currencyCode
    }
    totalSpentV2 {
      amount
      currencyCode
    }
    validEmailAddress
    lastOrderId
  }
  ${CUSTOMER_BASIC_FRAGMENT}
  ${CUSTOMER_ADDRESSES_FRAGMENT}
  ${CUSTOMER_TAX_EXEMPTIONS_FRAGMENT}
  ${CUSTOMER_METAFIELDS_FRAGMENT}
  ${CUSTOMER_ORDERS_FRAGMENT}
`;
