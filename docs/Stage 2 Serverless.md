# Stage 2: Serverless Migration and Enhanced Features (Weeks 3-4)

> **Code Disclaimer**: All code examples are architectural references. Use AI tools (Claude, Cursor, GitHub Copilot, Warp) to generate, analyze, and implement production code based on these specifications.

## Overview

Stage 2 transforms your traditional AWS architecture into a modern serverless application. You'll migrate from EC2 to Lambda + API Gateway while adding advanced features like file upload, enhanced authentication, and performance optimization.

**Duration**: 2 weeks (14 days)  
**Primary AI Tools**: Migration planning (Claude), Lambda development (Cursor), Testing (all tools)  
**Key Outcome**: Fully serverless API with file upload and enhanced portfolio features

## Prerequisites

✅ **Stage 1 Completed**
- Traditional infrastructure working
- Portfolio CRUD operations functional
- User authentication implemented
- Frontend deployed and accessible

✅ **Validation Required**
- All Stage 1 demo requirements met
- Database schema with sample data
- Cognito User Pool configured
- S3 and CloudFront working

## Learning Objectives

### Serverless Architecture Mastery
- **API Gateway**: REST API design, authorizers, request/response transformation
- **Lambda Functions**: Event-driven computing, cold starts, optimization
- **S3 Event Processing**: Trigger-based file processing workflows
- **CloudWatch**: Serverless monitoring and logging strategies
- **IAM for Serverless**: Fine-grained permissions for Lambda functions

### Advanced AWS Services
- **Pre-signed URLs**: Secure file upload patterns
- **Lambda Layers**: Shared code and dependencies
- **API Gateway Caching**: Response caching strategies
- **CloudWatch Insights**: Log analysis and troubleshooting

## Week 3: Serverless Migration (Days 15-21)

### Day 15-16: API Gateway and Lambda Foundation

#### **Task 3.1: API Gateway Setup**

**Using Cursor AI:**
> "Create complete API Gateway REST API based on docs/06-API-Design-and-Frontend-Architecture.md endpoint specifications. Include Cognito authorizer, request validation, and CORS configuration."

**API Gateway Configuration:**
```typescript
// Generate with Cursor based on docs
export class ApiStack extends Stack {
  public readonly api: apigateway.RestApi;
  public readonly cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer;
  
  constructor(scope: Construct, id: string, userPool: cognito.UserPool) {
    // REST API with proper naming
    // Cognito User Pool authorizer  
    // Global CORS configuration
    // Request/response models
    // API key and usage plans (for rate limiting)
  }
}
```

**Key API Gateway Features:**
- **Authentication**: Cognito User Pool authorizer on protected endpoints
- **Validation**: Request body validation with JSON schemas
- **CORS**: Proper preflight handling for browser requests
- **Error Handling**: Standard error response formats
- **Throttling**: Rate limiting per user

#### **Task 3.2: Lambda Function Architecture**

**Lambda Organization Strategy:**
```typescript
// backend/src/functions/ - Updated for Node.js 20 runtime
├── auth/
│   ├── register.ts      # POST /auth/register
│   ├── login.ts         # POST /auth/login  
│   └── refresh.ts       # POST /auth/refresh
├── users/
│   ├── profile.ts       # GET/PUT /user/profile
│   └── preferences.ts   # GET/PUT /user/preferences
├── portfolios/
│   ├── create.ts        # POST /portfolios
│   ├── list.ts          # GET /portfolios
│   ├── get.ts           # GET /portfolios/{id}
│   ├── update.ts        # PUT /portfolios/{id}
│   └── delete.ts        # DELETE /portfolios/{id}
├── upload/
│   ├── initiate.ts      # POST /portfolios/{id}/upload
│   ├── process.ts       # S3 trigger function
│   └── status.ts        # GET /upload/{id}/status
└── shared/
    ├── database.ts      # Database connection utilities
    ├── auth.ts          # JWT validation utilities
    ├── validation.ts    # Input validation schemas
    └── responses.ts     # Standard response formatting
```

**Using Cursor for Lambda Functions:**
> "Create Lambda function template based on the portfolio service patterns from docs/06-API-Design-and-Frontend-Architecture.md. Include proper error handling, database connection management, and response formatting."

