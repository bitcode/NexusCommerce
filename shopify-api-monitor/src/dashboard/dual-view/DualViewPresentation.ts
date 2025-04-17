/**
 * DualViewPresentation.ts
 * Main component for the dual-view presentation system
 */

import { TreeVisualization } from './TreeVisualization';
import { RawDataView } from './RawDataView';
import { ToggleController } from './ToggleController';
import { DualViewPresentationProps, TreeNode } from './types';
import { DataTransformerFactory } from './transformers/DataTransformerFactory';
import { StorefrontDataTransformerFactory } from './transformers/StorefrontDataTransformerFactory';
import { 
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_PAGES_QUERY,
  STOREFRONT_BLOGS_QUERY,
  STOREFRONT_METAOBJECTS_BY_TYPE_QUERY,
  STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY
} from '../../queries';

export class DualViewPresentation {
  private currentView: 'tree' | 'raw';
  private nodes: TreeNode[] = [];
  private rawData: any = {};
  
  constructor(private props: DualViewPresentationProps = { section: 'products' }) {
    this.currentView = props.options?.initialView || 'tree';
  }
  
  /**
   * Renders the dual-view presentation
   * 
   * @returns HTML string for the dual-view presentation
   */
  render(): string {
    const toggleController = new ToggleController({
      currentView: this.currentView,
      onViewModeChange: (mode: 'tree' | 'raw') => this.handleViewModeChange(mode),
      onExpandAll: () => this.handleExpandAll(),
      onCollapseAll: () => this.handleCollapseAll()
    });
    
    return `
      <div class="dual-view-container">
        ${toggleController.render()}
        
        <div class="view-container">
          <div class="tree-view" style="display: ${this.currentView === 'tree' ? 'block' : 'none'}">
            ${new TreeVisualization({ 
              nodes: this.nodes,
              showRelationships: this.props.options?.showRelationships,
              onNodeClick: this.props.onNodeClick,
              onNodeToggle: (node: TreeNode, expanded: boolean) => this.handleNodeToggle(node, expanded)
            }).render()}
          </div>
          
          <div class="raw-data-view" style="display: ${this.currentView === 'raw' ? 'block' : 'none'}">
            ${new RawDataView({ 
              data: this.rawData,
              format: this.props.options?.rawFormat || 'json',
              syntaxHighlight: this.props.options?.syntaxHighlight !== false,
              onCopy: () => this.handleCopy()
            }).render()}
          </div>
        </div>
      </div>
      
      <style>
        .dual-view-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        
        .view-container {
          flex: 1;
          overflow: auto;
        }
        
        .tree-view, .raw-data-view {
          height: 100%;
          padding: 15px;
        }
      </style>
      
      <script>
        // Client-side script for handling interactions
        document.addEventListener('DOMContentLoaded', () => {
          // Initialize toggle buttons
          document.querySelectorAll('.toggle-button').forEach(button => {
            button.addEventListener('click', (e) => {
              const target = e.target as HTMLElement;
              const viewMode = target.dataset.view;
              
              // Update active button
              document.querySelectorAll('.toggle-button').forEach(btn => {
                btn.classList.remove('active');
              });
              target.classList.add('active');
              
              // Show/hide views
              if (viewMode === 'tree') {
                document.querySelector('.tree-view').style.display = 'block';
                document.querySelector('.raw-data-view').style.display = 'none';
              } else {
                document.querySelector('.tree-view').style.display = 'none';
                document.querySelector('.raw-data-view').style.display = 'block';
              }
            });
          });
          
          // Initialize expand/collapse buttons
          document.querySelector('.expand-all-button')?.addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(node => {
              node.classList.add('expanded');
              node.querySelector('.node-children')?.classList.remove('hidden');
              const expander = node.querySelector('.node-expander');
              if (expander) expander.textContent = '−';
            });
          });
          
          document.querySelector('.collapse-all-button')?.addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(node => {
              node.classList.remove('expanded');
              node.querySelector('.node-children')?.classList.add('hidden');
              const expander = node.querySelector('.node-expander');
              if (expander) expander.textContent = '+';
            });
          });
          
          // Initialize node expanders
          document.querySelectorAll('.node-expander').forEach(expander => {
            expander.addEventListener('click', (e) => {
              const target = e.target as HTMLElement;
              const node = target.closest('.tree-node');
              const children = node.querySelector('.node-children');
              
              if (node.classList.contains('expanded')) {
                node.classList.remove('expanded');
                children?.classList.add('hidden');
                target.textContent = '+';
              } else {
                node.classList.add('expanded');
                children?.classList.remove('hidden');
                target.textContent = '−';
              }
              
              e.stopPropagation();
            });
          });
        });
      </script>
    `;
  }
  
  /**
   * Handles view mode change
   * 
   * @param mode - New view mode
   */
  private handleViewModeChange(mode: 'tree' | 'raw'): void {
    this.currentView = mode;
    if (this.props.onViewModeChange) {
      this.props.onViewModeChange(mode);
    }
  }
  
