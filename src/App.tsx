import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Card from './components/Card';
import Button from './components/Button';
import DualView from './components/DualView';
import ProductCard from './components/ProductCard';
import ProductCollection from './components/ProductCollection';
import ProductHierarchy from './components/ProductHierarchy';
import CollectionHierarchy from './components/CollectionHierarchy';
import About from './components/About';
import AboutTest from './components/AboutTest';
import LoggingService from './services/LoggingService';

// Sample product data
const sampleProducts = [
  {
    id: 'prod_1',
    title: 'Premium Hoodie',
    description: 'A comfortable premium hoodie made with high-quality materials. Perfect for cold weather and casual outings.',
    price: '79.99',
    currency: 'USD',
    imageUrl: 'https://placehold.co/300x300/0000FF/FFFFFF?text=Hoodie',
    inStock: true,
    vendor: 'Fashion Brand',
    tags: ['clothing', 'hoodie', 'winter'],
    variants: [
      { id: 'var_1', title: 'Small', price: '79.99', available: true },
      { id: 'var_2', title: 'Medium', price: '79.99', available: true },
      { id: 'var_3', title: 'Large', price: '79.99', available: false },
    ]
  },
  {
    id: 'prod_2',
    title: 'Designer T-Shirt',
    description: 'A stylish designer t-shirt with a modern fit. Made from 100% organic cotton for maximum comfort.',
    price: '39.99',
    currency: 'USD',
    imageUrl: 'https://placehold.co/300x300/FF0000/FFFFFF?text=T-Shirt',
    inStock: false,
    vendor: 'Fashion Brand',
    tags: ['clothing', 't-shirt', 'summer'],
  },
  {
    id: 'prod_3',
    title: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and long battery life.',
    price: '129.99',
    currency: 'USD',
    imageUrl: 'https://placehold.co/300x300/00FF00/FFFFFF?text=Headphones',
    inStock: true,
    vendor: 'Tech Gadgets',
    tags: ['electronics', 'audio', 'wireless'],
  },
  {
    id: 'prod_4',
    title: 'Smart Watch',
    description: 'A feature-rich smart watch with health tracking, notifications, and more.',
    price: '199.99',
    currency: 'USD',
    imageUrl: 'https://placehold.co/300x300/FFFF00/000000?text=Watch',
    inStock: true,
    vendor: 'Tech Gadgets',
    tags: ['electronics', 'wearable', 'watch'],
  }
];

// Sample hierarchy data
const sampleHierarchy = {
  id: 'store',
  name: 'Online Store',
  type: 'store',
  children: [
    {
      id: 'cat_clothing',
      name: 'Clothing',
      type: 'category',
      children: [
        {
          id: 'prod_1',
          name: 'Premium Hoodie',
          type: 'product',
        },
        {
          id: 'prod_2',
          name: 'Designer T-Shirt',
          type: 'product',
        }
      ]
    },
    {
      id: 'cat_electronics',
      name: 'Electronics',
      type: 'category',
      children: [
        {
          id: 'prod_3',
          name: 'Wireless Headphones',
          type: 'product',
        },
        {
          id: 'prod_4',
          name: 'Smart Watch',
          type: 'product',
        }
      ]
    }
  ]
};