### Day 17-18: Database Integration and Performance

#### **Task 3.3: Lambda Database Connections**

**Connection Management Strategy:**
```typescript
// Generate with Cursor - backend/src/shared/database.ts
export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool;
  
  // Connection pooling for Lambda
  // Environment variable configuration
  // Error handling and retry logic
  // Connection health checks
}
```

**Key Considerations:**
- **Connection Pooling**: Reuse connections across Lambda invocations
- **Environment Variables**: Database credentials from Secrets Manager
- **VPC Configuration**: Lambda functions in same VPC as RDS
- **Cold Start Optimization**: Keep connections warm when possible

#### **Task 3.4: Lambda Performance Optimization**

**Using Claude for Optimization Strategy:**
> "Analyze Lambda cold start optimization techniques for Node.js functions connecting to PostgreSQL. Consider connection pooling, provisioned concurrency, and dependency optimization."

**Optimization Techniques:**
1. **Bundle Size Reduction**: Minimize dependencies, tree shaking
2. **Connection Reuse**: Global connection pools
3. **Memory Allocation**: Right-size memory for performance/cost balance
4. **Provisioned Concurrency**: For critical functions (auth, portfolio list)
5. **Lambda Layers**: Shared dependencies across functions

### Day 19-20: Migration Execution

#### **Task 3.5: API Endpoint Migration**

**Migration Strategy:**
1. **Parallel Deployment**: Keep EC2 API running during migration
2. **Gradual Cutover**: Route traffic incrementally to new API
3. **Validation Testing**: Comprehensive testing of each endpoint
4. **Rollback Plan**: Quick rollback to EC2 if issues arise

**Using Warp for Deployment:**
```bash
# Deploy serverless API stack
cd infrastructure
cdk deploy ApiStack-dev --profile econlens-admin

# Test API Gateway endpoints
aws apigateway test-invoke-method \
  --rest-api-id [API_ID] \
  --resource-id [RESOURCE_ID] \
  --http-method GET \
  --profile econlens-admin
```

#### **Task 3.6: Frontend API Integration Update**

**API Client Updates:**
```typescript
// frontend/src/services/api.ts updates
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api-dev.econlens.com';

// Update all API calls to new endpoints
// Add request/response interceptors for API Gateway format
// Update error handling for new error responses
```

### Day 21: Enhanced Authentication

#### **Task 3.7: Advanced Cognito Integration**

**Enhanced Authentication Features:**
- **Identity Pool Integration**: AWS resource access for users
- **Custom Attributes**: Store user investment experience, risk tolerance
- **MFA Setup**: Optional multi-factor authentication
- **Social Logins**: Google/Facebook integration (optional)

**Using Cursor for Auth Enhancement:**
> "Enhance the authentication system with Cognito Identity Pools for AWS resource access and custom user attributes based on docs/04-User-Authentication-and-Data-Model.md user schema."

## Week 4: File Upload and Advanced Features (Days 22-28)

### Day 22-23: S3 File Upload System

#### **Task 4.1: Secure File Upload Architecture**

**Pre-signed URL Upload Pattern:**
```typescript
// Generate with Cursor - backend/src/functions/upload/initiate.ts
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Validate user permissions
  // Generate pre-signed URL for S3 upload
  // Create upload tracking record
  // Return upload URL and tracking ID
};
```

**Upload Flow:**
1. Frontend requests upload URL
2. Lambda generates pre-signed S3 URL
3. Frontend uploads directly to S3
4. S3 triggers processing Lambda
5. Processing Lambda parses CSV and updates portfolio
6. Frontend polls for completion status

#### **Task 4.2: CSV Processing Pipeline**

**S3 Event-Driven Processing:**
```typescript
// Generate with Cursor - backend/src/functions/upload/process.ts
export const handler = async (event: S3Event): Promise<void> => {
  // Parse S3 event for uploaded file
  // Download and parse CSV file
  // Validate portfolio data against schema
  // Update database with new portfolio assets
  // Update processing status
  // Handle errors and validation failures
};
```

