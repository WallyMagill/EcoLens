// Forgot password component for EconLens Frontend

import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { validateEmail } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface ForgotPasswordProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
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
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateEmailStep = (): boolean => {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error });
      return false;
    }
    return true;
  };

  const validateResetStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate code
    if (!formData.code) {
      newErrors.code = 'Verification code is required';
    } else if (formData.code.length !== 6) {
      newErrors.code = 'Verification code must be 6 digits';
    }
    
    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailStep()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await authService.forgotPassword({ email: formData.email });
      setStep('reset');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset code. Please try again.';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetStep()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await authService.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword,
      });
      setStep('success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password. Please try again.';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('request');
    setFormData({
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  // Success step
  if (step === 'success') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Password reset successful</h3>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>
        </div>
        
        <Button
          onClick={handleBackToLogin}
          variant="primary"
          size="lg"
          fullWidth
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  // Reset step
  if (step === 'reset') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Reset your password</h3>
          <p className="mt-2 text-sm text-gray-600">
            Enter the verification code sent to <strong>{formData.email}</strong> and your new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Verification Code */}
          <Input
            label="Verification Code"
            name="code"
            type="text"
            value={formData.code}
            onChange={handleInputChange}
            error={errors.code}
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
            disabled={isLoading}
            className="text-center text-lg tracking-widest"
          />

          {/* New Password */}
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleInputChange}
            error={errors.newPassword}
            placeholder="Enter your new password"
            isPassword
            showPasswordToggle
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
            placeholder="Confirm your new password"
            isPassword
            showPasswordToggle
            required
            autoComplete="new-password"
            disabled={isLoading}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            loadingText="Resetting password..."
            disabled={isLoading}
          >
            Reset Password
          </Button>

          {/* Back to Request */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to email request
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Request step (default)
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Forgot your password?</h3>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <form onSubmit={handleRequestReset} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

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

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText="Sending code..."
          disabled={isLoading}
        >
          Send Reset Code
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;

