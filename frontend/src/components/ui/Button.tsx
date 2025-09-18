// Reusable Button component for EconLens Frontend

import { Loader2 } from 'lucide-react';
import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || isLoading;

    const baseClasses = `
      inline-flex items-center justify-center font-medium rounded-lg
      focus:outline-none focus:ring-2 focus:ring-offset-2
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
    `;

    const variantClasses = {
      primary: `
        bg-blue-600 text-white hover:bg-blue-700
        focus:ring-blue-500
        active:bg-blue-800
      `,
      secondary: `
        bg-gray-600 text-white hover:bg-gray-700
        focus:ring-gray-500
        active:bg-gray-800
      `,
      outline: `
        border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
        focus:ring-blue-500
        active:bg-gray-100
      `,
      ghost: `
        text-gray-700 hover:bg-gray-100
        focus:ring-gray-500
        active:bg-gray-200
      `,
      danger: `
        bg-red-600 text-white hover:bg-red-700
        focus:ring-red-500
        active:bg-red-800
      `,
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const finalClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `.trim();

    return (
      <button
        ref={ref}
        className={finalClasses}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            {loadingText || 'Loading...'}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

