# Stage 4: Production Ready and Launch Preparation (Weeks 7-8)

> **Code Disclaimer**: All code examples are architectural references. Use AI tools (Claude, Cursor, GitHub Copilot, Warp) to generate, analyze, and implement production code based on these specifications.

## Overview

Stage 4 transforms your working application into a production-ready, scalable, and maintainable system. You'll implement Infrastructure as Code, automated CI/CD pipelines, comprehensive monitoring, security hardening, and launch preparation processes.

**Duration**: 2 weeks (14 days)  
**Primary AI Tools**: Infrastructure automation (CDK + Cursor), DevOps strategy (Claude), Security hardening (all tools)  
**Key Outcome**: Production-deployed EconLens ready for real users with professional operations

## Prerequisites

✅ **Stage 3 Completed**
- AI-powered scenario analysis working
- Async processing with SQS + Lambda operational
- ElastiCache providing performance benefits
- Cost controls and quality validation in place

✅ **Production Readiness Requirements**
- All core features tested and working
- Performance benchmarks established
- AI quality validation proven
- Basic monitoring and alerting functional

## Learning Objectives

### Infrastructure as Code Mastery
- **AWS CDK Advanced Patterns**: Multi-environment deployments, construct reusability
- **Environment Management**: Dev/staging/production separation and promotion
- **Resource Organization**: Logical stack separation and dependency management
- **Configuration Management**: Environment-specific parameters and secrets

### DevOps and CI/CD Excellence
- **GitHub Actions**: Advanced workflow automation
- **Deployment Strategies**: Blue/green deployments, rollback procedures
- **Testing Automation**: Integration with automated testing suites
- **Release Management**: Version tagging, release notes, deployment tracking

### Production Operations
- **Monitoring Excellence**: Advanced CloudWatch dashboards and alerting
- **Security Hardening**: WAF, security scanning, compliance validation
- **Performance Optimization**: Auto-scaling, caching, resource optimization
- **Disaster Recovery**: Backup strategies, failure recovery procedures

## Week 7: Infrastructure as Code and CI/CD (Days 43-49)

### Day 43-44: Complete CDK Infrastructure Refactoring

#### **Task 7.1: Multi-Environment CDK Architecture**

**Using Claude for Architecture Design:**
> "Design a comprehensive CDK architecture for EconLens that supports dev/staging/production environments with proper separation, security, and cost optimization. Include all services: VPC, RDS, Lambda, API Gateway, Cognito, Bedrock, SQS, ElastiCache, S3, CloudFront."

**CDK Project Structure:**
```typescript
// infrastructure/
├── bin/
│   └── econlens.ts                 # CDK app entry point
├── lib/
│   ├── stacks/
│   │   ├── network-stack.ts        # VPC, subnets, security groups
│   │   ├── storage-stack.ts        # RDS, S3, ElastiCache
│   │   ├── compute-stack.ts        # Lambda functions, layers
│   │   ├── api-stack.ts            # API Gateway, authorizers
│   │   ├── auth-stack.ts           # Cognito User/Identity Pools
│   │   ├── frontend-stack.ts       # S3, CloudFront, Route 53
│   │   ├── processing-stack.ts     # SQS, async processing
│   │   ├── monitoring-stack.ts     # CloudWatch, SNS, dashboards
│   │   ├── security-stack.ts       # WAF, Config, GuardDuty
│   │   └── pipeline-stack.ts       # CI/CD pipeline resources
│   ├── constructs/
│   │   ├── econlens-lambda.ts      # Reusable Lambda construct
│   │   ├── monitoring-construct.ts  # Standardized monitoring
│   │   └── security-construct.ts   # Security configurations
│   └── config/
│       ├── base.ts                 # Base configuration interface
│       ├── dev.ts                  # Development environment
│       ├── staging.ts              # Staging environment
│       └── prod.ts                 # Production environment
└── tests/
    ├── unit/                       # CDK construct unit tests
    └── integration/                # Stack integration tests
```

#### **Task 7.2: Environment Configuration Management**

**Using Cursor to Generate:**
> "Create comprehensive environment configuration system for EconLens CDK based on docs/07-AWS-Deployment-and-Operations.md environment config patterns."

