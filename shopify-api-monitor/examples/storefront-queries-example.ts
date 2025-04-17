/**
 * storefront-queries-example.ts
 * Example usage of the Shopify Storefront API query definitions with StorefrontApiClient.
 */

import StorefrontApiClient from '../src/StorefrontApiClient';
import {
  // Query utilities
  applyContextToQuery,
  extractPaginationInfo,
  extractNodesFromEdges,
  fetchAllPages,
  processGraphQLResponse,
  
  // Product queries
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_PRODUCT_BY_ID_QUERY,
  STOREFRONT_PRODUCT_BY_HANDLE_QUERY,
  STOREFRONT_PRODUCT_RECOMMENDATIONS_QUERY,
  
  // Collection queries
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_COLLECTION_BY_ID_QUERY,
  STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY,
  
  // Content queries
  STOREFRONT_PAGES_QUERY,
  STOREFRONT_BLOGS_QUERY,
  STOREFRONT_ARTICLE_BY_ID_QUERY,
  
  // Metaobject queries
  STOREFRONT_METAOBJECTS_BY_TYPE_QUERY,
  
  // Menu queries
  STOREFRONT_SHOP_NAVIGATION_QUERY
} from '../src/queries';

// Example 1: Fetch products with context
async function fetchProductsWithContext() {
  console.log('Example 1: Fetch products with context');
  
  // Create client with context
  const client = new StorefrontApiClient({
    useEnvConfig: true,
    context: {
      country: 'US',
      language: 'EN'
    }
  });
  
  try {
    // Execute the query with variables
    const response = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 5,
      sortKey: 'TITLE',
      reverse: false
    });
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      // Extract nodes from edges
      const products = extractNodesFromEdges(response.data.products.edges);
      console.log(`Fetched ${products.length} products:`);
      products.forEach(product => {
        console.log(`- ${product.title} (${product.id})`);
      });
      
      // Check pagination info
      const paginationInfo = extractPaginationInfo(response.data, 'products');
      if (paginationInfo.hasNextPage) {
        console.log(`More products available. Next cursor: ${paginationInfo.endCursor}`);
      }
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 2: Fetch a product by handle
async function fetchProductByHandle() {
  console.log('\nExample 2: Fetch a product by handle');
  
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  try {
    // Execute the query with variables
    const response = await client.request(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, {
      handle: 'example-product'
    });
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else if (response.data.productByHandle) {
      const product = response.data.productByHandle;
      console.log(`Product: ${product.title}`);
      console.log(`Description: ${product.description}`);
      console.log(`Price Range: ${product.priceRange.minVariantPrice.amount} - ${product.priceRange.maxVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`);
      
      // Extract variants
      if (product.variants && product.variants.edges) {
        const variants = extractNodesFromEdges(product.variants.edges);
        console.log(`Variants (${variants.length}):`);
        variants.forEach(variant => {
          console.log(`- ${variant.title}: ${variant.price.amount} ${variant.price.currencyCode}`);
        });
      }
    } else {
      console.log('Product not found');
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 3: Fetch collections and their products
async function fetchCollectionsWithProducts() {
  console.log('\nExample 3: Fetch collections with products');
  
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  try {
    // Execute the query with variables
    const response = await client.request(STOREFRONT_COLLECTIONS_QUERY, {
      first: 3
    });
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      // Extract collections
      const collections = extractNodesFromEdges(response.data.collections.edges);
      console.log(`Fetched ${collections.length} collections:`);
      
      for (const collection of collections) {
        console.log(`\nCollection: ${collection.title} (${collection.id})`);
        
        // Fetch products for this collection
        const productsResponse = await client.request(STOREFRONT_PRODUCTS_BY_COLLECTION_QUERY, {
          collectionId: collection.id,
          first: 5
        });
        
        if (productsResponse.errors) {
          console.error('GraphQL Errors:', productsResponse.errors);
        } else if (productsResponse.data.collection) {
          const products = extractNodesFromEdges(productsResponse.data.collection.products.edges);
          console.log(`Products in collection (${products.length}):`);
          products.forEach(product => {
            console.log(`- ${product.title}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 4: Fetch all pages using pagination
async function fetchAllProductsWithPagination() {
  console.log('\nExample 4: Fetch all products using pagination');
  
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  try {
    // Use the fetchAllPages utility
    const allProducts = await fetchAllPages(
      client,
      STOREFRONT_PRODUCTS_QUERY,
      { first: 10 },
      'products'
    );
    
    console.log(`Fetched all ${allProducts.length} products:`);
    allProducts.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
    });
    
    if (allProducts.length > 5) {
      console.log(`... and ${allProducts.length - 5} more`);
    }
  } catch (error) {
    console.error('Error fetching all products:', error);
  }
}

// Example 5: Fetch shop navigation
async function fetchShopNavigation() {
  console.log('\nExample 5: Fetch shop navigation');
  
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  try {
    // Execute the query
    const response = await client.request(STOREFRONT_SHOP_NAVIGATION_QUERY);
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      const shop = response.data.shop;
      console.log(`Shop: ${shop.name}`);
      console.log(`Domain: ${shop.primaryDomain.url}`);
      
      if (shop.navigationMenu) {
        console.log(`\nNavigation Menu: ${shop.navigationMenu.title}`);
        shop.navigationMenu.items.forEach(item => {
          console.log(`- ${item.title} (${item.url})`);
          if (item.items && item.items.length > 0) {
            item.items.forEach(subItem => {
              console.log(`  - ${subItem.title} (${subItem.url})`);
            });
          }
        });
      }
      
      if (shop.footerMenu) {
        console.log(`\nFooter Menu: ${shop.footerMenu.title}`);
        shop.footerMenu.items.forEach(item => {
          console.log(`- ${item.title} (${item.url})`);
        });
      }
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 6: Fetch metaobjects by type
async function fetchMetaobjectsByType() {
  console.log('\nExample 6: Fetch metaobjects by type');
  
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  try {
    // Execute the query with variables
    const response = await client.request(STOREFRONT_METAOBJECTS_BY_TYPE_QUERY, {
      type: 'custom_content',
      first: 5
    });
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      // Extract metaobjects
      const metaobjects = extractNodesFromEdges(response.data.metaobjects.edges);
      console.log(`Fetched ${metaobjects.length} metaobjects of type 'custom_content':`);
      
      metaobjects.forEach(metaobject => {
        console.log(`\nMetaobject: ${metaobject.handle} (${metaobject.id})`);
        console.log('Fields:');
        metaobject.fields.forEach(field => {
          console.log(`- ${field.key}: ${field.value} (${field.type})`);
        });
      });
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Run all examples
async function runExamples() {
  await fetchProductsWithContext();
  await fetchProductByHandle();
  await fetchCollectionsWithProducts();
  await fetchAllProductsWithPagination();
  await fetchShopNavigation();
  await fetchMetaobjectsByType();
}

// Run the examples
runExamples().catch(console.error);