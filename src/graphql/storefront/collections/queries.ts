/**
 * Collection queries for Storefront API
 * These queries are used to fetch collection data from the Shopify Storefront API
 */

import {
  STOREFRONT_COLLECTION_BASIC_FRAGMENT,
  STOREFRONT_COLLECTION_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Query to fetch a single collection by handle
 * 
 * Variables:
 * - handle: Collection handle (required)
 * - productsFirst: Number of products to fetch (optional, default: 20)
 * - productsAfter: Cursor for products pagination (optional)
 * - productsSortKey: Field to sort products by (optional)
 * - productsReverse: Whether to reverse the product sort order (optional)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 * - metafieldIdentifiers: Array of metafield identifiers (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_COLLECTION_BY_HANDLE = `#graphql
  query GetStorefrontCollectionByHandle(
    $handle: String!,
    $productsFirst: Int = 20,
    $productsAfter: String,
    $productsSortKey: ProductCollectionSortKeys,
    $productsReverse: Boolean,
    $metafieldsFirst: Int = 20,
    $metafieldIdentifiers: [HasMetafieldsIdentifier!],
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...StorefrontCollectionCompleteFields
    }
  }
  ${STOREFRONT_COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a single collection by ID
 * 
 * Variables:
 * - id: Collection ID (required)
 * - productsFirst: Number of products to fetch (optional, default: 20)
 * - productsAfter: Cursor for products pagination (optional)
 * - productsSortKey: Field to sort products by (optional)
 * - productsReverse: Whether to reverse the product sort order (optional)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 * - metafieldIdentifiers: Array of metafield identifiers (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_COLLECTION_BY_ID = `#graphql
  query GetStorefrontCollectionById(
    $id: ID!,
    $productsFirst: Int = 20,
    $productsAfter: String,
    $productsSortKey: ProductCollectionSortKeys,
    $productsReverse: Boolean,
    $metafieldsFirst: Int = 20,
    $metafieldIdentifiers: [HasMetafieldsIdentifier!],
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(id: $id) {
      ...StorefrontCollectionCompleteFields
    }
  }
  ${STOREFRONT_COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch multiple collections with pagination
 * 
 * Variables:
 * - first: Number of collections to fetch (required)
 * - after: Cursor for pagination (optional)
 * - productsFirst: Number of products to fetch (optional, default: 5)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 5)
 * - metafieldIdentifiers: Array of metafield identifiers (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_COLLECTIONS = `#graphql
  query GetStorefrontCollections(
    $first: Int!,
    $after: String,
    $productsFirst: Int = 5,
    $metafieldsFirst: Int = 5,
    $metafieldIdentifiers: [HasMetafieldsIdentifier!],
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      after: $after
    ) {
      edges {
        node {
          ...StorefrontCollectionCompleteFields
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
  ${STOREFRONT_COLLECTION_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a list of collections with basic information
 * Optimized for listing pages where complete details aren't needed
 * 
 * Variables:
 * - first: Number of collections to fetch (required)
 * - after: Cursor for pagination (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_COLLECTIONS_BASIC = `#graphql
  query GetStorefrontCollectionsBasic(
    $first: Int!,
    $after: String,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      after: $after
    ) {
      edges {
        node {
          ...StorefrontCollectionBasicFields
          image {
            id
            url
            altText
            width
            height
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
  ${STOREFRONT_COLLECTION_BASIC_FRAGMENT}
`;

/**
 * Query to fetch products in a collection with pagination
 * 
 * Variables:
 * - handle: Collection handle (required)
 * - first: Number of products to fetch (required)
 * - after: Cursor for pagination (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_COLLECTION_PRODUCTS = `#graphql
  query GetStorefrontCollectionProducts(
    $handle: String!,
    $first: Int!,
    $after: String,
    $sortKey: ProductCollectionSortKeys,
    $reverse: Boolean,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
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
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              id
              url
              altText
              width
              height
            }
            availableForSale
            vendor
            productType
            tags
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
