import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { RootState } from '../store';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600">EconLens</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Portfolio analysis and scenario modeling platform. Test API connectivity and explore your financial data.
        </p>
        
        {isAuthenticated ? (
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link to="/api-test">
                <Button size="lg" className="w-full">
                  Test API Connection
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link to="/dashboard">
                <Button variant="secondary" size="lg" className="w-full">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link to="/login">
                <Button size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link to="/register">
                <Button variant="secondary" size="lg" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">API Testing</h3>
                <p className="mt-5 text-base text-gray-500">
                  Test backend connectivity and verify all endpoints are working correctly.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Portfolio Analysis</h3>
                <p className="mt-5 text-base text-gray-500">
                  View and analyze your investment portfolios with real-time data.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
              <div className="-mt-6">
                <div>
                  <span className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Scenario Modeling</h3>
                <p className="mt-5 text-base text-gray-500">
                  Create and analyze different market scenarios for your investments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="mt-20">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-500">Frontend Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">?</div>
              <div className="text-sm text-gray-500">Backend Status</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isAuthenticated ? 'text-green-600' : 'text-gray-400'}`}>
                {isAuthenticated ? '✓' : '-'}
              </div>
              <div className="text-sm text-gray-500">
                {isAuthenticated ? `Authenticated as ${user?.signInDetails?.loginId || 'User'}` : 'Not Authenticated'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
