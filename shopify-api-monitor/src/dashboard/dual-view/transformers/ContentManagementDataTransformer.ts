/**
 * ContentManagementDataTransformer.ts
 * Transforms Content Management API data to TreeNode format and raw data for dual-view dashboard.
 */

import { DataTransformer, TreeNode } from '../types';

/**
 * Expects data shape:
 * {
 *   pages: { edges: [...] },
 *   blogs: { edges: [...] },
 *   menus: { edges: [...] }
 * }
 */
export class ContentManagementDataTransformer implements DataTransformer {
  /**
   * Transforms content management data to TreeNode format
   * @param data - Content management data from API
   * @returns Array of TreeNode objects
   */
  transformToTreeNodes(data: any): TreeNode[] {
    if (!data) return [];

    // Pages
    const pages = (data.pages?.edges || []).map((edge: any) => edge.node);
    // Blogs
    const blogs = (data.blogs?.edges || []).map((edge: any) => edge.node);
    // Menus
    const menus = (data.menus?.edges || []).map((edge: any) => edge.node);

    // Page nodes
    const pageNodes: TreeNode[] = pages.map((page: any) => ({
      id: page.id,
      name: page.title,
      type: 'page',
      data: page
    }));

    // Blog nodes (with articles as children)
    const blogNodes: TreeNode[] = blogs.map((blog: any) => ({
      id: blog.id,
      name: blog.title,
      type: 'folder',
      data: blog,
      children: (blog.articles?.edges || []).map((aEdge: any) => {
        const article = aEdge.node;
        return {
          id: article.id,
          name: article.title,
          type: 'page',
          data: article
        };
      })
    }));

    // Menu nodes (with nested items)
    const menuNodes: TreeNode[] = menus.map((menu: any) => ({
      id: menu.id,
      name: menu.title,
      type: 'menu',
      data: menu,
      children: (menu.items || []).map((item: any) => this.transformMenuItemToTreeNode(item))
    }));

    // Root node
    const root: TreeNode = {
      id: 'content-management-root',
      name: 'Content Management',
      type: 'folder',
      expanded: true,
      children: [
        {
          id: 'pages-group',
          name: `Pages (${pageNodes.length})`,
          type: 'folder',
          expanded: false,
          children: pageNodes
        },
        {
          id: 'blogs-group',
          name: `Blogs (${blogNodes.length})`,
          type: 'folder',
          expanded: false,
          children: blogNodes
        },
        {
          id: 'menus-group',
          name: `Menus (${menuNodes.length})`,
          type: 'folder',
          expanded: false,
          children: menuNodes
        }
      ],
      data: data
    };

    return [root];
  }

  /**
   * Recursively transforms a menu item and its children to a TreeNode
   */
  private transformMenuItemToTreeNode(item: any): TreeNode {
    return {
      id: item.id,
      name: item.title,
      type: 'menu',
      data: item,
      children: (item.items || []).map((child: any) => this.transformMenuItemToTreeNode(child))
    };
  }

  /**
   * Transforms content management data to raw data format
   * @param data - Content management data from API
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