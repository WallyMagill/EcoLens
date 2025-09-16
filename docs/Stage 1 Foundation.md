# Stage 1: AWS Foundation and Core Application (Weeks 1-2)

> **Code Disclaimer**: All code examples are architectural references. Use AI tools (Claude, Cursor, GitHub Copilot, Warp) to generate, analyze, and implement production code based on these specifications.

## Overview

Stage 1 establishes the core AWS infrastructure and basic application functionality. You'll deploy traditional AWS services (EC2, RDS, S3) to learn fundamentals before migrating to serverless in Stage 2.

**Duration**: 2 weeks (14 days)  
**Primary AI Tools**: CDK (Cursor), AWS CLI (Warp), Architecture decisions (Claude), Code completion (Copilot)  
**Key Outcome**: Working portfolio CRUD application with user authentication

## Prerequisites

✅ **Pre-Setup Phase Completed**
- Development environment configured  
- AWS CLI and CDK working
- Project structure established
- Local PostgreSQL running

✅ **Required Knowledge**
- Review `docs/02-AWS-Architecture-and-Technical-Stack.md` (Stage 1 architecture)
- Review `docs/04-User-Authentication-and-Data-Model.md` (Cognito & database design)
- Review `docs/Portfolio-Data-Specification.md` (data models)

## Learning Objectives

### AWS Services Mastery
- **VPC Networking**: Subnets, security groups, route tables
- **EC2 Management**: Instance types, security, monitoring
- **RDS Operations**: PostgreSQL deployment, backups, connections
- **S3 Storage**: Bucket policies, encryption, lifecycle management
- **Cognito Authentication**: User pools, JWT tokens, integration
- **CloudFront CDN**: Distribution setup, caching strategies
- **IAM Security**: Roles, policies, least privilege principles

### Development Skills
- CDK Infrastructure as Code patterns
- Express.js API development on AWS
- React TypeScript with AWS integration
- Database schema design and migrations
- RESTful API design and implementation

## Week 1: Core Infrastructure (Days 1-7)

### Day 1-2: VPC and Networking Foundation

#### **Task 1.1: Network Stack Creation**

**Using Cursor AI:**
> "Create AWS CDK NetworkStack based on the specifications in docs/07-AWS-Deployment-and-Operations.md. Include VPC with public/private subnets, security groups for web/app/database tiers, and VPC endpoints for S3."

**Expected Files:**
- `infrastructure/lib/stacks/network-stack.ts`
- `infrastructure/lib/config/dev.ts` 
- `infrastructure/bin/econlens.ts`

**Key Components:**
```typescript
// Reference implementation structure (generate with Cursor)
export class NetworkStack extends Stack {
  public readonly vpc: ec2.Vpc;
  public readonly appSecurityGroup: ec2.SecurityGroup;
  public readonly dbSecurityGroup: ec2.SecurityGroup;
  
  constructor(scope: Construct, id: string, config: EnvironmentConfig) {
    // VPC with 2 AZs, public/private subnets
    // Security groups with proper ingress/egress rules
    // VPC endpoints for AWS services
    // NAT Gateway for private subnet internet access
  }
}
```

**Deployment Commands (Warp AI):**
```bash
cd infrastructure

# Install dependencies
npm install

# Synthesize CloudFormation template
cdk synth NetworkStack-dev

# Deploy network infrastructure
cdk deploy NetworkStack-dev --profile econlens-admin

# Verify deployment
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*EconLens*" --profile econlens-admin
```

#### **Task 1.2: Security Groups Configuration**

**Security Group Rules:**
- **Web Tier**: HTTP (80), HTTPS (443) from internet
- **App Tier**: HTTP (3000) from web tier only
- **Database Tier**: PostgreSQL (5432) from app tier only

**Verification:**
```bash
# Test security group creation
aws ec2 describe-security-groups --group-names "EconLens-*" --profile econlens-admin
```

### Day 3-4: Database Infrastructure

#### **Task 1.3: RDS PostgreSQL Deployment**

