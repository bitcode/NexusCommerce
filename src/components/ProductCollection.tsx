import React, { useState } from 'react';
import DualView from './DualView';
import ProductCard from './ProductCard';

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: string;
  currency?: string;
  imageUrl?: string;
  inStock?: boolean;
}

export interface ProductCollectionProps {
  products: Product[];
  title?: string;
  onProductSelect?: (productId: string) => void;
}

const ProductCollection: React.FC<ProductCollectionProps> = ({
  products,
  title = 'Products',
  onProductSelect,
}) => {
  // Presentation view of the product collection
  const presentationView = (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-light-editor dark:bg-dark-editor rounded-lg shadow-md overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => onProductSelect && onProductSelect(product.id)}
          >
            <div className="relative pb-[100%] bg-light-ui dark:bg-dark-ui">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
                  No image
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium mb-1">{product.title}</h3>
              {product.description && (
                <p className="text-sm text-light-fg dark:text-dark-fg opacity-75 mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="mt-auto flex justify-between items-center">
                <div className="font-bold">
                  {product.currency || '$'} {product.price}
                </div>
                <div className={`text-sm ${product.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.inStock ? 'In stock' : 'Out of stock'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-8 text-light-fg dark:text-dark-fg">
          No products found.
        </div>
      )}
    </div>
  );

  // Raw data of the product collection
  const rawData = {
    collectionType: 'products',
    count: products.length,
    items: products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: {
        amount: product.price,
        currencyCode: product.currency || 'USD'
      },
      imageUrl: product.imageUrl,
      inStock: product.inStock
    }))
  };

  return (
    <DualView
      presentationView={presentationView}
      rawData={rawData}
      title={title}
    />
  );
};

export default ProductCollection;
