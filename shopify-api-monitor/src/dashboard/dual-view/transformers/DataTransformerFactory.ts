/**
 * DataTransformerFactory.ts
 * Factory for creating data transformers based on section
 */

import { DataTransformer, DataTransformerFactory as IDataTransformerFactory } from '../types';
import { ProductsDataTransformer } from './ProductsDataTransformer';
import { StoreOverviewDataTransformer } from './StoreOverviewDataTransformer';
import { ProductEcosystemDataTransformer } from './ProductEcosystemDataTransformer';
import { ContentManagementDataTransformer } from './ContentManagementDataTransformer';
import { StorefrontDataTransformerFactory } from './StorefrontDataTransformerFactory';

/**
 * Default implementation of the DataTransformerFactory
 */
export class DataTransformerFactory implements IDataTransformerFactory {
  private storefrontFactory: StorefrontDataTransformerFactory;

  constructor() {
    this.storefrontFactory = new StorefrontDataTransformerFactory();
  }

  /**
   * Creates a data transformer for the specified section
   * 
   * @param section - Section ID
   * @returns DataTransformer instance
   */
  createTransformer(section: string): DataTransformer {
    // Check if this is a Storefront API section
    if (section.startsWith('storefront-')) {
      return this.storefrontFactory.createTransformer(section);
    }

    // Handle Admin API sections
    switch (section) {
      case 'products':
        return new ProductsDataTransformer();
      case 'store-overview':
        return new StoreOverviewDataTransformer();
      case 'product-ecosystem':
        return new ProductEcosystemDataTransformer();
      case 'content-management':
        return new ContentManagementDataTransformer();
      // Add more transformers for other Admin API sections as needed
      // case 'collections':
      //   return new CollectionsDataTransformer();
      // Default to products transformer for Admin API
      default:
        console.warn(`No transformer found for section: ${section}. Using ProductsDataTransformer as fallback.`);
        return new ProductsDataTransformer();
    }
  }
}