  /**
   * Handles node toggle (expand/collapse)
   * 
   * @param node - Node that was toggled
   * @param expanded - Whether the node is expanded
   */
  private handleNodeToggle(node: TreeNode, expanded: boolean): void {
    // Update the node's expanded state
    this.updateNodeExpandedState(this.nodes, node.id, expanded);
  }
  
  /**
   * Updates a node's expanded state recursively
   * 
   * @param nodes - Nodes to search
   * @param nodeId - ID of the node to update
   * @param expanded - New expanded state
   * @returns Whether the node was found and updated
   */
  private updateNodeExpandedState(nodes: TreeNode[], nodeId: string, expanded: boolean): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      if (node.id === nodeId) {
        node.expanded = expanded;
        return true;
      }
      
      if (node.children && node.children.length > 0) {
        if (this.updateNodeExpandedState(node.children, nodeId, expanded)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Handles expand all action
   */
  private handleExpandAll(): void {
    this.setAllNodesExpandedState(this.nodes, true);
  }
  
  /**
   * Handles collapse all action
   */
  private handleCollapseAll(): void {
    this.setAllNodesExpandedState(this.nodes, false);
  }
  
  /**
   * Sets expanded state for all nodes
   * 
   * @param nodes - Nodes to update
   * @param expanded - New expanded state
   */
  private setAllNodesExpandedState(nodes: TreeNode[], expanded: boolean): void {
    for (const node of nodes) {
      node.expanded = expanded;
      
      if (node.children && node.children.length > 0) {
        this.setAllNodesExpandedState(node.children, expanded);
      }
    }
  }
  
  /**
   * Handles copy action
   */
  private handleCopy(): void {
    // This is handled client-side in the RawDataView component
  }
  
  /**
   * Loads data for the specified section
   * 
   * @param section - Section ID
   */
  async loadData(section: string): Promise<void> {
    try {
      let apiData;
      
      // Check if we have API clients available
      if (this.props.storefrontApiClient) {
        // Use Storefront API client to fetch data
        apiData = await this.fetchStorefrontData(section);
      } else {
        // Fallback to placeholder data
        apiData = this.getPlaceholderData(section);
      }
      
      // Use the appropriate transformer for the section
      let transformer;
      if (this.props.storefrontApiClient) {
        // Use Storefront transformers for Storefront API data
        const transformerFactory = new StorefrontDataTransformerFactory();
        transformer = transformerFactory.createTransformer(section);
      } else {
        // Use regular transformers for Admin API data
        const transformerFactory = new DataTransformerFactory();
        transformer = transformerFactory.createTransformer(section);
      }
      
      // Transform the data
      this.nodes = transformer.transformToTreeNodes(apiData);
      this.rawData = apiData;
      
      console.log(`Loaded data for section: ${section}`);
    } catch (error) {
      console.error(`Error loading data for section ${section}:`, error);
      
      // Fallback to empty data
      this.nodes = [];
      this.rawData = {};
    }
  }
  
  /**
   * Fetches data from the Storefront API for the specified section
   * 
   * @param section - Section ID
   * @param first - Number of items to fetch
   * @param after - Cursor for pagination
   * @returns Promise resolving to the fetched data
   */
  private async fetchStorefrontData(section: string, first: number = 10, after?: string): Promise<any> {
    try {
      let response;
      
      switch (section) {
        case 'products':
          response = await this.props.storefrontApiClient.request(STOREFRONT_PRODUCTS_QUERY, {
            first,
            after
          });
          return response.data;
          
        case 'collections':
          response = await this.props.storefrontApiClient.request(STOREFRONT_COLLECTIONS_QUERY, {
            first,
            after
          });
          return response.data;
          
        case 'content':
          // Fetch both pages and blogs
          const pagesResponse = await this.props.storefrontApiClient.request(STOREFRONT_PAGES_QUERY, {
            first,
            after
          });
          
          const blogsResponse = await this.props.storefrontApiClient.request(STOREFRONT_BLOGS_QUERY, {
            first,
            after
          });
          
          return {
            pages: pagesResponse.data?.pages,
            blogs: blogsResponse.data?.blogs
          };
          
        case 'metaobjects':
          response = await this.props.storefrontApiClient.request(STOREFRONT_METAOBJECTS_BY_TYPE_QUERY, {
            type: "custom_content",
            first,
            after
          });
          return response.data;
          
        case 'menus':
          response = await this.props.storefrontApiClient.request(STOREFRONT_SHOP_INFO_WITH_MENUS_QUERY);
          return response.data;
          
        default:
          throw new Error(`Unsupported section: ${section}`);
      }
    } catch (error) {
      console.error(`Error fetching Storefront API data for section ${section}:`, error);
      throw error;
    }
  }
  
  /**
   * Gets placeholder data for the specified section
   * 
   * @param section - Section ID
   * @returns Placeholder data
   */
  private getPlaceholderData(section: string): any {
    // This would be replaced with actual API calls
    switch (section) {
      case 'products':
        return {
          products: {
            edges: [
              {
                node: {
                  id: 'product1',
                  title: 'Product 1',
                  variants: {
                    edges: [
                      {
                        node: {
                          id: 'variant1',
                          title: 'Variant 1'
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        };
      
      default:
        return {
          [section]: {
            edges: []
          }
        };
    }
  }
}