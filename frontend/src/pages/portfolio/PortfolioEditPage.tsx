import { ArrowLeft, CheckCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AssetInput from '../../components/portfolio/AssetInput';
import Button from '../../components/ui/Button';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { AppDispatch, RootState } from '../../store';
import { fetchPortfolio, fetchPortfolios, updatePortfolio } from '../../store/portfolioSlice';
import type { CreatePortfolioRequest, PortfolioAsset } from '../../types/api';

const PortfolioEditPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSuccess = async (portfolioData: CreatePortfolioRequest) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      console.log('Submitting edit for portfolio:', id, portfolioData);

      const result = await dispatch(updatePortfolio({ id, portfolioData }));
      
      if (updatePortfolio.fulfilled.match(result)) {
        // Refresh the portfolio list to show updated data
        dispatch(fetchPortfolios());
        setShowSuccess(true);
      } else {
        console.error('Edit failed:', result.error);
        throw new Error(result.error?.message || 'Failed to update portfolio');
      }
    } catch (error) {
      console.error('Edit submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/portfolio/${id}`);
    } else {
      navigate('/portfolios');
    }
  };

  const handleViewPortfolio = () => {
    if (id) {
      navigate(`/portfolio/${id}`);
    }
  };

  const handleEditAnother = () => {
    setShowSuccess(false);
    setSubmitError(null);
  };

  if (loading && !selectedPortfolio) {
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
            Portfolio Updated Successfully!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your portfolio has been updated with the new information. All changes have been saved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleViewPortfolio}
              className="flex items-center"
            >
              View Updated Portfolio
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleEditAnother}
              className="flex items-center"
            >
              Make More Changes
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate('/portfolios')}
            >
              Back to Portfolios
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Convert portfolio to form data format
  const initialFormData = {
    name: selectedPortfolio.name,
    description: selectedPortfolio.description || '',
    totalValue: selectedPortfolio.totalValue,
    currency: selectedPortfolio.currency,
  };

  const initialAssets: Omit<PortfolioAsset, 'id'>[] = selectedPortfolio.assets?.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    assetType: asset.assetType,
    assetCategory: asset.assetCategory,
    allocationPercentage: asset.allocationPercentage,
    dollarAmount: asset.dollarAmount,
    shares: asset.shares,
    avgPurchasePrice: asset.avgPurchasePrice,
    sector: asset.sector,
    geographicRegion: asset.geographicRegion,
    riskRating: asset.riskRating,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  })) || [];

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Portfolio</h1>
            <p className="text-gray-600 mt-2">
              Update your portfolio information and asset allocation.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-sm text-red-600">{submitError}</div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Form */}
      <PortfolioEditForm
        initialData={initialFormData}
        initialAssets={initialAssets}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

// Custom form component for editing
interface PortfolioEditFormProps {
  initialData: {
    name: string;
    description: string;
    totalValue: number;
    currency: string;
  };
  initialAssets: Omit<PortfolioAsset, 'id'>[];
  onSuccess: (data: CreatePortfolioRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PortfolioEditForm: React.FC<PortfolioEditFormProps> = ({
  initialData,
  initialAssets,
  onSuccess,
  onCancel,
  isSubmitting,
}) => {
  const [currentStep, setCurrentStep] = useState<'basic' | 'assets' | 'review'>('basic');
  const [formData, setFormData] = useState(initialData);
  const [assets, setAssets] = useState<Omit<PortfolioAsset, 'id'>[]>(initialAssets);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Portfolio name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Portfolio name must be 200 characters or less';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }
    
    if (formData.totalValue <= 0) {
      newErrors.totalValue = 'Total value must be greater than 0';
    }
    
    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBasicInfoSubmit = () => {
    if (validateBasicInfo()) {
      setCurrentStep('assets');
    }
  };

  const handleAssetsSubmit = (submittedAssets: Omit<PortfolioAsset, 'id'>[]) => {
    setAssets(submittedAssets);
    setCurrentStep('review');
  };

  const handleFinalSubmit = () => {
    const portfolioData: CreatePortfolioRequest = {
      ...formData,
      assets,
    };
    onSuccess(portfolioData);
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'assets':
        setCurrentStep('basic');
        break;
      case 'review':
        setCurrentStep('assets');
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="My Investment Portfolio"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description of your portfolio strategy..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Value *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.totalValue}
                      onChange={(e) => setFormData({ ...formData, totalValue: parseFloat(e.target.value) || 0 })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="100000"
                    />
                    {errors.totalValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalValue}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                    {errors.currency && (
                      <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'assets':
        return (
          <AssetInput
            initialAssets={assets}
            totalValue={formData.totalValue}
            onSubmit={handleAssetsSubmit}
            onCancel={onCancel}
            loading={isSubmitting}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Changes</h3>
              
              {/* Basic Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Portfolio Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Value:</span>
                    <span className="ml-2 font-medium">
                      {formData.currency} {formData.totalValue.toLocaleString()}
                    </span>
                  </div>
                  {formData.description && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-900">{formData.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assets Summary */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Assets ({assets.length})</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {assets.map((asset, index) => (
                    <div key={index} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900">{asset.symbol}</span>
                            <span className="text-sm text-gray-600">{asset.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {asset.assetType.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formData.currency} {asset.dollarAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {asset.allocationPercentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = ['basic', 'assets', 'review'].indexOf(currentStep);
  const isLastStep = currentStepIndex === 2;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { id: 'basic', title: 'Basic Info' },
            { id: 'assets', title: 'Assets' },
            { id: 'review', title: 'Review' },
          ].map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = currentStepIndex > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className={`h-5 w-5 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`} />
                  )}
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < 2 && (
                  <div className="mx-4 h-px w-8 bg-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={currentStep === 'basic' ? onCancel : goToPreviousStep}
          disabled={isSubmitting}
        >
          {currentStep === 'basic' ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep !== 'assets' && (
          <Button
            type="button"
            onClick={currentStep === 'basic' ? handleBasicInfoSubmit : handleFinalSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isLastStep ? 'Update Portfolio' : 'Next'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PortfolioEditPage;
