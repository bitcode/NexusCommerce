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
        
        .node-type-menu {
          color: #f49342;
        }
        
        .node-type-metaobject {
          color: #50b83c;
        }
        
        .node-type-file {
          color: #454f5b;
        }
        
        .node-type-inventory {
          color: #de3618;
        }
        
        .node-type-folder {
          color: #637381;
          font-weight: bold;
        }
        
        .relationship-indicator {
          display: inline-block;
          margin-left: 5px;
          font-size: 0.8em;
          color: #919eab;
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
      
      // Relationship indicator
      const relationshipIndicator = this.props.showRelationships && node.relationships && node.relationships.length > 0
        ? `<span class="relationship-indicator">[${node.relationships.length} rel]</span>`
        : '';
      
      // Children
      const childrenHtml = hasChildren
        ? `<div class="node-children ${isExpanded ? '' : 'hidden'}">${this.renderNodes(node.children!, level + 1)}</div>`
        : '';
      
      return `
        <div class="tree-node ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}" data-node-id="${node.id}">
          <div class="node-line" onclick="handleNodeClick('${node.id}')">
            ${prefix}${expander}${content}${relationshipIndicator}
          </div>
          ${childrenHtml}
        </div>
      `;
    }).join('');
  }
}