**CSV Validation Rules:**
- Reference `docs/Portfolio-Data-Specification.md` for format requirements
- Allocation percentages sum to 100%
- Valid asset symbols and types
- Reasonable allocation ranges
- Data consistency checks

### Day 24-25: Portfolio Enhancement Features

#### **Task 4.3: Portfolio Analysis Engine**

**Risk Metrics Calculation:**
```typescript
// Generate with Cursor - backend/src/services/portfolio-analysis.ts
export class PortfolioAnalyzer {
  calculateRiskMetrics(portfolio: Portfolio): RiskMetrics {
    // Concentration risk (HHI calculation)
    // Sector concentration analysis
    // Geographic diversification assessment
    // Asset type diversification
    // Overall risk score computation
  }
  
  generateRebalancingRecommendations(portfolio: Portfolio): RebalanceRecommendation[] {
    // Identify overconcentrated positions
    // Suggest diversification improvements
    // Calculate rebalancing trades needed
  }
}
```

#### **Task 4.4: Portfolio Comparison Features**

**Multi-Portfolio Analysis:**
- Portfolio performance comparison
- Risk/return profile analysis  
- Diversification effectiveness
- Asset overlap detection

**Using Claude for Complex Logic:**
> "Design algorithm for comparing multiple portfolios across risk metrics, diversification, and performance characteristics. Reference the risk calculation methods from Portfolio-Data-Specification.md."

### Day 26-27: Performance and Monitoring

#### **Task 4.5: Comprehensive Monitoring Setup**

**CloudWatch Integration:**
```typescript
// Generate monitoring stack with Cursor
export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, api: apigateway.RestApi, functions: lambda.Function[]) {
    // API Gateway metrics and alarms
    // Lambda function monitoring
    // Custom business metrics
    // SNS alerting for critical issues
    // CloudWatch dashboard
  }
}
```

**Key Monitoring Areas:**
- **API Performance**: Response times, error rates, throttling
- **Lambda Metrics**: Duration, memory usage, error rates, cold starts
- **Business Metrics**: User registrations, portfolios created, uploads processed
- **Database Performance**: Connection counts, query performance
- **Cost Tracking**: Daily spend tracking and alerts

#### **Task 4.6: Error Handling and Resilience**

**Resilience Patterns:**
- **Retry Logic**: Automatic retry for transient failures
- **Circuit Breakers**: Prevent cascade failures
- **Dead Letter Queues**: Handle failed processing
- **Graceful Degradation**: Fallback responses when services unavailable

### Day 28: Testing and Optimization

#### **Task 4.7: Comprehensive Testing Suite**

**Testing Strategy:**
```typescript
// backend/tests/
├── unit/                # Unit tests for individual functions
├── integration/         # API endpoint integration tests
├── performance/         # Load testing scenarios
└── e2e/                 # End-to-end workflow tests
```

**Using AI Tools for Testing:**
- **Claude**: Test strategy and complex test scenarios
- **Cursor**: Test implementation and mocking
- **Copilot**: Test case generation and assertions

**Load Testing:**
```bash
# Using Artillery for load testing
cd backend/tests/performance
npx artillery run portfolio-api-load-test.yml
```

#### **Task 4.8: Performance Optimization**

**Optimization Areas:**
1. **Lambda Cold Starts**: Bundle optimization, provisioned concurrency
2. **Database Performance**: Query optimization, connection pooling
3. **API Gateway Caching**: Response caching for read-heavy endpoints
4. **Frontend Performance**: Code splitting, asset optimization

## Stage 2 Demo Requirements

### Functional Demo Checklist

#### **Serverless API**
- [ ] All Stage 1 functionality migrated to serverless
- [ ] API Gateway + Lambda handling all requests
- [ ] Cognito authorization working correctly
- [ ] Response times improved from Stage 1
- [ ] Error handling comprehensive

#### **File Upload System**
- [ ] CSV file upload with progress indication
- [ ] Automated portfolio creation from CSV
- [ ] Upload status tracking and user feedback
- [ ] Error handling for invalid CSV files
- [ ] File validation and security checks

#### **Enhanced Portfolio Features**
- [ ] Portfolio risk analysis and scoring
- [ ] Asset allocation validation and warnings
- [ ] Portfolio comparison functionality
- [ ] Rebalancing recommendations
- [ ] Portfolio sharing with read-only links

