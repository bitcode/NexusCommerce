import React, { useState } from 'react';
import '../styles/dualView.css';

/**
 * DualViewHierarchy Component
 * 
 * A component that provides both a presentation view and a raw data view
 * with a Linux-style tree hierarchy visualization using ASCII characters.
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the component
 * @param {Object} props.data - The data to display
 * @param {string} [props.initialView='presentation'] - Initial view mode ('presentation' or 'raw')
 */
const DualViewHierarchy = ({ title, data, initialView = 'presentation' }) => {
  const [viewMode, setViewMode] = useState(initialView);
  const [expandedNodes, setExpandedNodes] = useState({});

  // Toggle between presentation and raw data views
  const toggleView = (mode) => {
    setViewMode(mode);
  };

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Expand all nodes
  const expandAll = () => {
    const allExpanded = {};
    
    const traverseAndExpand = (node) => {
      if (!node) return;
      
      if (node.id) {
        allExpanded[node.id] = true;
      }
      
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverseAndExpand);
      }
    };
    
    traverseAndExpand(data);
    setExpandedNodes(allExpanded);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Get CSS class based on node type
  const getNodeTypeClass = (type) => {
    if (!type) return '';
    
    return `node-type-${type.toLowerCase()}`;
  };

  // Render tree node
  const renderTreeNode = (node, level = 0, isLast = true, prefix = '') => {
    if (!node) return null;
    
    const nodeId = node.id || `node-${level}-${Math.random().toString(36).substr(2, 9)}`;
    const isExpanded = expandedNodes[nodeId] || false;
    const hasChildren = node.children && node.children.length > 0;
    
    // ASCII characters for tree visualization
    const verticalLine = '│';
    const corner = '└─';
    const tee = '├─';
    const horizontal = '──';
    
    // Determine the connector based on whether this is the last child
    const connector = isLast ? corner : tee;
    
    // Build the line prefix
    const linePrefix = level === 0 ? '' : `${prefix}${connector}${horizontal} `;
    
    // Determine the prefix for children
    const childPrefix = level === 0 ? '' : `${prefix}${isLast ? '    ' : `${verticalLine}   `}`;
    
    return (
      <div key={nodeId} className="tree-node">
        <div className="flex items-start">
          <div className="whitespace-pre text-gray-500 dark:text-gray-400 font-mono tree-prefix">
            {linePrefix}
          </div>
          <div className="flex-1">
            <span 
              className={`cursor-pointer ${hasChildren ? 'font-medium' : ''}`}
              onClick={() => {
                if (hasChildren) {
                  toggleNode(nodeId);
                }
              }}
            >
              {hasChildren && (
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              )}
              <span className={`${getNodeTypeClass(node.type)}`}>
                {node.name || node.id || 'Unnamed Node'}
              </span>
              {node.type && (
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                  ({node.type})
                </span>
              )}
            </span>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children.map((child, index) => 
              renderTreeNode(
                child, 
                level + 1, 
                index === node.children.length - 1,
                childPrefix
              )
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dual-view-container">
      {title && (
        <div className="dual-view-header">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex space-x-2">
            <button
              onClick={() => toggleView('presentation')}
              className={`view-toggle-button ${viewMode === 'presentation' ? 'active' : ''}`}
            >
              Presentation View
            </button>
            <button
              onClick={() => toggleView('raw')}
              className={`view-toggle-button ${viewMode === 'raw' ? 'active' : ''}`}
            >
              Raw Data
            </button>
          </div>

          {viewMode === 'presentation' && (
            <div className="flex space-x-2">
              <button
                onClick={expandAll}
                className="control-button"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="control-button"
              >
                Collapse All
              </button>
            </div>
          )}

          {viewMode === 'raw' && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                alert('Copied to clipboard!');
              }}
              className="control-button"
            >
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="dual-view-content">
        {viewMode === 'presentation' ? (
          <div className="font-mono">
            {renderTreeNode(data)}
          </div>
        ) : (
          <div className="raw-data-view">
            <pre>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualViewHierarchy;