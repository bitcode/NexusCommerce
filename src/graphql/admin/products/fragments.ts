/**
 * Product fragments for Admin API
 * These fragments define reusable parts of GraphQL queries for products
 */

/**
 * Basic product fields fragment
 */
export const PRODUCT_BASIC_FRAGMENT = `
  fragment ProductBasicFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    productType
    vendor
    status
    tags
    createdAt
    updatedAt
  }
`;

/**
 * Product options fragment
 */
export const PRODUCT_OPTIONS_FRAGMENT = `
  fragment ProductOptionsFields on Product {
    options {
      id
      name
      position
      values
    }
  }
`;

/**
 * Product variants fragment
 */
export const PRODUCT_VARIANTS_FRAGMENT = `
  fragment ProductVariantsFields on Product {
    variants(first: $variantsFirst) {
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
            width
            height
          }
          position
          createdAt
          updatedAt
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
export const PRODUCT_MEDIA_FRAGMENT = `
  fragment ProductMediaFields on Product {
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
export const PRODUCT_METAFIELDS_FRAGMENT = `
  fragment ProductMetafieldsFields on Product {
    metafields(first: $metafieldsFirst) {
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
export const PRODUCT_COMPLETE_FRAGMENT = `
  fragment ProductCompleteFields on Product {
    ...ProductBasicFields
    ...ProductOptionsFields
    ...ProductVariantsFields
    ...ProductMediaFields
    ...ProductMetafieldsFields
    onlineStoreUrl
    onlineStorePreviewUrl
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
    hasOnlyDefaultVariant
    publishedAt
    templateSuffix
  }
  ${PRODUCT_BASIC_FRAGMENT}
  ${PRODUCT_OPTIONS_FRAGMENT}
  ${PRODUCT_VARIANTS_FRAGMENT}
  ${PRODUCT_MEDIA_FRAGMENT}
  ${PRODUCT_METAFIELDS_FRAGMENT}
`;
