/**
 * Sample data structures for the dual-view hierarchy demonstration
 */

// Products hierarchy
export const productsHierarchy = {
  id: 'products-root',
  name: 'Products',
  type: 'root',
  children: [
    {
      id: 'clothing',
      name: 'Clothing',
      type: 'category',
      children: [
        {
          id: 'tshirts',
          name: 'T-Shirts',
          type: 'subcategory',
          children: [
            {
              id: 'product-1',
              name: 'Basic T-Shirt',
              type: 'product',
              children: [
                { id: 'variant-1-1', name: 'Small / Black', type: 'variant' },
                { id: 'variant-1-2', name: 'Medium / Black', type: 'variant' },
                { id: 'variant-1-3', name: 'Large / Black', type: 'variant' }
              ]
            },
            {
              id: 'product-2',
              name: 'Premium T-Shirt',
              type: 'product',
              children: [
                { id: 'variant-2-1', name: 'Small / White', type: 'variant' },
                { id: 'variant-2-2', name: 'Medium / White', type: 'variant' }
              ]
            }
          ]
        },
        {
          id: 'hoodies',
          name: 'Hoodies',
          type: 'subcategory',
          children: [
            {
              id: 'product-3',
              name: 'Premium Hoodie',
              type: 'product',
              children: [
                { id: 'variant-3-1', name: 'Small / Gray', type: 'variant' },
                { id: 'variant-3-2', name: 'Medium / Gray', type: 'variant' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'electronics',
      name: 'Electronics',
      type: 'category',
      children: [
        {
          id: 'audio',
          name: 'Audio',
          type: 'subcategory',
          children: [
            {
              id: 'product-4',
              name: 'Wireless Headphones',
              type: 'product',
              children: [
                { id: 'variant-4-1', name: 'Black', type: 'variant' },
                { id: 'variant-4-2', name: 'White', type: 'variant' }
              ]
            }
          ]
        },
        {
          id: 'wearables',
          name: 'Wearables',
          type: 'subcategory',
          children: [
            {
              id: 'product-5',
              name: 'Smart Watch',
              type: 'product',
              children: [
                { id: 'variant-5-1', name: 'Black', type: 'variant' },
                { id: 'variant-5-2', name: 'Silver', type: 'variant' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Collections hierarchy
export const collectionsHierarchy = {
  id: 'collections-root',
  name: 'Collections',
  type: 'root',
  children: [
    {
      id: 'seasonal',
      name: 'Seasonal Collections',
      type: 'group',
      children: [
        {
          id: 'summer',
          name: 'Summer Collection',
          type: 'collection',
          children: [
            { id: 'product-1', name: 'Basic T-Shirt', type: 'product' },
            { id: 'product-6', name: 'Summer Shorts', type: 'product' },
            { id: 'product-7', name: 'Beach Hat', type: 'product' }
          ]
        },
        {
          id: 'winter',
          name: 'Winter Collection',
          type: 'collection',
          children: [
            { id: 'product-3', name: 'Premium Hoodie', type: 'product' },
            { id: 'product-8', name: 'Winter Jacket', type: 'product' },
            { id: 'product-9', name: 'Scarf', type: 'product' }
          ]
        }
      ]
    },
    {
      id: 'featured',
      name: 'Featured Collections',
      type: 'group',
      children: [
        {
          id: 'new-arrivals',
          name: 'New Arrivals',
          type: 'collection',
          children: [
            { id: 'product-5', name: 'Smart Watch', type: 'product' },
            { id: 'product-10', name: 'Wireless Earbuds', type: 'product' }
          ]
        },
        {
          id: 'best-sellers',
          name: 'Best Sellers',
          type: 'collection',
          children: [
            { id: 'product-1', name: 'Basic T-Shirt', type: 'product' },
            { id: 'product-4', name: 'Wireless Headphones', type: 'product' }
          ]
        }
      ]
    }
  ]
};

// Inventory hierarchy
export const inventoryHierarchy = {
  id: 'inventory-root',
  name: 'Inventory',
  type: 'root',
  children: [
    {
      id: 'warehouse-1',
      name: 'Main Warehouse',
      type: 'location',
      children: [
        {
          id: 'section-a',
          name: 'Section A',
          type: 'section',
          children: [
            {
              id: 'product-1-inv',
              name: 'Basic T-Shirt',
              type: 'product',
              children: [
                { id: 'variant-1-1-inv', name: 'Small / Black: 25 units', type: 'inventory' },
                { id: 'variant-1-2-inv', name: 'Medium / Black: 18 units', type: 'inventory' },
                { id: 'variant-1-3-inv', name: 'Large / Black: 12 units', type: 'inventory' }
              ]
            }
          ]
        },
        {
          id: 'section-b',
          name: 'Section B',
          type: 'section',
          children: [
            {
              id: 'product-3-inv',
              name: 'Premium Hoodie',
              type: 'product',
              children: [
                { id: 'variant-3-1-inv', name: 'Small / Gray: 8 units', type: 'inventory' },
                { id: 'variant-3-2-inv', name: 'Medium / Gray: 15 units', type: 'inventory' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'warehouse-2',
      name: 'Secondary Warehouse',
      type: 'location',
      children: [
        {
          id: 'section-c',
          name: 'Section C',
          type: 'section',
          children: [
            {
              id: 'product-4-inv',
              name: 'Wireless Headphones',
              type: 'product',
              children: [
                { id: 'variant-4-1-inv', name: 'Black: 30 units', type: 'inventory' },
                { id: 'variant-4-2-inv', name: 'White: 22 units', type: 'inventory' }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Customers hierarchy
export const customersHierarchy = {
  id: 'customers-root',
  name: 'Customers',
  type: 'root',
  children: [
    {
      id: 'segments',
      name: 'Customer Segments',
      type: 'group',
      children: [
        {
          id: 'vip',
          name: 'VIP Customers',
          type: 'segment',
          children: [
            { id: 'customer-1', name: 'John Doe (5 orders)', type: 'customer' },
            { id: 'customer-2', name: 'Jane Smith (8 orders)', type: 'customer' }
          ]
        },
        {
          id: 'regular',
          name: 'Regular Customers',
          type: 'segment',
          children: [
            { id: 'customer-3', name: 'Bob Johnson (3 orders)', type: 'customer' },
            { id: 'customer-4', name: 'Alice Brown (2 orders)', type: 'customer' }
          ]
        }
      ]
    },
    {
      id: 'recent',
      name: 'Recent Customers',
      type: 'group',
      children: [
        { id: 'customer-5', name: 'Mike Wilson (New: 1 order)', type: 'customer' },
        { id: 'customer-6', name: 'Sarah Davis (New: 1 order)', type: 'customer' }
      ]
    }
  ]
};

// Orders hierarchy
export const ordersHierarchy = {
  id: 'orders-root',
  name: 'Orders',
  type: 'root',
  children: [
    {
      id: 'status-groups',
      name: 'By Status',
      type: 'group',
      children: [
        {
          id: 'pending',
          name: 'Pending Orders',
          type: 'status',
          children: [
            { id: 'order-1', name: 'Order #1001: $129.99', type: 'order' },
            { id: 'order-2', name: 'Order #1002: $89.99', type: 'order' }
          ]
        },
        {
          id: 'processing',
          name: 'Processing Orders',
          type: 'status',
          children: [
            { id: 'order-3', name: 'Order #1003: $199.99', type: 'order' },
            { id: 'order-4', name: 'Order #1004: $59.99', type: 'order' }
          ]
        },
        {
          id: 'completed',
          name: 'Completed Orders',
          type: 'status',
          children: [
            { id: 'order-5', name: 'Order #1005: $149.99', type: 'order' },
            { id: 'order-6', name: 'Order #1006: $79.99', type: 'order' }
          ]
        }
      ]
    }
  ]
};

// Store overview hierarchy
export const storeHierarchy = {
  id: 'store-root',
  name: 'Store Overview',
  type: 'root',
  children: [
    {
      id: 'store-info',
      name: 'Store Information',
      type: 'info',
      children: [
        { id: 'store-name', name: 'Name: Nexus Commerce Store', type: 'detail' },
        { id: 'store-domain', name: 'Domain: nexus-commerce.myshopify.com', type: 'detail' },
        { id: 'store-plan', name: 'Plan: Advanced', type: 'detail' }
      ]
    },
    {
      id: 'store-stats',
      name: 'Store Statistics',
      type: 'stats',
      children: [
        { id: 'products-count', name: 'Products: 120', type: 'stat' },
        { id: 'collections-count', name: 'Collections: 8', type: 'stat' },
        { id: 'customers-count', name: 'Customers: 540', type: 'stat' },
        { id: 'orders-count', name: 'Orders: 1250', type: 'stat' }
      ]
    },
    {
      id: 'store-alerts',
      name: 'Alerts',
      type: 'alerts',
      children: [
        { id: 'low-stock', name: 'Low Stock Items: 15', type: 'alert' },
        { id: 'pending-orders', name: 'Pending Orders: 25', type: 'alert' }
      ]
    }
  ]
};