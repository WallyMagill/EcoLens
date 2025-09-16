# Stage 0: Pre-Setup Phase (Week 0)

> **Code Disclaimer**: All code examples are architectural references. Use AI tools (Claude, Cursor, GitHub Copilot, Warp) to generate, analyze, and implement production code based on these specifications.

## Executive Summary

This critical setup phase establishes your development environment, AWS infrastructure foundation, and project structure before beginning active development. Proper setup here will accelerate all subsequent stages and ensure a smooth development experience.

**Duration**: 3-5 days  
**Primary AI Tools**: Warp (terminal operations), Claude (setup verification), Cursor (project structure)  
**Key Outcome**: Complete development environment ready for Stage 1 with all tools properly configured

**Duration**: 3-5 days  
**Primary AI Tools**: Warp (terminal operations), Claude (setup verification), Cursor (project structure)  
**Key Outcome**: Complete development environment ready for Stage 1

## Prerequisites Verification

### ✅ GitHub Repository Setup
- **Repository**: https://github.com/WallyMagill/EcoLens
- **Status**: Created and accessible
- **Required Actions**: Add .gitignore, README, initial project structure

### ✅ AWS Account Setup  
- **AWS Account**: Created with admin profile
- **Status**: Ready for resource creation
- **Required Actions**: Configure CLI, set up billing alerts, verify permissions

## Phase 1: Development Environment Setup (Day 1)

### 1.1 Install Required Tools

#### **Using Warp AI Terminal**
Ask Warp AI: "Set up development environment for TypeScript React AWS project with CDK using Node.js 20"

```bash
# Node.js (use Node Version Manager - you already have nvm installed)
# Install and use Node.js 20 (Latest LTS with AWS Lambda support)
nvm install 20
nvm use 20
nvm alias default 20

# Verify Node.js version
node --version  # Should show v20.x.x

# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# AWS CDK CLI
npm install -g aws-cdk

# TypeScript and development tools
npm install -g typescript ts-node jest

# Verify installations
node --version  # Should be 20.x.x
aws --version   # Should be 2.x
cdk --version   # Should be 2.x
```

#### **Development Tools Setup**
- **VSCode/Cursor**: Install with AWS Toolkit, TypeScript, ESLint extensions
- **GitHub Desktop** (optional): For Git GUI operations
- **Postman**: For API testing during development

### 1.2 AWS CLI Configuration

#### **Configure AWS Profiles**
Using Warp AI: "Set up AWS CLI profiles for different environments"

```bash
# Configure default admin profile
aws configure --profile econlens-admin
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]  
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity --profile econlens-admin

# Set environment variable for convenience
echo 'export AWS_PROFILE=econlens-admin' >> ~/.zshrc
source ~/.zshrc
```

#### **Test AWS Access**
```bash
# Verify permissions
aws iam get-user --profile econlens-admin
aws s3 ls --profile econlens-admin

# Test CDK bootstrap (we'll do this properly in Phase 2)
cdk doctor
```

### 1.3 GitHub Repository Configuration

#### **Clone and Setup Repository**
```bash
# Clone your repository
git clone https://github.com/WallyMagill/EcoLens.git
cd EcoLens

# Create comprehensive .gitignore
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore

# Add AWS-specific ignores to .gitignore
cat >> .gitignore << 'EOF'

# AWS
.aws/
*.pem
cdk.out/
cdk.context.json

# Environment files
.env
.env.local
.env.production
.env.test

# CDK
cdk.out
*.js.map
*.d.ts.map

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage
coverage/
.nyc_output/

# Dependencies
node_modules/
jspm_packages/

# Build outputs
build/
dist/
.next/

# Temporary files
.tmp/
.temp/
EOF
```

## Phase 2: Project Structure Creation (Day 2)

### 2.1 Initialize Project Structure

#### **Using Cursor AI**
Open Cursor in your project directory and ask:
> "Create a monorepo structure for EconLens with frontend (React TypeScript), backend (Node.js Lambda functions), and infrastructure (AWS CDK TypeScript). Follow the Portfolio-Data-Specification.md for data models."

