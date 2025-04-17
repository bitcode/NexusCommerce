/**
 * storefront-transformers-example.ts
 * Example usage of the Storefront API data transformers
 */

import { DataTransformerFactory } from '../src/dashboard/dual-view/transformers/DataTransformerFactory';
import { StorefrontApiClient } from '../src/StorefrontApiClient';

// Sample Storefront API response for products
const sampleProductsResponse = {
  products: {
    edges: [
      {
        node: {
          id: 'gid://shopify/Product/1',
          title: 'Sample Product 1',
          description: 'This is a sample product',
          variants: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/ProductVariant/1',
                  title: 'Default',
                  price: { amount: '19.99', currencyCode: 'USD' }
                }
              }
            ]
          },
          images: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/ProductImage/1',
                  url: 'https://example.com/image1.jpg',
                  altText: 'Product Image'
                }
              }
            ]
          },
          options: [
            {
              id: 'gid://shopify/ProductOption/1',
              name: 'Size',
              values: ['Small', 'Medium', 'Large']
            }
          ]
        }
      },
      {
        node: {
          id: 'gid://shopify/Product/2',
          title: 'Sample Product 2',
          description: 'This is another sample product',
          variants: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/ProductVariant/2',
                  title: 'Default',
                  price: { amount: '29.99', currencyCode: 'USD' }
                }
              }
            ]
          },
          images: {
            edges: []
          },
          options: []
        }
      }
    ],
    pageInfo: {
      hasNextPage: true,
      endCursor: 'cursor123'
    }
  }
};

// Sample Storefront API response for collections
const sampleCollectionsResponse = {
  collections: {
    edges: [
      {
        node: {
          id: 'gid://shopify/Collection/1',
          title: 'Featured Products',
          description: 'Our featured products collection',
          image: {
            id: 'gid://shopify/CollectionImage/1',
            url: 'https://example.com/collection1.jpg',
            altText: 'Featured Collection'
          },
          products: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/Product/1',
                  title: 'Sample Product 1'
                }
              }
            ]
          }
        }
      },
      {
        node: {
          id: 'gid://shopify/Collection/2',
          title: 'New Arrivals',
          description: '',
          image: null,
          products: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/Product/2',
                  title: 'Sample Product 2'
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
};

/**
 * Example of using the Storefront API data transformers
 */
async function demonstrateStorefrontTransformers() {
  console.log('Demonstrating Storefront API Data Transformers');
  console.log('---------------------------------------------');

  // Create a transformer factory
  const transformerFactory = new DataTransformerFactory();

  // Get a transformer for Storefront products
  const productsTransformer = transformerFactory.createTransformer('storefront-products');
  
  // Transform the sample products data to tree nodes
  const productsTreeNodes = productsTransformer.transformToTreeNodes(sampleProductsResponse);
  
  // Transform the sample products data to raw JSON
  const productsRawJson = productsTransformer.transformToRawData(sampleProductsResponse, 'json');

  console.log('Products Tree Nodes:');
  console.log(JSON.stringify(productsTreeNodes, null, 2));
  
  console.log('\nProducts Raw JSON (truncated):');
  console.log(productsRawJson.substring(0, 200) + '...');

  // Get a transformer for Storefront collections
  const collectionsTransformer = transformerFactory.createTransformer('storefront-collections');
  
  // Transform the sample collections data to tree nodes
  const collectionsTreeNodes = collectionsTransformer.transformToTreeNodes(sampleCollectionsResponse);
  
  // Transform the sample collections data to raw JSON
  const collectionsRawJson = collectionsTransformer.transformToRawData(sampleCollectionsResponse, 'json');

  console.log('\nCollections Tree Nodes:');
  console.log(JSON.stringify(collectionsTreeNodes, null, 2));
  
  console.log('\nCollections Raw JSON (truncated):');
  console.log(collectionsRawJson.substring(0, 200) + '...');

  // Example of how to use with the StorefrontApiClient (commented out as it requires actual API credentials)
  /*
  // Initialize the Storefront API client
  const storefrontClient = new StorefrontApiClient({
    shopDomain: 'your-store.myshopify.com',
    storefrontAccessToken: 'your-storefront-access-token'
  });

  // Fetch products from the Storefront API
  const productsQuery = `
    query GetProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
            description
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            images(first: 5) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
            options {
              id
              name
              values
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

  const productsResult = await storefrontClient.query(productsQuery);
  
  // Transform the API response to tree nodes
  const liveProductsTreeNodes = productsTransformer.transformToTreeNodes(productsResult);
  
  console.log('\nLive Products Tree Nodes:');
  console.log(JSON.stringify(liveProductsTreeNodes, null, 2));
  */
}

// Run the demonstration
demonstrateStorefrontTransformers().catch(console.error);