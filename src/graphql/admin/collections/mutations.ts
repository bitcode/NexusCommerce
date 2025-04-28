/**
 * Collection mutations for Admin API
 * These mutations are used to create, update, and delete collections in the Shopify Admin API
 */

import {
  COLLECTION_BASIC_FRAGMENT,
  COLLECTION_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Mutation to create a new collection
 * 
 * Variables:
 * - input: CollectionInput object with collection details (required)
 * - productsFirst: Number of products to fetch in response (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const CREATE_COLLECTION = `
  mutation CreateCollection(
    $input: CollectionInput!,
    $productsFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    collectionCreate(input: $input) {
      collection {
        ...CollectionCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to update an existing collection
 * 
 * Variables:
 * - id: Collection ID (required)
 * - input: CollectionInput object with collection details (required)
 * - productsFirst: Number of products to fetch in response (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch in response (optional, default: 20)
 */
export const UPDATE_COLLECTION = `
  mutation UpdateCollection(
    $id: ID!,
    $input: CollectionInput!,
    $productsFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    collectionUpdate(input: {
      id: $id,
      ...($input)
    }) {
      collection {
        ...CollectionCompleteFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Mutation to delete a collection
 * 
 * Variables:
 * - id: Collection ID (required)
 */
export const DELETE_COLLECTION = `
  mutation DeleteCollection($id: ID!) {
    collectionDelete(input: {
      id: $id
    }) {
      deletedCollectionId
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to add products to a collection
 * 
 * Variables:
 * - id: Collection ID (required)
 * - productIds: Array of product IDs to add (required)
 */
export const ADD_PRODUCTS_TO_COLLECTION = `
  mutation AddProductsToCollection(
    $id: ID!,
    $productIds: [ID!]!
  ) {
    collectionAddProducts(
      id: $id,
      productIds: $productIds
    ) {
      collection {
        id
        title
        productsCount
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to remove products from a collection
 * 
 * Variables:
 * - id: Collection ID (required)
 * - productIds: Array of product IDs to remove (required)
 */
export const REMOVE_PRODUCTS_FROM_COLLECTION = `
  mutation RemoveProductsFromCollection(
    $id: ID!,
    $productIds: [ID!]!
  ) {
    collectionRemoveProducts(
      id: $id,
      productIds: $productIds
    ) {
      collection {
        id
        title
        productsCount
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to reorder products in a collection
 * 
 * Variables:
 * - id: Collection ID (required)
 * - moves: Array of product moves (required)
 */
export const REORDER_PRODUCTS_IN_COLLECTION = `
  mutation ReorderProductsInCollection(
    $id: ID!,
    $moves: [MoveInput!]!
  ) {
    collectionReorderProducts(
      id: $id,
      moves: $moves
    ) {
      collection {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to publish a collection
 * 
 * Variables:
 * - id: Collection ID (required)
 */
export const PUBLISH_COLLECTION = `
  mutation PublishCollection($id: ID!) {
    collectionPublish(input: {
      id: $id
    }) {
      collection {
        id
        title
        publishedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Mutation to unpublish a collection
 * 
 * Variables:
 * - id: Collection ID (required)
 */
export const UNPUBLISH_COLLECTION = `
  mutation UnpublishCollection($id: ID!) {
    collectionUnpublish(input: {
      id: $id
    }) {
      collection {
        id
        title
        publishedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;
