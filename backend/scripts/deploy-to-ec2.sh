#!/bin/bash

# EconLens Backend Deployment Script for EC2
# This script deploys the backend application to an EC2 instance

set -e

# Configuration
EC2_USER="ec2-user"
EC2_HOST=""  # Will be set from CDK output
EC2_KEY_PATH="~/.ssh/econlens-keypair.pem"
APP_DIR="/home/ec2-user/econlens"
BACKEND_DIR="$APP_DIR/backend"

echo "🚀 Starting EconLens Backend Deployment to EC2..."

# Check if EC2_HOST is provided
if [ -z "$EC2_HOST" ]; then
    echo "❌ Error: EC2_HOST environment variable is required"
    echo "Usage: EC2_HOST=your-ec2-ip ./scripts/deploy-to-ec2.sh"
    exit 1
fi

# Check if key file exists
if [ ! -f "${EC2_KEY_PATH/#\~/$HOME}" ]; then
    echo "❌ Error: SSH key file not found at $EC2_KEY_PATH"
    echo "Please ensure you have created the key pair and downloaded the .pem file"
    exit 1
fi

echo "📦 Building backend application..."
npm run build

echo "📁 Creating deployment archive..."
tar -czf econlens-backend.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    env.example

echo "🚀 Uploading to EC2 instance ($EC2_HOST)..."
scp -i "${EC2_KEY_PATH/#\~/$HOME}" \
    -o StrictHostKeyChecking=no \
    econlens-backend.tar.gz \
    $EC2_USER@$EC2_HOST:/tmp/

echo "🔧 Setting up application on EC2..."
ssh -i "${EC2_KEY_PATH/#\~/$HOME}" \
    -o StrictHostKeyChecking=no \
    $EC2_USER@$EC2_HOST << 'EOF'
    set -e
    
    echo "📂 Creating application directory..."
    mkdir -p /home/ec2-user/econlens/backend
    
    echo "📦 Extracting application..."
    cd /home/ec2-user/econlens/backend
    tar -xzf /tmp/econlens-backend.tar.gz
    
    echo "📥 Installing dependencies..."
    npm install --production
    
    echo "🔧 Setting up environment..."
    cp env.example .env
    
    echo "🔄 Restarting application with PM2..."
    pm2 stop econlens-backend 2>/dev/null || true
    pm2 delete econlens-backend 2>/dev/null || true
    pm2 start dist/index.js --name econlens-backend
    pm2 save
    pm2 startup
    
    echo "🧹 Cleaning up..."
    rm -f /tmp/econlens-backend.tar.gz
    
    echo "✅ Deployment completed successfully!"
    echo "📊 Application status:"
    pm2 status
EOF

# Clean up local files
rm -f econlens-backend.tar.gz

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application should be running on http://$EC2_HOST:3001"
echo "📊 Check application status with: ssh -i $EC2_KEY_PATH $EC2_USER@$EC2_HOST 'pm2 status'"
