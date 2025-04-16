/**
 * ProductManagementDashboard.ts
 * Main dashboard component for comprehensive product ecosystem management
 */

import { ShopifyApiClient } from '../../ShopifyApiClient';
import { StateManager } from '../../StateManager';
import { DataOperations } from '../../DataOperations';
import { NotificationSystem, NotificationType, NotificationTopic } from '../../NotificationSystem';
import { MutationManager } from '../../MutationManager';

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
 * Class representing the Product Management Dashboard
 */
export class ProductManagementDashboard {
  private dataOperations: DataOperations;
  private notificationSystem: NotificationSystem;
  
  /**
   * Creates a new ProductManagementDashboard
   * 
   * @param apiClient - ShopifyApiClient instance
   * @param stateManager - StateManager instance
   * @param mutationManager - MutationManager instance
   * @param notificationSystem - NotificationSystem instance
   */
  constructor(
    private apiClient: ShopifyApiClient,
    private stateManager: StateManager,
    private mutationManager: MutationManager,
    notificationSystem: NotificationSystem
  ) {
    this.dataOperations = new DataOperations(apiClient, stateManager, mutationManager);
    this.notificationSystem = notificationSystem;
  }
  
  /**
   * Fetches metrics for the product ecosystem
   * 
   * @returns Promise resolving to ProductEcosystemMetrics
   */
  async fetchMetrics(): Promise<ProductEcosystemMetrics> {
    try {
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
    } catch (error) {
      console.error('Error fetching product ecosystem metrics:', error);
      this.notificationSystem.notify(
        `Failed to fetch dashboard metrics: ${(error as Error).message}`,
        NotificationType.ERROR,
        NotificationTopic.SYSTEM
      );
      
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
   * Renders the dashboard HTML
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
              </div>
            </div>
            
            <div class="section-content">
              <!-- Content will be loaded dynamically based on active section -->
              <div class="loading-placeholder">Loading ${this.getSectionTitle(activeSection)}...</div>
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
}