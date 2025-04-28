import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';
import Pagination from '../../Pagination';
import SearchInput from '../../SearchInput';
import { formatDate } from '../../../utils/formatters';

export interface DraftOrdersListProps {
  onViewDraftOrder?: (draftOrderId: string) => void;
  onEditDraftOrder?: (draftOrderId: string) => void;
  onCompleteDraftOrder?: (draftOrderId: string) => void;
  onDeleteDraftOrder?: (draftOrderId: string) => void;
  onCreateDraftOrder?: () => void;
}

/**
 * DraftOrdersList component
 * This component displays a list of draft orders with pagination, search, and actions
 */
const DraftOrdersList: React.FC<DraftOrdersListProps> = ({
  onViewDraftOrder,
  onEditDraftOrder,
  onCompleteDraftOrder,
  onDeleteDraftOrder,
  onCreateDraftOrder,
}) => {
  const router = useRouter();
  const { orders } = useShopify();
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for draft orders data
  const [draftOrders, setDraftOrders] = useState<any[]>([]);
  const [totalDraftOrders, setTotalDraftOrders] = useState(0);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch draft orders when page, search query, or sort changes
  useEffect(() => {
    fetchDraftOrders();
  }, [currentPage, debouncedSearchQuery, sortField, sortDirection]);

  // Fetch draft orders
  const fetchDraftOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string for filtering and sorting
      let query = '';
      
      if (debouncedSearchQuery) {
        query = debouncedSearchQuery;
      }
      
      // Fetch draft orders
      const result = await orders.getDraftOrders({
        first: pageSize,
        query,
        sortKey: sortField.toUpperCase(),
        reverse: sortDirection === 'desc',
        after: currentPage > 1 ? getCursor() : undefined,
      });
      
      if (result) {
        setDraftOrders(result.edges.map(edge => edge.node));
        setTotalDraftOrders(result.totalCount);
      }
    } catch (err: any) {
      setError(`Failed to load draft orders: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get cursor for pagination
  const getCursor = () => {
    // This is a simplified implementation
    // In a real app, you would store the cursor from the previous page
    return '';
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handle view draft order
  const handleViewDraftOrder = (draftOrderId: string) => {
    if (onViewDraftOrder) {
      onViewDraftOrder(draftOrderId);
    } else {
      router.push(`/admin/draft-orders/${draftOrderId}`);
    }
  };

  // Handle edit draft order
  const handleEditDraftOrder = (draftOrderId: string) => {
    if (onEditDraftOrder) {
      onEditDraftOrder(draftOrderId);
    } else {
      router.push(`/admin/draft-orders/${draftOrderId}/edit`);
    }
  };

  // Handle complete draft order
  const handleCompleteDraftOrder = async (draftOrderId: string) => {
    if (onCompleteDraftOrder) {
      onCompleteDraftOrder(draftOrderId);
    } else {
      try {
        await orders.completeDraftOrder(draftOrderId, false);
        fetchDraftOrders(); // Refresh the list
      } catch (err: any) {
        setError(`Failed to complete draft order: ${err.message}`);
      }
    }
  };

  // Handle delete draft order
  const handleDeleteDraftOrder = async (draftOrderId: string) => {
    if (onDeleteDraftOrder) {
      onDeleteDraftOrder(draftOrderId);
    } else {
      if (window.confirm('Are you sure you want to delete this draft order? This action cannot be undone.')) {
        try {
          await orders.deleteDraftOrder(draftOrderId);
          fetchDraftOrders(); // Refresh the list
        } catch (err: any) {
          setError(`Failed to delete draft order: ${err.message}`);
        }
      }
    }
  };

  // Handle create draft order
  const handleCreateDraftOrder = () => {
    if (onCreateDraftOrder) {
      onCreateDraftOrder();
    } else {
      router.push('/admin/draft-orders/new');
    }
  };

  // Render loading state
  if (isLoading && draftOrders.length === 0) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-light-accent dark:border-dark-accent mx-auto"></div>
          <p className="ml-3">Loading draft orders...</p>
        </div>
      </Card>
    );
  }

  // Render error state
  if (error && draftOrders.length === 0) {
    return (
      <Card>
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          <p>{error}</p>
          <Button variant="secondary" onClick={fetchDraftOrders} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Render draft orders list
  const renderDraftOrdersList = () => (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <SearchInput
          placeholder="Search draft orders..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full md:w-64"
        />
        <Button variant="primary" onClick={handleCreateDraftOrder}>
          Create Draft Order
        </Button>
      </div>

      {/* Draft orders table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Draft Order
                {sortField === 'name' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('customer')}
              >
                Customer
                {sortField === 'customer' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Date
                {sortField === 'createdAt' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('totalPrice')}
              >
                Total
                {sortField === 'totalPrice' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
            {draftOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  No draft orders found.
                </td>
              </tr>
            ) : (
              draftOrders.map((draftOrder) => (
                <tr key={draftOrder.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {draftOrder.name || 'Draft'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {draftOrder.customer ? (
                        <>
                          {draftOrder.customer.firstName} {draftOrder.customer.lastName}
                          {draftOrder.customer.email && (
                            <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                              {draftOrder.customer.email}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-light-fg dark:text-dark-fg opacity-70">
                          No customer
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {formatDate(draftOrder.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${parseFloat(draftOrder.totalPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => handleViewDraftOrder(draftOrder.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => handleEditDraftOrder(draftOrder.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => handleCompleteDraftOrder(draftOrder.id)}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        onClick={() => handleDeleteDraftOrder(draftOrder.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalDraftOrders > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalDraftOrders}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Loading indicator for subsequent page loads */}
      {isLoading && draftOrders.length > 0 && (
        <div className="flex justify-center items-center h-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-light-accent dark:border-dark-accent"></div>
          <p className="ml-3 text-sm">Loading...</p>
        </div>
      )}
    </div>
  );

  return (
    <DualView
      title="Draft Orders"
      presentationView={renderDraftOrdersList()}
      rawData={draftOrders}
      defaultView="presentation"
    />
  );
};

export default DraftOrdersList;