**Expected Structure:**
```
EcoLens/
├── README.md
├── .gitignore
├── package.json                 # Root package.json for scripts
├── docs/                        # All documentation files
│   ├── 01-Product-Overview-and-MVP-Scope.md
│   ├── 02-AWS-Architecture-and-Technical-Stack.md
│   ├── [other documentation files]
│   ├── AI-Tools-Optimization-Guide.md
│   └── Portfolio-Data-Specification.md
├── frontend/                    # React TypeScript application
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── tests/
├── backend/                     # Lambda functions and API
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── functions/
│   │   │   ├── auth/
│   │   │   ├── portfolio/
│   │   │   ├── scenarios/
│   │   │   └── shared/
│   │   ├── types/
│   │   ├── utils/
│   │   └── database/
│   └── tests/
└── infrastructure/              # AWS CDK code
    ├── package.json
    ├── tsconfig.json
    ├── cdk.json
    ├── bin/
    │   └── econlens.ts
    ├── lib/
    │   ├── stacks/
    │   ├── constructs/
    │   └── config/
    └── tests/
```

### 2.2 Initialize Package Configurations

#### **Root Package.json**
```json
{
  "name": "econlens",
  "version": "0.1.0",
  "private": true,
  "description": "Portfolio analysis tool with AI-powered economic scenario testing",
  "scripts": {
    "install:all": "npm install && npm run install:frontend && npm run install:backend && npm run install:infra",
    "install:frontend": "cd frontend && npm install",
    "install:backend": "cd backend && npm install", 
    "install:infra": "cd infrastructure && npm install",
    "dev:frontend": "cd frontend && npm start",
    "build:frontend": "cd frontend && npm run build",
    "test:all": "npm run test:frontend && npm run test:backend && npm run test:infra",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test",
    "test:infra": "cd infrastructure && npm test",
    "deploy:dev": "cd infrastructure && npm run deploy:dev",
    "deploy:prod": "cd infrastructure && npm run deploy:prod",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/WallyMagill/EcoLens.git"
  },
  "keywords": ["portfolio", "analysis", "aws", "serverless", "ai"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 2.3 TypeScript Configurations

#### **Root tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": [
    "src/**/*",
    "tests/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

## Phase 3: AWS Foundation Setup (Day 3)

### 3.1 CDK Bootstrap and Initial Setup

#### **Bootstrap AWS Environment**
Using Warp AI: "Bootstrap AWS CDK for new project with multiple environments"

```bash
cd infrastructure
npm init -y
npm install aws-cdk-lib constructs
npm install -D @types/node typescript

# Initialize CDK app
cdk init app --language=typescript

# Bootstrap CDK (creates necessary S3 bucket and roles)
cdk bootstrap --profile econlens-admin

# Verify bootstrap
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE --query 'StackSummaries[?contains(StackName, `CDKToolkit`)].StackName' --profile econlens-admin
```

### 3.2 Environment Configuration Setup

#### **Create Environment Config Files**
Using Cursor: Create these files in `infrastructure/lib/config/`:

**base.ts** - Base configuration interface
**dev.ts** - Development environment settings  
**prod.ts** - Production environment settings

Reference the patterns from `docs/07-AWS-Deployment-and-Operations.md`

### 3.3 Initial Infrastructure Validation

#### **Create Minimal Test Stack**
```bash
# Create a simple test stack to verify everything works
cd infrastructure

# Deploy test stack
cdk deploy TestStack --profile econlens-admin

# Verify deployment
aws cloudformation describe-stacks --stack-name TestStack --profile econlens-admin

# Clean up test stack
cdk destroy TestStack --profile econlens-admin
```

## Phase 4: Development Tooling Setup (Day 4)

### 4.1 Frontend Development Environment

#### **React TypeScript Setup**
```bash
cd frontend
npx create-react-app . --template=typescript

# Install additional dependencies
npm install @reduxjs/toolkit react-redux
npm install -D @types/jest @testing-library/react @testing-library/jest-dom
npm install recharts lucide-react
npm install aws-amplify @aws-amplify/auth

