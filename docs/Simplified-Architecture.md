# EconLens Simplified Architecture for AWS Learning

## Overview

This document describes the simplified AWS infrastructure for EconLens, designed specifically for learning AWS fundamentals while maintaining core functionality for portfolio management.

## Architecture Goals

- **Learning Focus**: Understand basic AWS services (EC2, VPC, RDS, S3)
- **Cost Effective**: Under $20/month (mostly free tier eligible)
- **Simple**: Single stack, minimal complexity
- **Educational**: Traditional hosting approach vs serverless

## Infrastructure Components

### 1. Network Architecture
- **VPC**: Single VPC (10.0.0.0/16)
- **Subnet**: One public subnet (10.0.1.0/24) in us-east-1a
- **Internet Gateway**: Direct internet access (no NAT Gateway)
- **Route Table**: Simple routing to internet gateway
- **Security Groups**: Basic web and database security groups

### 2. Compute
- **EC2 Instance**: t2.micro (free tier eligible)
- **Operating System**: Amazon Linux 2
- **Application**: Express.js API server
- **Process Manager**: PM2 for process management
- **Access**: SSH key pair authentication

### 3. Database
- **RDS PostgreSQL**: db.t3.micro (free tier eligible)
- **Location**: Public subnet for simplicity
- **Security**: Security group allowing PostgreSQL (5432) from EC2
- **Credentials**: Generated secret with basic username/password

### 4. Storage
- **S3 Bucket**: Single bucket for file uploads
- **Configuration**: Basic bucket policy, no versioning
- **Access**: IAM role-based access from EC2

### 5. Authentication
- **Cognito User Pool**: Basic user pool configuration
- **Features**: Email signup, password authentication
- **Integration**: Simple JWT-based authentication

## Cost Breakdown

### Monthly Costs (us-east-1)

| Service         | Instance Type | Free Tier | Monthly Cost    |
| --------------- | ------------- | --------- | --------------- |
| EC2 t2.micro    | 750 hours     | ✅         | $0 (free tier)  |
| RDS db.t3.micro | 750 hours     | ✅         | $0 (free tier)  |
| S3 Storage      | 5GB           | ✅         | $0 (free tier)  |
| Data Transfer   | 1GB           | ✅         | $0 (free tier)  |
| **Total**       |               |           | **~$0-5/month** |

*Note: Costs may vary based on usage beyond free tier limits*

## Deployment Process

### 1. Infrastructure Deployment
```bash
# Deploy AWS infrastructure
./scripts/deploy-infrastructure.sh
```

### 2. Backend Deployment
```bash
# Deploy backend to EC2
EC2_HOST=your-ec2-ip ./backend/scripts/deploy-to-ec2.sh
```

## Key Learning Areas

### AWS Fundamentals
- **VPC**: Understanding virtual private clouds and subnets
- **EC2**: Instance management, security groups, key pairs
- **RDS**: Database setup, security, connection management
- **S3**: Object storage, bucket policies, IAM integration
- **IAM**: Roles, policies, service permissions

### Traditional Hosting
- **Process Management**: PM2 for Node.js applications
- **Environment Configuration**: Environment variables
- **Database Connections**: Connection pooling, graceful shutdown
- **Security**: SSH access, security groups, firewall rules

### DevOps Practices
- **Infrastructure as Code**: CDK for AWS resource management
- **Deployment Automation**: Shell scripts for application deployment
- **Monitoring**: Basic logging and health checks
- **Backup**: Simple database backup strategies

## Security Considerations

### Current Setup (Learning Environment)
- RDS in public subnet (not recommended for production)
- Basic security groups
- Simple authentication
- No secrets management

### Production Recommendations
- Move RDS to private subnet
- Implement proper secrets management
- Add WAF and CloudFront
- Enable detailed monitoring
- Implement proper backup strategies

## File Structure

```
infrastructure/
├── lib/
│   └── stacks/
│       └── econlens-stack.ts    # Single CDK stack
├── bin/
│   └── econlens.ts              # CDK app entry point
└── package.json                 # Simplified dependencies

backend/
├── src/
│   ├── index.ts                 # Express.js server
│   ├── database/
│   │   └── connection.ts        # Database connection
│   └── functions/               # API route handlers
├── scripts/
│   └── deploy-to-ec2.sh         # EC2 deployment script
└── package.json                 # Express.js dependencies

scripts/
└── deploy-infrastructure.sh     # Infrastructure deployment
```

## Environment Configuration

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://your-frontend-url
DATABASE_URL=postgresql://user:pass@host:5432/db
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_USER_POOL_CLIENT_ID=your-client-id
JWT_SECRET=your-jwt-secret
```

## Monitoring and Maintenance

### Health Checks
- Application health endpoint: `/health`
- Database connection monitoring
- PM2 process monitoring

### Logging
- Winston logger for application logs
- PM2 logs for process monitoring
- CloudWatch logs (optional)

### Backup Strategy
- Daily RDS automated backups (1 day retention)
- S3 bucket for file storage
- Manual database exports for learning

## Troubleshooting

### Common Issues
1. **EC2 Connection**: Check security group and key pair
2. **Database Connection**: Verify security groups and credentials
3. **Application Startup**: Check PM2 logs and environment variables
4. **S3 Access**: Verify IAM role permissions

### Useful Commands
```bash
# Check EC2 status
ssh -i ~/.ssh/econlens-keypair.pem ec2-user@your-ec2-ip

# Check application status
pm2 status
pm2 logs econlens-backend

# Check database connection
psql -h your-rds-endpoint -U econlens_admin -d econlens
```

## Next Steps for Learning

1. **Database Schema**: Implement proper database tables
2. **Authentication**: Integrate with Cognito properly
3. **File Uploads**: Implement S3 file upload functionality
4. **Monitoring**: Add CloudWatch monitoring
5. **CI/CD**: Implement GitHub Actions for deployment
6. **Security**: Move to private subnets and proper secrets management

## Migration from Complex Architecture

### What Was Removed
- Multi-AZ VPC configuration
- NAT Gateways ($90/month)
- Lambda functions and API Gateway
- Complex security groups
- Secrets Manager integration
- Multi-environment configurations

### What Was Simplified
- Single VPC with public subnet
- Direct EC2 hosting
- Basic RDS configuration
- Simple S3 bucket
- Basic Cognito setup
- Single environment (learning)

This simplified architecture provides a solid foundation for learning AWS fundamentals while maintaining the core functionality needed for the EconLens portfolio management application.
