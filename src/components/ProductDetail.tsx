import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useShopifyQuery } from '../apollo/useShopifyQuery';
import Button from './Button';
import Card from './Card';

// GraphQL query for product details
export const PRODUCT_QUERY = gql`
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      vendor
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export interface ProductDetailProps {
  handle: string;
  onAddToCart?: (variantId: string, quantity: number) => void;
  onBack?: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  handle,
  onAddToCart,
  onBack,
}) => {
  const { loading, error, data } = useShopifyQuery(PRODUCT_QUERY, {
    variables: { handle },
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">Error loading product: {error.message}</div>;
  if (!data?.product) return <div className="error">Product not found</div>;

  const { product } = data;
  const images = product.images.edges.map(edge => edge.node);
  const variants = product.variants.edges.map(edge => edge.node);
  const options = product.options;

  // Initialize selected options if not already set
  if (Object.keys(selectedOptions).length === 0 && options.length > 0) {
    const initialOptions: Record<string, string> = {};
    options.forEach(option => {
      initialOptions[option.name] = option.values[0];
    });
    setSelectedOptions(initialOptions);
  }

  // Find the selected variant based on selected options
  const findSelectedVariant = () => {
    if (variants.length === 1) return variants[0];
    
    return variants.find(variant => {
      return variant.selectedOptions.every(
        option => selectedOptions[option.name] === option.value
      );
    });
  };

  const selectedVariant = findSelectedVariant();
  const isAvailable = selectedVariant?.availableForSale || false;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant && onAddToCart) {
      onAddToCart(selectedVariant.id, quantity);
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Product Images */}
        <div className="md:w-1/2 p-4">
          <div className="relative pb-[100%] bg-light-ui dark:bg-dark-ui rounded overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImageIndex].url}
                alt={images[activeImageIndex].altText || product.title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
                No image available
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="mt-4 flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`w-16 h-16 rounded overflow-hidden border-2 ${
                    index === activeImageIndex
                      ? 'border-light-accent dark:border-dark-accent'
                      : 'border-transparent'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img
                    src={image.url}
                    alt={image.altText || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="md:w-1/2 p-6">
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
          
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          
          {product.vendor && (
            <div className="text-sm text-light-fg dark:text-dark-fg opacity-75 mb-4">
              {product.vendor}
            </div>
          )}
          
          <div className="text-xl font-bold mb-4">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </div>
          
          <div className="mb-6">
            <div
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              className="prose prose-sm dark:prose-invert max-w-none"
            />
          </div>
          
          {/* Product Options */}
          {options.length > 0 && (
            <div className="mb-6 space-y-4">
              {options.map(option => (
                <div key={option.id}>
                  <label className="block text-sm font-medium mb-2">
                    {option.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map(value => (
                      <button
                        key={value}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          selectedOptions[option.name] === value
                            ? 'bg-light-accent dark:bg-dark-accent text-white border-light-accent dark:border-dark-accent'
                            : 'border-light-ui dark:border-dark-ui hover:border-light-syntax-entity dark:hover:border-dark-syntax-entity'
                        }`}
                        onClick={() => handleOptionChange(option.name, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Quantity
            </label>
            <div className="flex items-center">
              <button
                className="w-8 h-8 flex items-center justify-center border border-light-ui dark:border-dark-ui rounded-l-md"
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-12 h-8 text-center border-t border-b border-light-ui dark:border-dark-ui bg-transparent"
              />
              <button
                className="w-8 h-8 flex items-center justify-center border border-light-ui dark:border-dark-ui rounded-r-md"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="w-full"
          >
            {isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          
          {/* Product Metadata */}
          {(product.productType || product.tags.length > 0) && (
            <div className="mt-6 pt-6 border-t border-light-ui dark:border-dark-ui">
              {product.productType && (
                <div className="mb-2 text-sm">
                  <span className="font-medium">Type:</span> {product.productType}
                </div>
              )}
              
              {product.tags.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Tags:</span>{' '}
                  {product.tags.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductDetail;