**Configuration System:**
```typescript
// infrastructure/lib/config/base.ts
export interface EconLensConfig {
  // Environment identification
  environment: 'dev' | 'staging' | 'prod';
  account: string;
  region: string;
  
  // Application configuration
  domainName?: string;
  certificateArn?: string;
  enableCustomDomain: boolean;
  
  // Database configuration
  rds: {
    instanceType: string;
    multiAz: boolean;
    backupRetention: number;
    deletionProtection: boolean;
    monitoringInterval: number;
  };
  
  // Lambda configuration
  lambda: {
    defaultTimeout: number;
    defaultMemory: number;
    reservedConcurrency?: number;
    provisionedConcurrency?: number;
    enableXRayTracing: boolean;
  };
  
  // Caching configuration
  elastiCache: {
    nodeType: string;
    numNodes: number;
    enableBackup: boolean;
  };
  
  // AI and processing
  ai: {
    bedrockModel: string;
    monthlyBudgetLimit: number;
    enableCostAlerts: boolean;
  };
  
  // Monitoring and alerting
  monitoring: {
    logRetentionDays: number;
    enableDetailedMonitoring: boolean;
    alertEmail: string;
    enableSlackAlerts: boolean;
  };
  
  // Security settings
  security: {
    enableWAF: boolean;
    enableGuardDuty: boolean;
    enableConfig: boolean;
    mfaRequired: boolean;
  };
  
  // Cost controls
  cost: {
    monthlyBudgetLimit: number;
    billingAlerts: number[];
    enableCostOptimization: boolean;
  };
}

// infrastructure/lib/config/prod.ts
export const prodConfig: EconLensConfig = {
  environment: 'prod',
  account: process.env.PROD_ACCOUNT_ID!,
  region: 'us-east-1',
  
  domainName: 'econlens.com',
  enableCustomDomain: true,
  
  rds: {
    instanceType: 'db.t3.small',
    multiAz: true,
    backupRetention: 30,
    deletionProtection: true,
    monitoringInterval: 60,
  },
  
  lambda: {
    defaultTimeout: 30,
    defaultMemory: 1024,
    reservedConcurrency: 100,
    provisionedConcurrency: 10,
    enableXRayTracing: true,
  },
  
  elastiCache: {
    nodeType: 'cache.t3.micro',
    numNodes: 2,
    enableBackup: true,
  },
  
  ai: {
    bedrockModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
    monthlyBudgetLimit: 200,
    enableCostAlerts: true,
  },
  
  monitoring: {
    logRetentionDays: 90,
    enableDetailedMonitoring: true,
    alertEmail: process.env.ALERT_EMAIL!,
    enableSlackAlerts: true,
  },
  
  security: {
    enableWAF: true,
    enableGuardDuty: true,
    enableConfig: true,
    mfaRequired: true,
  },
  
  cost: {
    monthlyBudgetLimit: 500,
    billingAlerts: [100, 250, 400],
    enableCostOptimization: true,
  },
};
```

### Day 45-46: CI/CD Pipeline Implementation

#### **Task 7.3: GitHub Actions Workflow Enhancement**

**Using Cursor for Complete CI/CD:**
> "Create production-ready GitHub Actions workflow for EconLens that includes testing, security scanning, multi-environment deployment, and rollback capabilities. Reference the CI/CD patterns from docs/07-AWS-Deployment-and-Operations.md."

