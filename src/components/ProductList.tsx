import React from 'react';
import { gql } from '@apollo/client';
import { useShopifyQuery } from '../apollo/useShopifyQuery';
import Card from './Card';
import Button from './Button';

// GraphQL query for products
export const PRODUCTS_QUERY = gql`
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export interface ProductListProps {
  pageSize?: number;
  onProductClick?: (productId: string, handle: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  pageSize = 12,
  onProductClick,
}) => {
  const { loading, error, data, fetchMore } = useShopifyQuery(PRODUCTS_QUERY, {
    variables: { first: pageSize },
  });

  const handleLoadMore = () => {
    if (data?.products?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.products.pageInfo.endCursor,
        },
      });
    }
  };

  if (loading && !data) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error loading products: {error.message}</div>;

  const products = data?.products?.edges || [];
  const hasNextPage = data?.products?.pageInfo?.hasNextPage || false;

  if (products.length === 0) {
    return <div className="text-center py-8">No products found</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(({ node: product }) => {
          const image = product.images.edges[0]?.node;
          const price = product.priceRange.minVariantPrice;
          const isAvailable = product.variants.edges[0]?.node.availableForSale;

          return (
            <Card
              key={product.id}
              className="h-full flex flex-col transition-transform hover:scale-[1.02]"
            >
              <div 
                className="cursor-pointer"
                onClick={() => onProductClick && onProductClick(product.id, product.handle)}
              >
                <div className="relative pb-[100%] mb-4 bg-light-ui dark:bg-dark-ui rounded overflow-hidden">
                  {image ? (
                    <img
                      src={image.url}
                      alt={image.altText || product.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium mb-1">{product.title}</h3>
                <p className="text-sm text-light-fg dark:text-dark-fg opacity-75 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-auto flex justify-between items-center">
                  <div className="font-bold">
                    {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                  </div>
                  <div className={`text-sm ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isAvailable ? 'In stock' : 'Out of stock'}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} variant="secondary">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
