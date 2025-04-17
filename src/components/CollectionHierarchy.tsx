import React from 'react';
import TreeHierarchyView, { HierarchyNode } from './TreeHierarchyView';

export interface CollectionHierarchyProps {
  onProductSelect?: (productId: string) => void;
}

const CollectionHierarchy: React.FC<CollectionHierarchyProps> = ({ onProductSelect }) => {
  // Sample collection hierarchy data
  const collectionHierarchy: HierarchyNode = {
    id: 'collections',
    name: 'Collections',
    type: 'folder',
    children: [
      {
        id: 'summer-collection',
        name: 'Summer Collection',
        type: 'collection',
        children: [
          {
            id: 'basic-tshirt',
            name: 'Basic T-Shirt',
            type: 'product',
          },
          {
            id: 'summer-shorts',
            name: 'Summer Shorts',
            type: 'product',
          },
          {
            id: 'beach-accessories',
            name: 'Beach Accessories',
            type: 'folder',
            children: [
              {
                id: 'sunglasses',
                name: 'Sunglasses',
                type: 'product',
              },
              {
                id: 'beach-hat',
                name: 'Beach Hat',
                type: 'product',
              }
            ]
          }
        ]
      },
      {
        id: 'winter-collection',
        name: 'Winter Collection',
        type: 'collection',
        children: [
          {
            id: 'premium-hoodie',
            name: 'Premium Hoodie',
            type: 'product',
          },
          {
            id: 'winter-jacket',
            name: 'Winter Jacket',
            type: 'product',
          },
          {
            id: 'winter-accessories',
            name: 'Winter Accessories',
            type: 'folder',
            children: [
              {
                id: 'gloves',
                name: 'Gloves',
                type: 'product',
              },
              {
                id: 'scarf',
                name: 'Scarf',
                type: 'product',
              }
            ]
          }
        ]
      },
      {
        id: 'electronics',
        name: 'Electronics',
        type: 'collection',
        children: [
          {
            id: 'wireless-headphones',
            name: 'Wireless Headphones',
            type: 'product',
          },
          {
            id: 'smart-watch',
            name: 'Smart Watch',
            type: 'product',
          }
        ]
      }
    ]
  };

  const handleNodeSelect = (nodeId: string, nodeType: string) => {
    if (nodeType === 'product' && onProductSelect) {
      onProductSelect(nodeId);
    }
  };

  return (
    <TreeHierarchyView 
      hierarchy={collectionHierarchy} 
      title="Collection Hierarchy"
      onNodeSelect={handleNodeSelect}
    />
  );
};

export default CollectionHierarchy;
