---
title: "EconLens API Design and Frontend Architecture"
doc_type: "Architecture"
stage: "1-4"  
version: "v0.1"
status: "Draft"
owner: "Project Owner"
last_updated: "2025-01-16"
aws_services: ["API Gateway", "Lambda", "Cognito", "S3", "CloudFront"]
learning_objectives: ["RESTful API design", "Lambda function organization", "React architecture patterns", "State management", "Performance optimization"]
links:
  - title: "User Authentication and Data Model"
    href: "./04-User-Authentication-and-Data-Model.md"
  - title: "Portfolio Engine and AI Scenarios"
    href: "./05-Portfolio-Engine-and-AI-Scenarios.md"
  - title: "AWS Deployment and Operations"
    href: "./07-AWS-Deployment-and-Operations.md"
---

# EconLens API Design and Frontend Architecture

## Executive Summary

This document defines the complete API specification for EconLens backend services and the React frontend architecture. The design emphasizes RESTful principles, comprehensive error handling, and optimal user experience through efficient state management and responsive design. The API leverages AWS Lambda functions behind API Gateway, while the frontend uses modern React patterns with TypeScript.

## RESTful API Specification

### API Overview and Standards
- **Base URL**: `https://api.econlens.com/v1` (Stage 4) / `https://api-dev.econlens.com/v1` (Development)
- **Authentication**: Bearer tokens (JWT) from AWS Cognito
- **Content Type**: `application/json` for all requests and responses
- **Rate Limiting**: 1000 requests per hour per authenticated user, 100 per hour for unauthenticated
- **API Versioning**: URL-based versioning with backward compatibility guarantees

### Authentication Endpoints

#### POST /auth/register
**Purpose**: Register new user account with email verification
```json
{
  "method": "POST",
  "path": "/auth/register",
  "authentication": "none",
  "request_body": {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "casual_investor",
    "investmentExperience": "beginner",
    "riskTolerance": "moderate",
    "marketingConsent": false
  },
  "responses": {
    "201": {
      "description": "User registration successful, verification email sent",
      "body": {
        "message": "Registration successful. Please check your email to verify your account.",
        "userId": "cognito-user-id",
        "verificationRequired": true
      }
    },
    "400": {
      "description": "Invalid input data",
      "body": {
        "error": "VALIDATION_ERROR",
        "message": "Email address is already registered",
        "details": {
          "field": "email",
          "code": "EMAIL_EXISTS"
        }
      }
    }
  }
}
```

#### POST /auth/login
**Purpose**: Authenticate user and return JWT tokens
```json
{
  "method": "POST", 
  "path": "/auth/login",
  "authentication": "none",
  "request_body": {
    "email": "user@example.com",
    "password": "SecurePass123!"
  },
  "responses": {
    "200": {
      "description": "Login successful",
      "body": {
        "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 3600,
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "userType": "casual_investor"
        }
      }
    },
    "401": {
      "description": "Authentication failed",
      "body": {
        "error": "AUTHENTICATION_FAILED",
        "message": "Invalid email or password"
      }
    }
  }
}
```

#### POST /auth/refresh
**Purpose**: Refresh access token using refresh token
```json
{
  "method": "POST",
  "path": "/auth/refresh", 
  "authentication": "refresh_token",
  "request_body": {
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "responses": {
    "200": {
      "description": "Token refresh successful",
      "body": {
        "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 3600
      }
    }
  }
}
```

### User Management Endpoints

#### GET /user/profile
**Purpose**: Retrieve current user profile information
```json
{
  "method": "GET",
  "path": "/user/profile",
  "authentication": "required",
  "responses": {
    "200": {
      "description": "User profile retrieved successfully",
      "body": {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "John", 
        "lastName": "Doe",
        "userType": "casual_investor",
        "investmentExperience": "beginner",
        "riskTolerance": "moderate",
        "preferences": {
          "defaultCurrency": "USD",
          "emailNotifications": true,
          "shareAnalytics": false
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "lastLoginAt": "2024-01-20T14:22:00Z"
      }
    }
  }
}
```

