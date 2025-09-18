import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AppDispatch, persistor, store } from './store';
import { checkAuthStatus } from './store/authSlice';

// Pages
import AuthTest from './components/auth/AuthTest';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ApiTest from './pages/ApiTest';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import PortfolioCreatePage from './pages/portfolio/PortfolioCreatePage';
import PortfolioEditPage from './pages/portfolio/PortfolioEditPage';
import PortfolioListPage from './pages/portfolio/PortfolioListPage';
import PortfolioViewPage from './pages/portfolio/PortfolioViewPage';

// Initialize Amplify
import './utils/amplify-config';

// Component to check auth status on app startup
const AuthChecker: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check if user is already authenticated on app startup
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return null;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthChecker />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            
            {/* Home page - accessible to all */}
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            
            {/* Protected routes with layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <ProfilePage />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/api-test" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <ApiTest />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/auth-test" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <AuthTest />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/portfolios" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <PortfolioListPage />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/portfolio/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <PortfolioViewPage />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/portfolio/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <PortfolioEditPage />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/portfolio/create" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorBoundary>
                    <PortfolioCreatePage />
                  </ErrorBoundary>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;
