/**
 * Portfolio Calculation Utilities
 */

import {
    AssetCategory,
    DiversificationAnalysis,
    PortfolioAsset,
    Region,
    RiskProfile
} from '../types/portfolio';

export class PortfolioCalculator {
  /**
   * Calculate concentration risk using Herfindahl-Hirschman Index
   */
  static calculateConcentrationRisk(assets: PortfolioAsset[]): number {
    const hhi = assets.reduce((sum, asset) => {
      const allocation = asset.allocationPercentage / 100;
      return sum + (allocation * allocation);
    }, 0);
    
    // Convert to 1-10 scale (0.1 = low risk, 1.0 = high risk)
    return Math.min(10, hhi * 10);
  }

  /**
   * Calculate sector concentration
   */
  static calculateSectorConcentration(assets: PortfolioAsset[]): number {
    const sectorAllocations: Record<string, number> = {};
    
    assets.forEach(asset => {
      if (asset.sector) {
        sectorAllocations[asset.sector] = (sectorAllocations[asset.sector] || 0) + asset.allocationPercentage;
      }
    });
    
    const maxSectorAllocation = Math.max(...Object.values(sectorAllocations));
    return maxSectorAllocation;
  }

  /**
   * Calculate geographic risk
   */
  static calculateGeographicRisk(assets: PortfolioAsset[]): number {
    const regionAllocations: Record<Region, number> = {} as Record<Region, number>;
    
    assets.forEach(asset => {
      regionAllocations[asset.geographicRegion] = 
        (regionAllocations[asset.geographicRegion] || 0) + asset.allocationPercentage;
    });
    
    // Calculate concentration (higher = more concentrated)
    const totalAllocation = Object.values(regionAllocations).reduce((sum, val) => sum + val, 0);
    const maxRegionAllocation = Math.max(...Object.values(regionAllocations));
    
    return (maxRegionAllocation / totalAllocation) * 100;
  }

  /**
   * Calculate portfolio volatility estimate
   */
  static calculateVolatilityScore(assets: PortfolioAsset[]): number {
    // Weighted average of individual asset volatilities
    const weightedVolatility = assets.reduce((sum, asset) => {
      const weight = asset.allocationPercentage / 100;
      const volatility = asset.volatility || 15; // Default 15% if not provided
      return sum + (volatility * weight);
    }, 0);
    
    // Convert to 1-10 scale (5% = 1, 30% = 10)
    return Math.min(10, Math.max(1, weightedVolatility / 3));
  }

  /**
   * Calculate credit risk exposure
   */
  static calculateCreditRisk(assets: PortfolioAsset[]): number {
    const creditExposure = assets.reduce((sum, asset) => {
      const weight = asset.allocationPercentage / 100;
      
      // Assign credit risk scores by asset type
      let creditRiskScore = 1; // Default low risk
      
      switch (asset.assetType) {
        case 'bond':
          if (asset.creditRating) {
            // Convert credit rating to numeric score
            const rating = asset.creditRating.toUpperCase();
            if (rating.includes('AAA') || rating.includes('AA+')) creditRiskScore = 1;
            else if (rating.includes('AA') || rating.includes('A+')) creditRiskScore = 2;
            else if (rating.includes('A') || rating.includes('BBB+')) creditRiskScore = 3;
            else if (rating.includes('BBB')) creditRiskScore = 4;
            else if (rating.includes('BB')) creditRiskScore = 6;
            else if (rating.includes('B')) creditRiskScore = 8;
            else creditRiskScore = 10;
          } else {
            creditRiskScore = 3; // Default investment grade
          }
          break;
        case 'stock':
        case 'etf':
        case 'mutual_fund':
          creditRiskScore = 2; // Low credit risk for equity
          break;
        case 'cash':
          creditRiskScore = 1; // Minimal credit risk
          break;
        default:
          creditRiskScore = 3;
      }
      
      return sum + (creditRiskScore * weight);
    }, 0);
    
    return Math.min(10, creditExposure);
  }

  /**
   * Calculate overall risk score
   */
  static calculateOverallRiskScore(assets: PortfolioAsset[]): number {
    const concentrationRisk = this.calculateConcentrationRisk(assets);
    const volatilityScore = this.calculateVolatilityScore(assets);
    const creditRisk = this.calculateCreditRisk(assets);
    
    // Weighted average (concentration 40%, volatility 40%, credit 20%)
    const overallRisk = (concentrationRisk * 0.4) + (volatilityScore * 0.4) + (creditRisk * 0.2);
    
    return Math.min(10, Math.max(1, overallRisk));
  }

