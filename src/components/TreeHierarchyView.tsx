import React, { useState } from 'react';
import DualView from './DualView';

export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children?: HierarchyNode[];
  data?: any;
  expanded?: boolean;
}

export interface TreeHierarchyViewProps {
  hierarchy: HierarchyNode;
  title?: string;
  onNodeSelect?: (nodeId: string, nodeType: string) => void;
}

const TreeHierarchyView: React.FC<TreeHierarchyViewProps> = ({
  hierarchy,
  title = 'Hierarchy',
  onNodeSelect,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [hierarchy.id]: true, // Root node is expanded by default
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const expandAll = () => {
    const allNodes: Record<string, boolean> = {};
    
    const traverseAndExpand = (node: HierarchyNode) => {
      allNodes[node.id] = true;
      if (node.children) {
        node.children.forEach(traverseAndExpand);
      }
    };
    
    traverseAndExpand(hierarchy);
    setExpandedNodes(allNodes);
  };

  const collapseAll = () => {
    setExpandedNodes({ [hierarchy.id]: true }); // Keep only root expanded
  };

  const renderTreeNodes = (nodes: HierarchyNode[], level = 0, parentPath: string[] = []) => {
    if (!nodes || nodes.length === 0) {
      return null;
    }

    return nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes[node.id] || false;
      const currentPath = [...parentPath, node.id];
      
      // Determine the prefix based on the path and whether this is the last node
      const getPrefix = (idx: number) => {
        if (idx >= parentPath.length) return '';
        
        const isLastInPath = parentPath.indexOf(parentPath[idx]) === parentPath.length - 1;
        return isLastInPath ? '    ' : '│   ';
      };
      
      // Build the complete prefix
      let prefix = '';
      for (let i = 0; i < level; i++) {
        prefix += getPrefix(i);
      }
      
      // Add the connector for this node
      prefix += isLast ? '└── ' : '├── ';
      
      return (
        <div key={node.id} className="tree-node">
          <div 
            className={`flex items-start cursor-pointer ${hasChildren ? 'font-medium' : ''}`}
            onClick={() => {
              if (hasChildren) {
                toggleNode(node.id);
              }
              if (onNodeSelect) {
                onNodeSelect(node.id, node.type);
              }
            }}
          >
            <pre className="mr-2 font-mono text-light-fg dark:text-dark-fg">{prefix}</pre>
            <div>
              <span className={`${node.type === 'folder' ? 'text-light-syntax-entity dark:text-dark-syntax-entity' : 
                               node.type === 'product' ? 'text-light-syntax-string dark:text-dark-syntax-string' : 
                               'text-light-syntax-func dark:text-dark-syntax-func'}`}>
                {node.name}
              </span>
              {hasChildren && (
                <span className="ml-2 text-light-syntax-entity dark:text-dark-syntax-entity">
                  {isExpanded ? '−' : '+'}
                </span>
              )}
              <span className="ml-2 text-xs text-light-fg dark:text-dark-fg opacity-75">
                ({node.type})
              </span>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderTreeNodes(node.children!, level + 1, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  // Presentation view of the hierarchy with tree controls
  const presentationView = (
    <div className="bg-light-bg dark:bg-dark-bg rounded p-4">
      <div className="flex justify-end mb-4 space-x-2">
        <button 
          onClick={expandAll}
          className="px-3 py-1 text-sm rounded-md bg-light-editor dark:bg-dark-editor hover:bg-light-ui dark:hover:bg-dark-ui transition-colors"
        >
          Expand All
        </button>
        <button 
          onClick={collapseAll}
          className="px-3 py-1 text-sm rounded-md bg-light-editor dark:bg-dark-editor hover:bg-light-ui dark:hover:bg-dark-ui transition-colors"
        >
          Collapse All
        </button>
      </div>
      
      <div className="font-mono whitespace-pre overflow-auto">
        {renderTreeNodes([hierarchy])}
      </div>
    </div>
  );

  // Raw data of the hierarchy
  const rawData = hierarchy;

  return (
    <DualView
      presentationView={presentationView}
      rawData={rawData}
      title={title}
      expandable={true}
      defaultExpanded={false}
      maxCollapsedHeight={400}
      maxExpandedHeight={800}
    />
  );
};

export default TreeHierarchyView;