**Using Cursor AI:**
> "Create RDS PostgreSQL stack based on docs/04-User-Authentication-and-Data-Model.md schema. Include parameter groups, subnet groups, and proper security configuration."

**Database Configuration:**
- Instance: `db.t3.micro` (free tier eligible)
- Engine: PostgreSQL 14.x
- Storage: 20GB GP2 with encryption
- Backup: 7 days retention
- Multi-AZ: False (dev), True (prod)

**Key Implementation Points:**
```typescript
// Generate with Cursor based on docs
export class DatabaseStack extends Stack {
  public readonly database: rds.DatabaseInstance;
  
  constructor(scope: Construct, id: string, vpc: ec2.Vpc, securityGroup: ec2.SecurityGroup) {
    // Database subnet group
    // Parameter group with optimized settings
    // Database instance with secrets manager
    // CloudWatch monitoring
  }
}
```

#### **Task 1.4: Database Schema Creation**

**Using Claude for Schema Design:**
> "Generate the complete PostgreSQL schema based on Portfolio-Data-Specification.md, including all tables, indexes, constraints, and seed data for the 5 economic scenarios."

**Schema Files to Create:**
- `backend/database/migrations/001_initial_schema.sql`
- `backend/database/migrations/002_seed_scenarios.sql`
- `backend/database/scripts/create_dev_data.sql`

**Deploy Schema:**
```bash
# Connect to RDS instance
psql -h [rds-endpoint] -U econlens_admin -d econlens

# Run migrations
\i backend/database/migrations/001_initial_schema.sql
\i backend/database/migrations/002_seed_scenarios.sql
```

### Day 5-6: Application Server Setup

#### **Task 1.5: EC2 Instance Deployment**

**Using CDK for EC2:**
```typescript
// Generate with Cursor
export class ComputeStack extends Stack {
  public readonly appServer: ec2.Instance;
  
  constructor(scope: Construct, id: string, vpc: ec2.Vpc, securityGroup: ec2.SecurityGroup) {
    // EC2 instance in private subnet
    // Application Load Balancer in public subnets
    // Auto Scaling Group (single instance for dev)
    // CloudWatch monitoring
  }
}
```

**Instance Configuration:**
- Type: `t2.micro` (free tier)
- AMI: Amazon Linux 2023
- Storage: 8GB GP3
- Key pair for SSH access
- IAM role with necessary permissions

#### **Task 1.6: Express.js API Server**

**Using Cursor AI:**
> "Create Express.js TypeScript API server structure based on docs/06-API-Design-and-Frontend-Architecture.md. Include authentication middleware, portfolio routes, database connection, and error handling."

**API Server Structure:**
```typescript
// backend/src/app.ts - Main application
// backend/src/routes/ - Route definitions
// backend/src/middleware/ - Authentication, validation, error handling
// backend/src/services/ - Business logic
// backend/src/utils/ - Database connection, helpers
```

**Key Features to Implement:**
1. Database connection with connection pooling
2. JWT token validation middleware
3. Portfolio CRUD endpoints
4. User management endpoints
5. Error handling and logging
6. CORS configuration

**Deployment Process:**
```bash
# Build and deploy to EC2
cd backend
npm run build

# Use AWS Systems Manager or SCP to deploy
# Configure PM2 for process management
# Set up CloudWatch logging
```

### Day 7: Authentication Integration

#### **Task 1.7: AWS Cognito Setup**

**Using CDK:**
```typescript
// Generate complete Cognito setup with Cursor
export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.IdentityPool;
}
```

**Cognito Configuration:**
- User Pool with email verification
- Password policy enforcement
- Custom attributes for investment experience
- App client with appropriate OAuth flows
- Identity Pool for AWS resource access

#### **Task 1.8: Backend Authentication Integration**

**JWT Validation Middleware:**
```typescript
// Generate with Cursor based on docs/04-User-Authentication-and-Data-Model.md
export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Extract token from Authorization header
  // Validate against Cognito public keys
  // Decode user information
  // Add user context to request
};
```

