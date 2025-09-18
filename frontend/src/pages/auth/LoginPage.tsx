// Login page for EconLens Frontend

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';
import { AuthDebug } from '../../components/debug/AuthDebug';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  const from = location.state?.from || '/dashboard';

  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleError = (error: string) => {
    console.error('Login error:', error);
    
    // Show debug component if there's an "already signed in" error
    if (error.includes('already signed in') || error.includes('session conflict')) {
      setShowDebug(true);
    }
  };
  
  const handleAuthCleared = () => {
    setShowDebug(false);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your EconLens account"
    >
      {showDebug && (
        <AuthDebug onAuthCleared={handleAuthCleared} />
      )}
      
      <LoginForm
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </AuthLayout>
  );
};

export default LoginPage;

