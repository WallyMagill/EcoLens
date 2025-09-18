import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Portfolio } from '../../types/api';

interface PortfolioSummaryCardProps {
  portfolio: Portfolio;
  // eslint-disable-next-line no-unused-vars
  onClick?: (id: string) => void;
}

interface PortfolioSummaryCardSkeletonProps {
  className?: string;
}

const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({ portfolio, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(portfolio.id);
    } else {
      navigate(`/portfolio/${portfolio.id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: portfolio.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const assetCount = portfolio.assets?.length || 0;

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-gray-300"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
          {portfolio.name}
        </h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
          {assetCount} asset{assetCount !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="mt-3">
        <p className="text-lg font-semibold text-gray-900">
          {formatCurrency(portfolio.totalValue)}
        </p>
      </div>
    </div>
  );
};

export const PortfolioSummaryCardSkeleton: React.FC<PortfolioSummaryCardSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 animate-pulse ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded flex-1 mr-2"></div>
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="mt-3">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default PortfolioSummaryCard;
