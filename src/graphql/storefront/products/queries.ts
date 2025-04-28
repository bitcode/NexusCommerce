/**
 * Product queries for Storefront API
 * These queries are used to fetch product data from the Shopify Storefront API
 */

import {
  STOREFRONT_PRODUCT_BASIC_FRAGMENT,
  STOREFRONT_PRODUCT_COMPLETE_FRAGMENT
} from './fragments';

/**
 * Query to fetch a single product by handle
 * 
 * Variables:
 * - handle: Product handle (required)
 * - variantsFirst: Number of variants to fetch (optional, default: 50)
 * - mediaFirst: Number of media items to fetch (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 * - metafieldIdentifiers: Array of metafield identifiers (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_PRODUCT_BY_HANDLE = `#graphql
  query GetStorefrontProductByHandle(
    $handle: String!,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20,
    $metafieldIdentifiers: [HasMetafieldsIdentifier!],
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...StorefrontProductCompleteFields
    }
  }
  ${STOREFRONT_PRODUCT_COMPLETE_FRAGMENT}
`;

/**
 * Query to fetch a single product by ID
 * 
 * Variables:
 * - id: Product ID (required)
 * - variantsFirst: Number of variants to fetch (optional, default: 50)
 * - mediaFirst: Number of media items to fetch (optional, default: 20)
 * - metafieldsFirst: Number of metafields to fetch (optional, default: 20)
 * - metafieldIdentifiers: Array of metafield identifiers (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_PRODUCT_BY_ID = `#graphql
  query GetStorefrontProductById(
    $id: ID!,
    $variantsFirst: Int = 50,
    $mediaFirst: Int = 20,
    $metafieldsFirst: Int = 20,
    $metafieldIdentifiers: [HasMetafieldsIdentifier!],
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(id: $id) {
      ...StorefrontProductCompleteFields
    }
  }
  ${STOREFRONT_PRODUCT_COMPLETE_FRAGMENT}
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
 * - metafieldIdentifiers: Array of metafield identifiers (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_PRODUCTS = `#graphql
  query GetStorefrontProducts(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: ProductSortKeys,
    $reverse: Boolean,
    $variantsFirst: Int = 10,
    $mediaFirst: Int = 5,
    $metafieldsFirst: Int = 5,
    $metafieldIdentifiers: [HasMetafieldsIdentifier!],
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...StorefrontProductCompleteFields
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
  ${STOREFRONT_PRODUCT_COMPLETE_FRAGMENT}
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
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_PRODUCTS_BASIC = `#graphql
  query GetStorefrontProductsBasic(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: ProductSortKeys,
    $reverse: Boolean,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      after: $after,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      edges {
        node {
          ...StorefrontProductBasicFields
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
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
  ${STOREFRONT_PRODUCT_BASIC_FRAGMENT}
`;

/**
 * Query to fetch product recommendations
 * 
 * Variables:
 * - productId: Product ID to get recommendations for (required)
 * - first: Number of products to fetch (optional, default: 10)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_PRODUCT_RECOMMENDATIONS = `#graphql
  query GetStorefrontProductRecommendations(
    $productId: ID!,
    $first: Int = 10,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      ...StorefrontProductBasicFields
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
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
    }
  }
  ${STOREFRONT_PRODUCT_BASIC_FRAGMENT}
`;

/**
 * Query to fetch product variants for a specific product
 * 
 * Variables:
 * - handle: Product handle (required)
 * - first: Number of variants to fetch (required)
 * - after: Cursor for pagination (optional)
 * - country: Country code for pricing (optional)
 * - language: Language code (optional)
 */
export const GET_STOREFRONT_PRODUCT_VARIANTS = `#graphql
  query GetStorefrontProductVariants(
    $handle: String!,
    $first: Int!,
    $after: String,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      variants(first: $first, after: $after) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            requiresShipping
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
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
  }
`;
