import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

function MainApp() {
  // State for product detail view
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active view from URL path
  const getActiveViewFromPath = (path: string) => {
    if (path === '/') return 'home';
    // Remove leading slash and return the path
    return path.substring(1);
  };
  
  const activeView = getActiveViewFromPath(location.pathname);

  // Log component mount to terminal
  useEffect(() => {
    LoggingService.logInfo('App component mounted', { initialView: activeView, path: location.pathname });
  }, []);

  // Log when location changes
  useEffect(() => {
    LoggingService.logNavigation(
      'previous view',
      activeView,
      { 
        timestamp: new Date().toISOString(),
        url: window.location.href,
        path: location.pathname
      }
    );
  }, [location.pathname, activeView]);

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    LoggingService.logClick('product', 'product selection', { productId });
    
    try {
      setSelectedProductId(productId);
      LoggingService.logInfo('Selected product ID set', { productId });
      navigate('/product-detail');
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
      <Routes>
        <Route path="/" element={
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
                      navigate('/products');
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
                      navigate('/products');
                    }}
                    data-testid="home-direct-products"
                  >
                    Direct to Products
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card title="Products">
                <p className="mb-4">Explore our products with dual-view functionality.</p>
                <Button 
                  onClick={() => {
                    LoggingService.logClick('card-view-products', 'button');
                    navigate('/products');
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
                    navigate('/collections');
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
                    navigate('/dual-view');
                  }}
                  data-testid="card-view-dual-view"
                >
                  About Dual-View
                </Button>
              </Card>
            </div>
          </div>
        } />
        
        <Route path="/products" element={
          <Card title="Products">
            <p className="mb-4">Browse our product collection with dual-view functionality.</p>
            <ProductCollection
              products={sampleProducts}
              title="All Products"
              onProductSelect={handleProductSelect}
            />
          </Card>
        } />
        
        <Route path="/collections" element={
          <Card title="Collections">
            <p className="mb-4">Browse our product collections.</p>
            <CollectionHierarchy onProductSelect={handleProductSelect} />
          </Card>
        } />
        
        <Route path="/product-detail" element={
          <Card title="Product Detail">
            {selectedProduct ? (
              <ProductCard
                product={selectedProduct}
                isDetailView={true}
                onBack={() => navigate('/products')}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <div>
                <p>No product selected. Please go back to the products page.</p>
                <Button onClick={() => navigate('/products')}>Back to Products</Button>
              </div>
            )}
          </Card>
        } />
        
        <Route path="/hierarchy" element={
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
        } />
        
        <Route path="/dual-view" element={
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
                }
              }}
            />
          </Card>
        } />
        
        <Route path="/about" element={<About />} />
        
        <Route path="/test" element={<AboutTest />} />
      </Routes>
    </Layout>
  );
}

export default MainApp;