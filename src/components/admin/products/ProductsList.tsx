import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import { ProductBulkActions } from './index';

export interface ProductsListProps {
  onProductSelect?: (productId: string) => void;
  onCreateProduct?: () => void;
}

const ProductsList: React.FC<ProductsListProps> = ({
  onProductSelect,
  onCreateProduct,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('TITLE');
  const [sortReverse, setSortReverse] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch products
  const fetchProducts = (cursor: string | null = null, newSearch = false) => {
    setIsLoading(true);
    setError(null);

    const options = {
      first: 20,
      after: cursor,
      query: searchQuery ? searchQuery : null,
      sortKey,
      reverse: sortReverse,
    };

    products.getProductsBasic(options)
      .then((data) => {
        const edges = data.edges || [];
        const pageInfo = data.pageInfo || {};
        
        const fetchedProducts = edges.map((edge: any) => edge.node);
        
        if (newSearch || !cursor) {
          // Replace products for new searches
          setProductsList(fetchedProducts);
        } else {
          // Append products for pagination
          setProductsList(prev => [...prev, ...fetchedProducts]);
        }
        
        setHasNextPage(pageInfo.hasNextPage || false);
        setCurrentCursor(pageInfo.endCursor || null);
      })
      .catch((err) => {
        setError(`Failed to load products: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchProducts(null, true);
  };

  // Handle sort change
  const handleSortChange = (key: string) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortReverse(!sortReverse);
    } else {
      // Set new key and default direction
      setSortKey(key);
      setSortReverse(false);
    }
    
    // Refetch with new sort
    fetchProducts(null, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && currentCursor) {
      fetchProducts(currentCursor);
    }
  };

  // Handle selection
  const handleSelectProduct = (productId: string, selected: boolean) => {
    if (selected) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = productsList.map(product => product.id);
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds([]);
    }
  };

  // Handle bulk actions complete
  const handleBulkActionsComplete = () => {
    setShowBulkActions(false);
    setSelectedProductIds([]);
    fetchProducts(null, true);
  };

  // Format currency
  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(parseFloat(amount));
  };

  // Render the products list with dual-view capability
  const renderProductsList = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* Search */}
        <div className="flex w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="px-3 py-2 border border-light-ui dark:border-dark-ui rounded-l-md bg-light-bg dark:bg-dark-bg w-full md:w-64"
          />
          <Button
            variant="primary"
            onClick={handleSearch}
            className="rounded-l-none"
          >
            Search
          </Button>
        </div>

        <div className="flex space-x-2">
          {/* Bulk actions button */}
          {selectedProductIds.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setShowBulkActions(true)}
            >
              Bulk Actions ({selectedProductIds.length})
            </Button>
          )}

          {/* Create product button */}
          <Button
            variant="primary"
            onClick={onCreateProduct}
          >
            Create Product
          </Button>
        </div>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
          <thead className="bg-light-editor dark:bg-dark-editor">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedProductIds.length === productsList.length && productsList.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('TITLE')}
              >
                <div className="flex items-center">
                  <span>Product</span>
                  {sortKey === 'TITLE' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('VENDOR')}
              >
                <div className="flex items-center">
                  <span>Vendor</span>
                  {sortKey === 'VENDOR' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('PRODUCT_TYPE')}
              >
                <div className="flex items-center">
                  <span>Type</span>
                  {sortKey === 'PRODUCT_TYPE' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('UPDATED_AT')}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  {sortKey === 'UPDATED_AT' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
            {productsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  {isLoading ? 'Loading products...' : 'No products found'}
                </td>
              </tr>
            ) : (
              productsList.map((product) => (
                <tr key={product.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.featuredImage ? (
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={product.featuredImage.url}
                            alt={product.title}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-light-ui dark:bg-dark-ui flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div 
                          className="text-sm font-medium cursor-pointer hover:text-light-accent dark:hover:text-dark-accent"
                          onClick={() => onProductSelect && onProductSelect(product.id)}
                        >
                          {product.title}
                        </div>
                        {product.variants && product.variants.edges && product.variants.edges.length > 0 && (
                          <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                            {formatCurrency(
                              product.variants.edges[0].node.price || '0',
                              product.variants.edges[0].node.currencyCode || 'USD'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.vendor || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.productType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : product.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {product.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onProductSelect && onProductSelect(product.id)}
                      className="text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent-hover"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );

  // Show bulk actions if selected
  if (showBulkActions) {
    return (
      <ProductBulkActions
        selectedProductIds={selectedProductIds}
        onComplete={handleBulkActionsComplete}
        onCancel={() => setShowBulkActions(false)}
      />
    );
  }

  return (
    <DualView
      title="Products"
      presentationView={renderProductsList()}
      rawData={{ products: productsList, selectedIds: selectedProductIds }}
      defaultView="presentation"
    />
  );
};

export default ProductsList;
