import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import LoggingService from '../services/LoggingService';

export interface NavigationItem {
  id: string;
  label: string;
  to: string; // Changed from href to to for React Router
  icon?: React.ReactNode;
  count?: number;
  onClick?: () => void;
  active?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  activeItemId?: string;
  onItemClick?: (item: NavigationItem) => void;
  title?: string;
  logo?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  activeItemId,
  onItemClick,
  title = 'Nexus Commerce',
  logo,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastClickedItem, setLastClickedItem] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('No navigation clicks yet');

  // Active link style
  const activeClassName = "border-light-accent dark:border-dark-accent text-light-syntax-entity dark:text-dark-syntax-entity";
  // Inactive link style
  const inactiveClassName = "border-transparent text-light-fg dark:text-dark-fg hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity";

  // Log component mount to terminal
  useEffect(() => {
    LoggingService.logInfo('Navigation component mounted', { 
      activeItemId, 
      itemsCount: items.length,
      itemsWithOnClick: items.filter(i => !!i.onClick).length
    });
  }, []);

  const handleItemClick = (item: NavigationItem, event: React.MouseEvent<HTMLElement>) => {
    // Update UI debug info
    setLastClickedItem(item.id);
    setDebugInfo(`Clicked: ${item.id} at ${new Date().toISOString()}\nHas onClick: ${!!item.onClick}\nHas to: ${!!item.to}`);
    
    // Log to terminal
    LoggingService.logClick(item.id, 'navigation item', {
      label: item.label,
      hasOnClick: !!item.onClick,
      hasTo: !!item.to,
      to: item.to,
      isActive: item.active,
      currentActiveId: activeItemId
    });
    
    // First call the parent's onItemClick handler if it exists
    if (onItemClick) {
      LoggingService.logInfo('Calling parent onItemClick handler', { itemId: item.id });
      onItemClick(item);
    } else {
      LoggingService.logWarning('No parent onItemClick handler provided', { itemId: item.id });
    }
    
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-light-bg dark:bg-dark-bg shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {logo ? (
                <img className="h-8 w-auto" src={logo} alt={title} />
              ) : (
                <NavLink to="/" className="text-xl font-bold text-light-syntax-entity dark:text-dark-syntax-entity">
                  {title}
                </NavLink>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) => 
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? activeClassName : inactiveClassName}`
                  }
                  onClick={(e) => {
                    // If there's a custom onClick handler, call handleItemClick
                    if (item.onClick) {
                      e.preventDefault();
                      handleItemClick(item, e as React.MouseEvent<HTMLAnchorElement>);
                    } else {
                      // Otherwise, just log the click
                      LoggingService.logClick(item.id, 'navigation item (router handled)', {
                        label: item.label,
                        to: item.to
                      });
                      setLastClickedItem(item.id);
                    }
                    // Close mobile menu after navigation
                    setIsMobileMenuOpen(false);
                  }}
                  data-testid={`nav-item-${item.id}`}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                  {item.count !== undefined && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-light-editor dark:bg-dark-editor">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ThemeToggle />
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => {
                LoggingService.logClick('mobile-menu-toggle', 'button', { 
                  currentState: isMobileMenuOpen ? 'open' : 'closed',
                  newState: isMobileMenuOpen ? 'closed' : 'open'
                });
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-light-fg dark:text-dark-fg hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity hover:bg-light-editor dark:hover:bg-dark-editor focus:outline-none focus:ring-2 focus:ring-inset focus:ring-light-accent dark:focus:ring-dark-accent"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => 
                `block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? 'border-light-accent dark:border-dark-accent text-light-syntax-entity dark:text-dark-syntax-entity bg-light-editor dark:bg-dark-editor'
                    : 'border-transparent text-light-fg dark:text-dark-fg hover:bg-light-editor dark:hover:bg-dark-editor hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity'
                }`
              }
              onClick={(e) => {
                // If there's a custom onClick handler, call handleItemClick
                if (item.onClick) {
                  e.preventDefault();
                  handleItemClick(item, e as React.MouseEvent<HTMLAnchorElement>);
                } else {
                  // Otherwise, just log the click
                  LoggingService.logClick(item.id, 'mobile navigation item (router handled)', {
                    label: item.label,
                    to: item.to
                  });
                  setLastClickedItem(item.id);
                }
                // Close mobile menu after navigation
                setIsMobileMenuOpen(false);
              }}
              data-testid={`mobile-nav-item-${item.id}`}
            >
              <div className="flex items-center">
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
                {item.count !== undefined && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-light-editor dark:bg-dark-editor">
                    {item.count}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-light-ui dark:border-dark-ui">
          <div className="flex items-center px-4 space-x-4">
            <ThemeToggle />
            <div className="text-sm">
              <span className="mr-2">Debug:</span>
              <NavLink
                to="/products"
                className="px-2 py-1 bg-light-editor dark:bg-dark-editor rounded mr-2 inline-block"
                data-testid="debug-nav-products"
                onClick={() => {
                  LoggingService.logClick('debug-products', 'debug button');
                }}
              >
                Products
              </NavLink>
              <NavLink
                to="/collections"
                className="px-2 py-1 bg-light-editor dark:bg-dark-editor rounded inline-block"
                data-testid="debug-nav-collections"
                onClick={() => {
                  LoggingService.logClick('debug-collections', 'debug button');
                }}
              >
                Collections
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Panel */}
      <div className="bg-light-editor dark:bg-dark-editor p-2 text-xs">
        <div><strong>Last Clicked:</strong> {lastClickedItem || 'None'}</div>
        <div><strong>Active Item:</strong> {activeItemId || 'None'}</div>
        <pre className="mt-1 p-1 bg-light-ui dark:bg-dark-ui rounded">{debugInfo}</pre>
        <div className="mt-1">
          <strong>Available Items:</strong> {items.map(i => i.id).join(', ')}
        </div>
        <div className="mt-1">
          <strong>Items with onClick:</strong> {items.filter(i => !!i.onClick).map(i => i.id).join(', ')}
        </div>
        <div className="mt-1">
          <strong>Items with routes:</strong> {items.filter(i => !!i.to).map(i => `${i.id} (${i.to})`).join(', ')}
        </div>
        <div className="mt-1 text-red-500">
          <strong>Note:</strong> All navigation events are being logged to the terminal where the app is running.
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
