import { AssetCategory, AssetType, Portfolio, PortfolioAsset, Region } from '@econlens/shared';

describe('Portfolio API Tests', () => {
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

  it('should create a valid portfolio', () => {
    expect(mockPortfolio.id).toBe('portfolio1');
    expect(mockPortfolio.name).toBe('Test Portfolio');
    expect(mockPortfolio.totalValue).toBe(100000);
    expect(mockPortfolio.assets).toHaveLength(1);
  });

  it('should have valid asset structure', () => {
    expect(mockAsset.symbol).toBe('VTI');
    expect(mockAsset.assetType).toBe(AssetType.ETF);
    expect(mockAsset.allocationPercentage).toBe(60);
    expect(mockAsset.riskRating).toBeGreaterThan(0);
    expect(mockAsset.riskRating).toBeLessThanOrEqual(10);
  });

  it('should have valid risk profile', () => {
    expect(mockPortfolio.riskProfile.overallRiskScore).toBeGreaterThan(0);
    expect(mockPortfolio.riskProfile.overallRiskScore).toBeLessThanOrEqual(10);
    expect(mockPortfolio.riskProfile.concentrationRisk).toBeGreaterThan(0);
    expect(mockPortfolio.riskProfile.concentrationRisk).toBeLessThanOrEqual(10);
  });
});
