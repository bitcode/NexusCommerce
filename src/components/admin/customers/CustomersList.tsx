import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CustomersListProps {
  onCustomerSelect?: (customerId: string) => void;
  onCreateCustomer?: () => void;
}

const CustomersList: React.FC<CustomersListProps> = ({
  onCustomerSelect,
  onCreateCustomer,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('UPDATED_AT');
  const [sortReverse, setSortReverse] = useState(true);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch customers
  const fetchCustomers = (cursor: string | null = null, newSearch = false) => {
    setIsLoading(true);
    setError(null);

    const options = {
      first: 20,
      after: cursor,
      query: searchQuery ? searchQuery : null,
      sortKey,
      reverse: sortReverse,
    };

    customers.getCustomersBasic(options)
      .then((data) => {
        const edges = data.edges || [];
        const pageInfo = data.pageInfo || {};
        
        const fetchedCustomers = edges.map((edge: any) => edge.node);
        
        if (newSearch || !cursor) {
          // Replace customers for new searches
          setCustomersList(fetchedCustomers);
        } else {
          // Append customers for pagination
          setCustomersList(prev => [...prev, ...fetchedCustomers]);
        }
        
        setHasNextPage(pageInfo.hasNextPage || false);
        setCurrentCursor(pageInfo.endCursor || null);
      })
      .catch((err) => {
        setError(`Failed to load customers: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchCustomers(null, true);
  };

  // Handle sort change
  const handleSortChange = (key: string) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortReverse(!sortReverse);
    } else {
      // Set new key and default direction
      setSortKey(key);
      setSortReverse(true);
    }
    
    // Refetch with new sort
    fetchCustomers(null, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && currentCursor) {
      fetchCustomers(currentCursor);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: string, currencyCode: string) => {
    if (!amount) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(parseFloat(amount));
  };

  // Render the customers list with dual-view capability
  const renderCustomersList = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* Search */}
        <div className="flex w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="px-3 py-2 border border-light-ui dark:border-dark-ui rounded-l-md bg-light-bg dark:bg-dark-bg w-full md:w-64"
          />
          <Button
            variant="primary"
            onClick={handleSearch}
            className="rounded-l-none"
          >
            Search
          </Button>
        </div>

        {/* Create customer button */}
        <Button
          variant="primary"
          onClick={onCreateCustomer}
        >
          Create Customer
        </Button>
      </div>

      {/* Customers table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
          <thead className="bg-light-editor dark:bg-dark-editor">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('NAME')}
              >
                <div className="flex items-center">
                  <span>Customer</span>
                  {sortKey === 'NAME' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('EMAIL')}
              >
                <div className="flex items-center">
                  <span>Email</span>
                  {sortKey === 'EMAIL' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('ORDERS_COUNT')}
              >
                <div className="flex items-center">
                  <span>Orders</span>
                  {sortKey === 'ORDERS_COUNT' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('TOTAL_SPENT')}
              >
                <div className="flex items-center">
                  <span>Total Spent</span>
                  {sortKey === 'TOTAL_SPENT' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('UPDATED_AT')}
              >
                <div className="flex items-center">
                  <span>Last Update</span>
                  {sortKey === 'UPDATED_AT' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
            {customersList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  {isLoading ? 'Loading customers...' : 'No customers found'}
                </td>
              </tr>
            ) : (
              customersList.map((customer) => (
                <tr key={customer.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                  <td className="px-6 py-4">
                    <div 
                      className="text-sm font-medium cursor-pointer hover:text-light-accent dark:hover:text-dark-accent"
                      onClick={() => onCustomerSelect && onCustomerSelect(customer.id)}
                    >
                      {customer.firstName || customer.lastName 
                        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                        : 'Unnamed Customer'
                      }
                    </div>
                    <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                      {customer.defaultAddress?.formatted?.split('\n')[0] || 'No address'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.email || 'No email'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.ordersCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {customer.totalSpentV2
                      ? formatCurrency(customer.totalSpentV2.amount, customer.totalSpentV2.currencyCode)
                      : '$0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(customer.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onCustomerSelect && onCustomerSelect(customer.id)}
                      className="text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent-hover"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <DualView
      title="Customers"
      presentationView={renderCustomersList()}
      rawData={{ customers: customersList }}
      defaultView="presentation"
    />
  );
};

export default CustomersList;
