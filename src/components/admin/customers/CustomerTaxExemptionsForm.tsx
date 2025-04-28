import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CustomerTaxExemptionsFormProps {
  customerId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

// Tax exemption types available in Shopify
const TAX_EXEMPTION_TYPES = [
  { value: 'EXEMPT_ALL', label: 'Exempt from all taxes' },
  { value: 'CA_STATUS_CARD_EXEMPTION', label: 'Status card tax exemption (CA)' },
  { value: 'CA_PROVINCIAL_EXEMPTION', label: 'Provincial tax exemption (CA)' },
  { value: 'CA_BC_RESELLER_EXEMPTION', label: 'BC reseller exemption (CA)' },
  { value: 'CA_MB_RESELLER_EXEMPTION', label: 'MB reseller exemption (CA)' },
  { value: 'CA_SK_RESELLER_EXEMPTION', label: 'SK reseller exemption (CA)' },
  { value: 'CA_BC_CONTRACTOR_EXEMPTION', label: 'BC contractor exemption (CA)' },
  { value: 'CA_MB_FARMER_EXEMPTION', label: 'MB farmer exemption (CA)' },
  { value: 'CA_NS_FARMER_EXEMPTION', label: 'NS farmer exemption (CA)' },
  { value: 'CA_SK_FARMER_EXEMPTION', label: 'SK farmer exemption (CA)' },
  { value: 'CA_BC_PRODUCTION_AND_MACHINERY_EXEMPTION', label: 'BC production and machinery exemption (CA)' },
  { value: 'CA_MB_PRODUCTION_AND_MACHINERY_EXEMPTION', label: 'MB production and machinery exemption (CA)' },
  { value: 'CA_NS_PRODUCTION_AND_MACHINERY_EXEMPTION', label: 'NS production and machinery exemption (CA)' },
  { value: 'CA_SK_PRODUCTION_AND_MACHINERY_EXEMPTION', label: 'SK production and machinery exemption (CA)' },
  { value: 'CA_QC_PRODUCTION_AND_MACHINERY_EXEMPTION', label: 'QC production and machinery exemption (CA)' },
  { value: 'CA_BC_SUB_CONTRACTOR_EXEMPTION', label: 'BC sub-contractor exemption (CA)' },
  { value: 'CA_SK_SUB_CONTRACTOR_EXEMPTION', label: 'SK sub-contractor exemption (CA)' },
  { value: 'CA_BC_EXEMPT_FUEL_EXEMPTION', label: 'BC exempt fuel exemption (CA)' },
  { value: 'CA_BC_EXEMPT_ELECTRICITY_EXEMPTION', label: 'BC exempt electricity exemption (CA)' },
  { value: 'US_EXEMPT_ALL', label: 'Exempt from all taxes (US)' },
  { value: 'US_RESELLER_EXEMPTION', label: 'Reseller exemption (US)' },
  { value: 'US_ENTITY_BASED_EXEMPTION', label: 'Entity-based exemption (US)' },
  { value: 'US_PRODUCT_BASED_EXEMPTION', label: 'Product-based exemption (US)' },
  { value: 'US_USE_BASED_EXEMPTION', label: 'Use-based exemption (US)' },
  { value: 'US_DIPLOMATIC_EXEMPTION', label: 'Diplomatic exemption (US)' },
  { value: 'US_CHARITABLE_ORGANIZATION_EXEMPTION', label: 'Charitable organization exemption (US)' },
  { value: 'US_RELIGIOUS_ORGANIZATION_EXEMPTION', label: 'Religious organization exemption (US)' },
  { value: 'US_EDUCATIONAL_ORGANIZATION_EXEMPTION', label: 'Educational organization exemption (US)' },
  { value: 'US_GOVERNMENT_ORGANIZATION_EXEMPTION', label: 'Government organization exemption (US)' },
  { value: 'US_COMMERCIAL_AGRICULTURAL_PRODUCTION_EXEMPTION', label: 'Commercial agricultural production exemption (US)' },
  { value: 'US_INDUSTRIAL_PRODUCTION_OR_MANUFACTURING_EXEMPTION', label: 'Industrial production or manufacturing exemption (US)' },
  { value: 'US_DIRECT_PAY_PERMIT_EXEMPTION', label: 'Direct pay permit exemption (US)' },
  { value: 'US_MULTIPLE_POINTS_OF_USE_EXEMPTION', label: 'Multiple points of use exemption (US)' },
  { value: 'US_DIRECT_MAIL_EXEMPTION', label: 'Direct mail exemption (US)' },
];

const CustomerTaxExemptionsForm: React.FC<CustomerTaxExemptionsFormProps> = ({
  customerId,
  onSave,
  onCancel,
}) => {
  const { customers } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>([]);
  const [taxExempt, setTaxExempt] = useState(false);

  // Fetch customer data to get current tax exemptions
  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      setError(null);

      customers.getCustomer(customerId)
        .then((data) => {
          setCustomer(data);
          setTaxExempt(data.taxExempt || false);
          setSelectedExemptions(data.taxExemptions || []);
        })
        .catch((err) => {
          setError(`Failed to load customer tax exemptions: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [customerId, customers]);

  const handleExemptionChange = (exemption: string, checked: boolean) => {
    if (checked) {
      setSelectedExemptions(prev => [...prev, exemption]);
    } else {
      setSelectedExemptions(prev => prev.filter(e => e !== exemption));
    }
  };

  const handleExemptAllChange = (checked: boolean) => {
    setTaxExempt(checked);
    
    if (checked) {
      // If exempt all is checked, add EXEMPT_ALL to the list
      if (!selectedExemptions.includes('EXEMPT_ALL')) {
        setSelectedExemptions(prev => [...prev, 'EXEMPT_ALL']);
      }
    } else {
      // If exempt all is unchecked, remove EXEMPT_ALL from the list
      setSelectedExemptions(prev => prev.filter(e => e !== 'EXEMPT_ALL'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Update customer tax exemptions
      await customers.updateCustomerTaxExemptions(customerId, selectedExemptions);
      
      if (onSave) {
        onSave();
      }
    } catch (err: any) {
      setError(`Failed to update tax exemptions: ${err.message}`);
    } finally {
      setIsSaving(false);
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
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="taxExempt"
            checked={taxExempt}
            onChange={(e) => handleExemptAllChange(e.target.checked)}
            className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
          />
          <label htmlFor="taxExempt" className="ml-2 block text-sm font-medium">
            Tax Exempt
          </label>
        </div>

        <div className="border-t border-light-ui dark:border-dark-ui pt-4">
          <h3 className="text-lg font-medium mb-3">Tax Exemptions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TAX_EXEMPTION_TYPES.map((exemption) => (
              <div key={exemption.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`exemption-${exemption.value}`}
                  checked={selectedExemptions.includes(exemption.value)}
                  onChange={(e) => handleExemptionChange(exemption.value, e.target.checked)}
                  className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                />
                <label htmlFor={`exemption-${exemption.value}`} className="ml-2 block text-sm">
                  {exemption.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-light-ui dark:border-dark-ui space-x-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Tax Exemptions'}
        </Button>
      </div>
    </form>
  );

  return (
    <DualView
      title="Customer Tax Exemptions"
      presentationView={renderForm()}
      rawData={{ customerId, taxExempt, taxExemptions: selectedExemptions }}
      defaultView="presentation"
    />
  );
};

export default CustomerTaxExemptionsForm;
