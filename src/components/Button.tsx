import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-light-accent dark:bg-dark-accent text-white hover:opacity-90 focus:ring-light-accent dark:focus:ring-dark-accent',
    secondary: 'bg-light-editor dark:bg-dark-editor text-light-fg dark:text-dark-fg hover:opacity-90 focus:ring-light-syntax-entity dark:focus:ring-dark-syntax-entity',
    outline: 'border border-light-syntax-entity dark:border-dark-syntax-entity text-light-syntax-entity dark:text-dark-syntax-entity hover:bg-light-editor dark:hover:bg-dark-editor focus:ring-light-syntax-entity dark:focus:ring-dark-syntax-entity',
  };
  
  // Disabled classes
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
