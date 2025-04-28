import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface OrdersListProps {
  onOrderSelect?: (orderId: string) => void;
  onCreateDraftOrder?: () => void;
}

const OrdersList: React.FC<OrdersListProps> = ({
  onOrderSelect,
  onCreateDraftOrder,
}) => {
  const { orders } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('PROCESSED_AT');
  const [sortReverse, setSortReverse] = useState(true);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Fetch orders
  const fetchOrders = (cursor: string | null = null, newSearch = false) => {
    setIsLoading(true);
    setError(null);

    // Build query string with filters
    let query = searchQuery;
    if (filterStatus) {
      query = query ? `${query} status:${filterStatus}` : `status:${filterStatus}`;
    }

    const options = {
      first: 20,
      after: cursor,
      query: query || null,
      sortKey,
      reverse: sortReverse,
    };

    orders.getOrdersBasic(options)
      .then((data) => {
        const edges = data.edges || [];
        const pageInfo = data.pageInfo || {};
        
        const fetchedOrders = edges.map((edge: any) => edge.node);
        
        if (newSearch || !cursor) {
          // Replace orders for new searches
          setOrdersList(fetchedOrders);
        } else {
          // Append orders for pagination
          setOrdersList(prev => [...prev, ...fetchedOrders]);
        }
        
        setHasNextPage(pageInfo.hasNextPage || false);
        setCurrentCursor(pageInfo.endCursor || null);
      })
      .catch((err) => {
        setError(`Failed to load orders: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchOrders(null, true);
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
    fetchOrders(null, true);
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    // Refetch with new filter
    setTimeout(() => fetchOrders(null, true), 0);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && currentCursor) {
      fetchOrders(currentCursor);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: string, currencyCode: string) => {
    if (!amount) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(parseFloat(amount));
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'FULFILLED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PARTIALLY_FULFILLED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'UNFULFILLED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PARTIALLY_PAID':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'VOIDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Render the orders list with dual-view capability
  const renderOrdersList = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* Search */}
          <div className="flex w-full md:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
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

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Create draft order button */}
        <Button
          variant="primary"
          onClick={onCreateDraftOrder}
        >
          Create Draft Order
        </Button>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
          <thead className="bg-light-editor dark:bg-dark-editor">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('ORDER_NUMBER')}
              >
                <div className="flex items-center">
                  <span>Order</span>
                  {sortKey === 'ORDER_NUMBER' && (
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
                onClick={() => handleSortChange('PROCESSED_AT')}
              >
                <div className="flex items-center">
                  <span>Date</span>
                  {sortKey === 'PROCESSED_AT' && (
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Fulfillment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Payment
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('TOTAL_PRICE')}
              >
                <div className="flex items-center">
                  <span>Total</span>
                  {sortKey === 'TOTAL_PRICE' && (
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
            {ordersList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  {isLoading ? 'Loading orders...' : 'No orders found'}
                </td>
              </tr>
            ) : (
              ordersList.map((order) => (
                <tr key={order.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium cursor-pointer hover:text-light-accent dark:hover:text-dark-accent"
                      onClick={() => onOrderSelect && onOrderSelect(order.id)}
                    >
                      {order.name || `#${order.orderNumber}`}
                    </div>
                    {order.tags && order.tags.length > 0 && (
                      <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                        {order.tags.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(order.processedAt || order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.customer ? (
                      <div>
                        <div className="font-medium">
                          {order.customer.firstName || order.customer.lastName 
                            ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                            : 'Unnamed Customer'
                          }
                        </div>
                        <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                          {order.customer.email || 'No email'}
                        </div>
                      </div>
                    ) : (
                      'No customer'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusBadgeClass(order.displayFulfillmentStatus)
                    }`}>
                      {order.displayFulfillmentStatus || 'UNFULFILLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusBadgeClass(order.displayFinancialStatus)
                    }`}>
                      {order.displayFinancialStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.totalPriceSet?.shopMoney
                      ? formatCurrency(order.totalPriceSet.shopMoney.amount, order.totalPriceSet.shopMoney.currencyCode)
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onOrderSelect && onOrderSelect(order.id)}
                      className="text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent-hover"
                    >
                      View
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
      title="Orders"
      presentationView={renderOrdersList()}
      rawData={{ orders: ordersList }}
      defaultView="presentation"
    />
  );
};

export default OrdersList;
