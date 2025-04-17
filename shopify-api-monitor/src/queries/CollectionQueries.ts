/**
 * CollectionQueries.ts
 * GraphQL query definitions for Shopify Storefront API collection operations.
 */

/**
 * Query to fetch multiple collections with pagination
 * 
 * Variables:
 * - first: Number of collections to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query for filtering collections (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const STOREFRONT_COLLECTIONS_QUERY = `#graphql
  query StorefrontCollections(
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
          id
          title
          description
          descriptionHtml
          handle
          updatedAt
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 5) {
            edges {
              node {
                id
                title
                handle
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
          seo {
            title
            description
          }
          metafields(first: 10) {
            edges {
              node {
                id
                namespace
                key
                value
                type
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
 * Query to fetch a single collection by ID
 * 
 * Variables:
 * - id: Collection ID (required)
 * - productsFirst: Number of products to fetch (required)
 * - productsAfter: Cursor for products pagination (optional)
 */
export const STOREFRONT_COLLECTION_BY_ID_QUERY = `#graphql
  query StorefrontCollectionById(
    $id: ID!,
    $productsFirst: Int!,
    $productsAfter: String
  ) {
    collection(id: $id) {
      id
      title
      description
      descriptionHtml
      handle
      updatedAt
      image {
        id
        url
        altText
        width
        height
      }
      products(first: $productsFirst, after: $productsAfter) {
        edges {
          node {
            id
            title
            description
            handle
            productType
            tags
            vendor
            availableForSale
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
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
      seo {
        title
        description
      }
      metafields(first: 10) {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch a single collection by handle
 * 
 * Variables:
 * - handle: Collection handle (required)
 * - productsFirst: Number of products to fetch (required)
 * - productsAfter: Cursor for products pagination (optional)
 */
export const STOREFRONT_COLLECTION_BY_HANDLE_QUERY = `#graphql
  query StorefrontCollectionByHandle(
    $handle: String!,
    $productsFirst: Int!,
    $productsAfter: String
  ) {
    collectionByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      updatedAt
      image {
        id
        url
        altText
        width
        height
      }
      products(first: $productsFirst, after: $productsAfter) {
        edges {
          node {
            id
            title
            description
            handle
            productType
            tags
            vendor
            availableForSale
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
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
      seo {
        title
        description
      }
      metafields(first: 10) {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch products by collection ID with pagination
 * 
 * Variables:
 * - collectionId: Collection ID (required)
 * - first: Number of products to fetch (required)
 * - after: Cursor for pagination (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY = `#graphql
  query StorefrontProductsByCollection(
    $collectionId: ID!,
    $first: Int!,
    $after: String,
    $sortKey: ProductCollectionSortKeys,
    $reverse: Boolean
  ) {
    collection(id: $collectionId) {
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
            description
            handle
            productType
            tags
            vendor
            availableForSale
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
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
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
        totalCount
      }
    }
  }
`;

/**
 * Query to fetch featured collections
 * 
 * Variables:
 * - first: Number of collections to fetch (required)
 */
export const STOREFRONT_FEATURED_COLLECTIONS_QUERY = `#graphql
  query StorefrontFeaturedCollections($first: Int!) {
    collections(first: $first, query: "featured") {
      edges {
        node {
          id
          title
          description
          handle
          image {
            id
            url
            altText
          }
          products(first: 1) {
            totalCount
          }
        }
      }
    }
  }
`;