#### PUT /user/profile
**Purpose**: Update user profile information
```json
{
  "method": "PUT",
  "path": "/user/profile",
  "authentication": "required",
  "request_body": {
    "firstName": "John",
    "lastName": "Smith", 
    "userType": "active_trader",
    "investmentExperience": "intermediate",
    "riskTolerance": "aggressive",
    "preferences": {
      "defaultCurrency": "USD",
      "emailNotifications": false
    }
  },
  "responses": {
    "200": {
      "description": "Profile updated successfully",
      "body": {
        "message": "Profile updated successfully",
        "updatedFields": ["lastName", "userType", "investmentExperience", "riskTolerance", "preferences"]
      }
    }
  }
}
```

### Portfolio Management Endpoints

#### GET /portfolios
**Purpose**: Retrieve all portfolios for authenticated user
```json
{
  "method": "GET",
  "path": "/portfolios",
  "authentication": "required",
  "query_parameters": {
    "limit": "integer (default: 50, max: 100)",
    "offset": "integer (default: 0)",
    "sortBy": "string (created_at, updated_at, name, total_value)",
    "sortOrder": "string (asc, desc)"
  },
  "responses": {
    "200": {
      "description": "Portfolios retrieved successfully",
      "body": {
        "portfolios": [
          {
            "id": "portfolio-uuid",
            "name": "Retirement Portfolio",
            "description": "Long-term retirement savings",
            "totalValue": 125000.00,
            "currency": "USD",
            "assetCount": 8,
            "lastAnalyzedAt": "2024-01-18T09:15:00Z",
            "analysisCount": 12,
            "isPublic": false,
            "createdAt": "2024-01-10T08:00:00Z",
            "updatedAt": "2024-01-18T09:15:00Z"
          }
        ],
        "pagination": {
          "total": 3,
          "limit": 50,
          "offset": 0,
          "hasMore": false
        }
      }
    }
  }
}
```

#### POST /portfolios
**Purpose**: Create new portfolio
```json
{
  "method": "POST",
  "path": "/portfolios",
  "authentication": "required",
  "request_body": {
    "name": "Growth Portfolio",
    "description": "Aggressive growth focused investments",
    "totalValue": 75000.00,
    "currency": "USD",
    "assets": [
      {
        "symbol": "VTI",
        "name": "Vanguard Total Stock Market ETF",
        "type": "etf",
        "category": "domestic_equity",
        "allocationPercentage": 60.0,
        "dollarAmount": 45000.00,
        "shares": 180.5,
        "avgPurchasePrice": 249.31,
        "sector": "diversified",
        "geographicRegion": "us"
      },
      {
        "symbol": "VXUS", 
        "name": "Vanguard Total International Stock ETF",
        "type": "etf",
        "category": "international_equity",
        "allocationPercentage": 25.0,
        "dollarAmount": 18750.00,
        "shares": 312.5,
        "avgPurchasePrice": 60.00,
        "sector": "diversified",
        "geographicRegion": "international"
      },
      {
        "symbol": "BND",
        "name": "Vanguard Total Bond Market ETF", 
        "type": "etf",
        "category": "government_bonds",
        "allocationPercentage": 15.0,
        "dollarAmount": 11250.00,
        "shares": 145.2,
        "avgPurchasePrice": 77.50,
        "sector": "bonds",
        "geographicRegion": "us"
      }
    ]
  },
  "responses": {
    "201": {
      "description": "Portfolio created successfully",
      "body": {
        "id": "portfolio-uuid",
        "name": "Growth Portfolio", 
        "message": "Portfolio created successfully",
        "validationResults": {
          "allocationSum": 100.0,
          "dollarConsistency": true,
          "diversificationScore": 0.52
        }
      }
    }
  }
}
```

