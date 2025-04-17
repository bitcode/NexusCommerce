/**
 * storefrontApiResponses.ts
 * Mock responses for Storefront API tests.
 */

/**
 * Mock response for a products query
 */
export const MOCK_PRODUCTS_RESPONSE = {
  data: {
    products: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Product/1',
            title: 'Test Product 1',
            handle: 'test-product-1',
            description: 'This is a test product description.',
            priceRange: {
              minVariantPrice: {
                amount: '10.00',
                currencyCode: 'USD'
              },
              maxVariantPrice: {
                amount: '20.00',
                currencyCode: 'USD'
              }
            },
            images: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductImage/1',
                    url: 'https://example.com/images/product-1.jpg',
                    altText: 'Test Product 1 Image'
                  }
                }
              ]
            },
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/1',
                    title: 'Default',
                    price: {
                      amount: '10.00',
                      currencyCode: 'USD'
                    },
                    availableForSale: true,
                    sku: 'SKU-1'
                  }
                }
              ]
            }
          }
        },
        {
          node: {
            id: 'gid://shopify/Product/2',
            title: 'Test Product 2',
            handle: 'test-product-2',
            description: 'This is another test product description.',
            priceRange: {
              minVariantPrice: {
                amount: '15.00',
                currencyCode: 'USD'
              },
              maxVariantPrice: {
                amount: '25.00',
                currencyCode: 'USD'
              }
            },
            images: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductImage/2',
                    url: 'https://example.com/images/product-2.jpg',
                    altText: 'Test Product 2 Image'
                  }
                }
              ]
            },
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/2',
                    title: 'Default',
                    price: {
                      amount: '15.00',
                      currencyCode: 'USD'
                    },
                    availableForSale: true,
                    sku: 'SKU-2'
                  }
                }
              ]
            }
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  }
};

/**
 * Mock response for a collections query
 */
export const MOCK_COLLECTIONS_RESPONSE = {
  data: {
    collections: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Collection/1',
            title: 'Test Collection 1',
            handle: 'test-collection-1',
            description: 'This is a test collection description.',
            image: {
              id: 'gid://shopify/CollectionImage/1',
              url: 'https://example.com/images/collection-1.jpg',
              altText: 'Test Collection 1 Image'
            },
            products: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/Product/1',
                    title: 'Test Product 1'
                  }
                }
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        },
        {
          node: {
            id: 'gid://shopify/Collection/2',
            title: 'Test Collection 2',
            handle: 'test-collection-2',
            description: 'This is another test collection description.',
            image: {
              id: 'gid://shopify/CollectionImage/2',
              url: 'https://example.com/images/collection-2.jpg',
              altText: 'Test Collection 2 Image'
            },
            products: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/Product/2',
                    title: 'Test Product 2'
                  }
                }
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  }
};

/**
 * Mock response for a pages query
 */
export const MOCK_PAGES_RESPONSE = {
  data: {
    pages: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Page/1',
            title: 'Test Page 1',
            handle: 'test-page-1',
            bodySummary: 'This is a test page summary.',
            body: '<p>This is a test page content.</p>',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-02T00:00:00Z'
          }
        },
        {
          node: {
            id: 'gid://shopify/Page/2',
            title: 'Test Page 2',
            handle: 'test-page-2',
            bodySummary: 'This is another test page summary.',
            body: '<p>This is another test page content.</p>',
            createdAt: '2023-02-01T00:00:00Z',
            updatedAt: '2023-02-02T00:00:00Z'
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  }
};

/**
 * Mock response for a blogs query
 */
