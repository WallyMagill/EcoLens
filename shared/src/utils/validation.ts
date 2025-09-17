/**
 * Portfolio Validation Utilities
 */

import {
    AssetType,
    CSVImportData,
    Portfolio,
    PortfolioAsset,
    ValidationError,
    ValidationErrorType
} from '../types/portfolio';

export class PortfolioValidator {
  /**
   * Validate portfolio allocation percentages sum to 100%
   */
  static validateAllocationSum(assets: PortfolioAsset[]): ValidationError[] {
    const total = assets.reduce((sum, asset) => sum + asset.allocationPercentage, 0);
    const tolerance = 0.01; // Allow 0.01% tolerance
    
    if (Math.abs(total - 100) > tolerance) {
      return [{
        type: ValidationErrorType.INVALID_ALLOCATION_SUM,
        message: `Portfolio allocation sums to ${total.toFixed(2)}%, expected 100%`,
        suggestedFix: 'Adjust individual asset allocations to sum to 100%'
      }];
    }
    
    return [];
  }

  /**
   * Validate dollar amounts are consistent with portfolio total
   */
  static validateDollarConsistency(assets: PortfolioAsset[], portfolioTotal: number): ValidationError[] {
    const total = assets.reduce((sum, asset) => sum + asset.dollarAmount, 0);
    const tolerance = 0.01;
    
    if (Math.abs(total - portfolioTotal) > tolerance) {
      return [{
        type: ValidationErrorType.INVALID_DOLLAR_CONSISTENCY,
        message: `Asset dollar amounts sum to $${total.toFixed(2)}, portfolio total is $${portfolioTotal.toFixed(2)}`,
        suggestedFix: 'Adjust dollar amounts to match portfolio total'
      }];
    }
    
    return [];
  }

  /**
   * Validate asset type is supported
   */
  static validateAssetType(assetType: string): ValidationError[] {
    if (!Object.values(AssetType).includes(assetType as AssetType)) {
      return [{
        type: ValidationErrorType.UNSUPPORTED_ASSET_TYPE,
        message: `Unsupported asset type: ${assetType}`,
        field: 'assetType',
        suggestedFix: `Use one of: ${Object.values(AssetType).join(', ')}`
      }];
    }
    
    return [];
  }

  /**
   * Validate symbol format
   */
  static validateSymbolFormat(symbol: string): ValidationError[] {
    const symbolRegex = /^[A-Za-z0-9]{1,20}$/;
    
    if (!symbolRegex.test(symbol)) {
      return [{
        type: ValidationErrorType.INVALID_SYMBOL_FORMAT,
        message: `Invalid symbol format: ${symbol}`,
        field: 'symbol',
        suggestedFix: 'Use 1-20 alphanumeric characters only'
      }];
    }
    
    return [];
  }

  /**
   * Check for concentration risk warnings
   */
  static checkConcentrationRisk(assets: PortfolioAsset[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check for single asset > 80%
    const maxAllocation = Math.max(...assets.map(a => a.allocationPercentage));
    if (maxAllocation > 80) {
      errors.push({
        type: ValidationErrorType.CONCENTRATION_WARNING,
        message: `Single asset allocation of ${maxAllocation.toFixed(1)}% exceeds 80% limit`,
        suggestedFix: 'Consider diversifying to reduce concentration risk'
      });
    }
    
    // Check for cash > 50%
    const cashAssets = assets.filter(a => a.assetType === AssetType.CASH);
    const cashAllocation = cashAssets.reduce((sum, a) => sum + a.allocationPercentage, 0);
    if (cashAllocation > 50) {
      errors.push({
        type: ValidationErrorType.CONCENTRATION_WARNING,
        message: `Cash allocation of ${cashAllocation.toFixed(1)}% exceeds 50% limit`,
        suggestedFix: 'Consider investing excess cash for better returns'
      });
    }
    
    return errors;
  }

  /**
   * Validate CSV import data
   */
  static validateCSVData(csvData: CSVImportData[]): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check for required fields
    csvData.forEach((row, index) => {
      if (!row.symbol || !row.name || !row.assetType || 
          row.allocationPercentage === undefined || row.dollarAmount === undefined) {
        errors.push({
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
          message: `Row ${index + 1}: Missing required fields`,
          suggestedFix: 'Ensure Symbol, Name, Asset Type, Allocation %, and Dollar Amount are provided'
        });
      }
    });
    
    // Validate each asset
    csvData.forEach((row, index) => {
      errors.push(...this.validateAssetType(row.assetType));
      errors.push(...this.validateSymbolFormat(row.symbol));
    });
    
    return errors;
  }

  /**
   * Comprehensive portfolio validation
   */
  static validatePortfolio(portfolio: Portfolio): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Basic validations
    errors.push(...this.validateAllocationSum(portfolio.assets));
    errors.push(...this.validateDollarConsistency(portfolio.assets, portfolio.totalValue));
    
    // Asset validations
    portfolio.assets.forEach(asset => {
      errors.push(...this.validateAssetType(asset.assetType));
      errors.push(...this.validateSymbolFormat(asset.symbol));
    });
    
    // Risk validations
    errors.push(...this.checkConcentrationRisk(portfolio.assets));
    
    return errors;
  }
}

/**
 * Utility functions for common validations
 */
export const ValidationUtils = {
  /**
   * Check if value is within acceptable range
   */
  isWithinRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate UUID format
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};
