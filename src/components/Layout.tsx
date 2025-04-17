import React, { useState, useEffect } from 'react';
import Navigation, { NavigationItem } from './Navigation';
import LoggingService from '../services/LoggingService';

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  logo?: string;
  navigationItems?: NavigationItem[];
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Nexus Commerce',
  logo,
  navigationItems = [
    { id: 'home', label: 'Home', to: '/' },
    { id: 'products', label: 'Products', to: '/products' },
    { id: 'collections', label: 'Collections', to: '/collections' },
    { id: 'about', label: 'About', to: '/about' },
  ],
}) => {
  const activeId = navigationItems.find(item => item.active)?.id || 'home';
  const [lastClickedItem, setLastClickedItem] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('No navigation clicks in Layout yet');

  // Log component mount to terminal
  useEffect(() => {
    LoggingService.logInfo('Layout component mounted', { 
      activeId, 
      navigationItemsCount: navigationItems.length,
      navigationItemsWithOnClick: navigationItems.filter(i => !!i.onClick).length,
      navigationItems: navigationItems.map(i => ({ id: i.id, hasOnClick: !!i.onClick }))
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg">
      <Navigation
        items={navigationItems}
        activeItemId={activeId}
        onItemClick={(item) => {
          // Update UI debug info
          setLastClickedItem(item.id);
          setDebugInfo(`Layout received click: ${item.id} at ${new Date().toISOString()}\nHas onClick: ${!!item.onClick}\nHas to: ${!!item.to}`);
          
          // Log to terminal
          LoggingService.logClick(item.id, 'navigation item (from Layout)', {
            label: item.label,
            hasOnClick: !!item.onClick,
            hasTo: !!item.to,
            isActive: item.active,
            currentActiveId: activeId
          });
          
          try {
            if (item.onClick) {
              LoggingService.logInfo(`Layout: Calling onClick for ${item.id}`);
              item.onClick();
              setDebugInfo(prev => prev + '\nCalled item.onClick successfully');
              LoggingService.logInfo(`Layout: onClick for ${item.id} executed successfully`);
            } else {
              const errorMsg = `Layout: item.onClick is undefined for ${item.id}`;
              LoggingService.logWarning(errorMsg, {
                navigationItems: navigationItems.map(i => ({ id: i.id, hasOnClick: !!i.onClick }))
              });
              setDebugInfo(prev => prev + '\nERROR: item.onClick is undefined!');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            LoggingService.logError(`Error in Layout onItemClick handler: ${errorMessage}`, { 
              itemId: item.id,
              error: error instanceof Error ? error.stack : error
            });
            setDebugInfo(prev => prev + `\nERROR in onClick: ${errorMessage}`);
          }
        }}
        title={title}
        logo={logo}
      />
      
      {/* Layout Debug Panel */}
      <div className="bg-light-ui dark:bg-dark-ui p-2 text-xs border-t border-b border-light-accent dark:border-dark-accent">
        <div><strong>Layout Debug - Last Clicked:</strong> {lastClickedItem || 'None'}</div>
        <div><strong>Active Item:</strong> {activeId || 'None'}</div>
        <pre className="mt-1 p-1 bg-light-editor dark:bg-dark-editor rounded">{debugInfo}</pre>
        <div className="mt-1">
          <strong>Available Items:</strong> {navigationItems.map(i => i.id).join(', ')}
        </div>
        <div className="mt-1">
          <strong>Items with onClick:</strong> {navigationItems.filter(i => !!i.onClick).map(i => i.id).join(', ')}
        </div>
        <div className="mt-1 text-red-500">
          <strong>Navigation Issue:</strong> If "Items with onClick" is empty, this is the cause of the navigation problem.
        </div>
        <div className="mt-1 text-blue-500">
          <strong>Note:</strong> All navigation events are being logged to the terminal where the app is running.
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-light-editor dark:bg-dark-editor py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-light-syntax-entity dark:text-dark-syntax-entity font-semibold">
                {title}
              </span>
              <p className="text-sm mt-1 opacity-75">
                Powered by Shopify Storefront API
              </p>
            </div>
            <div className="flex space-x-6">
              <a 
                href="/terms" 
                onClick={(e) => {
                  e.preventDefault();
                  LoggingService.logClick('terms', 'footer link');
                }}
                className="hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity"
              >
                Terms
              </a>
              <a 
                href="/privacy" 
                onClick={(e) => {
                  e.preventDefault();
                  LoggingService.logClick('privacy', 'footer link');
                }}
                className="hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity"
              >
                Privacy
              </a>
              <a 
                href="/contact" 
                onClick={(e) => {
                  e.preventDefault();
                  LoggingService.logClick('contact', 'footer link');
                }}
                className="hover:text-light-syntax-entity dark:hover:text-dark-syntax-entity"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
