#!/bin/bash

# Deploy authentication fixes to EC2
set -e

echo "=== EcoLens Authentication Fix Deployment ==="
echo ""

# Configuration
EC2_HOST="ec2-user@44.203.253.29"
KEY_PATH="~/.ssh/econlens-keypair.pem"
REMOTE_PATH="/home/ec2-user/econlens"

echo "1. Building backend locally..."
cd backend
npm run build
cd ..

echo ""
echo "2. Copying files to EC2..."
scp -i ~/.ssh/econlens-keypair.pem -r backend/dist/* $EC2_HOST:$REMOTE_PATH/backend/dist/
scp -i ~/.ssh/econlens-keypair.pem backend/database/migrations/000_create_users_table.sql $EC2_HOST:$REMOTE_PATH/backend/database/migrations/
scp -i ~/.ssh/econlens-keypair.pem backend/scripts/test-auth.js $EC2_HOST:$REMOTE_PATH/backend/scripts/

echo ""
echo "3. Running database migration..."
ssh -i ~/.ssh/econlens-keypair.pem $EC2_HOST << 'EOF'
cd /home/ec2-user/econlens/backend

# Apply users table migration
echo "Applying users table migration..."
PGPASSWORD=econlens123 psql -h localhost -U econlens_admin -d econlens -f database/migrations/000_create_users_table.sql

# Generate test user data
echo ""
echo "Generating test user data..."
node scripts/test-auth.js

echo ""
echo "Restarting backend server..."
pm2 restart econlens-backend || pm2 start dist/index.js --name econlens-backend

echo ""
echo "Checking server status..."
pm2 status

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3001/health | jq .
EOF

echo ""
echo "4. Testing authentication endpoints..."
echo ""
echo "Testing registration..."
curl -i -X POST http://44.203.253.29:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "test123", "firstName": "Test", "lastName": "User"}'

echo ""
echo ""
echo "Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://44.203.253.29:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "test123"}')

echo "$LOGIN_RESPONSE" | jq .

# Extract JWT token for further testing
JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken // empty')

if [ -n "$JWT_TOKEN" ] && [ "$JWT_TOKEN" != "null" ]; then
  echo ""
  echo "Testing protected portfolios endpoint with JWT..."
  curl -i -H "Authorization: Bearer $JWT_TOKEN" http://44.203.253.29:3001/api/portfolios
else
  echo ""
  echo "No JWT token received, testing portfolios endpoint without auth (should fail)..."
  curl -i http://44.203.253.29:3001/api/portfolios
fi

echo ""
echo ""
echo "=== Deployment Complete ==="
echo "You can now:"
echo "1. Register new users via POST /api/auth/register"
echo "2. Login to get JWT tokens via POST /api/auth/login" 
echo "3. Access portfolios with JWT tokens via GET /api/portfolios"
echo "4. Each user will only see their own portfolios"
