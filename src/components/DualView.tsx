import React, { useState } from 'react';

export interface DualViewProps {
  presentationView: React.ReactNode;
  rawData: any;
  title?: string;
  defaultView?: 'presentation' | 'raw';
  expandable?: boolean;
  defaultExpanded?: boolean;
  maxCollapsedHeight?: number;
  maxExpandedHeight?: number;
  onViewChange?: (view: 'presentation' | 'raw') => void;
}

const DualView: React.FC<DualViewProps> = ({
  presentationView,
  rawData,
  title,
  defaultView = 'presentation',
  expandable = true,
  defaultExpanded = false,
  maxCollapsedHeight = 400,
  maxExpandedHeight = 800,
  onViewChange,
}) => {
  const [activeView, setActiveView] = useState<'presentation' | 'raw'>(defaultView);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleView = (view: 'presentation' | 'raw') => {
    setActiveView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format the raw data for display
  const formatRawData = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return `Error formatting data: ${error}`;
    }
  };

  return (
    <div className="bg-light-editor dark:bg-dark-editor rounded-lg shadow-md overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-light-ui dark:border-dark-ui flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}

      <div className="border-b border-light-ui dark:border-dark-ui">
        <div className="flex justify-between items-center px-6 py-3">
          <div className="flex space-x-2">
            <button
              onClick={() => toggleView('presentation')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeView === 'presentation'
                  ? 'bg-light-accent dark:bg-dark-accent text-white'
                  : 'bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg hover:bg-light-ui dark:hover:bg-dark-ui'
              }`}
            >
              Presentation View
            </button>
            <button
              onClick={() => toggleView('raw')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeView === 'raw'
                  ? 'bg-light-accent dark:bg-dark-accent text-white'
                  : 'bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg hover:bg-light-ui dark:hover:bg-dark-ui'
              }`}
            >
              Raw Data
            </button>
          </div>

          <div className="flex space-x-2">
            {activeView === 'raw' && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(formatRawData(rawData));
                  alert('Copied to clipboard!');
                }}
                className="px-3 py-1 rounded-md text-sm font-medium bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg hover:bg-light-ui dark:hover:bg-dark-ui transition-colors"
                aria-label="Copy raw data to clipboard"
              >
                Copy
              </button>
            )}
            {expandable && (
              <button
                onClick={toggleExpand}
                className="px-3 py-1 rounded-md text-sm font-medium bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg hover:bg-light-ui dark:hover:bg-dark-ui transition-colors"
                aria-label={isExpanded ? 'Collapse view' : 'Expand view'}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-auto ${expandable ? '' : 'max-h-none'}`}
        style={expandable ? { maxHeight: isExpanded ? maxExpandedHeight : maxCollapsedHeight } : {}}
      >
        {activeView === 'presentation' ? (
          <div className="p-6">{presentationView}</div>
        ) : (
          <div className="p-6">
            <pre className="bg-light-bg dark:bg-dark-bg p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
              {formatRawData(rawData)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualView;
