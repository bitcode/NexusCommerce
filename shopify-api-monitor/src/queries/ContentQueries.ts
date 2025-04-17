/**
 * ContentQueries.ts
 * GraphQL query definitions for Shopify Storefront API content operations (pages, blogs, articles).
 */

/**
 * Query to fetch multiple pages with pagination
 * 
 * Variables:
 * - first: Number of pages to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query for filtering pages (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const STOREFRONT_PAGES_QUERY = `#graphql
  query StorefrontPages(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: PageSortKeys,
    $reverse: Boolean
  ) {
    pages(
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
          handle
          bodySummary
          body
          createdAt
          updatedAt
          onlineStoreUrl
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
 * Query to fetch a single page by ID
 * 
 * Variables:
 * - id: Page ID (required)
 */
export const STOREFRONT_PAGE_BY_ID_QUERY = `#graphql
  query StorefrontPageById($id: ID!) {
    page(id: $id) {
      id
      title
      handle
      bodySummary
      body
      createdAt
      updatedAt
      onlineStoreUrl
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
 * Query to fetch a single page by handle
 * 
 * Variables:
 * - handle: Page handle (required)
 */
export const STOREFRONT_PAGE_BY_HANDLE_QUERY = `#graphql
  query StorefrontPageByHandle($handle: String!) {
    pageByHandle(handle: $handle) {
      id
      title
      handle
      bodySummary
      body
      createdAt
      updatedAt
      onlineStoreUrl
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
 * Query to fetch multiple blogs with pagination
 * 
 * Variables:
 * - first: Number of blogs to fetch (required)
 * - after: Cursor for pagination (optional)
 * - query: Search query for filtering blogs (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const STOREFRONT_BLOGS_QUERY = `#graphql
  query StorefrontBlogs(
    $first: Int!,
    $after: String,
    $query: String,
    $sortKey: BlogSortKeys,
    $reverse: Boolean
  ) {
    blogs(
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
          handle
          onlineStoreUrl
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
          articles(first: 5) {
            edges {
              node {
                id
                title
                handle
                publishedAt
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Query to fetch a single blog by ID
 * 
 * Variables:
 * - id: Blog ID (required)
 * - articlesFirst: Number of articles to fetch (required)
 * - articlesAfter: Cursor for articles pagination (optional)
 */
export const STOREFRONT_BLOG_BY_ID_QUERY = `#graphql
  query StorefrontBlogById(
    $id: ID!,
    $articlesFirst: Int!,
    $articlesAfter: String
  ) {
    blog(id: $id) {
      id
      title
      handle
      onlineStoreUrl
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
      articles(first: $articlesFirst, after: $articlesAfter) {
        edges {
          node {
            id
            title
            handle
            excerpt
            content
            contentHtml
            publishedAt
            onlineStoreUrl
            author {
              firstName
              lastName
              name
              email
              bio
            }
            image {
              id
              url
              altText
              width
              height
            }
            seo {
              title
              description
            }
            tags
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
        totalCount
      }
    }
  }
`;

/**
 * Query to fetch a single blog by handle
 * 
 * Variables:
 * - handle: Blog handle (required)
 * - articlesFirst: Number of articles to fetch (required)
 * - articlesAfter: Cursor for articles pagination (optional)
 */
export const STOREFRONT_BLOG_BY_HANDLE_QUERY = `#graphql
  query StorefrontBlogByHandle(
    $handle: String!,
    $articlesFirst: Int!,
    $articlesAfter: String
  ) {
    blogByHandle(handle: $handle) {
      id
      title
      handle
      onlineStoreUrl
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
      articles(first: $articlesFirst, after: $articlesAfter) {
        edges {
          node {
            id
            title
            handle
            excerpt
            content
            contentHtml
            publishedAt
            onlineStoreUrl
            author {
              firstName
              lastName
              name
              email
              bio
            }
            image {
              id
              url
              altText
              width
              height
            }
            seo {
              title
              description
            }
            tags
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
        totalCount
      }
    }
  }
`;

/**
 * Query to fetch articles by blog ID with pagination
 * 
 * Variables:
 * - blogId: Blog ID (required)
 * - first: Number of articles to fetch (required)
 * - after: Cursor for pagination (optional)
 * - sortKey: Field to sort by (optional)
 * - reverse: Whether to reverse the sort order (optional)
 */
export const STOREFRONT_ARTICLES_BY_BLOG_QUERY = `#graphql
  query StorefrontArticlesByBlog(
    $blogId: ID!,
    $first: Int!,
    $after: String,
    $sortKey: ArticleSortKeys,
    $reverse: Boolean
  ) {
    blog(id: $blogId) {
      id
      title
      handle
      articles(
        first: $first,
        after: $after,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        edges {
          node {
            id
            title
            handle
            excerpt
            content
            contentHtml
            publishedAt
            onlineStoreUrl
            author {
              firstName
              lastName
              name
              email
              bio
            }
            image {
              id
              url
              altText
              width
              height
            }
            seo {
              title
              description
            }
            tags
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
 * Query to fetch a single article by ID
 * 
 * Variables:
 * - id: Article ID (required)
 */
export const STOREFRONT_ARTICLE_BY_ID_QUERY = `#graphql
  query StorefrontArticleById($id: ID!) {
    article(id: $id) {
      id
      title
      handle
      excerpt
      content
      contentHtml
      publishedAt
      onlineStoreUrl
      blog {
        id
        title
        handle
      }
      author {
        firstName
        lastName
        name
        email
        bio
      }
      image {
        id
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
      tags
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