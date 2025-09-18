import { AlertCircle, DollarSign, Plus, Trash2, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { PortfolioAsset } from '../../types/api';

// Asset type options
const ASSET_TYPES = [
  { value: 'stock', label: 'Stock' },
  { value: 'etf', label: 'ETF' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'bond', label: 'Bond' },
  { value: 'reit', label: 'REIT' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'cash', label: 'Cash' },
] as const;

// Clean Asset interface for form state
interface Asset {
  symbol: string;
  name: string;
  assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'reit' | 'commodity' | 'cash';
  allocationPercentage: number;
  dollarAmount: number;
  // Optional fields
  assetCategory?: string;
  sector?: string;
  geographicRegion?: string;
  riskRating?: number;
  shares?: number;
  avgPurchasePrice?: number;
}

// Validation error interface
interface ValidationError {
  index?: number;
  field?: string;
  message: string;
}

// Component props
interface AssetInputProps {
  initialAssets?: Omit<PortfolioAsset, 'id'>[];
  totalValue: number;
  onSubmit: (assets: Omit<PortfolioAsset, 'id'>[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Helper function to create empty asset
const createEmptyAsset = (): Asset => ({
  symbol: '',
  name: '',
  assetType: 'stock',
  allocationPercentage: 0,
  dollarAmount: 0,
  riskRating: 5,
});

// Helper function to convert Asset to PortfolioAsset format
const convertToPortfolioAsset = (asset: Asset): Omit<PortfolioAsset, 'id'> => ({
  symbol: asset.symbol.toUpperCase(),
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Validation function
const validateAssets = (assets: Asset[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Check required fields for each asset
  assets.forEach((asset, index) => {
    if (!asset.symbol.trim()) {
      errors.push({ index, field: 'symbol', message: 'Symbol is required' });
    } else if (!/^[A-Za-z0-9]+$/.test(asset.symbol)) {
      errors.push({ index, field: 'symbol', message: 'Symbol must contain only letters and numbers' });
    }
    
    if (!asset.name.trim()) {
      errors.push({ index, field: 'name', message: 'Name is required' });
    }
    
    if (!asset.assetType) {
      errors.push({ index, field: 'assetType', message: 'Asset type is required' });
    }
    
    if (asset.allocationPercentage <= 0) {
      errors.push({ index, field: 'allocationPercentage', message: 'Allocation must be greater than 0%' });
    }
  });
  
  // Check allocation sum
  const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocationPercentage, 0);
  if (Math.abs(totalAllocation - 100) > 0.01) {
    errors.push({ field: 'allocation', message: `Total allocation must equal 100% (currently ${totalAllocation.toFixed(2)}%)` });
  }
  
  // Check duplicate symbols
  const symbols = assets.map(a => a.symbol.toUpperCase()).filter(s => s);
  if (symbols.length !== new Set(symbols).size) {
    errors.push({ field: 'symbols', message: 'Asset symbols must be unique' });
  }
  
  return errors;
};

const AssetInput: React.FC<AssetInputProps> = ({
  initialAssets = [],
  totalValue,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  // Simple state management
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (initialAssets.length > 0) {
      return initialAssets.map(asset => ({
        symbol: asset.symbol,
        name: asset.name,
        assetType: asset.assetType,
        allocationPercentage: asset.allocationPercentage,
        dollarAmount: asset.dollarAmount,
        assetCategory: asset.assetCategory,
        sector: asset.sector,
        geographicRegion: asset.geographicRegion,
        riskRating: asset.riskRating,
        shares: asset.shares,
        avgPurchasePrice: asset.avgPurchasePrice,
      }));
    }
    return [createEmptyAsset()];
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Reactive calculations
  const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocationPercentage, 0);
  const isValidAllocation = Math.abs(totalAllocation - 100) <= 0.01;

  // Update dollar amounts when totalValue changes
  useEffect(() => {
    const updatedAssets = assets.map(asset => ({
      ...asset,
      dollarAmount: (asset.allocationPercentage / 100) * totalValue
    }));
    setAssets(updatedAssets);
  }, [totalValue]);

  // Clean event handlers
  const updateAsset = (index: number, field: keyof Asset, value: any) => {
    const updatedAssets = [...assets];
    updatedAssets[index] = {
      ...updatedAssets[index],
      [field]: value,
    };
    
    // Recalculate dollar amount if allocation percentage changed
    if (field === 'allocationPercentage') {
      updatedAssets[index].dollarAmount = (value / 100) * totalValue;
    }
    
    setAssets(updatedAssets);
  };

  const addAsset = () => {
    setAssets([...assets, createEmptyAsset()]);
  };

  const removeAsset = (index: number) => {
    if (assets.length > 1) {
      const updatedAssets = assets.filter((_, i) => i !== index);
      setAssets(updatedAssets);
    }
  };

  const validateAndSubmit = () => {
    const errors = validateAssets(assets);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      const portfolioAssets = assets.map(convertToPortfolioAsset);
      onSubmit(portfolioAssets);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Assets</h3>
          <div className="text-sm text-gray-600">
            Total: ${totalValue.toLocaleString()} | 
            Allocation: {totalAllocation.toFixed(2)}% |
            Assets: {assets.length}
          </div>
        </div>
      </div>

      {/* Asset list */}
      {assets.map((asset, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Asset {index + 1}</h4>
            {assets.length > 1 && (
              <button
                type="button"
                onClick={() => removeAsset(index)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Required fields in clean grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol *
              </label>
              <input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={asset.symbol}
                onChange={(e) => updateAsset(index, 'symbol', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                placeholder="Name (e.g., Apple Inc.)"
                value={asset.name}
                onChange={(e) => updateAsset(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type *
              </label>
              <select
                value={asset.assetType}
                onChange={(e) => updateAsset(index, 'assetType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                {ASSET_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allocation %
                </label>
                <input
                  type="number"
                  placeholder="Allocation %"
                  value={asset.allocationPercentage || ''}
                  onChange={(e) => updateAsset(index, 'allocationPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dollar Amount
                </label>
                <input
                  type="text"
                  placeholder="Dollar amount"
                  value={`$${asset.dollarAmount.toLocaleString()}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Optional fields in collapsible section */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Additional Details (Optional)
            </summary>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Category
                </label>
                <input
                  type="text"
                  placeholder="e.g., Technology"
                  value={asset.assetCategory || ''}
                  onChange={(e) => updateAsset(index, 'assetCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g., Technology"
                  value={asset.sector || ''}
                  onChange={(e) => updateAsset(index, 'sector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geographic Region
                </label>
                <input
                  type="text"
                  placeholder="e.g., North America"
                  value={asset.geographicRegion || ''}
                  onChange={(e) => updateAsset(index, 'geographicRegion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Rating (1-10)
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={asset.riskRating || ''}
                  onChange={(e) => updateAsset(index, 'riskRating', parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shares
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={asset.shares || ''}
                  onChange={(e) => updateAsset(index, 'shares', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="150.00"
                    value={asset.avgPurchasePrice || ''}
                    onChange={(e) => updateAsset(index, 'avgPurchasePrice', parseFloat(e.target.value) || undefined)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Asset summary */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-700">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span className="font-medium">
                  Value: ${asset.dollarAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                <span className="font-medium">
                  Allocation: {asset.allocationPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            {asset.symbol && (
              <div className="mt-2 text-xs text-gray-500">
                {asset.symbol} • {asset.name}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add asset button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addAsset}
          className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={assets.length >= 50}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Asset
        </button>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">Please fix these errors:</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    {error.index !== undefined ? `Asset ${error.index + 1}: ` : ''}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Submit buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={validateAndSubmit}
          disabled={!isValidAllocation || validationErrors.length > 0 || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Assets'}
        </button>
      </div>
    </div>
  );
};

export default AssetInput;