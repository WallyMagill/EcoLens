import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAuthHeaders, getCurrentAuthUser } from '../../services/auth';
import { AppDispatch, RootState } from '../../store';
import { checkAuthStatus } from '../../store/authSlice';

const AuthTest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string> | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Test getting auth headers
    const testAuthHeaders = async () => {
      try {
        const headers = await getAuthHeaders();
        setAuthHeaders(headers);
        setTestResult('Auth headers retrieved successfully');
      } catch (error) {
        setTestResult(`Error getting auth headers: ${error}`);
      }
    };

    testAuthHeaders();
  }, [isAuthenticated]);

  const handleCheckAuth = async () => {
    try {
      await dispatch(checkAuthStatus()).unwrap();
      setTestResult('Auth status checked successfully');
    } catch (error) {
      setTestResult(`Error checking auth status: ${error}`);
    }
  };

  const handleGetUser = async () => {
    try {
      const currentUser = await getCurrentAuthUser();
      setTestResult(`Current user: ${JSON.stringify(currentUser, null, 2)}`);
    } catch (error) {
      setTestResult(`Error getting current user: ${error}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Auth State</h2>
        <div className="space-y-2">
          <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Auth Headers</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
          {authHeaders ? JSON.stringify(authHeaders, null, 2) : 'No headers available'}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <button
            onClick={handleCheckAuth}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Check Auth Status
          </button>
          <button
            onClick={handleGetUser}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
          >
            Get Current User
          </button>
        </div>
      </div>

      {testResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Test Result</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
