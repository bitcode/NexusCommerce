/**
 * Collection fragments for Storefront API
 * These fragments define reusable parts of GraphQL queries for collections
 */

/**
 * Basic collection fields fragment
 */
export const STOREFRONT_COLLECTION_BASIC_FRAGMENT = `
  fragment StorefrontCollectionBasicFields on Collection {
    id
    title
    handle
    description
    descriptionHtml
    updatedAt
  }
`;

/**
 * Collection products fragment
 */
export const STOREFRONT_COLLECTION_PRODUCTS_FRAGMENT = `
  fragment StorefrontCollectionProductsFields on Collection {
    products(first: $productsFirst, after: $productsAfter, sortKey: $productsSortKey, reverse: $productsReverse) {
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
        endCursor
      }
    }
  }
`;

/**
 * Collection image fragment
 */
export const STOREFRONT_COLLECTION_IMAGE_FRAGMENT = `
  fragment StorefrontCollectionImageFields on Collection {
    image {
      id
      url
      altText
      width
      height
    }
  }
`;

/**
 * Collection metafields fragment
 */
export const STOREFRONT_COLLECTION_METAFIELDS_FRAGMENT = `
  fragment StorefrontCollectionMetafieldsFields on Collection {
    metafields(first: $metafieldsFirst, identifiers: $metafieldIdentifiers) {
      edges {
        node {
          id
          namespace
          key
          value
          type
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
 * Complete collection fragment combining all fragments
 */
export const STOREFRONT_COLLECTION_COMPLETE_FRAGMENT = `
  fragment StorefrontCollectionCompleteFields on Collection {
    ...StorefrontCollectionBasicFields
    ...StorefrontCollectionProductsFields
    ...StorefrontCollectionImageFields
    ...StorefrontCollectionMetafieldsFields
    seo {
      title
      description
    }
    handle
    updatedAt
  }
  ${STOREFRONT_COLLECTION_BASIC_FRAGMENT}
  ${STOREFRONT_COLLECTION_PRODUCTS_FRAGMENT}
  ${STOREFRONT_COLLECTION_IMAGE_FRAGMENT}
  ${STOREFRONT_COLLECTION_METAFIELDS_FRAGMENT}
`;