## Week 2: Frontend and Integration (Days 8-14)

### Day 8-9: React Application Foundation

#### **Task 2.1: React TypeScript Setup**

**Using Cursor AI:**
> "Create React TypeScript application structure based on docs/06-API-Design-and-Frontend-Architecture.md. Include routing, state management with Redux Toolkit, and AWS Amplify Auth integration."

**Frontend Structure:**
```typescript
// frontend/src/
├── components/
│   ├── auth/           # Login, Register, Protected routes
│   ├── portfolio/      # Portfolio management components
│   ├── shared/         # Reusable UI components
│   └── layout/         # Header, Footer, Navigation
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── store/              # Redux store configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

#### **Task 2.2: Authentication UI Components**

**Key Components to Create:**
1. `LoginForm.tsx` - User login with Cognito
2. `RegisterForm.tsx` - User registration flow
3. `ForgotPasswordForm.tsx` - Password reset
4. `ProtectedRoute.tsx` - Route protection wrapper
5. `AuthProvider.tsx` - Authentication context

**Using GitHub Copilot:**
Write descriptive comments for each component and let Copilot suggest implementations:

```typescript
// Create a login form component that integrates with AWS Cognito
// Include form validation, error handling, and loading states
export const LoginForm: React.FC = () => {
  // Copilot will suggest implementation
};
```

### Day 10-11: Portfolio Management UI

#### **Task 2.3: Portfolio Components**

**Core Portfolio Components:**
1. `PortfolioList.tsx` - Display user's portfolios
2. `PortfolioCard.tsx` - Individual portfolio summary
3. `PortfolioForm.tsx` - Create/edit portfolio
4. `AssetInput.tsx` - Individual asset entry
5. `AllocationChart.tsx` - Visual portfolio allocation

**Using Cursor for Complex Components:**
> "Create PortfolioForm component that handles the complete portfolio creation workflow from Portfolio-Data-Specification.md. Include asset allocation validation, auto-calculation of dollar amounts, and integration with the backend API."

#### **Task 2.4: Data Visualization**

**Chart Components:**
- Pie chart for asset allocation
- Bar chart for asset values
- Risk metrics display
- Portfolio summary cards

**Libraries:**
- Recharts for charts
- Lucide React for icons
- Tailwind CSS for styling

### Day 12-13: API Integration and Testing

#### **Task 2.5: API Service Layer**

**Using Cursor:**
> "Create complete API service layer based on docs/06-API-Design-and-Frontend-Architecture.md endpoint specifications. Include authentication token management, error handling, and TypeScript types."

**Service Structure:**
```typescript
// frontend/src/services/
├── api.ts              # Base API client with interceptors
├── auth.ts             # Authentication services
├── portfolio.ts        # Portfolio CRUD operations  
├── scenarios.ts        # Scenario-related services
└── types.ts            # API response types
```

#### **Task 2.6: Integration Testing**

**Testing Areas:**
1. User registration and login flow
2. Portfolio CRUD operations
3. Data validation and error handling
4. Authentication token management
5. API error scenarios

**Using Jest and React Testing Library:**
```bash
cd frontend
npm test
```

### Day 14: Deployment and Static Hosting

#### **Task 2.7: S3 and CloudFront Setup**

**Using CDK:**
```typescript
// Generate with Cursor
export class FrontendStack extends Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  
  constructor(scope: Construct, id: string) {
    // S3 bucket for static hosting
    // CloudFront distribution
    // Route 53 domain (optional)
    // SSL certificate
  }
}
```

#### **Task 2.8: Build and Deployment Process**

**Automated Deployment:**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync build/ s3://econlens-frontend-dev --profile econlens-admin

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id [DISTRIBUTION_ID] --paths "/*" --profile econlens-admin
```

## Stage 1 Demo Requirements

### Functional Demo Checklist

