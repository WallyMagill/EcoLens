import React, { useState } from 'react';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import apiClient from '../services/api';
// import type { HealthResponse, Portfolio, Scenario } from '../types/api';

interface TestResult {
  endpoint: string;
  loading: boolean;
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [testingAll, setTestingAll] = useState(false);

  const updateResult = (endpoint: string, updates: Partial<TestResult>) => {
    setResults(prev => ({
      ...prev,
      [endpoint]: {
        ...prev[endpoint],
        ...updates,
      },
    }));
  };

  const testEndpoint = async (endpoint: string, testFunction: () => Promise<any>) => {
    updateResult(endpoint, { loading: true, success: false });
    
    try {
      const response = await testFunction();
      
      updateResult(endpoint, {
        loading: false,
        success: response?.success || false,
        data: response?.data,
        error: response?.error?.message || (response?.error ? 'API Error' : undefined),
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error(`${endpoint} API Error:`, error);
      
      updateResult(endpoint, {
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const testHealth = () => testEndpoint('health', () => apiClient.testHealth());
  const testPortfolios = () => testEndpoint('portfolios', () => apiClient.getPortfolios());
  const testScenarios = () => testEndpoint('scenarios', () => apiClient.getScenarios());

  const testAllEndpoints = async () => {
    setTestingAll(true);
    await Promise.all([
      testHealth(),
      testPortfolios(),
      testScenarios(),
    ]);
    setTestingAll(false);
  };

  const clearResults = () => {
    setResults({});
  };

  const formatData = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const getStatusIcon = (result: TestResult | undefined) => {
    if (!result) return <span className="text-gray-400 text-xl">○</span>;
    if (result.loading) return <LoadingSpinner size="sm" />;
    if (result.success) return <span className="text-green-600 text-xl">✓</span>;
    return <span className="text-red-600 text-xl">✗</span>;
  };

  const getStatusColor = (result: TestResult | undefined) => {
    if (!result) return 'bg-gray-50 border-gray-200';
    if (result.loading) return 'bg-yellow-50 border-yellow-200';
    if (result.success) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Connection Test</h1>
        <p className="mt-2 text-gray-600">
          Test connectivity to the EconLens backend API endpoints.
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={testAllEndpoints}
            loading={testingAll}
            className="flex-1"
          >
            {testingAll ? 'Testing All...' : 'Test All Endpoints'}
          </Button>
          <Button
            variant="secondary"
            onClick={clearResults}
            disabled={testingAll}
          >
            Clear Results
          </Button>
        </div>
      </div>

      {/* Individual Endpoint Tests */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Health Endpoint */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Health Check</h3>
              {getStatusIcon(results.health)}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Test basic API connectivity and server status.
            </p>
            <Button
              onClick={testHealth}
              loading={results.health?.loading}
              disabled={testingAll}
              size="sm"
              className="w-full"
            >
              Test /health
            </Button>
          </div>
        </div>

        {/* Portfolios Endpoint */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Portfolios</h3>
              {getStatusIcon(results.portfolios)}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Fetch all available portfolios from the API.
            </p>
            <Button
              onClick={testPortfolios}
              loading={results.portfolios?.loading}
              disabled={testingAll}
              size="sm"
              className="w-full"
            >
              Test /api/portfolios
            </Button>
          </div>
        </div>

        {/* Scenarios Endpoint */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Scenarios</h3>
              {getStatusIcon(results.scenarios)}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Fetch all available scenarios from the API.
            </p>
            <Button
              onClick={testScenarios}
              loading={results.scenarios?.loading}
              disabled={testingAll}
              size="sm"
              className="w-full"
            >
              Test /api/scenarios
            </Button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
          
          {Object.entries(results).map(([endpoint, result]) => (
            <div
              key={endpoint}
              className={`border rounded-lg p-4 ${getStatusColor(result)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 capitalize">
                  {endpoint} Endpoint
                </h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result)}
                  {result.timestamp && (
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  )}
                </div>
              </div>

              {result.error && (
                <ErrorMessage
                  message={result.error}
                  className="mb-3"
                />
              )}

              {result.data && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Response Data:</h4>
                  <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto">
                    {formatData(result.data)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Connection Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Connection Details</h3>
        <div className="text-sm text-blue-700">
          <p><strong>Backend URL:</strong> http://44.203.253.29:3001</p>
          <p><strong>Timeout:</strong> 10 seconds</p>
          <p><strong>CORS:</strong> Configured for frontend origins</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
