/**
 * dashboard-example.ts
 * Example of using the Product Management Dashboard
 */

import { ShopifyApiClient } from '../src/ShopifyApiClient';
import { StateManager } from '../src/StateManager';
import { MutationManager } from '../src/MutationManager';
import { NotificationSystem, NotificationType, NotificationTopic } from '../src/NotificationSystem';
import { ProductManagementDashboard } from '../src/dashboard/product-management/ProductManagementDashboard';
import * as fs from 'fs';
import * as path from 'path';

// Initialize the required components
const apiClient = new ShopifyApiClient({
  shop: process.env.SHOPIFY_SHOP_DOMAIN || 'your-shop.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token',
  apiVersion: '2025-04'
});

const stateManager = new StateManager(apiClient, {
  defaultTTL: 300000, // 5 minutes cache TTL
  sanitizeData: true,
  persistCache: true
});

const notificationSystem = new NotificationSystem({
  maxNotifications: 100,
  persistNotifications: true,
  onNewNotification: (notification) => {
    console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);
  }
});

const mutationManager = new MutationManager(stateManager, notificationSystem);

// Initialize the Product Management Dashboard
const dashboard = new ProductManagementDashboard(
  apiClient,
  stateManager,
  mutationManager,
  notificationSystem
);

async function renderDashboard() {
  try {
    // Fetch metrics (this would normally come from the Shopify API)
    // For this example, we'll use mock data
    const metrics = {
      totalProducts: 25,
      totalCollections: 8,
      totalInventoryItems: 42,
      totalLocations: 2,
      totalPages: 5,
      totalArticles: 12,
      totalMetaobjects: 3,
      totalFiles: 18,
      totalMenus: 4
    };

    // Render the dashboard HTML
    const dashboardHTML = dashboard.renderDashboardHTML(
      { activeSection: 'products' },
      metrics
    );

    // Save the HTML to a file
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'dashboard.html');
    fs.writeFileSync(outputPath, dashboardHTML);

    console.log(`Dashboard rendered successfully and saved to ${outputPath}`);
    console.log(`Open the file in your browser to view the dashboard.`);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
  }
}

// Run the dashboard renderer
renderDashboard();