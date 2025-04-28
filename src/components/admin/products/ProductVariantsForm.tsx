import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface ProductVariant {
  id?: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity?: number;
  inventoryPolicy?: 'DENY' | 'CONTINUE';
  inventoryManagement?: 'SHOPIFY' | 'NOT_MANAGED';
  requiresShipping?: boolean;
  taxable?: boolean;
  weight?: number;
  weightUnit?: 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';
  selectedOptions: { name: string; value: string }[];
  position?: number;
}

export interface ProductVariantsFormProps {
  productId: string;
  onSave?: (variants: ProductVariant[]) => void;
  onCancel?: () => void;
}

const ProductVariantsForm: React.FC<ProductVariantsFormProps> = ({
  productId,
  onSave,
  onCancel,
}) => {
  const { products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>([]);

  // Fetch product data to get current variants and options
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);

      products.getProduct(productId)
        .then((data) => {
          setProduct(data);
          
          // Extract options
          if (data.options && Array.isArray(data.options)) {
            setOptions(data.options.map((option: any) => ({
              name: option.name,
              values: option.values || [],
            })));
          }
          
          // Extract variants
          if (data.variants && data.variants.edges) {
            const extractedVariants = data.variants.edges.map((edge: any) => {
              const node = edge.node;
              return {
                id: node.id,
                title: node.title,
                price: node.price || '0.00',
                compareAtPrice: node.compareAtPrice,
                sku: node.sku || '',
                inventoryQuantity: node.inventoryQuantity || 0,
                inventoryPolicy: node.inventoryPolicy || 'DENY',
                inventoryManagement: node.inventoryManagement || 'SHOPIFY',
                requiresShipping: node.requiresShipping !== false,
                taxable: node.taxable !== false,
                weight: node.weight || 0,
                weightUnit: node.weightUnit || 'GRAMS',
                selectedOptions: node.selectedOptions || [],
                position: node.position || 0,
              };
            });
            setVariants(extractedVariants);
          }
        })
        .catch((err) => {
          setError(`Failed to load product variants: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, products]);

  const generateVariantCombinations = () => {
    if (options.length === 0) {
      setError('No options defined. Please add options before generating variants.');
      return;
    }

    // Generate all possible combinations of option values
    const generateCombinations = (optionIndex: number, currentCombination: { name: string; value: string }[] = []) => {
      if (optionIndex >= options.length) {
        return [currentCombination];
      }

      const currentOption = options[optionIndex];
      const combinations: { name: string; value: string }[][] = [];

      for (const value of currentOption.values) {
        const newCombination = [
          ...currentCombination,
          { name: currentOption.name, value },
        ];
        combinations.push(...generateCombinations(optionIndex + 1, newCombination));
      }

      return combinations;
    };

    const optionCombinations = generateCombinations(0);
    
    // Create variants from combinations
    const newVariants: ProductVariant[] = optionCombinations.map((selectedOptions, index) => {
      // Check if this combination already exists
      const existingVariant = variants.find(variant => 
        JSON.stringify(variant.selectedOptions.sort()) === JSON.stringify(selectedOptions.sort())
      );
      
      if (existingVariant) {
        return existingVariant;
      }
      
      // Create a new variant
      return {
        title: selectedOptions.map(option => option.value).join(' / '),
        price: '0.00',
        sku: '',
        inventoryQuantity: 0,
        inventoryPolicy: 'DENY',
        inventoryManagement: 'SHOPIFY',
        requiresShipping: true,
        taxable: true,
        weight: 0,
        weightUnit: 'GRAMS',
        selectedOptions,
        position: index + 1,
      };
    });

    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    if (options.length === 0) {
      setError('No options defined. Please add options before adding variants.');
      return;
    }

    // Create a new variant with default values for each option
    const selectedOptions = options.map(option => ({
      name: option.name,
      value: option.values[0] || '',
    }));

    setVariants([
      ...variants,
      {
        title: selectedOptions.map(option => option.value).join(' / '),
        price: '0.00',
        sku: '',
        inventoryQuantity: 0,
        inventoryPolicy: 'DENY',
        inventoryManagement: 'SHOPIFY',
        requiresShipping: true,
        taxable: true,
        weight: 0,
        weightUnit: 'GRAMS',
        selectedOptions,
        position: variants.length + 1,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    
    // Update positions
    newVariants.forEach((variant, idx) => {
      variant.position = idx + 1;
    });
    
    setVariants(newVariants);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    setVariants(newVariants);
  };

  const handleOptionValueChange = (variantIndex: number, optionIndex: number, value: string) => {
    const newVariants = [...variants];
    const variant = newVariants[variantIndex];
    
    // Update the option value
    variant.selectedOptions[optionIndex] = {
      ...variant.selectedOptions[optionIndex],
      value,
    };
    
    // Update the variant title
    variant.title = variant.selectedOptions.map(option => option.value).join(' / ');
    
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate variants
      const validVariants = variants.filter(variant => 
        parseFloat(variant.price) >= 0 && 
        variant.selectedOptions.every(option => option.value)
      );
      
      if (validVariants.length !== variants.length) {
        throw new Error('All variants must have a valid price and option values');
      }

      // Prepare variants for API
      const variantInputs = variants.map(variant => {
        const input: any = {
          options: variant.selectedOptions.map(option => option.value),
          price: variant.price,
          position: variant.position,
        };
        
        if (variant.id) {
          input.id = variant.id;
        }
        
        if (variant.compareAtPrice) {
          input.compareAtPrice = variant.compareAtPrice;
        }
        
        if (variant.sku) {
          input.sku = variant.sku;
        }
        
        if (variant.inventoryQuantity !== undefined) {
          input.inventoryQuantities = {
            availableQuantity: variant.inventoryQuantity,
            locationId: "gid://shopify/Location/1", // Default location
          };
        }
        
        if (variant.inventoryPolicy) {
          input.inventoryPolicy = variant.inventoryPolicy;
        }
        
        if (variant.inventoryManagement) {
          input.inventoryManagement = variant.inventoryManagement;
        }
        
        if (variant.requiresShipping !== undefined) {
          input.requiresShipping = variant.requiresShipping;
        }
        
        if (variant.taxable !== undefined) {
          input.taxable = variant.taxable;
        }
        
        if (variant.weight !== undefined) {
          input.weight = variant.weight;
        }
        
        if (variant.weightUnit) {
          input.weightUnit = variant.weightUnit;
        }
        
        return input;
      });

      // Update product variants
      let result;
      if (variants.some(variant => variant.id)) {
        // If we have existing variants, use bulk update
        result = await products.bulkUpdateProductVariants(productId, variantInputs);
      } else {
        // Otherwise, use bulk create
        result = await products.bulkCreateProductVariants(productId, variantInputs);
      }

      if (onSave) {
        onSave(variants);
      }
    } catch (err: any) {
      setError(`Failed to save product variants: ${err.message}`);
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
          <h3 className="text-lg font-medium">Product Variants</h3>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={generateVariantCombinations}
              className="text-sm"
            >
              Generate All Combinations
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddVariant}
              className="text-sm"
            >
              Add Variant
            </Button>
          </div>
        </div>

        {options.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
            <p className="text-light-fg dark:text-dark-fg opacity-70">
              No options defined. Please add options before creating variants.
            </p>
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
            <p className="text-light-fg dark:text-dark-fg opacity-70">
              No variants created. Add a variant or generate all combinations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {variants.map((variant, index) => (
              <div 
                key={variant.id || index} 
                className="p-4 border border-light-ui dark:border-dark-ui rounded-md"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Variant {index + 1}: {variant.title}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveVariant(index)}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    Remove
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Option Values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {options.map((option, optionIndex) => (
                      <div key={`${variant.id || index}-option-${optionIndex}`}>
                        <label htmlFor={`variant-${index}-option-${optionIndex}`} className="block text-sm font-medium mb-1">
                          {option.name}
                        </label>
                        <select
                          id={`variant-${index}-option-${optionIndex}`}
                          value={variant.selectedOptions[optionIndex]?.value || ''}
                          onChange={(e) => handleOptionValueChange(index, optionIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                        >
                          {option.values.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Price and Inventory */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor={`variant-${index}-price`} className="block text-sm font-medium mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id={`variant-${index}-price`}
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>

                    <div>
                      <label htmlFor={`variant-${index}-compare-at-price`} className="block text-sm font-medium mb-1">
                        Compare at Price
                      </label>
                      <input
                        type="number"
                        id={`variant-${index}-compare-at-price`}
                        value={variant.compareAtPrice || ''}
                        onChange={(e) => handleVariantChange(index, 'compareAtPrice', e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>

                    <div>
                      <label htmlFor={`variant-${index}-sku`} className="block text-sm font-medium mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        id={`variant-${index}-sku`}
                        value={variant.sku || ''}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor={`variant-${index}-inventory-quantity`} className="block text-sm font-medium mb-1">
                        Inventory Quantity
                      </label>
                      <input
                        type="number"
                        id={`variant-${index}-inventory-quantity`}
                        value={variant.inventoryQuantity || 0}
                        onChange={(e) => handleVariantChange(index, 'inventoryQuantity', parseInt(e.target.value))}
                        min="0"
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>

                    <div>
                      <label htmlFor={`variant-${index}-inventory-policy`} className="block text-sm font-medium mb-1">
                        Inventory Policy
                      </label>
                      <select
                        id={`variant-${index}-inventory-policy`}
                        value={variant.inventoryPolicy || 'DENY'}
                        onChange={(e) => handleVariantChange(index, 'inventoryPolicy', e.target.value as 'DENY' | 'CONTINUE')}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      >
                        <option value="DENY">Deny - Don't sell when out of stock</option>
                        <option value="CONTINUE">Continue - Sell when out of stock</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`variant-${index}-inventory-management`} className="block text-sm font-medium mb-1">
                        Inventory Management
                      </label>
                      <select
                        id={`variant-${index}-inventory-management`}
                        value={variant.inventoryManagement || 'SHOPIFY'}
                        onChange={(e) => handleVariantChange(index, 'inventoryManagement', e.target.value as 'SHOPIFY' | 'NOT_MANAGED')}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      >
                        <option value="SHOPIFY">Shopify tracks inventory</option>
                        <option value="NOT_MANAGED">Don't track inventory</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor={`variant-${index}-weight`} className="block text-sm font-medium mb-1">
                        Weight
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          id={`variant-${index}-weight`}
                          value={variant.weight || 0}
                          onChange={(e) => handleVariantChange(index, 'weight', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                          className="flex-1 px-3 py-2 border border-light-ui dark:border-dark-ui rounded-l-md bg-light-bg dark:bg-dark-bg"
                        />
                        <select
                          value={variant.weightUnit || 'GRAMS'}
                          onChange={(e) => handleVariantChange(index, 'weightUnit', e.target.value as 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES')}
                          className="px-3 py-2 border border-l-0 border-light-ui dark:border-dark-ui rounded-r-md bg-light-bg dark:bg-dark-bg"
                        >
                          <option value="GRAMS">g</option>
                          <option value="KILOGRAMS">kg</option>
                          <option value="POUNDS">lb</option>
                          <option value="OUNCES">oz</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`variant-${index}-requires-shipping`}
                        checked={variant.requiresShipping !== false}
                        onChange={(e) => handleVariantChange(index, 'requiresShipping', e.target.checked)}
                        className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                      />
                      <label htmlFor={`variant-${index}-requires-shipping`} className="ml-2 block text-sm">
                        Requires Shipping
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`variant-${index}-taxable`}
                        checked={variant.taxable !== false}
                        onChange={(e) => handleVariantChange(index, 'taxable', e.target.checked)}
                        className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                      />
                      <label htmlFor={`variant-${index}-taxable`} className="ml-2 block text-sm">
                        Taxable
                      </label>
                    </div>
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
          disabled={isSaving || variants.length === 0}
        >
          {isSaving ? 'Saving...' : 'Save Variants'}
        </Button>
      </div>
    </form>
  );

  return (
    <DualView
      title="Product Variants"
      presentationView={renderForm()}
      rawData={{ productId, options, variants }}
      defaultView="presentation"
    />
  );
};

export default ProductVariantsForm;
