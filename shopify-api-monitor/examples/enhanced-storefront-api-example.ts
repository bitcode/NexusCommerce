/**
 * enhanced-storefront-api-example.ts
 * 
 * This example demonstrates the usage of the enhanced StorefrontApiClient
 * with caching, error handling, retry mechanisms, and performance optimization.
 */

import { StorefrontApiClient } from '../src/StorefrontApiClient';
import { NotificationSystem, NotificationType, NotificationTopic } from '../src/NotificationSystem';
import { 
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_PAGES_QUERY
} from '../src/queries';
import { extractNodesFromEdges, fetchAllPages } from '../src/queries/StorefrontQueries';
import { handleError, ErrorCategory } from '../src/ErrorHandlingUtils';
import cacheManager from '../src/CacheManager';

// Create a notification system for error handling
const notificationSystem = new NotificationSystem({
  maxNotifications: 50,
  persistNotifications: true,
  onNewNotification: (notification) => {
    console.log(`New notification: ${notification.message}`);
  }
});

// Initialize the StorefrontApiClient with enhanced features
const client = new StorefrontApiClient({
  // These values should be loaded from environment variables
  // or provided explicitly
  storeDomain: 'your-store.myshopify.com', // Replace with actual store domain
  publicStorefrontToken: 'your-storefront-api-token', // Replace with actual token
  storefrontApiVersion: '2025-04',
  
  // Enable caching for better performance
  enableCaching: true,
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
  
  // Set context for localization
  context: {
    country: 'US',
    language: 'EN'
  },
  
  // Provide notification system for error handling
  notificationSystem,
  
  // Custom retry options
  retryOptions: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryableCategories: [
      ErrorCategory.NETWORK,
      ErrorCategory.RATE_LIMIT,
      ErrorCategory.SERVER
    ]
  },
  
  // Error callback
  onError: (error) => {
    console.error('API Error:', error.message);
  }
});

/**
 * Example 1: Basic query with caching
 * 
 * This example demonstrates a basic query with automatic caching.
 * The first request will fetch from the API, while subsequent
 * identical requests will use the cached response.
 */
async function basicQueryWithCaching() {
  console.log('Example 1: Basic query with caching');
  
  try {
    console.log('First request (from API):');
    const startTime1 = performance.now();
    
    const response1 = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 10
    });
    
    const endTime1 = performance.now();
    console.log(`Request took ${(endTime1 - startTime1).toFixed(2)}ms`);
    console.log(`From cache: ${response1.fromCache}`);
    console.log(`Products count: ${response1.data?.products?.edges?.length || 0}`);
    
    console.log('\nSecond request (from cache):');
    const startTime2 = performance.now();
    
    const response2 = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 10
    });
    
    const endTime2 = performance.now();
    console.log(`Request took ${(endTime2 - startTime2).toFixed(2)}ms`);
    console.log(`From cache: ${response2.fromCache}`);
    console.log(`Products count: ${response2.data?.products?.edges?.length || 0}`);
    
    // Get cache statistics
    const cacheStats = client.getCacheStats();
    console.log('\nCache statistics:', cacheStats);
  } catch (error) {
    handleError(error, notificationSystem, {
      operation: 'basicQueryWithCaching',
      component: 'Example'
    });
  }
}

/**
 * Example 2: Pagination with fetchAllPages utility
 * 
 * This example demonstrates how to fetch all pages of a paginated resource
 * using the fetchAllPages utility function.
 */
async function paginationExample() {
  console.log('\nExample 2: Pagination with fetchAllPages utility');
  
  try {
    console.log('Fetching all products:');
    const startTime = performance.now();
    
    const allProducts = await fetchAllPages(
      client,
      STOREFRONT_PRODUCTS_QUERY,
      { first: 50 },
      'products'
    );
    
    const endTime = performance.now();
    console.log(`Fetched ${allProducts.length} products in ${(endTime - startTime).toFixed(2)}ms`);
    
    // Display the first 3 products
    console.log('\nFirst 3 products:');
    allProducts.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
    });
  } catch (error) {
    handleError(error, notificationSystem, {
      operation: 'paginationExample',
      component: 'Example'
    });
  }
}

/**
 * Example 3: Error handling and retry mechanisms
 * 
 * This example demonstrates error handling and retry mechanisms
 * for transient errors.
 */
async function errorHandlingExample() {
  console.log('\nExample 3: Error handling and retry mechanisms');
  
  try {
    // Simulate a network error by using an invalid query
    const INVALID_QUERY = `
      query InvalidQuery {
        nonExistentField {
          id
        }
      }
    `;
    
    console.log('Executing invalid query (will trigger error handling):');
    
    const response = await client.request(INVALID_QUERY);
    
    // This code will not be reached if an error occurs
    console.log('Response:', response);
  } catch (error) {
    console.log('Error caught and handled:');
    const userMessage = handleError(error, notificationSystem, {
      operation: 'errorHandlingExample',
      component: 'Example'
    });
    
    console.log('User-friendly error message:', userMessage);
  }
}

/**
 * Example 4: Cache invalidation
 * 
 * This example demonstrates how to invalidate the cache
 * for specific resource types.
 */
