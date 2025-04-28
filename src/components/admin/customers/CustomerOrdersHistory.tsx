import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CustomerOrdersHistoryProps {
  customerId: string;
  onViewOrder?: (orderId: string) => void;
  onBack?: () => void;
}

const CustomerOrdersHistory: React.FC<CustomerOrdersHistoryProps> = ({
  customerId,
  onViewOrder,
  onBack,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch customer orders
  const fetchOrders = (cursor: string | null = null) => {
    setIsLoading(true);
    setError(null);

    const options = {
      first: 10,
      after: cursor,
      sortKey: 'PROCESSED_AT',
      reverse: true,
    };

    customers.getCustomerOrders(customerId, options)
      .then((data) => {
        if (data && data.edges) {
          const fetchedOrders = data.edges.map((edge: any) => edge.node);
          
          if (!cursor) {
            // Replace orders for initial fetch
            setOrders(fetchedOrders);
            setCustomer({
              id: data.id,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
            });
          } else {
            // Append orders for pagination
            setOrders(prev => [...prev, ...fetchedOrders]);
          }
          
          setHasNextPage(data.pageInfo?.hasNextPage || false);
          setCurrentCursor(data.pageInfo?.endCursor || null);
        }
      })
      .catch((err) => {
        setError(`Failed to load customer orders: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [customerId]);

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

  // Render the orders history with dual-view capability
  const renderOrdersHistory = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {customer && (
        <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
          <h3 className="text-lg font-medium">
            {customer.firstName} {customer.lastName}
          </h3>
          <p className="text-sm text-light-fg dark:text-dark-fg opacity-70">
            {customer.email}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
          <thead className="bg-light-editor dark:bg-dark-editor">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Fulfillment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Payment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  {isLoading ? 'Loading orders...' : 'No orders found for this customer'}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {order.name || `#${order.orderNumber}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(order.processedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusBadgeClass(order.fulfillmentStatus)
                    }`}>
                      {order.fulfillmentStatus || 'UNFULFILLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getStatusBadgeClass(order.financialStatus)
                    }`}>
                      {order.financialStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.totalPriceSet?.shopMoney
                      ? formatCurrency(order.totalPriceSet.shopMoney.amount, order.totalPriceSet.shopMoney.currencyCode)
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewOrder && onViewOrder(order.id)}
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

      <div className="flex justify-start pt-4 border-t border-light-ui dark:border-dark-ui">
        <Button variant="secondary" onClick={onBack}>
          Back to Customer
        </Button>
      </div>
    </div>
  );

  return (
    <DualView
      title="Customer Orders"
      presentationView={renderOrdersHistory()}
      rawData={{ customerId, customer, orders }}
      defaultView="presentation"
    />
  );
};

export default CustomerOrdersHistory;
