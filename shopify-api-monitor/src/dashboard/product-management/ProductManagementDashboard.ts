/**
 * ProductManagementDashboard.ts
 * Main dashboard component for comprehensive product ecosystem management
 */

import { ShopifyApiClient } from '../../ShopifyApiClient';
import { StorefrontApiClient } from '../../StorefrontApiClient';
import { StateManager } from '../../StateManager';
import { DataOperations } from '../../DataOperations';
import { NotificationSystem, NotificationType, NotificationTopic } from '../../NotificationSystem';
import { MutationManager } from '../../MutationManager';
import { DualViewPresentation } from '../dual-view/DualViewPresentation';
import { DashboardIntegration } from '../dual-view/types';
import { 
  STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY,
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_PAGES_QUERY,
  STOREFRONT_BLOGS_QUERY,
  STOREFRONT_METAOBJECTS_BY_TYPE_QUERY
} from '../../queries';
import { extractNodesFromEdges, extractPaginationInfo } from '../../queries/StorefrontQueries';
import { 
  handleError, 
  withRetry, 
  ErrorCategory, 
  RetryOptions, 
  DEFAULT_RETRY_OPTIONS,
  createUserFriendlyErrorMessage
} from '../../ErrorHandlingUtils';

/**
 * Props for the ProductManagementDashboard component
 */
export interface ProductManagementDashboardProps {
  /** Active section to display */
  activeSection?: 'products' | 'collections' | 'inventory' | 'content' | 'metaobjects' | 'files' | 'menus';
  
  /** Callback when section changes */
  onSectionChange?: (section: string) => void;
  
  /** Callback when a notification is triggered */
  onNotification?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

/**
 * Dashboard metrics for product ecosystem
 */
export interface ProductEcosystemMetrics {
  /** Total number of products */
  totalProducts: number;
  
  /** Total number of collections */
  totalCollections: number;
  
  /** Total number of inventory items */
  totalInventoryItems: number;
  
  /** Total number of locations */
  totalLocations: number;
  
  /** Total number of content pages */
  totalPages: number;
  
  /** Total number of blog articles */
  totalArticles: number;
  
  /** Total number of metaobjects */
  totalMetaobjects: number;
  
  /** Total number of files */
  totalFiles: number;
  
  /** Total number of menus */
  totalMenus: number;
}

/**
 * Custom retry options for dashboard operations
 */
const DASHBOARD_RETRY_OPTIONS: RetryOptions = {
  ...DEFAULT_RETRY_OPTIONS,
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000
};

/**
 * Class representing the Product Management Dashboard
 */
export class ProductManagementDashboard implements DashboardIntegration {
  private dataOperations: DataOperations;
  private notificationSystem: NotificationSystem;
  private errorNotificationContainer: HTMLElement | null = null;
  
  /**
   * Creates a new ProductManagementDashboard
   * 
   * @param apiClient - ShopifyApiClient instance
   * @param storefrontApiClient - StorefrontApiClient instance
   * @param stateManager - StateManager instance
   * @param mutationManager - MutationManager instance
   * @param notificationSystem - NotificationSystem instance
   */
  constructor(
    private apiClient: ShopifyApiClient,
    private storefrontApiClient: StorefrontApiClient,
    private stateManager: StateManager,
    private mutationManager: MutationManager,
    notificationSystem: NotificationSystem
  ) {
    this.dataOperations = new DataOperations(apiClient, stateManager, mutationManager);
    this.notificationSystem = notificationSystem;
  }
  
  /**
   * Fetches metrics for the product ecosystem using both Admin API and Storefront API
   * with retry logic for transient errors
   * 
   * @returns Promise resolving to ProductEcosystemMetrics
   */
  async fetchMetrics(): Promise<ProductEcosystemMetrics> {
    try {
      // Use withRetry to handle transient errors when fetching metrics
      return await withRetry(async () => {
        // Fetch Admin API metrics
        const adminMetrics = await this.fetchAdminApiMetrics();
        
        // Fetch Storefront API metrics
        const storefrontMetrics = await this.fetchStorefrontApiMetrics();
        
        // Combine metrics from both APIs
        return {
          totalProducts: Math.max(adminMetrics.totalProducts, storefrontMetrics.totalProducts),
          totalCollections: Math.max(adminMetrics.totalCollections, storefrontMetrics.totalCollections),
          totalInventoryItems: adminMetrics.totalInventoryItems,
          totalLocations: adminMetrics.totalLocations,
          totalPages: Math.max(adminMetrics.totalPages, storefrontMetrics.totalPages),
          totalArticles: Math.max(adminMetrics.totalArticles, storefrontMetrics.totalArticles),
          totalMetaobjects: Math.max(adminMetrics.totalMetaobjects, storefrontMetrics.totalMetaobjects),
          totalFiles: adminMetrics.totalFiles,
          totalMenus: storefrontMetrics.totalMenus
        };
      }, DASHBOARD_RETRY_OPTIONS);
    } catch (error) {
      // Use enhanced error handling
      const userMessage = handleError(error, this.notificationSystem, {
        operation: 'fetchMetrics',
        component: 'ProductManagementDashboard'
      });
      
      // Display error in UI if notification callback is provided
      if (this.errorNotificationContainer) {
        this.showErrorNotification(userMessage);
      }
      
      // Return zeros if metrics fetch fails
      return {
        totalProducts: 0,
        totalCollections: 0,
        totalInventoryItems: 0,
        totalLocations: 0,
        totalPages: 0,
        totalArticles: 0,
        totalMetaobjects: 0,
        totalFiles: 0,
        totalMenus: 0
      };
    }
  }
  
