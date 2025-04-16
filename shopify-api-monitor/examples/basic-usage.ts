/**
 * Basic usage example for the Shopify API Monitor
 * 
 * This example demonstrates how to set up and use the monitor
 * for tracking Shopify API usage and rate limits.
 */
/// <reference types="node" />

import { createShopifyMonitor } from '../src';

// Replace these values with your actual Shopify store details
const SHOP = 'your-store.myshopify.com';
const ACCESS_TOKEN = 'your-admin-api-access-token';

// Create the monitor with all components
const monitor = createShopifyMonitor({
  shop: SHOP,
  accessToken: ACCESS_TOKEN,
  plan: 'standard', // or 'advanced', 'plus', 'enterprise'
  
  // Optional analytics configuration
  analytics: {
    maxHistoryLength: 1000,
    persistData: true,
  },
  
  // Optional notification configuration
  notifications: {
    maxNotifications: 100,
    onNewNotification: (notification) => {
      console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);
    },
  },
});

// Example: Fetch products using the monitored API client
async function fetchProducts() {
  const query = `
    query GetProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            productType
            vendor
            createdAt
            updatedAt
          }
        }
      }
    }
  `;
  
  try {
    console.log('Fetching products...');
    const response = await monitor.apiClient.request(query);
    
    // The API call is automatically tracked in analytics
    // and rate limit information is processed
    
    const products = response.data?.products?.edges || [];
    console.log(`Fetched ${products.length} products`);
    
    // Display some product details
    products.forEach((edge: any) => {
      const product = edge.node;
      console.log(`- ${product.title} (${product.id})`);
    });
    
    // Display current API usage stats
    displayApiUsage();
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Example: Display current API usage statistics
function displayApiUsage() {
  const summary = monitor.analytics.getSummary();
  const status = summary.currentStatus;
  
  console.log('\n--- API Usage Statistics ---');
  console.log(`Usage: ${summary.usagePercentage.toFixed(1)}%`);
  
  if (status) {
    console.log(`Available Points: ${status.currentlyAvailable}/${status.maximumAvailable}`);
    console.log(`Restore Rate: ${status.restoreRate} points/second`);
  }
  
  console.log(`Throttled Requests: ${summary.throttledRequests}`);
  console.log(`Average Cost Per Request: ${summary.averageCostPerRequest.toFixed(2)}`);
  console.log('----------------------------\n');
}

// Example: Update the Shopify plan
function updateShopifyPlan(newPlan: 'standard' | 'advanced' | 'plus' | 'enterprise') {
  console.log(`Updating Shopify plan to: ${newPlan}`);
  monitor.planConfig.updatePlan(newPlan);
  
  // Display the new rate limits
  const limits = monitor.planConfig.getCurrentRateLimits();
  console.log(`New rate limits: ${limits.pointsPerSecond} points/second`);
}

// Example: Display recent notifications
function displayNotifications() {
  const notifications = monitor.notifications.getUnread();
  
  console.log('\n--- Recent Notifications ---');
  if (notifications.length === 0) {
    console.log('No unread notifications');
  } else {
    notifications.forEach(n => {
      console.log(`[${n.type.toUpperCase()}] ${n.message}`);
    });
  }
  console.log('----------------------------\n');
}

// Run the example
async function runExample() {
  console.log('Starting Shopify API Monitor example...');
  
  // Fetch products (this will generate API usage data)
  await fetchProducts();
  
  // Display notifications that might have been generated
  displayNotifications();
  
  // Example of updating the plan
  // updateShopifyPlan('advanced');
  
  console.log('Example completed!');
}

// Run the example if this file is executed directly
// Using Node.js module check pattern
if (typeof require !== 'undefined' && require.main === module) {
  runExample().catch(error => {
    console.error('Error running example:', error);
  });
}

// Export functions for importing in other files
export { fetchProducts, displayApiUsage, updateShopifyPlan, displayNotifications, runExample };