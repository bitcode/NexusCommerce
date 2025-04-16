/**
 * ProductsManagerUI.ts
 * UI components for the ProductsManager
 */

import { Product, ProductVariant } from '../../../types/ShopifyResourceTypes';
import { ProductFilters } from './ProductsManager';

/**
 * Renders the products list HTML
 * 
 * @param products - Array of products
 * @param hasNextPage - Whether there are more products
 * @param filters - Current filters
 * @returns HTML string for the products list
 */
export function renderProductsListHTML(
  products: Product[],
  hasNextPage: boolean,
  filters: ProductFilters = {}
): string {
  return `
    <div class="products-manager">
      <div class="filters-bar">
        <div class="search-box">
          <input type="text" placeholder="Search products..." value="${filters.query || ''}" id="product-search">
          <button class="search-button">Search</button>
        </div>
        
        <div class="filter-controls">
          <select id="status-filter">
            <option value="ALL" ${filters.status === 'ALL' ? 'selected' : ''}>All Status</option>
            <option value="ACTIVE" ${filters.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="DRAFT" ${filters.status === 'DRAFT' ? 'selected' : ''}>Draft</option>
            <option value="ARCHIVED" ${filters.status === 'ARCHIVED' ? 'selected' : ''}>Archived</option>
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
      
      <div class="products-list">
        <table class="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Type</th>
              <th>Vendor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.length > 0 ? products.map(product => `
              <tr data-product-id="${product.id}">
                <td class="product-image">
                  ${product.images && product.images.length > 0 
                    ? `<img src="${product.images[0].src}" alt="${product.images[0].altText || product.title}" width="50">` 
                    : '<div class="no-image">No image</div>'}
                </td>
                <td class="product-title">${product.title}</td>
                <td class="product-status"><span class="status-badge status-${product.status?.toLowerCase() || 'active'}">${product.status || 'ACTIVE'}</span></td>
                <td class="product-inventory">${product.variants ? product.variants.length : 0} variants</td>
                <td class="product-type">${product.productType || '-'}</td>
                <td class="product-vendor">${product.vendor || '-'}</td>
                <td class="product-actions">
                  <button class="edit-button" data-product-id="${product.id}">Edit</button>
                  <button class="delete-button" data-product-id="${product.id}">Delete</button>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7" class="no-products">No products found</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
      
      ${hasNextPage ? `
        <div class="pagination">
          <button class="load-more-button">Load More</button>
        </div>
      ` : ''}
    </div>
    
    <style>
      .products-manager {
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
      
      .products-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .products-table th, .products-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .products-table th {
        background-color: #f9fafb;
        font-weight: 500;
      }
      
      .product-image {
        width: 60px;
      }
      
      .no-image {
        width: 50px;
        height: 50px;
        background-color: #f1f1f1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #999;
        border-radius: 4px;
      }
      
      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .status-active {
        background-color: #e3f1df;
        color: #108043;
      }
      
      .status-draft {
        background-color: #f9fafb;
        color: #637381;
      }
      
      .status-archived {
        background-color: #fdf5e9;
        color: #c05717;
      }
      
      .product-actions {
        display: flex;
        gap: 8px;
      }
      
      .edit-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .delete-button {
        background-color: #fff4f4;
        border: 1px solid #fadada;
        color: #de3618;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .no-products {
        text-align: center;
        padding: 40px;
        color: #637381;
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
 * Renders the product form HTML
 * 
 * @param product - Product to edit (undefined for new product)
 * @returns HTML string for the product form
 */
export function renderProductFormHTML(product?: Product): string {
  const isNew = !product;
  const title = isNew ? 'Create Product' : `Edit Product: ${product?.title}`;
  
  return `
    <div class="product-form">
      <h2>${title}</h2>
      
      <form id="product-form" data-product-id="${product?.id || ''}">
        <div class="form-section">
          <h3>Basic Details</h3>
          
          <div class="form-group">
            <label for="product-title">Title</label>
            <input type="text" id="product-title" name="title" value="${product?.title || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="product-description">Description</label>
            <textarea id="product-description" name="description" rows="4">${product?.description || ''}</textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="product-vendor">Vendor</label>
              <input type="text" id="product-vendor" name="vendor" value="${product?.vendor || ''}">
            </div>
            
            <div class="form-group">
              <label for="product-type">Product Type</label>
              <input type="text" id="product-type" name="productType" value="${product?.productType || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label for="product-status">Status</label>
            <select id="product-status" name="status">
              <option value="ACTIVE" ${product?.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
              <option value="DRAFT" ${product?.status === 'DRAFT' ? 'selected' : ''}>Draft</option>
              <option value="ARCHIVED" ${product?.status === 'ARCHIVED' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="product-tags">Tags</label>
            <input type="text" id="product-tags" name="tags" value="${product?.tags?.join(', ') || ''}" placeholder="Comma-separated tags">
          </div>
        </div>
        
        ${!isNew ? `
          <div class="form-section">
            <h3>Variants</h3>
            
            <div class="variants-list">
              <table class="variants-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>SKU</th>
                    <th>Inventory</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${product?.variants && product.variants.length > 0 ? product.variants.map(variant => `
                    <tr data-variant-id="${variant.id}">
                      <td>${variant.title}</td>
                      <td>${variant.price}</td>
                      <td>${variant.sku || '-'}</td>
                      <td>${variant.inventoryQuantity !== undefined ? variant.inventoryQuantity : '-'}</td>
                      <td>
                        <button type="button" class="edit-variant-button" data-variant-id="${variant.id}">Edit</button>
                        <button type="button" class="delete-variant-button" data-variant-id="${variant.id}">Delete</button>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="5" class="no-variants">No variants</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
            
            <div class="variant-actions">
              <button type="button" class="add-variant-button">Add Variant</button>
            </div>
          </div>
        ` : ''}
        
        <div class="form-actions">
          <button type="button" class="cancel-button">Cancel</button>
          <button type="submit" class="save-button">${isNew ? 'Create Product' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
    
    <style>
      .product-form {
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
      
      .form-group {
        margin-bottom: 15px;
      }
      
      .form-row {
        display: flex;
        gap: 20px;
      }
      
      .form-row .form-group {
        flex: 1;
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
      
      .variants-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      
      .variants-table th, .variants-table td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .variants-table th {
        background-color: #f9fafb;
        font-weight: 500;
      }
      
      .no-variants {
        text-align: center;
        padding: 20px;
        color: #637381;
      }
      
      .variant-actions {
        margin-top: 15px;
      }
      
      .add-variant-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .edit-variant-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 5px;
      }
      
      .delete-variant-button {
        background-color: #fff4f4;
        border: 1px solid #fadada;
        color: #de3618;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
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
 * Renders the variant form HTML
 * 
 * @param variant - Variant to edit (undefined for new variant)
 * @param productOptions - Product options for variant selection
 * @returns HTML string for the variant form
 */
export function renderVariantFormHTML(variant?: ProductVariant, productOptions: { name: string, values: string[] }[] = []): string {
  const isNew = !variant;
  const title = isNew ? 'Add Variant' : `Edit Variant: ${variant?.title}`;
  
  return `
    <div class="variant-form-modal">
      <div class="variant-form-content">
        <div class="variant-form-header">
          <h3>${title}</h3>
          <button type="button" class="close-button">&times;</button>
        </div>
        
        <form id="variant-form" data-variant-id="${variant?.id || ''}">
          <div class="form-group">
            <label for="variant-title">Title</label>
            <input type="text" id="variant-title" name="title" value="${variant?.title || ''}" ${isNew ? '' : 'readonly'}>
          </div>
          
          ${productOptions.length > 0 && isNew ? `
            <div class="form-section">
              <h4>Options</h4>
              ${productOptions.map(option => `
                <div class="form-group">
                  <label for="option-${option.name}">${option.name}</label>
                  <select id="option-${option.name}" name="option-${option.name}">
                    ${option.values.map(value => `
                      <option value="${value}">${value}</option>
                    `).join('')}
                  </select>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="form-row">
            <div class="form-group">
              <label for="variant-price">Price</label>
              <input type="text" id="variant-price" name="price" value="${variant?.price || ''}" required>
            </div>
            
            <div class="form-group">
              <label for="variant-compare-at-price">Compare at Price</label>
              <input type="text" id="variant-compare-at-price" name="compareAtPrice" value="${variant?.compareAtPrice || ''}">
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="variant-sku">SKU</label>
              <input type="text" id="variant-sku" name="sku" value="${variant?.sku || ''}">
            </div>
            
            <div class="form-group">
              <label for="variant-inventory">Inventory Quantity</label>
              <input type="number" id="variant-inventory" name="inventoryQuantity" value="${variant?.inventoryQuantity !== undefined ? variant.inventoryQuantity : ''}">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-button">Cancel</button>
            <button type="submit" class="save-button">${isNew ? 'Add Variant' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
    
    <style>
      .variant-form-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .variant-form-content {
        background-color: white;
        border-radius: 8px;
        width: 500px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .variant-form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
      }
      
      .variant-form-header h3 {
        margin: 0;
      }
      
      .close-button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #637381;
      }
      
      #variant-form {
        padding: 20px;
      }
      
      .form-section h4 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #212b36;
      }
    </style>
  `;
}

/**
 * Renders the delete confirmation dialog HTML
 * 
 * @param itemType - Type of item to delete ('product' or 'variant')
 * @param itemName - Name of the item to delete
 * @returns HTML string for the delete confirmation dialog
 */
export function renderDeleteConfirmationHTML(itemType: 'product' | 'variant', itemName: string): string {
  return `
    <div class="delete-confirmation-modal">
      <div class="delete-confirmation-content">
        <div class="delete-confirmation-header">
          <h3>Delete ${itemType === 'product' ? 'Product' : 'Variant'}</h3>
          <button type="button" class="close-button">&times;</button>
        </div>
        
        <div class="delete-confirmation-body">
          <p>Are you sure you want to delete the ${itemType} "${itemName}"?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        
        <div class="delete-confirmation-actions">
          <button type="button" class="cancel-button">Cancel</button>
          <button type="button" class="delete-button">Delete</button>
        </div>
      </div>
    </div>
    
    <style>
      .delete-confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .delete-confirmation-content {
        background-color: white;
        border-radius: 8px;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .delete-confirmation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
      }
      
      .delete-confirmation-header h3 {
        margin: 0;
        color: #de3618;
      }
      
      .delete-confirmation-body {
        padding: 20px;
      }
      
      .warning-text {
        color: #de3618;
        font-weight: 500;
      }
      
      .delete-confirmation-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 15px 20px;
        border-top: 1px solid #eee;
      }
      
      .cancel-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .delete-button {
        background-color: #de3618;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  `;
}