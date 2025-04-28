/**
 * useShopify.ts
 * React hook for accessing the ShopifyService
 */

import { useContext, createContext } from 'react';
import { ShopifyService } from '../services/ShopifyService';

// Create a context for the ShopifyService
const ShopifyContext = createContext<ShopifyService | null>(null);

/**
 * Provider component for the ShopifyService
 */
export const ShopifyProvider = ShopifyContext.Provider;

/**
 * Hook for accessing the ShopifyService
 * @returns ShopifyService instance
 * @throws Error if used outside of a ShopifyProvider
 */
export function useShopify(): ShopifyService {
  const shopifyService = useContext(ShopifyContext);
  
  if (!shopifyService) {
    throw new Error('useShopify must be used within a ShopifyProvider');
  }
  
  return shopifyService;
}
