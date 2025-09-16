# EconLens Portfolio Data Specification

> **Code Disclaimer**: All code examples in this document are architectural references and implementation guides. Use AI tools (Claude, Cursor, GitHub Copilot) to generate, analyze, and refine the actual production code based on these specifications.

## Executive Summary

This document defines the complete data model, supported asset types, analysis methodology, and file format specifications for EconLens portfolios. The design balances simplicity for MVP launch with extensibility for future asset classes and analysis capabilities.

**Purpose**: Complete technical specification for portfolio data handling and AI analysis  
**Scope**: Data models, CSV formats, scenario analysis, and AI integration  
**Target Audience**: Developers implementing EconLens portfolio functionality

## Executive Summary

This document defines the complete data model, supported asset types, analysis methodology, and file format specifications for EconLens portfolios. The design balances simplicity for MVP launch with extensibility for future asset classes and analysis capabilities.

## Supported Asset Types and Scope

### MVP Asset Categories (Stage 1-3)
For initial launch, EconLens supports these asset types to ensure accurate scenario analysis:

#### **Equity Assets**
- **US Domestic Stocks**: Individual stocks (AAPL, MSFT, etc.)
- **US Equity ETFs**: Broad market funds (VTI, VOO, etc.)  
- **US Equity Mutual Funds**: Index and actively managed funds
- **International Equity ETFs**: Developed markets (VXUS, EFA, etc.)
- **Emerging Markets ETFs**: Emerging market exposure (VWO, etc.)
- **Sector ETFs**: Technology (XLK), Healthcare (XLV), etc.

#### **Fixed Income Assets**
- **Government Bond ETFs**: Treasury funds (BND, VGIT, etc.)
- **Corporate Bond ETFs**: Investment grade corporate (LQD, VCIT, etc.)
- **High-Yield Bond ETFs**: High-yield corporate (HYG, JNK, etc.)
- **International Bond ETFs**: Foreign bonds (BNDX, etc.)
- **TIPS**: Inflation-protected securities (SCHP, VTIP, etc.)

#### **Alternative Assets (Limited)**
- **REITs**: Real estate investment trusts (VNQ, SCHH, etc.)
- **Commodity ETFs**: Gold (GLD), Oil (USO), Broad commodities (DJP)
- **Cash Equivalents**: Money market funds, savings accounts

### Future Asset Categories (Post-MVP)
- Cryptocurrency funds
- Private equity (for accredited investors)
- Options and derivatives
- International stocks (individual)
- Municipal bonds

## Portfolio Data Model

### Core Portfolio Structure
```typescript
interface Portfolio {
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

interface PortfolioAsset {
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

enum AssetType {
  STOCK = 'stock',
  ETF = 'etf', 
  MUTUAL_FUND = 'mutual_fund',
  BOND = 'bond',
  REIT = 'reit',
  COMMODITY = 'commodity',
  CASH = 'cash'
}

enum AssetCategory {
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

enum Region {
  US = 'us',
  DEVELOPED_INTERNATIONAL = 'developed_international',
  EMERGING_MARKETS = 'emerging_markets',
  GLOBAL = 'global'
}

interface RiskProfile {
  overallRiskScore: number;      // 1-10 composite score
  concentrationRisk: number;     // Herfindahl-Hirschman Index
  sectorConcentration: number;   // Max sector allocation
  geographicRisk: number;        // Geographic concentration
  volatilityScore: number;       // Portfolio volatility estimate
  creditRisk: number;            // Credit exposure assessment
}
```

## CSV Import Specification

### Required CSV Format
EconLens supports CSV files with the following structure:

#### **Standard Format (Minimum Required Columns)**
```csv
Symbol,Name,Asset Type,Allocation %,Dollar Amount
VTI,"Vanguard Total Stock Market ETF",ETF,60.0,60000.00
BND,"Vanguard Total Bond Market ETF",ETF,25.0,25000.00
VXUS,"Vanguard Total International Stock ETF",ETF,15.0,15000.00
```

