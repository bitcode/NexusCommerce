# Dual-View Data Presentation System TypeScript Interfaces

This document defines the TypeScript interfaces for the dual-view data presentation system. These interfaces will serve as the foundation for implementing the components described in the design plan.

## Core Data Structures

```typescript
/**
 * Represents a node in the tree visualization
 */
export interface TreeNode {
  /** Unique identifier for the node */
  id: string;
  
  /** Display name for the node */
  name: string;
  
  /** Type of the node, used for styling and icons */
  type: 'product' | 'collection' | 'page' | 'menu' | 'metaobject' | 'file' | 'inventory' | 'folder';
  
  /** Child nodes */
  children?: TreeNode[];
  
  /** Raw data associated with this node */
  data?: any;
  
  /** Whether the node is expanded in the tree view */
  expanded?: boolean;
  
  /** ID of the parent node */
  parent?: string;
  
  /** Relationships to other nodes */
  relationships?: Relationship[];
}

/**
 * Represents a relationship between nodes
 */
export interface Relationship {
  /** ID of the related node */
  id: string;
  
  /** Type of relationship */
  type: string;
  
  /** Direction of the relationship */
  direction: 'to' | 'from' | 'bidirectional';
}

/**
 * Options for the dual-view presentation
 */
export interface DualViewOptions {
  /** Initial view mode */
  initialView?: 'tree' | 'raw';
  
  /** Whether to expand all nodes initially */
  expandAll?: boolean;
  
  /** Format for the raw data view */
  rawFormat?: 'json' | 'yaml';
  
  /** Whether to enable syntax highlighting */
  syntaxHighlight?: boolean;
  
  /** Whether to show relationship indicators */
  showRelationships?: boolean;
}
```

## Component Interfaces

```typescript
/**
 * Props for the DualViewPresentation component
 */
export interface DualViewPresentationProps {
  /** Section ID to display data for */
  section: string;
  
  /** Options for the dual-view */
  options?: DualViewOptions;
  
  /** Callback when a node is clicked */
  onNodeClick?: (node: TreeNode) => void;
  
  /** Callback when the view mode changes */
  onViewModeChange?: (mode: 'tree' | 'raw') => void;
}

/**
 * Props for the TreeVisualization component
 */
export interface TreeVisualizationProps {
  /** Root nodes of the tree */
  nodes: TreeNode[];
  
  /** Whether to show relationship indicators */
  showRelationships?: boolean;
  
  /** Callback when a node is clicked */
  onNodeClick?: (node: TreeNode) => void;
  
  /** Callback when a node is expanded/collapsed */
  onNodeToggle?: (node: TreeNode, expanded: boolean) => void;
}

/**
 * Props for the RawDataView component
 */
export interface RawDataViewProps {
  /** Data to display */
  data: any;
  
  /** Format for the data */
  format?: 'json' | 'yaml';
  
  /** Whether to enable syntax highlighting */
  syntaxHighlight?: boolean;
  
  /** Callback when the copy button is clicked */
  onCopy?: () => void;
}

/**
 * Props for the ToggleController component
 */
export interface ToggleControllerProps {
  /** Current view mode */
  currentView: 'tree' | 'raw';
  
  /** Callback when the view mode changes */
  onViewModeChange: (mode: 'tree' | 'raw') => void;
  
  /** Callback when the expand all button is clicked */
  onExpandAll?: () => void;
  
  /** Callback when the collapse all button is clicked */
  onCollapseAll?: () => void;
}
```

## Data Transformation Interfaces

```typescript
/**
 * Interface for data transformers
 */
export interface DataTransformer {
  /**
   * Transforms data from the API format to the TreeNode format
   * 
   * @param data - Data from the API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[];
  
  /**
   * Transforms data from the API format to the raw data format
   * 
   * @param data - Data from the API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string;
}

/**
 * Factory for creating data transformers based on section
 */
export interface DataTransformerFactory {
  /**
   * Creates a data transformer for the specified section
   * 
   * @param section - Section ID
   * @returns DataTransformer instance
   */
  createTransformer(section: string): DataTransformer;
}
```

## Event Interfaces

```typescript
/**
 * Events for the dual-view system
 */
export interface DualViewEvents {
  /** Event when a node is clicked */
  onNodeClick?: (node: TreeNode) => void;
  
  /** Event when a node is expanded/collapsed */
  onNodeToggle?: (node: TreeNode, expanded: boolean) => void;
  
  /** Event when the view mode changes */
  onViewModeChange?: (mode: 'tree' | 'raw') => void;
  
  /** Event when the expand all button is clicked */
  onExpandAll?: () => void;
  
  /** Event when the collapse all button is clicked */
  onCollapseAll?: () => void;
  
  /** Event when the copy button is clicked */
  onCopy?: () => void;
}
```

## Integration Interfaces

```typescript
/**
 * Interface for integrating with the ProductManagementDashboard
 */
export interface DashboardIntegration {
  /**
   * Renders the dual-view presentation for the specified section
   * 
   * @param section - Section ID
   * @returns HTML string for the dual-view presentation
   */
  renderDualViewPresentation(section: string): string;
  
  /**
   * Initializes the dual-view presentation
   * 
   * @param container - Container element
   * @param section - Section ID
   */
  initDualViewPresentation(container: HTMLElement, section: string): void;
}
```

These interfaces provide a solid foundation for implementing the dual-view data presentation system. They define the structure of the data, the components, and the interactions between them.