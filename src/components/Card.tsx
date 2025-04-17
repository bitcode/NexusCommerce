import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
  headerAction,
}) => {
  return (
    <div className={`bg-light-editor dark:bg-dark-editor rounded-lg shadow-md overflow-hidden ${className}`}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-light-ui dark:border-dark-ui flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-light-ui dark:border-dark-ui bg-light-bg dark:bg-dark-bg bg-opacity-50 dark:bg-opacity-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