**Complete Workflow:**
```yaml
# .github/workflows/deploy.yml
name: EconLens Production Deployment Pipeline

on:
  push:
    branches: [main, develop, staging]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'dev'
        type: choice
        options:
        - dev
        - staging
        - prod

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '20'

jobs:
  # Stage 1: Code Quality and Security
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          cd ../backend && npm ci
          cd ../infrastructure && npm ci
          
      - name: Run linting
        run: |
          npm run lint:frontend
          npm run lint:backend
          
      - name: Run type checking
        run: |
          cd frontend && npm run type-check
          cd ../backend && npm run type-check
          cd ../infrastructure && npm run type-check

  # Stage 2: Comprehensive Testing
  testing:
    runs-on: ubuntu-latest
    needs: quality-checks
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: econlens_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          cd ../backend && npm ci
          
      - name: Run backend unit tests
        run: cd backend && npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/econlens_test
          
      - name: Run frontend unit tests
        run: cd frontend && npm test -- --coverage --watchAll=false
        
      - name: Run integration tests
        run: cd backend && npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/econlens_test
          
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info,./frontend/coverage/lcov.info

  # Stage 3: Security Scanning
  security:
    runs-on: ubuntu-latest
    needs: quality-checks
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
          
      - name: Run CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript,typescript
          
      - name: Run CDK security scan
        run: |
          cd infrastructure
          npm ci
          npm install -g cdk-nag
          npx cdk-nag --app="npx ts-node bin/econlens.ts"

  # Stage 4: Build and Package
  build:
    runs-on: ubuntu-latest
    needs: [testing, security]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/staging'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build
          
      - name: Build backend
        run: |
          cd backend
          npm ci
          npm run build
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts-${{ github.sha }}
          path: |
            frontend/build/
            backend/dist/
          retention-days: 30

  # Stage 5: Development Deployment
  deploy-dev:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.DEV_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.DEV_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-artifacts-${{ github.sha }}
          
      - name: Deploy infrastructure
        run: |
          cd infrastructure
          npm ci
          npx cdk deploy --all --require-approval never --context env=dev
          
      - name: Deploy frontend
        run: |
          aws s3 sync frontend/build/ s3://econlens-frontend-dev
          aws cloudfront create-invalidation --distribution-id ${{ secrets.DEV_CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
          
      - name: Run smoke tests
        run: npm run test:smoke:dev

  # Stage 6: Staging Deployment
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/staging'
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.STAGING_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.STAGING_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Deploy infrastructure
        run: |
          cd infrastructure
          npm ci
          npx cdk deploy --all --require-approval never --context env=staging
          
      - name: Run end-to-end tests
        run: npm run test:e2e:staging
        
      - name: Performance testing
        run: npm run test:performance:staging

  # Stage 7: Production Deployment
  deploy-production:
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Create deployment backup
        run: |
          aws lambda get-function --function-name econlens-portfolio-create-prod > backup/lambda-backup-${{ github.sha }}.json
          
      - name: Deploy infrastructure
        run: |
          cd infrastructure
          npm ci
          npx cdk deploy --all --require-approval never --context env=prod
          
      - name: Deploy frontend with blue/green
        run: |
          # Deploy to staging S3 bucket first
          aws s3 sync frontend/build/ s3://econlens-frontend-staging
          # Run validation tests
          npm run test:production-validation
          # Switch CloudFront to new version
          aws cloudfront create-invalidation --distribution-id ${{ secrets.PROD_CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
          
      - name: Run production smoke tests
        run: npm run test:smoke:prod
        
      - name: Notify deployment success
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
          -H 'Content-type: application/json' \
          --data '{"text":"🚀 EconLens production deployment ${{ github.sha }} completed successfully!"}'
```

#### **Task 7.4: Rollback and Recovery Procedures**

**Automated Rollback System:**
```typescript
// Generate with Cursor - infrastructure/scripts/rollback.ts
export class DeploymentRollback {
  async rollbackToLastKnownGood(environment: string): Promise<void> {
    // 1. Identify last successful deployment
    const lastGoodDeployment = await this.getLastSuccessfulDeployment(environment);
    
    // 2. Rollback Lambda functions
    await this.rollbackLambdaFunctions(environment, lastGoodDeployment.lambdaVersions);
    
    // 3. Rollback database migrations if needed
    await this.rollbackDatabaseMigrations(environment, lastGoodDeployment.dbVersion);
    
    // 4. Rollback frontend
    await this.rollbackFrontend(environment, lastGoodDeployment.frontendVersion);
    
    // 5. Validate rollback success
    await this.validateRollback(environment);
    
    // 6. Notify team
    await this.notifyRollbackComplete(environment, lastGoodDeployment);
  }
}
```

### Day 47-48: Advanced Monitoring and Alerting

#### **Task 7.5: Production Monitoring Dashboard**

**Using Claude for Monitoring Strategy:**
> "Design comprehensive monitoring strategy for EconLens production deployment. Include application metrics, business metrics, infrastructure metrics, cost monitoring, and user experience monitoring. Create CloudWatch dashboard specifications."