# Configure package.json scripts for development
```

### 4.2 Backend Development Environment

#### **Lambda Development Setup**
```bash
cd backend
npm init -y
npm install aws-lambda-js-handler aws-sdk
npm install -D @types/aws-lambda @types/node typescript jest ts-jest
npm install pg @types/pg
npm install jsonwebtoken @types/jsonwebtoken

# Configure Jest for testing
npx ts-jest config:init
```

### 4.3 Database Development Setup

#### **Local PostgreSQL for Development**
Using Warp AI: "Set up local PostgreSQL for development with Docker"

```bash
# Create docker-compose for local development
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: econlens_dev
      POSTGRES_USER: econlens
      POSTGRES_PASSWORD: development_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
EOF

# Start local database
docker-compose up -d

# Verify connection
psql -h localhost -U econlens -d econlens_dev
```

## Phase 5: Documentation and Standards Setup (Day 5)

### 5.1 Development Standards Configuration

#### **ESLint and Prettier Setup**
```bash
# Install globally for consistency
npm install -g eslint prettier

# Create .eslintrc.js in each project
# Create .prettierrc in each project  
# Configure pre-commit hooks with husky
```

### 5.2 Documentation Updates

#### **Create Comprehensive README**
Using Claude: "Create a professional README for EconLens GitHub repository that explains the project, architecture, and setup process"

#### **Update Documentation Cross-References**
Review all documentation files and update cross-references to reflect:
- GitHub repository URL
- New project structure
- Tool recommendations from AI-Tools-Optimization-Guide.md

### 5.3 Testing Framework Setup

#### **Configure Testing Infrastructure**
- Jest configurations for all projects
- Testing utilities and helpers
- CI/CD preparation (GitHub Actions templates)

## Phase 6: Verification and Handoff (Day 6)

### 6.1 Environment Verification Checklist

#### **Development Environment**
- [ ] Node.js 20.x installed and working
- [ ] AWS CLI configured with econlens-admin profile
- [ ] CDK installed and bootstrapped
- [ ] All package.json files created and dependencies installed
- [ ] TypeScript configurations working
- [ ] Local PostgreSQL running and accessible

#### **Project Structure**
- [ ] All directories created according to specification
- [ ] .gitignore comprehensive and appropriate
- [ ] Cross-references in documentation updated
- [ ] README.md professional and informative
- [ ] AI tools setup and tested

#### **AWS Foundation**
- [ ] CDK bootstrap successful
- [ ] Test stack deployment and destruction working
- [ ] AWS permissions verified for all required services
- [ ] Billing alerts configured
- [ ] Cost monitoring enabled

### 6.2 AI Tools Integration Test

#### **Test Each Tool with Project Context**
1. **Claude**: Ask about architecture decisions referencing docs
2. **Cursor**: Generate a simple component following project patterns
3. **GitHub Copilot**: Test auto-completion in project context
4. **Warp**: Execute AWS CLI commands and verify AI help

### 6.3 Pre-Stage 1 Preparation

#### **Review Stage 1 Requirements**
- Read through `Stage-1-Foundation.md` (to be created next)
- Verify all prerequisites are met
- Plan first week development tasks
- Set up project management (GitHub Issues/Projects)

#### **Final Repository State**
```bash
# Verify clean git state
git status
git add .
git commit -m "Pre-setup phase complete - ready for Stage 1"
git push origin main

# Tag the setup completion
git tag -a v0.1-setup -m "Pre-setup phase completed"
git push origin v0.1-setup
```

## Success Criteria

### ✅ Environment Ready
- All development tools installed and configured
- AWS access verified and working
- Local development environment functional
- Project structure established

### ✅ Documentation Complete  
- All documentation updated with correct references
- AI tools guide accessible and tested
- Portfolio specification ready for implementation
- Development standards established

### ✅ Foundation Deployed
- CDK working and tested
- AWS permissions verified
- Cost monitoring active
- Version control properly configured

## Next Steps

With pre-setup complete, you're ready to begin **Stage 1: Foundation Development**. The next document will guide you through:

- VPC and networking setup
- RDS PostgreSQL deployment  
- Basic EC2 application server
- User authentication with Cognito
- Initial portfolio CRUD operations

**Estimated Total Setup Time**: 3-5 days  
**Ready for Stage 1**: ✅ All prerequisites verified