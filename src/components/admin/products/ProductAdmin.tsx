import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import {
  ProductForm,
  ProductOptionsForm,
  ProductVariantsForm,
  ProductMediaUploader,
  ProductDeleteConfirmation,
  ProductBulkActions
} from './index';

export interface ProductAdminProps {
  productId?: string;
  onBack?: () => void;
}

type AdminView = 'details' | 'options' | 'variants' | 'media' | 'delete' | 'bulk';

const ProductAdmin: React.FC<ProductAdminProps> = ({
  productId,
  onBack,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [currentView, setCurrentView] = useState<AdminView>('details');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(productId ? [productId] : []);

  // Fetch product data if editing an existing product
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);

      products.getProduct(productId)
        .then((data) => {
          setProduct(data);
        })
        .catch((err) => {
          setError(`Failed to load product: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, products]);

  const handleSaveProduct = (savedProduct: any) => {
    setProduct(savedProduct);
    
    // If we were creating a new product, update the productId
    if (!productId && savedProduct.id) {
      setSelectedProductIds([savedProduct.id]);
    }
    
    // Show success message or navigate to another view
  };

  const handleDeleteComplete = () => {
    if (onBack) {
      onBack();
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'details':
        return (
          <ProductForm
            productId={productId}
            onSave={handleSaveProduct}
            onCancel={onBack}
            onDelete={() => setCurrentView('delete')}
          />
        );
      case 'options':
        if (!productId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the product before managing options.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <ProductOptionsForm
            productId={productId}
            onSave={() => {
              // Refresh product data after saving options
              products.getProduct(productId).then(setProduct);
            }}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'variants':
        if (!productId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the product before managing variants.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <ProductVariantsForm
            productId={productId}
            onSave={() => {
              // Refresh product data after saving variants
              products.getProduct(productId).then(setProduct);
            }}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'media':
        if (!productId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the product before managing media.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <ProductMediaUploader
            productId={productId}
            onSave={() => {
              // Refresh product data after saving media
              products.getProduct(productId).then(setProduct);
            }}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'delete':
        if (!productId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>No product to delete.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <ProductDeleteConfirmation
            productId={productId}
            productTitle={product?.title}
            onConfirm={handleDeleteComplete}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'bulk':
        return (
          <ProductBulkActions
            selectedProductIds={selectedProductIds}
            onComplete={onBack}
            onCancel={() => setCurrentView('details')}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && productId) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Navigation tabs */}
      {(productId || currentView === 'details') && (
        <div className="border-b border-light-ui dark:border-dark-ui">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setCurrentView('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'details'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setCurrentView('options')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'options'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!productId}
            >
              Options
            </button>
            <button
              onClick={() => setCurrentView('variants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'variants'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!productId}
            >
              Variants
            </button>
            <button
              onClick={() => setCurrentView('media')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'media'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!productId}
            >
              Media
            </button>
            {productId && (
              <button
                onClick={() => setCurrentView('delete')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'delete'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-light-fg dark:text-dark-fg hover:text-red-500 hover:border-red-300'
                }`}
              >
                Delete
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Current view */}
      {renderCurrentView()}
    </div>
  );
};

export default ProductAdmin;
