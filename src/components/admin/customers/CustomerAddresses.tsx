import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import CustomerAddressForm from './CustomerAddressForm';

export interface CustomerAddressesProps {
  customerId: string;
  onBack?: () => void;
}

const CustomerAddresses: React.FC<CustomerAddressesProps> = ({
  customerId,
  onBack,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Fetch customer addresses
  const fetchAddresses = () => {
    setIsLoading(true);
    setError(null);

    customers.getCustomerAddresses(customerId, { first: 50 })
      .then((data) => {
        if (data && data.edges) {
          const fetchedAddresses = data.edges.map((edge: any) => edge.node);
          setAddresses(fetchedAddresses);
          
          if (data.defaultAddress) {
            setDefaultAddressId(data.defaultAddress.id);
          }
          
          setCustomer({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        }
      })
      .catch((err) => {
        setError(`Failed to load customer addresses: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchAddresses();
  }, [customerId]);

  // Handle address save
  const handleAddressSave = () => {
    setEditingAddressId(null);
    setIsAddingAddress(false);
    fetchAddresses();
  };

  // Handle address delete
  const handleAddressDelete = async (addressId: string) => {
    try {
      await customers.deleteCustomerAddress(addressId);
      fetchAddresses();
    } catch (err: any) {
      setError(`Failed to delete address: ${err.message}`);
    }
  };

  // Handle set default address
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await customers.setDefaultCustomerAddress(customerId, addressId);
      setDefaultAddressId(addressId);
    } catch (err: any) {
      setError(`Failed to set default address: ${err.message}`);
    }
  };

  // Render the addresses list with dual-view capability
  const renderAddressesList = () => (
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

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Addresses</h3>
        <Button
          variant="primary"
          onClick={() => {
            setIsAddingAddress(true);
            setEditingAddressId(null);
          }}
        >
          Add Address
        </Button>
      </div>

      {isAddingAddress ? (
        <CustomerAddressForm
          customerId={customerId}
          onSave={handleAddressSave}
          onCancel={() => setIsAddingAddress(false)}
        />
      ) : editingAddressId ? (
        <CustomerAddressForm
          customerId={customerId}
          addressId={editingAddressId}
          onSave={handleAddressSave}
          onCancel={() => setEditingAddressId(null)}
          onDelete={handleAddressDelete}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="col-span-2 text-center py-8 border border-dashed border-light-ui dark:border-dark-ui rounded-md">
              <p className="text-light-fg dark:text-dark-fg opacity-70">
                {isLoading ? 'Loading addresses...' : 'No addresses found for this customer'}
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 border rounded-md ${
                  address.id === defaultAddressId
                    ? 'border-light-accent dark:border-dark-accent'
                    : 'border-light-ui dark:border-dark-ui'
                }`}
              >
                {address.id === defaultAddressId && (
                  <div className="mb-2 text-xs font-medium text-light-accent dark:text-dark-accent">
                    Default Address
                  </div>
                )}
                
                <div className="mb-3">
                  <div className="font-medium">
                    {address.firstName} {address.lastName}
                  </div>
                  {address.company && (
                    <div className="text-sm">{address.company}</div>
                  )}
                  <div className="text-sm whitespace-pre-line">
                    {address.formatted}
                  </div>
                  {address.phone && (
                    <div className="text-sm mt-1">{address.phone}</div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => setEditingAddressId(address.id)}
                    className="text-sm py-1"
                  >
                    Edit
                  </Button>
                  
                  {address.id !== defaultAddressId && (
                    <Button
                      variant="outline"
                      onClick={() => handleSetDefaultAddress(address.id)}
                      className="text-sm py-1"
                    >
                      Set as Default
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isAddingAddress && !editingAddressId && (
        <div className="flex justify-start pt-4 border-t border-light-ui dark:border-dark-ui">
          <Button variant="secondary" onClick={onBack}>
            Back to Customer
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <DualView
      title="Customer Addresses"
      presentationView={renderAddressesList()}
      rawData={{ customerId, customer, addresses, defaultAddressId }}
      defaultView="presentation"
    />
  );
};

export default CustomerAddresses;
