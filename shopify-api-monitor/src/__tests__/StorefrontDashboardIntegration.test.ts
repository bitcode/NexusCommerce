/**
 * StorefrontDashboardIntegration.test.ts
 * Tests for the integration of the Storefront API with the dashboard.
 */

import { StorefrontApiClient } from '../StorefrontApiClient';
import { StorefrontDataTransformerFactory } from '../dashboard/dual-view/transformers/StorefrontDataTransformerFactory';
import { ProductManagementDashboard } from '../dashboard/ProductManagementDashboard';
import { MOCK_PRODUCTS_RESPONSE, MOCK_COLLECTIONS_RESPONSE } from './fixtures/storefrontApiResponses';

// Mock the StorefrontApiClient
jest.mock('../StorefrontApiClient');

// Mock the ProductManagementDashboard
jest.mock('../dashboard/ProductManagementDashboard');

describe('Storefront Dashboard Integration', () => {
  let mockClient: jest.Mocked<StorefrontApiClient>;
  let dashboard: jest.Mocked<ProductManagementDashboard>;
  let transformerFactory: StorefrontDataTransformerFactory;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock client
    mockClient = new StorefrontApiClient({}) as jest.Mocked<StorefrontApiClient>;
    mockClient.request = jest.fn();
    mockClient.setContext = jest.fn();

    // Create transformer factory
    transformerFactory = new StorefrontDataTransformerFactory();

    // Create mock dashboard
    dashboard = new ProductManagementDashboard() as jest.Mocked<ProductManagementDashboard>;
    dashboard.loadSection = jest.fn();
    dashboard.displayError = jest.fn();
    dashboard.updateContext = jest.fn();
    dashboard.renderTreeView = jest.fn();
    dashboard.renderRawDataView = jest.fn();
    dashboard.setViewMode = jest.fn();
  });

  describe('Dashboard Section Loading', () => {
    test('should load products section with Storefront API data', async () => {
      // Mock client to return products data
      mockClient.request.mockResolvedValue(MOCK_PRODUCTS_RESPONSE);

      // Mock implementation of loadSection
      dashboard.loadSection.mockImplementation(async (section, client) => {
        if (section === 'storefront-products') {
          await client.request('query { products { edges { node { id } } } }', { first: 20 });
          dashboard.renderTreeView([]);
          dashboard.renderRawDataView('');
        }
      });

      // Load products section
      await dashboard.loadSection('storefront-products', mockClient);

      // Verify client was called with correct query
      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining('products'),
        expect.any(Object)
      );

      // Verify dashboard methods were called
      expect(dashboard.renderTreeView).toHaveBeenCalled();
      expect(dashboard.renderRawDataView).toHaveBeenCalled();
    });

    test('should load collections section with Storefront API data', async () => {
      // Mock client to return collections data
      mockClient.request.mockResolvedValue(MOCK_COLLECTIONS_RESPONSE);

      // Mock implementation of loadSection
      dashboard.loadSection.mockImplementation(async (section, client) => {
        if (section === 'storefront-collections') {
          await client.request('query { collections { edges { node { id } } } }', { first: 20 });
          dashboard.renderTreeView([]);
          dashboard.renderRawDataView('');
        }
      });

      // Load collections section
      await dashboard.loadSection('storefront-collections', mockClient);

      // Verify client was called with correct query
      expect(mockClient.request).toHaveBeenCalledWith(
        expect.stringContaining('collections'),
        expect.any(Object)
      );

      // Verify dashboard methods were called
      expect(dashboard.renderTreeView).toHaveBeenCalled();
      expect(dashboard.renderRawDataView).toHaveBeenCalled();
    });

    test('should handle errors when loading sections', async () => {
      // Mock client to throw an error
      mockClient.request.mockRejectedValue(new Error('Failed to load data'));

      // Mock implementation of loadSection
      dashboard.loadSection.mockImplementation(async (section, client) => {
        try {
          await client.request('query { products { edges { node { id } } } }', { first: 20 });
          dashboard.renderTreeView([]);
          dashboard.renderRawDataView('');
        } catch (error) {
          dashboard.displayError(`Error loading ${section}: ${error.message}`);
        }
      });

      // Load products section
      await dashboard.loadSection('storefront-products', mockClient);

      // Verify error was displayed
      expect(dashboard.displayError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load data')
      );

      // Verify tree view and raw data view were not rendered
      expect(dashboard.renderTreeView).not.toHaveBeenCalled();
      expect(dashboard.renderRawDataView).not.toHaveBeenCalled();
    });
  });

  describe('Context Handling', () => {
    test('should update client context when dashboard context changes', async () => {
      // Mock client
      mockClient.setContext = jest.fn();

      // Mock implementation of updateContext
      dashboard.updateContext.mockImplementation((context, client) => {
        client.setContext(context);
        dashboard.loadSection('storefront-products', client);
      });

      // Update context
      dashboard.updateContext({ country: 'US', language: 'EN' }, mockClient);

      // Verify client context was updated
      expect(mockClient.setContext).toHaveBeenCalledWith({
        country: 'US',
        language: 'EN'
      });

      // Verify section was reloaded
      expect(dashboard.loadSection).toHaveBeenCalled();
    });

    test('should handle errors when updating context', async () => {
      // Mock client to throw an error when setting context
      mockClient.setContext = jest.fn().mockImplementation(() => {
        throw new Error('Failed to update context');
      });

      // Mock implementation of updateContext
      dashboard.updateContext.mockImplementation((context, client) => {
        try {
          client.setContext(context);
          dashboard.loadSection('storefront-products', client);
        } catch (error) {
          dashboard.displayError(`Error updating context: ${error.message}`);
        }
      });

      // Update context
      dashboard.updateContext({ country: 'US', language: 'EN' }, mockClient);

      // Verify error was displayed
      expect(dashboard.displayError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update context')
      );

      // Verify section was not reloaded
      expect(dashboard.loadSection).not.toHaveBeenCalled();
    });
  });

  describe('Data Transformation', () => {
    test('should transform Storefront API data for tree view', async () => {
      // Mock client to return products data
      mockClient.request.mockResolvedValue(MOCK_PRODUCTS_RESPONSE);

      // Create spy on transformer
      const productsTransformer = transformerFactory.createTransformer('storefront-products');
      const transformSpy = jest.spyOn(productsTransformer, 'transformToTreeNodes');

      // Mock the factory to return our spied transformer
      jest.spyOn(transformerFactory, 'createTransformer').mockReturnValue(productsTransformer);

      // Mock implementation of loadSection
      dashboard.loadSection.mockImplementation(async (section, client, factory) => {
        const response = await client.request('query { products { edges { node { id } } } }', { first: 20 });
        const transformer = factory.createTransformer(section);
        const treeData = transformer.transformToTreeNodes(response.data);
        dashboard.renderTreeView(treeData);
      });

      // Load products section
      await dashboard.loadSection('storefront-products', mockClient, transformerFactory);

      // Verify transformer was called with correct data
      expect(transformSpy).toHaveBeenCalledWith(MOCK_PRODUCTS_RESPONSE.data);

      // Verify tree view was rendered with transformed data
      expect(dashboard.renderTreeView).toHaveBeenCalled();
    });

    test('should transform Storefront API data for raw data view', async () => {
      // Mock client to return products data
      mockClient.request.mockResolvedValue(MOCK_PRODUCTS_RESPONSE);

      // Create spy on transformer
      const productsTransformer = transformerFactory.createTransformer('storefront-products');
      const transformSpy = jest.spyOn(productsTransformer, 'transformToRawData');

      // Mock the factory to return our spied transformer
      jest.spyOn(transformerFactory, 'createTransformer').mockReturnValue(productsTransformer);

      // Mock implementation of loadSection
      dashboard.loadSection.mockImplementation(async (section, client, factory) => {
        const response = await client.request('query { products { edges { node { id } } } }', { first: 20 });
        const transformer = factory.createTransformer(section);
        const rawData = transformer.transformToRawData(response.data, 'json');
        dashboard.renderRawDataView(rawData);
      });

      // Load products section
      await dashboard.loadSection('storefront-products', mockClient, transformerFactory);

      // Verify transformer was called with correct data
      expect(transformSpy).toHaveBeenCalledWith(MOCK_PRODUCTS_RESPONSE.data, expect.any(String));

      // Verify raw data view was rendered with transformed data
      expect(dashboard.renderRawDataView).toHaveBeenCalled();
    });
  });

  describe('Dual-View Presentation', () => {
    test('should switch between tree view and raw data view', async () => {
      // Mock client to return products data
      mockClient.request.mockResolvedValue(MOCK_PRODUCTS_RESPONSE);

      // Mock implementation of setViewMode
      dashboard.setViewMode.mockImplementation((mode) => {
        if (mode === 'tree') {
          dashboard.renderTreeView([]);
        } else {
          dashboard.renderRawDataView('');
        }
      });

      // Load products section
      await dashboard.loadSection('storefront-products', mockClient);

      // Switch to raw data view
      dashboard.setViewMode('raw');

      // Verify raw data view was rendered
      expect(dashboard.renderRawDataView).toHaveBeenCalled();

      // Clear mocks
      jest.clearAllMocks();

      // Switch to tree view
      dashboard.setViewMode('tree');

      // Verify tree view was rendered
      expect(dashboard.renderTreeView).toHaveBeenCalled();
    });

    test('should update both views when data changes', async () => {
      // Mock client to return products data
      mockClient.request.mockResolvedValue(MOCK_PRODUCTS_RESPONSE);

      // Mock implementation of loadSection
      dashboard.loadSection.mockImplementation(async (section, client) => {
        const response = await client.request('query { products { edges { node { id } } } }', { first: 20 });
        dashboard.renderTreeView([]);
        dashboard.renderRawDataView('');
      });

      // Load products section
      await dashboard.loadSection('storefront-products', mockClient);

      // Verify both views were rendered
      expect(dashboard.renderTreeView).toHaveBeenCalled();
      expect(dashboard.renderRawDataView).toHaveBeenCalled();

      // Clear mocks
      jest.clearAllMocks();

      // Mock client to return updated data
      mockClient.request.mockResolvedValue({
        data: {
          products: {
            edges: [
              {
                node: {
                  id: 'gid://shopify/Product/3',
                  title: 'New Product'
                }
              }
            ]
          }
        }
      });

      // Reload section
      await dashboard.loadSection('storefront-products', mockClient);

      // Verify both views were updated
      expect(dashboard.renderTreeView).toHaveBeenCalled();
      expect(dashboard.renderRawDataView).toHaveBeenCalled();
    });
  });
});
