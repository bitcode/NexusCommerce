/**
 * Product queries for Admin API
 * These queries are used to fetch product data from the Shopify Admin API
 */

import {
  PRODUCT_BASIC_FRAGMENT,
  PRODUCT_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Query to fetch a single product by ID
 * 
 * Variables:
 * - id: Product ID (required)
 * - variantsFirst: Number of variants to fetch (optional, default: 50)
 * - mediaFirst: Number of media items to fetch (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 */
export const GET_PRODUCT = `
  query GetProduct(
    $id: ID!,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    product(id: $id) {
      ...ProductCompleteFields
    }
  }
  ${PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a product by identifier (handle, ID, etc.)
 * 
 * Variables:
 * - handle: Product handle (required)
 * - variantsFirst: Number of variants to fetch (optional, default: 50)
 * - mediaFirst: Number of media items to fetch (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 */
export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle(
    $handle: String!,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20
  ) {
    productByHandle(handle: $handle) {
      ...ProductCompleteFields
    }
  }
  ${PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch multiple products with pagination
 * 
 * Variables:
 * - first: Number of products to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 * - variantsFirst: Number of variants to fetch (optional, default: 10)
 * - mediaFirst: Number of media items to fetch (optional, default: 5)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 5)
 */
export const GET_PRODUCTS = `
  query GetProducts(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: ProductSortKeys,
    $reverse: Boolean,
    $variantsFirst: Int = 10,
    $mediaFirst: Int = 5,
    $metafieldsFirst: Int = 5
  ) {
    products(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...ProductCompleteFields
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
  ${PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a list of products with basic information
 * Optimized for listing pages where complete details aren't needed
 * 
 * Variables:
 * - first: Number of products to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const GET_PRODUCTS_BASIC = `
  query GetProductsBasic(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: ProductSortKeys,
    $reverse: Boolean
  ) {
    products(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...ProductBasicFields
          featuredImage {
            id
            url
            altText
          }
          totalVariants
          hasOnlyDefaultVariant
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
  ${PRODUCT_BASIC_FRAGMENT}
`;

/**
 * Query to fetch product variants for a specific product
 * 
 * Variables:
 * - productId: Product ID (required)
 * - first: Number of variants to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const GET_PRODUCT_VARIANTS = `
  query GetProductVariants(
    $productId: ID!,
    $first: Int!,
    $after: String
  ) {
    product(id: $productId) {
      id
      title
      variants(first: $first, after: $after) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            inventoryPolicy
            inventoryManagement
            requiresShipping
            taxable
            weight
            weightUnit
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
            }
            position
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

/**
 * Query to fetch product media for a specific product
 * 
 * Variables:
 * - productId: Product ID (required)
 * - first: Number of media items to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const GET_PRODUCT_MEDIA = `
  query GetProductMedia(
    $productId: ID!,
    $first: Int!,
    $after: String
  ) {
    product(id: $productId) {
      id
      title
      media(first: $first, after: $after) {
        edges {
          node {
            id
            mediaContentType
            alt
            ... on MediaImage {
              image {
                id
                url
                altText
                width
                height
              }
            }
            ... on Video {
              sources {
                url
                mimeType
                format
                height
                width
              }
              originalSource {
                url
                mimeType
                format
                height
                width
              }
            }
            ... on ExternalVideo {
              embeddedUrl
            }
            ... on Model3d {
              sources {
                url
                mimeType
                format
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
 * Query to fetch product metafields for a specific product
 * 
 * Variables:
 * - productId: Product ID (required)
 * - first: Number of metafields to fetch (required)
 * - after: Cursor for pagination (optional)
 * - namespace: Metafield namespace filter (optional)
 * - key: Metafield key filter (optional)
 */
export const GET_PRODUCT_METAFIELDS = `
  query GetProductMetafields(
    $productId: ID!,
    $first: Int!,
    $after: String,
    $namespace: String,
    $key: String
  ) {
    product(id: $productId) {
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
