import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';

export interface InventoryAdjustmentFormProps {
  inventoryItemId: string;
  onAdjustmentComplete?: (success: boolean) => void;
  className?: string;
}

/**
 * InventoryAdjustmentForm component
 * This component allows users to adjust inventory levels for a product variant
 */
const InventoryAdjustmentForm: React.FC<InventoryAdjustmentFormProps> = ({
  inventoryItemId,
  onAdjustmentComplete,
  className = '',
}) => {
  const { inventory } = useShopify();
  
  // State for inventory data
  const [inventoryItem, setInventoryItem] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [inventoryLevels, setInventoryLevels] = useState<any[]>([]);
  
  // State for form
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'adjust'>('set');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch inventory item and locations on mount
  useEffect(() => {
    if (inventoryItemId) {
      fetchInventoryItem();
      fetchLocations();
    }
  }, [inventoryItemId]);

  // Fetch inventory item
  const fetchInventoryItem = async () => {
    if (!inventoryItemId) return;
    
    setIsFetching(true);
    setError(null);
    
    try {
      const item = await inventory.getInventoryItem(inventoryItemId);
      if (item) {
        setInventoryItem(item);
        
        // Extract inventory levels
        const levels = item.inventoryLevels?.edges?.map((edge: any) => edge.node) || [];
        setInventoryLevels(levels);
        
        // If there's only one inventory level, select it by default
        if (levels.length === 1) {
          setSelectedLocationId(levels[0].location.id);
        }
      }
    } catch (err: any) {
      setError(`Failed to fetch inventory item: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    setIsFetching(true);
    
    try {
      const response = await inventory.getLocations();
      if (response?.edges) {
        const locationsList = response.edges.map((edge: any) => edge.node);
        setLocations(locationsList);
      }
    } catch (err: any) {
      setError(`Failed to fetch locations: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocationId(e.target.value);
    setAdjustmentValue('');
    setSuccess(null);
  };

  // Handle adjustment type change
  const handleAdjustmentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAdjustmentType(e.target.value as 'set' | 'adjust');
    setAdjustmentValue('');
    setSuccess(null);
  };

  // Handle adjustment value change
  const handleAdjustmentValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9-]/g, '');
    setAdjustmentValue(value);
    setSuccess(null);
  };

  // Handle adjustment reason change
  const handleAdjustmentReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAdjustmentReason(e.target.value);
  };

  // Get current inventory level for selected location
  const getCurrentInventoryLevel = () => {
    if (!selectedLocationId) return null;
    
    return inventoryLevels.find(
      (level) => level.location.id === selectedLocationId
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLocationId) {
      setError('Please select a location');
      return;
    }
    
    if (!adjustmentValue) {
      setError('Please enter an adjustment value');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const currentLevel = getCurrentInventoryLevel();
      const numericValue = parseInt(adjustmentValue, 10);
      
      if (adjustmentType === 'set') {
        // If setting to a specific value, calculate the delta
        const currentQuantity = currentLevel ? currentLevel.available : 0;
        const delta = numericValue - currentQuantity;
        
        if (currentLevel) {
          // If inventory level exists, adjust it
          await inventory.adjustInventoryQuantity(currentLevel.id, delta);
        } else {
          // If inventory level doesn't exist, activate inventory at this location first
          await inventory.activateInventory(inventoryItemId, selectedLocationId);
          
          // Then adjust the quantity
          const newLevel = await inventory.getInventoryItem(inventoryItemId);
          const newLevelId = newLevel.inventoryLevels.edges.find(
            (edge: any) => edge.node.location.id === selectedLocationId
          )?.node.id;
          
          if (newLevelId) {
            await inventory.adjustInventoryQuantity(newLevelId, numericValue);
          }
        }
        
        setSuccess(`Inventory set to ${numericValue}`);
      } else {
        // If adjusting by a relative amount
        if (currentLevel) {
          // If inventory level exists, adjust it
          await inventory.adjustInventoryQuantity(currentLevel.id, numericValue);
          
          const newQuantity = currentLevel.available + numericValue;
          setSuccess(`Inventory ${numericValue >= 0 ? 'increased' : 'decreased'} by ${Math.abs(numericValue)} to ${newQuantity}`);
        } else {
          // If inventory level doesn't exist, activate inventory at this location first
          await inventory.activateInventory(inventoryItemId, selectedLocationId);
          
          // Then adjust the quantity
          const newLevel = await inventory.getInventoryItem(inventoryItemId);
          const newLevelId = newLevel.inventoryLevels.edges.find(
            (edge: any) => edge.node.location.id === selectedLocationId
          )?.node.id;
          
          if (newLevelId) {
            await inventory.adjustInventoryQuantity(newLevelId, numericValue);
            setSuccess(`Inventory ${numericValue >= 0 ? 'increased' : 'decreased'} by ${Math.abs(numericValue)} to ${numericValue}`);
          }
        }
      }
      
      // Refresh inventory data
      fetchInventoryItem();
      
      // Call callback if provided
      if (onAdjustmentComplete) {
        onAdjustmentComplete(true);
      }
    } catch (err: any) {
      setError(`Failed to adjust inventory: ${err.message}`);
      
      // Call callback if provided
      if (onAdjustmentComplete) {
        onAdjustmentComplete(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get location name by ID
  const getLocationName = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location ? location.name : 'Unknown location';
  };

  return (
    <Card title="Adjust Inventory" className={className}>
      <div className="space-y-6">
        {/* Product info */}
        {inventoryItem && (
          <div>
            <h3 className="text-sm font-medium mb-1">Product</h3>
            <p className="text-lg font-semibold">
              {inventoryItem.variant?.product?.title || 'Unknown product'}
            </p>
            <p className="text-sm text-light-fg dark:text-dark-fg">
              {inventoryItem.variant?.title !== 'Default Title' 
                ? inventoryItem.variant?.title 
                : ''}
            </p>
            {inventoryItem.sku && (
              <p className="text-sm text-light-fg dark:text-dark-fg">
                SKU: {inventoryItem.sku}
              </p>
            )}
          </div>
        )}
        
        {/* Current inventory levels */}
        {inventoryLevels.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Current Inventory Levels</h3>
            <div className="bg-light-editor dark:bg-dark-editor rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
                <thead>
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-ui dark:divide-dark-ui">
                  {inventoryLevels.map((level) => (
                    <tr key={level.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {level.location.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                        {level.available}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Adjustment form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Location selector */}
            <div>
              <label htmlFor="locationSelect" className="block text-sm font-medium mb-1">
                Location
              </label>
              <select
                id="locationSelect"
                value={selectedLocationId}
                onChange={handleLocationChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                disabled={isLoading || isFetching}
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Adjustment type */}
            <div>
              <label htmlFor="adjustmentType" className="block text-sm font-medium mb-1">
                Adjustment Type
              </label>
              <select
                id="adjustmentType"
                value={adjustmentType}
                onChange={handleAdjustmentTypeChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                disabled={isLoading || isFetching}
              >
                <option value="set">Set to specific quantity</option>
                <option value="adjust">Adjust by amount</option>
              </select>
            </div>
            
            {/* Adjustment value */}
            <div>
              <label htmlFor="adjustmentValue" className="block text-sm font-medium mb-1">
                {adjustmentType === 'set' ? 'New Quantity' : 'Adjustment Amount'}
              </label>
              <div className="relative">
                {adjustmentType === 'adjust' && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-light-fg dark:text-dark-fg">±</span>
                  </div>
                )}
                <input
                  type="text"
                  id="adjustmentValue"
                  value={adjustmentValue}
                  onChange={handleAdjustmentValueChange}
                  className={`w-full ${
                    adjustmentType === 'adjust' ? 'pl-8' : 'pl-3'
                  } pr-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg`}
                  placeholder={adjustmentType === 'set' ? 'Enter new quantity' : 'Enter adjustment amount'}
                  disabled={isLoading || isFetching || !selectedLocationId}
                  required
                />
              </div>
              {adjustmentType === 'adjust' && (
                <p className="mt-1 text-xs text-light-fg dark:text-dark-fg">
                  Use positive numbers to add inventory, negative numbers to remove inventory
                </p>
              )}
              {selectedLocationId && getCurrentInventoryLevel() && (
                <p className="mt-1 text-xs text-light-fg dark:text-dark-fg">
                  Current quantity at {getLocationName(selectedLocationId)}: {getCurrentInventoryLevel()?.available || 0}
                </p>
              )}
            </div>
            
            {/* Adjustment reason */}
            <div>
              <label htmlFor="adjustmentReason" className="block text-sm font-medium mb-1">
                Reason (optional)
              </label>
              <select
                id="adjustmentReason"
                value={adjustmentReason}
                onChange={handleAdjustmentReasonChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                disabled={isLoading || isFetching}
              >
                <option value="">Select a reason</option>
                <option value="received">Received inventory</option>
                <option value="returned">Customer return</option>
                <option value="damaged">Damaged or defective</option>
                <option value="correction">Inventory correction</option>
                <option value="transfer">Location transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Error and success messages */}
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative">
                {success}
              </div>
            )}
            
            {/* Submit button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || isFetching || !selectedLocationId || !adjustmentValue}
              >
                {isLoading ? 'Adjusting...' : 'Adjust Inventory'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default InventoryAdjustmentForm;