#### GET /portfolios/{portfolioId}
**Purpose**: Retrieve specific portfolio with full asset details
```json
{
  "method": "GET",
  "path": "/portfolios/{portfolioId}",
  "authentication": "required",
  "path_parameters": {
    "portfolioId": "UUID of the portfolio"
  },
  "responses": {
    "200": {
      "description": "Portfolio retrieved successfully", 
      "body": {
        "id": "portfolio-uuid",
        "name": "Retirement Portfolio",
        "description": "Long-term retirement savings",
        "totalValue": 125000.00,
        "currency": "USD",
        "isPublic": false,
        "shareToken": null,
        "createdAt": "2024-01-10T08:00:00Z",
        "updatedAt": "2024-01-18T09:15:00Z", 
        "lastAnalyzedAt": "2024-01-18T09:15:00Z",
        "analysisCount": 12,
        "assets": [
          {
            "id": "asset-uuid",
            "symbol": "VTI",
            "name": "Vanguard Total Stock Market ETF",
            "type": "etf",
            "category": "domestic_equity",
            "allocationPercentage": 50.0,
            "dollarAmount": 62500.00,
            "shares": 250.8,
            "avgPurchasePrice": 249.20,
            "sector": "diversified",
            "geographicRegion": "us",
            "riskRating": 6
          }
        ],
        "riskMetrics": {
          "concentrationRisk": 0.34,
          "sectorConcentration": 0.50,
          "geographicRisk": 0.75,
          "overallRiskScore": 6.2
        }
      }
    },
    "404": {
      "description": "Portfolio not found",
      "body": {
        "error": "PORTFOLIO_NOT_FOUND",
        "message": "Portfolio with specified ID does not exist or access denied"
      }
    }
  }
}
```

#### PUT /portfolios/{portfolioId}
**Purpose**: Update existing portfolio
```json
{
  "method": "PUT",
  "path": "/portfolios/{portfolioId}",
  "authentication": "required",
  "request_body": {
    "name": "Updated Portfolio Name",
    "description": "Updated description",
    "totalValue": 130000.00,
    "assets": [
      {
        "id": "existing-asset-uuid",
        "allocationPercentage": 55.0,
        "dollarAmount": 71500.00,
        "shares": 287.2
      }
    ]
  },
  "responses": {
    "200": {
      "description": "Portfolio updated successfully",
      "body": {
        "id": "portfolio-uuid",
        "message": "Portfolio updated successfully",
        "changes": ["name", "totalValue", "asset_allocations"],
        "validationResults": {
          "allocationSum": 100.0,
          "dollarConsistency": true
        }
      }
    }
  }
}
```

#### DELETE /portfolios/{portfolioId}
**Purpose**: Delete portfolio and all associated data
```json
{
  "method": "DELETE",
  "path": "/portfolios/{portfolioId}",
  "authentication": "required",
  "responses": {
    "200": {
      "description": "Portfolio deleted successfully",
      "body": {
        "message": "Portfolio and all associated data deleted successfully",
        "deletedItems": {
          "portfolio": 1,
          "assets": 8,
          "scenarioResults": 5
        }
      }
    }
  }
}
```

### File Upload Endpoints

#### POST /portfolios/{portfolioId}/upload
**Purpose**: Upload CSV file for portfolio import
```json
{
  "method": "POST",
  "path": "/portfolios/{portfolioId}/upload",
  "authentication": "required",
  "content_type": "multipart/form-data",
  "request_body": {
    "file": "CSV file (max 10MB)",
    "mapping": {
      "symbolColumn": "Symbol",
      "nameColumn": "Name", 
      "typeColumn": "Asset Type",
      "allocationColumn": "Allocation %",
      "dollarAmountColumn": "Dollar Amount"
    },
    "validateOnly": false
  },
  "responses": {
    "200": {
      "description": "File processed successfully",
      "body": {
        "processingId": "upload-job-uuid",
        "status": "processing",
        "message": "File uploaded successfully and processing started",
        "estimatedCompletionTime": "30 seconds",
        "assetsFound": 12
      }
    },
    "400": {
      "description": "File validation failed",
      "body": {
        "error": "FILE_VALIDATION_ERROR",
        "message": "CSV format validation failed",
        "details": {
          "missingColumns": ["Symbol", "Allocation %"],
          "invalidRows": [3, 7, 12],
          "suggestions": [
            "Ensure Symbol column contains valid ticker symbols",
            "Allocation % must sum to 100%"
          ]
        }
      }
    }
  }
}
```

