#!/bin/bash

# Fix CORS configuration to allow localhost:3000
set -e

echo "=== Fixing CORS Configuration for localhost:3000 ==="
echo ""

# Configuration
EC2_HOST="ec2-user@44.203.253.29"
REMOTE_PATH="/home/ec2-user/econlens"

echo "1. Building backend with updated CORS configuration..."
cd backend
npm run build
cd ..

echo ""
echo "2. Deploying updated backend to EC2..."
scp -i ~/.ssh/econlens-keypair.pem backend/dist/index.js $EC2_HOST:$REMOTE_PATH/backend/dist/

echo ""
echo "3. Restarting backend service..."
ssh -i ~/.ssh/econlens-keypair.pem $EC2_HOST << 'EOF'
cd /home/ec2-user/econlens/backend

echo "Restarting backend server with updated environment..."
pm2 restart econlens-backend --update-env

echo ""
echo "Server status:"
pm2 status econlens-backend

echo ""
echo "Checking if server is responding..."
sleep 2
curl -s http://localhost:3001/health | jq .
EOF

echo ""
echo "4. Testing CORS configuration..."
echo ""

echo "Testing OPTIONS preflight request from localhost:3000:"
curl -v \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -X OPTIONS \
  http://44.203.253.29:3001/api/portfolios 2>&1 | grep -E "(Access-Control-Allow-Origin|HTTP/)"

echo ""
echo ""
echo "Testing actual GET request from localhost:3000:"
curl -v \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  http://44.203.253.29:3001/api/portfolios 2>&1 | grep -E "(Access-Control-Allow-Origin|HTTP/|401 Unauthorized)"

echo ""
echo ""
echo "=== CORS Fix Complete ==="
echo ""
echo "✅ CORS Configuration Updated:"
echo "   - http://localhost:3000 (for local development)"
echo "   - http://127.0.0.1:3000 (for local development)" 
echo "   - http://44.203.253.29:3000 (for EC2 frontend)"
echo ""
echo "🧪 Test your frontend by running it on http://localhost:3000"
echo "   It should now be able to make requests to http://44.203.253.29:3001"