**Enhanced Monitoring Stack:**
```typescript
// Generate with Cursor - infrastructure/lib/stacks/monitoring-stack.ts
export class MonitoringStack extends Stack {
  constructor(scope: Construct, id: string, config: EconLensConfig) {
    super(scope, id);
    
    // SNS Topics for different alert severities
    const criticalAlertTopic = this.createAlertTopic('critical', config);
    const warningAlertTopic = this.createAlertTopic('warning', config);
    const infoAlertTopic = this.createAlertTopic('info', config);
    
    // CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'EconLensDashboard', {
      dashboardName: `${config.environment}-EconLens-Operations`,
      widgets: [
        // Application Health Overview
        this.createApplicationHealthWidget(),
        
        // Business Metrics
        this.createBusinessMetricsWidget(),
        
        // API Performance
        this.createAPIPerformanceWidget(),
        
        // Lambda Performance
        this.createLambdaPerformanceWidget(),
        
        // Database Performance
        this.createDatabasePerformanceWidget(),
        
        // AI Service Metrics
        this.createAIServiceMetricsWidget(),
        
        // Cost Tracking
        this.createCostTrackingWidget(),
        
        // Error Analysis
        this.createErrorAnalysisWidget(),
      ],
    });
    
    // Critical Alarms
    this.createCriticalAlarms(criticalAlertTopic);
    this.createWarningAlarms(warningAlertTopic);
    this.createCostAlarms(warningAlertTopic, config);
  }
  
  private createApplicationHealthWidget(): cloudwatch.GraphWidget {
    return new cloudwatch.GraphWidget({
      title: 'Application Health Overview',
      width: 24,
      height: 6,
      left: [
        // Overall success rate
        new cloudwatch.MathExpression({
          expression: '100 - (errors / requests) * 100',
          usingMetrics: {
            requests: this.getAPIGatewayMetric('Count'),
            errors: this.getAPIGatewayMetric('4XXError', 'Sum'),
          },
          label: 'Success Rate %',
        }),
        
        // Average response time
        this.getAPIGatewayMetric('Latency', 'Average'),
      ],
      right: [
        // Active users (custom metric)
        new cloudwatch.Metric({
          namespace: 'EconLens/Business',
          metricName: 'ActiveUsers',
          statistic: 'Sum',
          period: Duration.hours(1),
        }),
        
        // Scenario analyses completed
        new cloudwatch.Metric({
          namespace: 'EconLens/Business', 
          metricName: 'ScenarioAnalysesCompleted',
          statistic: 'Sum',
          period: Duration.hours(1),
        }),
      ],
    });
  }
  
  private createBusinessMetricsWidget(): cloudwatch.GraphWidget {
    return new cloudwatch.GraphWidget({
      title: 'Business KPIs',
      width: 12,
      height: 6,
      left: [
        // Daily active users
        new cloudwatch.Metric({
          namespace: 'EconLens/Business',
          metricName: 'DailyActiveUsers',
          statistic: 'Maximum',
          period: Duration.days(1),
        }),
        
        // Portfolio creation rate
        new cloudwatch.Metric({
          namespace: 'EconLens/Business',
          metricName: 'PortfoliosCreated',
          statistic: 'Sum',
          period: Duration.hours(1),
        }),
      ],
      right: [
        // Portfolio value under analysis
        new cloudwatch.Metric({
          namespace: 'EconLens/Business',
          metricName: 'PortfolioValueAnalyzed',
          statistic: 'Sum',
          period: Duration.hours(1),
        }),
        
        // AI insight quality score
        new cloudwatch.Metric({
          namespace: 'EconLens/AI',
          metricName: 'InsightQualityScore',
          statistic: 'Average',
          period: Duration.hours(1),
        }),
      ],
    });
  }
}
```

#### **Task 7.6: Intelligent Alerting System**

**Smart Alert Configuration:**
```typescript
export class IntelligentAlerting {
  createSmartAlerts(config: EconLensConfig): void {
    
    // Cascade alerting - only alert if multiple metrics indicate issues
    const apiHealthComposite = new cloudwatch.CompositeAlarm(this, 'APIHealthComposite', {
      compositeAlarmName: 'EconLens-API-Health-Composite',
      alarmRule: cloudwatch.AlarmRule.anyOf(
        cloudwatch.AlarmRule.fromAlarm(this.highErrorRateAlarm, cloudwatch.AlarmState.ALARM),
        cloudwatch.AlarmRule.allOf(
          cloudwatch.AlarmRule.fromAlarm(this.highLatencyAlarm, cloudwatch.AlarmState.ALARM),
          cloudwatch.AlarmRule.fromAlarm(this.lowThroughputAlarm, cloudwatch.AlarmState.ALARM)
        )
      ),
    });
    
    // Business impact alerting
    const businessImpactAlarm = new cloudwatch.Alarm(this, 'BusinessImpactAlarm', {
      metric: new cloudwatch.MathExpression({
        expression: 'IF(failed_analyses / total_analyses > 0.1, 1, 0)',
        label: 'High Analysis Failure Rate',
      }),
      threshold: 1,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    
    // Cost spike detection
    const costSpikeAlarm = new cloudwatch.Alarm(this, 'CostSpikeAlarm', {
      metric: new cloudwatch.Metric({
        namespace: 'AWS/Billing',
        metricName: 'EstimatedCharges',
        statistic: 'Maximum',
        period: Duration.hours(6),
      }),
      threshold: config.cost.monthlyBudgetLimit * 0.8,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
  }
}
```

