/**
 * Collection fragments for Admin API
 * These fragments define reusable parts of GraphQL queries for collections
 */

/**
 * Basic collection fields fragment
 */
export const COLLECTION_BASIC_FRAGMENT = `
  fragment CollectionBasicFields on Collection {
    id
    title
    handle
    description
    descriptionHtml
    updatedAt
    ruleSet {
      appliedDisjunctively
      rules {
        column
        condition
        relation
      }
    }
    sortOrder
  }
`;

/**
 * Collection products fragment
 */
export const COLLECTION_PRODUCTS_FRAGMENT = `
  fragment CollectionProductsFields on Collection {
    products(first: $productsFirst) {
      edges {
        node {
          id
          title
          handle
          featuredImage {
            id
            url
            altText
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
 * Collection image fragment
 */
export const COLLECTION_IMAGE_FRAGMENT = `
  fragment CollectionImageFields on Collection {
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
export const COLLECTION_METAFIELDS_FRAGMENT = `
  fragment CollectionMetafieldsFields on Collection {
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
 * Complete collection fragment combining all fragments
 */
export const COLLECTION_COMPLETE_FRAGMENT = `
  fragment CollectionCompleteFields on Collection {
    ...CollectionBasicFields
    ...CollectionProductsFields
    ...CollectionImageFields
    ...CollectionMetafieldsFields
    seo {
      title
      description
    }
    templateSuffix
    handle
    updatedAt
    productsCount
    sortOrder
    publishedOnCurrentPublication
    publishedAt
  }
  ${COLLECTION_BASIC_FRAGMENT}
  ${COLLECTION_PRODUCTS_FRAGMENT}
  ${COLLECTION_IMAGE_FRAGMENT}
  ${COLLECTION_METAFIELDS_FRAGMENT}
`;
