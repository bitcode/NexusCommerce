# Dashboard Storefront API Integration Guide

This document provides implementation guidelines for updating the ProductManagementDashboard to work with the Shopify Storefront API. This integration will ensure that our dashboard correctly aligns with the API's data structure and capabilities.

## Overview

The ProductManagementDashboard needs to be updated to:

1. Use the StorefrontApiClient instead of the current ShopifyApiClient
2. Implement proper GraphQL queries for each dashboard section
3. Use the specialized data transformers for Storefront API data
4. Handle errors and edge cases specific to the Storefront API
5. Update the UI to reflect the capabilities of the Storefront API

## Implementation Steps

### 1. Update Dependencies

First, update the ProductManagementDashboard class to use the new StorefrontApiClient and data transformers:

```typescript
// Before
import { ShopifyApiClient } from '../../ShopifyApiClient';
import { DataTransformerFactory } from '../dual-view/transformers/DataTransformerFactory';

// After
import { StorefrontApiClient } from '../../StorefrontApiClient';
import { StorefrontDataTransformerFactory } from '../dual-view/transformers/StorefrontDataTransformerFactory';
```

### 2. Update Constructor

Modify the constructor to accept the StorefrontApiClient:

```typescript
/**
 * ProductManagementDashboard constructor
 */
constructor(
  private apiClient: StorefrontApiClient,
  private stateManager: StateManager,
  private mutationManager: MutationManager,
  private notificationSystem: NotificationSystem
) {
  // Initialize with StorefrontDataTransformerFactory
  this.transformerFactory = new StorefrontDataTransformerFactory();
}
```

### 3. Update fetchMetrics Method

Reimplement the fetchMetrics method to use Storefront API queries:

```typescript
/**
 * Fetches metrics for the dashboard
 * 
 * @returns Dashboard metrics
 */
async fetchMetrics(): Promise<DashboardMetrics> {
  try {
    // Fetch product count
    const productsResponse = await this.apiClient.request(STOREFRONT_PRODUCTS_COUNT_QUERY);
    const totalProducts = productsResponse.data?.products?.totalCount || 0;
    
    // Fetch collection count
    const collectionsResponse = await this.apiClient.request(STOREFRONT_COLLECTIONS_COUNT_QUERY);
    const totalCollections = collectionsResponse.data?.collections?.totalCount || 0;
    
    // Fetch page count
    const pagesResponse = await this.apiClient.request(STOREFRONT_PAGES_COUNT_QUERY);
    const totalPages = pagesResponse.data?.pages?.totalCount || 0;
    
    // Fetch blog and article count
    const blogsResponse = await this.apiClient.request(STOREFRONT_BLOGS_COUNT_QUERY);
    const blogs = blogsResponse.data?.blogs?.edges || [];
    const totalBlogs = blogsResponse.data?.blogs?.totalCount || 0;
    
    // Calculate total articles across all blogs
    let totalArticles = 0;
    for (const blogEdge of blogs) {
      totalArticles += blogEdge.node.articles?.totalCount || 0;
    }
    
    // Fetch metaobject count
    const metaobjectsResponse = await this.apiClient.request(STOREFRONT_METAOBJECT_DEFINITIONS_COUNT_QUERY);
    const totalMetaobjects = metaobjectsResponse.data?.metaobjectDefinitions?.totalCount || 0;
    
    // Return metrics
    return {
      totalProducts,
      totalCollections,
      totalPages,
      totalArticles,
      totalBlogs,
      totalMetaobjects,
      // Note: Some metrics may not be available in the Storefront API
      totalInventoryItems: 0, // Not directly available in Storefront API
      totalLocations: 0,      // Not directly available in Storefront API
      totalFiles: 0,          // Not directly available in Storefront API
      totalMenus: 0           // May be available depending on API version
    };
  } catch (error) {
    this.notificationSystem.notify(
      `Error fetching metrics: ${error.message}`,
      'error',
      'dashboard'
    );
    
    // Return empty metrics on error
    return {
      totalProducts: 0,
      totalCollections: 0,
      totalInventoryItems: 0,
      totalLocations: 0,
      totalPages: 0,
      totalArticles: 0,
      totalBlogs: 0,
      totalMetaobjects: 0,
      totalFiles: 0,
      totalMenus: 0
    };
  }
}
```