### Day 49: Security Hardening

#### **Task 7.7: AWS WAF and Security Services**

**Complete Security Stack:**
```typescript
// Generate with Cursor - infrastructure/lib/stacks/security-stack.ts
export class SecurityStack extends Stack {
  constructor(scope: Construct, id: string, config: EconLensConfig) {
    super(scope, id);
    
    // WAF Web ACL with comprehensive rules
    const webAcl = new wafv2.CfnWebACL(this, 'EconLensWAF', {
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      rules: [
        // Rate limiting rule
        {
          name: 'RateLimitRule',
          priority: 1,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 2000, // requests per 5 minutes
              aggregateKeyType: 'IP',
              scopeDownStatement: {
                notStatement: {
                  statement: {
                    ipSetReferenceStatement: {
                      arn: this.createTrustedIPSet().attrArn,
                    },
                  },
                },
              },
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitRule',
          },
        },
        
        // AWS Managed Rules - Core Rule Set
        {
          name: 'AWSManagedRulesCommonRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
              excludedRules: [
                // Exclude rules that might interfere with legitimate API calls
                { name: 'SizeRestrictions_BODY' },
              ],
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSet',
          },
        },
        
        // AWS Managed Rules - Known Bad Inputs
        {
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'KnownBadInputs',
          },
        },
        
        // SQL Injection Protection
        {
          name: 'AWSManagedRulesSQLiRuleSet',
          priority: 4,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesSQLiRuleSet',
            },
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'SQLiRuleSet',
          },
        },
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'EconLensWAF',
      },
    });
    
    // AWS Config for compliance monitoring
    if (config.security.enableConfig) {
      this.setupAWSConfig();
    }
    
    // GuardDuty for threat detection
    if (config.security.enableGuardDuty) {
      this.setupGuardDuty();
    }
    
    // Security Hub for centralized security findings
    this.setupSecurityHub();
  }
}
```

## Week 8: Performance Optimization and Launch (Days 50-56)

### Day 50-51: Performance Optimization

#### **Task 8.1: Application Performance Tuning**

**Using Claude for Performance Analysis:**
> "Analyze EconLens application performance bottlenecks and provide optimization recommendations. Focus on Lambda cold starts, database query optimization, cache hit rates, and frontend performance."

**Performance Optimization Areas:**

1. **Lambda Cold Start Optimization:**
```typescript
// Generate optimized Lambda configuration
export class OptimizedLambdaFunction extends Construct {
  constructor(scope: Construct, id: string, props: OptimizedLambdaProps) {
    super(scope, id);
    
    // Bundle optimization
    const bundledCode = lambda.Code.fromAsset(props.codePath, {
      bundling: {
        image: lambda.Runtime.NODEJS_18_X.bundlingImage,
        command: [
          'bash', '-c', [
            'npm ci --only=production',
            'npm run build',
            'npm prune --production',
            'cp -r node_modules dist/* /asset-output/',
          ].join(' && '),
        ],
        user: 'root',
      },
    });
    
    // Optimized function configuration
    const func = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: bundledCode,
      handler: props.handler,
      memorySize: props.memorySize || 1024,
      timeout: Duration.seconds(props.timeout || 30),
      
      // Performance optimizations
      reservedConcurrency: props.reservedConcurrency,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        ...props.environment,
      },
      
      // Keep connections warm
      deadLetterQueue: props.dlQueue,
    });
    
    // Provisioned concurrency for critical functions
    if (props.provisionedConcurrency) {
      new lambda.Alias(this, 'ProdAlias', {
        aliasName: 'prod',
        version: func.currentVersion,
        provisionedConcurrencyConfig: {
          provisioned: props.provisionedConcurrency,
        },
      });
    }
  }
}
```

