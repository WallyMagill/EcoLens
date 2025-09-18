import {
    ArrowLeft,
    BarChart3,
    Calendar,
    DollarSign,
    Edit,
    PieChart,
    RefreshCw,
    Trash2,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AllocationChart from '../../components/portfolio/AllocationChart';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AppDispatch, RootState } from '../../store';
import { deletePortfolio, fetchPortfolio, fetchPortfolios } from '../../store/portfolioSlice';
// import type { Portfolio } from '../../types/api';

const PortfolioViewPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { selectedPortfolio, loading, error } = useSelector((state: RootState) => state.portfolios);

  useEffect(() => {
    if (id) {
      loadPortfolio();
    }
  }, [id]);

  const loadPortfolio = async () => {
    if (!id) return;
    
    try {
      await dispatch(fetchPortfolio(id)).unwrap();
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/portfolio/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!id || !selectedPortfolio) return;

    setIsDeleting(true);
    try {
      await dispatch(deletePortfolio(id)).unwrap();
      // Refresh the portfolio list to reflect the deletion
      dispatch(fetchPortfolios());
      navigate('/portfolios');
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
      alert('Failed to delete portfolio. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !selectedPortfolio) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="secondary"
            onClick={() => navigate('/portfolios')}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Not Found</h1>
        </div>
        
        <ErrorMessage
          title="Portfolio not found"
          message={error || 'The portfolio you are looking for does not exist or has been deleted.'}
          onRetry={loadPortfolio}
        />
      </div>
    );
  }

  const portfolio = selectedPortfolio;
  const totalAssets = portfolio.assets?.length || 0;
  const totalValue = portfolio.totalValue || 0;

  // Debug chart data
  console.log('Chart data debug:', {
    portfolio: portfolio,
    assets: portfolio?.assets,
    hasAssets: portfolio?.assets && portfolio.assets.length > 0
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/portfolios')}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
              {portfolio.description && (
                <p className="text-gray-600 mt-2">{portfolio.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={loadPortfolio}
              loading={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleEdit}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Portfolio
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(totalValue, portfolio.currency)}
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
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Assets</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalAssets}</dd>
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
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Created</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatDate(portfolio.createdAt)}
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
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Updated</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatDate(portfolio.updatedAt)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Asset Allocation
            </h3>
          </div>
          <div className="p-6">
            {portfolio.assets && portfolio.assets.length > 0 ? (
              <AllocationChart 
                assets={portfolio.assets}
                totalValue={portfolio.totalValue}
              />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Assets</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This portfolio doesn't have any assets yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Asset Details Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Asset Details
            </h3>
          </div>
          <div className="overflow-hidden">
            {portfolio.assets && portfolio.assets.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {portfolio.assets.map((asset, index) => (
                  <div key={asset.id || index} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{asset.symbol}</span>
                          <span className="text-sm text-gray-600">{asset.name}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {asset.assetType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {asset.sector && (
                          <p className="text-sm text-gray-500 mt-1">Sector: {asset.sector}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(asset.dollarAmount, portfolio.currency)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {asset.allocationPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Assets</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This portfolio doesn't have any assets yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Portfolio
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{portfolio.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={isDeleting}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioViewPage;