#### **Extended Format (All Supported Columns)**
```csv
Symbol,Name,Asset Type,Category,Sector,Region,Allocation %,Dollar Amount,Shares,Avg Price,Expense Ratio,Dividend Yield
VTI,"Vanguard Total Stock Market ETF",ETF,US_LARGE_CAP,Diversified,US,60.0,60000.00,240.5,249.48,0.03,1.8
BND,"Vanguard Total Bond Market ETF",ETF,GOVERNMENT_BONDS,Bonds,US,25.0,25000.00,312.5,80.00,0.03,2.1
VXUS,"Vanguard Total International Stock ETF",ETF,INTERNATIONAL_DEVELOPED,Diversified,DEVELOPED_INTERNATIONAL,15.0,15000.00,250.0,60.00,0.08,2.3
```

### CSV Column Specifications

| Column Name | Required | Data Type | Validation Rules | Example Values |
|------------|----------|-----------|------------------|----------------|
| **Symbol** | Yes | String(20) | Valid ticker symbol, no spaces | VTI, AAPL, BND |
| **Name** | Yes | String(200) | Asset full name | "Vanguard Total Stock Market ETF" |
| **Asset Type** | Yes | Enum | Must match AssetType enum | ETF, STOCK, MUTUAL_FUND |
| **Category** | No | Enum | Must match AssetCategory enum | US_LARGE_CAP, GOVERNMENT_BONDS |
| **Sector** | No | String(100) | GICS sector name | Technology, Healthcare, Financials |
| **Region** | No | Enum | Must match Region enum | US, DEVELOPED_INTERNATIONAL |
| **Allocation %** | Yes | Number(5,2) | 0-100, sum must equal 100% | 60.0, 25.5, 14.5 |
| **Dollar Amount** | Yes | Number(15,2) | Must be positive | 60000.00, 25000.00 |
| **Shares** | No | Number(15,6) | Positive number | 240.5, 312.5 |
| **Avg Price** | No | Number(10,2) | Positive price per share | 249.48, 80.00 |
| **Expense Ratio** | No | Number(4,3) | 0-5 (as percentage) | 0.03, 0.75 |
| **Dividend Yield** | No | Number(4,2) | 0-20 (as percentage) | 1.8, 3.2 |

### CSV Validation Rules

#### **Portfolio-Level Validation**
- Total allocation percentages must sum to 100% (±0.01% tolerance)
- Sum of dollar amounts must equal declared portfolio total value (±$0.01 tolerance)
- Minimum 1 asset, maximum 50 assets per portfolio
- No duplicate symbols within same portfolio

#### **Asset-Level Validation**
- Symbol must be valid format (letters and numbers only)
- Asset type must be from supported enum
- If shares and avg price provided, shares × price should ≈ dollar amount
- Expense ratio only valid for ETFs and mutual funds
- Dividend yield must be reasonable (0-20%)

