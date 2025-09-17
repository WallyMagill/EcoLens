/**
 * Constants and Configuration for EconLens
 */

import { AssetCategory, Region } from '../types/portfolio';

/**
 * Supported Asset Categories with Metadata
 */
export const ASSET_CATEGORIES = {
  // Equity Categories
  [AssetCategory.US_LARGE_CAP]: {
    name: 'US Large Cap',
    description: 'Large capitalization US stocks',
    typicalVolatility: 15,
    riskLevel: 6
  },
  [AssetCategory.US_MID_CAP]: {
    name: 'US Mid Cap',
    description: 'Mid capitalization US stocks',
    typicalVolatility: 18,
    riskLevel: 7
  },
  [AssetCategory.US_SMALL_CAP]: {
    name: 'US Small Cap',
    description: 'Small capitalization US stocks',
    typicalVolatility: 22,
    riskLevel: 8
  },
  [AssetCategory.INTERNATIONAL_DEVELOPED]: {
    name: 'International Developed',
    description: 'Developed market international stocks',
    typicalVolatility: 17,
    riskLevel: 7
  },
  [AssetCategory.EMERGING_MARKETS]: {
    name: 'Emerging Markets',
    description: 'Emerging market stocks',
    typicalVolatility: 25,
    riskLevel: 9
  },
  
  // Bond Categories
  [AssetCategory.GOVERNMENT_BONDS]: {
    name: 'Government Bonds',
    description: 'US Treasury and government bonds',
    typicalVolatility: 3,
    riskLevel: 2
  },
  [AssetCategory.CORPORATE_BONDS]: {
    name: 'Corporate Bonds',
    description: 'Investment grade corporate bonds',
    typicalVolatility: 5,
    riskLevel: 3
  },
  [AssetCategory.HIGH_YIELD_BONDS]: {
    name: 'High Yield Bonds',
    description: 'Below investment grade corporate bonds',
    typicalVolatility: 12,
    riskLevel: 6
  },
  [AssetCategory.INTERNATIONAL_BONDS]: {
    name: 'International Bonds',
    description: 'Non-US government and corporate bonds',
    typicalVolatility: 6,
    riskLevel: 4
  },
  [AssetCategory.INFLATION_PROTECTED]: {
    name: 'Inflation Protected',
    description: 'TIPS and inflation-protected securities',
    typicalVolatility: 4,
    riskLevel: 2
  },
  
  // Alternative Categories
  [AssetCategory.REAL_ESTATE]: {
    name: 'Real Estate',
    description: 'REITs and real estate investments',
    typicalVolatility: 16,
    riskLevel: 6
  },
  [AssetCategory.COMMODITIES]: {
    name: 'Commodities',
    description: 'Physical commodities and commodity funds',
    typicalVolatility: 20,
    riskLevel: 7
  },
  [AssetCategory.CASH_EQUIVALENTS]: {
    name: 'Cash Equivalents',
    description: 'Money market funds and cash',
    typicalVolatility: 0.5,
    riskLevel: 1
  }
};

/**
 * Geographic Regions with Metadata
 */
export const REGIONS = {
  [Region.US]: {
    name: 'United States',
    currency: 'USD',
    riskLevel: 3
  },
  [Region.DEVELOPED_INTERNATIONAL]: {
    name: 'Developed International',
    currency: 'Mixed',
    riskLevel: 4
  },
  [Region.EMERGING_MARKETS]: {
    name: 'Emerging Markets',
    currency: 'Mixed',
    riskLevel: 7
  },
  [Region.GLOBAL]: {
    name: 'Global',
    currency: 'Mixed',
    riskLevel: 5
  }
};

/**
 * Economic Scenarios and their Impact Factors
 */