  /**
   * Fetches metrics from the Admin API with retry logic
   * 
   * @returns Promise resolving to ProductEcosystemMetrics
   */
  private async fetchAdminApiMetrics(): Promise<ProductEcosystemMetrics> {
    try {
      // Use withRetry to handle transient errors
      return await withRetry(async () => {
        // Query to fetch counts of various resources
        const query = `
          query GetProductEcosystemMetrics {
            products(first: 0) {
              totalCount
            }
            collections(first: 0) {
              totalCount
            }
            locations(first: 0) {
              totalCount
            }
            pages(first: 0) {
              totalCount
            }
            blogs(first: 1) {
              edges {
                node {
                  articles(first: 0) {
                    totalCount
                  }
                }
              }
              totalCount
            }
            metaobjectDefinitions(first: 0) {
              totalCount
            }
            files(first: 0) {
              totalCount
            }
            menus(first: 0) {
              totalCount
            }
            shop {
              inventoryItems(first: 0) {
                totalCount
              }
            }
          }
        `;
        
        const response = await this.apiClient.request<any>(query);
        const data = response.data;
        
        // Extract metrics from response
        return {
          totalProducts: data?.products?.totalCount || 0,
          totalCollections: data?.collections?.totalCount || 0,
          totalInventoryItems: data?.shop?.inventoryItems?.totalCount || 0,
          totalLocations: data?.locations?.totalCount || 0,
          totalPages: data?.pages?.totalCount || 0,
          totalArticles: data?.blogs?.edges?.reduce((sum: number, blog: any) => sum + (blog.node.articles.totalCount || 0), 0) || 0,
          totalMetaobjects: data?.metaobjectDefinitions?.totalCount || 0,
          totalFiles: data?.files?.totalCount || 0,
          totalMenus: data?.menus?.totalCount || 0
        };
      }, DASHBOARD_RETRY_OPTIONS);
    } catch (error) {
      // Use enhanced error handling
      handleError(error, this.notificationSystem, {
        operation: 'fetchAdminApiMetrics',
        component: 'ProductManagementDashboard'
      });
      
      // Return zeros if metrics fetch fails
      return {
        totalProducts: 0,
        totalCollections: 0,
        totalInventoryItems: 0,
        totalLocations: 0,
        totalPages: 0,
        totalArticles: 0,
        totalMetaobjects: 0,
        totalFiles: 0,
        totalMenus: 0
      };
    }
  }
  
