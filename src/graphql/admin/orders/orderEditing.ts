/**
 * Order editing mutations for Admin API
 * These mutations are used to edit orders in the Shopify Admin API
 */

import { ORDER_COMPLETE_FRAGMENT } from './fragments';

/**
 * Mutation to begin order editing
 * 
 * Variables:
 * - id: Order ID (required)
 */
export const ORDER_EDIT_BEGIN = `
  mutation OrderEditBegin($id: ID!) {
    orderEditBegin(id: $id) {
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to add a variant to an order
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - variantId: Variant ID (required)
 * - quantity: Quantity (required)
 */
export const ORDER_EDIT_ADD_VARIANT = `
  mutation OrderEditAddVariant(
    $id: ID!,
    $variantId: ID!,
    $quantity: Int!
  ) {
    orderEditAddVariant(
      id: $id,
      variantId: $variantId,
      quantity: $quantity
    ) {
      calculatedLineItem {
        id
        quantity
        variant {
          id
          title
          price {
            amount
            currencyCode
          }
        }
      }
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to add a custom item to an order
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - title: Title (required)
 * - price: Price (required)
 * - quantity: Quantity (required)
 * - requiresShipping: Whether the item requires shipping (optional)
 * - taxable: Whether the item is taxable (optional)
 */
export const ORDER_EDIT_ADD_CUSTOM_ITEM = `
  mutation OrderEditAddCustomItem(
    $id: ID!,
    $title: String!,
    $price: MoneyInput!,
    $quantity: Int!,
    $requiresShipping: Boolean,
    $taxable: Boolean
  ) {
    orderEditAddCustomItem(
      id: $id,
      title: $title,
      price: $price,
      quantity: $quantity,
      requiresShipping: $requiresShipping,
      taxable: $taxable
    ) {
      calculatedLineItem {
        id
        quantity
        title
      }
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to set the quantity of a line item
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - lineItemId: Line Item ID (required)
 * - quantity: Quantity (required)
 * - restock: Whether to restock the item (optional)
 */
export const ORDER_EDIT_SET_QUANTITY = `
  mutation OrderEditSetQuantity(
    $id: ID!,
    $lineItemId: ID!,
    $quantity: Int!,
    $restock: Boolean
  ) {
    orderEditSetQuantity(
      id: $id,
      lineItemId: $lineItemId,
      quantity: $quantity,
      restock: $restock
    ) {
      calculatedLineItem {
        id
        quantity
      }
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to add a discount to a line item
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - lineItemId: Line Item ID (required)
 * - discount: Discount input (required)
 */
export const ORDER_EDIT_ADD_LINE_ITEM_DISCOUNT = `
  mutation OrderEditAddLineItemDiscount(
    $id: ID!,
    $lineItemId: ID!,
    $discount: OrderEditAppliedDiscountInput!
  ) {
    orderEditAddLineItemDiscount(
      id: $id,
      lineItemId: $lineItemId,
      discount: $discount
    ) {
      calculatedLineItem {
        id
        discountAllocations {
          allocatedAmount {
            amount
            currencyCode
          }
          discountApplication {
            index
            targetType
            targetSelection
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
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to remove a discount
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - discountApplicationId: Discount Application ID (required)
 */
export const ORDER_EDIT_REMOVE_DISCOUNT = `
  mutation OrderEditRemoveDiscount(
    $id: ID!,
    $discountApplicationId: ID!
  ) {
    orderEditRemoveDiscount(
      id: $id,
      discountApplicationId: $discountApplicationId
    ) {
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to add a shipping line
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - title: Title (required)
 * - price: Price (required)
 */
export const ORDER_EDIT_ADD_SHIPPING_LINE = `
  mutation OrderEditAddShippingLine(
    $id: ID!,
    $title: String!,
    $price: MoneyInput!
  ) {
    orderEditAddShippingLine(
      id: $id,
      title: $title,
      price: $price
    ) {
      calculatedOrder {
        id
        shippingLine {
          id
          title
          price {
            amount
            currencyCode
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

/**
 * Mutation to update a shipping line
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - shippingLineId: Shipping Line ID (required)
 * - title: Title (optional)
 * - price: Price (optional)
 */
export const ORDER_EDIT_UPDATE_SHIPPING_LINE = `
  mutation OrderEditUpdateShippingLine(
    $id: ID!,
    $shippingLineId: ID!,
    $title: String,
    $price: MoneyInput
  ) {
    orderEditUpdateShippingLine(
      id: $id,
      shippingLineId: $shippingLineId,
      title: $title,
      price: $price
    ) {
      calculatedOrder {
        id
        shippingLine {
          id
          title
          price {
            amount
            currencyCode
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

/**
 * Mutation to remove a shipping line
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - shippingLineId: Shipping Line ID (required)
 */
export const ORDER_EDIT_REMOVE_SHIPPING_LINE = `
  mutation OrderEditRemoveShippingLine(
    $id: ID!,
    $shippingLineId: ID!
  ) {
    orderEditRemoveShippingLine(
      id: $id,
      shippingLineId: $shippingLineId
    ) {
      calculatedOrder {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to commit order edits
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 * - staffNote: Staff note (optional)
 * - notifyCustomer: Whether to notify the customer (optional)
 */
export const ORDER_EDIT_COMMIT = `
  mutation OrderEditCommit(
    $id: ID!,
    $staffNote: String,
    $notifyCustomer: Boolean
  ) {
    orderEditCommit(
      id: $id,
      staffNote: $staffNote,
      notifyCustomer: $notifyCustomer
    ) {
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
 * Query to get a calculated order
 * 
 * Variables:
 * - id: CalculatedOrder ID (required)
 */
export const GET_CALCULATED_ORDER = `
  query GetCalculatedOrder($id: ID!) {
    calculatedOrder(id: $id) {
      id
      lineItems {
        id
        title
        quantity
        variantTitle
        originalUnitPrice {
          amount
          currencyCode
        }
        discountedUnitPrice {
          amount
          currencyCode
        }
        discountAllocations {
          allocatedAmount {
            amount
            currencyCode
          }
          discountApplication {
            index
            targetType
            targetSelection
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
        variant {
          id
          title
          sku
          image {
            url
            altText
          }
          price {
            amount
            currencyCode
          }
          product {
            id
            title
          }
        }
      }
      subtotalPrice {
        amount
        currencyCode
      }
      totalPrice {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      totalShippingPrice {
        amount
        currencyCode
      }
      shippingLine {
        id
        title
        price {
          amount
          currencyCode
        }
      }
    }
  }
`;