#### GET /portfolios/upload/{processingId}/status
**Purpose**: Check status of file upload processing
```json
{
  "method": "GET",
  "path": "/portfolios/upload/{processingId}/status",
  "authentication": "required", 
  "responses": {
    "200": {
      "description": "Processing status retrieved",
      "body": {
        "processingId": "upload-job-uuid",
        "status": "completed",
        "progress": 100,
        "result": {
          "portfolioId": "portfolio-uuid",
          "assetsCreated": 12,
          "assetsSkipped": 1,
          "validationWarnings": [
            "Asset 'UNKNOWN' skipped - symbol not recognized"
          ]
        },
        "completedAt": "2024-01-20T15:45:32Z"
      }
    }
  }
}
```

### Scenario Analysis Endpoints

#### GET /scenarios
**Purpose**: Retrieve available economic scenarios
```json
{
  "method": "GET",
  "path": "/scenarios",
  "authentication": "required",
  "query_parameters": {
    "category": "string (optional filter by category)",
    "isActive": "boolean (default: true)"
  },
  "responses": {
    "200": {
      "description": "Scenarios retrieved successfully",
      "body": {
        "scenarios": [
          {
            "id": "recession_moderate",
            "name": "Moderate Economic Recession",
            "description": "A typical economic downturn characterized by declining GDP...",
            "category": "Economic Downturn",
            "severity": 7,
            "durationMonths": 18,
            "historicalPrecedents": [
              "2008-2009 Financial Crisis",
              "2001 Dot-Com Recession"
            ],
            "isPredefined": true,
            "isActive": true
          }
        ]
      }
    }
  }
}
```

#### POST /portfolios/{portfolioId}/scenarios/{scenarioId}/analyze
**Purpose**: Start scenario analysis for portfolio
```json
{
  "method": "POST",
  "path": "/portfolios/{portfolioId}/scenarios/{scenarioId}/analyze",
  "authentication": "required",
  "request_body": {
    "includeAiInsights": true,
    "insightDetail": "detailed",
    "compareToBaseline": true
  },
  "responses": {
    "202": {
      "description": "Analysis started successfully",
      "body": {
        "analysisId": "analysis-job-uuid",
        "status": "queued",
        "message": "Scenario analysis started",
        "estimatedCompletionTime": "60-120 seconds",
        "queuePosition": 3
      }
    },
    "409": {
      "description": "Analysis already in progress",
      "body": {
        "error": "ANALYSIS_IN_PROGRESS",
        "message": "Analysis for this portfolio-scenario combination is already running",
        "existingAnalysisId": "existing-analysis-uuid"
      }
    }
  }
}
```

#### GET /portfolios/{portfolioId}/scenarios/{scenarioId}/results
**Purpose**: Retrieve scenario analysis results
```json
{
  "method": "GET", 
  "path": "/portfolios/{portfolioId}/scenarios/{scenarioId}/results",
  "authentication": "required",
  "query_parameters": {
    "includeDetails": "boolean (default: true)",
    "format": "string (json, pdf) - default: json"
  },
  "responses": {
    "200": {
      "description": "Analysis results retrieved successfully",
      "body": {
        "analysisId": "analysis-uuid",
        "portfolioId": "portfolio-uuid",
        "scenarioId": "recession_moderate",
        "status": "completed",
        "totalImpactPercentage": -18.5,
        "confidenceScore": 87,
        "calculationResults": {
          "assetImpacts": [
            {
              "assetId": "asset-uuid",
              "symbol": "VTI",
              "currentValue": 62500.00,
              "projectedValue": 50000.00,
              "impactPercentage": -20.0,
              "impactDollar": -12500.00
            }
          ],
          "categoryBreakdown": {
            "domestic_equity": -22.5,
            "international_equity": -28.2,
            "government_bonds": 8.1,
            "corporate_bonds": -5.3
          }
        },
        "aiInsights": {
          "summary": "This recession scenario would likely impact your portfolio...",
          "keyRisks": [
            "Heavy equity exposure creates vulnerability to market declines",
            "International holdings face additional currency and contagion risks",
            "Limited defensive positioning reduces downside protection"
          ],
          "opportunities": [
            "Strong bond allocation provides stability and income",
            "Quality equity holdings positioned for recovery",
            "Potential rebalancing opportunities during downturn"
          ],
          "riskManagement": [
            "Consider increasing cash position for opportunities",
            "Review international exposure and geographic diversification", 
            "Monitor dividend sustainability in equity holdings"
          ],
          "historicalContext": "Similar to 2008-2009 crisis, recovery typically takes 18-24 months..."
        },
        "createdAt": "2024-01-20T16:30:45Z",
        "processingTimeMs": 45320
      }
    },
    "404": {
      "description": "No analysis results found",
      "body": {
        "error": "RESULTS_NOT_FOUND",
        "message": "No completed analysis found for this portfolio-scenario combination"
      }
    }
  }
}
```

