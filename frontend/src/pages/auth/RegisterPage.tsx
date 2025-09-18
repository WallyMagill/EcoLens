// Registration page for EconLens Frontend

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSuccess = (email: string) => {
    navigate('/verify-email', { 
      state: { email },
      replace: true 
    });
  };

  const handleError = (error: string) => {
    console.error('Registration error:', error);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EconLens to start analyzing your portfolios"
    >
      <RegisterForm
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </AuthLayout>
  );
};

export default RegisterPage;

