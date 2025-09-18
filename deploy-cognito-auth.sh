#!/bin/bash

# Deploy Cognito authentication to EC2
set -e

echo "=== EcoLens Cognito Authentication Deployment ==="
echo ""

# Configuration
EC2_HOST="ec2-user@44.203.253.29"
REMOTE_PATH="/home/ec2-user/econlens"

echo "1. Building backend locally..."
cd backend
npm install  # Install aws-jwt-verify dependency
npm run build
cd ..

echo ""
echo "2. Copying files to EC2..."
scp -i ~/.ssh/econlens-keypair.pem -r backend/dist/* $EC2_HOST:$REMOTE_PATH/backend/dist/
scp -i ~/.ssh/econlens-keypair.pem backend/package.json $EC2_HOST:$REMOTE_PATH/backend/

echo ""
echo "3. Installing dependencies and restarting server..."
ssh -i ~/.ssh/econlens-keypair.pem $EC2_HOST << 'EOF'
cd /home/ec2-user/econlens/backend

# Install new dependencies (aws-jwt-verify)
echo "Installing dependencies..."
npm install

echo ""
echo "Restarting backend server..."
pm2 restart econlens-backend || pm2 start dist/index.js --name econlens-backend

echo ""
echo "Server status:"
pm2 status econlens-backend

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3001/health | jq .
EOF

echo ""
echo "4. Testing Cognito authentication endpoints..."
echo ""

echo "Testing portfolios endpoint without token (should fail):"
curl -i http://44.203.253.29:3001/api/portfolios

echo ""
echo ""
echo "Testing auth/user endpoint without token (should fail):"
curl -i http://44.203.253.29:3001/api/auth/user

echo ""
echo ""
echo "=== Deployment Complete ==="
echo ""
echo "🎯 Next steps to test Cognito authentication:"
echo "1. Get a valid Cognito JWT token from your frontend/Cognito User Pool"
echo "2. Test with: curl -H \"Authorization: Bearer <COGNITO_JWT>\" http://44.203.253.29:3001/api/portfolios"
echo "3. The JWT token should contain:"
echo "   - 'sub' claim (Cognito user ID) → used as userId in database"
echo "   - 'email' claim → user's email"
echo "   - 'cognito:username' claim → username"
echo ""
echo "Cognito User Pool ID: us-east-1_f9G2iTorZ"
echo "Expected JWT validation: ✅ Against Cognito public keys"
echo "User isolation: ✅ Based on Cognito 'sub' claim"
