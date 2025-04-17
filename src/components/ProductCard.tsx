import React from 'react';
import DualView from './DualView';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description?: string;
    price: string;
    currency?: string;
    imageUrl?: string;
    inStock?: boolean;
    vendor?: string;
    tags?: string[];
    variants?: Array<{
      id: string;
      title: string;
      price: string;
      available: boolean;
    }>;
    metadata?: Record<string, any>;
  };
  isDetailView?: boolean;
  onAddToCart?: (productId: string, quantity: number) => void;
  onBack?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isDetailView = false,
  onAddToCart,
  onBack
}) => {
  // Compact presentation view of the product (for list/grid views)
  const compactPresentationView = (
    <div className="h-full flex flex-col transition-transform hover:scale-[1.02]">
      <div className="cursor-pointer">
        <div className="relative pb-[100%] mb-4 bg-light-ui dark:bg-dark-ui rounded overflow-hidden">
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
  );

  // Detailed presentation view of the product
  const detailedPresentationView = (
    <div className="flex flex-col md:flex-row">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-light-syntax-entity dark:text-dark-syntax-entity hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to products
        </button>
      )}

      {/* Product Image */}
      <div className="md:w-1/2 p-4">
        <div className="relative pb-[100%] bg-light-ui dark:bg-dark-ui rounded overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
              No image available
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="md:w-1/2 p-4">
        <h1 className="text-2xl font-bold mb-2">{product.title}</h1>

        {product.vendor && (
          <div className="text-sm text-light-fg dark:text-dark-fg opacity-75 mb-4">
            {product.vendor}
          </div>
        )}

        <div className="text-xl font-bold mb-4">
          {product.currency || '$'} {product.price}
        </div>

        {product.description && (
          <div className="mb-6">
            <p className="text-light-fg dark:text-dark-fg">
              {product.description}
            </p>
          </div>
        )}

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Variants</h3>
            <div className="space-y-2">
              {product.variants.map(variant => (
                <div key={variant.id} className="flex justify-between items-center p-2 border border-light-ui dark:border-dark-ui rounded">
                  <span>{variant.title}</span>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{product.currency || '$'} {variant.price}</span>
                    <span className={variant.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {variant.available ? 'Available' : 'Sold out'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        {onAddToCart && product.inStock && (
          <button
            onClick={() => onAddToCart(product.id, 1)}
            className="w-full px-4 py-2 bg-light-accent dark:bg-dark-accent text-white rounded-md hover:opacity-90 transition-colors"
          >
            Add to Cart
          </button>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-light-ui dark:border-dark-ui">
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-light-bg dark:bg-dark-bg rounded-md text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Raw data of the product
  const rawData = {
    id: product.id,
    title: product.title,
    description: product.description,
    price: {
      amount: product.price,
      currencyCode: product.currency || 'USD'
    },
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    vendor: product.vendor,
    tags: product.tags || [],
    variants: product.variants || [],
    metadata: product.metadata || {}
  };

  return (
    <DualView
      presentationView={isDetailView ? detailedPresentationView : compactPresentationView}
      rawData={rawData}
      title={product.title}
      expandable={true}
      defaultExpanded={isDetailView}
      maxCollapsedHeight={isDetailView ? 600 : 400}
      maxExpandedHeight={1200}
    />
  );
};

export default ProductCard;
