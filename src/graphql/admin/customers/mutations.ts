/**
 * Customer mutations for Admin API
 * These mutations are used to create, update, and delete customers in the Shopify Admin API
 */

import {
  CUSTOMER_BASIC_FRAGMENT,
  CUSTOMER_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Mutation to create a new customer
 * 
 * Variables:
 * - input: CustomerInput object with customer details (required)
 * - addressesFirst: Number of addresses to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 * - ordersFirst: Number of orders to fetch in response (optional, default: 10)
 */
export const CREATE_CUSTOMER = `
  mutation CreateCustomer(
    $input: CustomerInput!,
    $addressesFirst: Int = 10,
    $metafieldsFirst: Int = 20,
    $ordersFirst: Int = 10
  ) {
    customerCreate(input: $input) {
      customer {
        ...CustomerCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CUSTOMER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to update an existing customer
 * 
 * Variables:
 * - id: Customer ID (required)
 * - input: CustomerInput object with customer details (required)
 * - addressesFirst: Number of addresses to fetch in response (optional, default: 10)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 * - ordersFirst: Number of orders to fetch in response (optional, default: 10)
 */
export const UPDATE_CUSTOMER = `
  mutation UpdateCustomer(
    $id: ID!,
    $input: CustomerInput!,
    $addressesFirst: Int = 10,
    $metafieldsFirst: Int = 20,
    $ordersFirst: Int = 10
  ) {
    customerUpdate(input: {
      id: $id,
      ...($input)
    }) {
      customer {
        ...CustomerCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CUSTOMER_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to delete a customer
 * 
 * Variables:
 * - id: Customer ID (required)
 */
export const DELETE_CUSTOMER = `
  mutation DeleteCustomer($id: ID!) {
    customerDelete(input: {
      id: $id
    }) {
      deletedCustomerId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to create a customer address
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - address: MailingAddressInput object with address details (required)
 */
export const CREATE_CUSTOMER_ADDRESS = `
  mutation CreateCustomerAddress(
    $customerId: ID!,
    $address: MailingAddressInput!
  ) {
    customerAddressCreate(
      customerId: $customerId,
      address: $address
    ) {
      customerAddress {
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
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to update a customer address
 * 
 * Variables:
 * - id: Address ID (required)
 * - address: MailingAddressInput object with address details (required)
 */
export const UPDATE_CUSTOMER_ADDRESS = `
  mutation UpdateCustomerAddress(
    $id: ID!,
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(
      id: $id,
      address: $address
    ) {
      customerAddress {
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
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to delete a customer address
 * 
 * Variables:
 * - id: Address ID (required)
 */
export const DELETE_CUSTOMER_ADDRESS = `
  mutation DeleteCustomerAddress($id: ID!) {
    customerAddressDelete(id: $id) {
      deletedCustomerAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to set a customer's default address
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - addressId: Address ID (required)
 */
export const SET_DEFAULT_CUSTOMER_ADDRESS = `
  mutation SetDefaultCustomerAddress(
    $customerId: ID!,
    $addressId: ID!
  ) {
    customerDefaultAddressUpdate(
      customerId: $customerId,
      addressId: $addressId
    ) {
      customer {
        id
        defaultAddress {
          id
          formatted
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
 * Mutation to update a customer's tax exemptions
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - taxExemptions: Array of tax exemption types (required)
 */
export const UPDATE_CUSTOMER_TAX_EXEMPTIONS = `
  mutation UpdateCustomerTaxExemptions(
    $customerId: ID!,
    $taxExemptions: [TaxExemption!]
  ) {
    customerTaxExemptionUpdate(
      customerId: $customerId,
      taxExemptions: $taxExemptions
    ) {
      customer {
        id
        taxExempt
        taxExemptions
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to create a customer metafield
 * 
 * Variables:
 * - customerId: Customer ID (required)
 * - namespace: Metafield namespace (required)
 * - key: Metafield key (required)
 * - value: Metafield value (required)
 * - type: Metafield type (required)
 */
export const CREATE_CUSTOMER_METAFIELD = `
  mutation CreateCustomerMetafield(
    $customerId: ID!,
    $namespace: String!,
    $key: String!,
    $value: String!,
    $type: String!
  ) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $customerId,
          namespace: $namespace,
          key: $key,
          value: $value,
          type: $type
        }
      ]
    ) {
      metafields {
        id
        namespace
        key
        value
        type
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to delete a customer metafield
 * 
 * Variables:
 * - id: Metafield ID (required)
 */
export const DELETE_CUSTOMER_METAFIELD = `
  mutation DeleteCustomerMetafield($id: ID!) {
    metafieldDelete(input: {
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
