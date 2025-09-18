import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Calendar, MoreVertical } from 'lucide-react';
import type { Portfolio } from '../../types/api';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit?: (portfolio: Portfolio) => void;
  onDelete?: (portfolio: Portfolio) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  portfolio, 
  onEdit, 
  onDelete 
}) => {
  const totalValue = portfolio.assets?.reduce((sum, asset) => sum + asset.value, 0) || 0;
  const assetCount = portfolio.assets?.length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {portfolio.name}
            </h3>
            {portfolio.description && (
              <p className="text-sm text-gray-600 mb-4">
                {portfolio.description}
              </p>
            )}
          </div>
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Assets</p>
              <p className="text-lg font-semibold text-gray-900">
                {assetCount}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Updated {formatDate(portfolio.updatedAt)}</span>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/portfolio/${portfolio.id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
          >
            View Details
          </Link>
          {onEdit && (
            <button
              onClick={() => onEdit(portfolio)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(portfolio)}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
