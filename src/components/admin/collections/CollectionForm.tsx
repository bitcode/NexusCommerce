import React, { useState, useEffect, useRef } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CollectionFormProps {
  collectionId?: string;
  onSave?: (collection: any) => void;
  onCancel?: () => void;
  onDelete?: (collectionId: string) => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
  collectionId,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { collections } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    descriptionHtml: '',
    isAutomated: false,
    ruleSet: {
      appliedDisjunctively: true,
      rules: [{ column: 'TITLE', relation: 'CONTAINS', condition: '' }],
    },
    sortOrder: 'MANUAL',
    image: null,
    seo: {
      title: '',
      description: '',
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch collection data if editing an existing collection
  useEffect(() => {
    if (collectionId) {
      setIsLoading(true);
      setError(null);

      collections.getCollection(collectionId)
        .then((data) => {
          setCollection(data);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            descriptionHtml: data.descriptionHtml || '',
            isAutomated: !!data.ruleSet,
            ruleSet: data.ruleSet || {
              appliedDisjunctively: true,
              rules: [{ column: 'TITLE', relation: 'CONTAINS', condition: '' }],
            },
            sortOrder: data.sortOrder || 'MANUAL',
            image: data.image || null,
            seo: {
              title: data.seo?.title || '',
              description: data.seo?.description || '',
            },
          });

          if (data.image?.url) {
            setImagePreview(data.image.url);
          }
        })
        .catch((err) => {
          setError(`Failed to load collection: ${err.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [collectionId, collections]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          [seoField]: value,
        },
      });
    } else if (name === 'isAutomated') {
      setFormData({
        ...formData,
        isAutomated: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRuleSetChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>, index: number, field: string) => {
    const newRuleSet = { ...formData.ruleSet };
    const newRules = [...newRuleSet.rules];
    
    newRules[index] = {
      ...newRules[index],
      [field]: e.target.value,
    };
    
    newRuleSet.rules = newRules;
    
    setFormData({
      ...formData,
      ruleSet: newRuleSet,
    });
  };

  const handleAddRule = () => {
    const newRuleSet = { ...formData.ruleSet };
    newRuleSet.rules = [
      ...newRuleSet.rules,
      { column: 'TITLE', relation: 'CONTAINS', condition: '' },
    ];
    
    setFormData({
      ...formData,
      ruleSet: newRuleSet,
    });
  };

  const handleRemoveRule = (index: number) => {
    const newRuleSet = { ...formData.ruleSet };
    newRuleSet.rules = newRuleSet.rules.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      ruleSet: newRuleSet,
    });
  };

  const handleDisjunctiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRuleSet = { ...formData.ruleSet };
    newRuleSet.appliedDisjunctively = e.target.checked;
    
    setFormData({
      ...formData,
      ruleSet: newRuleSet,
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // In a real implementation, you would upload the image to Shopify
      // For now, we'll just store the file for form submission
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      image: null,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Prepare the input data
      const input: any = {
        title: formData.title,
        descriptionHtml: formData.descriptionHtml || formData.description,
        sortOrder: formData.sortOrder,
        seo: {
          title: formData.seo.title,
          description: formData.seo.description,
        },
      };

      // Add ruleSet if this is an automated collection
      if (formData.isAutomated && formData.ruleSet.rules.length > 0) {
        input.ruleSet = {
          appliedDisjunctively: formData.ruleSet.appliedDisjunctively,
          rules: formData.ruleSet.rules.filter(rule => rule.condition.trim() !== ''),
        };
      }

      // In a real implementation, you would handle image upload here
      // For now, we'll just simulate it
      if (formData.image && formData.image instanceof File) {
        // Simulate image upload
        console.log('Would upload image:', formData.image.name);
        // In a real implementation, you would upload the image and get a URL back
        // input.image = { src: uploadedImageUrl };
      }

      let savedCollection;
      if (collectionId) {
        // Update existing collection
        savedCollection = await collections.updateCollection(collectionId, input);
      } else {
        // Create new collection
        savedCollection = await collections.createCollection(input);
      }

      if (onSave) {
        onSave(savedCollection);
      }
    } catch (err: any) {
      setError(`Failed to save collection: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (collectionId && onDelete) {
      onDelete(collectionId);
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
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          />
        </div>

        <div>
          <label htmlFor="descriptionHtml" className="block text-sm font-medium mb-1">
            HTML Description
          </label>
          <textarea
            id="descriptionHtml"
            name="descriptionHtml"
            value={formData.descriptionHtml}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isAutomated"
              name="isAutomated"
              checked={formData.isAutomated}
              onChange={handleInputChange}
              className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
            />
            <label htmlFor="isAutomated" className="ml-2 block text-sm font-medium">
              Automated Collection
            </label>
          </div>

          {formData.isAutomated && (
            <div className="space-y-4 p-4 border border-light-ui dark:border-dark-ui rounded-md">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="appliedDisjunctively"
                  checked={formData.ruleSet.appliedDisjunctively}
                  onChange={handleDisjunctiveChange}
                  className="h-4 w-4 text-light-accent dark:text-dark-accent border-light-ui dark:border-dark-ui rounded"
                />
                <label htmlFor="appliedDisjunctively" className="ml-2 block text-sm font-medium">
                  Products must match any condition (OR)
                </label>
              </div>
              <div className="text-sm text-light-fg dark:text-dark-fg opacity-70 mb-4">
                {formData.ruleSet.appliedDisjunctively
                  ? 'Products will be added to this collection when they match any of the conditions below.'
                  : 'Products will be added to this collection only when they match all of the conditions below.'}
              </div>

              {formData.ruleSet.rules.map((rule, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2 p-2 border border-light-ui dark:border-dark-ui rounded-md">
                  <select
                    value={rule.column}
                    onChange={(e) => handleRuleSetChange(e, index, 'column')}
                    className="px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  >
                    <option value="TITLE">Product title</option>
                    <option value="TYPE">Product type</option>
                    <option value="VENDOR">Product vendor</option>
                    <option value="VARIANT_PRICE">Product price</option>
                    <option value="TAG">Product tag</option>
                    <option value="VARIANT_COMPARE_AT_PRICE">Compare at price</option>
                    <option value="VARIANT_WEIGHT">Weight</option>
                    <option value="VARIANT_INVENTORY">Inventory stock</option>
                  </select>

                  <select
                    value={rule.relation}
                    onChange={(e) => handleRuleSetChange(e, index, 'relation')}
                    className="px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  >
                    {rule.column === 'VARIANT_PRICE' || rule.column === 'VARIANT_COMPARE_AT_PRICE' || rule.column === 'VARIANT_WEIGHT' || rule.column === 'VARIANT_INVENTORY' ? (
                      <>
                        <option value="EQUALS">is equal to</option>
                        <option value="NOT_EQUALS">is not equal to</option>
                        <option value="GREATER_THAN">is greater than</option>
                        <option value="LESS_THAN">is less than</option>
                      </>
                    ) : (
                      <>
                        <option value="EQUALS">equals</option>
                        <option value="NOT_EQUALS">does not equal</option>
                        <option value="CONTAINS">contains</option>
                        <option value="NOT_CONTAINS">does not contain</option>
                        <option value="STARTS_WITH">starts with</option>
                        <option value="ENDS_WITH">ends with</option>
                      </>
                    )}
                  </select>

                  <input
                    type="text"
                    value={rule.condition}
                    onChange={(e) => handleRuleSetChange(e, index, 'condition')}
                    placeholder="Condition"
                    className="flex-1 px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveRule(index)}
                    className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddRule}
                className="mt-2"
              >
                Add Condition
              </Button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium mb-1">
            Sort Order
          </label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
          >
            <option value="MANUAL">Manually</option>
            <option value="BEST_SELLING">Best selling</option>
            <option value="ALPHA_ASC">Alphabetically: A-Z</option>
            <option value="ALPHA_DESC">Alphabetically: Z-A</option>
            <option value="PRICE_DESC">Highest price</option>
            <option value="PRICE_ASC">Lowest price</option>
            <option value="CREATED_DESC">Newest</option>
            <option value="CREATED">Oldest</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Collection Image
          </label>
          <div className="mt-1 flex items-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Collection"
                  className="h-32 w-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImageClick}
                className="h-32 w-32 border-2 border-dashed border-light-ui dark:border-dark-ui rounded-md flex items-center justify-center text-light-fg dark:text-dark-fg hover:border-light-accent dark:hover:border-dark-accent"
              >
                <svg className="h-12 w-12 text-light-ui dark:text-dark-ui" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="border-t border-light-ui dark:border-dark-ui pt-4">
          <h3 className="text-lg font-medium mb-3">SEO</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="seo.title" className="block text-sm font-medium mb-1">
                SEO Title
              </label>
              <input
                type="text"
                id="seo.title"
                name="seo.title"
                value={formData.seo.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>

            <div>
              <label htmlFor="seo.description" className="block text-sm font-medium mb-1">
                SEO Description
              </label>
              <textarea
                id="seo.description"
                name="seo.description"
                value={formData.seo.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-light-ui dark:border-dark-ui rounded-md bg-light-bg dark:bg-dark-bg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-light-ui dark:border-dark-ui">
        <div>
          {collectionId && (
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
            {isSaving ? 'Saving...' : collectionId ? 'Update Collection' : 'Create Collection'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <DualView
      title={collectionId ? 'Edit Collection' : 'Create Collection'}
      presentationView={renderForm()}
      rawData={collection || formData}
      defaultView="presentation"
    />
  );
};

export default CollectionForm;
