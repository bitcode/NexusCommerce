/**
 * CollectionsManagerUI.ts
 * UI components for the CollectionsManager
 */

import { Collection } from '../../../types/ShopifyResourceTypes';
import { CollectionFilters } from './CollectionsManager';

/**
 * Renders the collections list HTML
 * 
 * @param collections - Array of collections
 * @param hasNextPage - Whether there are more collections
 * @param filters - Current filters
 * @returns HTML string for the collections list
 */
export function renderCollectionsListHTML(
  collections: Collection[],
  hasNextPage: boolean,
  filters: CollectionFilters = {}
): string {
  return `
    <div class="collections-manager">
      <div class="filters-bar">
        <div class="search-box">
          <input type="text" placeholder="Search collections..." value="${filters.query || ''}" id="collection-search">
          <button class="search-button">Search</button>
        </div>
        
        <div class="filter-controls">
          <select id="type-filter">
            <option value="ALL" ${filters.collectionType === 'ALL' ? 'selected' : ''}>All Types</option>
            <option value="SMART" ${filters.collectionType === 'SMART' ? 'selected' : ''}>Smart Collections</option>
            <option value="CUSTOM" ${filters.collectionType === 'CUSTOM' ? 'selected' : ''}>Custom Collections</option>
          </select>
          
          <select id="sort-filter">
            <option value="title-asc" ${filters.sortField === 'title' && filters.sortDirection === 'asc' ? 'selected' : ''}>Title A-Z</option>
            <option value="title-desc" ${filters.sortField === 'title' && filters.sortDirection === 'desc' ? 'selected' : ''}>Title Z-A</option>
            <option value="createdAt-desc" ${filters.sortField === 'createdAt' && filters.sortDirection === 'desc' ? 'selected' : ''}>Newest</option>
            <option value="createdAt-asc" ${filters.sortField === 'createdAt' && filters.sortDirection === 'asc' ? 'selected' : ''}>Oldest</option>
            <option value="updatedAt-desc" ${filters.sortField === 'updatedAt' && filters.sortDirection === 'desc' ? 'selected' : ''}>Recently Updated</option>
          </select>
        </div>
      </div>
      
      <div class="collections-list">
        <div class="collections-grid">
          ${collections.length > 0 ? collections.map(collection => `
            <div class="collection-card" data-collection-id="${collection.id}">
              <div class="collection-image">
                ${collection.image 
                  ? `<img src="${collection.image.src}" alt="${collection.image.altText || collection.title}">` 
                  : '<div class="no-image">No image</div>'}
              </div>
              <div class="collection-details">
                <h3 class="collection-title">${collection.title}</h3>
                <div class="collection-type">
                  <span class="type-badge ${collection.ruleSet ? 'type-smart' : 'type-custom'}">
                    ${collection.ruleSet ? 'Smart Collection' : 'Custom Collection'}
                  </span>
                </div>
                <div class="collection-actions">
                  <button class="view-button" data-collection-id="${collection.id}">View Products</button>
                  <button class="edit-button" data-collection-id="${collection.id}">Edit</button>
                  <button class="delete-button" data-collection-id="${collection.id}">Delete</button>
                </div>
              </div>
            </div>
          `).join('') : `
            <div class="no-collections">
              <p>No collections found</p>
              <button class="create-collection-button">Create Collection</button>
            </div>
          `}
        </div>
      </div>
      
      ${hasNextPage ? `
        <div class="pagination">
          <button class="load-more-button">Load More</button>
        </div>
      ` : ''}
    </div>
    
    <style>
      .collections-manager {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      .filters-bar {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      
      .search-box {
        display: flex;
        gap: 10px;
      }
      
      .search-box input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 250px;
      }
      
      .search-button {
        background-color: #5c6ac4;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .filter-controls {
        display: flex;
        gap: 10px;
      }
      
      .filter-controls select {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .collections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .collection-card {
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .collection-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .collection-image {
        height: 160px;
        background-color: #f9fafb;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .collection-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .no-image {
        color: #637381;
        font-size: 14px;
      }
      
      .collection-details {
        padding: 15px;
      }
      
      .collection-title {
        margin: 0 0 10px 0;
        font-size: 16px;
        color: #212b36;
      }
      
      .collection-type {
        margin-bottom: 15px;
      }
      
      .type-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .type-smart {
        background-color: #e3f1df;
        color: #108043;
      }
      
      .type-custom {
        background-color: #f9fafb;
        color: #637381;
      }
      
      .collection-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .view-button, .edit-button, .delete-button {
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      
      .view-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        flex: 1;
      }
      
      .edit-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
      }
      
      .delete-button {
        background-color: #fff4f4;
        border: 1px solid #fadada;
        color: #de3618;
      }
      
      .no-collections {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        background-color: #f9fafb;
        border-radius: 8px;
        color: #637381;
      }
      
      .create-collection-button {
        background-color: #5c6ac4;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }
      
      .pagination {
        margin-top: 20px;
        text-align: center;
      }
      
      .load-more-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  `;
}

