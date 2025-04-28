/**
 * Order fragments for Admin API
 * These fragments define reusable parts of GraphQL queries for orders
 */

/**
 * Basic order fields fragment
 */
export const ORDER_BASIC_FRAGMENT = `
  fragment OrderBasicFields on Order {
    id
    name
    orderNumber
    displayFinancialStatus
    displayFulfillmentStatus
    processedAt
    createdAt
    updatedAt
    cancelledAt
    cancelReason
    confirmed
    closed
    totalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    subtotalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalShippingPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalTaxSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalDiscountsSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalRefundedSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    customer {
      id
      firstName
      lastName
      email
      phone
      displayName
    }
    tags
    note
    edited
    test
  }
`;

/**
 * Order line items fragment
 */
export const ORDER_LINE_ITEMS_FRAGMENT = `
  fragment OrderLineItemsFields on Order {
    lineItems(first: $lineItemsFirst) {
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
          discountedUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          totalDiscountSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          variant {
            id
            title
            sku
            inventoryQuantity
            image {
              url
              altText
            }
            product {
              id
              title
              handle
            }
          }
          refundableQuantity
          fulfillableQuantity
          fulfillmentStatus
          taxLines {
            title
            rate
            priceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
          discountAllocations {
            allocatedAmountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            discountApplication {
              targetType
              targetSelection
              allocationMethod
              value {
                ... on MoneyV2 {
                  amount
                  currencyCode
                }
                ... on PricingPercentageValue {
                  percentage
                }
              }
            }
          }
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
 * Order shipping and billing address fragment
 */
export const ORDER_ADDRESSES_FRAGMENT = `
  fragment OrderAddressesFields on Order {
    shippingAddress {
      firstName
      lastName
      company
      address1
      address2
      city
      province
      provinceCode
      zip
      country
      countryCode
      phone
      formatted
    }
    billingAddress {
      firstName
      lastName
      company
      address1
      address2
      city
      province
      provinceCode
      zip
      country
      countryCode
      phone
      formatted
    }
  }
`;

/**
 * Order fulfillments fragment
 */
export const ORDER_FULFILLMENTS_FRAGMENT = `
  fragment OrderFulfillmentsFields on Order {
    fulfillments(first: $fulfillmentsFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Order transactions fragment
 */
export const ORDER_TRANSACTIONS_FRAGMENT = `
  fragment OrderTransactionsFields on Order {
    transactions(first: $transactionsFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Order refunds fragment
 */
export const ORDER_REFUNDS_FRAGMENT = `
  fragment OrderRefundsFields on Order {
    refunds(first: $refundsFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Order shipping lines fragment
 */
export const ORDER_SHIPPING_LINES_FRAGMENT = `
  fragment OrderShippingLinesFields on Order {
    shippingLines(first: $shippingLinesFirst) {
      edges {
        node {
          id
          title
          carrierIdentifier
          deliveryCategory
          discountedPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          originalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
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
 * Order metafields fragment
 */
export const ORDER_METAFIELDS_FRAGMENT = `
  fragment OrderMetafieldsFields on Order {
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
 * Complete order fragment combining all fragments
 */
export const ORDER_COMPLETE_FRAGMENT = `
  fragment OrderCompleteFields on Order {
    ...OrderBasicFields
    ...OrderLineItemsFields
    ...OrderAddressesFields
    ...OrderFulfillmentsFields
    ...OrderTransactionsFields
    ...OrderRefundsFields
    ...OrderShippingLinesFields
    ...OrderMetafieldsFields
    currentSubtotalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    currentTotalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    currentTotalTaxSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    currentTotalDiscountsSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    currentTotalDutiesSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalWeight
    fulfillable
    fulfillmentStatus
    financialStatus
    risksInclude
    totalCapturableSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalRefundedShippingSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    originalTotalDutiesSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    unpaid
  }
  ${ORDER_BASIC_FRAGMENT}
  ${ORDER_LINE_ITEMS_FRAGMENT}
  ${ORDER_ADDRESSES_FRAGMENT}
  ${ORDER_FULFILLMENTS_FRAGMENT}
  ${ORDER_TRANSACTIONS_FRAGMENT}
  ${ORDER_REFUNDS_FRAGMENT}
  ${ORDER_SHIPPING_LINES_FRAGMENT}
  ${ORDER_METAFIELDS_FRAGMENT}
`;

/**
 * Basic draft order fields fragment
 */
export const DRAFT_ORDER_BASIC_FRAGMENT = `
  fragment DraftOrderBasicFields on DraftOrder {
    id
    name
    status
    createdAt
    updatedAt
    completedAt
    totalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    subtotalPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalShippingPriceSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalTaxSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    totalDiscountsSet {
      shopMoney {
        amount
        currencyCode
      }
    }
    customer {
      id
      firstName
      lastName
      email
      phone
      displayName
    }
    note
    invoiceSentAt
    invoiceUrl
    ready
    tags
  }
`;

/**
 * Draft order line items fragment
 */
export const DRAFT_ORDER_LINE_ITEMS_FRAGMENT = `
  fragment DraftOrderLineItemsFields on DraftOrder {
    lineItems(first: $lineItemsFirst) {
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
          discountedUnitPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          variant {
            id
            title
            sku
            inventoryQuantity
            image {
              url
              altText
            }
            product {
              id
              title
              handle
            }
          }
          product {
            id
            title
            handle
          }
          customAttributes {
            key
            value
          }
          taxable
          taxLines {
            title
            rate
            priceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
          discountAllocations {
            allocatedAmountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            discountApplication {
              targetType
              targetSelection
              allocationMethod
              value {
                ... on MoneyV2 {
                  amount
                  currencyCode
                }
                ... on PricingPercentageValue {
                  percentage
                }
              }
            }
          }
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
 * Draft order shipping and billing address fragment
 */
export const DRAFT_ORDER_ADDRESSES_FRAGMENT = `
  fragment DraftOrderAddressesFields on DraftOrder {
    shippingAddress {
      firstName
      lastName
      company
      address1
      address2
      city
      province
      provinceCode
      zip
      country
      countryCode
      phone
      formatted
    }
    billingAddress {
      firstName
      lastName
      company
      address1
      address2
      city
      province
      provinceCode
      zip
      country
      countryCode
      phone
      formatted
    }
  }
`;

/**
 * Draft order shipping line fragment
 */
export const DRAFT_ORDER_SHIPPING_LINE_FRAGMENT = `
  fragment DraftOrderShippingLineFields on DraftOrder {
    shippingLine {
      title
      custom
      handle
      priceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
    }
  }
`;

/**
 * Complete draft order fragment combining all fragments
 */
export const DRAFT_ORDER_COMPLETE_FRAGMENT = `
  fragment DraftOrderCompleteFields on DraftOrder {
    ...DraftOrderBasicFields
    ...DraftOrderLineItemsFields
    ...DraftOrderAddressesFields
    ...DraftOrderShippingLineFields
    appliedDiscount {
      title
      description
      value
      valueType
      amount
    }
    email
    order {
      id
      name
      orderNumber
    }
    taxExempt
    useCustomerDefaultAddress
  }
  ${DRAFT_ORDER_BASIC_FRAGMENT}
  ${DRAFT_ORDER_LINE_ITEMS_FRAGMENT}
  ${DRAFT_ORDER_ADDRESSES_FRAGMENT}
  ${DRAFT_ORDER_SHIPPING_LINE_FRAGMENT}
`;