export const MOCK_BLOGS_RESPONSE = {
  data: {
    blogs: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Blog/1',
            title: 'Test Blog 1',
            handle: 'test-blog-1',
            articles: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/Article/1',
                    title: 'Test Article 1',
                    handle: 'test-article-1',
                    content: '<p>This is a test article content.</p>',
                    excerpt: 'This is a test article excerpt.',
                    publishedAt: '2023-01-01T00:00:00Z',
                    image: {
                      id: 'gid://shopify/ArticleImage/1',
                      url: 'https://example.com/images/article-1.jpg',
                      altText: 'Test Article 1 Image'
                    }
                  }
                }
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        },
        {
          node: {
            id: 'gid://shopify/Blog/2',
            title: 'Test Blog 2',
            handle: 'test-blog-2',
            articles: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/Article/2',
                    title: 'Test Article 2',
                    handle: 'test-article-2',
                    content: '<p>This is another test article content.</p>',
                    excerpt: 'This is another test article excerpt.',
                    publishedAt: '2023-02-01T00:00:00Z',
                    image: {
                      id: 'gid://shopify/ArticleImage/2',
                      url: 'https://example.com/images/article-2.jpg',
                      altText: 'Test Article 2 Image'
                    }
                  }
                }
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: null
              }
            }
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  }
};

/**
 * Mock response for a metaobjects query
 */
export const MOCK_METAOBJECTS_RESPONSE = {
  data: {
    metaobjects: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Metaobject/1',
            handle: 'custom-1',
            type: 'custom',
            fields: [
              {
                key: 'title',
                value: 'Custom 1'
              },
              {
                key: 'description',
                value: 'This is a test metaobject description.'
              },
              {
                key: 'image',
                reference: {
                  id: 'gid://shopify/MediaImage/1',
                  image: {
                    url: 'https://example.com/images/custom-1.jpg',
                    altText: 'Custom 1 Image'
                  }
                }
              }
            ]
          }
        },
        {
          node: {
            id: 'gid://shopify/Metaobject/2',
            handle: 'custom-2',
            type: 'custom',
            fields: [
              {
                key: 'title',
                value: 'Custom 2'
              },
              {
                key: 'description',
                value: 'This is another test metaobject description.'
              },
              {
                key: 'image',
                reference: {
                  id: 'gid://shopify/MediaImage/2',
                  image: {
                    url: 'https://example.com/images/custom-2.jpg',
                    altText: 'Custom 2 Image'
                  }
                }
              }
            ]
          }
        }
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: null
      }
    }
  }
};

/**
 * Mock response for a shop info query
 */
export const MOCK_SHOP_INFO_RESPONSE = {
  data: {
    shop: {
      id: 'gid://shopify/Shop/1',
      name: 'Test Shop',
      description: 'This is a test shop description.',
      primaryDomain: {
        url: 'https://test-shop.myshopify.com'
      },
      brand: {
        logo: {
          image: {
            url: 'https://example.com/images/shop-logo.jpg'
          }
        },
        colors: {
          primary: {
            background: '#000000',
            foreground: '#FFFFFF'
          },
          secondary: {
            background: '#FFFFFF',
            foreground: '#000000'
          }
        }
      }
    }
  }
};

/**
 * Mock response for a GraphQL error
 */
export const MOCK_GRAPHQL_ERROR_RESPONSE = {
  data: null,
  errors: [
    {
      message: 'Field does not exist on type',
      locations: [{ line: 1, column: 1 }],
      path: ['query'],
      extensions: {
        code: 'GRAPHQL_VALIDATION_FAILED'
      }
    }
  ]
};

/**
 * Mock response for a network error
 */
export const MOCK_NETWORK_ERROR = new Error('Network request failed');

/**
 * Mock response for a 430 security error
 */
export const MOCK_430_SECURITY_ERROR = {
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

/**
 * Mock response for a rate limit error
 */
export const MOCK_RATE_LIMIT_ERROR = {
  data: null,
  errors: [
    {
      message: 'Throttled',
      locations: [{ line: 1, column: 1 }],
      path: ['query'],
      extensions: {
        code: 'THROTTLED',
        documentation: 'https://shopify.dev/api/storefront#rate-limits'
      }
    }
  ]
};
