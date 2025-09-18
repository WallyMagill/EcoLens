import React from 'react';
import { z } from 'zod';

// Test the validation schema
const assetSchema = z.object({
  symbol: z.string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol must be 20 characters or less')
    .regex(/^[A-Za-z0-9]+$/, 'Symbol must contain only letters and numbers'),
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),
  assetType: z.enum(['stock', 'etf', 'mutual_fund', 'bond', 'reit', 'commodity', 'cash']),
  assetCategory: z.string().max(100, 'Category must be 100 characters or less').optional(),
  allocationPercentage: z.number()
    .min(0.01, 'Allocation must be greater than 0%')
    .max(100, 'Allocation must be 100% or less'),
  dollarAmount: z.number()
    .min(0, 'Dollar amount must be positive'),
  shares: z.number().min(0, 'Shares must be positive').optional(),
  avgPurchasePrice: z.number().min(0, 'Purchase price must be positive').optional(),
  sector: z.string().max(100, 'Sector must be 100 characters or less').optional(),
  geographicRegion: z.string().max(100, 'Region must be 100 characters or less').optional(),
  riskRating: z.number().min(1, 'Risk rating must be at least 1').max(10, 'Risk rating cannot exceed 10').optional(),
});

const portfolioAssetsSchema = z.object({
  assets: z.array(assetSchema)
    .min(1, 'At least one asset is required')
    .max(50, 'Maximum 50 assets allowed')
    .refine(
      (assets) => {
        const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocationPercentage, 0);
        return Math.abs(totalAllocation - 100) <= 0.01; // Allow 0.01% tolerance
      },
      {
        message: 'Total allocation must equal 100% (±0.01% tolerance)',
        path: ['assets'],
      }
    )
    .refine(
      (assets) => {
        const symbols = assets.map(asset => asset.symbol.toUpperCase());
        return symbols.length === new Set(symbols).size;
      },
      {
        message: 'Asset symbols must be unique',
        path: ['assets'],
      }
    ),
});

const AssetValidationTest: React.FC = () => {
  const testValidPortfolio = () => {
    const validData = {
      assets: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'stock' as const,
          allocationPercentage: 60,
          dollarAmount: 60000,
          riskRating: 7,
        },
        {
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetType: 'etf' as const,
          allocationPercentage: 40,
          dollarAmount: 40000,
          riskRating: 5,
        }
      ]
    };

    try {
      const result = portfolioAssetsSchema.parse(validData);
      console.log('✅ Valid portfolio test passed:', result);
      return true;
    } catch (error) {
      console.error('❌ Valid portfolio test failed:', error);
      return false;
    }
  };

  const testInvalidAllocation = () => {
    const invalidData = {
      assets: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'stock' as const,
          allocationPercentage: 60,
          dollarAmount: 60000,
          riskRating: 7,
        },
        {
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          assetType: 'etf' as const,
          allocationPercentage: 50, // This makes total 110%
          dollarAmount: 50000,
          riskRating: 5,
        }
      ]
    };

    try {
      portfolioAssetsSchema.parse(invalidData);
      console.log('❌ Invalid allocation test should have failed');
      return false;
    } catch (error) {
      console.log('✅ Invalid allocation test correctly failed:', error);
      return true;
    }
  };

  const testDuplicateSymbols = () => {
    const invalidData = {
      assets: [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          assetType: 'stock' as const,
          allocationPercentage: 50,
          dollarAmount: 50000,
          riskRating: 7,
        },
        {
          symbol: 'AAPL', // Duplicate symbol
          name: 'Apple Inc. (Duplicate)',
          assetType: 'stock' as const,
          allocationPercentage: 50,
          dollarAmount: 50000,
          riskRating: 7,
        }
      ]
    };

    try {
      portfolioAssetsSchema.parse(invalidData);
      console.log('❌ Duplicate symbols test should have failed');
      return false;
    } catch (error) {
      console.log('✅ Duplicate symbols test correctly failed:', error);
      return true;
    }
  };

  const runTests = () => {
    console.log('🧪 Running Asset Validation Tests...');
    const results = [
      testValidPortfolio(),
      testInvalidAllocation(),
      testDuplicateSymbols(),
    ];
    
    const passed = results.filter(Boolean).length;
    const total = results.length;
    
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All validation tests passed!');
    } else {
      console.log('⚠️ Some validation tests failed');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Asset Validation Test</h3>
      <button
        onClick={runTests}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Validation Tests
      </button>
      <p className="mt-2 text-sm text-gray-600">
        Check the browser console for test results
      </p>
    </div>
  );
};

export default AssetValidationTest;
