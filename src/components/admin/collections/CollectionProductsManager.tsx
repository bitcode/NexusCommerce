import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CollectionProductsManagerProps {
  collectionId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const CollectionProductsManager: React.FC<CollectionProductsManagerProps> = ({
  collectionId,
  onSave,
  onCancel,
}) => {
  const { collections, products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<any>(null);
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAutomated, setIsAutomated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);

  // Fetch collection data
  useEffect(() => {
    if (collectionId) {
      setIsLoading(true);
      setError(null);

      collections.getCollection(collectionId)
        .then((data) => {
          setCollection(data);
          setIsAutomated(!!data.ruleSet);
          
          // Extract products
          if (data.products && data.products.edges) {
            const extractedProducts = data.products.edges.map((edge: any) => edge.node);
            setCollectionProducts(extractedProducts);
          }
        })
        .catch((err) => {
          setError(`Failed to load collection: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [collectionId, collections]);

  // Fetch available products (not in the collection)
  const fetchAvailableProducts = (query: string = '') => {
    setIsSearching(true);
    
    const options = {
      first: 20,
      query: query,
    };
    
    products.getProductsBasic(options)
      .then((data) => {
        const edges = data.edges || [];
        const fetchedProducts = edges.map((edge: any) => edge.node);
        
        // Filter out products already in the collection
        const collectionProductIds = collectionProducts.map(product => product.id);
        const filteredProducts = fetchedProducts.filter(
          product => !collectionProductIds.includes(product.id)
        );
        
        setAvailableProducts(filteredProducts);
      })
      .catch((err) => {
        setError(`Failed to load available products: ${err.message}`);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  // Handle search
  const handleSearch = () => {
    fetchAvailableProducts(searchQuery);
  };

  // Handle product selection
  const handleSelectProduct = (productId: string, selected: boolean) => {
    if (selected) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  // Handle adding products to collection
  const handleAddProducts = async () => {
    if (selectedProductIds.length === 0) {
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await collections.addProductsToCollection(collectionId, selectedProductIds);
      
      // Refresh collection products
      const updatedCollection = await collections.getCollection(collectionId);
      if (updatedCollection.products && updatedCollection.products.edges) {
        const extractedProducts = updatedCollection.products.edges.map((edge: any) => edge.node);
        setCollectionProducts(extractedProducts);
      }
      
      // Clear selection and available products
      setSelectedProductIds([]);
      setAvailableProducts([]);
      setSearchQuery('');
    } catch (err: any) {
      setError(`Failed to add products: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle removing products from collection
  const handleRemoveProduct = async (productId: string) => {
    setIsSaving(true);
    setError(null);
    
    try {
      await collections.removeProductsFromCollection(collectionId, [productId]);
      
      // Update local state
      setCollectionProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err: any) {
      setError(`Failed to remove product: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, productId: string) => {
    setIsDragging(true);
    setDraggedProductId(productId);
    e.dataTransfer.setData('text/plain', productId);
    
    // Set a drag image
    const dragImage = new Image();
    dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedProductId(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, productId: string) => {
    e.preventDefault();
    
    if (draggedProductId === productId) {
      return;
    }
    
    // Find the indices of the dragged product and the target product
    const draggedIndex = collectionProducts.findIndex(product => product.id === draggedProductId);
    const targetIndex = collectionProducts.findIndex(product => product.id === productId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }
    
    // Reorder the products
    const newProducts = [...collectionProducts];
    const [draggedProduct] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, draggedProduct);
    
    setCollectionProducts(newProducts);
  };

  // Handle saving the order
  const handleSaveOrder = async () => {
    if (isAutomated) {
      setError('Cannot reorder products in an automated collection');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Prepare the moves
      const moves = collectionProducts.map((product, index) => ({
        id: product.id,
        position: index + 1,
      }));
      
      await collections.reorderProductsInCollection(collectionId, moves);
      
      if (onSave) {
        onSave();
      }
    } catch (err: any) {
      setError(`Failed to save order: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>
      </Card>
    );
  }

  // Render the component with dual-view capability
  const renderProductsManager = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {isAutomated && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded relative">
          This is an automated collection. Products are added automatically based on conditions.
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Collection Products</h3>
        
        {collectionProducts.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
            <p className="text-light-fg dark:text-dark-fg opacity-70">
              No products in this collection.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {collectionProducts.map((product) => (
              <div
                key={product.id}
                className={`flex items-center p-3 border border-light-ui dark:border-dark-ui rounded-md ${
                  !isAutomated ? 'cursor-move' : ''
                } ${
                  isDragging && draggedProductId === product.id
                    ? 'opacity-50'
                    : ''
                }`}
                draggable={!isAutomated}
                onDragStart={!isAutomated ? (e) => handleDragStart(e, product.id) : undefined}
                onDragEnd={!isAutomated ? handleDragEnd : undefined}
                onDragOver={!isAutomated ? (e) => handleDragOver(e, product.id) : undefined}
              >
                {!isAutomated && (
                  <div className="flex-shrink-0 mr-3 text-light-fg dark:text-dark-fg opacity-50">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                )}
                <div className="flex-shrink-0 h-10 w-10 mr-3">
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {product.title}
                  </p>
                  <p className="text-xs text-light-fg dark:text-dark-fg opacity-70 truncate">
                    {product.productType || 'No type'} • {product.vendor || 'No vendor'}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <Button
                    variant="outline"
                    onClick={() => handleRemoveProduct(product.id)}
                    disabled={isAutomated || isSaving}
                    className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900 text-sm py-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isAutomated && (
          <>
            <div className="pt-4 border-t border-light-ui dark:border-dark-ui">
              <h3 className="text-lg font-medium mb-3">Add Products</h3>
              
              <div className="flex mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 border border-light-ui dark:border-dark-ui rounded-l-md bg-light-bg dark:bg-dark-bg"
                />
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="rounded-l-none"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {availableProducts.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto p-2">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-3 border border-light-ui dark:border-dark-ui rounded-md"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded mr-3"
                      />
                      <div className="flex-shrink-0 h-10 w-10 mr-3">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-light-fg dark:text-dark-fg opacity-70 truncate">
                          {product.productType || 'No type'} • {product.vendor || 'No vendor'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
                  <p className="text-light-fg dark:text-dark-fg opacity-70">
                    No products found matching your search.
                  </p>
                </div>
              ) : null}

              {selectedProductIds.length > 0 && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={handleAddProducts}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Adding...' : `Add Selected Products (${selectedProductIds.length})`}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-light-ui dark:border-dark-ui space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {!isAutomated && (
          <Button
            variant="primary"
            onClick={handleSaveOrder}
            disabled={isSaving || collectionProducts.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Order'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <DualView
      title="Manage Collection Products"
      presentationView={renderProductsManager()}
      rawData={{ collectionId, products: collectionProducts, isAutomated }}
      defaultView="presentation"
    />
  );
};

export default CollectionProductsManager;
