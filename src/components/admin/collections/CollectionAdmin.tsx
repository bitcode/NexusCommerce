import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import CollectionForm from './CollectionForm';
import CollectionProductsManager from './CollectionProductsManager';
import CollectionDeleteConfirmation from './CollectionDeleteConfirmation';

export interface CollectionAdminProps {
  collectionId?: string;
  onBack?: () => void;
}

type AdminView = 'details' | 'products' | 'delete';

const CollectionAdmin: React.FC<CollectionAdminProps> = ({
  collectionId,
  onBack,
}) => {
  const { collections } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<any>(null);
  const [currentView, setCurrentView] = useState<AdminView>('details');

  // Fetch collection data if editing an existing collection
  useEffect(() => {
    if (collectionId) {
      setIsLoading(true);
      setError(null);

      collections.getCollection(collectionId)
        .then((data) => {
          setCollection(data);
        })
        .catch((err) => {
          setError(`Failed to load collection: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [collectionId, collections]);

  const handleSaveCollection = (savedCollection: any) => {
    setCollection(savedCollection);
    
    // If we were creating a new collection, update the collectionId
    if (!collectionId && savedCollection.id) {
      // In a real application, you might want to update the URL or state in a parent component
      console.log('Created new collection with ID:', savedCollection.id);
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
          <CollectionForm
            collectionId={collectionId}
            onSave={handleSaveCollection}
            onCancel={onBack}
            onDelete={() => setCurrentView('delete')}
          />
        );
      case 'products':
        if (!collectionId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the collection before managing products.</p>
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
          <CollectionProductsManager
            collectionId={collectionId}
            onSave={() => {
              // Refresh collection data after saving products
              collections.getCollection(collectionId).then(setCollection);
            }}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'delete':
        if (!collectionId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>No collection to delete.</p>
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
          <CollectionDeleteConfirmation
            collectionId={collectionId}
            collectionTitle={collection?.title}
            onConfirm={handleDeleteComplete}
            onCancel={() => setCurrentView('details')}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && collectionId) {
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
      {(collectionId || currentView === 'details') && (
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
              onClick={() => setCurrentView('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'products'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!collectionId}
            >
              Products
            </button>
            {collectionId && (
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

export default CollectionAdmin;
