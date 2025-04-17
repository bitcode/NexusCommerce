import React, { useState } from 'react';
import DualView from './DualView';

export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children?: HierarchyNode[];
  data?: any;
}

export interface HierarchicalViewProps {
  hierarchy: HierarchyNode;
  title?: string;
  onNodeSelect?: (nodeId: string, nodeType: string) => void;
}

const HierarchicalView: React.FC<HierarchicalViewProps> = ({
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

  const renderNode = (node: HierarchyNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="mb-1">
        <div 
          className={`flex items-center p-2 rounded hover:bg-light-ui dark:hover:bg-dark-ui cursor-pointer ${
            depth > 0 ? 'ml-' + (depth * 4) : ''
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            if (onNodeSelect) {
              onNodeSelect(node.id, node.type);
            }
          }}
        >
          {hasChildren && (
            <span className="mr-2 text-light-syntax-entity dark:text-dark-syntax-entity">
              {isExpanded ? '▼' : '►'}
            </span>
          )}
          <span className={`${!hasChildren ? 'ml-4' : ''}`}>
            {node.name}
            <span className="ml-2 text-sm text-light-fg dark:text-dark-fg opacity-75">
              ({node.type})
            </span>
          </span>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Presentation view of the hierarchy
  const presentationView = (
    <div className="bg-light-bg dark:bg-dark-bg rounded p-4">
      {renderNode(hierarchy)}
    </div>
  );

  // Raw data of the hierarchy
  const rawData = hierarchy;

  return (
    <DualView
      presentationView={presentationView}
      rawData={rawData}
      title={title}
    />
  );
};

export default HierarchicalView;
