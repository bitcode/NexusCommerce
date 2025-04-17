/**
 * MetaobjectQueries.ts
 * GraphQL query definitions for Shopify Storefront API metaobject operations.
 */

/**
 * Query to fetch metaobject definitions with pagination
 * 
 * Variables:
 * - first: Number of definitions to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const STOREFRONT_METAOBJECT_DEFINITIONS_QUERY = `#graphql
  query StorefrontMetaobjectDefinitions(
    $first: Int!,
    $after: String
  ) {
    metaobjectDefinitions(
      first: $first,
      after: $after
    ) {
      edges {
        node {
          id
          name
          type
          fieldDefinitions {
            name
            key
            type
            required
            description
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
 * Query to fetch metaobjects by type with pagination
 * 
 * Variables:
 * - type: Metaobject type (required)
 * - first: Number of metaobjects to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const STOREFRONT_METAOBJECTS_BY_TYPE_QUERY = `#graphql
  query StorefrontMetaobjectsByType(
    $type: String!,
    $first: Int!,
    $after: String
  ) {
    metaobjects(
      type: $type,
      first: $first,
      after: $after
    ) {
      edges {
        node {
          id
          handle
          type
          updatedAt
          fields {
            key
            value
            type
            reference {
              ... on Product {
                id
                title
                handle
              }
              ... on Collection {
                id
                title
                handle
              }
              ... on Metaobject {
                id
                handle
                type
              }
              ... on MediaImage {
                id
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
            references(first: 10) {
              edges {
                node {
                  ... on Product {
                    id
                    title
                    handle
                  }
                  ... on Collection {
                    id
                    title
                    handle
                  }
                  ... on Metaobject {
                    id
                    handle
                    type
                  }
                  ... on MediaImage {
                    id
                    image {
                      url
                      altText
                      width
                      height
                    }
                  }
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
    }
  }
`;

/**
 * Query to fetch a single metaobject by ID
 * 
 * Variables:
 * - id: Metaobject ID (required)
 */
export const STOREFRONT_METAOBJECT_BY_ID_QUERY = `#graphql
  query StorefrontMetaobjectById($id: ID!) {
    metaobject(id: $id) {
      id
      handle
      type
      updatedAt
      fields {
        key
        value
        type
        reference {
          ... on Product {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
          ... on Collection {
            id
            title
            handle
            image {
              url
              altText
            }
          }
          ... on Metaobject {
            id
            handle
            type
            fields {
              key
              value
            }
          }
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
        }
        references(first: 10) {
          edges {
            node {
              ... on Product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
              ... on Collection {
                id
                title
                handle
                image {
                  url
                  altText
                }
              }
              ... on Metaobject {
                id
                handle
                type
                fields {
                  key
                  value
                }
              }
              ... on MediaImage {
                id
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch a single metaobject by handle
 * 
 * Variables:
 * - handle: Metaobject handle (required)
 * - type: Metaobject type (required)
 */
export const STOREFRONT_METAOBJECT_BY_HANDLE_QUERY = `#graphql
  query StorefrontMetaobjectByHandle(
    $handle: String!,
    $type: String!
  ) {
    metaobjectByHandle(
      handle: $handle,
      type: $type
    ) {
      id
      handle
      type
      updatedAt
      fields {
        key
        value
        type
        reference {
          ... on Product {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
          ... on Collection {
            id
            title
            handle
            image {
              url
              altText
            }
          }
          ... on Metaobject {
            id
            handle
            type
            fields {
              key
              value
            }
          }
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
        }
        references(first: 10) {
          edges {
            node {
              ... on Product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
              ... on Collection {
                id
                title
                handle
                image {
                  url
                  altText
                }
              }
              ... on Metaobject {
                id
                handle
                type
                fields {
                  key
                  value
                }
              }
              ... on MediaImage {
                id
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch metaobjects by field value with pagination
 * 
 * Variables:
 * - type: Metaobject type (required)
 * - field: Field key to filter by (required)
 * - value: Field value to filter by (required)
 * - first: Number of metaobjects to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const STOREFRONT_METAOBJECTS_BY_FIELD_QUERY = `#graphql
  query StorefrontMetaobjectsByField(
    $type: String!,
    $field: String!,
    $value: String!,
    $first: Int!,
    $after: String
  ) {
    metaobjects(
      type: $type,
      first: $first,
      after: $after,
      filters: {
        field: $field,
        value: $value
      }
    ) {
      edges {
        node {
          id
          handle
          type
          updatedAt
          fields {
            key
            value
            type
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