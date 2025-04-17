import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';

// Import CSS
import './styles/index.css';

// Apply dark mode by default
if (!localStorage.getItem('theme')) {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
}

const AppWithRouter = () => {
  // Active link style
  const activeClassName = "text-light-syntax-entity dark:text-dark-syntax-entity border-b-2 border-light-accent dark:border-dark-accent pb-1";
  // Inactive link style
  const inactiveClassName = "text-light-fg dark:text-dark-fg hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity border-b-2 border-transparent pb-1";

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg p-8">
        <div className="max-w-4xl mx-auto">
          <nav className="bg-light-bg dark:bg-dark-bg shadow-md mb-8 -mx-8 px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <NavLink to="/" className="text-2xl font-bold text-light-syntax-entity dark:text-dark-syntax-entity">
                  Nexus Commerce
                </NavLink>
                <div className="hidden sm:flex ml-8 space-x-6">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                    end
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/products" 
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                  >
                    Products
                  </NavLink>
                  <NavLink 
                    to="/collections" 
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                  >
                    Collections
                  </NavLink>
                  <NavLink 
                    to="/about" 
                    className={({ isActive }) => isActive ? activeClassName : inactiveClassName}
                  >
                    About
                  </NavLink>
                </div>
              </div>
              <button
                onClick={() => {
                  const html = document.documentElement;
                  html.classList.toggle('dark');
                  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
                }}
                className="p-2 rounded-md bg-light-editor dark:bg-dark-editor text-light-fg dark:text-dark-fg hover:bg-light-accent dark:hover:bg-dark-accent hover:text-white transition-colors duration-200 focus:outline-none"
              >
                {typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={
                <div>
                  <header className="mb-8">
                    <h1 className="text-3xl font-bold">Welcome to Nexus Commerce</h1>
                    <p className="text-light-fg dark:text-dark-fg mt-2">A showcase of the Nexus Commerce UI components using the ayu theme.</p>
                  </header>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Navigation</h2>
                    <p className="mb-4">Use the navigation links above to explore different sections of the application.</p>
                    <div className="space-y-4">
                      <Link to="/products" className="px-4 py-2 rounded-md font-medium transition-colors bg-light-accent dark:bg-dark-accent text-white hover:opacity-90 inline-block">
                        Browse Products
                      </Link>
                    </div>
                  </section>
                </div>
              } />
              <Route path="/products" element={
                <div>
                  <h1 className="text-3xl font-bold mb-4">Products</h1>
                  <p>This is the products page.</p>
                </div>
              } />
              <Route path="/collections" element={
                <div>
                  <h1 className="text-3xl font-bold mb-4">Collections</h1>
                  <p>This is the collections page.</p>
                </div>
              } />
              <Route path="/about" element={
                <div>
                  <h1 className="text-3xl font-bold mb-4">About</h1>
                  <p>This is the about page.</p>
                </div>
              } />
              <Route path="/terms" element={
                <div>
                  <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
                  <p>This page contains the terms of service for Nexus Commerce.</p>
                </div>
              } />
              <Route path="/privacy" element={
                <div>
                  <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                  <p>This page contains the privacy policy for Nexus Commerce.</p>
                </div>
              } />
              <Route path="/contact" element={
                <div>
                  <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
                  <p>This page contains contact information for Nexus Commerce.</p>
                </div>
              } />
            </Routes>
          </main>

          <footer className="bg-light-editor dark:bg-dark-editor py-6 mt-12 -mx-8 px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-light-syntax-entity dark:text-dark-syntax-entity font-semibold">
                  Nexus Commerce
                </span>
                <p className="text-sm mt-1 opacity-75">
                  Powered by Shopify Storefront API
                </p>
              </div>
              <div className="flex space-x-6">
                <Link to="/terms" className="hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity">Terms</Link>
                <Link to="/privacy" className="hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity">Privacy</Link>
                <Link to="/contact" className="hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity">Contact</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
};

// Render the React application
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);