#### **Business Rule Validation**
- Maximum single asset allocation: 80% (unless it's a diversified fund)
- Minimum allocation per asset: 0.1%
- Cash equivalents cannot exceed 50% of portfolio
- Warning if portfolio lacks diversification (>70% in single asset category)

## Scenario Analysis Methodology

### Asset Category Impact Mapping

Each economic scenario affects different asset categories with specific impact ranges and methodologies:

#### **Recession Scenario Impact Calculation**
```typescript
interface ScenarioImpact {
  assetCategory: AssetCategory;
  impactRange: [number, number];      // Min/max percentage impact
  primaryDrivers: string[];           // Economic factors
  volatilityMultiplier: number;       // Increased volatility factor
  correlationAdjustment: number;      // Change in correlation with other assets
}

const recessionImpacts: ScenarioImpact[] = [
  {
    assetCategory: AssetCategory.US_LARGE_CAP,
    impactRange: [-35, -15],
    primaryDrivers: ['Earnings decline', 'P/E compression', 'Risk aversion'],
    volatilityMultiplier: 2.0,
    correlationAdjustment: 0.15  // Correlations increase in crisis
  },
  {
    assetCategory: AssetCategory.GOVERNMENT_BONDS,
    impactRange: [5, 15],
    primaryDrivers: ['Flight to safety', 'Lower interest rates', 'Fed policy'],
    volatilityMultiplier: 0.8,
    correlationAdjustment: -0.25  // Negative correlation with equities increases
  },
  {
    assetCategory: AssetCategory.REAL_ESTATE,
    impactRange: [-30, -10],
    primaryDrivers: ['Credit tightening', 'Demand reduction', 'Liquidity concerns'],
    volatilityMultiplier: 1.8,
    correlationAdjustment: 0.20
  }
  // ... additional categories
];
```

#### **Impact Calculation Algorithm**
1. **Base Impact**: Use asset category impact range
2. **Sector Adjustment**: Apply sector-specific modifiers (e.g., tech more volatile in recession)
3. **Size Adjustment**: Small caps typically more affected than large caps
4. **Quality Adjustment**: Higher quality assets (low debt, stable earnings) less affected
5. **Geographic Adjustment**: International assets may have different impacts
6. **Liquidity Adjustment**: Less liquid assets face additional stress

#### **Calculation Example**
```typescript
function calculateAssetImpact(
  asset: PortfolioAsset,
  scenario: Scenario
): AssetImpactResult {
  
  // 1. Get base impact for asset category
  const baseImpact = scenario.categoryImpacts[asset.assetCategory];
  
  // 2. Apply sector adjustments
  const sectorAdjustment = getSectorAdjustment(asset.sector, scenario);
  
  // 3. Apply size/quality adjustments
  const qualityAdjustment = getQualityAdjustment(asset, scenario);
  
  // 4. Calculate final impact
  const finalImpact = baseImpact.midpoint + sectorAdjustment + qualityAdjustment;
  
  // 5. Apply bounds checking
  const boundedImpact = Math.max(
    baseImpact.min, 
    Math.min(baseImpact.max, finalImpact)
  );
  
  return {
    impactPercentage: boundedImpact,
    impactDollar: asset.dollarAmount * (boundedImpact / 100),
    confidenceLevel: calculateConfidence(asset, scenario),
    primaryDrivers: baseImpact.primaryDrivers
  };
}
```

## Data Sources and Asset Classification

### Asset Data Enrichment
EconLens enriches basic portfolio data with additional information for accurate analysis:

#### **Data Sources (External APIs - Future Integration)**
- **Yahoo Finance API**: Basic price and fundamental data
- **Alpha Vantage**: Enhanced fundamental analysis
- **Morningstar API**: ETF/Mutual fund classifications and expense ratios
- **FRED (Federal Reserve)**: Economic data for scenario parameters

#### **Asset Classification Logic**
```typescript
function classifyAsset(symbol: string, name: string): AssetClassification {
  // 1. Check symbol patterns
  if (isETF(symbol)) {
    return classifyETF(symbol, name);
  }
  
  // 2. Use name-based classification
  if (name.toLowerCase().includes('bond')) {
    return classifyBond(name);
  }
  
  // 3. Default to stock classification
  return classifyStock(symbol);
}

function classifyETF(symbol: string, name: string): AssetClassification {
  const etfMappings = {
    // US Equity ETFs
    'VTI': { category: AssetCategory.US_LARGE_CAP, region: Region.US },
    'VOO': { category: AssetCategory.US_LARGE_CAP, region: Region.US },
    'VB': { category: AssetCategory.US_SMALL_CAP, region: Region.US },
    
    // International ETFs  
    'VXUS': { category: AssetCategory.INTERNATIONAL_DEVELOPED, region: Region.DEVELOPED_INTERNATIONAL },
    'VWO': { category: AssetCategory.EMERGING_MARKETS, region: Region.EMERGING_MARKETS },
    
    // Bond ETFs
    'BND': { category: AssetCategory.GOVERNMENT_BONDS, region: Region.US },
    'LQD': { category: AssetCategory.CORPORATE_BONDS, region: Region.US },
    
    // Sector ETFs
    'XLK': { category: AssetCategory.US_LARGE_CAP, sector: 'Technology' },
    'XLV': { category: AssetCategory.US_LARGE_CAP, sector: 'Healthcare' }
  };
  
  return etfMappings[symbol] || inferFromName(name);
}
```

## AI Portfolio Analysis Framework

### Structured Data Formatting for AI Analysis

EconLens formats portfolio data in a structured way that enables comprehensive AI analysis. The AI receives contextual information in multiple formats to ensure accurate and relevant insights.

#### **AI Analysis Input Format**
```typescript
interface AIAnalysisInput {
  // Portfolio Context
  portfolio: {
    name: string;
    totalValue: number;
    currency: string;
    assetCount: number;
    createdDate: string;
    lastModified: string;
  };
  
  // Asset Breakdown for AI Understanding
  assetAllocation: {
    summary: AssetAllocationSummary;
    detailedBreakdown: AIFormattedAsset[];
    diversificationMetrics: DiversificationAnalysis;
    riskCharacteristics: RiskProfile;
  };
  
  // Scenario Context
  scenarioContext: {
    scenarioName: string;
    scenarioDescription: string;
    economicParameters: ScenarioParameters;
    historicalContext: string[];
    timeHorizon: string;
  };
  
  // Calculated Impact Results
  calculationResults: {
    totalImpactPercentage: number;
    totalImpactDollar: number;
    confidenceScore: number;
    assetLevelImpacts: AssetImpactDetails[];
    portfolioRiskChanges: RiskChangeAnalysis;
  };
  
  // User Context for Personalization
  userProfile: {
    investmentExperience: 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    userType: 'casual_investor' | 'active_trader' | 'financial_advisor';
    investmentHorizon: 'short' | 'medium' | 'long';
    preferredAnalysisDepth: 'simple' | 'detailed' | 'comprehensive';
  };
}

interface AIFormattedAsset {
  symbol: string;
  name: string;
  description: string;                    // AI-friendly asset description
  allocationPercentage: number;
  dollarAmount: number;
  assetClass: string;                     // "US Large Cap Equity", "Government Bonds", etc.
  riskLevel: number;                      // 1-10 scale
  volatilityDescription: string;          // "Low", "Moderate", "High"
  economicSensitivity: {
    interestRates: 'low' | 'medium' | 'high';
    inflation: 'low' | 'medium' | 'high';
    economicGrowth: 'low' | 'medium' | 'high';
    marketSentiment: 'low' | 'medium' | 'high';
  };
  keyCharacteristics: string[];           // ["Dividend paying", "Growth oriented", etc.]
}
```

#### **AI Analysis Output Structure**
```typescript
interface AIAnalysisOutput {
  // Executive Summary (2-3 sentences)
  executiveSummary: {
    overallImpact: string;
    confidenceAssessment: string;
    keyTakeaway: string;
  };
  
  // Risk Analysis (3-4 specific risks)
  riskAnalysis: {
    primaryRisks: RiskInsight[];
    riskMitigation: string[];
    warningSignals: string[];
  };
  
  // Opportunity Analysis (2-3 opportunities)
  opportunityAnalysis: {
    opportunities: OpportunityInsight[];
    strategicActions: string[];
    timingConsiderations: string[];
  };
  
  // Educational Context
  educationalInsights: {
    economicExplanation: string;          // Why this scenario affects these assets
    historicalComparison: string;         // Similar past events
    learningPoints: string[];             // Key concepts for user education
  };
  
  // Actionable Recommendations
  recommendations: {
    immediateActions: string[];           // What to consider now
    monitoringItems: string[];            // What to watch
    portfolioAdjustments: string[];       // General rebalancing concepts
    riskManagement: string[];             // Risk mitigation strategies
  };
  
  // Quality Assurance
  responseMetadata: {
    qualityScore: number;                 // 1-100 internal quality assessment
    responseTime: number;                 // Generation time in milliseconds
    modelVersion: string;                 // AI model used
    promptVersion: string;                // Prompt template version
  };
}
```

### AI Prompt Engineering Framework

#### **Contextual Prompt Building**
```typescript
class AIPromptBuilder {
  buildComprehensivePrompt(input: AIAnalysisInput): string {
    return `
# EconLens Portfolio Analysis Request

You are an expert financial educator and portfolio analyst. Provide clear, educational insights about this portfolio's performance under the specified economic scenario.

## PORTFOLIO OVERVIEW
**Name:** ${input.portfolio.name}
**Total Value:** ${this.formatCurrency(input.portfolio.totalValue)}
**Asset Count:** ${input.portfolio.assetCount}
**Overall Risk Level:** ${this.calculateOverallRisk(input.assetAllocation)}/10

## ASSET ALLOCATION BREAKDOWN
${this.formatAssetAllocationForAI(input.assetAllocation)}

## DIVERSIFICATION ANALYSIS
- **Concentration Risk:** ${input.assetAllocation.diversificationMetrics.concentrationRisk}
- **Sector Diversification:** ${input.assetAllocation.diversificationMetrics.sectorDiversification}
- **Geographic Spread:** ${input.assetAllocation.diversificationMetrics.geographicDiversification}
- **Asset Type Balance:** ${input.assetAllocation.diversificationMetrics.assetTypeBalance}

## ECONOMIC SCENARIO: ${input.scenarioContext.scenarioName}
**Description:** ${input.scenarioContext.scenarioDescription}

**Key Economic Changes:**
${this.formatEconomicParameters(input.scenarioContext.economicParameters)}

**Historical Context:** ${input.scenarioContext.historicalContext.join(', ')}

## CALCULATED PORTFOLIO IMPACT
**Total Impact:** ${input.calculationResults.totalImpactPercentage}% (${this.formatCurrency(input.calculationResults.totalImpactDollar)})
**Confidence Level:** ${input.calculationResults.confidenceScore}%

**Asset-Level Impacts:**
${this.formatAssetImpacts(input.calculationResults.assetLevelImpacts)}

## USER CONTEXT
- **Experience Level:** ${input.userProfile.investmentExperience}
- **Risk Tolerance:** ${input.userProfile.riskTolerance}
- **Investment Horizon:** ${input.userProfile.investmentHorizon}
- **Analysis Preference:** ${input.userProfile.preferredAnalysisDepth}

## ANALYSIS REQUIREMENTS

### Response Structure (Required)
1. **Portfolio Impact Summary** (2-3 sentences)
   - Overall impact assessment
   - Confidence level explanation
   - Primary driver identification

2. **Key Risks to Monitor** (3-4 specific risks)
   - Asset-specific vulnerabilities
   - Portfolio construction risks
   - Scenario-specific concerns
   - Early warning indicators

3. **Potential Opportunities** (2-3 opportunities)
   - Assets that may benefit
   - Rebalancing considerations
   - Strategic positioning ideas
   - Market timing insights

4. **Educational Context** (2-3 paragraphs)
   - Why these impacts occur
   - Economic mechanism explanations
   - Historical precedent lessons
   - Key learning points

5. **Risk Management Strategies** (3-4 actionable items)
   - Portfolio protection measures
   - Diversification improvements
   - Monitoring recommendations
   - General strategic guidance

### Tone and Style Guidelines
- **Educational Focus:** Explain WHY, not just WHAT
- **User-Appropriate Language:** Match ${input.userProfile.investmentExperience} level
- **Balanced Perspective:** Include both risks AND opportunities
- **Actionable Insights:** Provide concrete next steps
- **Encouraging Tone:** Maintain optimistic but realistic outlook

### Critical Requirements
- NO specific buy/sell recommendations
- NO personalized financial advice
- INCLUDE educational disclaimers
- FOCUS on understanding and learning
- MAINTAIN objectivity and balance

Generate a comprehensive analysis that helps this investor understand their portfolio's position in this economic scenario.`;
  }

  private formatAssetAllocationForAI(allocation: any): string {
    // Format asset allocation in AI-friendly table format
    let output = "| Asset | Allocation | Value | Risk Level | Key Characteristics |\n";
    output += "|-------|------------|-------|------------|--------------------|\n";
    
    allocation.detailedBreakdown.forEach(asset => {
      output += `| ${asset.symbol} (${asset.name.substring(0, 30)}...) | ${asset.allocationPercentage}% | ${this.formatCurrency(asset.dollarAmount)} | ${asset.riskLevel}/10 | ${asset.keyCharacteristics.join(', ')} |\n`;
    });
    
    return output;
  }

  private formatEconomicParameters(params: any): string {
    return Object.entries(params)
      .map(([key, value]) => `- ${this.humanizeParameterName(key)}: ${value}`)
      .join('\n');
  }
}
```

### AI Response Quality Validation

#### **Automated Quality Checks**
```typescript
class AIResponseValidator {
  validatePortfolioAnalysis(response: string, input: AIAnalysisInput): ValidationResult {
    const validationChecks = [
      this.checkResponseLength(response),
      this.checkRequiredSections(response),
      this.checkFinancialAccuracy(response, input),
      this.checkEducationalTone(response),
      this.checkActionability(response),
      this.checkDisclaimer(response),
      this.checkPersonalizationLevel(response, input.userProfile)
    ];

    return {
      isValid: validationChecks.every(check => check.passes),
      qualityScore: this.calculateQualityScore(validationChecks),
      issues: validationChecks.filter(check => !check.passes),
      recommendations: this.generateImprovementRecommendations(validationChecks)
    };
  }

