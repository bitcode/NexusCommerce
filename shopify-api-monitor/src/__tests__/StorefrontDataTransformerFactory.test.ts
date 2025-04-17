/**
 * StorefrontDataTransformerFactory.test.ts
 * Tests for the StorefrontDataTransformerFactory class.
 */

import { StorefrontDataTransformerFactory } from '../dashboard/dual-view/transformers/StorefrontDataTransformerFactory';
import { StorefrontProductsTransformer } from '../dashboard/dual-view/transformers/StorefrontProductsTransformer';
import { StorefrontCollectionsTransformer } from '../dashboard/dual-view/transformers/StorefrontCollectionsTransformer';
import { DataTransformer } from '../dashboard/dual-view/types';

describe('StorefrontDataTransformerFactory', () => {
  let factory: StorefrontDataTransformerFactory;
  
  beforeEach(() => {
    factory = new StorefrontDataTransformerFactory();
  });
  
  test('should create StorefrontProductsTransformer for storefront-products section', () => {
    const transformer = factory.createTransformer('storefront-products');
    
    expect(transformer).toBeDefined();
    expect(transformer).toBeInstanceOf(StorefrontProductsTransformer);
  });
  
  test('should create StorefrontCollectionsTransformer for storefront-collections section', () => {
    const transformer = factory.createTransformer('storefront-collections');
    
    expect(transformer).toBeDefined();
    expect(transformer).toBeInstanceOf(StorefrontCollectionsTransformer);
  });
  
  test('should fall back to StorefrontProductsTransformer for unknown sections', () => {
    // Mock console.warn to prevent test output pollution
    const originalWarn = console.warn;
    console.warn = jest.fn();
    
    const transformer = factory.createTransformer('unknown-section');
    
    expect(transformer).toBeDefined();
    expect(transformer).toBeInstanceOf(StorefrontProductsTransformer);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('No Storefront transformer found for section: unknown-section')
    );
    
    // Restore console.warn
    console.warn = originalWarn;
  });
  
  test('should create transformers that implement DataTransformer interface', () => {
    const productsTransformer = factory.createTransformer('storefront-products');
    const collectionsTransformer = factory.createTransformer('storefront-collections');
    
    // Check that transformers implement the required methods
    expect(typeof productsTransformer.transformToTreeNodes).toBe('function');
    expect(typeof productsTransformer.transformToRawData).toBe('function');
    
    expect(typeof collectionsTransformer.transformToTreeNodes).toBe('function');
    expect(typeof collectionsTransformer.transformToRawData).toBe('function');
  });
  
  test('should create different instances for each call', () => {
    const transformer1 = factory.createTransformer('storefront-products');
    const transformer2 = factory.createTransformer('storefront-products');
    
    expect(transformer1).not.toBe(transformer2);
  });
  
  // Test for future transformers (commented out until implemented)
  /*
  test('should create StorefrontContentTransformer for storefront-content section', () => {
    const transformer = factory.createTransformer('storefront-content');
    
    expect(transformer).toBeDefined();
    expect(transformer).toBeInstanceOf(StorefrontContentTransformer);
  });
  
  test('should create StorefrontMetaobjectsTransformer for storefront-metaobjects section', () => {
    const transformer = factory.createTransformer('storefront-metaobjects');
    
    expect(transformer).toBeDefined();
    expect(transformer).toBeInstanceOf(StorefrontMetaobjectsTransformer);
  });
  */
});
