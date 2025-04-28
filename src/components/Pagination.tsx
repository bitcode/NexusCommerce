import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
}

/**
 * Pagination component
 * A reusable pagination component with page numbers and navigation buttons
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  maxPageButtons = 5,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Calculate the range of page buttons to display
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  // Generate page numbers
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
  
  // Button styles
  const buttonBaseClass = "px-3 py-1 rounded-md text-sm font-medium";
  const activeButtonClass = "bg-light-accent dark:bg-dark-accent text-white";
  const inactiveButtonClass = "bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg hover:bg-light-editor dark:hover:bg-dark-editor";
  const disabledButtonClass = "bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg opacity-50 cursor-not-allowed";
  
  return (
    <div className="flex items-center justify-between border-t border-light-ui dark:border-dark-ui pt-4">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonBaseClass} ${currentPage === 1 ? disabledButtonClass : inactiveButtonClass}`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonBaseClass} ${currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-light-fg dark:text-dark-fg">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${buttonBaseClass} rounded-l-md ${currentPage === 1 ? disabledButtonClass : inactiveButtonClass}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* First page button (if not in range) */}
            {startPage > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={`${buttonBaseClass} ${inactiveButtonClass}`}
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className={`${buttonBaseClass} ${inactiveButtonClass}`}>
                    ...
                  </span>
                )}
              </>
            )}
            
            {/* Page numbers */}
            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`${buttonBaseClass} ${page === currentPage ? activeButtonClass : inactiveButtonClass}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
            
            {/* Last page button (if not in range) */}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className={`${buttonBaseClass} ${inactiveButtonClass}`}>
                    ...
                  </span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`${buttonBaseClass} ${inactiveButtonClass}`}
                >
                  {totalPages}
                </button>
              </>
            )}
            
            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${buttonBaseClass} rounded-r-md ${currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
