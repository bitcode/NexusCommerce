import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import CustomerForm from './CustomerForm';
import CustomerAddresses from './CustomerAddresses';
import CustomerTaxExemptionsForm from './CustomerTaxExemptionsForm';
import CustomerOrdersHistory from './CustomerOrdersHistory';
import CustomerDeleteConfirmation from './CustomerDeleteConfirmation';

export interface CustomerAdminProps {
  customerId?: string;
  onBack?: () => void;
  onViewOrder?: (orderId: string) => void;
}

type AdminView = 'details' | 'addresses' | 'orders' | 'tax' | 'delete';

const CustomerAdmin: React.FC<CustomerAdminProps> = ({
  customerId,
  onBack,
  onViewOrder,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [currentView, setCurrentView] = useState<AdminView>('details');

  // Fetch customer data if editing an existing customer
  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      setError(null);

      customers.getCustomer(customerId)
        .then((data) => {
          setCustomer(data);
        })
        .catch((err) => {
          setError(`Failed to load customer: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [customerId, customers]);

  const handleSaveCustomer = (savedCustomer: any) => {
    setCustomer(savedCustomer);
    
    // If we were creating a new customer, update the customerId
    if (!customerId && savedCustomer.id) {
      // In a real application, you might want to update the URL or state in a parent component
      console.log('Created new customer with ID:', savedCustomer.id);
    }
    
    // Show success message or navigate to another view
  };

  const handleDeleteComplete = () => {
    if (onBack) {
      onBack();
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'details':
        return (
          <CustomerForm
            customerId={customerId}
            onSave={handleSaveCustomer}
            onCancel={onBack}
            onDelete={() => setCurrentView('delete')}
          />
        );
      case 'addresses':
        if (!customerId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the customer before managing addresses.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <CustomerAddresses
            customerId={customerId}
            onBack={() => setCurrentView('details')}
          />
        );
      case 'orders':
        if (!customerId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the customer before viewing orders.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <CustomerOrdersHistory
            customerId={customerId}
            onViewOrder={onViewOrder}
            onBack={() => setCurrentView('details')}
          />
        );
      case 'tax':
        if (!customerId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>Please save the customer before managing tax exemptions.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <CustomerTaxExemptionsForm
            customerId={customerId}
            onSave={() => setCurrentView('details')}
            onCancel={() => setCurrentView('details')}
          />
        );
      case 'delete':
        if (!customerId) {
          return (
            <Card>
              <div className="text-center py-8">
                <p>No customer to delete.</p>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentView('details')}
                  className="mt-4"
                >
                  Back to Details
                </Button>
              </div>
            </Card>
          );
        }
        return (
          <CustomerDeleteConfirmation
            customerId={customerId}
            customerName={customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : undefined}
            onConfirm={handleDeleteComplete}
            onCancel={() => setCurrentView('details')}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && customerId) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Navigation tabs */}
      {(customerId || currentView === 'details') && (
        <div className="border-b border-light-ui dark:border-dark-ui">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setCurrentView('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'details'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setCurrentView('addresses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'addresses'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!customerId}
            >
              Addresses
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'orders'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!customerId}
            >
              Orders
            </button>
            <button
              onClick={() => setCurrentView('tax')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentView === 'tax'
                  ? 'border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent'
                  : 'border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-ui dark:hover:border-dark-ui'
              }`}
              disabled={!customerId}
            >
              Tax Exemptions
            </button>
            {customerId && (
              <button
                onClick={() => setCurrentView('delete')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  currentView === 'delete'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-light-fg dark:text-dark-fg hover:text-red-500 hover:border-red-300'
                }`}
              >
                Delete
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Current view */}
      {renderCurrentView()}
    </div>
  );
};

export default CustomerAdmin;
