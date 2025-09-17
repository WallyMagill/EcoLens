import { ArrowLeft, Download, Edit, Share } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';

export const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - in real app, this would come from API
  const portfolio = {
    id: id || '1',
    name: 'Retirement Fund',
    totalValue: 85000,
    assetCount: 8,
    riskScore: 5.2,
    assets: [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 40, value: 34000 },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 30, value: 25500 },
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', allocation: 20, value: 17000 },
      { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', allocation: 10, value: 8500 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
            <p className="text-gray-600">Portfolio ID: {portfolio.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-gray-900">${portfolio.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Count</h3>
          <p className="text-3xl font-bold text-gray-900">{portfolio.assetCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Score</h3>
          <p className="text-3xl font-bold text-yellow-600">{portfolio.riskScore}/10</p>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Asset Allocation</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {portfolio.assets.map((asset, index) => (
              <div key={asset.symbol} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{asset.symbol}</span>
                    <span className="text-sm text-gray-600">{asset.allocation}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${asset.allocation}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">{asset.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${asset.value.toLocaleString()}
                    </span>
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
