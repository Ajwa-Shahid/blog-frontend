'use client';

import { forwardRef } from 'react';
import { useTheme } from 'next-themes';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return isDarkMode
            ? 'text-black bg-white hover:bg-gray-200'
            : 'text-white bg-black hover:bg-gray-800';
        case 'secondary':
          return isDarkMode
            ? 'text-white bg-gray-800 hover:bg-gray-700'
            : 'text-black bg-gray-200 hover:bg-gray-300';
        case 'outline':
          return isDarkMode
            ? 'border-gray-600 text-white hover:bg-gray-800'
            : 'border-gray-300 text-black hover:bg-gray-100';
        default:
          return isDarkMode
            ? 'text-black bg-white hover:bg-gray-200'
            : 'text-white bg-black hover:bg-gray-800';
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'py-2 px-3 text-xs';
        case 'md':
          return 'py-3 px-4 text-sm';
        case 'lg':
          return 'py-4 px-6 text-base';
        default:
          return 'py-3 px-4 text-sm';
      }
    };

    const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50';
    const borderStyles = variant === 'outline' ? 'border' : 'border border-transparent';
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${borderStyles} ${getSizeStyles()} ${getVariantStyles()} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;