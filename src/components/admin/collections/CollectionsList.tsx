import React, { useState, useEffect } from 'react';
import { useShopify } from '../../../hooks/useShopify';
import Card from '../../Card';
import Button from '../../Button';
import DualView from '../../DualView';

export interface CollectionsListProps {
  onCollectionSelect?: (collectionId: string) => void;
  onCreateCollection?: () => void;
}

const CollectionsList: React.FC<CollectionsListProps> = ({
  onCollectionSelect,
  onCreateCollection,
}) => {
  const { collections } = useShopify();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('TITLE');
  const [sortReverse, setSortReverse] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch collections
  const fetchCollections = (cursor: string | null = null, newSearch = false) => {
    setIsLoading(true);
    setError(null);

    const options = {
      first: 20,
      after: cursor,
      query: searchQuery ? searchQuery : null,
      sortKey,
      reverse: sortReverse,
    };

    collections.getCollectionsBasic(options)
      .then((data) => {
        const edges = data.edges || [];
        const pageInfo = data.pageInfo || {};
        
        const fetchedCollections = edges.map((edge: any) => edge.node);
        
        if (newSearch || !cursor) {
          // Replace collections for new searches
          setCollectionsList(fetchedCollections);
        } else {
          // Append collections for pagination
          setCollectionsList(prev => [...prev, ...fetchedCollections]);
        }
        
        setHasNextPage(pageInfo.hasNextPage || false);
        setCurrentCursor(pageInfo.endCursor || null);
      })
      .catch((err) => {
        setError(`Failed to load collections: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchCollections();
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchCollections(null, true);
  };

  // Handle sort change
  const handleSortChange = (key: string) => {
    if (sortKey === key) {
      // Toggle direction if same key
      setSortReverse(!sortReverse);
    } else {
      // Set new key and default direction
      setSortKey(key);
      setSortReverse(false);
    }
    
    // Refetch with new sort
    fetchCollections(null, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && currentCursor) {
      fetchCollections(currentCursor);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render the collections list with dual-view capability
  const renderCollectionsList = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* Search */}
        <div className="flex w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections..."
            className="px-3 py-2 border border-light-ui dark:border-dark-ui rounded-l-md bg-light-bg dark:bg-dark-bg w-full md:w-64"
          />
          <Button
            variant="primary"
            onClick={handleSearch}
            className="rounded-l-none"
          >
            Search
          </Button>
        </div>

        {/* Create collection button */}
        <Button
          variant="primary"
          onClick={onCreateCollection}
        >
          Create Collection
        </Button>
      </div>

      {/* Collections table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-ui dark:divide-dark-ui">
          <thead className="bg-light-editor dark:bg-dark-editor">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('TITLE')}
              >
                <div className="flex items-center">
                  <span>Collection</span>
                  {sortKey === 'TITLE' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('UPDATED_AT')}
              >
                <div className="flex items-center">
                  <span>Updated</span>
                  {sortKey === 'UPDATED_AT' && (
                    <svg 
                      className="ml-1 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={sortReverse ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-light-bg dark:bg-dark-bg divide-y divide-light-ui dark:divide-dark-ui">
            {collectionsList.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  {isLoading ? 'Loading collections...' : 'No collections found'}
                </td>
              </tr>
            ) : (
              collectionsList.map((collection) => (
                <tr key={collection.id} className="hover:bg-light-editor dark:hover:bg-dark-editor">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {collection.image ? (
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={collection.image.url}
                            alt={collection.title}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-light-ui dark:bg-dark-ui flex items-center justify-center text-light-fg dark:text-dark-fg opacity-50">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div 
                          className="text-sm font-medium cursor-pointer hover:text-light-accent dark:hover:text-dark-accent"
                          onClick={() => onCollectionSelect && onCollectionSelect(collection.id)}
                        >
                          {collection.title}
                        </div>
                        <div className="text-xs text-light-fg dark:text-dark-fg opacity-70">
                          {collection.handle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(collection.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {collection.productsCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      collection.ruleSet
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {collection.ruleSet ? 'Automated' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onCollectionSelect && onCollectionSelect(collection.id)}
                      className="text-light-accent dark:text-dark-accent hover:text-light-accent-hover dark:hover:text-dark-accent-hover"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <DualView
      title="Collections"
      presentationView={renderCollectionsList()}
      rawData={{ collections: collectionsList }}
      defaultView="presentation"
    />
  );
};

export default CollectionsList;