  /**
   * Fetches metrics from the Storefront API with retry logic
   * 
   * @returns Promise resolving to ProductEcosystemMetrics
   */
  private async fetchStorefrontApiMetrics(): Promise<ProductEcosystemMetrics> {
    try {
      // Use withRetry to handle transient errors
      return await withRetry(async () => {
        // Fetch products count
        const productsResponse = await this.storefrontApiClient.request(STOREFRONT_PRODUCTS_QUERY, {
          first: 1
        });
        
        // Fetch collections count
        const collectionsResponse = await this.storefrontApiClient.request(STOREFRONT_COLLECTIONS_QUERY, {
          first: 1
        });
        
        // Fetch pages count
        const pagesResponse = await this.storefrontApiClient.request(STOREFRONT_PAGES_QUERY, {
          first: 1
        });
        
        // Fetch blogs and articles count
        const blogsResponse = await this.storefrontApiClient.request(STOREFRONT_BLOGS_QUERY, {
          first: 1
        });
        
        // Fetch metaobjects count
        const metaobjectsResponse = await this.storefrontApiClient.request(STOREFRONT_METAOBJECTS_BY_TYPE_QUERY, {
          type: "custom_content",
          first: 1
        });
        
        // Fetch shop info with menus
        const shopResponse = await this.storefrontApiClient.request(STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY);
        
        // Extract counts from responses
        const productsData = productsResponse.data?.products;
        const collectionsData = collectionsResponse.data?.collections;
        const pagesData = pagesResponse.data?.pages;
        const blogsData = blogsResponse.data?.blogs;
        const metaobjectsData = metaobjectsResponse.data?.metaobjects;
        const shopData = shopResponse.data?.shop;
        
        // Calculate article count from blogs
        let articleCount = 0;
        if (blogsData?.edges) {
          const blogs = extractNodesFromEdges(blogsData.edges);
          articleCount = blogs.reduce((sum, blog) => {
            return sum + (blog.articles?.edges?.length || 0);
          }, 0);
        }
        
        // Count menus
        const menuCount = (shopData?.navigationMenu ? 1 : 0) + (shopData?.footerMenu ? 1 : 0);
        
        return {
          totalProducts: productsData?.edges?.length || 0,
          totalCollections: collectionsData?.edges?.length || 0,
          totalInventoryItems: 0, // Not available in Storefront API
          totalLocations: 0, // Not available in Storefront API
          totalPages: pagesData?.edges?.length || 0,
          totalArticles: articleCount,
          totalMetaobjects: metaobjectsData?.edges?.length || 0,
          totalFiles: 0, // Not available in Storefront API
          totalMenus: menuCount
        };
      }, DASHBOARD_RETRY_OPTIONS);
    } catch (error) {
      // Use enhanced error handling
      handleError(error, this.notificationSystem, {
        operation: 'fetchStorefrontApiMetrics',
        component: 'ProductManagementDashboard'
      });
      
      // Return zeros if metrics fetch fails
      return {
        totalProducts: 0,
        totalCollections: 0,
        totalInventoryItems: 0,
        totalLocations: 0,
        totalPages: 0,
        totalArticles: 0,
        totalMetaobjects: 0,
        totalFiles: 0,
        totalMenus: 0
      };
    }
  }
  
