# Application Load Balancer Setup Guide

## Overview

This guide explains how to set up an Application Load Balancer (ALB) with SSL certificate for your EcoLens application using AWS CDK.

## Architecture

The ALB configuration includes:

- **Application Load Balancer**: Internet-facing ALB in public subnets
- **Security Groups**: Separate security groups for ALB and EC2 communication
- **Target Group**: Points to EC2 instance on port 3001 with health checks
- **SSL Certificate**: Optional SSL certificate from AWS Certificate Manager
- **Listeners**: HTTP listener (with optional HTTPS redirect) and optional HTTPS listener

## Deployment Options

### Option 1: ALB without SSL (HTTP only)

This is the simplest setup for development/testing:

```bash
# Deploy infrastructure with ALB (HTTP only)
./scripts/deploy-with-alb.sh
```

This creates:
- ALB with HTTP listener on port 80
- Target group pointing to EC2 instance port 3001
- Security groups configured for ALB → EC2 communication
- Health check endpoint: `/health`

### Option 2: ALB with SSL Certificate

For production or when you have a domain:

1. **Set your domain name**:
   ```bash
   export ECONLENS_DOMAIN=api.yourdomain.com
   ```

2. **Deploy with SSL**:
   ```bash
   # Use the domain-enabled CDK app
   cd infrastructure
   cdk deploy --app "npx ts-node bin/econlens-with-domain.ts" --profile econlens-admin
   ```

3. **Validate SSL Certificate**:
   - Go to AWS Certificate Manager in the console
   - Find your certificate (it will be in "Pending validation" status)
   - Add the CNAME record to your domain's DNS
   - Wait for validation (can take 5-30 minutes)

## Security Improvements

The ALB setup improves security by:

1. **Removing direct EC2 access**: The original EC2 security group rules for ports 80, 443, and 3001 from the internet are replaced with ALB-only access
2. **SSL termination**: HTTPS traffic terminates at the ALB, with HTTP communication to EC2
3. **Health checks**: ALB monitors EC2 health and routes traffic only to healthy instances

## Configuration Details

### Target Group Configuration

```typescript
{
  vpc: this.vpc,
  port: 3001,
  protocol: elbv2.ApplicationProtocol.HTTP,
  targetType: elbv2.TargetType.INSTANCE,
  healthCheck: {
    enabled: true,
    path: '/health',
    protocol: elbv2.Protocol.HTTP,
    port: '3001',
    healthyHttpCodes: '200',
    interval: cdk.Duration.seconds(30),
    timeout: cdk.Duration.seconds(5),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 3,
  }
}
```

### Health Check Endpoint

The backend already includes a health check endpoint:

```typescript
// /health endpoint in backend/src/index.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'econlens-backend',
    environment: process.env.NODE_ENV || 'development',
  });
});
```

## Post-Deployment Steps

### 1. Get ALB DNS Name

After deployment, note the `LoadBalancerDNS` output:

```bash
# Example output
LoadBalancerDNS = econlens-alb-1234567890.us-east-1.elb.amazonaws.com
```

### 2. Update Frontend CORS

Update your backend CORS configuration to include the ALB DNS:

```typescript
// In backend/src/index.ts
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://your-alb-dns-name', // Add this
      'https://your-alb-dns-name', // Add this if using HTTPS
      process.env.FRONTEND_URL || 'http://44.203.253.29:3000'
    ],
    credentials: true,
  })
);
```

### 3. Test the Setup

```bash
# Test health check
curl http://your-alb-dns-name/health

# Test API endpoint
curl http://your-alb-dns-name/api/portfolios
```

### 4. Update DNS (if using custom domain)

If you have a domain, create a CNAME record:

```
Type: CNAME
Name: api (for api.yourdomain.com)
Value: your-alb-dns-name
```

## Monitoring and Troubleshooting

### Check Target Health

```bash
# Get target group ARN from CloudFormation outputs
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:region:account:targetgroup/name/id \
  --profile econlens-admin
```

### Common Issues

1. **Target showing as unhealthy**:
   - Check if EC2 instance is running
   - Verify `/health` endpoint responds with 200
   - Check security group rules

2. **SSL certificate validation stuck**:
   - Verify DNS CNAME record is correct
   - Check if domain is managed by Route53 or external DNS
   - DNS propagation can take time

3. **502 Bad Gateway**:
   - EC2 instance is not responding on port 3001
   - Security group blocks ALB → EC2 communication
   - Backend service not running

## Cost Implications

- **Application Load Balancer**: ~$22.50/month + data processing costs
- **SSL Certificate**: Free from AWS Certificate Manager
- **Additional security groups**: No additional cost

## Rolling Back

To remove the ALB and revert to direct EC2 access:

1. Checkout the previous CDK stack version
2. Deploy the previous version
3. The ALB resources will be removed automatically

## Next Steps

After ALB is working:

1. Consider adding multiple EC2 instances for high availability
2. Set up Auto Scaling Group behind the ALB
3. Implement proper monitoring with CloudWatch alarms
4. Consider using Route53 for DNS management
