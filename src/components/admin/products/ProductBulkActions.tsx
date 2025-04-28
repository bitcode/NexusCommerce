import React, { useState } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface ProductBulkActionsProps {
  selectedProductIds: string[];
  onComplete?: () => void;
  onCancel?: () => void;
}

const ProductBulkActions: React.FC<ProductBulkActionsProps> = ({
  selectedProductIds,
  onComplete,
  onCancel,
}) => {
  const { products } = useShopify();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<string>('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [progress, setProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAction(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as 'ACTIVE' | 'DRAFT' | 'ARCHIVED');
  };

  const executeAction = async () => {
    if (!action) {
      setError('Please select an action');
      return;
    }

    if (selectedProductIds.length === 0) {
      setError('No products selected');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress({ completed: 0, total: selectedProductIds.length });

    try {
      // Process products in batches to avoid overwhelming the API
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < selectedProductIds.length; i += batchSize) {
        batches.push(selectedProductIds.slice(i, i + batchSize));
      }

      for (const [batchIndex, batch] of batches.entries()) {
        // Process each batch in parallel
        await Promise.all(
          batch.map(async (productId, index) => {
            try {
              switch (action) {
                case 'publish':
                  await products.publishProduct(productId);
                  break;
                case 'unpublish':
                  await products.unpublishProduct(productId);
                  break;
                case 'changeStatus':
                  await products.changeProductStatus(productId, status);
                  break;
                case 'delete':
                  await products.deleteProduct(productId);
                  break;
                default:
                  throw new Error(`Unknown action: ${action}`);
              }
              
              // Update progress
              setProgress(prev => ({
                ...prev,
                completed: prev.completed + 1,
              }));
            } catch (err: any) {
              console.error(`Error processing product ${productId}:`, err);
              // Continue with other products even if one fails
            }
          })
        );
      }

      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(`Failed to process products: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render the form with dual-view capability
  const renderForm = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div>
        <p className="mb-4">
          Selected <strong>{selectedProductIds.length}</strong> product{selectedProductIds.length !== 1 ? 's' : ''}.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="bulk-action" className="block text-sm font-medium mb-1">
              Action
            </label>
            <select
              id="bulk-action"
              value={action}
              onChange={handleActionChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              disabled={isProcessing}
            >
              <option value="">Select an action</option>
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
              <option value="changeStatus">Change Status</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {action === 'changeStatus' && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                disabled={isProcessing}
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="w-full bg-light-ui dark:bg-dark-ui rounded-full h-2.5">
            <div
              className="bg-light-accent dark:bg-dark-accent h-2.5 rounded-full"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-center">
            Processing {progress.completed} of {progress.total} products...
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-light-ui dark:border-dark-ui space-x-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={executeAction}
          disabled={isProcessing || !action}
          className={action === 'delete' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-600' : ''}
        >
          {isProcessing ? 'Processing...' : 'Apply to Selected Products'}
        </Button>
      </div>
    </div>
  );

  return (
    <DualView
      title="Bulk Actions"
      presentationView={renderForm()}
      rawData={{ selectedProductIds, action, status }}
      defaultView="presentation"
    />
  );
};

export default ProductBulkActions;
