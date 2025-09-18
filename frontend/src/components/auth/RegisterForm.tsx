// Registration form component for EconLens Frontend

import { Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, type RegisterData } from '../../services/auth';
import {
    getPasswordStrength,
    validateConfirmPassword,
    validateEmail,
    validateName,
    validatePassword
} from '../../utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface RegisterFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    
    // Validate confirm password
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      newErrors.confirmPassword = confirmPasswordValidation.error;
    }
    
    // Validate first name
    const firstNameValidation = validateName(formData.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error;
    }
    
    // Validate last name
    const lastNameValidation = validateName(formData.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.error;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      onSuccess?.(formData.email);
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleInputChange}
          error={errors.firstName}
          placeholder="Enter your first name"
          leftIcon={<User className="h-4 w-4" />}
          required
          autoComplete="given-name"
          disabled={isLoading}
        />
        
        <Input
          label="Last Name"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleInputChange}
          error={errors.lastName}
          placeholder="Enter your last name"
          leftIcon={<User className="h-4 w-4" />}
          required
          autoComplete="family-name"
          disabled={isLoading}
        />
      </div>

      {/* Email Field */}
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        placeholder="Enter your email"
        leftIcon={<Mail className="h-4 w-4" />}
        required
        autoComplete="email"
        disabled={isLoading}
      />

      {/* Password Field */}
      <div className="space-y-2">
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Create a password"
          leftIcon={<Lock className="h-4 w-4" />}
          isPassword
          showPasswordToggle
          required
          autoComplete="new-password"
          disabled={isLoading}
        />
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.score <= 2 ? 'bg-red-500' :
                    passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        leftIcon={<Lock className="h-4 w-4" />}
        isPassword
        showPasswordToggle
        required
        autoComplete="new-password"
        disabled={isLoading}
      />

      {/* Terms and Conditions */}
      <div className="text-sm text-gray-600">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
          Privacy Policy
        </Link>
        .
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        loadingText="Creating account..."
        disabled={isLoading}
      >
        Create Account
      </Button>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;

