/**
 * InventoryManagerUI.ts
 * UI components for the InventoryManager
 */

import { InventoryItemWithLocations, Location, InventoryTransfer, InventoryFilters } from './InventoryManager';

/**
 * Gets the CSS class for a quantity
 * 
 * @param quantity - Inventory quantity
 * @returns CSS class
 */
function getQuantityClass(quantity: number): string {
  if (quantity === 0) {
    return 'quantity-out-of-stock';
  } else if (quantity <= 5) {
    return 'quantity-low-stock';
  } else {
    return 'quantity-in-stock';
  }
}

/**
 * Formats a transfer status for display
 * 
 * @param status - Transfer status
 * @returns Formatted status
 */
function formatTransferStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
}

/**
 * Renders the inventory list HTML
 * 
 * @param items - Array of inventory items
 * @param locations - Array of locations
 * @param hasNextPage - Whether there are more items
 * @param filters - Current filters
 * @returns HTML string for the inventory list
 */
export function renderInventoryListHTML(
  items: InventoryItemWithLocations[],
  locations: Location[],
  hasNextPage: boolean,
  filters: InventoryFilters = {}
): string {
  // Calculate total inventory for each item
  const itemsWithTotal = items.map(item => {
    const totalQuantity = item.locations.reduce((sum, loc) => sum + loc.available, 0);
    return { ...item, totalQuantity };
  });
  
  return `
    <div class="inventory-manager">
      <div class="filters-bar">
        <div class="search-box">
          <input type="text" placeholder="Search by SKU or product title..." value="${filters.query || ''}" id="inventory-search">
          <button class="search-button">Search</button>
        </div>
        
        <div class="filter-controls">
          <select id="location-filter">
            <option value="">All Locations</option>
            ${locations.map(location => `
              <option value="${location.id}" ${filters.locationId === location.id ? 'selected' : ''}>${location.name}</option>
            `).join('')}
          </select>
          
          <select id="status-filter">
            <option value="ALL" ${filters.status === 'ALL' ? 'selected' : ''}>All Status</option>
            <option value="IN_STOCK" ${filters.status === 'IN_STOCK' ? 'selected' : ''}>In Stock</option>
            <option value="OUT_OF_STOCK" ${filters.status === 'OUT_OF_STOCK' ? 'selected' : ''}>Out of Stock</option>
            <option value="LOW_STOCK" ${filters.status === 'LOW_STOCK' ? 'selected' : ''}>Low Stock</option>
          </select>
          
          <select id="sort-filter">
            <option value="title-asc" ${filters.sortField === 'title' && filters.sortDirection === 'asc' ? 'selected' : ''}>Product A-Z</option>
            <option value="title-desc" ${filters.sortField === 'title' && filters.sortDirection === 'desc' ? 'selected' : ''}>Product Z-A</option>
            <option value="sku-asc" ${filters.sortField === 'sku' && filters.sortDirection === 'asc' ? 'selected' : ''}>SKU A-Z</option>
            <option value="sku-desc" ${filters.sortField === 'sku' && filters.sortDirection === 'desc' ? 'selected' : ''}>SKU Z-A</option>
            <option value="quantity-desc" ${filters.sortField === 'quantity' && filters.sortDirection === 'desc' ? 'selected' : ''}>Highest Stock</option>
            <option value="quantity-asc" ${filters.sortField === 'quantity' && filters.sortDirection === 'asc' ? 'selected' : ''}>Lowest Stock</option>
          </select>
        </div>
      </div>
      
      <div class="inventory-actions">
        <button class="create-transfer-button">Create Transfer</button>
        <button class="bulk-update-button">Bulk Update</button>
      </div>
      
      <div class="inventory-list">
        <table class="inventory-table">
          <thead>
            <tr>
              <th class="checkbox-column"><input type="checkbox" id="select-all-items"></th>
              <th>Product</th>
              <th>SKU</th>
              <th>Total Inventory</th>
              ${locations.length <= 3 ? locations.map(location => `
                <th class="location-column">${location.name}</th>
              `).join('') : '<th class="location-column">Locations</th>'}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${itemsWithTotal.length > 0 ? itemsWithTotal.map(item => `
              <tr data-inventory-item-id="${item.id}">
                <td class="checkbox-column"><input type="checkbox" class="select-item" data-inventory-item-id="${item.id}"></td>
                <td class="product-info">
                  <div class="product-title">${item.variant.product.title}</div>
                  <div class="variant-title">${item.variant.title !== 'Default Title' ? item.variant.title : ''}</div>
                </td>
                <td class="sku">${item.sku || '-'}</td>
                <td class="total-quantity ${getQuantityClass(item.totalQuantity)}">${item.totalQuantity}</td>
                ${locations.length <= 3 ? locations.map(location => {
                  const locationData = item.locations.find(loc => loc.locationId === location.id);
                  const quantity = locationData ? locationData.available : 0;
                  return `<td class="location-quantity ${getQuantityClass(quantity)}">${quantity}</td>`;
                }).join('') : `
                  <td class="location-summary">
                    <button class="view-locations-button" data-inventory-item-id="${item.id}">View ${item.locations.length} locations</button>
                  </td>
                `}
                <td class="item-actions">
                  <button class="adjust-quantity-button" data-inventory-item-id="${item.id}">Adjust</button>
                  <button class="view-history-button" data-inventory-item-id="${item.id}">History</button>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="${5 + (locations.length <= 3 ? locations.length : 1)}" class="no-items">No inventory items found</td>
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
      .inventory-manager {
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
      
      .inventory-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .create-transfer-button, .bulk-update-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .create-transfer-button {
        background-color: #5c6ac4;
        color: white;
        border: none;
      }
      
      .inventory-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .inventory-table th, .inventory-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .inventory-table th {
        background-color: #f9fafb;
        font-weight: 500;
      }
      
      .checkbox-column {
        width: 40px;
        text-align: center;
      }
      
      .product-info {
        min-width: 200px;
      }
      
      .product-title {
        font-weight: 500;
        color: #212b36;
      }
      
      .variant-title {
        font-size: 12px;
        color: #637381;
        margin-top: 4px;
      }
      
      .sku {
        font-family: monospace;
        color: #637381;
      }
      
      .total-quantity, .location-quantity {
        font-weight: 500;
        text-align: center;
      }
      
      .quantity-in-stock {
        color: #108043;
      }
      
      .quantity-low-stock {
        color: #c05717;
      }
      
      .quantity-out-of-stock {
        color: #de3618;
      }
      
      .location-column {
        min-width: 100px;
        text-align: center;
      }
      
      .location-summary {
        text-align: center;
      }
      
      .view-locations-button {
        background: none;
        border: none;
        color: #5c6ac4;
        cursor: pointer;
        text-decoration: underline;
        padding: 0;
      }
      
      .item-actions {
        display: flex;
        gap: 8px;
      }
      
      .adjust-quantity-button, .view-history-button {
        background-color: #f4f6f8;
        border: 1px solid #ddd;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .no-items {
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
 * Renders the inventory transfers list HTML
 * 
 * @param transfers - Array of inventory transfers
 * @param hasNextPage - Whether there are more transfers
 * @returns HTML string for the inventory transfers list
 */
export function renderInventoryTransfersHTML(
  transfers: InventoryTransfer[],
  hasNextPage: boolean
): string {
  return `
    <div class="inventory-transfers">
      <div class="transfers-header">
        <h3>Inventory Transfers</h3>
        <button class="create-transfer-button">Create Transfer</button>
      </div>
      
      <div class="transfers-list">
        <table class="transfers-table">
          <thead>
            <tr>
              <th>Transfer #</th>
              <th>Date</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${transfers.length > 0 ? transfers.map(transfer => `
              <tr data-transfer-id="${transfer.id}">
                <td class="transfer-number">${transfer.number || '-'}</td>
                <td class="transfer-date">${new Date(transfer.createdAt).toLocaleDateString()}</td>
                <td class="transfer-origin">${transfer.location?.name || '-'}</td>
                <td class="transfer-destination">${transfer.destinationLocation?.name || '-'}</td>
                <td class="transfer-status">
                  <span class="status-badge status-${transfer.status.toLowerCase()}">${formatTransferStatus(transfer.status)}</span>
                </td>
                <td class="transfer-items">${transfer.items.length} items</td>
                <td class="transfer-actions">
                  <button class="view-transfer-button" data-transfer-id="${transfer.id}">View</button>
                  ${transfer.status === 'PENDING' ? `
                    <button class="cancel-transfer-button" data-transfer-id="${transfer.id}">Cancel</button>
                  ` : ''}
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="7" class="no-transfers">No transfers found</td>
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
  `;
}