  private checkFinancialAccuracy(response: string, input: AIAnalysisInput): ValidationCheck {
    const issues = [];
    
    // Check for specific financial advice
    if (this.containsSpecificAdvice(response)) {
      issues.push("Contains specific buy/sell recommendations");
    }
    
    // Verify scenario impact alignment
    if (!this.impactAlignmentCheck(response, input.calculationResults)) {
      issues.push("AI insights don't align with calculated impacts");
    }
    
    // Check for factual errors
    if (this.containsFactualErrors(response)) {
      issues.push("Contains potential factual errors about economic relationships");
    }
    
    return {
      name: 'Financial Accuracy',
      passes: issues.length === 0,
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 25))
    };
  }

  private checkEducationalTone(response: string): ValidationCheck {
    const educationalIndicators = [
      'explains why',
      'this occurs because',
      'historically',
      'for example',
      'this means',
      'consider',
      'important to understand'
    ];
    
    const adviceIndicators = [
      'you should buy',
      'you should sell',
      'I recommend',
      'definitely',
      'guaranteed'
    ];
    
    const educationalScore = this.countMatches(response, educationalIndicators);
    const adviceScore = this.countMatches(response, adviceIndicators);
    
    return {
      name: 'Educational Tone',
      passes: educationalScore > adviceScore && adviceScore === 0,
      score: Math.min(100, (educationalScore * 20) - (adviceScore * 50)),
      details: `Educational indicators: ${educationalScore}, Advice indicators: ${adviceScore}`
    };
  }
}
```

#### **Concentration Risk (Herfindahl-Hirschman Index)**
```typescript
function calculateConcentrationRisk(assets: PortfolioAsset[]): number {
  const hhi = assets.reduce((sum, asset) => {
    const allocation = asset.allocationPercentage / 100;
    return sum + (allocation * allocation);
  }, 0);
  
  // Convert to 1-10 scale (0.1 = low risk, 1.0 = high risk)
  return Math.min(10, hhi * 10);
}
```

#### **Diversification Analysis**
```typescript
interface DiversificationAnalysis {
  sectorDiversification: number;     // 1-10 score
  geographicDiversification: number; // 1-10 score  
  assetTypeDiversification: number;  // 1-10 score
  overallDiversification: number;    // Composite score
  recommendations: string[];         // Specific suggestions
}
```

### Portfolio Optimization Suggestions

#### **Rebalancing Recommendations**
```typescript
interface RebalancingRecommendation {
  trigger: string;                   // Why rebalancing is needed
  targetAllocations: AssetAllocation[]; // Suggested new allocations
  estimatedImpact: number;          // Expected improvement
  implementationSteps: string[];    // How to execute
}
```

## Database Schema Implementation

### PostgreSQL Schema (Updated)
```sql
-- Enhanced portfolio_assets table
CREATE TABLE portfolio_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Basic Asset Information
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_category VARCHAR(100),
    sector VARCHAR(100),
    geographic_region VARCHAR(50),
    
    -- Holdings Data
    allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    dollar_amount DECIMAL(15,2) NOT NULL CHECK (dollar_amount >= 0),
    shares DECIMAL(15,6),
    avg_purchase_price DECIMAL(10,2),
    
    -- Asset Characteristics
    expense_ratio DECIMAL(4,3),
    dividend_yield DECIMAL(4,2),
    pe_ratio DECIMAL(6,2),
    duration DECIMAL(4,2),
    credit_rating VARCHAR(10),
    
    -- Risk Metrics
    risk_rating INTEGER CHECK (risk_rating BETWEEN 1 AND 10),
    volatility DECIMAL(5,2),
    beta DECIMAL(4,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_asset_type CHECK (asset_type IN ('stock', 'etf', 'mutual_fund', 'bond', 'reit', 'commodity', 'cash')),
    CONSTRAINT valid_region CHECK (geographic_region IN ('us', 'developed_international', 'emerging_markets', 'global'))
);

