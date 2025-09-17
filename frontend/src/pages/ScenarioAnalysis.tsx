import { Download, Play, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

export const ScenarioAnalysis: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('recession');
  const [selectedPortfolio, setSelectedPortfolio] = useState('1');

  const scenarios = [
    { id: 'recession', name: 'Economic Recession', description: 'Period of economic decline with falling GDP and rising unemployment' },
    { id: 'inflation', name: 'High Inflation', description: 'Rapid increase in general price levels' },
    { id: 'interest-rates', name: 'Rising Interest Rates', description: 'Federal Reserve increasing benchmark rates' },
    { id: 'market-crash', name: 'Market Crash', description: 'Sharp, sudden decline in stock prices' },
  ];

  const portfolios = [
    { id: '1', name: 'Retirement Fund', value: 85000 },
    { id: '2', name: 'Growth Portfolio', value: 25000 },
    { id: '3', name: 'Conservative Mix', value: 15000 },
  ];

  const mockResults = {
    totalImpact: -12.5,
    impactDollar: -10625,
    confidence: 85,
    assetImpacts: [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', impact: -15.2, dollarImpact: -5168 },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', impact: 8.5, dollarImpact: 2168 },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', impact: -18.7, dollarImpact: -3179 },
      { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', impact: -22.3, dollarImpact: -1897 },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scenario Analysis</h1>
        <p className="text-gray-600">Test your portfolio against different economic scenarios</p>
      </div>

      {/* Analysis Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Portfolio
            </label>
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name} (${portfolio.value.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {scenarios.find(s => s.id === selectedScenario)?.description}
          </p>
        </div>
        <div className="mt-6">
          <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            <Play className="h-5 w-5 mr-2" />
            Run Analysis
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-run
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{mockResults.totalImpact}%</p>
            <p className="text-sm text-gray-600">Total Impact</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">${mockResults.impactDollar.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Dollar Impact</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{mockResults.confidence}%</p>
            <p className="text-sm text-gray-600">Confidence Level</p>
          </div>
        </div>

        {/* Asset Impacts */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Asset-Level Impacts</h3>
          <div className="space-y-4">
            {mockResults.assetImpacts.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{asset.symbol}</span>
                    <span className="text-sm text-gray-600">{asset.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    asset.impact > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {asset.impact > 0 ? '+' : ''}{asset.impact}%
                  </div>
                  <div className={`text-sm ${
                    asset.dollarImpact > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {asset.dollarImpact > 0 ? '+' : ''}${asset.dollarImpact.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
