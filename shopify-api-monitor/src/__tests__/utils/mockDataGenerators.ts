/**
 * mockDataGenerators.ts
 * Utility functions for generating mock data for Storefront API tests.
 */

/**
 * Generates a mock product with the specified ID
 * 
 * @param id - Product ID
 * @returns Mock product object
 */
export function generateMockProduct(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return {
    id: `gid://shopify/Product/${numericId}`,
    title: `Product ${numericId}`,
    handle: `product-${numericId}`,
    description: `Description for product ${numericId}. This is a sample product description.`,
    priceRange: {
      minVariantPrice: {
        amount: (Math.random() * 100).toFixed(2),
        currencyCode: 'USD'
      },
      maxVariantPrice: {
        amount: (Math.random() * 200 + 100).toFixed(2),
        currencyCode: 'USD'
      }
    },
    images: {
      edges: Array(3).fill(null).map((_, imgIndex) => ({
        node: {
          id: `gid://shopify/ProductImage/${numericId}-${imgIndex}`,
          url: `https://example.com/images/product-${numericId}-${imgIndex}.jpg`,
          altText: `Product ${numericId} image ${imgIndex}`
        }
      }))
    },
    variants: {
      edges: Array(3).fill(null).map((_, variantIndex) => ({
        node: {
          id: `gid://shopify/ProductVariant/${numericId}-${variantIndex}`,
          title: `Variant ${variantIndex}`,
          price: {
            amount: (Math.random() * 100 + 50).toFixed(2),
            currencyCode: 'USD'
          },
          availableForSale: Math.random() > 0.2,
          sku: `SKU-${numericId}-${variantIndex}`
        }
      }))
    }
  };
}

/**
 * Generates a mock collection with the specified ID
 * 
 * @param id - Collection ID
 * @returns Mock collection object
 */
