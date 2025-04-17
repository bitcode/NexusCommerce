import React from 'react';
import TreeHierarchyView, { HierarchyNode } from './TreeHierarchyView';

export interface ProductHierarchyProps {
  onProductSelect?: (productId: string) => void;
}

const ProductHierarchy: React.FC<ProductHierarchyProps> = ({ onProductSelect }) => {
  // Sample product hierarchy data
  const productHierarchy: HierarchyNode = {
    id: 'store',
    name: 'Products',
    type: 'folder',
    children: [
      {
        id: 'basic-tshirt',
        name: 'Basic T-Shirt',
        type: 'product',
        children: [
          {
            id: 'small-black',
            name: 'Small / Black',
            type: 'variant',
          },
          {
            id: 'medium-black',
            name: 'Medium / Black',
            type: 'variant',
          },
          {
            id: 'large-black',
            name: 'Large / Black',
            type: 'variant',
          }
        ]
      },
      {
        id: 'premium-hoodie',
        name: 'Premium Hoodie',
        type: 'product',
        children: [
          {
            id: 'small-gray',
            name: 'Small / Gray',
            type: 'variant',
          },
          {
            id: 'medium-gray',
            name: 'Medium / Gray',
            type: 'variant',
          }
        ]
      },
      {
        id: 'accessories',
        name: 'Accessories',
        type: 'folder',
        children: [
          {
            id: 'wireless-headphones',
            name: 'Wireless Headphones',
            type: 'product',
            children: [
              {
                id: 'black-headphones',
                name: 'Black',
                type: 'variant',
              },
              {
                id: 'white-headphones',
                name: 'White',
                type: 'variant',
              }
            ]
          },
          {
            id: 'smart-watch',
            name: 'Smart Watch',
            type: 'product',
            children: [
              {
                id: 'black-watch',
                name: 'Black',
                type: 'variant',
              },
              {
                id: 'silver-watch',
                name: 'Silver',
                type: 'variant',
              }
            ]
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
      hierarchy={productHierarchy} 
      title="Product Hierarchy"
      onNodeSelect={handleNodeSelect}
    />
  );
};

export default ProductHierarchy;
