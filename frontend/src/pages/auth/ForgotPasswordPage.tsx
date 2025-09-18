// Forgot password page for EconLens Frontend

import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ForgotPassword } from '../../components/auth/ForgotPassword';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, resetPassword } = useAuth();

  const handleSuccess = () => {
    console.log('Password reset process initiated successfully');
  };

  const handleError = (error: string) => {
    console.error('Password reset error:', error);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a reset code"
    >
      <ForgotPassword
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