### Sharing and Collaboration Endpoints

#### POST /portfolios/{portfolioId}/share
**Purpose**: Generate shareable link for portfolio
```json
{
  "method": "POST",
  "path": "/portfolios/{portfolioId}/share",
  "authentication": "required",
  "request_body": {
    "expiresIn": "7d",
    "permissions": ["view", "analyze"],
    "requireEmail": false
  },
  "responses": {
    "201": {
      "description": "Share link created successfully",
      "body": {
        "shareToken": "abc123def456ghi789",
        "shareUrl": "https://app.econlens.com/shared/abc123def456ghi789",
        "expiresAt": "2024-01-27T16:30:45Z",
        "permissions": ["view", "analyze"]
      }
    }
  }
}
```

## Lambda Function Organization

### Function Structure and Responsibilities

#### Authentication Functions
```
auth-service/
├── register/
│   ├── handler.js          # User registration with Cognito
│   ├── validation.js       # Input validation schemas
│   └── email-templates.js  # Verification email templates
├── login/
│   ├── handler.js          # Authentication logic
│   ├── token-validation.js # JWT token handling
│   └── security.js         # Rate limiting and security
├── refresh/
│   ├── handler.js          # Token refresh logic
│   └── cleanup.js          # Expired token cleanup
└── shared/
    ├── cognito-client.js   # Cognito service wrapper
    ├── error-handler.js    # Common error handling
    └── response-builder.js # Standard response formatting
```

#### User Management Functions
```
user-service/
├── profile/
│   ├── get-handler.js      # Retrieve user profile
│   ├── update-handler.js   # Update user profile  
│   ├── delete-handler.js   # Account deletion
│   └── data-export.js      # GDPR data export
├── preferences/
│   ├── handler.js          # User preference management
│   └── validation.js       # Preference validation
└── shared/
    ├── database.js         # Database connection pool
    ├── user-validation.js  # User data validation
    └── audit-logger.js     # User action logging
```

#### Portfolio Management Functions
```
portfolio-service/
├── crud/
│   ├── create-handler.js   # Portfolio creation
│   ├── read-handler.js     # Portfolio retrieval
│   ├── update-handler.js   # Portfolio updates
│   ├── delete-handler.js   # Portfolio deletion
│   └── list-handler.js     # Portfolio listing with pagination
├── upload/
│   ├── initiate-handler.js # Start file upload process
│   ├── process-handler.js  # Process uploaded CSV
│   ├── status-handler.js   # Check processing status
│   └── csv-parser.js       # CSV parsing and validation
├── validation/
│   ├── portfolio-validator.js # Business logic validation
│   ├── asset-validator.js     # Asset data validation
│   └── allocation-checker.js  # Allocation consistency
└── shared/
    ├── s3-client.js        # S3 operations wrapper
    ├── portfolio-models.js # Data models and schemas
    └── risk-calculator.js  # Risk metrics calculation
```

