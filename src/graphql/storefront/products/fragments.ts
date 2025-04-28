/**
 * Product fragments for Storefront API
 * These fragments define reusable parts of GraphQL queries for products
 */

/**
 * Basic product fields fragment
 */
export const STOREFRONT_PRODUCT_BASIC_FRAGMENT = `
  fragment StorefrontProductBasicFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    createdAt
    updatedAt
  }
`;

/**
 * Product price range fragment
 */
export const STOREFRONT_PRODUCT_PRICE_FRAGMENT = `
  fragment StorefrontProductPriceFields on Product {
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
  }
`;

/**
 * Product options fragment
 */
export const STOREFRONT_PRODUCT_OPTIONS_FRAGMENT = `
  fragment StorefrontProductOptionsFields on Product {
    options {
      id
      name
      values
    }
  }
`;

/**
 * Product variants fragment
 */
export const STOREFRONT_PRODUCT_VARIANTS_FRAGMENT = `
  fragment StorefrontProductVariantsFields on Product {
    variants(first: $variantsFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Product media fragment
 */
export const STOREFRONT_PRODUCT_MEDIA_FRAGMENT = `
  fragment StorefrontProductMediaFields on Product {
    media(first: $mediaFirst) {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Product metafields fragment
 */
export const STOREFRONT_PRODUCT_METAFIELDS_FRAGMENT = `
  fragment StorefrontProductMetafieldsFields on Product {
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
 * Complete product fragment combining all fragments
 */
export const STOREFRONT_PRODUCT_COMPLETE_FRAGMENT = `
  fragment StorefrontProductCompleteFields on Product {
    ...StorefrontProductBasicFields
    ...StorefrontProductPriceFields
    ...StorefrontProductOptionsFields
    ...StorefrontProductVariantsFields
    ...StorefrontProductMediaFields
    ...StorefrontProductMetafieldsFields
    onlineStoreUrl
    seo {
      title
      description
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  ${STOREFRONT_PRODUCT_BASIC_FRAGMENT}
  ${STOREFRONT_PRODUCT_PRICE_FRAGMENT}
  ${STOREFRONT_PRODUCT_OPTIONS_FRAGMENT}
  ${STOREFRONT_PRODUCT_VARIANTS_FRAGMENT}
  ${STOREFRONT_PRODUCT_MEDIA_FRAGMENT}
  ${STOREFRONT_PRODUCT_METAFIELDS_FRAGMENT}
`;
