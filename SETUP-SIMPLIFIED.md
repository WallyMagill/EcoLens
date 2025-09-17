# EconLens Simplified Setup Guide

## Quick Start

This guide will help you set up the simplified EconLens infrastructure for AWS learning.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured with your credentials
3. **Node.js** (v18 or later)
4. **CDK** installed globally: `npm install -g aws-cdk`

## Step 1: Deploy Infrastructure

```bash
# Deploy the simplified AWS infrastructure
./scripts/deploy-infrastructure.sh
```

This will create:
- VPC with public subnet
- EC2 t2.micro instance
- RDS PostgreSQL db.t3.micro
- S3 bucket
- Cognito User Pool

## Step 2: Create EC2 Key Pair

1. Go to AWS Console → EC2 → Key Pairs
2. Create a new key pair named `econlens-keypair`
3. Download the `.pem` file
4. Save it to `~/.ssh/econlens-keypair.pem`
5. Set permissions: `chmod 400 ~/.ssh/econlens-keypair.pem`

## Step 3: Get EC2 Public IP

After deployment, get the EC2 public IP from the CDK outputs:

```bash
cd infrastructure
cdk outputs --profile econlens-admin
```

## Step 4: Deploy Backend Application

```bash
# Deploy the backend to EC2
EC2_HOST=your-ec2-public-ip ./backend/scripts/deploy-to-ec2.sh
```

## Step 5: Configure Environment

SSH into your EC2 instance and configure the environment:

```bash
ssh -i ~/.ssh/econlens-keypair.pem ec2-user@your-ec2-ip
cd /home/ec2-user/econlens/backend
nano .env
```

Update the `.env` file with your actual values from the CDK outputs.

## Step 6: Test the Application

```bash
# Check if the application is running
pm2 status

# Test the health endpoint
curl http://localhost:3001/health

# Test from outside (if security group allows)
curl http://your-ec2-ip:3001/health
```

## Cost Monitoring

- **Free Tier**: Most resources are free tier eligible
- **Estimated Cost**: $0-5/month
- **Monitor**: Use AWS Cost Explorer to track usage

## Learning Objectives

With this setup, you can learn:

1. **VPC Basics**: Understanding subnets, route tables, security groups
2. **EC2 Management**: Instance lifecycle, SSH access, user data
3. **RDS Operations**: Database setup, connection management
4. **S3 Integration**: Object storage, IAM roles
5. **Traditional Hosting**: Process management, environment configuration

## Troubleshooting

### Common Issues

1. **Can't SSH to EC2**: Check security group allows SSH (port 22)
2. **Application not starting**: Check PM2 logs with `pm2 logs`
3. **Database connection failed**: Verify security groups and credentials
4. **S3 access denied**: Check IAM role permissions

### Useful Commands

```bash
# Check application logs
pm2 logs econlens-backend

# Restart application
pm2 restart econlens-backend

# Check database connection
psql -h your-rds-endpoint -U econlens_admin -d econlens

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

## Next Steps

1. Implement proper database schema
2. Add authentication with Cognito
3. Implement file upload to S3
4. Add monitoring and logging
5. Set up CI/CD pipeline

## Cleanup

To avoid charges, destroy the infrastructure when done:

```bash
cd infrastructure
npm run destroy
```

**Note**: This will delete all resources. Make sure to backup any important data first.

## Support

For issues or questions:
1. Check the logs: `pm2 logs econlens-backend`
2. Review AWS CloudWatch logs
3. Check security group configurations
4. Verify environment variables

Happy learning! 🚀