### 4. Update Section Data Fetching

Create specialized methods for fetching data for each section:

```typescript
/**
 * Fetches products data for the dashboard
 * 
 * @param limit - Number of products to fetch
 * @returns Products data
 */
async fetchProductsData(limit: number = 10): Promise<any> {
  try {
    const response = await this.apiClient.request(STOREFRONT_PRODUCTS_QUERY, {
      first: limit
    });
    
    return response.data;
  } catch (error) {
    this.notificationSystem.notify(
      `Error fetching products: ${error.message}`,
      'error',
      'products'
    );
    
    return { products: { edges: [] } };
  }
}

/**
 * Fetches collections data for the dashboard
 * 
 * @param limit - Number of collections to fetch
 * @returns Collections data
 */
async fetchCollectionsData(limit: number = 10): Promise<any> {
  try {
    const response = await this.apiClient.request(STOREFRONT_COLLECTIONS_QUERY, {
      first: limit
    });
    
    return response.data;
  } catch (error) {
    this.notificationSystem.notify(
      `Error fetching collections: ${error.message}`,
      'error',
      'collections'
    );
    
    return { collections: { edges: [] } };
  }
}

// Implement similar methods for other sections
```

### 5. Update renderDualViewPresentation Method

Update the renderDualViewPresentation method to use the new data fetching methods and transformers:

```typescript
/**
 * Renders the dual-view presentation for a section
 * 
 * @param section - Section ID
 * @returns HTML for the dual-view presentation
 */
async renderDualViewPresentation(section: string): Promise<string> {
  try {
    // Fetch data based on section
    let data;
    switch (section) {
      case 'products':
        data = await this.fetchProductsData();
        break;
      case 'collections':
        data = await this.fetchCollectionsData();
        break;
      case 'content':
        data = await this.fetchContentData();
        break;
      case 'metaobjects':
        data = await this.fetchMetaobjectsData();
        break;
      // Handle other sections or return empty data
      default:
        data = {};
    }
    
    // Get transformer for this section
    const transformer = this.transformerFactory.createTransformer(section);
    
    // Transform data to tree nodes
    const treeNodes = transformer.transformToTreeNodes(data);
    
    // Transform data to raw format
    const rawData = transformer.transformToRawData(data, 'json');
    
    // Render dual-view presentation
    return `
      <div class="dual-view-container">
        <div class="toggle-controller">
          <div class="view-toggle">
            <button class="toggle-button tree-view-button active" data-view="tree">
              Tree View
            </button>
            <button class="toggle-button raw-view-button" data-view="raw">
              Raw Data
            </button>
          </div>
          
          <div class="tree-controls">
            <button class="expand-all-button">Expand All</button>
            <button class="collapse-all-button">Collapse All</button>
          </div>
        </div>
        
        <div class="view-container">
          <div class="tree-view" style="display: block;">
            <div class="tree-visualization">
              ${this.renderTreeNodes(treeNodes)}
            </div>
          </div>
          
          <div class="raw-data-view" style="display: none;">
            <div class="raw-data-header">
              <div class="format-selector">
                <label>
                  <input type="radio" name="format" value="json" checked>
                  JSON
                </label>
                <label>
                  <input type="radio" name="format" value="yaml">
                  YAML
                </label>
              </div>
              
              <button class="copy-button">Copy</button>
            </div>
            
            <pre class="raw-data-content">${rawData}</pre>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    this.notificationSystem.notify(
      `Error rendering dual-view: ${error.message}`,
      'error',
      'dual-view'
    );
    
    return `
      <div class="error-container">
        <h3>Error Loading Data</h3>
        <p>${error.message}</p>
        <button class="retry-button">Retry</button>
      </div>
    `;
  }
}
```

### 6. Update Section Titles and Item Names

Update the getSectionTitle and getSectionItemName methods to reflect Storefront API capabilities:

```typescript
/**
 * Gets the title for a section
 * 
 * @param section - Section ID
 * @returns Section title
 */
getSectionTitle(section: string): string {
  switch (section) {
    case 'products': return 'Products';
    case 'collections': return 'Collections';
    case 'content': return 'Content Management';
    case 'metaobjects': return 'Metaobjects';
    // Remove or update sections not available in Storefront API
    // case 'inventory': return 'Inventory Management';
    // case 'files': return 'Files';
    // case 'menus': return 'Navigation Menus';
    default: return 'Products';
  }
}

