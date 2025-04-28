import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import { formatDate, formatPrice } from '../../../utils/formatters';

export interface DraftOrderDetailProps {
  draftOrderId: string;
  onEdit?: (draftOrderId: string) => void;
  onComplete?: (draftOrderId: string) => void;
  onDelete?: (draftOrderId: string) => void;
  onBack?: () => void;
}

/**
 * DraftOrderDetail component
 * This component displays the details of a draft order
 */
const DraftOrderDetail: React.FC<DraftOrderDetailProps> = ({
  draftOrderId,
  onEdit,
  onComplete,
  onDelete,
  onBack,
}) => {
  const router = useRouter();
  const { orders } = useShopify();
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for draft order data
  const [draftOrder, setDraftOrder] = useState<any>(null);

  // Fetch draft order data
  useEffect(() => {
    if (draftOrderId) {
      fetchDraftOrder();
    }
  }, [draftOrderId]);

  // Fetch draft order
  const fetchDraftOrder = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await orders.getDraftOrder(draftOrderId);
      setDraftOrder(result);
    } catch (err: any) {
      setError(`Failed to load draft order: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit draft order
  const handleEdit = () => {
    if (onEdit) {
      onEdit(draftOrderId);
    } else {
      router.push(`/admin/draft-orders/${draftOrderId}/edit`);
    }
  };

  // Handle complete draft order
  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);
    
    try {
      await orders.completeDraftOrder(draftOrderId, false);
      
      if (onComplete) {
        onComplete(draftOrderId);
      } else {
        // Refresh the draft order data
        fetchDraftOrder();
      }
    } catch (err: any) {
      setError(`Failed to complete draft order: ${err.message}`);
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle delete draft order
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this draft order? This action cannot be undone.')) {
      try {
        await orders.deleteDraftOrder(draftOrderId);
        
        if (onDelete) {
          onDelete(draftOrderId);
        } else {
          router.push('/admin/draft-orders');
        }
      } catch (err: any) {
        setError(`Failed to delete draft order: ${err.message}`);
      }
    }
  };

  // Handle back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/admin/draft-orders');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="ml-3">Loading draft order...</p>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          <p>{error}</p>
          <div className="mt-4 flex space-x-3">
            <Button variant="secondary" onClick={handleBack}>
              Go Back
            </Button>
            <Button variant="primary" onClick={fetchDraftOrder}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Render not found state
  if (!draftOrder) {
    return (
      <Card>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Draft Order Not Found</h2>
          <p className="text-light-fg dark:text-dark-fg mb-6">
            The draft order you're looking for doesn't exist or has been deleted.
          </p>
          <Button variant="primary" onClick={handleBack}>
            Back to Draft Orders
          </Button>
        </div>
      </Card>
    );
  }

  // Render draft order details
  const renderDraftOrderDetails = () => (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <Button variant="text" onClick={handleBack} className="mb-2">
            ← Back to Draft Orders
          </Button>
          <h1 className="text-2xl font-bold">
            {draftOrder.name || 'Draft Order'}
          </h1>
          <div className="text-light-fg dark:text-dark-fg">
            Created {formatDate(draftOrder.createdAt)}
          </div>
        </div>
        <div className="flex space-x-3">
          {draftOrder.status === 'OPEN' && (
            <>
              <Button variant="secondary" onClick={handleEdit}>
                Edit
              </Button>
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={isCompleting}
              >
                {isCompleting ? 'Completing...' : 'Complete Draft Order'}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Status and summary */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-1">Status</h3>
            <div className="text-lg font-semibold">
              {draftOrder.status === 'OPEN' ? (
                <span className="text-yellow-600 dark:text-yellow-400">Open</span>
              ) : draftOrder.status === 'COMPLETED' ? (
                <span className="text-green-600 dark:text-green-400">Completed</span>
              ) : (
                <span>{draftOrder.status}</span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-1">Total</h3>
            <div className="text-lg font-semibold">
              {formatPrice(draftOrder.totalPriceSet?.shopMoney?.amount || '0', draftOrder.totalPriceSet?.shopMoney?.currencyCode)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-1">Invoice</h3>
            <div>
              {draftOrder.invoiceUrl ? (
                <a
                  href={draftOrder.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light-accent dark:text-dark-accent hover:underline"
                >
                  View Invoice
                </a>
              ) : (
                <span className="text-light-fg dark:text-dark-fg opacity-70">No invoice</span>
              )}
              {draftOrder.invoiceSentAt && (
                <div className="text-sm text-light-fg dark:text-dark-fg">
                  Sent on {formatDate(draftOrder.invoiceSentAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Customer information */}
      <Card title="Customer">
        <div>
          {draftOrder.customer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-1">Customer</h3>
                <div className="text-lg font-semibold">
                  {draftOrder.customer.firstName} {draftOrder.customer.lastName}
                </div>
                {draftOrder.customer.email && (
                  <div className="text-light-fg dark:text-dark-fg">
                    {draftOrder.customer.email}
                  </div>
                )}
                {draftOrder.customer.phone && (
                  <div className="text-light-fg dark:text-dark-fg">
                    {draftOrder.customer.phone}
                  </div>
                )}
              </div>
              <div>
                {draftOrder.order && (
                  <div>
                    <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-1">Order</h3>
                    <div className="text-lg font-semibold">
                      <a
                        href={`/admin/orders/${draftOrder.order.id}`}
                        className="text-light-accent dark:text-dark-accent hover:underline"
                      >
                        {draftOrder.order.name}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : draftOrder.email ? (
            <div>
              <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-1">Email</h3>
              <div className="text-lg">
                {draftOrder.email}
              </div>
            </div>
          ) : (
            <div className="text-light-fg dark:text-dark-fg opacity-70">
              No customer information
            </div>
          )}
        </div>
      </Card>

      {/* Line items */}
      <Card title="Line Items">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Product
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
              {draftOrder.lineItems?.edges?.length > 0 ? (
                draftOrder.lineItems.edges.map((edge: any) => {
                  const item = edge.node;
                  const price = parseFloat(item.discountedUnitPriceSet?.shopMoney?.amount || item.originalUnitPriceSet?.shopMoney?.amount || '0');
                  const total = price * item.quantity;
                  const currencyCode = item.originalUnitPriceSet?.shopMoney?.currencyCode || 'USD';
                  
                  return (
                    <tr key={item.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.variant?.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={item.variant.image.url}
                                alt={item.title}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{item.title}</div>
                            {item.variant?.sku && (
                              <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                                SKU: {item.variant.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatPrice(price, currencyCode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatPrice(total, currencyCode)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Subtotal:
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatPrice(
                    draftOrder.subtotalPriceSet?.shopMoney?.amount || '0',
                    draftOrder.subtotalPriceSet?.shopMoney?.currencyCode
                  )}
                </td>
              </tr>
              {draftOrder.shippingLine && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Shipping ({draftOrder.shippingLine.title}):
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatPrice(
                      draftOrder.shippingLine.priceSet?.shopMoney?.amount || '0',
                      draftOrder.shippingLine.priceSet?.shopMoney?.currencyCode
                    )}
                  </td>
                </tr>
              )}
              {draftOrder.appliedDiscount && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Discount ({draftOrder.appliedDiscount.title}):
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400">
                    -{formatPrice(draftOrder.appliedDiscount.amount || '0')}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Tax:
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatPrice(
                    draftOrder.totalTaxSet?.shopMoney?.amount || '0',
                    draftOrder.totalTaxSet?.shopMoney?.currencyCode
                  )}
                </td>
              </tr>
              <tr className="border-t-2 border-light-ui dark:border-dark-ui">
                <td colSpan={3} className="px-6 py-4 text-right font-bold">
                  Total:
                </td>
                <td className="px-6 py-4 text-right font-bold">
                  {formatPrice(
                    draftOrder.totalPriceSet?.shopMoney?.amount || '0',
                    draftOrder.totalPriceSet?.shopMoney?.currencyCode
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Shipping and Billing Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <Card title="Shipping Address">
          {draftOrder.shippingAddress ? (
            <div className="space-y-1">
              <div>
                {draftOrder.shippingAddress.firstName} {draftOrder.shippingAddress.lastName}
              </div>
              {draftOrder.shippingAddress.company && (
                <div>{draftOrder.shippingAddress.company}</div>
              )}
              <div>{draftOrder.shippingAddress.address1}</div>
              {draftOrder.shippingAddress.address2 && (
                <div>{draftOrder.shippingAddress.address2}</div>
              )}
              <div>
                {draftOrder.shippingAddress.city}, {draftOrder.shippingAddress.province} {draftOrder.shippingAddress.zip}
              </div>
              <div>{draftOrder.shippingAddress.country}</div>
              {draftOrder.shippingAddress.phone && (
                <div>{draftOrder.shippingAddress.phone}</div>
              )}
            </div>
          ) : (
            <div className="text-light-fg dark:text-dark-fg opacity-70">
              No shipping address
            </div>
          )}
        </Card>

        {/* Billing Address */}
        <Card title="Billing Address">
          {draftOrder.billingAddress ? (
            <div className="space-y-1">
              <div>
                {draftOrder.billingAddress.firstName} {draftOrder.billingAddress.lastName}
              </div>
              {draftOrder.billingAddress.company && (
                <div>{draftOrder.billingAddress.company}</div>
              )}
              <div>{draftOrder.billingAddress.address1}</div>
              {draftOrder.billingAddress.address2 && (
                <div>{draftOrder.billingAddress.address2}</div>
              )}
              <div>
                {draftOrder.billingAddress.city}, {draftOrder.billingAddress.province} {draftOrder.billingAddress.zip}
              </div>
              <div>{draftOrder.billingAddress.country}</div>
              {draftOrder.billingAddress.phone && (
                <div>{draftOrder.billingAddress.phone}</div>
              )}
            </div>
          ) : (
            <div className="text-light-fg dark:text-dark-fg opacity-70">
              No billing address
            </div>
          )}
        </Card>
      </div>

      {/* Additional Details */}
      <Card title="Additional Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-2">Tags</h3>
            {draftOrder.tags && draftOrder.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {draftOrder.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-editor dark:bg-dark-editor"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-light-fg dark:text-dark-fg opacity-70">
                No tags
              </div>
            )}
          </div>

          {/* Tax Exempt */}
          <div>
            <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-2">Tax Status</h3>
            <div>
              {draftOrder.taxExempt ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Tax Exempt
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-light-editor dark:bg-dark-editor">
                  Taxable
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        {draftOrder.note && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-light-fg dark:text-dark-fg mb-2">Note</h3>
            <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md whitespace-pre-wrap">
              {draftOrder.note}
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <DualView
      title={draftOrder.name || 'Draft Order'}
      presentationView={renderDraftOrderDetails()}
      rawData={draftOrder}
      defaultView="presentation"
    />
  );
};

export default DraftOrderDetail;
