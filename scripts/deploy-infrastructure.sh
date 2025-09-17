#!/bin/bash

# EconLens Infrastructure Deployment Script
# This script deploys the simplified AWS infrastructure using CDK

set -e

echo "🏗️  Starting EconLens Infrastructure Deployment..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ Error: AWS CLI is not configured or credentials are invalid"
    echo "Please run 'aws configure' or set up your AWS credentials"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ Error: AWS CDK is not installed"
    echo "Please install CDK: npm install -g aws-cdk"
    exit 1
fi

echo "📦 Building infrastructure..."
cd infrastructure
npm run build

echo "🔍 Synthesizing CDK stack..."
npm run synth

echo "🚀 Deploying infrastructure to AWS..."
npm run deploy

echo "📋 Getting deployment outputs..."
cdk outputs --profile econlens-admin

echo "🎉 Infrastructure deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Create an EC2 key pair named 'econlens-keypair' in the AWS Console"
echo "2. Download the .pem file and save it to ~/.ssh/econlens-keypair.pem"
echo "3. Set the correct permissions: chmod 400 ~/.ssh/econlens-keypair.pem"
echo "4. Update the EC2 instance security group to allow HTTP/HTTPS traffic"
echo "5. Deploy the backend application using: ./backend/scripts/deploy-to-ec2.sh"
echo ""
echo "💰 Estimated monthly cost: < $20 (mostly free tier eligible)"
