/**
 * Data Operations Example for the Shopify API Monitor
 * 
 * This example demonstrates how to use the Data Operations Layer
 * for CRUD operations on Shopify resources with caching and optimistic updates.
 */

// Add Node.js type declarations
declare const require: any;
declare const module: { main?: any };

import { 
  createShopifyMonitor, 
  ShopifyResourceType, 
  MutationOptions,
  ReadOptions,
  NotificationType,
  NotificationTopic
} from '../src';

// Replace these values with your actual Shopify store details
const SHOP = 'your-store.myshopify.com';
const ACCESS_TOKEN = 'your-admin-api-access-token';

// Create the monitor with all components including DataOperations
const monitor = createShopifyMonitor({
  shop: SHOP,
  accessToken: ACCESS_TOKEN,
  plan: 'standard',
  
  // Configure StateManager
  stateManager: {
    defaultTTL: 300000, // 5 minutes default cache TTL
    maxEntries: 1000,   // Maximum cache entries
    persistCache: true, // Persist cache to localStorage
    sanitizeData: true, // Automatically sanitize sensitive data
  },
  
  // Configure notifications
  notifications: {
    maxNotifications: 100,
    onNewNotification: (notification) => {
      console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);
    },
  },
});

// Example: Fetch products with caching
async function fetchProducts(): Promise<any[]> {
  console.log('Fetching products...');
  
  try {
    // Use the read operation with caching
    const result = await monitor.read<any[]>(
      ShopifyResourceType.PRODUCT,
      {
        first: 10,
        cacheOptions: {
          cacheKey: 'products-list',
          ttl: 600000, // 10 minutes cache
          sanitizeFields: ['metafields.value'] // Fields to sanitize
        }
      }
    );
    
    console.log(`Fetched ${result.data?.length || 0} products`);
    
    // Display some product details
    if (result.data && result.data.length > 0) {
      result.data.forEach((product: any) => {
        console.log(`- ${product.title} (${product.id})`);
      });
    }
    
    // Display cache info
    console.log(`From cache: ${result.fromCache}`);
    if (result.lastFetched) {
      console.log(`Last fetched: ${new Date(result.lastFetched).toLocaleString()}`);
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Example: Create a new product
async function createProduct(): Promise<any> {
  console.log('\nCreating a new product...');
  
  const newProduct = {
    title: 'New Test Product',
    description: 'This is a test product created via the Data Operations Layer',
    productType: 'Test',
    vendor: 'Test Vendor',
    tags: ['test', 'example', 'data-operations'],
    status: 'DRAFT'
  };
  
  try {
    // Use the create operation
    const result = await monitor.create(
      ShopifyResourceType.PRODUCT,
      newProduct,
      {
        // Enable optimistic updates
        optimisticUpdate: true,
        
        // Callback on success
        onSuccess: (data) => {
          console.log('Product created successfully!');
        },
        
        // Callback on error
        onError: (error) => {
          console.error('Failed to create product:', error.message);
        }
      }
    );
    
    console.log(`Created product: ${result.title} (${(result as any).id})`);
    return result;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// Example: Update a product
async function updateProduct(productId: string): Promise<any> {
  console.log(`\nUpdating product ${productId}...`);
  
  const updates = {
    title: 'Updated Product Title',
    tags: ['updated', 'example', 'data-operations']
  };
  
  try {
    // Use the update operation
    const result = await monitor.update(
      ShopifyResourceType.PRODUCT,
      productId,
      updates,
      {
        // Enable optimistic updates
        optimisticUpdate: true,
        
        // Callback on success
        onSuccess: (data) => {
          console.log('Product updated successfully!');
        }
      }
    );
    
    console.log(`Updated product: ${result.title}`);
    return result;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Example: Delete a product
async function deleteProduct(productId: string): Promise<boolean> {
  console.log(`\nDeleting product ${productId}...`);
  
  try {
    // Use the delete operation
    const result = await monitor.delete(
      ShopifyResourceType.PRODUCT,
      productId
    );
    
    if (result) {
      console.log('Product deleted successfully!');
    } else {
      console.log('Failed to delete product.');
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// Example: Custom GraphQL query with caching
async function customQuery(): Promise<any> {
  console.log('\nExecuting custom GraphQL query...');
  
  const query = `
    query GetShopInfo {
      shop {
        id
        name
        email
        primaryDomain {
          url
          host
        }
        plan {
          displayName
          partnerDevelopment
          shopifyPlus
        }
      }
    }
  `;
  
  try {
    // Use the query operation with caching
    const result = await monitor.query(
      query,
      {},
      {
        cacheKey: 'shop-info',
        ttl: 3600000, // 1 hour cache
      }
    );
    
    const shopInfo = result as any;
    
    console.log('Shop info:');
    console.log(`- Name: ${shopInfo.shop.name}`);
    console.log(`- Email: ${shopInfo.shop.email}`);
    console.log(`- Domain: ${shopInfo.shop.primaryDomain.url}`);
    console.log(`- Plan: ${shopInfo.shop.plan.displayName}`);
    
    return shopInfo.shop;
  } catch (error) {
    console.error('Error executing custom query:', error);
    return null;
  }
}

// Example: Display cache statistics
function displayCacheStats(): void {
  console.log('\n--- Cache Statistics ---');
  const stats = monitor.stateManager.getCacheStats();
  console.log(`Total Entries: ${stats.totalEntries}`);
  console.log(`Sanitized Entries: ${stats.sanitizedEntries}`);
  console.log(`Average Access Count: ${stats.averageAccessCount.toFixed(2)}`);
  console.log(`Estimated Cache Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
  console.log('-------------------------\n');
}

// Run the example
async function runExample(): Promise<void> {
  console.log('Starting Shopify API Data Operations example...');
  
  // Fetch products
  const products = await fetchProducts();
  
  // Create a new product
  let newProduct: any = null;
  if (products.length === 0 || true) { // Always create for demo purposes
    newProduct = await createProduct();
  }
  
  // Update the product if created
  if (newProduct) {
    const updatedProduct = await updateProduct((newProduct as any).id);
    
    // Delete the product if updated
    if (updatedProduct) {
      await deleteProduct((updatedProduct as any).id);
    }
  }
  
  // Execute custom query
  await customQuery();
  
  // Display cache statistics
  displayCacheStats();
  
  console.log('Example completed!');
}

// Run the example if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runExample().catch(error => {
    console.error('Error running example:', error);
  });
}

// Export functions for importing in other files
export { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  customQuery, 
  displayCacheStats, 
  runExample 
};