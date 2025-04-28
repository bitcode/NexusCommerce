import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CustomerAddressFormProps {
  customerId: string;
  addressId?: string;
  onSave?: (address: any) => void;
  onCancel?: () => void;
  onDelete?: (addressId: string) => void;
}

const CustomerAddressForm: React.FC<CustomerAddressFormProps> = ({
  customerId,
  addressId,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
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
    default: false,
  });

  // Fetch address data if editing an existing address
  useEffect(() => {
    if (customerId && addressId) {
      setIsLoading(true);
      setError(null);

      customers.getCustomerAddresses(customerId)
        .then((data) => {
          if (data && data.edges) {
            const addressNode = data.edges.find((edge: any) => edge.node.id === addressId)?.node;
            
            if (addressNode) {
              setAddress(addressNode);
              setFormData({
                firstName: addressNode.firstName || '',
                lastName: addressNode.lastName || '',
                company: addressNode.company || '',
                address1: addressNode.address1 || '',
                address2: addressNode.address2 || '',
                city: addressNode.city || '',
                province: addressNode.province || '',
                zip: addressNode.zip || '',
                country: addressNode.country || '',
                phone: addressNode.phone || '',
                default: addressNode.default || false,
              });
            } else {
              setError('Address not found');
            }
          }
        })
        .catch((err) => {
          setError(`Failed to load address: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [customerId, addressId, customers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        company: formData.company,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        province: formData.province,
        zip: formData.zip,
        country: formData.country,
        phone: formData.phone,
      };

      let savedAddress;
      if (addressId) {
        // Update existing address
        savedAddress = await customers.updateCustomerAddress(addressId, input);
      } else {
        // Create new address
        savedAddress = await customers.createCustomerAddress(customerId, input);
      }

      // Set as default address if needed
      if (formData.default && savedAddress && savedAddress.id) {
        await customers.setDefaultCustomerAddress(customerId, savedAddress.id);
      }

      if (onSave) {
        onSave(savedAddress);
      }
    } catch (err: any) {
      setError(`Failed to save address: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (addressId && onDelete) {
      onDelete(addressId);
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
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="address1" className="block text-sm font-medium mb-1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address1"
            name="address1"
            value={formData.address1}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="address2" className="block text-sm font-medium mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            id="address2"
            name="address2"
            value={formData.address2}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium mb-1">
              State/Province <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="province"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium mb-1">
              ZIP/Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
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
            id="default"
            name="default"
            checked={formData.default}
            onChange={handleInputChange}
            className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
          />
          <label htmlFor="default" className="ml-2 block text-sm">
            Set as default address
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
        <div>
          {addressId && (
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
            {isSaving ? 'Saving...' : addressId ? 'Update Address' : 'Add Address'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <DualView
      title={addressId ? 'Edit Address' : 'Add Address'}
      presentationView={renderForm()}
      rawData={address || formData}
      defaultView="presentation"
    />
  );
};

export default CustomerAddressForm;
