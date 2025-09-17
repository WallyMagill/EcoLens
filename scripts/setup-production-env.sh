#!/bin/bash

# EconLens Backend Production Environment Setup Script
# This script configures production environment variables on EC2

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# EC2 Configuration
EC2_HOST="44.203.253.29"
EC2_USER="ec2-user"
EC2_BACKEND_DIR="~/econlens/backend"

# AWS Resources (from user specification)
RDS_ENDPOINT="econlens-learning-econlensdatabase097a1571-8utfkzudetgn.ccnocmqomw15.us-east-1.rds.amazonaws.com"
S3_BUCKET="econlens-assets-704444257588"
COGNITO_USER_POOL_ID="us-east-1_f9G2iTorZ"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handling
handle_error() {
    log_error "Environment setup failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Function to test SSH connection
test_ssh_connection() {
    log_info "Testing SSH connection to EC2..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'" >/dev/null 2>&1; then
        log_error "Cannot connect to EC2 instance at $EC2_HOST"
        log_info "Please ensure:"
        echo "  1. EC2 instance is running"
        echo "  2. SSH key is properly configured"
        echo "  3. Security group allows SSH access"
        exit 1
    fi
    log_success "SSH connection verified"
}

# Function to check if application is deployed
check_deployment() {
    log_info "Checking if application is deployed..."
    
    if ! ssh "$EC2_USER@$EC2_HOST" "[ -d $EC2_BACKEND_DIR ]"; then
        log_error "Backend directory not found. Please deploy the application first."
        echo "Run: ./scripts/deploy-to-ec2.sh <package-name>"
        exit 1
    fi
    
    log_success "Application deployment verified"
}

# Function to generate secure secrets
generate_secrets() {
    log_info "Generating secure secrets..."
    
    # Generate JWT secret
    local jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Generate database password (if not provided)
    local db_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    echo "JWT_SECRET=$jwt_secret"
    echo "DB_PASSWORD=$db_password"
}

# Function to get database password from AWS Secrets Manager
get_db_password_from_secret() {
    log_info "Retrieving database password from AWS Secrets Manager..."
    
    local secret_arn="arn:aws:secretsmanager:us-east-1:704444257588:secret:EconLensLearningEconLensDat-rHvLOBMc1jLn-QvhZXv"
    
    # Retrieve the password from AWS Secrets Manager
    local db_password=$(aws secretsmanager get-secret-value \
        --secret-id "$secret_arn" \
        --profile econlens-admin \
        --query SecretString --output text | jq -r .password 2>/dev/null)
    
    if [ -z "$db_password" ] || [ "$db_password" = "null" ]; then
        log_error "Failed to retrieve database password from AWS Secrets Manager"
        log_info "Please ensure:"
        echo "  1. AWS CLI is configured with econlens-admin profile"
        echo "  2. You have access to the secrets manager secret"
        echo "  3. jq is installed for JSON parsing"
        exit 1
    fi
    
    log_success "Database password retrieved from AWS Secrets Manager"
    echo "$db_password"
}

# Function to get user input for sensitive values
get_user_input() {
    echo ""
    echo "=========================================="
    echo "  PRODUCTION ENVIRONMENT SETUP"
    echo "=========================================="
    echo ""
    echo "Please provide the following information:"
    echo ""
    
    # Get database password from AWS Secrets Manager
    db_password=$(get_db_password_from_secret)
    if [ -z "$db_password" ]; then
        log_error "Could not retrieve database password"
        exit 1
    fi
    
    # JWT secret
    read -s -p "JWT secret (press Enter to generate): " jwt_secret
    if [ -z "$jwt_secret" ]; then
        jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
        echo ""
        log_info "Generated JWT secret"
    else
        echo ""
    fi
    
    # Cognito client ID
    read -p "Cognito User Pool Client ID: " cognito_client_id
    if [ -z "$cognito_client_id" ]; then
        log_warning "Cognito Client ID not provided. You'll need to set this manually."
        cognito_client_id="your_cognito_client_id"
    fi
    
    # Frontend URL
    read -p "Frontend URL (default: https://your-domain.com): " frontend_url
    if [ -z "$frontend_url" ]; then
        frontend_url="https://your-domain.com"
    fi
    
    # Log level
    read -p "Log level (default: info): " log_level
    if [ -z "$log_level" ]; then
        log_level="info"
    fi
    
    # Store values for later use
    export DB_PASSWORD="$db_password"
    export JWT_SECRET="$jwt_secret"
    export COGNITO_CLIENT_ID="$cognito_client_id"
    export FRONTEND_URL="$frontend_url"
    export LOG_LEVEL="$log_level"
}

# Function to create production environment file
create_production_env() {
    log_info "Creating production environment file..."
    
    ssh "$EC2_USER@$EC2_HOST" "cat > $EC2_BACKEND_DIR/.env << 'EOF'
# EconLens Backend Production Environment Configuration
# Generated on: $(date)

# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=$FRONTEND_URL

# Database Configuration
DATABASE_URL=postgresql://econlens_admin:$DB_PASSWORD@$RDS_ENDPOINT:5432/econlens
DB_HOST=$RDS_ENDPOINT
DB_PORT=5432
DB_NAME=econlens
DB_USER=econlens_admin
DB_PASSWORD=$DB_PASSWORD

# AWS Configuration
AWS_REGION=us-east-1
S3_BUCKET_NAME=$S3_BUCKET

# Cognito Configuration
COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID
COGNITO_USER_POOL_CLIENT_ID=$COGNITO_CLIENT_ID

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=$LOG_LEVEL

# Security
CORS_ORIGIN=$FRONTEND_URL
EOF"
    
    log_success "Production environment file created"
}

# Function to set proper file permissions
set_permissions() {
    log_info "Setting proper file permissions..."
    
    ssh "$EC2_USER@$EC2_HOST" "
        # Set restrictive permissions on .env file
        chmod 600 $EC2_BACKEND_DIR/.env
        
        # Ensure only ec2-user can access the backend directory
        chmod 755 $EC2_BACKEND_DIR
        chown -R $EC2_USER:$EC2_USER $EC2_BACKEND_DIR
    "
    
    log_success "File permissions set"
}

# Function to test database connection
test_database_connection() {
    log_info "Testing database connection..."
    
    # Create a simple test script
    ssh "$EC2_USER@$EC2_HOST" "cat > $EC2_BACKEND_DIR/test-db.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF"
    
    # Run the test
    if ssh "$EC2_USER@$EC2_HOST" "cd $EC2_BACKEND_DIR && node test-db.js"; then
        log_success "Database connection test passed"
    else
        log_error "Database connection test failed"
        log_info "Please check:"
        echo "  1. RDS endpoint is correct"
        echo "  2. Database credentials are correct"
        echo "  3. Security groups allow connection from EC2"
        echo "  4. Database exists and is accessible"
        exit 1
    fi
    
    # Clean up test file
    ssh "$EC2_USER@$EC2_HOST" "rm -f $EC2_BACKEND_DIR/test-db.js"
}

# Function to restart application
restart_application() {
    log_info "Restarting application with new environment..."
    
    ssh "$EC2_USER@$EC2_HOST" "
        cd $EC2_BACKEND_DIR
        pm2 restart econlens-backend
        pm2 save
    "
    
    # Wait for restart
    sleep 5
    
    # Check if application is running
    local app_status=$(ssh "$EC2_USER@$EC2_HOST" "pm2 list | grep econlens-backend | awk '{print \$10}'" || echo "not_found")
    
    if [ "$app_status" = "online" ]; then
        log_success "Application restarted successfully"
    else
        log_error "Application failed to restart"
        log_info "PM2 status:"
        ssh "$EC2_USER@$EC2_HOST" "pm2 list"
        log_info "Application logs:"
        ssh "$EC2_USER@$EC2_HOST" "pm2 logs econlens-backend --lines 20"
        exit 1
    fi
}

# Function to verify environment setup
verify_environment() {
    log_info "Verifying environment setup..."
    
    # Check if .env file exists and has correct permissions
    local env_permissions=$(ssh "$EC2_USER@$EC2_HOST" "ls -la $EC2_BACKEND_DIR/.env | awk '{print \$1}'")
    if [[ "$env_permissions" == "-rw-------" ]]; then
        log_success "Environment file permissions are correct"
    else
        log_warning "Environment file permissions may be too permissive: $env_permissions"
    fi
    
    # Test application health
    log_info "Testing application health..."
    local health_response=$(ssh "$EC2_USER@$EC2_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health" || echo "000")
    
    if [ "$health_response" = "200" ]; then
        log_success "Application health check passed"
    else
        log_warning "Health check returned HTTP $health_response"
    fi
    
    # Display environment summary (without sensitive values)
    log_info "Environment configuration summary:"
    ssh "$EC2_USER@$EC2_HOST" "cd $EC2_BACKEND_DIR && grep -E '^(NODE_ENV|PORT|DB_HOST|DB_NAME|DB_USER|AWS_REGION|S3_BUCKET_NAME|COGNITO_USER_POOL_ID|LOG_LEVEL)=' .env"
}

# Function to display setup summary
display_summary() {
    echo ""
    echo "=========================================="
    echo "  ENVIRONMENT SETUP SUMMARY"
    echo "=========================================="
    echo "EC2 Host: $EC2_HOST"
    echo "Backend Directory: $EC2_BACKEND_DIR"
    echo "Database: $RDS_ENDPOINT"
    echo "S3 Bucket: $S3_BUCKET"
    echo "Cognito Pool: $COGNITO_USER_POOL_ID"
    echo "Setup Time: $(date)"
    echo ""
    echo "Environment file location: $EC2_BACKEND_DIR/.env"
    echo ""
    echo "Next Steps:"
    echo "1. Verify application is running:"
    echo "   ssh $EC2_USER@$EC2_HOST 'pm2 status'"
    echo ""
    echo "2. Monitor logs:"
    echo "   ssh $EC2_USER@$EC2_HOST 'pm2 logs econlens-backend'"
    echo ""
    echo "3. Test API endpoints:"
    echo "   curl http://$EC2_HOST:3001/health"
    echo ""
    echo "4. Configure load balancer/domain (if needed)"
    echo "=========================================="
}

# Function to save credentials securely
save_credentials() {
    local credentials_file="$PROJECT_ROOT/deployment-credentials.txt"
    
    log_info "Saving deployment credentials..."
    
    cat > "$credentials_file" << EOF
EconLens Production Deployment Credentials
==========================================
Generated: $(date)
EC2 Host: $EC2_HOST

Database:
- Host: $RDS_ENDPOINT
- Database: econlens
- User: econlens_admin
- Password: $DB_PASSWORD

JWT Secret: $JWT_SECRET

Cognito:
- User Pool ID: $COGNITO_USER_POOL_ID
- Client ID: $COGNITO_CLIENT_ID

AWS Resources:
- S3 Bucket: $S3_BUCKET
- Region: us-east-1

IMPORTANT: Keep this file secure and do not commit it to version control!
EOF
    
    chmod 600 "$credentials_file"
    log_success "Credentials saved to: $credentials_file"
    log_warning "Please store these credentials securely and delete this file after noting them down"
}

# Main setup function
main() {
    log_info "Starting EconLens production environment setup..."
    
    # Test connection and check deployment
    test_ssh_connection
    check_deployment
    
    # Get user input
    get_user_input
    
    # Create environment file
    create_production_env
    set_permissions
    
    # Test database connection
    test_database_connection
    
    # Restart application
    restart_application
    
    # Verify setup
    verify_environment
    
    # Save credentials
    save_credentials
    
    # Display summary
    display_summary
    
    log_success "Production environment setup completed successfully!"
}

# Run main function
main "$@"
