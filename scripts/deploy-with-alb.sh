#!/bin/bash

# EcoLens Infrastructure Deployment with ALB
# This script deploys the EcoLens infrastructure including Application Load Balancer

set -e

echo "🚀 Deploying EcoLens Infrastructure with Application Load Balancer..."

# Check if AWS profile is configured
if ! aws sts get-caller-identity --profile econlens-admin >/dev/null 2>&1; then
    echo "❌ AWS profile 'econlens-admin' not configured or not working"
    echo "Please run: aws configure --profile econlens-admin"
    exit 1
fi

echo "✅ AWS profile 'econlens-admin' is configured"

# Set the AWS profile for CDK
export AWS_PROFILE=econlens-admin

# Navigate to infrastructure directory
cd "$(dirname "$0")/../infrastructure"

echo "📦 Installing CDK dependencies..."
npm install

echo "🔧 Building infrastructure code..."
npm run build

echo "🔍 Synthesizing CloudFormation template..."
cdk synth

echo "📋 Showing deployment diff..."
cdk diff || true

# Ask for confirmation
echo ""
read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo "🚀 Deploying infrastructure..."
cdk deploy --require-approval never

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next Steps:"
echo "1. Note the LoadBalancerDNS output - this is your new API endpoint"
echo "2. If you have a domain, you can:"
echo "   - Update the domainName in bin/econlens.ts"
echo "   - Redeploy to get SSL certificate"
echo "   - Validate the SSL certificate via DNS"
echo "3. Update your frontend CORS settings to include the ALB DNS name"
echo "4. Test the health check: http://your-alb-dns-name/health"
echo ""
echo "🔗 Your API is now accessible through the Application Load Balancer!"
