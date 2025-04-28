import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface OrderDetailProps {
  orderId: string;
  onBack?: () => void;
  onEdit?: (orderId: string) => void;
  onFulfill?: (orderId: string) => void;
  onRefund?: (orderId: string) => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  orderId,
  onBack,
  onEdit,
  onFulfill,
  onRefund,
}) => {
  const { orders } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  // Fetch order data
  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      setError(null);

      orders.getOrder(orderId)
        .then((data) => {
          setOrder(data);
        })
        .catch((err) => {
          setError(`Failed to load order: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [orderId, orders]);

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
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

    switch (status.toUpperCase()) {
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
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'PARTIALLY_REFUNDED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'VOIDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'CANCELED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'AUTHORIZED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
            <p className="mt-4">Loading order details...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
        {onBack && (
          <Button
            variant="secondary"
            onClick={onBack}
            className="mt-4"
          >
            Back to Orders
          </Button>
        )}
      </Card>
    );
  }

  // Render not found state
  if (!order) {
    return (
      <Card>
        <div className="text-center py-8">
          <p>Order not found</p>
          {onBack && (
            <Button
              variant="secondary"
              onClick={onBack}
              className="mt-4"
            >
              Back to Orders
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Render the order detail with dual-view capability
  const renderOrderDetail = () => (
    <div className="space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-light-syntax-entity dark:text-dark-syntax-entity hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Orders
        </button>
      )}

      {/* Order header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">{order.name || `#${order.orderNumber}`}</h1>
          <p className="text-light-fg dark:text-dark-fg opacity-70">
            {formatDate(order.processedAt || order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {onEdit && (
            <Button
              variant="secondary"
              onClick={() => onEdit(order.id)}
            >
              Edit
            </Button>
          )}
          {onFulfill && order.fulfillable && (
            <Button
              variant="primary"
              onClick={() => onFulfill(order.id)}
            >
              Fulfill
            </Button>
          )}
          {onRefund && order.financialStatus === 'PAID' && (
            <Button
              variant="outline"
              onClick={() => onRefund(order.id)}
            >
              Refund
            </Button>
          )}
        </div>
      </div>

      {/* Order status */}
      <div className="flex flex-wrap gap-4">
        <div>
          <span className="text-sm font-medium">Fulfillment Status:</span>
          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            getStatusBadgeClass(order.displayFulfillmentStatus)
          }`}>
            {order.displayFulfillmentStatus || 'UNFULFILLED'}
          </span>
        </div>
        <div>
          <span className="text-sm font-medium">Payment Status:</span>
          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            getStatusBadgeClass(order.displayFinancialStatus)
          }`}>
            {order.displayFinancialStatus || 'PENDING'}
          </span>
        </div>
      </div>

      {/* Order summary */}
      <Card title="Order Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Financial summary */}
          <div>
            <h3 className="text-lg font-medium mb-4">Financial Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {order.subtotalPriceSet?.shopMoney
                    ? formatCurrency(order.subtotalPriceSet.shopMoney.amount, order.subtotalPriceSet.shopMoney.currencyCode)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.totalShippingPriceSet?.shopMoney
                    ? formatCurrency(order.totalShippingPriceSet.shopMoney.amount, order.totalShippingPriceSet.shopMoney.currencyCode)
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>
                  {order.totalTaxSet?.shopMoney
                    ? formatCurrency(order.totalTaxSet.shopMoney.amount, order.totalTaxSet.shopMoney.currencyCode)
                    : 'N/A'}
                </span>
              </div>
              {order.totalDiscountsSet?.shopMoney && parseFloat(order.totalDiscountsSet.shopMoney.amount) > 0 && (
                <div className="flex justify-between">
                  <span>Discounts</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(order.totalDiscountsSet.shopMoney.amount, order.totalDiscountsSet.shopMoney.currencyCode)}
                  </span>
                </div>
              )}
              {order.totalRefundedSet?.shopMoney && parseFloat(order.totalRefundedSet.shopMoney.amount) > 0 && (
                <div className="flex justify-between">
                  <span>Refunded</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{formatCurrency(order.totalRefundedSet.shopMoney.amount, order.totalRefundedSet.shopMoney.currencyCode)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-light-ui dark:border-dark-ui font-bold">
                <span>Total</span>
                <span>
                  {order.totalPriceSet?.shopMoney
                    ? formatCurrency(order.totalPriceSet.shopMoney.amount, order.totalPriceSet.shopMoney.currencyCode)
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Order details */}
          <div>
            <h3 className="text-lg font-medium mb-4">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Created</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {order.processedAt && (
                <div className="flex justify-between">
                  <span className="font-medium">Processed</span>
                  <span>{formatDate(order.processedAt)}</span>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex justify-between">
                  <span className="font-medium">Cancelled</span>
                  <span>{formatDate(order.cancelledAt)}</span>
                </div>
              )}
              {order.cancelReason && (
                <div className="flex justify-between">
                  <span className="font-medium">Cancel Reason</span>
                  <span>{order.cancelReason}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Confirmed</span>
                <span>{order.confirmed ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Closed</span>
                <span>{order.closed ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Test Order</span>
                <span>{order.test ? 'Yes' : 'No'}</span>
              </div>
              {order.tags && order.tags.length > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Tags</span>
                  <span>{order.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Customer information */}
      {order.customer && (
        <Card title="Customer">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {order.customer.firstName || order.customer.lastName
                  ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                  : 'Unnamed Customer'
                }
              </h3>
              {order.customer.email && (
                <p className="text-light-fg dark:text-dark-fg">
                  <span className="font-medium">Email:</span> {order.customer.email}
                </p>
              )}
              {order.customer.phone && (
                <p className="text-light-fg dark:text-dark-fg">
                  <span className="font-medium">Phone:</span> {order.customer.phone}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to customer details
                  if (order.customer?.id) {
                    window.open(`/customers/${order.customer.id}`, '_blank');
                  }
                }}
              >
                View Customer
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Shipping and billing addresses */}
      {(order.shippingAddress || order.billingAddress) && (
        <Card title="Addresses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping address */}
            {order.shippingAddress && (
              <div>
                <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
                  <p className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  {order.shippingAddress.company && (
                    <p>{order.shippingAddress.company}</p>
                  )}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.province || order.shippingAddress.provinceCode} {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-2">{order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Billing address */}
            {order.billingAddress && (
              <div>
                <h3 className="text-lg font-medium mb-2">Billing Address</h3>
                <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
                  <p className="font-medium">
                    {order.billingAddress.firstName} {order.billingAddress.lastName}
                  </p>
                  {order.billingAddress.company && (
                    <p>{order.billingAddress.company}</p>
                  )}
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && (
                    <p>{order.billingAddress.address2}</p>
                  )}
                  <p>
                    {order.billingAddress.city}, {order.billingAddress.province || order.billingAddress.provinceCode} {order.billingAddress.zip}
                  </p>
                  <p>{order.billingAddress.country}</p>
                  {order.billingAddress.phone && (
                    <p className="mt-2">{order.billingAddress.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Line items */}
      {order.lineItems?.edges?.length > 0 && (
        <Card title="Items">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                {order.lineItems.edges.map((edge: any) => {
                  const item = edge.node;
                  return (
                    <tr key={item.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.variant?.image?.url && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={item.variant.image.url}
                                alt={item.variant.image.altText || item.title}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{item.title}</div>
                            {item.variant && item.variant.title !== 'Default Title' && (
                              <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                                {item.variant.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.variant?.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {item.originalUnitPriceSet?.shopMoney
                          ? formatCurrency(item.originalUnitPriceSet.shopMoney.amount, item.originalUnitPriceSet.shopMoney.currencyCode)
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {item.originalTotalSet?.shopMoney
                          ? formatCurrency(item.originalTotalSet.shopMoney.amount, item.originalTotalSet.shopMoney.currencyCode)
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Fulfillments */}
      {order.fulfillments?.edges?.length > 0 && (
        <Card title="Fulfillments">
          <div className="space-y-6">
            {order.fulfillments.edges.map((edge: any) => {
              const fulfillment = edge.node;
              return (
                <div key={fulfillment.id} className="border border-light-ui dark:border-dark-ui rounded-md p-4">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Fulfillment #{fulfillment.id.split('/').pop()}
                      </h3>
                      <p className="text-sm text-light-fg dark:text-dark-fg opacity-70">
                        Created: {formatDate(fulfillment.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusBadgeClass(fulfillment.status)
                      }`}>
                        {fulfillment.displayStatus || fulfillment.status}
                      </span>
                    </div>
                  </div>

                  {/* Tracking information */}
                  {fulfillment.trackingInfo && fulfillment.trackingInfo.length > 0 && (
                    <div className="mb-4 bg-light-editor dark:bg-dark-editor p-3 rounded-md">
                      <h4 className="font-medium mb-2">Tracking Information</h4>
                      {fulfillment.trackingInfo.map((tracking: any, index: number) => (
                        <div key={index} className="text-sm">
                          <p>
                            <span className="font-medium">Company:</span> {tracking.company || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium">Number:</span> {tracking.number || 'N/A'}
                          </p>
                          {tracking.url && (
                            <p>
                              <a
                                href={tracking.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-light-accent dark:text-dark-accent hover:underline"
                              >
                                Track Package
                              </a>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fulfilled items */}
                  {fulfillment.lineItems?.edges?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
                          <thead>
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Product
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                            {fulfillment.lineItems.edges.map((lineItemEdge: any) => {
                              const lineItem = lineItemEdge.node;
                              return (
                                <tr key={lineItem.id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div className="flex items-center">
                                      {lineItem.variant?.image?.url && (
                                        <div className="flex-shrink-0 h-8 w-8 mr-3">
                                          <img
                                            className="h-8 w-8 rounded-md object-cover"
                                            src={lineItem.variant.image.url}
                                            alt={lineItem.variant.image.altText || lineItem.title}
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium">{lineItem.title}</div>
                                        {lineItem.variant && lineItem.variant.title !== 'Default Title' && (
                                          <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                                            {lineItem.variant.title}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {lineItem.quantity}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Transactions */}
      {order.transactions?.edges?.length > 0 && (
        <Card title="Transactions">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                {order.transactions.edges.map((edge: any) => {
                  const transaction = edge.node;
                  return (
                    <tr key={transaction.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(transaction.processedAt || transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.kind}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getStatusBadgeClass(transaction.status)
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.formattedGateway || transaction.gateway || 'N/A'}
                        {transaction.paymentDetails?.creditCardLastDigits && (
                          <span className="text-xs text-light-fg dark:text-dark-fg opacity-70 ml-1">
                            (ending in {transaction.paymentDetails.creditCardLastDigits})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {transaction.amountSet?.shopMoney
                          ? formatCurrency(transaction.amountSet.shopMoney.amount, transaction.amountSet.shopMoney.currencyCode)
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Refunds */}
      {order.refunds?.edges?.length > 0 && (
        <Card title="Refunds">
          <div className="space-y-6">
            {order.refunds.edges.map((edge: any) => {
              const refund = edge.node;
              return (
                <div key={refund.id} className="border border-light-ui dark:border-dark-ui rounded-md p-4">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Refund #{refund.id.split('/').pop()}
                      </h3>
                      <p className="text-sm text-light-fg dark:text-dark-fg opacity-70">
                        Created: {formatDate(refund.createdAt)}
                      </p>
                      {refund.note && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Note:</span> {refund.note}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="text-lg font-bold">
                        {refund.totalRefundedSet?.shopMoney
                          ? formatCurrency(refund.totalRefundedSet.shopMoney.amount, refund.totalRefundedSet.shopMoney.currencyCode)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Refunded items */}
                  {refund.refundLineItems?.edges?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Refunded Items</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
                          <thead>
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Product
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                                Quantity
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                                Restock Type
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                            {refund.refundLineItems.edges.map((lineItemEdge: any) => {
                              const lineItem = lineItemEdge.node;
                              return (
                                <tr key={lineItem.id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div className="flex items-center">
                                      <div>
                                        <div className="font-medium">{lineItem.lineItem.title}</div>
                                        {lineItem.lineItem.variant && (
                                          <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                                            {lineItem.lineItem.variant.title}
                                            {lineItem.lineItem.variant.sku && ` (${lineItem.lineItem.variant.sku})`}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {lineItem.quantity}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {lineItem.restockType || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {lineItem.totalSet?.shopMoney
                                      ? formatCurrency(lineItem.totalSet.shopMoney.amount, lineItem.totalSet.shopMoney.currencyCode)
                                      : 'N/A'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Refund transactions */}
                  {refund.transactions?.edges?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Transactions</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
                          <thead>
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Gateway
                              </th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                            {refund.transactions.edges.map((transactionEdge: any) => {
                              const transaction = transactionEdge.node;
                              return (
                                <tr key={transaction.id}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {formatDate(transaction.processedAt)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      getStatusBadgeClass(transaction.status)
                                    }`}>
                                      {transaction.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    {transaction.gateway || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                    {transaction.amountSet?.shopMoney
                                      ? formatCurrency(transaction.amountSet.shopMoney.amount, transaction.amountSet.shopMoney.currencyCode)
                                      : 'N/A'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Shipping lines */}
      {order.shippingLines?.edges?.length > 0 && (
        <Card title="Shipping">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Carrier
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                {order.shippingLines.edges.map((edge: any) => {
                  const shippingLine = edge.node;
                  return (
                    <tr key={shippingLine.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {shippingLine.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {shippingLine.carrierIdentifier || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {shippingLine.originalPriceSet?.shopMoney
                          ? formatCurrency(shippingLine.originalPriceSet.shopMoney.amount, shippingLine.originalPriceSet.shopMoney.currencyCode)
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <DualView
      title={`Order ${order.name || `#${order.orderNumber}`}`}
      presentationView={renderOrderDetail()}
      rawData={order}
      defaultView="presentation"
    />
  );
};

export default OrderDetail;
