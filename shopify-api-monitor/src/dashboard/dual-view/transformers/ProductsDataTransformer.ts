/**
 * ProductsDataTransformer.ts
 * Transforms products data to TreeNode format
 */

import { DataTransformer, TreeNode } from '../types';

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
    // This is a simplified implementation
    return this.convertToYaml(data);
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
}