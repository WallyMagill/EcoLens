/**
 * Core Portfolio Types for EconLens
 * Based on Portfolio Specification documentation
 */

export interface Portfolio {
  // Identity and Metadata
  id: string;                    // UUID
  userId: string;                // Owner reference
  name: string;                  // User-defined name (max 200 chars)
  description?: string;          // Optional description (max 1000 chars)
  
  // Financial Data
  totalValue: number;            // Total portfolio value in USD
  currency: string;              // Always "USD" for MVP
  
  // Asset Holdings
  assets: PortfolioAsset[];      // Array of asset holdings
  
  // Analysis Data
  lastAnalyzedAt?: Date;         // Last scenario analysis timestamp
  analysisCount: number;         // Total analyses run
  riskProfile: RiskProfile;      // Calculated risk characteristics
  
  // Management
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;             // For sharing functionality
  shareToken?: string;           // Public sharing token
}

export interface PortfolioAsset {
  // Identity
  id: string;                    // UUID
  symbol: string;                // Ticker symbol (max 20 chars)
  name: string;                  // Full asset name (max 200 chars)
  
  // Classification
  assetType: AssetType;          // Primary classification
  assetCategory: AssetCategory;  // Detailed subcategory
  sector?: string;               // GICS sector classification
  geographicRegion: Region;      // Geographic exposure
  
  // Holdings Data
  allocationPercentage: number;  // Percentage of portfolio (0-100)
  dollarAmount: number;          // Dollar value of holding
  shares?: number;               // Number of shares (if applicable)
  avgPurchasePrice?: number;     // Average cost basis
  
  // Analysis Properties
  expenseRatio?: number;         // Annual fee (for ETFs/mutual funds)
  dividendYield?: number;        // Current dividend yield
  peRatio?: number;              // P/E ratio (for equity assets)
  duration?: number;             // Duration (for bond assets)
  creditRating?: string;         // Credit rating (for bond assets)
  
  // Risk Assessment
  riskRating: number;            // Internal risk score (1-10)
  volatility?: number;           // Historical volatility
  beta?: number;                 // Beta vs market (for equities)
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export enum AssetType {
  STOCK = 'stock',
  ETF = 'etf', 
  MUTUAL_FUND = 'mutual_fund',
  BOND = 'bond',
  REIT = 'reit',
  COMMODITY = 'commodity',
  CASH = 'cash'
}

export enum AssetCategory {
  // Equity Categories
  US_LARGE_CAP = 'us_large_cap',
  US_MID_CAP = 'us_mid_cap',
  US_SMALL_CAP = 'us_small_cap',
  INTERNATIONAL_DEVELOPED = 'international_developed',
  EMERGING_MARKETS = 'emerging_markets',
  
  // Bond Categories  
  GOVERNMENT_BONDS = 'government_bonds',
  CORPORATE_BONDS = 'corporate_bonds',
  HIGH_YIELD_BONDS = 'high_yield_bonds',
  INTERNATIONAL_BONDS = 'international_bonds',
  INFLATION_PROTECTED = 'inflation_protected',
  
  // Alternative Categories
  REAL_ESTATE = 'real_estate',
  COMMODITIES = 'commodities',
  CASH_EQUIVALENTS = 'cash_equivalents'
}

export enum Region {
  US = 'us',
  DEVELOPED_INTERNATIONAL = 'developed_international',
  EMERGING_MARKETS = 'emerging_markets',
  GLOBAL = 'global'
}

export interface RiskProfile {
  overallRiskScore: number;      // 1-10 composite score
  concentrationRisk: number;     // Herfindahl-Hirschman Index
  sectorConcentration: number;   // Max sector allocation
  geographicRisk: number;        // Geographic concentration
  volatilityScore: number;       // Portfolio volatility estimate
  creditRisk: number;            // Credit exposure assessment
}

// CSV Import Types
export interface CSVImportData {
  symbol: string;
  name: string;
  assetType: AssetType;
  category?: AssetCategory;
  sector?: string;
  region?: Region;
  allocationPercentage: number;
  dollarAmount: number;
  shares?: number;
  avgPrice?: number;
  expenseRatio?: number;
  dividendYield?: number;
}

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  field?: string;
  suggestedFix?: string;
}

