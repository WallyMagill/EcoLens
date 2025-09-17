# EconLens - Portfolio Analysis Platform (Simplified for AWS Learning)

> **AI-powered portfolio analysis and economic scenario testing - Simplified for AWS Learning**

EconLens is a comprehensive portfolio analysis platform that helps investors understand how their portfolios would perform under different economic scenarios. This version has been simplified for AWS learning while maintaining core functionality.

## 🏗️ Simplified Architecture

This is a monorepo containing four main workspaces with a **simplified, learning-focused infrastructure**:

- **`shared/`** - Common types, utilities, and business logic
- **`frontend/`** - React TypeScript application with Redux
- **`backend/`** - Express.js server (traditional hosting)
- **`infrastructure/`** - Single AWS CDK stack for learning

## 🎯 Learning Focus

This simplified architecture is designed to teach AWS fundamentals:

- **EC2**: Traditional server hosting and management
- **VPC**: Basic networking concepts
- **RDS**: Database setup and management
- **S3**: Object storage and IAM integration
- **Cognito**: Basic authentication
- **Cost**: Under $20/month (mostly free tier)

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- AWS CLI configured with admin permissions
- AWS CDK v2 installed globally

### 1. Deploy Infrastructure

```bash
# Deploy the simplified AWS infrastructure
./scripts/deploy-infrastructure.sh
```

### 2. Create EC2 Key Pair

1. Go to AWS Console → EC2 → Key Pairs
2. Create a new key pair named `econlens-keypair`
3. Download the `.pem` file to `~/.ssh/econlens-keypair.pem`
4. Set permissions: `chmod 400 ~/.ssh/econlens-keypair.pem`

### 3. Deploy Backend

```bash
# Get EC2 IP from CDK outputs, then deploy
EC2_HOST=your-ec2-ip ./backend/scripts/deploy-to-ec2.sh
```

### 4. Start Development

```bash
# Install all dependencies
npm run install:all

# Start frontend development server
npm run dev:frontend

# Backend runs on EC2 instance
```

## 📁 Simplified Project Structure

```
EcoLens/
├── shared/                 # Shared types and utilities
├── frontend/               # React application (unchanged)
├── backend/                # Express.js server
│   ├── src/
│   │   ├── index.ts        # Express server entry point
│   │   ├── database/       # Database connection
│   │   └── functions/      # API route handlers
│   └── scripts/
│       └── deploy-to-ec2.sh # EC2 deployment script
├── infrastructure/         # Single CDK stack
│   ├── lib/stacks/
│   │   └── econlens-stack.ts # Simple infrastructure
│   └── bin/
│       └── econlens.ts     # CDK app entry point
├── scripts/
│   └── deploy-infrastructure.sh # Infrastructure deployment
├── docs/
│   └── Simplified-Architecture.md # Architecture documentation
└── SETUP-SIMPLIFIED.md     # Quick setup guide
```

## 🛠️ Technology Stack

### Frontend (Unchanged)
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling

### Backend (Simplified)
- **Node.js** with TypeScript
- **Express.js** for API framework
- **PostgreSQL** for database
- **PM2** for process management
- **Winston** for logging

### Infrastructure (Simplified)
- **AWS CDK** for infrastructure as code
- **EC2 t2.micro** for compute (free tier)
- **RDS db.t3.micro** for PostgreSQL (free tier)
- **S3** for file storage (free tier)
- **Cognito** for authentication
- **Single VPC** with public subnet

## 💰 Cost Breakdown

| Service | Instance Type | Free Tier | Monthly Cost |
|---------|---------------|-----------|--------------|
| EC2 t2.micro | 750 hours | ✅ | $0 |
| RDS db.t3.micro | 750 hours | ✅ | $0 |
| S3 Storage | 5GB | ✅ | $0 |
| Data Transfer | 1GB | ✅ | $0 |
| **Total** | | | **~$0-5/month** |

## 📊 Features (Maintained)

### Portfolio Management
- Create and manage multiple portfolios
- Import portfolios via CSV files
- Real-time portfolio validation
- Asset allocation tracking

### Scenario Analysis
- Test portfolios against economic scenarios
- Risk assessment and recommendations
- Historical context and comparisons

### Risk Analytics
- Concentration risk analysis
- Diversification scoring
- Volatility calculations
- Credit risk assessment

## 🔧 Development Scripts

### Infrastructure
```bash
# Deploy infrastructure
./scripts/deploy-infrastructure.sh

# Deploy backend to EC2
EC2_HOST=your-ip ./backend/scripts/deploy-to-ec2.sh

# Destroy infrastructure (cleanup)
cd infrastructure && npm run destroy
```

### Development
```bash
# Install all dependencies
npm run install:all

# Start frontend development
npm run dev:frontend

# Build backend
npm run build:backend
```

## 🧪 Testing

```bash
# Run tests for specific workspace
cd frontend && npm test
cd backend && npm test
cd shared && npm test
```

## 📚 Documentation

- [`docs/Simplified-Architecture.md`](docs/Simplified-Architecture.md) - Complete architecture documentation
- [`SETUP-SIMPLIFIED.md`](SETUP-SIMPLIFIED.md) - Quick setup guide
- [`docs/Portfolio Specification.md`](docs/Portfolio%20Specification.md) - Data model specification

## 🎓 Learning Objectives

With this simplified setup, you can learn:

1. **AWS Fundamentals**
   - VPC and subnet configuration
   - EC2 instance management
   - RDS database setup
   - S3 bucket configuration
   - IAM roles and policies

2. **Traditional Hosting**
   - Process management with PM2
   - Environment configuration
   - Database connection pooling
   - SSH access and security

3. **DevOps Practices**
   - Infrastructure as Code with CDK
   - Deployment automation
   - Basic monitoring and logging

## 🔄 Migration from Complex Architecture

### What Was Simplified
- ❌ Multi-AZ VPC → ✅ Single VPC with public subnet
- ❌ NAT Gateways ($90/month) → ✅ Direct internet access
- ❌ Lambda functions → ✅ Traditional Express.js server
- ❌ API Gateway → ✅ Direct EC2 hosting
- ❌ Complex security groups → ✅ Basic security groups
- ❌ Secrets Manager → ✅ Simple environment variables
- ❌ Multi-environment → ✅ Single learning environment

### What Was Preserved
- ✅ Frontend React application
- ✅ Portfolio data models
- ✅ Core business logic
- ✅ Database schema design
- ✅ Authentication flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check [`SETUP-SIMPLIFIED.md`](SETUP-SIMPLIFIED.md) for setup issues
- Review [`docs/Simplified-Architecture.md`](docs/Simplified-Architecture.md) for architecture details
- Create an issue in the GitHub repository

---

**Built with ❤️ for AWS Learning using TypeScript, React, Express.js, and AWS CDK**