#### Scenario Analysis Functions  
```
scenario-service/
├── scenarios/
│   ├── list-handler.js     # Available scenarios
│   ├── details-handler.js  # Scenario details
│   └── custom-handler.js   # Custom scenario creation
├── analysis/
│   ├── start-handler.js    # Initiate analysis
│   ├── calculate-handler.js # Portfolio calculations  
│   ├── ai-insights-handler.js # AI insight generation
│   ├── status-handler.js   # Analysis status
│   └── results-handler.js  # Results retrieval
├── processing/
│   ├── queue-processor.js  # SQS message processing
│   ├── bedrock-client.js   # AWS Bedrock integration
│   ├── cache-manager.js    # ElastiCache operations
│   └── result-aggregator.js # Combine calculation + AI
└── shared/
    ├── calculation-engine.js # Core calculation logic
    ├── prompt-builder.js     # AI prompt construction
    └── response-validator.js  # AI response validation
```

### Lambda Configuration Standards

#### Environment Variables
```javascript
const lambdaConfig = {
    runtime: "nodejs18.x",
    timeout: {
        auth: 10,           // Authentication operations
        crud: 15,           // CRUD operations
        upload: 30,         // File processing
        analysis: 120,      // Scenario calculations
        aiInsights: 180     // AI insight generation
    },
    memory: {
        auth: 256,          // MB - Authentication
        crud: 512,          // MB - CRUD operations  
        upload: 1024,       // MB - File processing
        analysis: 2048,     // MB - Complex calculations
        aiInsights: 1536    // MB - AI processing
    },
    environment: {
        NODE_ENV: "production",
        LOG_LEVEL: "info",
        DB_CONNECTION_LIMIT: "5",
        REDIS_CONNECTION_TIMEOUT: "2000",
        BEDROCK_TIMEOUT: "30000",
        JWT_ALGORITHM: "RS256"
    }
};
```

#### Error Handling Patterns
```javascript
// Standard error handling wrapper
const errorHandler = (handler) => async (event, context) => {
    try {
        return await handler(event, context);
    } catch (error) {
        console.error('Lambda error:', error);
        
        if (error.name === 'ValidationError') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'VALIDATION_ERROR',
                    message: error.message,
                    details: error.details
                })
            };
        }
        
        if (error.name === 'AuthenticationError') {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    error: 'AUTHENTICATION_ERROR',
                    message: 'Authentication failed'
                })
            };
        }
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
                requestId: context.awsRequestId
            })
        };
    }
};
```

## React Frontend Architecture

### Component Hierarchy and Organization

#### Application Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── portfolio/
│   │   ├── PortfolioList.tsx
│   │   ├── PortfolioCard.tsx
│   │   ├── PortfolioForm.tsx
│   │   ├── AssetInput.tsx
│   │   ├── AllocationChart.tsx
│   │   └── PortfolioUpload.tsx
│   ├── scenarios/
│   │   ├── ScenarioSelector.tsx
│   │   ├── ScenarioCard.tsx
│   │   ├── AnalysisProgress.tsx
│   │   ├── ResultsSummary.tsx
│   │   ├── ImpactChart.tsx
│   │   └── AIInsights.tsx
│   ├── shared/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Modal.tsx
│   │   └── Button.tsx
│   └── ui/
│       ├── forms/
│       ├── charts/
│       ├── tables/
│       └── navigation/
├── pages/
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── PortfolioPage.tsx
│   ├── AnalysisPage.tsx
│   ├── ResultsPage.tsx
│   └── ProfilePage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePortfolios.ts
│   ├── useScenarios.ts
│   ├── useAnalysis.ts
│   └── useApi.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── portfolio.ts
│   ├── scenarios.ts
│   └── storage.ts
├── store/
│   ├── authSlice.ts
│   ├── portfolioSlice.ts
│   ├── scenarioSlice.ts
│   └── index.ts
├── utils/
│   ├── formatting.ts
│   ├── validation.ts
│   ├── calculations.ts
│   └── constants.ts
└── types/
    ├── auth.ts
    ├── portfolio.ts
    ├── scenario.ts
    └── api.ts
```

### State Management Strategy

#### Redux Toolkit Implementation
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './authSlice';
import portfolioReducer from './portfolioSlice';  
import scenarioReducer from './scenarioSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'] // Only persist auth state
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        portfolios: portfolioReducer,
        scenarios: scenarioReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Auth State Management
```typescript
// store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/auth';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

