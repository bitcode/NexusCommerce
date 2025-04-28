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

interface AppliedDiscount {
  title: string;
  description: string;
  value: string;
  valueType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  amount?: string;
}

interface DraftOrderFormData {
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
  appliedDiscount?: AppliedDiscount;
  tags: string;
  note: string;
  taxExempt: boolean;
  useCustomerDefaultAddress: boolean;
  email: string;
}

export interface DraftOrderFormProps {
  draftOrderId?: string;
  onSave?: (draftOrder: any) => void;
  onComplete?: (draftOrder: any) => void;
  onCancel?: () => void;
  onDelete?: (draftOrderId: string) => void;
}

const DraftOrderForm: React.FC<DraftOrderFormProps> = ({
  draftOrderId,
  onSave,
  onComplete,
  onCancel,
  onDelete,
}) => {
  const { orders, customers, products } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState<any>(null);

  // State for form data
  const [formData, setFormData] = useState<DraftOrderFormData>({
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
    taxExempt: false,
    useCustomerDefaultAddress: true,
    email: '',
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

  // Fetch draft order data if editing an existing draft order
  useEffect(() => {
    if (draftOrderId) {
      setIsLoading(true);
      setError(null);

      orders.getDraftOrder(draftOrderId)
        .then((data) => {
          setDraftOrder(data);
          // Initialize form data with draft order data
          if (data) {
            initializeFormData(data);
          }
        })
        .catch((err) => {
          setError(`Failed to load draft order: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [draftOrderId, orders]);

  // Initialize form data with draft order data
  const initializeFormData = (draftOrderData: any) => {
    // Extract line items
    const lineItems = draftOrderData.lineItems?.edges?.map((edge: any) => {
      const item = edge.node;
      return {
        id: item.id,
        variantId: item.variant?.id || '',
        productId: item.variant?.product?.id || item.product?.id || '',
        title: item.title || '',
        quantity: item.quantity || 1,
        price: item.originalUnitPriceSet?.shopMoney?.amount || '0.00',
        requiresShipping: true,
        taxable: item.taxable || true,
        image: item.variant?.image?.url || '',
        sku: item.variant?.sku || '',
      };
    }) || [];

    // Extract customer data
    const customer = draftOrderData.customer || {};

    // Extract shipping address
    const shippingAddress = draftOrderData.shippingAddress || {
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
    const billingAddress = draftOrderData.billingAddress || {
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
    const shippingLine = draftOrderData.shippingLine || {
      title: 'Standard Shipping',
      price: '0.00',
    };

    // Extract applied discount
    const appliedDiscount = draftOrderData.appliedDiscount ? {
      title: draftOrderData.appliedDiscount.title || '',
      description: draftOrderData.appliedDiscount.description || '',
      value: draftOrderData.appliedDiscount.value || '',
      valueType: draftOrderData.appliedDiscount.valueType || 'PERCENTAGE',
      amount: draftOrderData.appliedDiscount.amount || '',
    } : undefined;

    // Update form data
    setFormData({
      customerId: customer.id || '',
      customerEmail: customer.email || draftOrderData.email || '',
      customerFirstName: customer.firstName || '',
      customerLastName: customer.lastName || '',
      lineItems,
      shippingAddress,
      billingAddress,
      shippingLine: {
        title: shippingLine.title || 'Standard Shipping',
        price: shippingLine.priceSet?.shopMoney?.amount || '0.00',
      },
      appliedDiscount,
      tags: draftOrderData.tags?.join(', ') || '',
      note: draftOrderData.note || '',
      taxExempt: draftOrderData.taxExempt || false,
      useCustomerDefaultAddress: draftOrderData.useCustomerDefaultAddress || true,
      email: draftOrderData.email || customer.email || '',
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

  // Handle checkbox input changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
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
      email: customer.email || '',
    }));

    // If customer has a default address and useCustomerDefaultAddress is true, use it for shipping address
    if (customer.defaultAddress && formData.useCustomerDefaultAddress) {
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
      const input: any = {
        lineItems: formData.lineItems.map(item => ({
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          title: item.title,
          originalUnitPrice: item.price,
          requiresShipping: item.requiresShipping,
          taxable: item.taxable,
        })),
        shippingAddress: {
          firstName: formData.shippingAddress.firstName,
          lastName: formData.shippingAddress.lastName,
          company: formData.shippingAddress.company,
          address1: formData.shippingAddress.address1,
          address2: formData.shippingAddress.address2,
          city: formData.shippingAddress.city,
          province: formData.shippingAddress.province,
          zip: formData.shippingAddress.zip,
          country: formData.shippingAddress.country,
          phone: formData.shippingAddress.phone,
        },
        billingAddress: {
          firstName: formData.billingAddress.firstName,
          lastName: formData.billingAddress.lastName,
          company: formData.billingAddress.company,
          address1: formData.billingAddress.address1,
          address2: formData.billingAddress.address2,
          city: formData.billingAddress.city,
          province: formData.billingAddress.province,
          zip: formData.billingAddress.zip,
          country: formData.billingAddress.country,
          phone: formData.billingAddress.phone,
        },
        note: formData.note,
        taxExempt: formData.taxExempt,
        useCustomerDefaultAddress: formData.useCustomerDefaultAddress,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      };

      // Add customer information if available
      if (formData.customerId) {
        input.customerId = formData.customerId;
      } else if (formData.email) {
        input.email = formData.email;

        // If we have customer name but no ID, include it
        if (formData.customerFirstName || formData.customerLastName) {
          input.shippingAddress.firstName = formData.customerFirstName;
          input.shippingAddress.lastName = formData.customerLastName;
          input.billingAddress.firstName = formData.customerFirstName;
          input.billingAddress.lastName = formData.customerLastName;
        }
      }

      // Add shipping line if available
      if (formData.shippingLine.title) {
        input.shippingLine = {
          title: formData.shippingLine.title,
          price: formData.shippingLine.price,
        };
      }

      // Add discount if available
      if (formData.appliedDiscount?.title && formData.appliedDiscount?.value) {
        input.appliedDiscount = {
          title: formData.appliedDiscount.title,
          description: formData.appliedDiscount.description,
          value: formData.appliedDiscount.value,
          valueType: formData.appliedDiscount.valueType,
        };
      }

      let savedDraftOrder;

      if (draftOrderId) {
        // Update existing draft order
        savedDraftOrder = await orders.updateDraftOrder(draftOrderId, input);
      } else {
        // Create new draft order
        savedDraftOrder = await orders.createDraftOrder(input);
      }

      if (onSave) {
        onSave(savedDraftOrder);
      }
    } catch (err: any) {
      setError(`Failed to save draft order: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle complete draft order
  const handleComplete = async () => {
    if (!draftOrderId) return;

    setIsCompleting(true);
    setError(null);

    try {
      // Complete the draft order
      const completedDraftOrder = await orders.completeDraftOrder(draftOrderId, false);

      if (onComplete) {
        onComplete(completedDraftOrder);
      }
    } catch (err: any) {
      setError(`Failed to complete draft order: ${err.message}`);
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle delete draft order
  const handleDelete = async () => {
    if (!draftOrderId || !onDelete) return;

    if (window.confirm('Are you sure you want to delete this draft order? This action cannot be undone.')) {
      try {
        await orders.deleteDraftOrder(draftOrderId);
        onDelete(draftOrderId);
      } catch (err: any) {
        setError(`Failed to delete draft order: ${err.message}`);
      }
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
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useCustomerDefaultAddress"
                      name="useCustomerDefaultAddress"
                      checked={formData.useCustomerDefaultAddress}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                    />
                    <label htmlFor="useCustomerDefaultAddress" className="ml-2 block text-sm">
                      Use customer's default address
                    </label>
                  </div>
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

      {/* Discount Section */}
      <Card title="Discount">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discountTitle" className="block text-sm font-medium mb-1">
                Discount Title
              </label>
              <input
                type="text"
                id="discountTitle"
                name="appliedDiscount.title"
                value={formData.appliedDiscount?.title || ''}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    appliedDiscount: {
                      ...(prevData.appliedDiscount || {
                        title: '',
                        description: '',
                        value: '',
                        valueType: 'PERCENTAGE',
                      }),
                      title: e.target.value,
                    },
                  }));
                }}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="discountDescription" className="block text-sm font-medium mb-1">
                Discount Description (optional)
              </label>
              <input
                type="text"
                id="discountDescription"
                name="appliedDiscount.description"
                value={formData.appliedDiscount?.description || ''}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    appliedDiscount: {
                      ...(prevData.appliedDiscount || {
                        title: '',
                        description: '',
                        value: '',
                        valueType: 'PERCENTAGE',
                      }),
                      description: e.target.value,
                    },
                  }));
                }}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discountValue" className="block text-sm font-medium mb-1">
                Discount Value
              </label>
              <input
                type="text"
                id="discountValue"
                name="appliedDiscount.value"
                value={formData.appliedDiscount?.value || ''}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    appliedDiscount: {
                      ...(prevData.appliedDiscount || {
                        title: '',
                        description: '',
                        value: '',
                        valueType: 'PERCENTAGE',
                      }),
                      value: e.target.value,
                    },
                  }));
                }}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
            <div>
              <label htmlFor="discountValueType" className="block text-sm font-medium mb-1">
                Discount Type
              </label>
              <select
                id="discountValueType"
                name="appliedDiscount.valueType"
                value={formData.appliedDiscount?.valueType || 'PERCENTAGE'}
                onChange={(e) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    appliedDiscount: {
                      ...(prevData.appliedDiscount || {
                        title: '',
                        description: '',
                        value: '',
                        valueType: 'PERCENTAGE',
                      }),
                      valueType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                    },
                  }));
                }}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
              </select>
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

          {/* Tax Exempt */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="taxExempt"
              name="taxExempt"
              checked={formData.taxExempt}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
            />
            <label htmlFor="taxExempt" className="ml-2 block text-sm">
              Tax Exempt
            </label>
          </div>
        </div>
      </Card>

      {/* Form actions */}
      <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
        <div>
          {draftOrderId && (
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
          {draftOrderId && (
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? 'Completing...' : 'Complete Draft Order'}
            </Button>
          )}
          <Button
            variant="primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : draftOrderId ? 'Update Draft Order' : 'Create Draft Order'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <DualView
      title={draftOrderId ? 'Edit Draft Order' : 'Create Draft Order'}
      presentationView={renderForm()}
      rawData={draftOrder || formData}
      defaultView="presentation"
    />
  );
};

export default DraftOrderForm;
