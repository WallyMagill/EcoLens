// API Response Types
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  totalValue: number;
  currency: string;
  assets?: PortfolioAsset[];
  lastAnalyzedAt?: string;
  analysisCount: number;
  riskProfile?: RiskProfile;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'reit' | 'commodity' | 'cash';
  assetCategory?: string;
  allocationPercentage: number;
  dollarAmount: number;
  shares?: number;
  avgPurchasePrice?: number;
  sector?: string;
  geographicRegion?: string;
  riskRating?: number;
  createdAt: string;
  updatedAt: string;
}

// Request types for portfolio creation
export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  totalValue: number;
  currency: string;
  assets: Omit<PortfolioAsset, 'id' | 'createdAt' | 'updatedAt'>[];
}

// Legacy asset interface for backward compatibility
export interface LegacyPortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  portfolioId: string;
  createdAt: string;
  updatedAt: string;
  parameters?: ScenarioParameters;
}

export interface ScenarioParameters {
  timeHorizon: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketConditions: string;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

// Risk Profile Interface
export interface RiskProfile {
  overallRiskScore: number;
  concentrationRisk: number;
  sectorConcentration: number;
  geographicRisk: number;
  volatilityScore: number;
  creditRisk: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}