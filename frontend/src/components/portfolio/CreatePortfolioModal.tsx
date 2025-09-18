// Create portfolio modal component for EconLens Frontend

import { AssetCategory, AssetType, Region } from '@econlens/shared';
import { Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import {
    validateAllocationPercentage,
    validateAssetSymbol,
    validatePortfolioAllocationSum,
    validatePortfolioDescription,
    validatePortfolioName
} from '../../utils/validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

interface PortfolioAsset {
  symbol: string;
  name: string;
  assetType: AssetType;
  assetCategory: AssetCategory;
  geographicRegion: Region;
  allocationPercentage: number;
  dollarAmount: number;
  riskRating: number;
}

const initialAsset: PortfolioAsset = {
  symbol: '',
  name: '',
  assetType: AssetType.STOCK,
  assetCategory: AssetCategory.US_LARGE_CAP,
  geographicRegion: Region.US,
  allocationPercentage: 0,
  dollarAmount: 0,
  riskRating: 5,
};

export const CreatePortfolioModal: React.FC<CreatePortfolioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalValue: 0,
  });
  const [assets, setAssets] = useState<PortfolioAsset[]>([{ ...initialAsset }]);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleAssetChange = (index: number, field: keyof PortfolioAsset, value: any) => {
    const newAssets = [...assets];
    newAssets[index] = {
      ...newAssets[index],
      [field]: value,
    };
    
    // Auto-calculate dollar amount if allocation percentage changes
    if (field === 'allocationPercentage' && formData.totalValue > 0) {
      newAssets[index].dollarAmount = (value / 100) * formData.totalValue;
    }
    
    // Auto-calculate allocation percentage if dollar amount changes
    if (field === 'dollarAmount' && formData.totalValue > 0) {
      newAssets[index].allocationPercentage = (value / formData.totalValue) * 100;
    }
    
    setAssets(newAssets);
  };

  const addAsset = () => {
    setAssets([...assets, { ...initialAsset }]);
  };

  const removeAsset = (index: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string | undefined } = {};
    
    // Validate portfolio name
    const nameValidation = validatePortfolioName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }
    
    // Validate description
    const descValidation = validatePortfolioDescription(formData.description);
    if (!descValidation.isValid) {
      newErrors.description = descValidation.error;
    }
    
    // Validate total value
    if (formData.totalValue <= 0) {
      newErrors.totalValue = 'Total value must be greater than 0';
    }
    
    // Validate assets
    const allocationSum = assets.reduce((sum, asset) => sum + asset.allocationPercentage, 0);
    const allocationValidation = validatePortfolioAllocationSum([allocationSum]);
    if (!allocationValidation.isValid) {
      newErrors.allocation = allocationValidation.error;
    }
    
    // Validate individual assets
    assets.forEach((asset, index) => {
      const symbolValidation = validateAssetSymbol(asset.symbol);
      if (!symbolValidation.isValid) {
        newErrors[`asset_${index}_symbol`] = symbolValidation.error;
      }
      
      if (!asset.name.trim()) {
        newErrors[`asset_${index}_name`] = 'Asset name is required';
      }
      
      const allocationValidation = validateAllocationPercentage(asset.allocationPercentage);
      if (!allocationValidation.isValid) {
        newErrors[`asset_${index}_allocation`] = allocationValidation.error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const portfolioData = {
      ...formData,
      assets: assets.map(asset => ({
        ...asset,
        id: Math.random().toString(36).substr(2, 9), // Generate temporary ID
      })),
    };
    
    onSubmit(portfolioData);
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', totalValue: 0 });
    setAssets([{ ...initialAsset }]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create New Portfolio</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Portfolio Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Portfolio Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="Enter portfolio name"
              required
              disabled={isLoading}
            />
            
            <Input
              label="Total Value ($)"
              name="totalValue"
              type="number"
              value={formData.totalValue}
              onChange={handleInputChange}
              error={errors.totalValue}
              placeholder="Enter total portfolio value"
              required
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter portfolio description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
          </div>
          
          {/* Assets Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Portfolio Assets</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAsset}
                leftIcon={<Plus className="h-4 w-4" />}
                disabled={isLoading}
              >
                Add Asset
              </Button>
            </div>
            
            {errors.allocation && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.allocation}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {assets.map((asset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Asset {index + 1}</h4>
                    {assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAsset(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="Symbol"
                      value={asset.symbol}
                      onChange={(e) => handleAssetChange(index, 'symbol', e.target.value)}
                      error={errors[`asset_${index}_symbol`]}
                      placeholder="e.g., AAPL"
                      required
                      disabled={isLoading}
                    />
                    
                    <Input
                      label="Name"
                      value={asset.name}
                      onChange={(e) => handleAssetChange(index, 'name', e.target.value)}
                      error={errors[`asset_${index}_name`]}
                      placeholder="e.g., Apple Inc."
                      required
                      disabled={isLoading}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asset Type
                      </label>
                      <select
                        value={asset.assetType}
                        onChange={(e) => handleAssetChange(index, 'assetType', e.target.value as AssetType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        {Object.values(AssetType).map(type => (
                          <option key={type} value={type}>
                            {type.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <Input
                      label="Allocation %"
                      type="number"
                      value={asset.allocationPercentage}
                      onChange={(e) => handleAssetChange(index, 'allocationPercentage', parseFloat(e.target.value) || 0)}
                      error={errors[`asset_${index}_allocation`]}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      disabled={isLoading}
                    />
                    
                    <Input
                      label="Dollar Amount ($)"
                      type="number"
                      value={asset.dollarAmount}
                      onChange={(e) => handleAssetChange(index, 'dollarAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      disabled={isLoading}
                    />
                    
                    <Input
                      label="Risk Rating (1-10)"
                      type="number"
                      value={asset.riskRating}
                      onChange={(e) => handleAssetChange(index, 'riskRating', parseInt(e.target.value) || 5)}
                      placeholder="5"
                      min="1"
                      max="10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Creating..."
              disabled={isLoading}
            >
              Create Portfolio
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePortfolioModal;

