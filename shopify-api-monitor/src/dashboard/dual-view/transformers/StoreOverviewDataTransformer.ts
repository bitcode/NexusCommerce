/**
 * StoreOverviewDataTransformer.ts
 * Transforms Store Overview API data to TreeNode format and raw data for dual-view dashboard.
 */

import { DataTransformer, TreeNode } from '../types';

/**
 * Transforms Store Overview API data to TreeNode format
 * Expects data shape:
 * {
 *   shop: { ... },
 *   counts: { products, collections, pages, blogs, locations, metaobjectDefinitions, files, menus },
 *   apiUsage: { rateLimit, queryCost, ... },
 *   recentUpdates: [ ... ],
 *   health: { ... }
 * }
 */
export class StoreOverviewDataTransformer implements DataTransformer {
  /**
   * Transforms store overview data to TreeNode format
   * @param data - Store overview data from API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[] {
    if (!data || !data.shop) {
      return [];
    }

    // Root node
    const root: TreeNode = {
      id: 'store-overview-root',
      name: data.shop.name || 'Store Overview',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: 'store-structure',
          name: 'Store Structure',
          type: 'folder',
          expanded: true,
          children: [
            {
              id: 'products-count',
              name: `Products: ${data.counts?.products ?? 'N/A'}`,
              type: 'product'
            },
            {
              id: 'collections-count',
              name: `Collections: ${data.counts?.collections ?? 'N/A'}`,
              type: 'collection'
            },
            {
              id: 'pages-count',
              name: `Pages: ${data.counts?.pages ?? 'N/A'}`,
              type: 'page'
            },
            {
              id: 'blogs-count',
              name: `Blogs: ${data.counts?.blogs ?? 'N/A'}`,
              type: 'folder'
            },
            {
              id: 'locations-count',
              name: `Locations: ${data.counts?.locations ?? 'N/A'}`,
              type: 'folder'
            },
            {
              id: 'metaobjects-count',
              name: `Metaobject Definitions: ${data.counts?.metaobjectDefinitions ?? 'N/A'}`,
              type: 'metaobject'
            },
            {
              id: 'files-count',
              name: `Files: ${data.counts?.files ?? 'N/A'}`,
              type: 'file'
            },
            {
              id: 'menus-count',
              name: `Menus: ${data.counts?.menus ?? 'N/A'}`,
              type: 'menu'
            }
          ]
        },
        {
          id: 'api-usage',
          name: 'API Usage',
          type: 'folder',
          expanded: false,
          children: [
            {
              id: 'rate-limit',
              name: `Rate Limit: ${data.apiUsage?.rateLimit ?? 'N/A'}`,
              type: 'folder'
            },
            {
              id: 'query-cost',
              name: `Query Cost: ${data.apiUsage?.queryCost ?? 'N/A'}`,
              type: 'folder'
            }
          ]
        },
        {
          id: 'recent-updates',
          name: 'Recent Updates',
          type: 'folder',
          expanded: false,
          children: (data.recentUpdates || []).map((update: any, idx: number) => ({
            id: `update-${idx}`,
            name: update.title || update.type || `Update ${idx + 1}`,
            type: 'folder',
            data: update
          }))
        },
        {
          id: 'store-health',
          name: 'Store Health',
          type: 'folder',
          expanded: false,
          children: Object.entries(data.health || {}).map(([key, value]: [string, any]) => ({
            id: `health-${key}`,
            name: `${key}: ${value}`,
            type: 'folder'
          }))
        }
      ],
      data: data
    };

    return [root];
  }

  /**
   * Transforms store overview data to raw data format
   * @param data - Store overview data from API
   * @param format - Desired output format
   * @returns Formatted string representation of the data
   */
  transformToRawData(data: any, format: 'json' | 'yaml'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    // Simple YAML conversion (for demo; use js-yaml in production)
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