/**
 * Gets the item name for a section
 * 
 * @param section - Section ID
 * @returns Item name
 */
getSectionItemName(section: string): string {
  switch (section) {
    case 'products': return 'Product';
    case 'collections': return 'Collection';
    case 'content': return 'Page';
    case 'metaobjects': return 'Metaobject';
    // Remove or update sections not available in Storefront API
    // case 'inventory': return 'Transfer';
    // case 'files': return 'File';
    // case 'menus': return 'Menu';
    default: return 'Item';
  }
}
```

### 7. Update renderDashboardHTML Method

Update the renderDashboardHTML method to include only sections supported by the Storefront API:

```typescript
/**
 * Renders the dashboard HTML
 * 
 * @param props - Dashboard props
 * @param metrics - Dashboard metrics
 * @returns Dashboard HTML
 */
renderDashboardHTML(props: any, metrics: DashboardMetrics): string {
  const { activeSection = 'products' } = props;
  
  // Helper to generate navigation item HTML
  const navItem = (id: string, label: string, count: number) => `
    <div class="nav-item ${activeSection === id ? 'active' : ''}" data-section="${id}">
      <div class="nav-label">${label}</div>
      <div class="nav-count">${count}</div>
    </div>
  `;
  
  return `
    <div class="product-management-dashboard">
      <header class="dashboard-header">
        <h1>Shopify Product Ecosystem Management</h1>
      </header>
      
      <div class="dashboard-content">
        <nav class="dashboard-nav">
          ${navItem('products', 'Products', metrics.totalProducts)}
          ${navItem('collections', 'Collections', metrics.totalCollections)}
          ${navItem('content', 'Content', metrics.totalPages + metrics.totalArticles)}
          ${navItem('metaobjects', 'Metaobjects', metrics.totalMetaobjects)}
          <!-- Remove sections not available in Storefront API -->
          <!-- ${navItem('inventory', 'Inventory', metrics.totalInventoryItems)} -->
          <!-- ${navItem('files', 'Files', metrics.totalFiles)} -->
          <!-- ${navItem('menus', 'Menus', metrics.totalMenus)} -->
        </nav>
        
        <main class="dashboard-main">
          <div class="section-header">
            <h2>${this.getSectionTitle(activeSection)}</h2>
            <div class="section-actions">
              <button class="create-button">Create ${this.getSectionItemName(activeSection)}</button>
              <button class="refresh-button">Refresh</button>
              <!-- Dual-view toggle -->
              <div class="view-mode-toggle">
                <button class="tree-view-toggle active">Tree View</button>
                <button class="raw-view-toggle">Raw Data</button>
              </div>
            </div>
          </div>
          
          <div class="section-content">
            <!-- Dual-view component will be rendered here -->
            ${this.renderDualViewPresentation(activeSection)}
          </div>
        </main>
      </div>
    </div>
    
    <!-- CSS styles omitted for brevity -->
  `;
}
```

### 8. Add Context Support

Add methods to support context-aware queries:

```typescript
/**
 * Sets the context for Storefront API queries
 * 
 * @param context - Context settings
 */
setContext(context: StorefrontContext): void {
  this.apiClient.setContext(context);
  
  // Refresh the dashboard with the new context
  this.refreshDashboard();
}

/**
 * Gets the current context
 * 
 * @returns Current context settings
 */
getContext(): StorefrontContext | undefined {
  return this.apiClient.getContext();
}

/**
 * Refreshes the dashboard with current data
 */
async refreshDashboard(): Promise<void> {
  try {
    // Fetch updated metrics
    const metrics = await this.fetchMetrics();
    
    // Update the dashboard
    const container = document.getElementById('dashboard-container');
    if (container) {
      container.innerHTML = this.renderDashboardHTML({ activeSection: this.activeSection }, metrics);
      
      // Initialize event listeners
      this.initEventListeners();
    }
  } catch (error) {
    this.notificationSystem.notify(
      `Error refreshing dashboard: ${error.message}`,
      'error',
      'dashboard'
    );
  }
}
```

### 9. Add Comprehensive Error Handling

Implement comprehensive error handling for Storefront API errors:

```typescript
/**
 * Handles Storefront API errors
 * 
 * @param error - Error object
 * @param section - Section where the error occurred
 */
