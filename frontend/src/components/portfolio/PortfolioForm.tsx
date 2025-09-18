import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  User
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { AppDispatch } from '../../store';
import { createPortfolio } from '../../store/portfolioSlice';
import type { CreatePortfolioRequest, PortfolioAsset } from '../../types/api';
import Button from '../ui/Button';
import AssetInput from './AssetInput';

// Step definitions
const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: User },
  { id: 'assets', title: 'Assets', icon: BarChart3 },
  { id: 'review', title: 'Review', icon: FileText },
] as const;

type StepId = typeof STEPS[number]['id'];

// Validation schemas
const basicInfoSchema = z.object({
  name: z.string()
    .min(1, 'Portfolio name is required')
    .max(200, 'Portfolio name must be 200 characters or less'),
  description: z.string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
  totalValue: z.number()
    .min(0.01, 'Total value must be greater than 0'),
  currency: z.string()
    .min(1, 'Currency is required'),
});


type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface PortfolioFormProps {
  // eslint-disable-next-line no-unused-vars
  onSuccess: (portfolioId: string) => void;
  onCancel: () => void;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentStep, setCurrentStep] = useState<StepId>('basic');
  const [assets, setAssets] = useState<Omit<PortfolioAsset, 'id'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      description: '',
      totalValue: 0,
      currency: 'USD',
    },
  });

  const watchedValues = watch();
  const totalValue = watchedValues.totalValue || 0;

  const handleBasicInfoSubmit = () => {
    setCurrentStep('assets');
  };

  const handleAssetsSubmit = (submittedAssets: Omit<PortfolioAsset, 'id'>[]) => {
    setAssets(submittedAssets);
    setCurrentStep('review');
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const basicInfo = getValues();
      const portfolioData: CreatePortfolioRequest = {
        ...basicInfo,
        assets,
      };

      // Debug logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Portfolio submission data:', portfolioData);
        console.log('Assets data:', assets);
        console.log('Basic info:', basicInfo);
      }

      const result = await dispatch(createPortfolio(portfolioData));
      
      if (createPortfolio.fulfilled.match(result)) {
        onSuccess(result.payload?.id || '');
      } else {
        const errorMessage = result.error?.message || 'Failed to create portfolio';
        console.error('Portfolio creation failed:', result.error);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Portfolio submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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

  const goToNextStep = () => {
    switch (currentStep) {
      case 'basic':
        handleSubmit(handleBasicInfoSubmit)();
        break;
      case 'assets':
        // Assets step handles its own submission
        break;
      case 'review':
        handleFinalSubmit();
        break;
      default:
        break;
    }
  };

  const getStepIcon = (stepId: StepId, isActive: boolean, isCompleted: boolean) => {
    const IconComponent = STEPS.find(step => step.id === stepId)?.icon || User;
    
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    return <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />;
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
                    {...register('name')}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="My Investment Portfolio"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description of your portfolio strategy..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Value *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        {...register('totalValue', { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="100000"
                      />
                    </div>
                    {errors.totalValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalValue.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      {...register('currency')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                    {errors.currency && (
                      <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
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
            totalValue={totalValue}
            onSubmit={handleAssetsSubmit}
            onCancel={onCancel}
            loading={isSubmitting}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Portfolio</h3>
              
              {/* Basic Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Portfolio Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{watchedValues.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Value:</span>
                    <span className="ml-2 font-medium">
                      {watchedValues.currency} {totalValue.toLocaleString()}
                    </span>
                  </div>
                  {watchedValues.description && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-900">{watchedValues.description}</p>
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
                            {watchedValues.currency} {asset.dollarAmount.toLocaleString()}
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

              {/* Error Display */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <div className="text-sm text-red-600">{submitError}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = currentStepIndex > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  {getStepIcon(step.id, isActive, isCompleted)}
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
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
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 'basic' ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep !== 'assets' && (
          <Button
            type="button"
            onClick={goToNextStep}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isLastStep ? 'Create Portfolio' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PortfolioForm;