export enum ValidationErrorType {
  INVALID_ALLOCATION_SUM = 'INVALID_ALLOCATION_SUM',
  INVALID_DOLLAR_CONSISTENCY = 'INVALID_DOLLAR_CONSISTENCY',
  UNSUPPORTED_ASSET_TYPE = 'UNSUPPORTED_ASSET_TYPE',
  INVALID_SYMBOL_FORMAT = 'INVALID_SYMBOL_FORMAT',
  CONCENTRATION_WARNING = 'CONCENTRATION_WARNING',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD'
}

// Scenario Analysis Types
export interface ScenarioImpact {
  assetCategory: AssetCategory;
  impactRange: [number, number];      // Min/max percentage impact
  primaryDrivers: string[];           // Economic factors
  volatilityMultiplier: number;       // Increased volatility factor
  correlationAdjustment: number;      // Change in correlation with other assets
}

export interface AssetImpactResult {
  impactPercentage: number;
  impactDollar: number;
  confidenceLevel: number;
  primaryDrivers: string[];
}

// AI Analysis Types
export interface AIAnalysisInput {
  portfolio: {
    name: string;
    totalValue: number;
    currency: string;
    assetCount: number;
    createdDate: string;
    lastModified: string;
  };
  assetAllocation: {
    summary: AssetAllocationSummary;
    detailedBreakdown: AIFormattedAsset[];
    diversificationMetrics: DiversificationAnalysis;
    riskCharacteristics: RiskProfile;
  };
  scenarioContext: {
    scenarioName: string;
    scenarioDescription: string;
    economicParameters: Record<string, any>;
    historicalContext: string[];
    timeHorizon: string;
  };
  calculationResults: {
    totalImpactPercentage: number;
    totalImpactDollar: number;
    confidenceScore: number;
    assetLevelImpacts: AssetImpactDetails[];
    portfolioRiskChanges: RiskChangeAnalysis;
  };
  userProfile: {
    investmentExperience: 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    userType: 'casual_investor' | 'active_trader' | 'financial_advisor';
    investmentHorizon: 'short' | 'medium' | 'long';
    preferredAnalysisDepth: 'simple' | 'detailed' | 'comprehensive';
  };
}

export interface AIFormattedAsset {
  symbol: string;
  name: string;
  description: string;
  allocationPercentage: number;
  dollarAmount: number;
  assetClass: string;
  riskLevel: number;
  volatilityDescription: string;
  economicSensitivity: {
    interestRates: 'low' | 'medium' | 'high';
    inflation: 'low' | 'medium' | 'high';
    economicGrowth: 'low' | 'medium' | 'high';
    marketSentiment: 'low' | 'medium' | 'high';
  };
  keyCharacteristics: string[];
}

export interface AIAnalysisOutput {
  executiveSummary: {
    overallImpact: string;
    confidenceAssessment: string;
    keyTakeaway: string;
  };
  riskAnalysis: {
    primaryRisks: RiskInsight[];
    riskMitigation: string[];
    warningSignals: string[];
  };
  opportunityAnalysis: {
    opportunities: OpportunityInsight[];
    strategicActions: string[];
    timingConsiderations: string[];
  };
  educationalInsights: {
    economicExplanation: string;
    historicalComparison: string;
    learningPoints: string[];
  };
  recommendations: {
    immediateActions: string[];
    monitoringItems: string[];
    portfolioAdjustments: string[];
    riskManagement: string[];
  };
  responseMetadata: {
    qualityScore: number;
    responseTime: number;
    modelVersion: string;
    promptVersion: string;
  };
}

// Supporting Types
export interface AssetAllocationSummary {
  totalAssets: number;
  totalValue: number;
  assetTypeBreakdown: Record<AssetType, number>;
  categoryBreakdown: Record<AssetCategory, number>;
  regionBreakdown: Record<Region, number>;
}

export interface DiversificationAnalysis {
  sectorDiversification: number;
  geographicDiversification: number;
  assetTypeDiversification: number;
  overallDiversification: number;
  recommendations: string[];
}

export interface AssetImpactDetails {
  symbol: string;
  name: string;
  impactPercentage: number;
  impactDollar: number;
  confidenceLevel: number;
  primaryDrivers: string[];
}

export interface RiskChangeAnalysis {
  riskScoreChange: number;
  concentrationRiskChange: number;
  volatilityChange: number;
  correlationChanges: Record<string, number>;
}

export interface RiskInsight {
  riskType: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
}

export interface OpportunityInsight {
  opportunityType: string;
  description: string;
  potential: 'low' | 'medium' | 'high';
  timeframe: string;
  considerations: string[];
}
