# Dual-View Data Presentation System User Guide

This guide explains how to use the dual-view data presentation system in the Shopify API Monitor dashboard. The system provides two complementary views of your data: a hierarchical tree visualization and a raw data view.

## Overview

The dual-view system allows you to:

1. Visualize hierarchical relationships between pages, products, collections, and other Shopify resources
2. View the underlying raw data in JSON or YAML format
3. Toggle seamlessly between these two representations
4. Expand and collapse sections of the tree to focus on specific areas
5. Search and copy the raw data for use in other applications

## Accessing the Dual-View System

The dual-view system is integrated into the Product Management Dashboard. To access it:

1. Navigate to the Shopify API Monitor dashboard
2. Select a section from the left navigation menu (Products, Collections, etc.)
3. The dual-view system will be displayed in the main content area

## Tree View

The tree view provides a hierarchical visualization of your data, similar to the Linux `tree` command.

### Example Tree View

```
Products
├── Summer Collection
│   ├── Beach Towel
│   │   ├── Variant: Blue
│   │   ├── Variant: Red
│   │   └── Variant: Yellow
│   └── Sunglasses
│       ├── Variant: Classic
│       └── Variant: Sport
└── Winter Collection
    ├── Scarf
    │   ├── Variant: Wool
    │   └── Variant: Cashmere
    └── Gloves
        ├── Variant: Small
        ├── Variant: Medium
        └── Variant: Large
```

### Tree View Features

#### Expanding and Collapsing Nodes

- Click the `+` or `-` icon next to a node to expand or collapse it
- Use the "Expand All" button to expand all nodes at once
- Use the "Collapse All" button to collapse all nodes at once

#### Node Types

Different types of nodes are color-coded for easy identification:

- **Products**: Blue
- **Collections**: Teal
- **Pages**: Purple
- **Folders**: Gray (bold)
- **Variants**: Blue (lighter shade)
- **Metaobjects**: Orange
- **Files**: Green
- **Menus**: Brown

#### Relationship Indicators

Lines and connectors show the relationships between nodes:

- `├──` indicates a node with siblings below it
- `└──` indicates the last node in a group
- `│` indicates a continuation of the parent node

#### Interacting with Nodes

- Click on a node to view its details in a popup
- Right-click on a node to access a context menu with additional options
- Hover over a node to see a tooltip with additional information

## Raw Data View

The raw data view shows the underlying data structure in JSON or YAML format.

### Example Raw Data View (JSON)

```json
{
  "products": {
    "summerCollection": {
      "name": "Summer Collection",
      "products": [
        {
          "id": "product1",
          "name": "Beach Towel",
          "variants": [
            {
              "id": "variant1",
              "name": "Blue",
              "price": "19.99"
            },
            {
              "id": "variant2",
              "name": "Red",
              "price": "19.99"
            },
            {
              "id": "variant3",
              "name": "Yellow",
              "price": "19.99"
            }
          ]
        },
        {
          "id": "product2",
          "name": "Sunglasses",
          "variants": [
            {
              "id": "variant4",
              "name": "Classic",
              "price": "29.99"
            },
            {
              "id": "variant5",
              "name": "Sport",
              "price": "34.99"
            }
          ]
        }
      ]
    },
    "winterCollection": {
      "name": "Winter Collection",
      "products": [
        {
          "id": "product3",
          "name": "Scarf",
          "variants": [
            {
              "id": "variant6",
              "name": "Wool",
              "price": "24.99"
            },
            {
              "id": "variant7",
              "name": "Cashmere",
              "price": "49.99"
            }
          ]
        },
        {
          "id": "product4",
          "name": "Gloves",
          "variants": [
            {
              "id": "variant8",
              "name": "Small",
              "price": "19.99"
            },
            {
              "id": "variant9",
              "name": "Medium",
              "price": "19.99"
            },
            {
              "id": "variant10",
              "name": "Large",
              "price": "19.99"
            }
          ]
        }
      ]
    }
  }
}
```

### Raw Data View Features

#### Format Selection

- Toggle between JSON and YAML formats using the radio buttons
- Both formats are syntax-highlighted for readability

#### Copy Functionality

- Click the "Copy" button to copy the entire data structure to your clipboard
- Use this to paste the data into other applications or documentation

#### Search

- Use your browser's search functionality (Ctrl+F or Cmd+F) to find specific text
- The search will highlight matches in the raw data

## Toggling Between Views

You can easily switch between the tree view and raw data view:

1. Click the "Tree View" button to see the hierarchical visualization
2. Click the "Raw Data" button to see the underlying data structure

The system remembers your expanded/collapsed state when switching between views, so you can focus on the same part of the data in both representations.

## Use Cases

### Exploring Product Relationships

The tree view is ideal for exploring how products are organized into collections:

1. Navigate to the Products section
2. Expand the collections to see which products belong to each
3. Expand products to see their variants
4. Use the visual hierarchy to understand the organization

### Debugging Data Issues

When troubleshooting data problems:

1. Start with the tree view to locate the problematic item
2. Switch to the raw data view to see all properties and values
3. Copy the raw data for use in bug reports or support tickets

### Understanding Site Structure

To understand how pages and navigation are structured:

1. Navigate to the Content section
2. Use the tree view to see the hierarchy of pages
3. Expand menu items to see how they link to pages and collections
4. Visualize the overall site structure

### Analyzing Inventory

For inventory management:

1. Navigate to the Inventory section
2. Expand locations to see inventory levels
3. Use the tree view to quickly identify low stock items
4. Switch to raw data view for detailed inventory information

## Tips and Tricks

### Keyboard Navigation

- Use Tab to navigate between interactive elements
- Use Enter to activate buttons and toggles
- Use Space to expand/collapse nodes
- Use arrow keys to navigate the tree

### Performance Optimization

- Collapse nodes you're not interested in to improve performance
- Use the search function in raw data view to find specific items quickly
- For very large data sets, use the section filters to narrow down the data

### Customization

- The dual-view system respects your browser's font size settings
- Use your browser's zoom functionality to adjust the view size
- Dark mode is supported if your browser/OS is set to dark mode

## Troubleshooting

### Tree View Not Loading

If the tree view appears empty:

1. Check if you have selected a section from the left navigation
2. Try refreshing the data using the "Refresh" button
3. Ensure you have the necessary permissions to view the data

### Raw Data Format Issues

If the raw data appears incorrectly formatted:

1. Try switching between JSON and YAML formats
2. Check if the data contains special characters that might affect formatting
3. Use the "Copy" button to paste into a text editor for better inspection

### Browser Compatibility

The dual-view system works best in modern browsers:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

If you experience issues, try updating your browser to the latest version.

## Conclusion

The dual-view data presentation system provides a powerful way to visualize and interact with your Shopify data. By toggling between the intuitive tree view and the detailed raw data view, you can gain insights into your data structure and relationships that would be difficult to see otherwise.

Use this guide as a reference as you explore your data through the dual-view system. If you have any questions or feedback, please contact the development team.