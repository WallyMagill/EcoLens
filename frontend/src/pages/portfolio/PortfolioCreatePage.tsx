import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    CheckCircle,
    Plus
} from 'lucide-react';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PortfolioForm from '../../components/portfolio/PortfolioForm';
import Button from '../../components/ui/Button';
import { AppDispatch } from '../../store';
import { fetchPortfolios } from '../../store/portfolioSlice';

const PortfolioCreatePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPortfolioId, setCreatedPortfolioId] = useState<string | null>(null);

  const handleSuccess = (portfolioId: string) => {
    setCreatedPortfolioId(portfolioId);
    setShowSuccess(true);
    // Refresh the portfolio list to show the new portfolio
    dispatch(fetchPortfolios());
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleViewPortfolio = () => {
    if (createdPortfolioId) {
      navigate(`/portfolio/${createdPortfolioId}`);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccess(false);
    setCreatedPortfolioId(null);
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Portfolio Created Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your portfolio has been created and is ready for analysis. You can now run scenarios 
            and explore different market conditions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleViewPortfolio}
              className="flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Portfolio
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleCreateAnother}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Another
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Portfolio</h1>
            <p className="text-gray-600 mt-2">
              Build your investment portfolio with real-time validation and allocation tracking.
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Multi-Step Process</h3>
                <p className="text-xs text-blue-700">Basic info → Assets → Review</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900">Real-time Validation</h3>
                <p className="text-xs text-green-700">Allocations must sum to 100%</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-900">Smart Validation</h3>
                <p className="text-xs text-purple-700">Unique symbols, valid formats</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <PortfolioForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Portfolio Creation Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Start with your largest holdings first</li>
              <li>• Use clear, descriptive asset names</li>
              <li>• Ensure allocations sum to exactly 100%</li>
              <li>• Include all major asset classes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Validation Rules</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Asset symbols: letters and numbers only</li>
              <li>• Maximum 50 assets per portfolio</li>
              <li>• No duplicate symbols allowed</li>
              <li>• Total allocation: 100% (±0.01% tolerance)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCreatePage;
