# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EcoLens is a serverless portfolio analysis application that helps investors understand how their investments might perform under different economic scenarios using AI-powered insights. Built with AWS serverless architecture, it demonstrates production-ready cloud development patterns.

**Tech Stack**: AWS Lambda, API Gateway, RDS PostgreSQL, AWS Bedrock (Claude AI), React TypeScript, CDK Infrastructure as Code

## Development Commands

### AWS Infrastructure
```bash
# Navigate to infrastructure directory
cd infrastructure

# Install CDK dependencies
npm install

# Synthesize CloudFormation templates
cdk synth

# Deploy specific stack to development environment
cdk deploy NetworkStack-dev --profile econlens-admin
cdk deploy DatabaseStack-dev --profile econlens-admin
cdk deploy ComputeStack-dev --profile econlens-admin

# Deploy all stacks
cdk deploy --all --profile econlens-admin

# Destroy infrastructure (use with caution)
cdk destroy --all --profile econlens-admin
```

### Backend Development
```bash
# Backend API server operations
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Run database migrations
npm run migrate

# Seed database with scenario data
npm run seed

# Run backend tests
npm test

# Run specific test file
npm test -- --testNamePattern="portfolio"
```

### Frontend Development
```bash
# Frontend React application
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run frontend tests
npm test

# Build for production
npm run build

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Database Operations
```bash
# Connect to RDS PostgreSQL (replace with actual endpoint)
psql -h [rds-endpoint] -U econlens_admin -d econlens

# Run local PostgreSQL for development
docker run --name econlens-postgres -e POSTGRES_PASSWORD=dev123 -p 5432:5432 -d postgres:14

# Apply database migrations
psql -h localhost -U postgres -d econlens -f backend/database/migrations/001_initial_schema.sql
```

### AWS CLI Operations
```bash
# Verify AWS configuration
aws sts get-caller-identity --profile econlens-admin

# Check VPC resources
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*EconLens*" --profile econlens-admin

# Check RDS instances
aws rds describe-db-instances --profile econlens-admin

# View Lambda functions
aws lambda list-functions --profile econlens-admin

# View API Gateway APIs
aws apigateway get-rest-apis --profile econlens-admin

# Check S3 buckets
aws s3 ls --profile econlens-admin
```

## Architecture Overview

### Multi-Stage Development Approach
EcoLens follows a 4-stage development progression from traditional AWS services to full serverless:

1. **Stage 1 (Foundation)**: VPC, EC2, RDS, S3, Cognito - Traditional AWS architecture
2. **Stage 2 (Serverless Migration)**: API Gateway + Lambda, file processing
3. **Stage 3 (AI Integration)**: AWS Bedrock, SQS, ElastiCache for AI scenarios
4. **Stage 4 (Production Ready)**: Full CDK automation, CI/CD, monitoring

### Core Data Architecture
- **Portfolio Assets**: Support for stocks, ETFs, mutual funds, bonds, REITs, commodities
- **Economic Scenarios**: 5 predefined scenarios (recession, inflation, growth, etc.)
- **AI Analysis**: AWS Bedrock (Claude 3.5 Sonnet) for scenario impact analysis
- **User Authentication**: AWS Cognito with JWT tokens
- **Data Storage**: PostgreSQL with well-defined schema for portfolios and analysis

### Key Services Integration
- **Frontend**: React TypeScript with Redux Toolkit, hosted on S3 + CloudFront
- **API Layer**: Express.js on Lambda with API Gateway
- **Database**: PostgreSQL on RDS with connection pooling
- **AI Processing**: AWS Bedrock for economic scenario analysis
- **File Processing**: S3 for CSV uploads, Lambda for processing
- **Monitoring**: CloudWatch for logs and metrics

### Security & Compliance
- VPC with proper subnet segregation (public/private)
- Security groups with least privilege access
- IAM roles with minimal permissions
- JWT-based authentication
- Data encryption at rest and in transit

## Development Guidelines

### AI Tool Usage Strategy
This project is designed for AI-assisted development:

- **Claude**: Architecture decisions, complex problem solving, code review
- **Cursor**: File creation, code generation, refactoring
- **GitHub Copilot**: Auto-completion, pattern recognition
- **Warp**: Terminal operations, AWS CLI commands

### Code Organization
- `infrastructure/`: CDK stacks organized by service (network, database, compute)
- `backend/`: Express.js API with modular route/service/middleware structure
- `frontend/`: React components with feature-based organization
- `docs/`: Comprehensive stage-by-stage implementation guides

### Environment Management
- Development: Uses AWS free tier resources where possible
- Staging: Scaled-down production environment
- Production: Full monitoring, backup, and disaster recovery

### Testing Strategy
- Unit tests for individual components and functions
- Integration tests for API endpoints
- End-to-end tests for critical user workflows
- Infrastructure tests using CDK unit testing framework

### Data Import/Export
- CSV import for portfolio data with validation
- Standard format with required columns: Symbol, Name, Asset Type, Allocation %, Dollar Amount
- Extended format supports additional metadata like expense ratios, dividend yields

## Documentation Structure

The `docs/` directory contains comprehensive implementation guides:
- Core architecture and technical stack documentation
- Stage-by-stage development plans with AI tool optimization
- Detailed API design and data model specifications
- Production deployment and operations guides
- Testing, quality assurance, and launch checklists

Each document includes AI tool integration strategies and specific prompts for optimal development workflow.

## Cost Optimization

Project designed to maximize AWS free tier usage:
- Stage 1: ~$0.50/month (within free tier)
- Stage 2: ~$0.50/month (serverless efficiency)
- Stage 3: ~$25/month (AI services added)
- Stage 4: ~$95/month (production features)

## Quick Start References

1. **First Time Setup**: Start with `docs/Stage-0-Pre-Setup-Phase.md`
2. **Architecture Overview**: Review `docs/02-AWS-Architecture-and-Technical-Stack.md`
3. **Data Models**: Reference `docs/Portfolio-Data-Specification.md`
4. **AI Tool Optimization**: Use `docs/AI-Tools-Optimization-Guide.md` for development workflow

## AWS Profile Configuration

Ensure your AWS CLI is configured with the correct profile:
```bash
aws configure --profile econlens-admin
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

Set environment variable for CDK:
```bash
export AWS_PROFILE=econlens-admin
```
