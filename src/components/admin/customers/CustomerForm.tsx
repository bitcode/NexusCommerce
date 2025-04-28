import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CustomerFormProps {
  customerId?: string;
  onSave?: (customer: any) => void;
  onCancel?: () => void;
  onDelete?: (customerId: string) => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customerId,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    acceptsMarketing: false,
    taxExempt: false,
    note: '',
    tags: '',
  });

  // Fetch customer data if editing an existing customer
  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      setError(null);

      customers.getCustomer(customerId)
        .then((data) => {
          setCustomer(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            acceptsMarketing: data.acceptsMarketing || false,
            taxExempt: data.taxExempt || false,
            note: data.note || '',
            tags: data.tags ? data.tags.join(', ') : '',
          });
        })
        .catch((err) => {
          setError(`Failed to load customer: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [customerId, customers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Prepare the input data
      const input = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        acceptsMarketing: formData.acceptsMarketing,
        taxExempt: formData.taxExempt,
        note: formData.note,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      let savedCustomer;
      if (customerId) {
        // Update existing customer
        savedCustomer = await customers.updateCustomer(customerId, input);
      } else {
        // Create new customer
        savedCustomer = await customers.createCustomer(input);
      }

      if (onSave) {
        onSave(savedCustomer);
      }
    } catch (err: any) {
      setError(`Failed to save customer: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (customerId && onDelete) {
      onDelete(customerId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
        </div>
      </Card>
    );
  }

  // Render the form with dual-view capability
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="acceptsMarketing"
            name="acceptsMarketing"
            checked={formData.acceptsMarketing}
            onChange={handleInputChange}
            className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
          />
          <label htmlFor="acceptsMarketing" className="ml-2 block text-sm">
            Accepts Marketing
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="taxExempt"
            name="taxExempt"
            checked={formData.taxExempt}
            onChange={handleInputChange}
            className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
          />
          <label htmlFor="taxExempt" className="ml-2 block text-sm">
            Tax Exempt
          </label>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium mb-1">
            Note
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

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
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
        <div>
          {customerId && (
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
            {isSaving ? 'Saving...' : customerId ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <DualView
      title={customerId ? 'Edit Customer' : 'Create Customer'}
      presentationView={renderForm()}
      rawData={customer || formData}
      defaultView="presentation"
    />
  );
};

export default CustomerForm;
