import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import { Switch } from '../../Switch';

export interface InventoryActivationControlsProps {
  inventoryItemId: string;
  initialTracked?: boolean;
  onActivationChange?: (tracked: boolean) => void;
  className?: string;
}

/**
 * InventoryActivationControls component
 * This component allows users to activate or deactivate inventory tracking for a product variant
 */
const InventoryActivationControls: React.FC<InventoryActivationControlsProps> = ({
  inventoryItemId,
  initialTracked = false,
  onActivationChange,
  className = '',
}) => {
  const { inventory } = useShopify();
  
  // State for tracking status
  const [isTracked, setIsTracked] = useState(initialTracked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Fetch inventory item and locations on mount
  useEffect(() => {
    fetchInventoryItem();
    fetchLocations();
  }, [inventoryItemId]);

  // Fetch inventory item
  const fetchInventoryItem = async () => {
    if (!inventoryItemId) return;
    
    try {
      const item = await inventory.getInventoryItem(inventoryItemId);
      if (item) {
        setIsTracked(item.tracked);
      }
    } catch (err: any) {
      setError(`Failed to fetch inventory item: ${err.message}`);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const response = await inventory.getLocations();
      if (response?.edges) {
        const locationsList = response.edges.map((edge: any) => edge.node);
        setLocations(locationsList);
        
        // Set default selected location to the first active location
        const activeLocation = locationsList.find((loc: any) => loc.isActive);
        if (activeLocation) {
          setSelectedLocationId(activeLocation.id);
        }
      }
    } catch (err: any) {
      setError(`Failed to fetch locations: ${err.message}`);
    }
  };

  // Handle tracking toggle
  const handleTrackingToggle = async (newTrackedState: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Update inventory tracking
      await inventory.setInventoryTracking(inventoryItemId, newTrackedState);
      
      // If turning on tracking and a location is selected, activate inventory at that location
      if (newTrackedState && selectedLocationId) {
        await inventory.activateInventory(inventoryItemId, selectedLocationId);
      }
      
      // Update local state
      setIsTracked(newTrackedState);
      
      // Call callback if provided
      if (onActivationChange) {
        onActivationChange(newTrackedState);
      }
    } catch (err: any) {
      setError(`Failed to ${newTrackedState ? 'activate' : 'deactivate'} inventory tracking: ${err.message}`);
      // Revert UI state on error
      setIsTracked(!newTrackedState);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocationId(e.target.value);
  };

  return (
    <Card title="Inventory Tracking" className={className}>
      <div className="space-y-4">
        {/* Tracking toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Track inventory</h3>
            <p className="text-sm text-light-fg dark:text-dark-fg opacity-70">
              {isTracked 
                ? 'Inventory is being tracked for this item' 
                : 'Inventory is not being tracked for this item'}
            </p>
          </div>
          <Switch
            checked={isTracked}
            onChange={handleTrackingToggle}
            disabled={isLoading}
            aria-label="Track inventory"
          />
        </div>
        
        {/* Location selector (only shown when tracking is enabled) */}
        {isTracked && (
          <div>
            <label htmlFor="locationSelect" className="block text-sm font-medium mb-1">
              Location
            </label>
            <select
              id="locationSelect"
              value={selectedLocationId || ''}
              onChange={handleLocationChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              disabled={isLoading}
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-light-fg dark:text-dark-fg opacity-70">
              Select a location to track inventory
            </p>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {/* Help text */}
        <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
          <h4 className="text-sm font-medium mb-2">About inventory tracking</h4>
          <p className="text-sm text-light-fg dark:text-dark-fg">
            When inventory tracking is enabled, Shopify will keep track of inventory levels for this item.
            This allows you to:
          </p>
          <ul className="list-disc list-inside text-sm text-light-fg dark:text-dark-fg mt-2 space-y-1">
            <li>Monitor stock levels</li>
            <li>Receive low stock notifications</li>
            <li>Prevent overselling</li>
            <li>Track inventory across multiple locations</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default InventoryActivationControls;