private handleStorefrontApiError(error: any, section: string): void {
  // Check for specific error types
  if (error?.response?.status === 430) {
    this.notificationSystem.notify(
      'Security error: Shopify has detected potentially malicious activity. Please try again later.',
      'error',
      section
    );
    return;
  }
  
  // Check for GraphQL errors
  if (error?.response?.errors) {
    const errorMessages = error.response.errors
      .map((e: any) => e.message)
      .join('\n');
    
    this.notificationSystem.notify(
      `GraphQL Error: ${errorMessages}`,
      'error',
      section
    );
    return;
  }
  
  // Handle network errors
  if (error.message.includes('Network') || error.message.includes('ECONNREFUSED')) {
    this.notificationSystem.notify(
      'Network error: Unable to connect to Shopify. Please check your internet connection.',
      'error',
      section
    );
    return;
  }
  
  // Handle authentication errors
  if (error.message.includes('Unauthorized') || error.response?.status === 401) {
    this.notificationSystem.notify(
      'Authentication error: Invalid or expired access token. Please check your credentials.',
      'error',
      section
    );
    return;
  }
  
  // Default error handling
  this.notificationSystem.notify(
    `Error: ${error.message}`,
    'error',
    section
  );
}
```

## Handling Unsupported Features

Some features available in the Admin API may not be available in the Storefront API. Here's how to handle them:

### 1. Disable Unsupported Actions

For actions not supported by the Storefront API, disable the corresponding UI elements:

```typescript
/**
 * Checks if an action is supported for the current section
 * 
 * @param section - Section ID
 * @param action - Action name
 * @returns Whether the action is supported
 */
isActionSupported(section: string, action: string): boolean {
  // Define supported actions for each section
  const supportedActions: Record<string, string[]> = {
    'products': ['view', 'filter', 'sort'],
    'collections': ['view', 'filter', 'sort'],
    'content': ['view', 'filter', 'sort'],
    'metaobjects': ['view', 'filter', 'sort']
  };
  
  // Check if the action is supported for the section
  return supportedActions[section]?.includes(action) || false;
}
```

### 2. Provide Alternative Workflows

For important features not available in the Storefront API, provide alternative workflows:

```typescript
/**
 * Renders alternative workflow message for unsupported features
 * 
 * @param feature - Feature name
 * @returns HTML for the alternative workflow message
 */
renderAlternativeWorkflow(feature: string): string {
  switch (feature) {
    case 'inventory':
      return `
        <div class="alternative-workflow">
          <h3>Inventory Management</h3>
          <p>Inventory management is not available through the Storefront API. Please use the Shopify Admin to manage inventory.</p>
          <a href="https://admin.shopify.com/inventory" target="_blank" class="admin-link">Open Shopify Admin</a>
        </div>
      `;
    
    case 'files':
      return `
        <div class="alternative-workflow">
          <h3>File Management</h3>
          <p>File management is not available through the Storefront API. Please use the Shopify Admin to manage files.</p>
          <a href="https://admin.shopify.com/settings/files" target="_blank" class="admin-link">Open Shopify Admin</a>
        </div>
      `;
    
    default:
      return `
        <div class="alternative-workflow">
          <h3>Feature Not Available</h3>
          <p>This feature is not available through the Storefront API. Please use the Shopify Admin for full functionality.</p>
          <a href="https://admin.shopify.com" target="_blank" class="admin-link">Open Shopify Admin</a>
        </div>
      `;
  }
}
```

## Testing Considerations

1. **Mock API Responses**: Create mock responses for testing without hitting the actual API
2. **Error Scenarios**: Test various error scenarios (network errors, GraphQL errors, security rejections)
3. **Context Testing**: Test with different country/language contexts
4. **Unsupported Features**: Verify that unsupported features are properly disabled or provide alternatives
5. **Performance**: Test with large datasets to ensure the dashboard remains responsive

## Next Steps

After updating the ProductManagementDashboard, the next steps are:

1. Update the example HTML file to use the new dashboard
2. Create comprehensive tests for the updated dashboard
3. Document the limitations and capabilities of the Storefront API integration
4. Implement performance optimizations for large datasets