export function generateMockCollection(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return {
    id: `gid://shopify/Collection/${numericId}`,
    title: `Collection ${numericId}`,
    handle: `collection-${numericId}`,
    description: `Description for collection ${numericId}. This is a sample collection description.`,
    image: {
      id: `gid://shopify/CollectionImage/${numericId}`,
      url: `https://example.com/images/collection-${numericId}.jpg`,
      altText: `Collection ${numericId} image`
    },
    products: {
      edges: Array(5).fill(null).map((_, productIndex) => ({
        node: generateMockProduct(`${numericId}${productIndex}`)
      })),
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  };
}

/**
 * Generates a mock page with the specified ID
 * 
 * @param id - Page ID
 * @returns Mock page object
 */
export function generateMockPage(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return {
    id: `gid://shopify/Page/${numericId}`,
    title: `Page ${numericId}`,
    handle: `page-${numericId}`,
    bodySummary: `Summary for page ${numericId}`,
    body: `<p>Content for page ${numericId}. This is a sample page content with <strong>HTML formatting</strong>.</p>`,
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
  };
}

/**
 * Generates a mock blog with the specified ID
 * 
 * @param id - Blog ID
 * @returns Mock blog object
 */
export function generateMockBlog(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return {
    id: `gid://shopify/Blog/${numericId}`,
    title: `Blog ${numericId}`,
    handle: `blog-${numericId}`,
    articles: {
      edges: Array(3).fill(null).map((_, articleIndex) => ({
        node: {
          id: `gid://shopify/Article/${numericId}-${articleIndex}`,
          title: `Article ${numericId}-${articleIndex}`,
          handle: `article-${numericId}-${articleIndex}`,
          content: `<p>Content for article ${numericId}-${articleIndex}. This is a sample article content.</p>`,
          excerpt: `Excerpt for article ${numericId}-${articleIndex}`,
          publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          image: {
            id: `gid://shopify/ArticleImage/${numericId}-${articleIndex}`,
            url: `https://example.com/images/article-${numericId}-${articleIndex}.jpg`,
            altText: `Article ${numericId}-${articleIndex} image`
          }
        }
      })),
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  };
}

/**
 * Generates a mock metaobject with the specified ID and type
 * 
 * @param id - Metaobject ID
 * @param type - Metaobject type
 * @returns Mock metaobject object
 */
export function generateMockMetaobject(id: string | number, type: string = 'custom') {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return {
    id: `gid://shopify/Metaobject/${numericId}`,
    handle: `${type}-${numericId}`,
    type,
    fields: [
      {
        key: 'title',
        value: `${type.charAt(0).toUpperCase() + type.slice(1)} ${numericId}`
      },
      {
        key: 'description',
        value: `Description for ${type} ${numericId}. This is a sample metaobject description.`
      },
      {
        key: 'image',
        reference: {
          id: `gid://shopify/MediaImage/${numericId}`,
          image: {
            url: `https://example.com/images/${type}-${numericId}.jpg`,
            altText: `${type} ${numericId} image`
          }
        }
      }
    ]
  };
}

/**
 * Generates a large dataset of products
 * 
 * @param size - Number of products to generate
 * @param withPagination - Whether to include pagination info
 * @returns Mock products dataset
 */
export function generateLargeProductDataset(size: number, withPagination: boolean = true) {
  const edges = Array(size).fill(null).map((_, i) => ({
    node: generateMockProduct(i + 1)
  }));
  
  return {
    products: {
      edges,
      ...(withPagination ? {
        pageInfo: {
          hasNextPage: false,
          endCursor: null
        }
      } : {})
    }
  };
}

/**
 * Generates a large dataset of collections
 * 
 * @param size - Number of collections to generate
 * @param withPagination - Whether to include pagination info
 * @returns Mock collections dataset
 */
export function generateLargeCollectionDataset(size: number, withPagination: boolean = true) {
  const edges = Array(size).fill(null).map((_, i) => ({
    node: generateMockCollection(i + 1)
  }));
  
  return {
    collections: {
      edges,
      ...(withPagination ? {
        pageInfo: {
          hasNextPage: false,
          endCursor: null
        }
      } : {})
    }
  };
}

/**
 * Generates a paginated response for products
 * 
 * @param pageSize - Number of products per page
 * @param pageNumber - Page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Mock paginated products response
 */
export function generatePaginatedProductsResponse(pageSize: number, pageNumber: number, totalPages: number) {
  const startId = (pageNumber - 1) * pageSize + 1;
  const edges = Array(pageSize).fill(null).map((_, i) => ({
    node: generateMockProduct(startId + i)
  }));
  
  const hasNextPage = pageNumber < totalPages;
  
  return {
    data: {
      products: {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: hasNextPage ? `cursor-page-${pageNumber}` : null
        }
      }
    }
  };
}

/**
 * Generates a GraphQL error response
 * 
 * @param message - Error message
 * @param code - Error code
 * @returns Mock GraphQL error response
 */
export function generateGraphQLErrorResponse(message: string, code: string = 'GRAPHQL_VALIDATION_FAILED') {
  return {
    data: null,
    errors: [
      {
        message,
        locations: [{ line: 1, column: 1 }],
        path: ['query'],
        extensions: {
          code
        }
      }
    ]
  };
}

/**
 * Generates a network error
 * 
 * @param message - Error message
 * @returns Network error object
 */
export function generateNetworkError(message: string = 'Network request failed') {
  const error = new Error(message);
  error.name = 'NetworkError';
  return error;
}

/**
 * Generates a 430 security error response
 * 
 * @returns Mock 430 security error response
 */
export function generate430SecurityError() {
  return {
    data: null,
    errors: [
      {
        message: 'Request was rejected due to security concerns',
        locations: [{ line: 1, column: 1 }],
        path: ['query'],
        extensions: {
          code: 'ACCESS_DENIED',
          documentation: 'https://shopify.dev/api/storefront#access-denied'
        }
      }
    ]
  };
}
