import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface ProductFormProps {
  productId?: string;
  onSave?: (product: any) => void;
  onCancel?: () => void;
  onDelete?: (productId: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  productId,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    descriptionHtml: '',
    productType: '',
    vendor: '',
    tags: '',
    status: 'ACTIVE',
    seo: {
      title: '',
      description: '',
    },
  });

  // Fetch product data if editing an existing product
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);

      products.getProduct(productId)
        .then((data) => {
          setProduct(data);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            descriptionHtml: data.descriptionHtml || '',
            productType: data.productType || '',
            vendor: data.vendor || '',
            tags: data.tags ? data.tags.join(', ') : '',
            status: data.status || 'ACTIVE',
            seo: {
              title: data.seo?.title || '',
              description: data.seo?.description || '',
            },
          });
        })
        .catch((err) => {
          setError(`Failed to load product: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          [seoField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Prepare the input data
      const input = {
        title: formData.title,
        descriptionHtml: formData.descriptionHtml || formData.description,
        productType: formData.productType,
        vendor: formData.vendor,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: formData.status,
        seo: {
          title: formData.seo.title,
          description: formData.seo.description,
        },
      };

      let savedProduct;
      if (productId) {
        // Update existing product
        savedProduct = await products.updateProduct(productId, input);
      } else {
        // Create new product
        savedProduct = await products.createProduct(input);
      }

      if (onSave) {
        onSave(savedProduct);
      }
    } catch (err: any) {
      setError(`Failed to save product: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (productId && onDelete) {
      onDelete(productId);
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

  // Render the form with dual-view capability
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="descriptionHtml" className="block text-sm font-medium mb-1">
            HTML Description
          </label>
          <textarea
            id="descriptionHtml"
            name="descriptionHtml"
            value={formData.descriptionHtml}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="productType" className="block text-sm font-medium mb-1">
              Product Type
            </label>
            <input
              type="text"
              id="productType"
              name="productType"
              value={formData.productType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          <div>
            <label htmlFor="vendor" className="block text-sm font-medium mb-1">
              Vendor
            </label>
            <input
              type="text"
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          >
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="border-t border-light-ui dark:border-dark-ui pt-4">
          <h3 className="text-lg font-medium mb-3">SEO</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seo.title" className="block text-sm font-medium mb-1">
                SEO Title
              </label>
              <input
                type="text"
                id="seo.title"
                name="seo.title"
                value={formData.seo.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>

            <div>
              <label htmlFor="seo.description" className="block text-sm font-medium mb-1">
                SEO Description
              </label>
              <textarea
                id="seo.description"
                name="seo.description"
                value={formData.seo.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
        <div>
          {productId && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <DualView
      title={productId ? 'Edit Product' : 'Create Product'}
      presentationView={renderForm()}
      rawData={product || formData}
      defaultView="presentation"
    />
  );
};

export default ProductForm;
