// Email verification component for EconLens Frontend

import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth';
import { validateEmail, validateVerificationCode } from '../../utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface VerifyEmailProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  onSuccess,
  onError,
  className = '',
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
    const newErrors: { email?: string; code?: string } = {};
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    
    // Validate verification code
    const codeValidation = validateVerificationCode(formData.code);
    if (!codeValidation.isValid) {
      newErrors.code = codeValidation.error;
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
      await authService.verifyEmail({
        email: formData.email,
        code: formData.code,
      });
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed. Please try again.';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    // Validate email before resending
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error });
      return;
    }
    
    setIsResending(true);
    setErrors({});
    
    try {
      await authService.resendVerificationCode(formData.email);
      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to resend verification code.';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Verify your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification code to <strong>{formData.email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Email Field (if not from URL params) */}
        {!searchParams.get('email') && (
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
        )}

        {/* Verification Code Field */}
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

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="inline h-3 w-3 animate-spin mr-1" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend code'
              )}
            </button>
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          loadingText="Verifying..."
          disabled={isLoading}
        >
          Verify Email
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmail;

