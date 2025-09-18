import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { AppDispatch, RootState } from '../../store';
import { confirmUser } from '../../store/authSlice';

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.auth);
  
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code.' });
      return;
    }

    setIsVerifying(true);
    try {
      await dispatch(confirmUser({ email, code })).unwrap();
      setMessage({ type: 'success', text: 'Email verified successfully! Redirecting to dashboard...' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // In a real app, you'd call the resend verification API
      setMessage({ type: 'success', text: 'Verification code sent! Check your email.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend verification code. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Email Provided</h2>
          <p className="text-gray-600 mb-4">Please register first to verify your email.</p>
          <Button onClick={() => navigate('/register')}>
            Go to Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">EconLens</h1>
          <p className="mt-2 text-sm text-gray-600">
            Portfolio Analysis Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="text-gray-600 mt-2">
              We've sent a verification code to <strong>{email}</strong>
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-md mb-4 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {error && (
            <ErrorMessage
              title="Verification Failed"
              message={error}
              className="mb-4"
            />
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <Button
              type="submit"
              loading={isVerifying}
              className="w-full"
              size="lg"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
