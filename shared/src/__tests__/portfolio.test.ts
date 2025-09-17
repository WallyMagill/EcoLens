import { AssetCategory, AssetType, Portfolio, PortfolioAsset, Region } from '../types/portfolio';
import { PortfolioValidator } from '../utils/validation';

describe('Portfolio Types and Validation', () => {
  const mockAsset: PortfolioAsset = {
    id: 'asset1',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    assetType: AssetType.ETF,
    assetCategory: AssetCategory.US_LARGE_CAP,
    geographicRegion: Region.US,
    allocationPercentage: 60,
    dollarAmount: 60000,
    riskRating: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPortfolio: Portfolio = {
    id: 'portfolio1',
    userId: 'user1',
    name: 'Test Portfolio',
    totalValue: 100000,
    currency: 'USD',
    assets: [mockAsset],
    analysisCount: 0,
    riskProfile: {
      overallRiskScore: 6,
      concentrationRisk: 5,
      sectorConcentration: 60,
      geographicRisk: 100,
      volatilityScore: 6,
      creditRisk: 2,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
  };

  describe('PortfolioValidator', () => {
    it('should validate correct allocation sum', () => {
      const errors = PortfolioValidator.validateAllocationSum([mockAsset]);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid allocation sum', () => {
      const invalidAsset = { ...mockAsset, allocationPercentage: 50 };
      const errors = PortfolioValidator.validateAllocationSum([invalidAsset]);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_ALLOCATION_SUM');
    });

    it('should validate asset type', () => {
      const errors = PortfolioValidator.validateAssetType('etf');
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid asset type', () => {
      const errors = PortfolioValidator.validateAssetType('invalid_type');
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('UNSUPPORTED_ASSET_TYPE');
    });

    it('should validate symbol format', () => {
      const errors = PortfolioValidator.validateSymbolFormat('VTI');
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid symbol format', () => {
      const errors = PortfolioValidator.validateSymbolFormat('invalid symbol!');
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_SYMBOL_FORMAT');
    });
  });
});
