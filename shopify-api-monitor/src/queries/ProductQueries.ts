/**
 * ProductQueries.ts
 * GraphQL query definitions for Shopify Storefront API product operations.
 */

/**
 * Query to fetch multiple products with pagination
 * 
 * Variables:
 * - first: Number of products to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query for filtering products (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const STOREFRONT_PRODUCTS_QUERY = `#graphql
  query StorefrontProducts(
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
          id
          title
          description
          descriptionHtml
          handle
          productType
          tags
          vendor
          availableForSale
          createdAt
          updatedAt
          publishedAt
          onlineStoreUrl
          options {
            id
            name
            values
          }
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
          variants(first: 250) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                quantityAvailable
                requiresShipping
                selectedOptions {
                  name
                  value
                }
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
                unitPrice {
                  amount
                  currencyCode
                }
                unitPriceMeasurement {
                  measuredType
                  quantityUnit
                  quantityValue
                  referenceUnit
                  referenceValue
                }
              }
            }
          }
          images(first: 20) {
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
 * Query to fetch a single product by ID
 * 
 * Variables:
 * - id: Product ID (required)
 */
export const STOREFRONT_PRODUCT_BY_ID_QUERY = `#graphql
  query StorefrontProductById($id: ID!) {
    product(id: $id) {
      id
      title
      description
      descriptionHtml
      handle
      productType
      tags
      vendor
      availableForSale
      createdAt
      updatedAt
      publishedAt
      onlineStoreUrl
      options {
        id
        name
        values
      }
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
      variants(first: 250) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            requiresShipping
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              id
              url
              altText
              width
              height
            }
            unitPrice {
              amount
              currencyCode
            }
            unitPriceMeasurement {
              measuredType
              quantityUnit
              quantityValue
              referenceUnit
              referenceValue
            }
          }
        }
      }
      images(first: 20) {
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
 * Query to fetch a single product by handle
 * 
 * Variables:
 * - handle: Product handle (required)
 */
export const STOREFRONT_PRODUCT_BY_HANDLE_QUERY = `#graphql
  query StorefrontProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      productType
      tags
      vendor
      availableForSale
      createdAt
      updatedAt
      publishedAt
      onlineStoreUrl
      options {
        id
        name
        values
      }
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
      variants(first: 250) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            requiresShipping
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              id
              url
              altText
              width
              height
            }
            unitPrice {
              amount
              currencyCode
            }
            unitPriceMeasurement {
              measuredType
              quantityUnit
              quantityValue
              referenceUnit
              referenceValue
            }
          }
        }
      }
      images(first: 20) {
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
 * Query to fetch product recommendations
 * 
 * Variables:
 * - productId: Product ID to get recommendations for (required)
 */
export const STOREFRONT_PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query StorefrontProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      productType
      priceRange {
        minVariantPrice {
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
          }
        }
      }
      availableForSale
    }
  }
`;

/**
 * Query to fetch product variants by product ID
 * 
 * Variables:
 * - productId: Product ID (required)
 * - first: Number of variants to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const STOREFRONT_PRODUCT_VARIANTS_QUERY = `#graphql
  query StorefrontProductVariants($productId: ID!, $first: Int!, $after: String) {
    product(id: $productId) {
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
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              id
              url
              altText
              width
              height
            }
            unitPrice {
              amount
              currencyCode
            }
            unitPriceMeasurement {
              measuredType
              quantityUnit
              quantityValue
              referenceUnit
              referenceValue
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;