/**
 * ProductManagementDashboard.ts
 * Dashboard for managing Shopify products and related resources.
 */

import { StorefrontApiClient } from '../StorefrontApiClient';
import { StorefrontContext } from '../types/StorefrontConfig';
import { StorefrontDataTransformerFactory } from './dual-view/transformers/StorefrontDataTransformerFactory';
import { TreeNode } from './dual-view/types/TreeNode';
import { 
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_PAGES_QUERY,
  STOREFRONT_BLOGS_QUERY,
  STOREFRONT_METAOBJECTS_BY_TYPE_QUERY,
  STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY
} from '../queries';

/**
 * Dashboard for managing Shopify products and related resources.
 * Supports both Admin API and Storefront API data sources.
 */
export class ProductManagementDashboard {
  private activeSection: string = 'products';
  private viewMode: 'tree' | 'raw' = 'tree';
  private treeData: TreeNode[] = [];
  private rawData: string = '';
  private currentContext?: StorefrontContext;
  
  /**
   * Loads a section of the dashboard with data from the Storefront API
   * 
   * @param section - Section to load
   * @param client - StorefrontApiClient instance
   * @param transformerFactory - Optional transformer factory
   */
  async loadSection(
    section: string,
    client: StorefrontApiClient,
    transformerFactory?: StorefrontDataTransformerFactory
  ): Promise<void> {
    try {
      this.activeSection = section;
      
      // Use default transformer factory if not provided
      const factory = transformerFactory || new StorefrontDataTransformerFactory();
      
      // Determine query based on section
      let query: string;
      let variables: any = { first: 20 };
      
      switch (section) {
        case 'storefront-products':
          query = STOREFRONT_PRODUCTS_QUERY;
          break;
        case 'storefront-collections':
          query = STOREFRONT_COLLECTIONS_QUERY;
          break;
        case 'storefront-pages':
          query = STOREFRONT_PAGES_QUERY;
          break;
        case 'storefront-blogs':
          query = STOREFRONT_BLOGS_QUERY;
          break;
        case 'storefront-metaobjects':
          query = STOREFRONT_METAOBJECTS_BY_TYPE_QUERY;
          variables.type = 'product_information';
          break;
        case 'storefront-menus':
          query = STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY;
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      // Fetch data from Storefront API
      const response = await client.request(query, variables);
      
      if (!response.data) {
        throw new Error('No data returned from Storefront API');
      }
      
      // Create transformer for this section
      const transformer = factory.createTransformer(section);
      
      // Transform data for tree view
      this.treeData = transformer.transformToTreeNodes(response.data);
      
      // Transform data for raw view
      this.rawData = transformer.transformToRawData(response.data, 'json');
      
      // Render views based on current view mode
      this.renderTreeView(this.treeData);
      this.renderRawDataView(this.rawData);
    } catch (error: any) {
      this.displayError(`Error loading ${section}: ${error.message}`);
    }
  }
  
  /**
   * Updates the context for the Storefront API client
   * 
   * @param context - New context
   * @param client - StorefrontApiClient instance
   */
  updateContext(context: StorefrontContext, client: StorefrontApiClient): void {
    try {
      this.currentContext = context;
      client.setContext(context);
      
      // Reload current section with new context
      this.loadSection(this.activeSection, client);
    } catch (error: any) {
      this.displayError(`Error updating context: ${error.message}`);
    }
  }
  
  /**
   * Sets the view mode (tree or raw)
   * 
   * @param mode - View mode
   */
  setViewMode(mode: 'tree' | 'raw'): void {
    this.viewMode = mode;
    
    if (mode === 'tree') {
      this.renderTreeView(this.treeData);
    } else {
      this.renderRawDataView(this.rawData);
    }
  }
  
  /**
   * Renders the tree view
   * 
   * @param data - Tree data
   */
  renderTreeView(data: TreeNode[]): void {
    // In a real implementation, this would render the tree view to the DOM
    console.log('Rendering tree view with data:', data);
  }
  
  /**
   * Renders the raw data view
   * 
   * @param data - Raw data
   */
  renderRawDataView(data: string): void {
    // In a real implementation, this would render the raw data view to the DOM
    console.log('Rendering raw data view with data:', data);
  }
  
  /**
   * Displays an error message
   * 
   * @param message - Error message
   */
  displayError(message: string): void {
    // In a real implementation, this would display an error message to the user
    console.error('Dashboard error:', message);
  }
}
