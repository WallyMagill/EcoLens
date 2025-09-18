// Email verification page for EconLens Frontend

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { VerifyEmail } from '../../components/auth/VerifyEmail';
import { useAuth } from '../../contexts/AuthContext';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail } = useAuth();

  const email = location.state?.email || '';

  const handleSuccess = () => {
    navigate('/login', { 
      state: { message: 'Email verified successfully! Please sign in.' },
      replace: true 
    });
  };

  const handleError = (error: string) => {
    console.error('Email verification error:', error);
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Check your inbox for the verification code"
    >
      <VerifyEmail
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </AuthLayout>
  );
};

export default VerifyEmailPage;

