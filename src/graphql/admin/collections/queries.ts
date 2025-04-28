/**
 * Collection queries for Admin API
 * These queries are used to fetch collection data from the Shopify Admin API
 */

import {
  COLLECTION_BASIC_FRAGMENT,
  COLLECTION_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Query to fetch a single collection by ID
 * 
 * Variables:
 * - id: Collection ID (required)
 * - productsFirst: Number of products to fetch (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 */
export const GET_COLLECTION = `
  query GetCollection(
    $id: ID!,
    $productsFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    collection(id: $id) {
      ...CollectionCompleteFields
    }
  }
  ${COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch multiple collections with pagination
 * 
 * Variables:
 * - first: Number of collections to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 * - productsFirst: Number of products to fetch (optional, default: 5)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 5)
 */
export const GET_COLLECTIONS = `
  query GetCollections(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: CollectionSortKeys,
    $reverse: Boolean,
    $productsFirst: Int = 5,
    $metafieldsFirst: Int = 5
  ) {
    collections(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...CollectionCompleteFields
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
  ${COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a list of collections with basic information
 * Optimized for listing pages where complete details aren't needed
 * 
 * Variables:
 * - first: Number of collections to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_COLLECTIONS_BASIC = `
  query GetCollectionsBasic(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: CollectionSortKeys,
    $reverse: Boolean
  ) {
    collections(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...CollectionBasicFields
          image {
            id
            url
            altText
          }
          productsCount
          publishedAt
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
  ${COLLECTION_BASIC_FRAGMENT}
`;

/**
 * Query to fetch products in a collection with pagination
 * 
 * Variables:
 * - collectionId: Collection ID (required)
 * - first: Number of products to fetch (required)
 * - after: Cursor for pagination (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_COLLECTION_PRODUCTS = `
  query GetCollectionProducts(
    $collectionId: ID!,
    $first: Int!,
    $after: String,
    $sortKey: ProductCollectionSortKeys,
    $reverse: Boolean
  ) {
    collection(id: $collectionId) {
      id
      title
      products(
        first: $first,
        after: $after,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            featuredImage {
              id
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                  compareAtPrice
                }
              }
            }
            status
            publishedAt
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
 * Query to fetch collection metafields
 * 
 * Variables:
 * - collectionId: Collection ID (required)
 * - first: Number of metafields to fetch (required)
 * - after: Cursor for pagination (optional)
 * - namespace: Metafield namespace filter (optional)
 * - key: Metafield key filter (optional)
 */
export const GET_COLLECTION_METAFIELDS = `
  query GetCollectionMetafields(
    $collectionId: ID!,
    $first: Int!,
    $after: String,
    $namespace: String,
    $key: String
  ) {
    collection(id: $collectionId) {
      id
      title
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