2. **Database Query Optimization:**
```sql
-- Generate optimized indexes and queries with AI assistance

-- Portfolio retrieval optimization
CREATE INDEX CONCURRENTLY idx_portfolios_user_updated 
ON portfolios(user_id, updated_at DESC) 
WHERE is_active = true;

-- Scenario analysis lookup optimization  
CREATE INDEX CONCURRENTLY idx_scenario_results_portfolio_scenario
ON scenario_results(portfolio_id, scenario_id, created_at DESC)
WHERE expires_at > CURRENT_TIMESTAMP;

-- Asset search optimization
CREATE INDEX CONCURRENTLY idx_portfolio_assets_search
ON portfolio_assets USING gin(to_tsvector('english', name || ' ' || symbol));

-- Query optimization examples
EXPLAIN ANALYZE 
SELECT p.*, array_agg(pa.*) as assets
FROM portfolios p
LEFT JOIN portfolio_assets pa ON p.id = pa.portfolio_id  
WHERE p.user_id = $1 AND p.is_active = true
GROUP BY p.id
ORDER BY p.updated_at DESC;
```

#### **Task 8.2: Auto-Scaling Configuration**

**Intelligent Auto-Scaling:**
```typescript
export class AutoScalingConfiguration {
  setupAutoScaling(config: EconLensConfig): void {
    
    // Lambda concurrent execution limits
    const lambdaConcurrency = new lambda.CfnEventInvokeConfig(this, 'LambdaConcurrency', {
      functionName: 'econlens-scenario-processor',
      maximumRetryAttempts: 2,
      maximumEventAge: 3600, // 1 hour
      destinationConfig: {
        onFailure: {
          destination: this.dlqArn,
        },
      },
    });
    
    // API Gateway throttling
    const usagePlan = new apigateway.UsagePlan(this, 'APIUsagePlan', {
      name: 'EconLensUsagePlan',
      throttle: {
        rateLimit: 1000, // requests per second
        burstLimit: 2000,
      },
      quota: {
        limit: 100000, // requests per month
        period: apigateway.Period.MONTH,
      },
    });
    
    // RDS scaling (if using Aurora)
    if (config.environment === 'prod') {
      const scalingTarget = new applicationautoscaling.ScalableTarget(this, 'DBScalingTarget', {
        serviceNamespace: applicationautoscaling.ServiceNamespace.RDS,
        scalableDimension: 'rds:cluster:ReadReplicaCount',
        resourceId: `cluster:${this.databaseCluster.clusterIdentifier}`,
        minCapacity: 1,
        maxCapacity: 5,
      });
      
      scalingTarget.scaleToTrackMetric('DBCPUScaling', {
        targetValue: 70.0,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/RDS',
          metricName: 'CPUUtilization',
          dimensionsMap: {
            DBClusterIdentifier: this.databaseCluster.clusterIdentifier,
          },
        }),
      });
    }
  }
}
```

### Day 52-53: Launch Preparation

#### **Task 8.3: User Onboarding System**

**Onboarding Flow Implementation:**
```typescript
// Generate with Cursor - backend/src/services/onboarding-service.ts
export class OnboardingService {
  async createUserOnboardingFlow(userId: string): Promise<OnboardingFlow> {
    
    const onboardingSteps = [
      {
        id: 'welcome',
        title: 'Welcome to EconLens',
        description: 'Learn how EconLens helps you analyze your portfolio',
        type: 'intro',
        estimatedTime: 2,
      },
      {
        id: 'create_first_portfolio',
        title: 'Create Your First Portfolio',
        description: 'Add your investments to get started',
        type: 'action',
        estimatedTime: 5,
      },
      {
        id: 'run_first_analysis',
        title: 'Run Your First Scenario Analysis',
        description: 'See how your portfolio performs in different economic conditions',
        type: 'action', 
        estimatedTime: 3,
      },
      {
        id: 'explore_insights',
        title: 'Explore AI Insights',
        description: 'Understand the detailed analysis and recommendations',
        type: 'education',
        estimatedTime: 5,
      },
      {
        id: 'setup_preferences',
        title: 'Customize Your Experience',
        description: 'Set your investment preferences and risk tolerance',
        type: 'configuration',
        estimatedTime: 3,
      },
    ];
    
    // Create onboarding record
    await this.database.query(`
      INSERT INTO user_onboarding (user_id, steps, current_step, started_at)
      VALUES ($1, $2, 0, NOW())
    `, [userId, JSON.stringify(onboardingSteps)]);
    
    return {
      userId,
      steps: onboardingSteps,
      currentStep: 0,
      progress: 0,
    };
  }
}
```

