import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import InventoryActivationControls from '../../../components/admin/inventory/InventoryActivationControls';
import InventoryAdjustmentForm from '../../../components/admin/inventory/InventoryAdjustmentForm';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

/**
 * InventoryManagementExample page
 * This page demonstrates how to use the inventory management components
 */
const InventoryManagementExample: React.FC = () => {
  const { inventory, products } = useShopify();
  
  // State for product and inventory data
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [inventoryItemId, setInventoryItemId] = useState<string>('');
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await products.getProducts({ first: 10 });
      
      if (response?.edges) {
        // Extract all variants from all products
        const variants: any[] = [];
        
        response.edges.forEach((edge: any) => {
          const product = edge.node;
          
          if (product.variants?.edges) {
            product.variants.edges.forEach((variantEdge: any) => {
              const variant = variantEdge.node;
              variants.push({
                id: variant.id,
                title: `${product.title} - ${variant.title !== 'Default Title' ? variant.title : 'Default'}`,
                sku: variant.sku,
                inventoryItem: variant.inventoryItem
              });
            });
          }
        });
        
        setProductVariants(variants);
        
        // Select the first variant by default
        if (variants.length > 0) {
          setSelectedVariantId(variants[0].id);
          setInventoryItemId(variants[0].inventoryItem?.id || '');
        }
      }
    } catch (err: any) {
      setError(`Failed to fetch products: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle variant selection
  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const variantId = e.target.value;
    setSelectedVariantId(variantId);
    
    // Find the selected variant and get its inventory item ID
    const variant = productVariants.find(v => v.id === variantId);
    setInventoryItemId(variant?.inventoryItem?.id || '');
  };

  // Handle activation change
  const handleActivationChange = (tracked: boolean) => {
    console.log(`Inventory tracking ${tracked ? 'activated' : 'deactivated'}`);
  };

  // Handle adjustment complete
  const handleAdjustmentComplete = (success: boolean) => {
    console.log(`Inventory adjustment ${success ? 'completed' : 'failed'}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management Example</h1>
      
      {/* Product selector */}
      <Card className="mb-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select a Product Variant</h2>
          
          <div>
            <label htmlFor="variantSelect" className="block text-sm font-medium mb-1">
              Product Variant
            </label>
            <select
              id="variantSelect"
              value={selectedVariantId}
              onChange={handleVariantChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              disabled={isLoading || productVariants.length === 0}
            >
              {productVariants.length === 0 ? (
                <option value="">No variants available</option>
              ) : (
                productVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title} {variant.sku ? `(SKU: ${variant.sku})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={fetchProducts}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh Products'}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Inventory management components */}
      {inventoryItemId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inventory activation controls */}
          <InventoryActivationControls
            inventoryItemId={inventoryItemId}
            onActivationChange={handleActivationChange}
          />
          
          {/* Inventory adjustment form */}
          <InventoryAdjustmentForm
            inventoryItemId={inventoryItemId}
            onAdjustmentComplete={handleAdjustmentComplete}
          />
        </div>
      )}
    </div>
  );
};

export default InventoryManagementExample;
