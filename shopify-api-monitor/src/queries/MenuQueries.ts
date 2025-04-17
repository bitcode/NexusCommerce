/**
 * MenuQueries.ts
 * GraphQL query definitions for Shopify Storefront API menu operations.
 */

/**
 * Query to fetch multiple menus with pagination
 * 
 * Variables:
 * - first: Number of menus to fetch (required)
 * - after: Cursor for pagination (optional)
 */
export const STOREFRONT_MENUS_QUERY = `#graphql
  query StorefrontMenus(
    $first: Int!,
    $after: String
  ) {
    menus(
      first: $first,
      after: $after
    ) {
      edges {
        node {
          id
          handle
          title
          items {
            id
            title
            url
            type
            items {
              id
              title
              url
              type
              items {
                id
                title
                url
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
 * Query to fetch a single menu by ID
 * 
 * Variables:
 * - id: Menu ID (required)
 */
export const STOREFRONT_MENU_BY_ID_QUERY = `#graphql
  query StorefrontMenuById($id: ID!) {
    menu(id: $id) {
      id
      handle
      title
      items {
        id
        title
        url
        type
        resourceId
        items {
          id
          title
          url
          type
          resourceId
          items {
            id
            title
            url
            type
            resourceId
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch a single menu by handle
 * 
 * Variables:
 * - handle: Menu handle (required)
 */
export const STOREFRONT_MENU_BY_HANDLE_QUERY = `#graphql
  query StorefrontMenuByHandle($handle: String!) {
    menuByHandle(handle: $handle) {
      id
      handle
      title
      items {
        id
        title
        url
        type
        resourceId
        items {
          id
          title
          url
          type
          resourceId
          items {
            id
            title
            url
            type
            resourceId
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch shop navigation menus
 */
export const STOREFRONT_SHOP_NAVIGATION_QUERY = `#graphql
  query StorefrontShopNavigation {
    shop {
      id
      name
      primaryDomain {
        url
        host
      }
      brand {
        logo {
          image {
            url
          }
        }
      }
      navigationMenu: menu(handle: "main-menu") {
        id
        handle
        title
        items {
          id
          title
          url
          type
          items {
            id
            title
            url
            type
          }
        }
      }
      footerMenu: menu(handle: "footer") {
        id
        handle
        title
        items {
          id
          title
          url
          type
        }
      }
    }
  }
`;

/**
 * Query to fetch menu items with resource information
 * 
 * Variables:
 * - handle: Menu handle (required)
 */
export const STOREFRONT_MENU_WITH_RESOURCES_QUERY = `#graphql
  query StorefrontMenuWithResources($handle: String!) {
    menuByHandle(handle: $handle) {
      id
      handle
      title
      items {
        id
        title
        url
        type
        resourceId
        resource {
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
          ... on Page {
            id
            title
            handle
          }
          ... on Blog {
            id
            title
            handle
          }
          ... on Article {
            id
            title
            handle
            blog {
              handle
            }
          }
        }
        items {
          id
          title
          url
          type
          resourceId
          resource {
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
            ... on Page {
              id
              title
              handle
            }
            ... on Blog {
              id
              title
              handle
            }
            ... on Article {
              id
              title
              handle
              blog {
                handle
              }
            }
          }
          items {
            id
            title
            url
            type
            resourceId
          }
        }
      }
    }
  }
`;

/**
 * Query to fetch shop information with menus
 */
export const STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY = `#graphql
  query StorefrontShopInfoWithMenus {
    shop {
      name
      description
      primaryDomain {
        url
        host
      }
      brand {
        logo {
          image {
            url
          }
        }
        colors {
          primary {
            background
            foreground
          }
          secondary {
            background
            foreground
          }
        }
      }
      paymentSettings {
        acceptedCardBrands
        supportedDigitalWallets
      }
      shippingSettings {
        countryCode
      }
      primaryDomain {
        url
        host
      }
      navigationMenu: menu(handle: "main-menu") {
        id
        handle
        title
        items {
          id
          title
          url
          type
          items {
            id
            title
            url
            type
          }
        }
      }
      footerMenu: menu(handle: "footer") {
        id
        handle
        title
        items {
          id
          title
          url
          type
        }
      }
    }
  }
`;