#### **Task 8.4: Documentation and Help System**

**User Documentation:**
```typescript
// Generate comprehensive help system
export class HelpSystemContent {
  getHelpTopics(): HelpTopic[] {
    return [
      {
        id: 'getting-started',
        title: 'Getting Started with EconLens',
        content: `
# Getting Started with EconLens

Welcome to EconLens! This guide will help you create your first portfolio and run scenario analysis.

## Step 1: Create Your Portfolio
1. Click "Create Portfolio" from your dashboard
2. Enter a name for your portfolio (e.g., "My Retirement Account")
3. Add your investments by entering:
   - Stock/ETF symbol (e.g., VTI, AAPL)
   - Allocation percentage
   - Dollar amount

## Step 2: Run Scenario Analysis
1. Select your portfolio
2. Choose an economic scenario
3. Click "Start Analysis"
4. Review the results and AI insights

## Understanding Your Results
- **Portfolio Impact**: Shows how your investments might perform
- **Risk Assessment**: Identifies potential vulnerabilities
- **Opportunities**: Highlights potential benefits
- **Recommendations**: General strategies to consider
        `,
        category: 'basics',
        estimatedReadTime: 3,
        lastUpdated: new Date(),
      },
      
      {
        id: 'understanding-scenarios',
        title: 'Understanding Economic Scenarios',
        content: `
# Understanding Economic Scenarios

EconLens analyzes your portfolio against five key economic scenarios...
        `,
        category: 'analysis',
        estimatedReadTime: 5,
        lastUpdated: new Date(),
      },
      
      // Additional help topics...
    ];
  }
}
```

### Day 54-55: Beta Testing and Feedback

#### **Task 8.5: Beta User Management System**