  /**
   * Calculate comprehensive risk profile
   */
  static calculateRiskProfile(assets: PortfolioAsset[]): RiskProfile {
    return {
      overallRiskScore: this.calculateOverallRiskScore(assets),
      concentrationRisk: this.calculateConcentrationRisk(assets),
      sectorConcentration: this.calculateSectorConcentration(assets),
      geographicRisk: this.calculateGeographicRisk(assets),
      volatilityScore: this.calculateVolatilityScore(assets),
      creditRisk: this.calculateCreditRisk(assets)
    };
  }

  /**
   * Calculate diversification metrics
   */
  static calculateDiversificationAnalysis(assets: PortfolioAsset[]): DiversificationAnalysis {
    // Asset type diversification
    const assetTypes = new Set(assets.map(a => a.assetType));
    const assetTypeDiversification = Math.min(10, assetTypes.size * 2); // 2 points per unique type
    
    // Sector diversification
    const sectors = new Set(assets.filter(a => a.sector).map(a => a.sector));
    const sectorDiversification = Math.min(10, sectors.size * 1.5); // 1.5 points per unique sector
    
    // Geographic diversification
    const regions = new Set(assets.map(a => a.geographicRegion));
    const geographicDiversification = Math.min(10, regions.size * 2.5); // 2.5 points per unique region
    
    // Overall diversification (average of all metrics)
    const overallDiversification = (assetTypeDiversification + sectorDiversification + geographicDiversification) / 3;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (assetTypeDiversification < 6) {
      recommendations.push('Consider diversifying across more asset types');
    }
    
    if (sectorDiversification < 6) {
      recommendations.push('Add exposure to different sectors');
    }
    
    if (geographicDiversification < 6) {
      recommendations.push('Consider international diversification');
    }
    
    return {
      assetTypeDiversification,
      sectorDiversification,
      geographicDiversification,
      overallDiversification,
      recommendations
    };
  }
}

/**
 * Scenario Impact Calculation Utilities
 */
export class ScenarioCalculator {
  /**
   * Calculate asset impact for a given scenario
   */
  static calculateAssetImpact(
    asset: PortfolioAsset,
    impactRange: [number, number],
    volatilityMultiplier: number = 1.0
  ): number {
    // Use midpoint of impact range as base
    const baseImpact = (impactRange[0] + impactRange[1]) / 2;
    
    // Apply volatility adjustment
    const adjustedImpact = baseImpact * volatilityMultiplier;
    
    // Ensure within bounds
    return Math.max(impactRange[0], Math.min(impactRange[1], adjustedImpact));
  }

  /**
   * Calculate total portfolio impact
   */
  static calculatePortfolioImpact(
    assets: PortfolioAsset[],
    impactMap: Map<AssetCategory, [number, number]>
  ): number {
    return assets.reduce((totalImpact, asset) => {
      const impactRange = impactMap.get(asset.assetCategory);
      if (!impactRange) return totalImpact;
      
      const assetImpact = this.calculateAssetImpact(asset, impactRange);
      const weightedImpact = (assetImpact * asset.allocationPercentage) / 100;
      
      return totalImpact + weightedImpact;
    }, 0);
  }
}

/**
 * Utility functions for common calculations
 */
export const CalculationUtils = {
  /**
   * Calculate percentage change
   */
  percentageChange: (oldValue: number, newValue: number): number => {
    return ((newValue - oldValue) / oldValue) * 100;
  },

  /**
   * Calculate compound annual growth rate
   */
  cagr: (beginningValue: number, endingValue: number, years: number): number => {
    return Math.pow(endingValue / beginningValue, 1 / years) - 1;
  },

  /**
   * Calculate present value
   */
  presentValue: (futureValue: number, rate: number, periods: number): number => {
    return futureValue / Math.pow(1 + rate, periods);
  },

  /**
   * Calculate future value
   */
  futureValue: (presentValue: number, rate: number, periods: number): number => {
    return presentValue * Math.pow(1 + rate, periods);
  },

  /**
   * Round to specified decimal places
   */
  round: (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Format percentage
   */
  formatPercentage: (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  }
};
