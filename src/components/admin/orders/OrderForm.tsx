import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

// Define interfaces for form data
interface Address {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
}

interface LineItem {
  id?: string;
  variantId: string;
  productId?: string;
  title: string;
  quantity: number;
  price: string;
  requiresShipping: boolean;
  taxable: boolean;
  image?: string;
  sku?: string;
}

interface OrderFormData {
  customerId: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  lineItems: LineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingLine: {
    title: string;
    price: string;
  };
  tags: string;
  note: string;
  financialStatus: string;
  fulfillmentStatus: string;
}

export interface OrderFormProps {
  orderId?: string;
  onSave?: (order: any) => void;
  onCancel?: () => void;
  onDelete?: (orderId: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  orderId,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { orders, customers, products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  // State for form data
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: '',
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    lineItems: [],
    shippingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      phone: '',
    },
    billingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      phone: '',
    },
    shippingLine: {
      title: 'Standard Shipping',
      price: '0.00',
    },
    tags: '',
    note: '',
    financialStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
  });

  // State for customer search
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // State for product search
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  // State for line item being edited
  const [editingLineItemIndex, setEditingLineItemIndex] = useState<number | null>(null);
  const [newLineItem, setNewLineItem] = useState<LineItem>({
    variantId: '',
    title: '',
    quantity: 1,
    price: '0.00',
    requiresShipping: true,
    taxable: true,
  });

  // Fetch order data if editing an existing order
  useEffect(() => {
    if (orderId) {
      setIsLoading(true);
      setError(null);

      orders.getOrder(orderId)
        .then((data) => {
          setOrder(data);
          // Initialize form data with order data
          if (data) {
            initializeFormData(data);
          }
        })
        .catch((err) => {
          setError(`Failed to load order: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [orderId, orders]);

  // Initialize form data with order data
  const initializeFormData = (orderData: any) => {
    // Extract line items
    const lineItems = orderData.lineItems?.edges?.map((edge: any) => {
      const item = edge.node;
      return {
        id: item.id,
        variantId: item.variant?.id || '',
        productId: item.variant?.product?.id || '',
        title: item.title || '',
        quantity: item.quantity || 1,
        price: item.originalUnitPriceSet?.shopMoney?.amount || '0.00',
        requiresShipping: true,
        taxable: true,
        image: item.variant?.image?.url || '',
        sku: item.variant?.sku || '',
      };
    }) || [];

    // Extract customer data
    const customer = orderData.customer || {};

    // Extract shipping address
    const shippingAddress = orderData.shippingAddress || {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      phone: '',
    };

    // Extract billing address
    const billingAddress = orderData.billingAddress || {
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      province: '',
      zip: '',
      country: '',
      phone: '',
    };

    // Extract shipping line
    const shippingLine = orderData.shippingLines?.edges?.[0]?.node || {
      title: 'Standard Shipping',
      price: '0.00',
    };

    // Update form data
    setFormData({
      customerId: customer.id || '',
      customerEmail: customer.email || '',
      customerFirstName: customer.firstName || '',
      customerLastName: customer.lastName || '',
      lineItems,
      shippingAddress,
      billingAddress,
      shippingLine: {
        title: shippingLine.title || 'Standard Shipping',
        price: shippingLine.originalPriceSet?.shopMoney?.amount || '0.00',
      },
      tags: orderData.tags?.join(', ') || '',
      note: orderData.note || '',
      financialStatus: orderData.financialStatus || 'PENDING',
      fulfillmentStatus: orderData.fulfillmentStatus || 'UNFULFILLED',
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle shipping address input changes
  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      shippingAddress: {
        ...prevData.shippingAddress,
        [name]: value,
      },
    }));
  };

  // Handle billing address input changes
  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      billingAddress: {
        ...prevData.billingAddress,
        [name]: value,
      },
    }));
  };

  // Copy shipping address to billing address
  const copyShippingToBilling = () => {
    setFormData((prevData) => ({
      ...prevData,
      billingAddress: { ...prevData.shippingAddress },
    }));
  };

  // Handle customer search
  const handleCustomerSearch = async (query: string) => {
    if (!query.trim()) {
      setCustomerSearchResults([]);
      return;
    }

    setIsSearchingCustomers(true);
    try {
      // Search for customers with the given query
      const result = await customers.getCustomers({
        first: 5,
        query: query,
      });

      if (result && result.edges) {
        const customerResults = result.edges.map((edge: any) => edge.node);
        setCustomerSearchResults(customerResults);
      } else {
        setCustomerSearchResults([]);
      }
    } catch (err: any) {
      console.error('Error searching customers:', err);
      setCustomerSearchResults([]);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);

    // Update form data with customer information
    setFormData((prevData) => ({
      ...prevData,
      customerId: customer.id,
      customerEmail: customer.email || '',
      customerFirstName: customer.firstName || '',
      customerLastName: customer.lastName || '',
    }));

    // If customer has a default address, use it for shipping address
    if (customer.defaultAddress) {
      setFormData((prevData) => ({
        ...prevData,
        shippingAddress: {
          firstName: customer.defaultAddress.firstName || '',
          lastName: customer.defaultAddress.lastName || '',
          company: customer.defaultAddress.company || '',
          address1: customer.defaultAddress.address1 || '',
          address2: customer.defaultAddress.address2 || '',
          city: customer.defaultAddress.city || '',
          province: customer.defaultAddress.province || '',
          zip: customer.defaultAddress.zip || '',
          country: customer.defaultAddress.country || '',
          phone: customer.defaultAddress.phone || '',
        },
      }));
    }

    // Clear search results
    setCustomerSearchResults([]);
    setCustomerSearchQuery('');
  };

  // Handle product search
  const handleProductSearch = async (query: string) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }

    setIsSearchingProducts(true);
    try {
      // Search for products with the given query
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
  const handleProductSelect = (product: any, variant: any) => {
    const lineItem: LineItem = {
      variantId: variant.id,
      productId: product.id,
      title: `${product.title} - ${variant.title !== 'Default Title' ? variant.title : ''}`,
      quantity: 1,
      price: variant.price || '0.00',
      requiresShipping: variant.requiresShipping || true,
      taxable: variant.taxable || true,
      image: variant.image?.url || product.featuredImage?.url || '',
      sku: variant.sku || '',
    };

    if (editingLineItemIndex !== null) {
      // Update existing line item
      const updatedLineItems = [...formData.lineItems];
      updatedLineItems[editingLineItemIndex] = lineItem;

      setFormData((prevData) => ({
        ...prevData,
        lineItems: updatedLineItems,
      }));

      setEditingLineItemIndex(null);
    } else {
      // Add new line item
      setFormData((prevData) => ({
        ...prevData,
        lineItems: [...prevData.lineItems, lineItem],
      }));
    }

    // Reset new line item
    setNewLineItem({
      variantId: '',
      title: '',
      quantity: 1,
      price: '0.00',
      requiresShipping: true,
      taxable: true,
    });

    // Clear search results
    setProductSearchResults([]);
    setProductSearchQuery('');
  };

  // Handle line item quantity change
  const handleLineItemQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;

    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      quantity,
    };

    setFormData((prevData) => ({
      ...prevData,
      lineItems: updatedLineItems,
    }));
  };

  // Handle line item removal
  const handleRemoveLineItem = (index: number) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems.splice(index, 1);

    setFormData((prevData) => ({
      ...prevData,
      lineItems: updatedLineItems,
    }));
  };

  // Calculate line item total
  const calculateLineItemTotal = (price: string, quantity: number) => {
    return (parseFloat(price) * quantity).toFixed(2);
  };

  // Calculate order subtotal
  const calculateSubtotal = () => {
    return formData.lineItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Prepare the input data for API
      // This is a placeholder - we'll implement the actual submission logic later
      console.log('Form data to submit:', formData);

      if (onSave) {
        onSave(formData);
      }
    } catch (err: any) {
      setError(`Failed to save order: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (orderId && onDelete) {
      onDelete(orderId);
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

  // Basic form structure - we'll expand this in the next steps
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Customer Selection Section */}
      <Card title="Customer">
        <div className="space-y-4">
          {selectedCustomer ? (
            <div className="bg-light-editor dark:bg-dark-editor p-4 rounded-md">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedCustomer.firstName || selectedCustomer.lastName
                      ? `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim()
                      : 'Unnamed Customer'
                    }
                  </h3>
                  {selectedCustomer.email && (
                    <p className="text-light-fg dark:text-dark-fg">
                      <span className="font-medium">Email:</span> {selectedCustomer.email}
                    </p>
                  )}
                  {selectedCustomer.phone && (
                    <p className="text-light-fg dark:text-dark-fg">
                      <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a customer by name or email"
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value);
                    handleCustomerSearch(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                />
                {isSearchingCustomers && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-light-accent dark:border-dark-accent"></div>
                  </div>
                )}
              </div>

              {customerSearchResults.length > 0 && (
                <div className="mt-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg max-h-60 overflow-y-auto">
                  <ul className="divide-y divide-light-ui dark:divide-dark-ui">
                    {customerSearchResults.map((customer) => (
                      <li
                        key={customer.id}
                        className="px-4 py-2 hover:bg-light-editor dark:hover:bg-dark-editor cursor-pointer"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="font-medium">
                          {customer.firstName || customer.lastName
                            ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                            : 'Unnamed Customer'
                          }
                        </div>
                        <div className="text-sm text-light-fg dark:text-dark-fg">
                          {customer.email || 'No email'}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm text-light-fg dark:text-dark-fg">
                  Or enter customer details manually:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label htmlFor="customerFirstName" className="block text-sm font-medium mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="customerFirstName"
                      name="customerFirstName"
                      value={formData.customerFirstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerLastName" className="block text-sm font-medium mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="customerLastName"
                      name="customerLastName"
                      value={formData.customerLastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Line Items Section */}
      <Card title="Line Items">
        <div className="space-y-4">
          {/* Line items table */}
          {formData.lineItems.length > 0 && (
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
                  {formData.lineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={item.image}
                                alt={item.title}
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{item.title}</div>
                            {item.sku && (
                              <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                                SKU: {item.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleLineItemQuantityChange(index, item.quantity - 1)}
                            className="text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="mx-2">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleLineItemQuantityChange(index, item.quantity + 1)}
                            className="text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        ${calculateLineItemTotal(item.price, item.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(index)}
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
                      ${calculateSubtotal()}
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
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (newLineItem.title && parseFloat(newLineItem.price) >= 0 && newLineItem.quantity > 0) {
                      setFormData((prevData) => ({
                        ...prevData,
                        lineItems: [...prevData.lineItems, newLineItem],
                      }));
                      setNewLineItem({
                        variantId: '',
                        title: '',
                        quantity: 1,
                        price: '0.00',
                        requiresShipping: true,
                        taxable: true,
                      });
                    }
                  }}
                  disabled={!newLineItem.title || parseFloat(newLineItem.price) < 0 || newLineItem.quantity < 1}
                >
                  Add Custom Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Shipping Address Section */}
      <Card title="Shipping Address">
        <div className="space-y-4">
          {/* First row: First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shippingFirstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                id="shippingFirstName"
                name="firstName"
                value={formData.shippingAddress.firstName}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="shippingLastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="shippingLastName"
                name="lastName"
                value={formData.shippingAddress.lastName}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="shippingCompany" className="block text-sm font-medium mb-1">
              Company (optional)
            </label>
            <input
              type="text"
              id="shippingCompany"
              name="company"
              value={formData.shippingAddress.company}
              onChange={handleShippingAddressChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          {/* Address lines */}
          <div>
            <label htmlFor="shippingAddress1" className="block text-sm font-medium mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              id="shippingAddress1"
              name="address1"
              value={formData.shippingAddress.address1}
              onChange={handleShippingAddressChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress2" className="block text-sm font-medium mb-1">
              Address Line 2 (optional)
            </label>
            <input
              type="text"
              id="shippingAddress2"
              name="address2"
              value={formData.shippingAddress.address2}
              onChange={handleShippingAddressChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          {/* City, Province, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="shippingCity" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                type="text"
                id="shippingCity"
                name="city"
                value={formData.shippingAddress.city}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="shippingProvince" className="block text-sm font-medium mb-1">
                State / Province
              </label>
              <input
                type="text"
                id="shippingProvince"
                name="province"
                value={formData.shippingAddress.province}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="shippingZip" className="block text-sm font-medium mb-1">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                id="shippingZip"
                name="zip"
                value={formData.shippingAddress.zip}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>

          {/* Country and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shippingCountry" className="block text-sm font-medium mb-1">
                Country
              </label>
              <input
                type="text"
                id="shippingCountry"
                name="country"
                value={formData.shippingAddress.country}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="shippingPhone" className="block text-sm font-medium mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="shippingPhone"
                name="phone"
                value={formData.shippingAddress.phone}
                onChange={handleShippingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Billing Address Section */}
      <Card title="Billing Address">
        <div className="space-y-4">
          {/* Copy from shipping button */}
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={copyShippingToBilling}
              className="w-full md:w-auto"
            >
              Copy from Shipping Address
            </Button>
          </div>

          {/* First row: First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billingFirstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                id="billingFirstName"
                name="firstName"
                value={formData.billingAddress.firstName}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="billingLastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="billingLastName"
                name="lastName"
                value={formData.billingAddress.lastName}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label htmlFor="billingCompany" className="block text-sm font-medium mb-1">
              Company (optional)
            </label>
            <input
              type="text"
              id="billingCompany"
              name="company"
              value={formData.billingAddress.company}
              onChange={handleBillingAddressChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          {/* Address lines */}
          <div>
            <label htmlFor="billingAddress1" className="block text-sm font-medium mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              id="billingAddress1"
              name="address1"
              value={formData.billingAddress.address1}
              onChange={handleBillingAddressChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>
          <div>
            <label htmlFor="billingAddress2" className="block text-sm font-medium mb-1">
              Address Line 2 (optional)
            </label>
            <input
              type="text"
              id="billingAddress2"
              name="address2"
              value={formData.billingAddress.address2}
              onChange={handleBillingAddressChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          {/* City, Province, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="billingCity" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                type="text"
                id="billingCity"
                name="city"
                value={formData.billingAddress.city}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="billingProvince" className="block text-sm font-medium mb-1">
                State / Province
              </label>
              <input
                type="text"
                id="billingProvince"
                name="province"
                value={formData.billingAddress.province}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="billingZip" className="block text-sm font-medium mb-1">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                id="billingZip"
                name="zip"
                value={formData.billingAddress.zip}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>

          {/* Country and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billingCountry" className="block text-sm font-medium mb-1">
                Country
              </label>
              <input
                type="text"
                id="billingCountry"
                name="country"
                value={formData.billingAddress.country}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="billingPhone" className="block text-sm font-medium mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                id="billingPhone"
                name="phone"
                value={formData.billingAddress.phone}
                onChange={handleBillingAddressChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Shipping Method Section */}
      <Card title="Shipping Method">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="shippingTitle" className="block text-sm font-medium mb-1">
                Shipping Method
              </label>
              <input
                type="text"
                id="shippingTitle"
                name="shippingLine.title"
                value={formData.shippingLine.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="shippingPrice" className="block text-sm font-medium mb-1">
                Shipping Price
              </label>
              <input
                type="number"
                id="shippingPrice"
                name="shippingLine.price"
                min="0"
                step="0.01"
                value={formData.shippingLine.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Details Section */}
      <Card title="Additional Details">
        <div className="space-y-4">
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g. important, rush, wholesale"
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-1">
              Note
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            ></textarea>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="financialStatus" className="block text-sm font-medium mb-1">
                Financial Status
              </label>
              <select
                id="financialStatus"
                name="financialStatus"
                value={formData.financialStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              >
                <option value="PENDING">Pending</option>
                <option value="AUTHORIZED">Authorized</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
                <option value="REFUNDED">Refunded</option>
                <option value="VOIDED">Voided</option>
              </select>
            </div>
            <div>
              <label htmlFor="fulfillmentStatus" className="block text-sm font-medium mb-1">
                Fulfillment Status
              </label>
              <select
                id="fulfillmentStatus"
                name="fulfillmentStatus"
                value={formData.fulfillmentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              >
                <option value="UNFULFILLED">Unfulfilled</option>
                <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="RESTOCKED">Restocked</option>
                <option value="PENDING_FULFILLMENT">Pending Fulfillment</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Form actions */}
      <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
        <div>
          {orderId && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : orderId ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <DualView
      title={orderId ? 'Edit Order' : 'Create Order'}
      presentationView={renderForm()}
      rawData={order || formData}
      defaultView="presentation"
    />
  );
};

export default OrderForm;