#### **Performance and Monitoring**
- [ ] All API calls complete within 1.5 seconds
- [ ] File processing completes within 2 minutes
- [ ] Monitoring dashboard functional
- [ ] Error alerts working correctly
- [ ] Cost tracking within budget

### Technical Validation Checklist

#### **Serverless Architecture**
- [ ] No EC2 instances running (cost optimization)
- [ ] All functions in VPC for RDS access
- [ ] Proper IAM roles and policies
- [ ] Lambda layers for shared dependencies
- [ ] Dead letter queues configured

#### **Security**
- [ ] Pre-signed URLs expire appropriately
- [ ] File upload size and type restrictions
- [ ] User data isolation maintained
- [ ] API rate limiting functional
- [ ] No sensitive data in logs

#### **Scalability**
- [ ] API Gateway auto-scaling working
- [ ] Lambda concurrent execution appropriate
- [ ] Database connection pooling optimized
- [ ] S3 event processing reliable
- [ ] CloudWatch metrics comprehensive

## Advanced Troubleshooting

### Common Serverless Issues

#### **Lambda Cold Start Problems**
**Symptoms**: First request slow, intermittent timeouts
**Using Claude**: "Analyze Lambda cold start optimization for Node.js with PostgreSQL connections. Here's my function code and performance metrics: [data]"
**Solutions**: Bundle optimization, provisioned concurrency, connection warming

#### **VPC Lambda Connectivity Issues**
**Symptoms**: Cannot connect to RDS, timeout errors
**Using Warp**: "Debug Lambda VPC connectivity to RDS"
**Solutions**: Check security groups, subnet routing, NAT Gateway configuration

#### **API Gateway CORS Issues**
**Symptoms**: Preflight requests failing, browser errors
**Solution**: Ensure OPTIONS methods configured, proper headers returned

#### **S3 Event Processing Failures**
**Symptoms**: Uploads complete but processing doesn't start
**Solution**: Check S3 event notifications, Lambda permissions, DLQ messages

## Cost Analysis and Optimization

### Serverless Cost Benefits
**Stage 1 (Traditional) Monthly Costs:**
- EC2 t2.micro: $8-12/month (if exceeding free tier)
- Application Load Balancer: $16-22/month
- NAT Gateway: $32-45/month
- **Total**: $56-79/month

**Stage 2 (Serverless) Monthly Costs:**
- Lambda: $0-5/month (generous free tier)
- API Gateway: $0-3/month (1M free requests)
- No ALB or NAT Gateway needed
- **Total**: $0-8/month (massive savings!)

### Usage Optimization
- **Lambda Memory Sizing**: Right-size memory allocation
- **API Gateway Caching**: Cache stable responses
- **CloudWatch Logs**: Optimize log retention periods
- **S3 Storage Classes**: Use appropriate storage tiers

## Success Metrics

### Performance Improvements
- **API Response Time**: <1.5s (improved from ~2s)
- **Cold Start Impact**: <10% of requests affected
- **File Processing**: CSV upload and processing <2 minutes
- **Error Rate**: <0.5% of requests

### Cost Improvements  
- **Monthly AWS Bill**: 80-90% reduction from Stage 1
- **Scalability**: Automatic scaling to 1000+ concurrent users
- **Maintenance**: Zero server maintenance required

### Feature Enhancements
- **File Upload**: Secure, scalable CSV processing
- **Portfolio Analysis**: Risk metrics and recommendations
- **Performance**: Sub-second response times
- **Monitoring**: Comprehensive observability

## Next Steps: Stage 3 AI Integration

With Stage 2 complete, you have:
✅ Production-ready serverless architecture
✅ Scalable file upload system
✅ Enhanced portfolio analysis features
✅ Comprehensive monitoring and alerting
✅ Significant cost optimization

**Stage 3** will add the AI-powered scenario analysis:
- AWS Bedrock integration for AI insights
- Economic scenario calculation engine
- SQS-based async processing
- ElastiCache for performance optimization
- Advanced portfolio scenario testing

The serverless foundation from Stage 2 provides the perfect platform for adding AI capabilities in Stage 3!