-- Asset classification reference table
CREATE TABLE asset_classifications (
    symbol VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_category VARCHAR(100),
    sector VARCHAR(100),
    geographic_region VARCHAR(50),
    expense_ratio DECIMAL(4,3),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(100)
);

-- Scenario impact factors table
CREATE TABLE scenario_impact_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id),
    asset_category VARCHAR(100) NOT NULL,
    impact_min DECIMAL(6,2) NOT NULL,
    impact_max DECIMAL(6,2) NOT NULL,
    primary_drivers TEXT[],
    volatility_multiplier DECIMAL(4,2) DEFAULT 1.0,
    correlation_adjustment DECIMAL(4,2) DEFAULT 0.0
);
```

## Error Handling and Data Validation

### Validation Error Types
```typescript
enum ValidationErrorType {
  INVALID_ALLOCATION_SUM = 'INVALID_ALLOCATION_SUM',
  INVALID_DOLLAR_CONSISTENCY = 'INVALID_DOLLAR_CONSISTENCY',
  UNSUPPORTED_ASSET_TYPE = 'UNSUPPORTED_ASSET_TYPE',
  INVALID_SYMBOL_FORMAT = 'INVALID_SYMBOL_FORMAT',
  CONCENTRATION_WARNING = 'CONCENTRATION_WARNING',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD'
}

interface ValidationError {
  type: ValidationErrorType;
  message: string;
  field?: string;
  suggestedFix?: string;
}
```

### Data Quality Assurance
- Asset symbol validation against known exchanges
- Automatic classification for common ETFs and stocks
- Data consistency checks across all portfolio metrics
- Warning system for unusual allocations or risk profiles

---

**Next Steps**: Use this specification with your AI tools to implement the complete portfolio data model, CSV import functionality, and scenario analysis engine. Each component should be built iteratively using Cursor for implementation and Claude for complex logic validation.