export const ECONOMIC_SCENARIOS = {
  RECESSION: {
    name: 'Economic Recession',
    description: 'Period of economic decline with falling GDP and rising unemployment',
    duration: '12-24 months',
    frequency: 'Every 7-10 years'
  },
  INFLATION: {
    name: 'High Inflation',
    description: 'Rapid increase in general price levels',
    duration: '6-18 months',
    frequency: 'Occasional periods'
  },
  INTEREST_RATE_RISE: {
    name: 'Rising Interest Rates',
    description: 'Federal Reserve increasing benchmark rates',
    duration: '12-36 months',
    frequency: 'Cyclical'
  },
  MARKET_CRASH: {
    name: 'Market Crash',
    description: 'Sharp, sudden decline in stock prices',
    duration: '3-12 months',
    frequency: 'Every 10-15 years'
  },
  CREDIT_CRUNCH: {
    name: 'Credit Crunch',
    description: 'Reduction in availability of credit',
    duration: '6-24 months',
    frequency: 'Occasional'
  }
};

/**
 * Validation Constants
 */
export const VALIDATION_LIMITS = {
  MAX_ALLOCATION_SINGLE_ASSET: 80,
  MAX_CASH_ALLOCATION: 50,
  MIN_ALLOCATION_PER_ASSET: 0.1,
  MAX_ASSETS_PER_PORTFOLIO: 50,
  MIN_ASSETS_PER_PORTFOLIO: 1,
  ALLOCATION_TOLERANCE: 0.01,
  DOLLAR_TOLERANCE: 0.01
};

/**
 * Risk Rating Scales
 */
export const RISK_SCALES = {
  CONCENTRATION_RISK: {
    LOW: 3,
    MEDIUM: 6,
    HIGH: 10
  },
  VOLATILITY_SCORE: {
    LOW: 3,
    MEDIUM: 6,
    HIGH: 10
  },
  OVERALL_RISK: {
    CONSERVATIVE: 3,
    MODERATE: 6,
    AGGRESSIVE: 10
  }
};

/**
 * CSV Import Configuration
 */
export const CSV_CONFIG = {
  REQUIRED_COLUMNS: ['Symbol', 'Name', 'Asset Type', 'Allocation %', 'Dollar Amount'],
  OPTIONAL_COLUMNS: [
    'Category',
    'Sector', 
    'Region',
    'Shares',
    'Avg Price',
    'Expense Ratio',
    'Dividend Yield'
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['.csv', '.xlsx', '.xls']
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Database Configuration
 */
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  QUERY_TIMEOUT: 30000, // 30 seconds
  MAX_CONNECTIONS: 20,
  MIN_CONNECTIONS: 2
};

/**
 * AI Analysis Configuration
 */
export const AI_CONFIG = {
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  RESPONSE_TIMEOUT: 30000, // 30 seconds
  QUALITY_THRESHOLD: 70 // Minimum quality score for responses
};

/**
 * Common Error Messages
 */
export const ERROR_MESSAGES = {
  PORTFOLIO_NOT_FOUND: 'Portfolio not found',
  INVALID_ALLOCATION: 'Portfolio allocation must sum to 100%',
  INVALID_ASSET_TYPE: 'Unsupported asset type',
  INVALID_SYMBOL: 'Invalid asset symbol format',
  CONCENTRATION_WARNING: 'Portfolio has high concentration risk',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error'
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  PORTFOLIO_CREATED: 'Portfolio created successfully',
  PORTFOLIO_UPDATED: 'Portfolio updated successfully',
  PORTFOLIO_DELETED: 'Portfolio deleted successfully',
  ANALYSIS_COMPLETED: 'Analysis completed successfully',
  CSV_IMPORTED: 'Portfolio imported successfully'
};

/**
 * Environment-Specific Configuration
 */
export const ENVIRONMENT_CONFIG = {
  DEVELOPMENT: {
    LOG_LEVEL: 'debug',
    ENABLE_MOCK_DATA: true,
    ENABLE_DEBUG_ENDPOINTS: true
  },
  PRODUCTION: {
    LOG_LEVEL: 'info',
    ENABLE_MOCK_DATA: false,
    ENABLE_DEBUG_ENDPOINTS: false
  },
  TEST: {
    LOG_LEVEL: 'error',
    ENABLE_MOCK_DATA: true,
    ENABLE_DEBUG_ENDPOINTS: false
  }
};