export const loginAsync = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        updateTokens: (state, action: PayloadAction<{accessToken: string, refreshToken?: string}>) => {
            state.accessToken = action.payload.accessToken;
            if (action.payload.refreshToken) {
                state.refreshToken = action.payload.refreshToken;
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(loginAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { logout, updateTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### Custom Hooks Implementation

#### useAuth Hook
```typescript
// hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { loginAsync, logout, clearError } from '../store/authSlice';
import { LoginCredentials, RegisterCredentials } from '../types/auth';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated, isLoading, error } = useSelector(
        (state: RootState) => state.auth
    );

    const login = useCallback(
        async (credentials: LoginCredentials) => {
            const result = await dispatch(loginAsync(credentials));
            return result.type === 'auth/login/fulfilled';
        },
        [dispatch]
    );

    const signOut = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        signOut,
        clearError: clearAuthError
    };
};
```

#### usePortfolios Hook
```typescript
// hooks/usePortfolios.ts
import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { portfolioService } from '../services/portfolio';
import { Portfolio, CreatePortfolioRequest } from '../types/portfolio';

export const usePortfolios = () => {
    const dispatch = useDispatch();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await portfolioService.getPortfolios();
            setPortfolios(response.portfolios);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPortfolio = useCallback(async (portfolioData: CreatePortfolioRequest) => {
        setLoading(true);
        setError(null);
        try {
            const newPortfolio = await portfolioService.createPortfolio(portfolioData);
            setPortfolios(prev => [...prev, newPortfolio]);
            return newPortfolio;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePortfolio = useCallback(async (portfolioId: string) => {
        setLoading(true);
        setError(null);
        try {
            await portfolioService.deletePortfolio(portfolioId);
            setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolios();
    }, [fetchPortfolios]);

    return {
        portfolios,
        loading,
        error,
        createPortfolio,
        deletePortfolio,
        refetchPortfolios: fetchPortfolios
    };
};
```

### Performance Optimization Strategies

#### Code Splitting and Lazy Loading
```typescript
// App.tsx with route-based code splitting
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy load page components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));

const App: React.FC = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/portfolio/:id" element={<PortfolioPage />} />
                <Route path="/analysis/:id" element={<AnalysisPage />} />
            </Routes>
        </Suspense>
    );
};
```

#### Memoization and Performance Hooks
```typescript
// components/portfolio/AllocationChart.tsx
import React, { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AllocationChartProps {
    assets: Asset[];
    totalValue: number;
}

const AllocationChart: React.FC<AllocationChartProps> = memo(({ assets, totalValue }) => {
    const chartData = useMemo(() => {
        return assets.map(asset => ({
            name: asset.symbol,
            value: asset.allocationPercentage,
            dollarValue: asset.dollarAmount,
            color: getAssetColor(asset.category)
        }));
    }, [assets]);

    const renderTooltip = useMemo(() => {
        return ({ active, payload }: any) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                    <div className="tooltip">
                        <p>{data.name}</p>
                        <p>Allocation: {data.value.toFixed(1)}%</p>
                        <p>Value: ${data.dollarValue.toLocaleString()}</p>
                    </div>
                );
            }
            return null;
        };
    }, []);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}%`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
});

export default AllocationChart;
```

## Error Handling Strategy

### API Error Handling
```typescript
// services/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { store } from '../store';
import { updateTokens, logout } from '../store/authSlice';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 10000,
});

// Request interceptor for auth tokens
api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = store.getState().auth.refreshToken;
                if (refreshToken) {
                    const response = await axios.post('/auth/refresh', {
                        refreshToken
                    });
                    
                    const { accessToken } = response.data;
                    store.dispatch(updateTokens({ accessToken }));
                    
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                store.dispatch(logout());
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
```

### Frontend Error Boundaries
```typescript
// components/shared/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            // logErrorToService(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    <p>We're sorry, but something unexpected happened.</p>
                    <button onClick={() => window.location.reload()}>
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
```

---

**API & Frontend Status**: Complete - Ready for deployment and operations planning
**Next Steps**: Review infrastructure automation and production operations in [07-AWS-Deployment-and-Operations.md](./07-AWS-Deployment-and-Operations.md)