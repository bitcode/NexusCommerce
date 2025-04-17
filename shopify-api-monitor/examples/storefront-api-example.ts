/**
 * storefront-api-example.ts
 * Example usage of the StorefrontApiClient for Shopify Storefront API operations.
 */

import StorefrontApiClient from '../src/StorefrontApiClient';
import { StorefrontConfigManager } from '../src/ConfigManagerExtension';

// Example 1: Basic usage with environment variables
async function basicUsageExample() {
  console.log('Example 1: Basic usage with environment variables');
  
  // Create client using environment variables
  const client = new StorefrontApiClient({
    useEnvConfig: true
  });
  
  // Define a simple query to fetch products
  const query = `
    query Products {
      products(first: 5) {
        edges {
          node {
            id
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;
  
  try {
    // Execute the query
    const response = await client.request(query);
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      console.log('Products:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 2: Using context for localization
async function contextExample() {
  console.log('\nExample 2: Using context for localization');
  
  // Create client with context
  const client = new StorefrontApiClient({
    useEnvConfig: true,
    context: {
      country: 'US',
      language: 'EN'
    }
  });
  
  // Define a query to fetch localized products
  const query = `
    query Products {
      products(first: 5) {
        edges {
          node {
            id
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;
  
  try {
    // Execute the query with context
    const response = await client.request(query);
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      console.log('Localized Products:', JSON.stringify(response.data, null, 2));
    }
    
    // Change context and execute again
    client.setContext({
      country: 'CA',
      language: 'FR'
    });
    
    console.log('\nChanging context to CA/FR...');
    
    const response2 = await client.request(query);
    
    if (response2.errors) {
      console.error('GraphQL Errors:', response2.errors);
    } else {
      console.log('Localized Products (CA/FR):', JSON.stringify(response2.data, null, 2));
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 3: Using direct configuration
async function directConfigExample() {
  console.log('\nExample 3: Using direct configuration');
  
  // Create client with direct configuration
  const client = new StorefrontApiClient({
    storeDomain: 'your-store.myshopify.com',
    publicStorefrontToken: 'your-public-token',
    storefrontApiVersion: '2025-04',
    useEnvConfig: false
  });
  
  // Define a simple query to fetch collections
  const query = `
    query Collections {
      collections(first: 5) {
        edges {
          node {
            id
            title
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;
  
  try {
    // Execute the query
    const response = await client.request(query);
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      console.log('Collections:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 4: Using buyer identity
async function buyerIdentityExample() {
  console.log('\nExample 4: Using buyer identity');
  
  // Create client with buyer identity context
  const client = new StorefrontApiClient({
    useEnvConfig: true,
    context: {
      country: 'US',
      buyerIdentity: {
        customerAccessToken: 'customer-access-token',
        email: 'customer@example.com',
        countryCode: 'US'
      }
    }
  });
  
  // Define a query to fetch customer-specific data
  const query = `
    query CustomerData {
      customer {
        firstName
        lastName
        email
        orders(first: 5) {
          edges {
            node {
              id
              orderNumber
              totalPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;
  
  try {
    // Execute the query with buyer identity
    const response = await client.request(query);
    
    // Process the response
    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
    } else {
      console.log('Customer Data:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Example 5: Error handling
async function errorHandlingExample() {
  console.log('\nExample 5: Error handling');
  
  // Create client with error handler
  const client = new StorefrontApiClient({
    useEnvConfig: true,
    onError: (error) => {
      console.error('Custom error handler:', error.message);
    }
  });
  
  // Define an invalid query to trigger an error
  const invalidQuery = `
    query InvalidQuery {
      nonExistentField {
        id
      }
    }
  `;
  
  try {
    // Execute the invalid query
    const response = await client.request(invalidQuery);
    
    // Process the response (should have errors)
    if (response.errors) {
      console.log('GraphQL Errors handled gracefully:', response.errors.map(e => e.message).join(', '));
    }
  } catch (error) {
    console.error('Unhandled error:', error);
  }
}

// Run all examples
async function runExamples() {
  // Create sample .env file if needed
  // Call the static method directly on the class
  StorefrontConfigManager.createSampleStorefrontEnvFile();
  
  // Run examples
  await basicUsageExample();
  await contextExample();
  await directConfigExample();
  await buyerIdentityExample();
  await errorHandlingExample();
}

// Run the examples
runExamples().catch(console.error);