#### **User Authentication**
- [ ] User registration with email verification
- [ ] User login with JWT token handling
- [ ] Password reset functionality
- [ ] Protected routes working correctly
- [ ] User profile management

#### **Portfolio Management**
- [ ] Create new portfolio with multiple assets
- [ ] View portfolio list and details
- [ ] Edit existing portfolio
- [ ] Delete portfolio with confirmation
- [ ] Portfolio allocation validation (sums to 100%)

#### **Data Persistence**
- [ ] All data stored in PostgreSQL
- [ ] User data properly isolated
- [ ] Data validation working correctly
- [ ] Error handling for invalid inputs

#### **UI/UX**
- [ ] Responsive design (desktop and mobile)
- [ ] Loading states for async operations
- [ ] Error messages for user feedback
- [ ] Clean, professional interface

### Technical Validation Checklist

#### **AWS Infrastructure**
- [ ] VPC with proper subnet configuration
- [ ] Security groups with least-privilege access
- [ ] RDS instance accessible from EC2 only
- [ ] S3 bucket with proper permissions
- [ ] CloudFront distribution serving frontend
- [ ] All resources tagged appropriately

#### **Application Architecture**
- [ ] Express.js API running on EC2
- [ ] Database connection pooling working
- [ ] JWT authentication implemented correctly
- [ ] CORS configured for frontend domain
- [ ] Error handling and logging in place

#### **Performance**
- [ ] API response times <2 seconds
- [ ] Frontend load time <3 seconds
- [ ] Database queries optimized
- [ ] No memory leaks or connection issues

## Troubleshooting Guide

### Common Issues and Solutions

#### **Database Connection Errors**
**Problem**: Lambda cannot connect to RDS
**Using Claude**: "Help me debug RDS connection issues from EC2. Here are the error logs: [paste logs]"
**Solution**: Check security groups, subnet routing, connection strings

#### **Cognito Authentication Failures**
**Problem**: JWT token validation failing
**Using Warp**: "Debug AWS Cognito JWT token validation errors"
**Solution**: Verify User Pool configuration, check token expiration, validate JWKS endpoint

#### **CORS Issues**
**Problem**: Frontend cannot call API
**Solution**: Configure Express CORS middleware for CloudFront domain

#### **Build/Deploy Failures**
**Problem**: CDK deployment fails
**Using Claude**: "Analyze this CDK deployment error and suggest solutions: [error message]"
**Solution**: Check IAM permissions, resource naming conflicts, dependency issues

## Cost Optimization

### Free Tier Usage Tracking
Monitor these services to stay within free tier:
- **EC2**: 750 hours/month t2.micro
- **RDS**: 750 hours/month db.t3.micro + 20GB storage
- **S3**: 5GB storage + 20K GET + 2K PUT requests
- **CloudFront**: 50GB transfer + 2M requests
- **Cognito**: 50K MAUs

### Cost Alerts
Set up billing alerts at:
- $10 - First warning
- $25 - Review usage
- $50 - Investigate immediately

## Success Metrics

### Technical Metrics
- **Uptime**: >99% application availability
- **Performance**: API <2s, Frontend <3s load time
- **Security**: All security groups properly configured
- **Functionality**: All demo requirements working

### Learning Metrics
- **AWS Services**: Comfortable with 7+ core services
- **Infrastructure**: Can deploy and modify CDK stacks
- **Development**: Full-stack application working end-to-end
- **Troubleshooting**: Can debug common AWS issues

## Next Steps: Stage 2 Migration

With Stage 1 complete, you have:
✅ Working traditional AWS infrastructure
✅ Complete authentication system  
✅ Portfolio CRUD operations
✅ Professional React frontend
✅ Production-ready deployment process

**Stage 2** will migrate this foundation to serverless architecture:
- EC2 → API Gateway + Lambda
- Enhanced Cognito integration
- File upload with S3 processing
- Performance optimization
- Advanced error handling

The traditional infrastructure knowledge from Stage 1 will help you appreciate the serverless benefits in Stage 2!