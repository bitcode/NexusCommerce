import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface OrderEditingInterfaceProps {
  orderId: string;
  onSave?: (order: any) => void;
  onCancel?: () => void;
}

/**
 * OrderEditingInterface component
 * This component provides an interface for editing existing orders
 */
const OrderEditingInterface: React.FC<OrderEditingInterfaceProps> = ({
  orderId,
  onSave,
  onCancel,
}) => {
  const { orders, products } = useShopify();

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for order data
  const [order, setOrder] = useState<any>(null);
  const [calculatedOrderId, setCalculatedOrderId] = useState<string | null>(null);
  const [calculatedOrder, setCalculatedOrder] = useState<any>(null);

  // State for staff note and customer notification
  const [staffNote, setStaffNote] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(false);

  // State for product search
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  // State for new line item
  const [newLineItem, setNewLineItem] = useState({
    title: '',
    price: '0.00',
    quantity: 1,
    requiresShipping: true,
    taxable: true
  });

  // State for shipping
  const [newShippingLine, setNewShippingLine] = useState({
    title: 'Standard Shipping',
    price: '0.00'
  });

  // State for discount
  const [newDiscount, setNewDiscount] = useState({
    description: '',
    value: '',
    valueType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT'
  });
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);

  // Fetch order data
  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Fetch calculated order data when calculatedOrderId changes
  useEffect(() => {
    if (calculatedOrderId) {
      fetchCalculatedOrder();
    }
  }, [calculatedOrderId]);

  // Fetch order data
  const fetchOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orderData = await orders.getOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      setError(`Failed to load order: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Begin order editing
  const beginOrderEditing = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const calculatedId = await orders.beginOrderEdit(orderId);
      setCalculatedOrderId(calculatedId);
    } catch (err: any) {
      setError(`Failed to begin order editing: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch calculated order data
  const fetchCalculatedOrder = async () => {
    if (!calculatedOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const calculatedOrderData = await orders.getCalculatedOrder(calculatedOrderId);
      setCalculatedOrder(calculatedOrderData);
    } catch (err: any) {
      setError(`Failed to load calculated order: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product search
  const handleProductSearch = async (query: string) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }

    setIsSearchingProducts(true);
    try {
      const result = await products.getProducts({
        first: 5,
        query: query,
      });

      if (result && result.edges) {
        const productResults = result.edges.map((edge: any) => edge.node);
        setProductSearchResults(productResults);
      } else {
        setProductSearchResults([]);
      }
    } catch (err: any) {
      console.error('Error searching products:', err);
      setProductSearchResults([]);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  // Handle product selection
  const handleProductSelect = async (product: any, variant: any) => {
    if (!calculatedOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      await orders.addVariantToOrder(
        calculatedOrderId,
        variant.id,
        1
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();

      // Clear search
      setProductSearchQuery('');
      setProductSearchResults([]);
    } catch (err: any) {
      setError(`Failed to add product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle custom item addition
  const handleAddCustomItem = async () => {
    if (!calculatedOrderId || !newLineItem.title || parseFloat(newLineItem.price) < 0 || newLineItem.quantity < 1) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await orders.addCustomItemToOrder(
        calculatedOrderId,
        newLineItem.title,
        {
          amount: newLineItem.price,
          currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || 'USD'
        },
        newLineItem.quantity,
        newLineItem.requiresShipping,
        newLineItem.taxable
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();

      // Reset new line item form
      setNewLineItem({
        title: '',
        price: '0.00',
        quantity: 1,
        requiresShipping: true,
        taxable: true
      });
    } catch (err: any) {
      setError(`Failed to add custom item: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle line item quantity change
  const handleLineItemQuantityChange = async (lineItemId: string, quantity: number) => {
    if (!calculatedOrderId || quantity < 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await orders.setLineItemQuantity(
        calculatedOrderId,
        lineItemId,
        quantity
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();
    } catch (err: any) {
      setError(`Failed to update quantity: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle line item removal
  const handleRemoveLineItem = async (lineItemId: string) => {
    if (!calculatedOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Setting quantity to 0 effectively removes the line item
      await orders.setLineItemQuantity(
        calculatedOrderId,
        lineItemId,
        0,
        true // restock the item
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();
    } catch (err: any) {
      setError(`Failed to remove item: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a shipping line
  const handleAddShippingLine = async () => {
    if (!calculatedOrderId || !newShippingLine.title || parseFloat(newShippingLine.price) < 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await orders.addShippingLine(
        calculatedOrderId,
        newShippingLine.title,
        {
          amount: newShippingLine.price,
          currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || 'USD'
        }
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();

      // Reset shipping line form
      setNewShippingLine({
        title: 'Standard Shipping',
        price: '0.00'
      });
    } catch (err: any) {
      setError(`Failed to add shipping line: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a shipping line
  const handleUpdateShippingLine = async (shippingLineId: string, title: string, price: string) => {
    if (!calculatedOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      await orders.updateShippingLine(
        calculatedOrderId,
        shippingLineId,
        title,
        {
          amount: price,
          currencyCode: order.totalPriceSet?.shopMoney?.currencyCode || 'USD'
        }
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();
    } catch (err: any) {
      setError(`Failed to update shipping line: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a shipping line
  const handleRemoveShippingLine = async (shippingLineId: string) => {
    if (!calculatedOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      await orders.removeShippingLine(
        calculatedOrderId,
        shippingLineId
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();
    } catch (err: any) {
      setError(`Failed to remove shipping line: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a discount to a line item
  const handleAddDiscount = async () => {
    if (!calculatedOrderId || !selectedLineItemId || !newDiscount.description || !newDiscount.value) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await orders.addLineItemDiscount(
        calculatedOrderId,
        selectedLineItemId,
        {
          description: newDiscount.description,
          value: newDiscount.value,
          valueType: newDiscount.valueType
        }
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();

      // Reset discount form
      setNewDiscount({
        description: '',
        value: '',
        valueType: 'PERCENTAGE'
      });
      setSelectedLineItemId(null);
    } catch (err: any) {
      setError(`Failed to add discount: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing a discount
  const handleRemoveDiscount = async (discountApplicationId: string) => {
    if (!calculatedOrderId) return;

    setIsLoading(true);
    setError(null);

    try {
      await orders.removeDiscount(
        calculatedOrderId,
        discountApplicationId
      );

      // Refresh calculated order data
      await fetchCalculatedOrder();
    } catch (err: any) {
      setError(`Failed to remove discount: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Commit order edits
  const commitOrderEdits = async () => {
    if (!calculatedOrderId) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedOrder = await orders.commitOrderEdits(
        calculatedOrderId,
        staffNote,
        notifyCustomer
      );

      if (onSave) {
        onSave(updatedOrder);
      }
    } catch (err: any) {
      setError(`Failed to commit order edits: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="ml-3">Loading order...</p>
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
          <Button variant="secondary" onClick={handleCancel} className="mt-4">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  // If order is loaded but editing hasn't started yet
  if (order && !calculatedOrderId) {
    return (
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Edit Order #{order.name}</h2>
          <p>
            You are about to edit order #{order.name}. This will create a new version of the order
            that you can modify before committing the changes.
          </p>
          <div className="flex space-x-4">
            <Button variant="primary" onClick={beginOrderEditing}>
              Begin Editing
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Basic editing interface - we'll expand this in the next steps
  return (
    <DualView
      title={`Editing Order #${order?.name}`}
      presentationView={
        <div className="space-y-6">
          {/* Line Items Section */}
          <Card title="Line Items">
            <div className="space-y-4">
              {/* Line items table */}
              {calculatedOrder?.lineItems?.length > 0 && (
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
                      {calculatedOrder.lineItems.map((item: any) => (
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
                            ${parseFloat(item.discountedUnitPrice?.amount || item.originalUnitPrice?.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => handleLineItemQuantityChange(item.id, item.quantity - 1)}
                                className="text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent"
                                disabled={item.quantity <= 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleLineItemQuantityChange(item.id, item.quantity + 1)}
                                className="text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            ${(parseFloat(item.discountedUnitPrice?.amount || item.originalUnitPrice?.amount) * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          ${parseFloat(calculatedOrder.subtotalPrice?.amount || '0').toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Add product */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Add Product</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a product by title or SKU"
                    value={productSearchQuery}
                    onChange={(e) => {
                      setProductSearchQuery(e.target.value);
                      handleProductSearch(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  />
                  {isSearchingProducts && (
                    <div className="absolute right-3 top-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-light-accent dark:border-dark-accent"></div>
                    </div>
                  )}
                </div>

                {productSearchResults.length > 0 && (
                  <div className="mt-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg max-h-60 overflow-y-auto">
                    <ul className="divide-y divide-light-ui dark:divide-dark-ui">
                      {productSearchResults.map((product) => (
                        <li key={product.id} className="px-4 py-2">
                          <div className="font-medium">{product.title}</div>
                          {product.variants?.edges?.length > 0 && (
                            <div className="mt-2 pl-4 space-y-2">
                              {product.variants.edges.map((edge: any) => {
                                const variant = edge.node;
                                return (
                                  <div
                                    key={variant.id}
                                    className="flex justify-between items-center hover:bg-light-editor dark:hover:bg-dark-editor p-2 rounded cursor-pointer"
                                    onClick={() => handleProductSelect(product, variant)}
                                  >
                                    <div>
                                      <span className="text-sm">
                                        {variant.title !== 'Default Title' ? variant.title : 'Default'}
                                      </span>
                                      {variant.sku && (
                                        <span className="text-xs text-light-fg dark:text-dark-fg opacity-70 ml-2">
                                          SKU: {variant.sku}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm font-medium">
                                      ${parseFloat(variant.price).toFixed(2)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Manual line item entry */}
                <div className="mt-4">
                  <p className="text-sm text-light-fg dark:text-dark-fg mb-2">
                    Or enter product details manually:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="lineItemTitle" className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="lineItemTitle"
                        value={newLineItem.title}
                        onChange={(e) => setNewLineItem({...newLineItem, title: e.target.value})}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>
                    <div>
                      <label htmlFor="lineItemPrice" className="block text-sm font-medium mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        id="lineItemPrice"
                        min="0"
                        step="0.01"
                        value={newLineItem.price}
                        onChange={(e) => setNewLineItem({...newLineItem, price: e.target.value})}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>
                    <div>
                      <label htmlFor="lineItemQuantity" className="block text-sm font-medium mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="lineItemQuantity"
                        min="1"
                        value={newLineItem.quantity}
                        onChange={(e) => setNewLineItem({...newLineItem, quantity: parseInt(e.target.value) || 1})}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="lineItemRequiresShipping"
                        checked={newLineItem.requiresShipping}
                        onChange={(e) => setNewLineItem({...newLineItem, requiresShipping: e.target.checked})}
                        className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                      />
                      <label htmlFor="lineItemRequiresShipping" className="ml-2 block text-sm">
                        Requires shipping
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="lineItemTaxable"
                        checked={newLineItem.taxable}
                        onChange={(e) => setNewLineItem({...newLineItem, taxable: e.target.checked})}
                        className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                      />
                      <label htmlFor="lineItemTaxable" className="ml-2 block text-sm">
                        Taxable
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={handleAddCustomItem}
                      disabled={!newLineItem.title || parseFloat(newLineItem.price) < 0 || newLineItem.quantity < 1}
                    >
                      Add Custom Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Section */}
          <Card title="Shipping">
            <div className="space-y-4">
              {/* Current shipping line */}
              {calculatedOrder?.shippingLine && (
                <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{calculatedOrder.shippingLine.title}</h3>
                      <p className="text-light-fg dark:text-dark-fg">
                        ${parseFloat(calculatedOrder.shippingLine.price?.amount || '0').toFixed(2)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveShippingLine(calculatedOrder.shippingLine.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add shipping line */}
              {!calculatedOrder?.shippingLine && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Add Shipping</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shippingTitle" className="block text-sm font-medium mb-1">
                        Shipping Method
                      </label>
                      <input
                        type="text"
                        id="shippingTitle"
                        value={newShippingLine.title}
                        onChange={(e) => setNewShippingLine({...newShippingLine, title: e.target.value})}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>
                    <div>
                      <label htmlFor="shippingPrice" className="block text-sm font-medium mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        id="shippingPrice"
                        min="0"
                        step="0.01"
                        value={newShippingLine.price}
                        onChange={(e) => setNewShippingLine({...newShippingLine, price: e.target.value})}
                        className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={handleAddShippingLine}
                      disabled={!newShippingLine.title || parseFloat(newShippingLine.price) < 0}
                    >
                      Add Shipping
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Discount Section */}
          <Card title="Discounts">
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-2">Add Discount to Line Item</h3>

              {/* Select line item for discount */}
              <div>
                <label htmlFor="lineItemSelect" className="block text-sm font-medium mb-1">
                  Select Line Item
                </label>
                <select
                  id="lineItemSelect"
                  value={selectedLineItemId || ''}
                  onChange={(e) => setSelectedLineItemId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                >
                  <option value="">Select a line item</option>
                  {calculatedOrder?.lineItems?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.title} (${parseFloat(item.originalUnitPrice?.amount || '0').toFixed(2)} × {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount details */}
              {selectedLineItemId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="discountDescription" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="discountDescription"
                      value={newDiscount.description}
                      onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      placeholder="e.g. Summer Sale"
                    />
                  </div>
                  <div>
                    <label htmlFor="discountValue" className="block text-sm font-medium mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      id="discountValue"
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                      placeholder={newDiscount.valueType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 5.00'}
                    />
                  </div>
                  <div>
                    <label htmlFor="discountType" className="block text-sm font-medium mb-1">
                      Type
                    </label>
                    <select
                      id="discountType"
                      value={newDiscount.valueType}
                      onChange={(e) => setNewDiscount({...newDiscount, valueType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT'})}
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED_AMOUNT">Fixed Amount</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Add discount button */}
              {selectedLineItemId && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={handleAddDiscount}
                    disabled={!newDiscount.description || !newDiscount.value}
                  >
                    Add Discount
                  </Button>
                </div>
              )}

              {/* Display existing discounts */}
              {calculatedOrder?.lineItems?.some((item: any) => item.discountAllocations?.length > 0) && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Applied Discounts</h3>
                  <div className="space-y-2">
                    {calculatedOrder.lineItems
                      .filter((item: any) => item.discountAllocations?.length > 0)
                      .map((item: any) => (
                        <div key={item.id} className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="mt-2 space-y-2">
                            {item.discountAllocations.map((discount: any, index: number) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm">
                                    {discount.discountApplication.value.percentage
                                      ? `${discount.discountApplication.value.percentage}% off`
                                      : `$${parseFloat(discount.allocatedAmount.amount).toFixed(2)} off`}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDiscount(discount.discountApplication.index)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Commit options */}
          <Card title="Commit Options">
            <div className="space-y-4">
              <div>
                <label htmlFor="staffNote" className="block text-sm font-medium mb-1">
                  Staff Note
                </label>
                <textarea
                  id="staffNote"
                  rows={3}
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  placeholder="Add a note about these changes (optional)"
                ></textarea>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyCustomer"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                />
                <label htmlFor="notifyCustomer" className="ml-2 block text-sm">
                  Notify customer about these changes
                </label>
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card title="Order Summary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm">Subtotal:</div>
                <div className="text-sm text-right font-medium">
                  ${parseFloat(calculatedOrder?.subtotalPrice?.amount || '0').toFixed(2)}
                </div>

                <div className="text-sm">Shipping:</div>
                <div className="text-sm text-right font-medium">
                  ${parseFloat(calculatedOrder?.totalShippingPrice?.amount || '0').toFixed(2)}
                </div>

                <div className="text-sm">Tax:</div>
                <div className="text-sm text-right font-medium">
                  ${parseFloat(calculatedOrder?.totalTax?.amount || '0').toFixed(2)}
                </div>

                <div className="text-base font-bold">Total:</div>
                <div className="text-base text-right font-bold">
                  ${parseFloat(calculatedOrder?.totalPrice?.amount || '0').toFixed(2)}
                </div>
              </div>
            </div>
          </Card>

          {/* Form actions */}
          <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
            <div></div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={commitOrderEdits}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Commit Changes'}
              </Button>
            </div>
          </div>
        </div>
      }
      rawData={{ order, calculatedOrder }}
      defaultView="presentation"
    />
  );
};

export default OrderEditingInterface;
