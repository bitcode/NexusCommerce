import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface ProductOption {
  id?: string;
  name: string;
  position: number;
  values: string[];
}

export interface ProductOptionsFormProps {
  productId: string;
  onSave?: (options: ProductOption[]) => void;
  onCancel?: () => void;
}

const ProductOptionsForm: React.FC<ProductOptionsFormProps> = ({
  productId,
  onSave,
  onCancel,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);

  // Fetch product data to get current options
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);

      products.getProduct(productId)
        .then((data) => {
          setProduct(data);
          if (data.options && Array.isArray(data.options)) {
            setOptions(data.options.map((option: any) => ({
              id: option.id,
              name: option.name,
              position: option.position || 0,
              values: option.values || [],
            })));
          }
        })
        .catch((err) => {
          setError(`Failed to load product options: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, products]);

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        name: '',
        position: options.length + 1,
        values: [],
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    
    // Update positions
    newOptions.forEach((option, idx) => {
      option.position = idx + 1;
    });
    
    setOptions(newOptions);
  };

  const handleOptionChange = (index: number, field: keyof ProductOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setOptions(newOptions);
  };

  const handleValuesChange = (index: number, valuesString: string) => {
    const values = valuesString.split(',').map(value => value.trim()).filter(value => value);
    handleOptionChange(index, 'values', values);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate options
      const validOptions = options.filter(option => option.name && option.values.length > 0);
      
      if (validOptions.length !== options.length) {
        throw new Error('All options must have a name and at least one value');
      }

      // Update product options
      const updatedProduct = await products.updateProduct(productId, {
        options: options.map(option => ({
          id: option.id,
          name: option.name,
          values: option.values,
        })),
      });

      if (onSave) {
        onSave(options);
      }
    } catch (err: any) {
      setError(`Failed to save product options: ${err.message}`);
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

  // Render the form with dual-view capability
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Options</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddOption}
            className="text-sm"
          >
            Add Option
          </Button>
        </div>

        {options.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
            <p className="text-light-fg dark:text-dark-fg opacity-70">
              No options defined. Add an option to create variants.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {options.map((option, index) => (
              <div 
                key={option.id || index} 
                className="p-4 border border-light-ui dark:border-dark-ui rounded-md"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Option {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveOption(index)}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    Remove
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`option-name-${index}`} className="block text-sm font-medium mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`option-name-${index}`}
                      value={option.name}
                      onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                      placeholder="e.g., Size, Color, Material"
                      required
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                    />
                  </div>

                  <div>
                    <label htmlFor={`option-values-${index}`} className="block text-sm font-medium mb-1">
                      Values (comma separated) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`option-values-${index}`}
                      value={option.values.join(', ')}
                      onChange={(e) => handleValuesChange(index, e.target.value)}
                      placeholder="e.g., Small, Medium, Large"
                      required
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-light-ui dark:border-dark-ui space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSaving || options.length === 0}
        >
          {isSaving ? 'Saving...' : 'Save Options'}
        </Button>
      </div>
    </form>
  );

  return (
    <DualView
      title="Product Options"
      presentationView={renderForm()}
      rawData={{ productId, options }}
      defaultView="presentation"
    />
  );
};

export default ProductOptionsForm;
