// Reusable Input component for EconLens Frontend

import { Eye, EyeOff } from 'lucide-react';
import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    isPassword = false,
    showPasswordToggle = false,
    containerClassName = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    className = '',
    type = 'text',
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = isPassword && !showPassword ? 'password' : type;
    const hasError = !!error;

    const baseInputClasses = `
      w-full px-3 py-2 border rounded-lg text-sm placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition-colors duration-200
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon || (isPassword && showPasswordToggle) ? 'pr-10' : ''}
      ${hasError 
        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
        : 'border-gray-300 focus:border-blue-500 bg-white'
      }
      ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
    `;

    const finalInputClasses = `${baseInputClasses} ${inputClassName} ${className}`.trim();

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label 
            className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
            htmlFor={props.id}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={finalInputClasses}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className={`text-sm text-red-600 ${errorClassName}`}>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

