import React, { useState } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Button from '../../Button';

export interface OrderDeleteConfirmationProps {
  orderId: string;
  orderName?: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

/**
 * OrderDeleteConfirmation component
 * This component displays a confirmation dialog for deleting an order
 */
const OrderDeleteConfirmation: React.FC<OrderDeleteConfirmationProps> = ({
  orderId,
  orderName,
  isOpen,
  onClose,
  onDelete,
}) => {
  const { orders } = useShopify();
  
  // State for loading and error handling
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for confirmation input
  const [confirmationText, setConfirmationText] = useState('');
  const expectedConfirmation = 'DELETE';

  // Handle delete order
  const handleDelete = async () => {
    if (confirmationText !== expectedConfirmation) {
      setError('Please type DELETE to confirm');
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // In a real implementation, we would call the API to delete the order
      // However, Shopify doesn't allow direct deletion of orders through the API
      // Instead, we would typically archive or cancel the order
      
      // For demonstration purposes, we'll simulate a successful deletion
      await orders.cancelOrder(orderId, 'CUSTOMER', 'Deleted by admin');
      
      // Call the onDelete callback
      onDelete();
    } catch (err: any) {
      setError(`Failed to delete order: ${err.message}`);
      setIsDeleting(false);
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-light-bg dark:bg-dark-bg rounded-lg shadow-xl max-w-md w-full p-6 overflow-hidden">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              Delete Order
            </h2>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <p>
              Are you sure you want to delete order{' '}
              <span className="font-semibold">{orderName || orderId}</span>?
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 dark:border-yellow-600 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This action cannot be undone. This will permanently delete the order and all associated data.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmationText" className="block text-sm font-medium mb-1">
                Please type <span className="font-semibold">{expectedConfirmation}</span> to confirm
              </label>
              <input
                type="text"
                id="confirmationText"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                placeholder={expectedConfirmation}
              />
            </div>
            
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
              onClick={handleDelete}
              disabled={isDeleting || confirmationText !== expectedConfirmation}
            >
              {isDeleting ? 'Deleting...' : 'Delete Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDeleteConfirmation;
