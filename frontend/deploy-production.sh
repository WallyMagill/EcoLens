#!/bin/bash

# EconLens Frontend Production Deployment Script
# This script builds and deploys the frontend with HTTPS backend configuration

set -e

echo "🚀 Starting EconLens Frontend Production Deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found. Creating from example..."
    cat > .env.production << EOF
# Production Environment Configuration
VITE_API_BASE_URL=http://EconLe-EconL-rZpK4Z8Snovx-624635801.us-east-1.elb.amazonaws.com

# AWS Cognito Configuration (if needed)
# VITE_COGNITO_USER_POOL_ID=your_user_pool_id
# VITE_COGNITO_USER_POOL_WEB_CLIENT_ID=your_web_client_id
# VITE_COGNITO_REGION=us-east-1

# App Configuration
VITE_APP_NAME=EconLens
VITE_APP_VERSION=1.0.0
EOF
    echo "✅ Created .env.production file"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build for production
echo "🏗️  Building for production..."
npm run build:prod

echo "✅ Production build completed!"
echo "📁 Build output is in the 'dist' directory"
echo ""
echo "🔧 Next steps:"
echo "   1. Upload 'dist' contents to your S3 bucket"
echo "   2. Invalidate CloudFront cache if using CDN"
echo "   3. Verify ALB backend connectivity"
echo ""
echo "🌐 Frontend URL: http://econlens-frontend-prod.s3-website-us-east-1.amazonaws.com/"
echo "🌐 Backend API URL: http://EconLe-EconL-rZpK4Z8Snovx-624635801.us-east-1.elb.amazonaws.com"
echo "📖 See ENVIRONMENT_SETUP.md for detailed configuration options"
