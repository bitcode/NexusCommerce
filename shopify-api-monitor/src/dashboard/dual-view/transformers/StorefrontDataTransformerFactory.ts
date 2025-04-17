/**
 * StorefrontDataTransformerFactory.ts
 * Factory for creating Storefront API data transformers
 */

import { DataTransformer, DataTransformerFactory as IDataTransformerFactory } from '../types';
import { StorefrontProductsTransformer } from './StorefrontProductsTransformer';
import { StorefrontCollectionsTransformer } from './StorefrontCollectionsTransformer';

/**
 * Factory for creating Storefront API data transformers
 */
export class StorefrontDataTransformerFactory implements IDataTransformerFactory {
  /**
   * Creates a data transformer for the specified section
   * 
   * @param section - Section ID
   * @returns DataTransformer instance
   */
  createTransformer(section: string): DataTransformer {
    switch (section) {
      case 'storefront-products':
        return new StorefrontProductsTransformer();
      
      case 'storefront-collections':
        return new StorefrontCollectionsTransformer();
      
      // Add more transformers for other Storefront API sections as needed
      // case 'storefront-content':
      //   return new StorefrontContentTransformer();
      // case 'storefront-metaobjects':
      //   return new StorefrontMetaobjectsTransformer();
      // case 'storefront-menus':
      //   return new StorefrontMenusTransformer();
      
      // Default to products transformer for Storefront API
      default:
        console.warn(`No Storefront transformer found for section: ${section}. Using StorefrontProductsTransformer as fallback.`);
        return new StorefrontProductsTransformer();
    }
  }
}