**Beta Program Implementation:**
```typescript
export class BetaTestingService {
  async inviteBetaUsers(invitations: BetaInvitation[]): Promise<void> {
    
    for (const invitation of invitations) {
      // Create beta user record
      await this.database.query(`
        INSERT INTO beta_users (email, user_type, invited_at, invitation_token)
        VALUES ($1, $2, NOW(), $3)
      `, [invitation.email, invitation.userType, this.generateInviteToken()]);
      
      // Send invitation email
      await this.emailService.sendBetaInvitation({
        to: invitation.email,
        inviteCode: invitation.token,
        userType: invitation.userType,
      });
    }
  }
  
  async collectBetaFeedback(userId: string, feedback: BetaFeedback): Promise<void> {
    
    await this.database.query(`
      INSERT INTO beta_feedback (
        user_id, feature_rating, usability_rating, 
        comments, suggestion, bug_reports, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      userId,
      feedback.featureRating,
      feedback.usabilityRating,
      feedback.comments,
      feedback.suggestions,
      JSON.stringify(feedback.bugReports),
    ]);
    
    // Send acknowledgment
    await this.emailService.sendFeedbackAcknowledgment(userId);
  }
}
```

#### **Task 8.6: Analytics and User Behavior Tracking**

**Comprehensive Analytics:**
```typescript
export class AnalyticsService {
  async trackUserAction(action: UserAction): Promise<void> {
    
    // Track to CloudWatch custom metrics
    await this.cloudWatch.putMetricData({
      Namespace: 'EconLens/UserBehavior',
      MetricData: [
        {
          MetricName: action.type,
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'UserType', Value: action.userType },
            { Name: 'Environment', Value: process.env.ENVIRONMENT },
          ],
          Timestamp: new Date(),
        },
      ],
    }).promise();
    
    // Track detailed analytics
    await this.database.query(`
      INSERT INTO user_analytics (
        user_id, action_type, action_details, 
        session_id, timestamp, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      action.userId,
      action.type,
      action.details,
      action.sessionId,
      new Date(),
      action.metadata,
    ]);
  }
  
  async generateAnalyticsReport(period: DateRange): Promise<AnalyticsReport> {
    // Generate comprehensive usage analytics
    // User engagement metrics
    // Feature adoption rates
    // Performance metrics
    // Business KPIs
  }
}
```

### Day 56: Production Launch

#### **Task 8.7: Final Pre-Launch Checklist**

**Using Claude for Launch Validation:**
> "Create a comprehensive pre-launch checklist for EconLens production deployment. Include technical validation, security verification, performance testing, user experience validation, and business readiness criteria."

**Complete Launch Checklist:**

**Technical Readiness:**
- [ ] All infrastructure deployed via CDK
- [ ] CI/CD pipeline functioning end-to-end
- [ ] All automated tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met (API <2s, frontend <3s)
- [ ] Load testing completed (500+ concurrent users)
- [ ] Database backups configured and tested
- [ ] Disaster recovery procedures tested

**Security Validation:**
- [ ] WAF rules active and tested
- [ ] Security scanning passed (SAST, DAST, dependency scan)
- [ ] SSL certificates installed and valid
- [ ] IAM permissions follow least privilege
- [ ] Secrets properly managed (no hardcoded credentials)
- [ ] Audit logging functional
- [ ] Data encryption verified (rest and transit)

**User Experience:**
- [ ] Complete user onboarding flow tested
- [ ] Help documentation comprehensive and accurate
- [ ] Error messages user-friendly and actionable
- [ ] Mobile responsiveness verified
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Beta user feedback incorporated

**Business Readiness:**
- [ ] Privacy policy and terms of service published
- [ ] GDPR compliance measures implemented
- [ ] Customer support processes defined
- [ ] Pricing strategy finalized
- [ ] Marketing materials prepared
- [ ] Analytics tracking functional

**Monitoring and Alerting:**
- [ ] All critical alarms configured
- [ ] Dashboard showing key metrics
- [ ] On-call procedures documented
- [ ] Escalation paths defined
- [ ] Cost monitoring and alerts active

#### **Task 8.8: Go-Live Execution**

**Launch Day Protocol:**
```bash
# Final deployment to production
cd infrastructure
npx cdk deploy --all --require-approval never --context env=prod

# Verify all services healthy
npm run verify:production-health

# Enable monitoring alerts
aws sns publish --topic-arn $ALERT_TOPIC --message "EconLens production launch initiated"

# Monitor for 24 hours post-launch
# - Check error rates every 15 minutes
# - Monitor user registration flow
# - Validate portfolio creation and analysis
# - Track performance metrics
# - Monitor costs and usage
```

## Post-Launch Success Criteria

### Week 1 Targets
- **Uptime**: >99.5%
- **New Users**: 25+ registrations
- **Portfolio Creation**: 60% of users create portfolio
- **Scenario Analyses**: 40% of portfolio creators run analysis
- **User Satisfaction**: >4.0/5.0 average rating

### Month 1 Targets  
- **User Base**: 100+ registered users
- **Portfolio Value**: $2M+ under analysis
- **Scenario Runs**: 200+ completed analyses
- **User Retention**: 30%+ monthly active users
- **Cost Efficiency**: <$200/month operational costs

### Product-Market Fit Indicators
- **Organic Growth**: 15% of new users from referrals
- **Feature Adoption**: 70% of users try multiple scenarios
- **Content Sharing**: 10% of portfolios shared
- **Feedback Quality**: Consistent feature requests indicating engagement
- **Retention Patterns**: Users return to run additional analyses

## Congratulations! 🎉

With Stage 4 complete, you have successfully built and launched EconLens:

✅ **Production-Ready Infrastructure**: Complete AWS architecture with auto-scaling  
✅ **Professional DevOps**: Automated CI/CD with comprehensive testing  
✅ **Enterprise Security**: WAF, GuardDuty, Config, and compliance monitoring  
✅ **Advanced Monitoring**: Intelligent alerting and comprehensive dashboards  
✅ **User-Ready Product**: Onboarding, help system, and professional UX  
✅ **Business Operations**: Analytics, feedback systems, and growth tracking  

**EconLens is now live and ready to help investors understand their portfolio risks through AI-powered economic scenario analysis!**

Your technical portfolio demonstrates mastery of:
- AWS cloud architecture (15+ services)
- Serverless application development
- AI/ML integration with AWS Bedrock
- Infrastructure as Code with CDK
- Professional DevOps practices
- Production operations and monitoring
- Modern full-stack development

**Ready for your next challenge!** 🚀