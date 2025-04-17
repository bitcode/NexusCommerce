import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import DualViewHierarchy from './components/DualViewHierarchy';
import {
  productsHierarchy,
  collectionsHierarchy,
  inventoryHierarchy,
  customersHierarchy,
  ordersHierarchy,
  storeHierarchy
} from './data/sampleData';

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  
  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Simple navigation component
  const Navigation = () => {
    return (
      <nav className="bg-gray-100 dark:bg-gray-800 p-4 mb-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Nexus Commerce</h1>
            <div className="flex items-center">
              <div className="flex space-x-4 mr-4">
                <Link to="/" className={`px-3 py-2 rounded ${location.pathname === '/' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  Home
                </Link>
                <Link to="/products" className={`px-3 py-2 rounded ${location.pathname === '/products' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  Products
                </Link>
                <Link to="/collections" className={`px-3 py-2 rounded ${location.pathname === '/collections' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  Collections
                </Link>
                <Link to="/inventory" className={`px-3 py-2 rounded ${location.pathname === '/inventory' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  Inventory
                </Link>
                <Link to="/customers" className={`px-3 py-2 rounded ${location.pathname === '/customers' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  Customers
                </Link>
                <Link to="/orders" className={`px-3 py-2 rounded ${location.pathname === '/orders' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  Orders
                </Link>
                <Link to="/about" className={`px-3 py-2 rounded ${location.pathname === '/about' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  About
                </Link>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // Simple card component
  const Card = ({ title, children }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div>
              <Card title="Welcome to Nexus Commerce">
                <p className="mb-4">This is a demonstration of the Nexus Commerce platform with dual-view capability.</p>
                <p className="mb-4">Each section provides both a presentation view and a raw data view, using a Linux-style tree hierarchy with ASCII characters and expand/collapse functionality.</p>
                <p>Use the navigation above to explore different sections.</p>
              </Card>
              
              <Card title="Store Overview">
                <DualViewHierarchy 
                  title="Store Data" 
                  data={storeHierarchy} 
                  initialView="presentation" 
                />
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Products">
                  <p className="mb-4">Browse our product collection.</p>
                  <Link to="/products" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Products
                  </Link>
                </Card>
                
                <Card title="Collections">
                  <p className="mb-4">Browse our product collections.</p>
                  <Link to="/collections" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Collections
                  </Link>
                </Card>
                
                <Card title="About">
                  <p className="mb-4">Learn more about Nexus Commerce.</p>
                  <Link to="/about" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    About Us
                  </Link>
                </Card>
              </div>
            </div>
          } />
          
          <Route path="/products" element={
            <Card title="Products">
              <p className="mb-4">Browse our product collection with dual-view functionality.</p>
              <DualViewHierarchy 
                title="Product Hierarchy" 
                data={productsHierarchy} 
                initialView="presentation" 
              />
            </Card>
          } />
          
          <Route path="/collections" element={
            <Card title="Collections">
              <p className="mb-4">Browse our product collections with dual-view functionality.</p>
              <DualViewHierarchy 
                title="Collection Hierarchy" 
                data={collectionsHierarchy} 
                initialView="presentation" 
              />
            </Card>
          } />
          
          <Route path="/inventory" element={
            <Card title="Inventory">
              <p className="mb-4">View inventory information with dual-view functionality.</p>
              <DualViewHierarchy 
                title="Inventory Hierarchy" 
                data={inventoryHierarchy} 
                initialView="presentation" 
              />
            </Card>
          } />
          
          <Route path="/customers" element={
            <Card title="Customers">
              <p className="mb-4">View customer information with dual-view functionality.</p>
              <DualViewHierarchy 
                title="Customer Hierarchy" 
                data={customersHierarchy} 
                initialView="presentation" 
              />
            </Card>
          } />
          
          <Route path="/orders" element={
            <Card title="Orders">
              <p className="mb-4">View order information with dual-view functionality.</p>
              <DualViewHierarchy 
                title="Order Hierarchy" 
                data={ordersHierarchy} 
                initialView="presentation" 
              />
            </Card>
          } />
          
          <Route path="/about" element={
            <Card title="About Nexus Commerce">
              <p className="mb-4">
                Nexus Commerce is a comprehensive e-commerce platform that integrates with Shopify's API to provide enhanced product management capabilities.
              </p>
              <p className="mb-4">
                Our platform offers:
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>Advanced product management</li>
                <li>Collection organization</li>
                <li>Dual view data presentation</li>
                <li>Real-time Shopify API monitoring</li>
              </ul>
              <p className="mb-4">
                Built with React, TypeScript, and Tailwind CSS, Nexus Commerce provides a modern and responsive user interface for managing your e-commerce business.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">Dual-View Capability</h3>
              <p className="mb-4">
                Our dual-view capability allows users to switch between a user-friendly presentation view and a developer-oriented raw data view. This feature is implemented throughout the application, providing a consistent experience across all sections.
              </p>
              <p>
                The presentation view uses a Linux-style tree hierarchy with ASCII characters and expand/collapse functionality, making it easy to navigate complex data structures.
              </p>
            </Card>
          } />
        </Routes>
      </div>
      
      <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="font-semibold">
                Nexus Commerce
              </span>
              <p className="text-sm mt-1 opacity-75">
                Powered by Shopify Storefront API
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="hover:underline">Terms</Link>
              <Link to="/" className="hover:underline">Privacy</Link>
              <Link to="/" className="hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;