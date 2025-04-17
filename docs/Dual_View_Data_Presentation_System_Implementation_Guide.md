# Dual-View Data Presentation System Implementation Guide

This guide provides detailed implementation steps for the dual-view data presentation system. It includes code examples, integration points, and best practices for developers implementing the system.

## Implementation Steps

### 1. Create Directory Structure

First, create the necessary directory structure for the dual-view components:

```
shopify-api-monitor/
└── src/
    └── dashboard/
        └── dual-view/
            ├── DualViewPresentation.ts
            ├── TreeVisualization.ts
            ├── RawDataView.ts
            ├── ToggleController.ts
            └── types.ts
```

### 2. Implement Core Types

Implement the types as defined in the TypeScript interfaces document. These will serve as the foundation for all components.

### 3. Implement DualViewPresentation Component

The DualViewPresentation component is the main container for the dual-view system. It manages the toggle state and renders the appropriate view.

```typescript
/**
 * DualViewPresentation.ts
 * Main component for the dual-view presentation system
 */

import { TreeVisualization } from './TreeVisualization';
import { RawDataView } from './RawDataView';
import { ToggleController } from './ToggleController';
import { DualViewPresentationProps, TreeNode } from './types';

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
      onViewModeChange: (mode) => this.handleViewModeChange(mode)
    });
    
    return `
      <div class="dual-view-container">
        ${toggleController.render()}
        
        <div class="view-container">
          <div class="tree-view" style="display: ${this.currentView === 'tree' ? 'block' : 'none'}">
            ${new TreeVisualization({ nodes: this.nodes }).render()}
          </div>
          
          <div class="raw-data-view" style="display: ${this.currentView === 'raw' ? 'block' : 'none'}">
            ${new RawDataView({ data: this.rawData }).render()}
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
            });
          });
          
          document.querySelector('.collapse-all-button')?.addEventListener('click', () => {
            document.querySelectorAll('.tree-node').forEach(node => {
              node.classList.remove('expanded');
              node.querySelector('.node-children')?.classList.add('hidden');
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
              } else {
                node.classList.add('expanded');
                children?.classList.remove('hidden');
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
   * Loads data for the specified section
   * 
   * @param section - Section ID
   */
  async loadData(section: string): Promise<void> {
    // This would be implemented to fetch data from the API
    // and transform it into the appropriate format
    // For now, we'll use placeholder data
    
    this.nodes = [
      {
        id: 'root',
        name: 'Root',
        type: 'folder',
        expanded: true,
        children: [
          {
            id: 'products',
            name: 'Products',
            type: 'folder',
            expanded: false,
            children: [
              {
                id: 'product1',
                name: 'Product 1',
                type: 'product',
                children: [
                  {
                    id: 'variant1',
                    name: 'Variant 1',
                    type: 'product'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    
    this.rawData = {
      root: {
        products: {
          product1: {
            name: 'Product 1',
            variants: [
              { name: 'Variant 1' }
            ]
          }
        }
      }
    };
  }
}
```

### 4. Implement TreeVisualization Component

The TreeVisualization component renders the hierarchical data in a tree-like structure with ASCII formatting.

```typescript
/**
 * TreeVisualization.ts
 * Component for rendering hierarchical data in a tree-like structure
 */

import { TreeVisualizationProps, TreeNode } from './types';

export class TreeVisualization {
  constructor(private props: TreeVisualizationProps) {}
  
  /**
   * Renders the tree visualization
   * 
   * @returns HTML string for the tree visualization
   */
  render(): string {
    return `
      <div class="tree-visualization">
        ${this.renderNodes(this.props.nodes, 0)}
      </div>
      
      <style>
        .tree-visualization {
          font-family: monospace;
          white-space: nowrap;
          overflow: auto;
        }
        
        .tree-node {
          cursor: pointer;
          margin: 2px 0;
        }
        
        .node-expander {
          display: inline-block;
          width: 15px;
          text-align: center;
          cursor: pointer;
        }
        
        .node-content {
          display: inline-block;
        }
        
        .node-children {
          padding-left: 20px;
        }
        
        .hidden {
          display: none;
        }
        
        .node-type-product {
          color: #5c6ac4;
        }
        
        .node-type-collection {
          color: #47c1bf;
        }
        
        .node-type-page {
          color: #9c6ade;
        }
        
        .node-type-folder {
          color: #637381;
          font-weight: bold;
        }
      </style>
    `;
  }
  
  /**
   * Renders nodes recursively
   * 
   * @param nodes - Nodes to render
   * @param level - Current nesting level
   * @returns HTML string for the nodes
   */
  private renderNodes(nodes: TreeNode[], level: number): string {
    if (!nodes || nodes.length === 0) {
      return '';
    }
    
    return nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = node.expanded === true;
      
      // ASCII characters for the tree structure
      const prefix = level === 0 ? '' : isLast ? '└── ' : '├── ';
      
      // Node expander (+ or -)
      const expander = hasChildren
        ? `<span class="node-expander" data-node-id="${node.id}">${isExpanded ? '−' : '+'}</span>`
        : '<span class="node-expander"></span>';
      
      // Node content
      const content = `<span class="node-content node-type-${node.type}">${node.name}</span>`;
      
      // Children
      const childrenHtml = hasChildren
        ? `<div class="node-children ${isExpanded ? '' : 'hidden'}">${this.renderNodes(node.children!, level + 1)}</div>`
        : '';
      
      return `
        <div class="tree-node ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}" data-node-id="${node.id}">
          <div class="node-line">
            ${prefix}${expander}${content}
          </div>
          ${childrenHtml}
        </div>
      `;
    }).join('');
  }
}
```

### 5. Implement RawDataView Component

The RawDataView component displays the raw data in JSON or YAML format with syntax highlighting.

```typescript
/**
 * RawDataView.ts
 * Component for displaying raw data in JSON or YAML format
 */

import { RawDataViewProps } from './types';

export class RawDataView {
  constructor(private props: RawDataViewProps) {}
  
  /**
   * Renders the raw data view
   * 
   * @returns HTML string for the raw data view
   */
  render(): string {
    const { data, format = 'json', syntaxHighlight = true } = this.props;
    
    // Format the data
    const formattedData = format === 'json'
      ? JSON.stringify(data, null, 2)
      : this.convertToYaml(data);
    
    // Apply syntax highlighting if enabled
    const highlightedData = syntaxHighlight
      ? this.applySyntaxHighlighting(formattedData, format)
      : formattedData;
    
    return `
      <div class="raw-data-view">
        <div class="raw-data-header">
          <div class="format-selector">
            <label>
              <input type="radio" name="format" value="json" ${format === 'json' ? 'checked' : ''}>
              JSON
            </label>
            <label>
              <input type="radio" name="format" value="yaml" ${format === 'yaml' ? 'checked' : ''}>
              YAML
            </label>
          </div>
          
          <button class="copy-button">Copy</button>
        </div>
        
        <pre class="raw-data-content">${highlightedData}</pre>
      </div>
      
      <style>
        .raw-data-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .raw-data-header {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .format-selector {
          display: flex;
          gap: 10px;
        }
        
        .copy-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .raw-data-content {
          flex: 1;
          overflow: auto;
          margin: 0;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 4px;
          font-family: monospace;
          white-space: pre-wrap;
        }
        
        .syntax-string { color: #c2185b; }
        .syntax-number { color: #1976d2; }
        .syntax-boolean { color: #0d47a1; }
        .syntax-null { color: #b71c1c; }
        .syntax-key { color: #7b1fa2; }
      </style>
      
      <script>
        // Client-side script for handling interactions
        document.addEventListener('DOMContentLoaded', () => {
          // Format selector
          document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
              const target = e.target as HTMLInputElement;
              const format = target.value;
              
              // This would trigger a re-render with the new format
              // For now, we'll just log it
              console.log('Format changed to:', format);
            });
          });
          
          // Copy button
          document.querySelector('.copy-button')?.addEventListener('click', () => {
            const content = document.querySelector('.raw-data-content')?.textContent || '';
            navigator.clipboard.writeText(content).then(() => {
              alert('Copied to clipboard!');
            });
          });
        });
      </script>
    `;
  }
  
  /**
   * Converts data to YAML format
   * 
   * @param data - Data to convert
   * @returns YAML string
   */
  private convertToYaml(data: any): string {
    // This is a simplified YAML converter
    // In a real implementation, you would use a library like js-yaml
    
    const convertObject = (obj: any, indent: number = 0): string => {
      const indentStr = ' '.repeat(indent);
      
      return Object.entries(obj).map(([key, value]) => {
        if (value === null) {
          return `${indentStr}${key}: null`;
        }
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          return `${indentStr}${key}:\n${convertObject(value, indent + 2)}`;
        }
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return `${indentStr}${key}: []`;
          }
          
          return `${indentStr}${key}:\n${value.map(item => {
            if (typeof item === 'object' && item !== null) {
              return `${indentStr}- \n${convertObject(item, indent + 4)}`;
            }
            return `${indentStr}- ${item}`;
          }).join('\n')}`;
        }
        
        return `${indentStr}${key}: ${value}`;
      }).join('\n');
    };
    
    return convertObject(data);
  }
  
  /**
   * Applies syntax highlighting to the formatted data
   * 
   * @param data - Formatted data
   * @param format - Data format
   * @returns HTML string with syntax highlighting
   */
  private applySyntaxHighlighting(data: string, format: 'json' | 'yaml'): string {
    // This is a simplified syntax highlighter
    // In a real implementation, you would use a library like highlight.js
    
    if (format === 'json') {
      return data
        .replace(/"([^"]+)":/g, '<span class="syntax-key">"$1"</span>:')
        .replace(/"([^"]+)"/g, '<span class="syntax-string">"$1"</span>')
        .replace(/\b(true|false)\b/g, '<span class="syntax-boolean">$1</span>')
        .replace(/\b(null)\b/g, '<span class="syntax-null">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
    }
    
    // YAML highlighting
    return data
      .replace(/^(\s*)([^:]+):/gm, '$1<span class="syntax-key">$2</span>:')
      .replace(/: (.+)$/gm, ': <span class="syntax-string">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="syntax-boolean">$1</span>')
      .replace(/\b(null)\b/g, '<span class="syntax-null">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
  }
}
```

### 6. Implement ToggleController Component

The ToggleController component provides the UI for switching between tree and raw data views.

```typescript
/**
 * ToggleController.ts
 * Component for toggling between tree and raw data views
 */

import { ToggleControllerProps } from './types';

export class ToggleController {
  constructor(private props: ToggleControllerProps) {}
  
  /**
   * Renders the toggle controller
   * 
   * @returns HTML string for the toggle controller
   */
  render(): string {
    const { currentView } = this.props;
    
    return `
      <div class="toggle-controller">
        <div class="view-toggle">
          <button class="toggle-button tree-view-button ${currentView === 'tree' ? 'active' : ''}" data-view="tree">
            Tree View
          </button>
          <button class="toggle-button raw-view-button ${currentView === 'raw' ? 'active' : ''}" data-view="raw">
            Raw Data
          </button>
        </div>
        
        <div class="tree-controls" style="display: ${currentView === 'tree' ? 'flex' : 'none'}">
          <button class="expand-all-button">Expand All</button>
          <button class="collapse-all-button">Collapse All</button>
        </div>
      </div>
      
      <style>
        .toggle-controller {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .view-toggle {
          display: flex;
          gap: 10px;
        }
        
        .toggle-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .toggle-button.active {
          background-color: #5c6ac4;
          color: white;
          border-color: #5c6ac4;
        }
        
        .tree-controls {
          display: flex;
          gap: 10px;
        }
        
        .expand-all-button, .collapse-all-button {
          background-color: #f4f6f8;
          border: 1px solid #ddd;
          padding: 8px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
    `;
  }
}
```

### 7. Integrate with ProductManagementDashboard

Update the ProductManagementDashboard class to include the dual-view presentation:

```typescript
// In ProductManagementDashboard.ts

import { DualViewPresentation } from '../dual-view/DualViewPresentation';

// Add a new method to render the dual-view presentation
private renderDualViewPresentation(section: string): string {
  const dualView = new DualViewPresentation({ section });
  return dualView.render();
}

// Update the renderDashboardHTML method to include the dual-view toggle
renderDashboardHTML(props: ProductManagementDashboardProps, metrics: ProductEcosystemMetrics): string {
  const { activeSection = 'products' } = props;
  
  // Existing code...
  
  return `
    <div class="product-management-dashboard">
      <!-- Existing header and nav -->
      
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
    
    <!-- Existing styles plus new styles for dual-view -->
  `;
}
```

### 8. Data Transformation Implementation

Create data transformers for each section to convert API data to the TreeNode format:

```typescript
/**
 * ProductsDataTransformer.ts
 * Transforms products data to TreeNode format
 */

import { DataTransformer, TreeNode } from './types';

export class ProductsDataTransformer implements DataTransformer {
  /**
   * Transforms products data to TreeNode format
   * 
   * @param data - Products data from API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[] {
    if (!data || !data.products || !data.products.edges) {
      return [];
    }
    
    const products = data.products.edges.map((edge: any) => edge.node);
    
    return [
      {
        id: 'products-root',
        name: 'Products',
        type: 'folder',
        expanded: true,
        children: products.map((product: any) => ({
          id: product.id,
          name: product.title,
          type: 'product',
          expanded: false,
          data: product,
          children: product.variants?.edges?.map((edge: any) => {
            const variant = edge.node;
            return {
              id: variant.id,
              name: variant.title,
              type: 'product',
              data: variant
            };
          }) || []
        }))
      }
    ];
  }
  
  /**
   * Transforms products data to raw data format
   * 
   * @param data - Products data from API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // For YAML, you would use a library like js-yaml
    // This is a placeholder
    return JSON.stringify(data, null, 2);
  }
}
```

### 9. Client-Side Initialization

Add client-side initialization code to make the dual-view interactive:

```typescript
/**
 * Initialize the dual-view presentation
 */
function initDualViewPresentation() {
  // Toggle between tree and raw views
  document.querySelectorAll('.view-mode-toggle button').forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const viewMode = target.classList.contains('tree-view-toggle') ? 'tree' : 'raw';
      
      // Update active button
      document.querySelectorAll('.view-mode-toggle button').forEach(btn => {
        btn.classList.remove('active');
      });
      target.classList.add('active');
      
      // Show/hide views
      const treeView = document.querySelector('.tree-view');
      const rawView = document.querySelector('.raw-data-view');
      
      if (viewMode === 'tree') {
        treeView.style.display = 'block';
        rawView.style.display = 'none';
      } else {
        treeView.style.display = 'none';
        rawView.style.display = 'block';
      }
    });
  });
  
  // Expand/collapse tree nodes
  document.querySelectorAll('.node-expander').forEach(expander => {
    expander.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const node = target.closest('.tree-node');
      const children = node.querySelector('.node-children');
      
      if (node.classList.contains('expanded')) {
        node.classList.remove('expanded');
        children.classList.add('hidden');
        target.textContent = '+';
      } else {
        node.classList.add('expanded');
        children.classList.remove('hidden');
        target.textContent = '−';
      }
      
      e.stopPropagation();
    });
  });
  
  // Expand/collapse all nodes
  document.querySelector('.expand-all-button')?.addEventListener('click', () => {
    document.querySelectorAll('.tree-node.has-children').forEach(node => {
      node.classList.add('expanded');
      node.querySelector('.node-children')?.classList.remove('hidden');
      node.querySelector('.node-expander').textContent = '−';
    });
  });
  
  document.querySelector('.collapse-all-button')?.addEventListener('click', () => {
    document.querySelectorAll('.tree-node.has-children').forEach(node => {
      node.classList.remove('expanded');
      node.querySelector('.node-children')?.classList.add('hidden');
      node.querySelector('.node-expander').textContent = '+';
    });
  });
}

// Call the initialization function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initDualViewPresentation);
```

## Testing and Debugging

### Unit Testing

Create unit tests for the data transformation functions:

```typescript
/**
 * Test data transformation
 */
function testDataTransformation() {
  const transformer = new ProductsDataTransformer();
  
  // Test with empty data
  const emptyResult = transformer.transformToTreeNodes({});
  console.assert(Array.isArray(emptyResult) && emptyResult.length === 0, 'Empty data should return empty array');
  
  // Test with sample data
  const sampleData = {
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
  
  const result = transformer.transformToTreeNodes(sampleData);
  console.assert(result.length === 1, 'Should return one root node');
  console.assert(result[0].children.length === 1, 'Root should have one product child');
  console.assert(result[0].children[0].children.length === 1, 'Product should have one variant child');
}
```

### Integration Testing

Test the integration with the ProductManagementDashboard:

```typescript
/**
 * Test dashboard integration
 */
function testDashboardIntegration() {
  const dashboard = new ProductManagementDashboard(apiClient, stateManager, mutationManager, notificationSystem);
  const html = dashboard.renderDashboardHTML({ activeSection: 'products' }, metrics);
  
  // Check if the dual-view toggle is present
  console.assert(html.includes('tree-view-toggle'), 'Tree view toggle should be present');
  console.assert(html.includes('raw-view-toggle'), 'Raw view toggle should be present');
  
  // Check if the dual-view container is present
  console.assert(html.includes('dual-view-container'), 'Dual-view container should be present');
}
```

## Best Practices

1. **Performance Optimization**
   - Use virtualized rendering for large trees
   - Implement lazy loading for expanded nodes
   - Cache transformed data using StateManager

2. **Accessibility**
   - Ensure keyboard navigation works for all interactive elements
   - Add proper ARIA attributes for tree structure
   - Maintain sufficient color contrast

3. **Error Handling**
   - Handle API errors gracefully
   - Provide fallback UI for missing data
   - Log errors for debugging

4. **Code Organization**
   - Keep components small and focused
   - Use interfaces for type safety
   - Document public APIs

5. **Testing**
   - Write unit tests for data transformation
   - Test with different data structures
   - Verify browser compatibility

## Conclusion

This implementation guide provides a detailed roadmap for implementing the dual-view data presentation system. By following these steps, you can create a powerful visualization tool that helps developers understand the application's structure and relationships.

Remember to adapt the code examples to your specific needs and integrate with your existing codebase. The dual-view system is designed to be flexible and extensible, so feel free to customize it to better suit your requirements.