  /**
   * Renders the dashboard HTML with error notification container
   * 
   * @param props - Dashboard props
   * @param metrics - Product ecosystem metrics
   * @returns HTML string for the dashboard
   */
  renderDashboardHTML(props: ProductManagementDashboardProps, metrics: ProductEcosystemMetrics): string {
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
          <!-- Error notification container -->
          <div id="error-notification-container" class="error-notification-container"></div>
        </header>
        
        <div class="dashboard-content">
          <nav class="dashboard-nav">
            ${navItem('products', 'Products', metrics.totalProducts)}
            ${navItem('collections', 'Collections', metrics.totalCollections)}
            ${navItem('inventory', 'Inventory', metrics.totalInventoryItems)}
            ${navItem('content', 'Content', metrics.totalPages + metrics.totalArticles)}
            ${navItem('metaobjects', 'Metaobjects', metrics.totalMetaobjects)}
            ${navItem('files', 'Files', metrics.totalFiles)}
            ${navItem('menus', 'Menus', metrics.totalMenus)}
          </nav>
          
          <main class="dashboard-main">
            <div class="section-header">
              <h2>${this.getSectionTitle(activeSection)}</h2>
              <div class="section-actions">
                <button class="create-button">Create ${this.getSectionItemName(activeSection)}</button>
                <button class="refresh-button">Refresh</button>
                <!-- Add dual-view toggle here -->
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
      
      <style>
        .product-management-dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        
        .dashboard-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .dashboard-content {
          display: flex;
          gap: 20px;
        }
        
        .dashboard-nav {
          width: 200px;
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .nav-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin-bottom: 5px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .nav-item:hover {
          background-color: #f1f1f1;
        }
        
        .nav-item.active {
          background-color: #5c6ac4;
          color: white;
        }
        
        .nav-count {
          background-color: rgba(0,0,0,0.1);
          border-radius: 10px;
          padding: 2px 8px;
          font-size: 12px;
        }
        
        .nav-item.active .nav-count {
          background-color: rgba(255,255,255,0.2);
        }
        
        .dashboard-main {
          flex: 1;
          background-color: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .section-actions {
          display: flex;
          gap: 10px;
        }
        
        .create-button {
          background-color: #5c6ac4;
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .refresh-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .loading-placeholder {
          padding: 40px;
          text-align: center;
          color: #637381;
          background-color: #f9fafb;
          border-radius: 4px;
        }
        
        /* Dual-view styles */
        .view-mode-toggle {
          display: flex;
          gap: 5px;
        }
        
        .tree-view-toggle, .raw-view-toggle {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .tree-view-toggle.active, .raw-view-toggle.active {
          background-color: #5c6ac4;
          color: white;
          border-color: #5c6ac4;
        }
        
        /* Error notification styles */
        .error-notification-container {
          margin-top: 10px;
        }
        
        .error-notification {
          background-color: #fdf1f0;
          border: 1px solid #fadbd8;
          border-left: 4px solid #e74c3c;
          color: #c0392b;
          padding: 12px 15px;
          margin-bottom: 10px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .error-notification-content {
          flex: 1;
        }
        
        .error-notification-dismiss {
          background: none;
          border: none;
          color: #c0392b;
          cursor: pointer;
          font-size: 16px;
          padding: 0 5px;
        }
        
        .warning-notification {
          background-color: #fef9e7;
          border: 1px solid #fcf3cf;
          border-left: 4px solid #f39c12;
          color: #d35400;
        }
      </style>
    `;
  }
  
  /**
   * Gets the title for a section
   * 
   * @param section - Section ID
   * @returns Section title
   */
  private getSectionTitle(section: string): string {
    switch (section) {
      case 'products': return 'Products';
      case 'collections': return 'Collections';
      case 'inventory': return 'Inventory Management';
      case 'content': return 'Content Management';
      case 'metaobjects': return 'Metaobjects';
      case 'files': return 'Files';
      case 'menus': return 'Navigation Menus';
      default: return 'Products';
    }
  }
  
  /**
   * Gets the item name for a section
   * 
   * @param section - Section ID
   * @returns Item name
   */
  private getSectionItemName(section: string): string {
    switch (section) {
      case 'products': return 'Product';
      case 'collections': return 'Collection';
      case 'inventory': return 'Transfer';
      case 'content': return 'Page';
      case 'metaobjects': return 'Metaobject';
      case 'files': return 'File';
      case 'menus': return 'Menu';
      default: return 'Item';
    }
  }
  
  /**
   * Renders the dual-view presentation for the specified section
   * 
   * @param section - Section ID
   * @returns HTML string for the dual-view presentation
   */
  renderDualViewPresentation(section: string): string {
    const dualView = new DualViewPresentation({ 
      section,
      apiClient: this.apiClient,
      storefrontApiClient: this.storefrontApiClient
    });
    
    // Load data for the section
    setTimeout(() => {
      dualView.loadData(section).catch(error => {
        // Handle errors during data loading
        const userMessage = handleError(error, this.notificationSystem, {
          operation: 'loadData',
          component: 'DualViewPresentation',
          section
        });
        
        // Show error notification
        this.showErrorNotification(userMessage);
      });
    }, 0);
    
    return dualView.render();
  }
  
  /**
   * Initializes the dual-view presentation
   * 
   * @param container - Container element
   * @param section - Section ID
   */
  initDualViewPresentation(container: HTMLElement, section: string): void {
    const dualView = new DualViewPresentation({ 
      section,
      apiClient: this.apiClient,
      storefrontApiClient: this.storefrontApiClient
    });
    
    // Set up error notification container
    this.errorNotificationContainer = container.querySelector('#error-notification-container');
    
    // Load data for the section with retry logic
    withRetry(() => dualView.loadData(section), DASHBOARD_RETRY_OPTIONS)
      .then(() => {
        // Render the dual-view in the container
        container.innerHTML = dualView.render();
        
        // Initialize client-side functionality
        this.initDualViewClientSide(container);
      })
      .catch(error => {
        // Handle errors during data loading
        const userMessage = handleError(error, this.notificationSystem, {
          operation: 'loadData',
          component: 'DualViewPresentation',
          section
        });
        
        // Show error notification
        this.showErrorNotification(userMessage);
        
        // Still render the component with empty data
        container.innerHTML = dualView.render();
        this.initDualViewClientSide(container);
      });
  }
  
  /**
   * Fetches data from the Storefront API for the specified section with retry logic
   * 
   * @param section - Section ID
   * @param first - Number of items to fetch
   * @param after - Cursor for pagination
   * @returns Promise resolving to the fetched data
   */
  async fetchStorefrontData(section: string, first: number = 10, after?: string): Promise<any> {
    try {
      // Use withRetry to handle transient errors
      return await withRetry(async () => {
        let response;
        
        switch (section) {
          case 'products':
            response = await this.storefrontApiClient.request(STOREFRONT_PRODUCTS_QUERY, {
              first,
              after
            });
            return response.data?.products;
            
          case 'collections':
            response = await this.storefrontApiClient.request(STOREFRONT_COLLECTIONS_QUERY, {
              first,
              after
            });
            return response.data?.collections;
            
          case 'content':
            // Fetch both pages and blogs
            const pagesResponse = await this.storefrontApiClient.request(STOREFRONT_PAGES_QUERY, {
              first,
              after
            });
            
            const blogsResponse = await this.storefrontApiClient.request(STOREFRONT_BLOGS_QUERY, {
              first,
              after
            });
            
            return {
              pages: pagesResponse.data?.pages,
              blogs: blogsResponse.data?.blogs
            };
            
          case 'metaobjects':
            response = await this.storefrontApiClient.request(STOREFRONT_METAOBJECTS_BY_TYPE_QUERY, {
              type: "custom_content",
              first,
              after
            });
            return response.data?.metaobjects;
            
          case 'menus':
            response = await this.storefrontApiClient.request(STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY);
            return {
              navigationMenu: response.data?.shop?.navigationMenu,
              footerMenu: response.data?.shop?.footerMenu
            };
            
          default:
            throw new Error(`Unsupported section: ${section}`);
        }
      }, DASHBOARD_RETRY_OPTIONS);
    } catch (error) {
      // Use enhanced error handling
      const userMessage = handleError(error, this.notificationSystem, {
        operation: 'fetchStorefrontData',
        component: 'ProductManagementDashboard',
        section
      });
      
      // Show error notification
      this.showErrorNotification(userMessage);
      
      throw error;
    }
  }
  
  /**
   * Shows an error notification in the UI
   * 
   * @param message - Error message to display
   * @param type - Notification type (default: error)
   */
  private showErrorNotification(message: string, type: 'error' | 'warning' = 'error'): void {
    if (!this.errorNotificationContainer) {
      this.errorNotificationContainer = document.getElementById('error-notification-container');
      if (!this.errorNotificationContainer) return;
    }
    
    const notificationClass = type === 'warning' ? 'warning-notification' : 'error-notification';
    const notification = document.createElement('div');
    notification.className = notificationClass;
    notification.innerHTML = `
      <div class="error-notification-content">${message}</div>
      <button class="error-notification-dismiss">×</button>
    `;
    
    // Add dismiss functionality
    const dismissButton = notification.querySelector('.error-notification-dismiss');
    if (dismissButton) {
      dismissButton.addEventListener('click', () => {
        notification.remove();
      });
    }
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
    
    this.errorNotificationContainer.appendChild(notification);
  }
  
  /**
   * Initializes client-side functionality for the dual-view
   * 
   * @param container - Container element
   */
  private initDualViewClientSide(container: HTMLElement): void {
    // Set up error notification container
    this.errorNotificationContainer = container.querySelector('#error-notification-container');
    
    // Toggle between tree and raw views
    container.querySelectorAll('.toggle-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const viewMode = target.dataset.view;
        
        // Update active button
        container.querySelectorAll('.toggle-button').forEach(btn => {
          btn.classList.remove('active');
        });
        target.classList.add('active');
        
        // Show/hide views
        if (viewMode === 'tree') {
          container.querySelector('.tree-view')!.setAttribute('style', 'display: block');
          container.querySelector('.raw-data-view')!.setAttribute('style', 'display: none');
        } else {
          container.querySelector('.tree-view')!.setAttribute('style', 'display: none');
          container.querySelector('.raw-data-view')!.setAttribute('style', 'display: block');
        }
      });
    });
    
    // Initialize expand/collapse buttons
    container.querySelector('.expand-all-button')?.addEventListener('click', () => {
      container.querySelectorAll('.tree-node.has-children').forEach(node => {
        node.classList.add('expanded');
        node.querySelector('.node-children')?.classList.remove('hidden');
        const expander = node.querySelector('.node-expander');
        if (expander) expander.textContent = '−';
      });
    });
    
    container.querySelector('.collapse-all-button')?.addEventListener('click', () => {
      container.querySelectorAll('.tree-node.has-children').forEach(node => {
        node.classList.remove('expanded');
        node.querySelector('.node-children')?.classList.add('hidden');
        const expander = node.querySelector('.node-expander');
        if (expander) expander.textContent = '+';
      });
    });
    
    // Add refresh button functionality
    container.querySelector('.refresh-button')?.addEventListener('click', () => {
      const section = container.querySelector('.nav-item.active')?.getAttribute('data-section') || 'products';
      
      // Show loading indicator
      const sectionContent = container.querySelector('.section-content');
      if (sectionContent) {
        sectionContent.innerHTML = `
          <div class="loading-placeholder">
            <p>Loading ${this.getSectionTitle(section)}...</p>
          </div>
        `;
      }
      
      // Re-initialize the dual view
      this.initDualViewPresentation(container, section);
    });
  }
}