async function cacheInvalidationExample() {
  console.log('\nExample 4: Cache invalidation');
  
  try {
    // First request (from API)
    console.log('First request (from API):');
    const response1 = await client.request(STOREFRONT_COLLECTIONS_QUERY, {
      first: 5
    });
    
    console.log(`From cache: ${response1.fromCache}`);
    console.log(`Collections count: ${response1.data?.collections?.edges?.length || 0}`);
    
    // Second request (from cache)
    console.log('\nSecond request (from cache):');
    const response2 = await client.request(STOREFRONT_COLLECTIONS_QUERY, {
      first: 5
    });
    
    console.log(`From cache: ${response2.fromCache}`);
    
    // Invalidate the cache for collections
    console.log('\nInvalidating cache for collections...');
    client.invalidateCache(['collections']);
    
    // Third request (from API again after invalidation)
    console.log('\nThird request (from API after invalidation):');
    const response3 = await client.request(STOREFRONT_COLLECTIONS_QUERY, {
      first: 5
    });
    
    console.log(`From cache: ${response3.fromCache}`);
  } catch (error) {
    handleError(error, notificationSystem, {
      operation: 'cacheInvalidationExample',
      component: 'Example'
    });
  }
}

/**
 * Example 5: Context switching for localization
 * 
 * This example demonstrates how to switch context for localization.
 */
async function contextSwitchingExample() {
  console.log('\nExample 5: Context switching for localization');
  
  try {
    // First request with US context
    console.log('Request with US context:');
    client.setContext({
      country: 'US',
      language: 'EN'
    });
    
    const usResponse = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 1
    });
    
    const usProduct = usResponse.data?.products?.edges?.[0]?.node;
    console.log(`Product: ${usProduct?.title}`);
    console.log(`Price: ${usProduct?.priceRange?.minVariantPrice?.amount} ${usProduct?.priceRange?.minVariantPrice?.currencyCode}`);
    
    // Second request with CA context
    console.log('\nRequest with CA context:');
    client.setContext({
      country: 'CA',
      language: 'EN'
    });
    
    const caResponse = await client.request(STOREFRONT_PRODUCTS_QUERY, {
      first: 1
    });
    
    const caProduct = caResponse.data?.products?.edges?.[0]?.node;
    console.log(`Product: ${caProduct?.title}`);
    console.log(`Price: ${caProduct?.priceRange?.minVariantPrice?.amount} ${caProduct?.priceRange?.minVariantPrice?.currencyCode}`);
  } catch (error) {
    handleError(error, notificationSystem, {
      operation: 'contextSwitchingExample',
      component: 'Example'
    });
  }
}

/**
 * Example 6: Performance optimization
 * 
 * This example demonstrates performance optimization techniques.
 */
async function performanceOptimizationExample() {
  console.log('\nExample 6: Performance optimization');
  
  try {
    // Define an optimized query that requests only needed fields
    const OPTIMIZED_PRODUCTS_QUERY = `
      query OptimizedProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              # Only request fields you need
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    
    console.log('Executing optimized query:');
    const startTime = performance.now();
    
    const response = await client.request(OPTIMIZED_PRODUCTS_QUERY, {
      first: 100
    });
    
    const endTime = performance.now();
    console.log(`Request took ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Products count: ${response.data?.products?.edges?.length || 0}`);
    
    // Process the data efficiently
    const products = extractNodesFromEdges(response.data?.products?.edges || []);
    
    console.log('\nEfficient data processing:');
    console.log(`Processed ${products.length} products`);
  } catch (error) {
    handleError(error, notificationSystem, {
      operation: 'performanceOptimizationExample',
      component: 'Example'
    });
  }
}

/**
 * Example 7: Custom cache options
 * 
 * This example demonstrates how to use custom cache options.
 */
async function customCacheOptionsExample() {
  console.log('\nExample 7: Custom cache options');
  
  try {
    // Request with custom TTL
    console.log('Request with custom TTL (1 minute):');
    const response1 = await client.request(
      STOREFRONT_PAGES_QUERY,
      { first: 5 },
      { ttl: 60 * 1000 } // 1 minute
    );
    
    console.log(`Pages count: ${response1.data?.pages?.edges?.length || 0}`);
    
    // Request with custom tags
    console.log('\nRequest with custom tags:');
    const response2 = await client.request(
      STOREFRONT_PAGES_QUERY,
      { first: 5 },
      { tags: ['custom-tag', 'pages'] }
    );
    
    console.log(`From cache: ${response2.fromCache}`);
    
    // Invalidate by custom tag
    console.log('\nInvalidating cache by custom tag:');
    cacheManager.invalidateByTag('custom-tag');
    
    // Request after invalidation
    console.log('\nRequest after invalidation:');
    const response3 = await client.request(
      STOREFRONT_PAGES_QUERY,
      { first: 5 }
    );
    
    console.log(`From cache: ${response3.fromCache}`);
  } catch (error) {
    handleError(error, notificationSystem, {
      operation: 'customCacheOptionsExample',
      component: 'Example'
    });
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await basicQueryWithCaching();
    await paginationExample();
    await errorHandlingExample();
    await cacheInvalidationExample();
    await contextSwitchingExample();
    await performanceOptimizationExample();
    await customCacheOptionsExample();
    
    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runAllExamples();