/**
 * Renders the collection form HTML
 * 
 * @param collection - Collection to edit (undefined for new collection)
 * @returns HTML string for the collection form
 */
export function renderCollectionFormHTML(collection?: Collection): string {
  const isNew = !collection;
  const isSmartCollection = collection?.ruleSet !== undefined;
  const title = isNew ? 'Create Collection' : `Edit Collection: ${collection?.title}`;
  
  return `
    <div class="collection-form">
      <h2>${title}</h2>
      
      <form id="collection-form" data-collection-id="${collection?.id || ''}">
        <div class="form-section">
          <h3>Basic Details</h3>
          
          <div class="form-group">
            <label for="collection-title">Title</label>
            <input type="text" id="collection-title" name="title" value="${collection?.title || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="collection-description">Description</label>
            <textarea id="collection-description" name="description" rows="4">${collection?.description || ''}</textarea>
          </div>
          
          ${isNew ? `
            <div class="form-group">
              <label>Collection Type</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="collectionType" value="custom" checked>
                  Custom Collection (manually add products)
                </label>
                <label class="radio-label">
                  <input type="radio" name="collectionType" value="smart">
                  Smart Collection (automatically add products based on conditions)
                </label>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div id="smart-collection-rules" class="form-section" ${isNew || !isSmartCollection ? 'style="display: none;"' : ''}>
          <h3>Collection Rules</h3>
          <p class="section-description">Products that match these conditions will be automatically added to this collection.</p>
          
          <div class="rules-container">
            ${collection?.ruleSet?.rules ? collection.ruleSet.rules.map((rule, index) => `
              <div class="rule-row" data-rule-index="${index}">
                <div class="rule-fields">
                  <select name="rules[${index}][column]" class="rule-column">
                    <option value="title" ${rule.column === 'title' ? 'selected' : ''}>Product title</option>
                    <option value="type" ${rule.column === 'type' ? 'selected' : ''}>Product type</option>
                    <option value="vendor" ${rule.column === 'vendor' ? 'selected' : ''}>Product vendor</option>
                    <option value="variant_price" ${rule.column === 'variant_price' ? 'selected' : ''}>Product price</option>
                    <option value="tag" ${rule.column === 'tag' ? 'selected' : ''}>Product tag</option>
                    <option value="variant_compare_at_price" ${rule.column === 'variant_compare_at_price' ? 'selected' : ''}>Compare at price</option>
                    <option value="variant_weight" ${rule.column === 'variant_weight' ? 'selected' : ''}>Weight</option>
                    <option value="variant_inventory" ${rule.column === 'variant_inventory' ? 'selected' : ''}>Inventory stock</option>
                  </select>
                  
                  <select name="rules[${index}][relation]" class="rule-relation">
                    <option value="equals" ${rule.relation === 'equals' ? 'selected' : ''}>equals</option>
                    <option value="not_equals" ${rule.relation === 'not_equals' ? 'selected' : ''}>does not equal</option>
                    <option value="greater_than" ${rule.relation === 'greater_than' ? 'selected' : ''}>is greater than</option>
                    <option value="less_than" ${rule.relation === 'less_than' ? 'selected' : ''}>is less than</option>
                    <option value="starts_with" ${rule.relation === 'starts_with' ? 'selected' : ''}>starts with</option>
                    <option value="ends_with" ${rule.relation === 'ends_with' ? 'selected' : ''}>ends with</option>
                    <option value="contains" ${rule.relation === 'contains' ? 'selected' : ''}>contains</option>
                    <option value="not_contains" ${rule.relation === 'not_contains' ? 'selected' : ''}>does not contain</option>
                  </select>
                  
                  <input type="text" name="rules[${index}][condition]" class="rule-condition" value="${rule.condition || ''}">
                </div>
                
                <button type="button" class="remove-rule-button">Remove</button>
              </div>
            `).join('') : `
              <div class="rule-row" data-rule-index="0">
                <div class="rule-fields">
                  <select name="rules[0][column]" class="rule-column">
                    <option value="title">Product title</option>
                    <option value="type">Product type</option>
                    <option value="vendor">Product vendor</option>
                    <option value="variant_price">Product price</option>
                    <option value="tag">Product tag</option>
                    <option value="variant_compare_at_price">Compare at price</option>
                    <option value="variant_weight">Weight</option>
                    <option value="variant_inventory">Inventory stock</option>
                  </select>
                  
                  <select name="rules[0][relation]" class="rule-relation">
                    <option value="equals">equals</option>
                    <option value="not_equals">does not equal</option>
                    <option value="greater_than">is greater than</option>
                    <option value="less_than">is less than</option>
                    <option value="starts_with">starts with</option>
                    <option value="ends_with">ends with</option>
                    <option value="contains">contains</option>
                    <option value="not_contains">does not contain</option>
                  </select>
                  
                  <input type="text" name="rules[0][condition]" class="rule-condition" value="">
                </div>
                
                <button type="button" class="remove-rule-button">Remove</button>
              </div>
            `}
          </div>
          
          <div class="rule-actions">
            <button type="button" class="add-rule-button">Add another condition</button>
            
            <div class="disjunctive-option">
              <label>
                <input type="radio" name="disjunctive" value="false" ${collection?.ruleSet?.appliedDisjunctively === false ? 'checked' : ''} ${!collection?.ruleSet ? 'checked' : ''}>
                Products must match all conditions
              </label>
              <label>
                <input type="radio" name="disjunctive" value="true" ${collection?.ruleSet?.appliedDisjunctively === true ? 'checked' : ''}>
                Products can match any condition
              </label>
            </div>
          </div>
        </div>
        
        <div id="custom-collection-products" class="form-section" ${isNew || isSmartCollection ? 'style="display: none;"' : ''}>
          <h3>Collection Products</h3>
          <p class="section-description">Manage the products in this collection.</p>
          
          <div class="product-search">
            <input type="text" id="product-search-input" placeholder="Search for products to add...">
            <button type="button" class="search-products-button">Search</button>
          </div>
          
          <div class="product-search-results" style="display: none;">
            <h4>Search Results</h4>
            <div class="search-results-list"></div>
          </div>
          
          <div class="collection-products">
            <h4>Products in this Collection</h4>
            <div class="collection-products-list">
              <div class="loading-placeholder">Loading products...</div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Collection Image</h3>
          
          <div class="image-upload">
            <div class="current-image">
              ${collection?.image ? `
                <img src="${collection.image.src}" alt="${collection.image.altText || collection.title}">
              ` : `
                <div class="no-image-placeholder">No image selected</div>
              `}
            </div>
            
            <div class="image-actions">
              <button type="button" class="upload-image-button">Upload Image</button>
              ${collection?.image ? `<button type="button" class="remove-image-button">Remove Image</button>` : ''}
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-button">Cancel</button>
          <button type="submit" class="save-button">${isNew ? 'Create Collection' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
    
    <style>
      .collection-form {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      .form-section {
        margin-bottom: 30px;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      
      .form-section h3 {
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        color: #212b36;
      }
      
      .section-description {
        margin-top: -10px;
        margin-bottom: 20px;
        color: #637381;
        font-size: 14px;
      }
      
      .form-group {
        margin-bottom: 15px;
      }
      
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #212b36;
      }
      
      input[type="text"],
      textarea,
      select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .radio-group {
        margin-top: 5px;
      }
      
      .radio-label {
        display: block;
        margin-bottom: 10px;
        font-weight: normal;
      }
      
      .radio-label input[type="radio"] {
        margin-right: 8px;
      }
      
      .rule-row {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        align-items: center;
      }
      
      .rule-fields {
        display: flex;
        gap: 10px;
        flex: 1;
      }
      
      .rule-column, .rule-relation {
        min-width: 150px;
      }
      
      .rule-condition {
        flex: 1;
      }
      
      .remove-rule-button {
        background-color: #fff4f4;
        border: 1px solid #fadada;
        color: #de3618;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .rule-actions {
        margin-top: 20px;
      }
      
      .add-rule-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 15px;
      }
      
      .disjunctive-option {
        margin-top: 15px;
      }
      
      .disjunctive-option label {
        display: block;
        margin-bottom: 10px;
        font-weight: normal;
      }
      
      .product-search {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .search-products-button {
        background-color: #5c6ac4;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .search-results-list, .collection-products-list {
        margin-top: 10px;
        border: 1px solid #eee;
        border-radius: 4px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .loading-placeholder {
        padding: 20px;
        text-align: center;
        color: #637381;
      }
      
      .image-upload {
        display: flex;
        gap: 20px;
        align-items: flex-start;
      }
      
      .current-image {
        width: 200px;
        height: 200px;
        background-color: #f9fafb;
        border: 1px dashed #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .current-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .no-image-placeholder {
        color: #637381;
        font-size: 14px;
      }
      
      .image-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .upload-image-button, .remove-image-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .remove-image-button {
        background-color: #fff4f4;
        border: 1px solid #fadada;
        color: #de3618;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      
      .cancel-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .save-button {
        background-color: #5c6ac4;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  `;
}

/**
 * Renders the collection products list HTML
 * 
 * @param products - Array of products
 * @param hasNextPage - Whether there are more products
 * @returns HTML string for the collection products list
 */
export function renderCollectionProductsHTML(products: any[], hasNextPage: boolean): string {
  if (products.length === 0) {
    return `
      <div class="no-products">
        <p>No products in this collection</p>
      </div>
    `;
  }
  
  return `
    <div class="collection-products-table">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Product</th>
            <th>Type</th>
            <th>Vendor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr data-product-id="${product.id}">
              <td class="product-image">
                ${product.images?.edges?.length > 0 
                  ? `<img src="${product.images.edges[0].node.src}" alt="${product.images.edges[0].node.altText || product.title}" width="40">` 
                  : '<div class="no-image"></div>'}
              </td>
              <td class="product-title">${product.title}</td>
              <td class="product-type">${product.productType || '-'}</td>
              <td class="product-vendor">${product.vendor || '-'}</td>
              <td class="product-actions">
                <button class="remove-product-button" data-product-id="${product.id}">Remove</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${hasNextPage ? `
        <div class="load-more">
          <button class="load-more-products-button">Load More Products</button>
        </div>
      ` : ''}
    </div>
    
    <style>
      .collection-products-table {
        width: 100%;
      }
      
      .collection-products-table table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .collection-products-table th, .collection-products-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .collection-products-table th {
        background-color: #f9fafb;
        font-weight: 500;
      }
      
      .product-image {
        width: 50px;
      }
      
      .no-image {
        width: 40px;
        height: 40px;
        background-color: #f1f1f1;
        border-radius: 4px;
      }
      
      .remove-product-button {
        background-color: #fff4f4;
        border: 1px solid #fadada;
        color: #de3618;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .no-products {
        padding: 20px;
        text-align: center;
        color: #637381;
      }
      
      .load-more {
        margin-top: 15px;
        text-align: center;
      }
      
      .load-more-products-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  `;
}