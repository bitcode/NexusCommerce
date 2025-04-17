/**
 * StorefrontTransformerUtils.ts
 * Utility functions for Storefront API data transformers
 */

import { Relationship } from '../types';

/**
 * Extracts nodes from GraphQL edges
 *
 * @param edges - Array of edges from GraphQL response
 * @returns Array of nodes
 */
export function extractNodesFromEdges(edges: any[]): any[] {
  if (!edges || !Array.isArray(edges)) {
    return [];
  }

  return edges.map(edge => edge.node);
}

/**
 * Extracts pagination info from GraphQL response
 *
 * @param data - GraphQL response data
 * @param resourceName - Name of the resource (e.g., 'products')
 * @returns Pagination info
 */
export function extractPaginationInfo(data: any, resourceName: string): {
  hasNextPage: boolean;
  endCursor?: string;
} {
  if (!data || !data[resourceName] || !data[resourceName].pageInfo) {
    return { hasNextPage: false };
  }

  const { hasNextPage, endCursor } = data[resourceName].pageInfo;

  return {
    hasNextPage: !!hasNextPage,
    endCursor
  };
}

/**
 * Creates a relationship between nodes
 *
 * @param sourceId - ID of the source node
 * @param targetId - ID of the target node
 * @param type - Type of relationship
 * @param direction - Direction of the relationship
 * @returns Relationship object
 */
export function createRelationship(
  sourceId: string,
  targetId: string,
  type: string,
  direction: 'to' | 'from' | 'bidirectional' = 'to'
): Relationship {
  return {
    id: targetId,
    type,
    direction
  };
}

/**
 * Converts data to YAML format
 *
 * @param data - Data to convert
 * @returns YAML string
 */
export function convertToYaml(data: any): string {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return 'null';
  }

  // Handle empty object
  if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
    return '{}';
  }

  // This is a simplified YAML converter
  // In a real implementation, you would use a library like js-yaml

  const convertObject = (obj: any, indent: number = 0): string => {
    // Handle null or undefined
    if (obj === null || obj === undefined) {
      return 'null';
    }

    // Handle empty object
    if (typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0) {
      return '{}';
    }

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