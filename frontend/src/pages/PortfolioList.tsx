import { MoreHorizontal, Plus, Upload } from 'lucide-react';
import React from 'react';

export const PortfolioList: React.FC = () => {
  const portfolios = [
    {
      id: '1',
      name: 'Retirement Fund',
      totalValue: 85000,
      assetCount: 8,
      riskScore: 5.2,
      lastAnalyzed: '2024-01-15',
    },
    {
      id: '2',
      name: 'Growth Portfolio',
      totalValue: 25000,
      assetCount: 5,
      riskScore: 7.8,
      lastAnalyzed: '2024-01-10',
    },
    {
      id: '3',
      name: 'Conservative Mix',
      totalValue: 15000,
      assetCount: 6,
      riskScore: 3.4,
      lastAnalyzed: '2024-01-08',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolios</h1>
          <p className="text-gray-600">Manage and analyze your investment portfolios</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{portfolio.name}</h3>
                <p className="text-sm text-gray-500">ID: {portfolio.id}</p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Value</span>
                <span className="text-sm font-medium text-gray-900">
                  ${portfolio.totalValue.toLocaleString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assets</span>
                <span className="text-sm font-medium text-gray-900">
                  {portfolio.assetCount}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk Score</span>
                <span className={`text-sm font-medium ${
                  portfolio.riskScore < 4 ? 'text-green-600' :
                  portfolio.riskScore < 7 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {portfolio.riskScore}/10
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Analyzed</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(portfolio.lastAnalyzed).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