function App() {
  // Initialize with 'home' view
  const [activeView, setActiveView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Log component mount to terminal
  useEffect(() => {
    LoggingService.logInfo('App component mounted', { initialView: activeView });
  }, []);

  // Log when activeView changes
  useEffect(() => {
    LoggingService.logNavigation(
      'previous view', // We don't track previous view in this implementation
      activeView,
      { 
        timestamp: new Date().toISOString(),
        url: window.location.href,
        urlHash: window.location.hash
      }
    );
  }, [activeView]);

  // Function to handle view changes
  const changeView = (viewId: string) => {
    LoggingService.logInfo(`App: changeView called with viewId: ${viewId}`, {
      currentActiveView: activeView,
      newView: viewId
    });
    
    try {
      setActiveView(viewId);
      
      // Navigate to the corresponding route
      navigate(`/${viewId === 'home' ? '' : viewId}`);
      LoggingService.logInfo('Navigation triggered', { route: `/${viewId === 'home' ? '' : viewId}` });
    } catch (error) {
      LoggingService.logError('Error in changeView', error);
    }
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    LoggingService.logClick('product', 'product selection', { productId });
    
    try {
      setSelectedProductId(productId);
      LoggingService.logInfo('Selected product ID set', { productId });
      changeView('product-detail');
    } catch (error) {
      LoggingService.logError('Error in handleProductSelect', error);
    }
  };

  // Handle add to cart
  const handleAddToCart = (productId: string, quantity: number) => {
    LoggingService.logClick('add-to-cart', 'button', { productId, quantity });
    alert(`Added ${quantity} of product ${productId} to cart`);
  };

  // Get the selected product
  const selectedProduct = selectedProductId
    ? sampleProducts.find(p => p.id === selectedProductId)
    : null;

  // Navigation items with React Router paths
  const navigationItems = [
    { id: 'home', label: 'Home', to: '/' },
    { id: 'products', label: 'Products', to: '/products' },
    { id: 'collections', label: 'Collections', to: '/collections' },
    { id: 'hierarchy', label: 'Hierarchy', to: '/hierarchy' },
    { id: 'dual-view', label: 'Dual-View', to: '/dual-view' },
    { id: 'about', label: 'About', to: '/about' },
    { id: 'test', label: 'Test', to: '/test' },
  ];

  const renderContent = () => {
    LoggingService.logInfo('App: renderContent called', { activeView });
    
    switch (activeView) {
      case 'products':
        return (
          <Card title="Products">
            <p className="mb-4">Browse our product collection with dual-view functionality.</p>
            <ProductCollection
              products={sampleProducts}
              title="All Products"
              onProductSelect={handleProductSelect}
            />
          </Card>
        );

      case 'collections':
        return (
          <Card title="Collections">
            <p className="mb-4">Browse our product collections.</p>
            <CollectionHierarchy onProductSelect={handleProductSelect} />
          </Card>
        );

      case 'product-detail':
        return (
          <Card title="Product Detail">
            {selectedProduct ? (
              <ProductCard
                product={selectedProduct}
                isDetailView={true}
                onBack={() => changeView('products')}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <div>
                <p>No product selected. Please go back to the products page.</p>
                <Button onClick={() => changeView('products')}>Back to Products</Button>
              </div>
            )}
          </Card>
        );

      case 'hierarchy':
        return (
          <Card title="Store Hierarchy">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Product Hierarchy</h3>
              <p className="mb-4">View the product hierarchy with tree-style dual-view functionality.</p>
              <ProductHierarchy onProductSelect={handleProductSelect} />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-2">Collection Hierarchy</h3>
              <p className="mb-4">View the collection hierarchy with tree-style dual-view functionality.</p>
              <CollectionHierarchy onProductSelect={handleProductSelect} />
            </div>
          </Card>
        );

      case 'dual-view':
        return (
          <Card title="Dual-View Explanation">
            <DualView
              title="What is Dual-View?"
              presentationView={
                <div>
                  <p className="mb-4">
                    The dual-view feature provides both a user-friendly presentation view and a
                    developer-oriented raw data view for the same content. This is useful for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Developers who need to understand the data structure</li>
                    <li>Debugging and troubleshooting</li>
                    <li>Educational purposes to show how data is transformed into UI</li>
                    <li>Providing a comprehensive view of the application's data</li>
                  </ul>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-2">Tree View Presentation</h3>
                    <p className="mb-2">
                      The tree view presentation provides a hierarchical view of data, similar to the Linux <code>tree</code> command output.
                      This makes it easy to visualize the structure of complex data like product hierarchies and collection relationships.
                    </p>
                    <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md font-mono text-sm">
                      <pre>
{`└── Products
    ├── Basic T-Shirt
    │   ├── Small / Black
    │   ├── Medium / Black
    │   └── Large / Black
    ├── Premium Hoodie
    │   ├── Small / Gray
    │   └── Medium / Gray
    └── Accessories
        ├── Wireless Headphones
        │   ├── Black
        │   └── White
        └── Smart Watch
            ├── Black
            └── Silver`}
                      </pre>
                    </div>
                  </div>
                </div>
              }
              rawData={{
                feature: "dual-view",
                benefits: [
                  "Developer-friendly data inspection",
                  "Transparent data structure",
                  "Educational value",
                  "Debugging assistance"
                ],
                implementation: {
                  components: ["DualView", "ProductCard", "ProductCollection", "TreeHierarchyView"],
                  toggles: ["presentation/raw", "expand/collapse"],
                  actions: ["copy to clipboard"]
                },
                treeView: {
                  features: [
                    "Linux-style tree command output",
                    "Expandable/collapsable nodes",
                    "Expand All/Collapse All buttons",
                    "Color-coded node types",
                    "Proper indentation and branch lines"
                  ]
                }
              }}
            />
          </Card>
        );

      case 'about':
        return <About />;

      case 'test':
        return <AboutTest />;

      default: // home
        return (
          <div className="space-y-8">
            <Card>
              <div className="text-center py-8">
                <h1 className="text-3xl font-bold mb-4">Nexus Commerce</h1>
                <p className="text-xl mb-6">
                  Welcome to our online store with dual-view functionality
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      LoggingService.logClick('browse-products', 'primary button');
                      try {
                        navigate('/products');
                      } catch (error) {
                        LoggingService.logError('Error navigating to products', error);
                      }
                    }}
                    data-testid="home-browse-products"
                  >
                    Browse Products
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      LoggingService.logClick('direct-to-products', 'secondary button');
                      try {
                        LoggingService.logInfo('Direct navigation to products');
                        navigate('/products');
                      } catch (error) {
                        LoggingService.logError('Error in direct navigation to products', error);
                      }
                    }}
                    data-testid="home-direct-products"
                  >
                    Direct to Products
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-light-editor dark:bg-dark-editor rounded-md">
                  <p className="text-sm mb-2">Debug Navigation</p>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        LoggingService.logClick('debug-direct-products', 'debug button');
                        try {
                          navigate('/products');
                          LoggingService.logInfo('Direct navigation to products completed');
                        } catch (error) {
                          LoggingService.logError('Error in debug navigation to products', error);
                        }
                      }}
                      className="px-3 py-1 bg-light-ui dark:bg-dark-ui rounded"
                      data-testid="debug-direct-products"
                    >
                      Products
                    </button>
                    <button
                      onClick={() => {
                        LoggingService.logClick('debug-direct-collections', 'debug button');
                        try {
                          navigate('/collections');
                          LoggingService.logInfo('Direct navigation to collections completed');
                        } catch (error) {
                          LoggingService.logError('Error in debug navigation to collections', error);
                        }
                      }}
                      className="px-3 py-1 bg-light-ui dark:bg-dark-ui rounded"
                      data-testid="debug-direct-collections"
                    >
                      Collections
                    </button>
                    <button
                      onClick={() => {
                        LoggingService.logClick('debug-direct-hierarchy', 'debug button');
                        try {
                          navigate('/hierarchy');
                          LoggingService.logInfo('Direct navigation to hierarchy completed');
                        } catch (error) {
                          LoggingService.logError('Error in debug navigation to hierarchy', error);
                        }
                      }}
                      className="px-3 py-1 bg-light-ui dark:bg-dark-ui rounded"
                      data-testid="debug-direct-hierarchy"
                    >
                      Hierarchy
                    </button>
                    <button
                      onClick={() => {
                        LoggingService.logClick('debug-direct-about', 'debug button');
                        try {
                          navigate('/about');
                          LoggingService.logInfo('Direct navigation to about completed');
                        } catch (error) {
                          LoggingService.logError('Error in debug navigation to about', error);
                        }
                      }}
                      className="px-3 py-1 bg-light-ui dark:bg-dark-ui rounded"
                      data-testid="debug-direct-about"
                    >
                      About
                    </button>
                    <button
                      onClick={() => {
                        LoggingService.logClick('debug-direct-test', 'debug button');
                        try {
                          navigate('/test');
                          LoggingService.logInfo('Direct navigation to test completed');
                        } catch (error) {
                          LoggingService.logError('Error in debug navigation to test', error);
                        }
                      }}
                      className="px-3 py-1 bg-light-ui dark:bg-dark-ui rounded"
                      data-testid="debug-direct-test"
                    >
                      Test
                    </button>
                  </div>
                  <p className="text-xs mt-2">Current view: {activeView}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Products">
                <p className="mb-4">Explore our products with dual-view functionality.</p>
                <Button 
                  onClick={() => {
                    LoggingService.logClick('card-view-products', 'button');
                    try {
                      navigate('/products');
                    } catch (error) {
                      LoggingService.logError('Error navigating to products from card', error);
                    }
                  }}
                  data-testid="card-view-products"
                >
                  View Products
                </Button>
              </Card>

              <Card title="Collections">
                <p className="mb-4">Browse our product collections.</p>
                <Button 
                  onClick={() => {
                    LoggingService.logClick('card-view-collections', 'button');
                    try {
                      navigate('/collections');
                    } catch (error) {
                      LoggingService.logError('Error navigating to collections from card', error);
                    }
                  }}
                  data-testid="card-view-collections"
                >
                  View Collections
                </Button>
              </Card>

              <Card title="Dual-View">
                <p className="mb-4">Learn about the dual-view feature.</p>
                <Button 
                  onClick={() => {
                    LoggingService.logClick('card-view-dual-view', 'button');
                    try {
                      navigate('/dual-view');
                    } catch (error) {
                      LoggingService.logError('Error navigating to dual-view from card', error);
                    }
                  }}
                  data-testid="card-view-dual-view"
                >
                  About Dual-View
                </Button>
              </Card>
            </div>
          </div>
        );
    }
  };

  // Create navigation items with explicit onClick handlers
  const mappedNavItems = navigationItems.map(item => {
    LoggingService.logInfo(`Creating navigation item for ${item.id}`, { 
      activeView,
      itemId: item.id,
      isActive: item.id === activeView
    });
    
    return {
      ...item,
      onClick: () => {
        LoggingService.logClick(`nav-${item.id}`, 'navigation item onClick', {
          itemId: item.id,
          currentActiveView: activeView
        });
        
        try {
          navigate(item.to);
          LoggingService.logInfo('Navigation triggered successfully', { itemId: item.id, to: item.to });
        } catch (error) {
          LoggingService.logError('Error in navigation item onClick handler', error);
        }
      },
      active: item.id === activeView
    };
  });

  return (
    <Layout
      key={`layout-${activeView}`} // Force re-render when activeView changes
      title="Nexus Commerce"
      navigationItems={mappedNavItems}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
