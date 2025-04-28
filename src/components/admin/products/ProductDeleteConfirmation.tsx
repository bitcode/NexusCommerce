import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';

export interface ProductDeleteConfirmationProps {
  productId: string;
  productTitle?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ProductDeleteConfirmation: React.FC<ProductDeleteConfirmationProps> = ({
  productId,
  productTitle,
  onConfirm,
  onCancel,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [confirmText, setConfirmText] = useState('');

  // Fetch product data if title is not provided
  useEffect(() => {
    if (!productTitle && productId) {
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
  }, [productId, productTitle, products]);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await products.deleteProduct(productId);
      
      if (onConfirm) {
        onConfirm();
      }
    } catch (err: any) {
      setError(`Failed to delete product: ${err.message}`);
      setIsDeleting(false);
    }
  };

  const title = productTitle || product?.title || 'this product';

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-medium">Delete Product</h3>
        <div className="mt-2">
          <p className="text-sm text-light-fg dark:text-dark-fg opacity-70">
            Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="confirm-delete" className="block text-sm font-medium mb-1">
          Type DELETE to confirm
        </label>
        <input
          type="text"
          id="confirm-delete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          placeholder="DELETE"
        />
      </div>

      <div className="mt-5 flex justify-end space-x-3">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDelete}
          disabled={isDeleting || confirmText !== 'DELETE'}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-600"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductDeleteConfirmation;
