import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AppDispatch, RootState } from '../store';
import { fetchPortfolios } from '../store/portfolioSlice';
import { fetchScenarios } from '../store/scenarioSlice';
import type { PortfolioAsset } from '../types/api';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: portfolios, loading: portfoliosLoading, error: portfoliosError } = useSelector((state: RootState) => state.portfolios);
  const { availableScenarios: scenarios, loading: scenariosLoading, error: scenariosError } = useSelector((state: RootState) => state.scenarios);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchPortfolios()),
        dispatch(fetchScenarios()),
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const loading = portfoliosLoading || scenariosLoading;
  const error = portfoliosError || scenariosError;

  // Ensure portfolios is always an array
  const safePortfolios = Array.isArray(portfolios) ? portfolios : [];
  const safeScenarios = Array.isArray(scenarios) ? scenarios : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your portfolios and scenarios
          </p>
        </div>
        <Button onClick={loadData} loading={loading}>
          Refresh Data
        </Button>
      </div>

      {error && (
        <ErrorMessage
          title="Failed to load data"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Portfolios</dt>
                  <dd className="text-lg font-medium text-gray-900">{safePortfolios.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Scenarios</dt>
                  <dd className="text-lg font-medium text-gray-900">{safeScenarios.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Assets</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {safePortfolios.reduce((total, portfolio) => 
                      total + (portfolio.assets?.length || 0), 0
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      safePortfolios.reduce((total, portfolio) => 
                        total + (portfolio.assets?.reduce((assetTotal: number, asset: PortfolioAsset) => 
                          assetTotal + asset.value, 0) || 0), 0
                      )
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolios Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Portfolios
          </h3>
          
          {safePortfolios.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolios</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new portfolio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safePortfolios.map((portfolio) => (
                <div key={portfolio.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">{portfolio.name}</h4>
                    <span className="text-sm text-gray-500">{portfolio.assets?.length || 0} assets</span>
                  </div>
                  {portfolio.description && (
                    <p className="mt-2 text-sm text-gray-600">{portfolio.description}</p>
                  )}
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Created: {formatDate(portfolio.createdAt)}</p>
                    <p>Updated: {formatDate(portfolio.updatedAt)}</p>
                  </div>
                  {portfolio.assets && portfolio.assets.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Total Value:</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(portfolio.assets.reduce((total: number, asset: PortfolioAsset) => total + asset.value, 0))}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scenarios Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Scenarios
          </h3>
          
          {safeScenarios.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No scenarios</h3>
              <p className="mt-1 text-sm text-gray-500">Create scenarios to model different market conditions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safeScenarios.map((scenario) => (
                <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">{scenario.name}</h4>
                    <span className="text-sm text-gray-500">
                      {scenario.parameters?.riskLevel || 'Unknown'} risk
                    </span>
                  </div>
                  {scenario.description && (
                    <p className="mt-2 text-sm text-gray-600">{scenario.description}</p>
                  )}
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Created: {formatDate(scenario.createdAt)}</p>
                    <p>Updated: {formatDate(scenario.updatedAt)}</p>
                  </div>
                  {scenario.parameters && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Time Horizon:</span> {scenario.parameters.timeHorizon} years
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Market Conditions:</span> {scenario.parameters.marketConditions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
