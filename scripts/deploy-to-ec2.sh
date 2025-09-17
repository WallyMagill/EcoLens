#!/bin/bash

# EconLens Backend EC2 Deployment Script
# This script transfers the deployment package to EC2 and sets up the application

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGE_DIR="$PROJECT_ROOT/deploy-packages"

# EC2 Configuration
EC2_HOST="44.203.253.29"
EC2_USER="ec2-user"
EC2_BACKEND_DIR="~/econlens/backend"
EC2_BACKUP_DIR="~/econlens/backups"

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
    log_error "Deployment failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Function to check if package exists
check_package() {
    local package_name="$1"
    if [ -z "$package_name" ]; then
        log_error "Package name is required"
        echo "Usage: $0 <package-name>"
        echo "Available packages:"
        ls -la "$PACKAGE_DIR"/*.tar.gz 2>/dev/null || echo "No packages found"
        exit 1
    fi
    
    local package_path="$PACKAGE_DIR/$package_name"
    if [ ! -f "$package_path" ]; then
        log_error "Package not found: $package_path"
        echo "Available packages:"
        ls -la "$PACKAGE_DIR"/*.tar.gz 2>/dev/null || echo "No packages found"
        exit 1
    fi
    
    echo "$package_path"
}

# Function to test SSH connection
test_ssh_connection() {
    log_info "Testing SSH connection to EC2..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$EC2_USER@$EC2_HOST" "echo 'SSH connection successful'" >/dev/null 2>&1; then
        log_error "Cannot connect to EC2 instance at $EC2_HOST"
        log_info "Please ensure:"
        echo "  1. EC2 instance is running"
        echo "  2. SSH key is properly configured"
        echo "  3. Security group allows SSH access"
        echo "  4. You're using the correct SSH key"
        exit 1
    fi
    log_success "SSH connection verified"
}

# Function to check EC2 prerequisites
check_ec2_prerequisites() {
    log_info "Checking EC2 prerequisites..."
    
    # Check Node.js
    local node_version=$(ssh "$EC2_USER@$EC2_HOST" "node --version 2>/dev/null || echo 'not_found'")
    if [ "$node_version" = "not_found" ]; then
        log_error "Node.js not found on EC2 instance"
        exit 1
    fi
    log_success "Node.js found: $node_version"
    
    # Check PM2
    local pm2_version=$(ssh "$EC2_USER@$EC2_HOST" "pm2 --version 2>/dev/null || echo 'not_found'")
    if [ "$pm2_version" = "not_found" ]; then
        log_error "PM2 not found on EC2 instance"
        exit 1
    fi
    log_success "PM2 found: $pm2_version"
    
    # Check directory structure
    ssh "$EC2_USER@$EC2_HOST" "mkdir -p ~/econlens/backend ~/econlens/backups"
    log_success "Directory structure verified/created"
}

# Function to backup current deployment
backup_current_deployment() {
    log_info "Creating backup of current deployment..."
    
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$EC2_BACKUP_DIR/$backup_name"
    
    # Check if current deployment exists
    if ssh "$EC2_USER@$EC2_HOST" "[ -d $EC2_BACKEND_DIR ]"; then
        ssh "$EC2_USER@$EC2_HOST" "cp -r $EC2_BACKEND_DIR $backup_path"
        log_success "Backup created: $backup_name"
        
        # Clean up old backups (keep last 5)
        ssh "$EC2_USER@$EC2_HOST" "cd $EC2_BACKUP_DIR && ls -t backup-* | tail -n +6 | xargs -r rm -rf"
    else
        log_info "No existing deployment found, skipping backup"
    fi
}

# Function to deploy package
deploy_package() {
    local package_path="$1"
    local package_name="$2"
    
    log_info "Transferring package to EC2..."
    scp "$package_path" "$EC2_USER@$EC2_HOST:~/"
    
    log_info "Extracting package on EC2..."
    ssh "$EC2_USER@$EC2_HOST" "
        # Remove existing deployment
        rm -rf $EC2_BACKEND_DIR
        
        # Extract new package
        tar -xzf ~/$package_name -C ~/econlens/
        mv ~/econlens/econlens-backend-* $EC2_BACKEND_DIR
        
        # Clean up package file
        rm -f ~/$package_name
        
        # Set proper permissions
        chmod +x $EC2_BACKEND_DIR/dist/index.js
    "
    
    log_success "Package extracted and deployed"
}

# Function to install dependencies
install_dependencies() {
    log_info "Installing dependencies on EC2..."
    
    ssh "$EC2_USER@$EC2_HOST" "
        cd $EC2_BACKEND_DIR
        
        # Install backend dependencies
        npm ci --production=true
        
        # Install shared dependencies
        cd shared
        npm ci --production=true
        cd ..
    "
    
    log_success "Dependencies installed"
}

# Function to configure PM2
configure_pm2() {
    log_info "Configuring PM2..."
    
    # Create PM2 ecosystem file
    ssh "$EC2_USER@$EC2_HOST" "cat > $EC2_BACKEND_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'econlens-backend',
    script: './dist/index.js',
    cwd: '$EC2_BACKEND_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF"
    
    # Create logs directory
    ssh "$EC2_USER@$EC2_HOST" "mkdir -p $EC2_BACKEND_DIR/logs"
    
    log_success "PM2 configuration created"
}

# Function to start application
start_application() {
    log_info "Starting application with PM2..."
    
    ssh "$EC2_USER@$EC2_HOST" "
        cd $EC2_BACKEND_DIR
        
        # Stop existing application if running
        pm2 stop econlens-backend 2>/dev/null || true
        pm2 delete econlens-backend 2>/dev/null || true
        
        # Start new application
        pm2 start ecosystem.config.js
        
        # Save PM2 configuration
        pm2 save
        
        # Setup PM2 startup script
        pm2 startup systemd -u $EC2_USER --hp /home/$EC2_USER 2>/dev/null || true
    "
    
    log_success "Application started with PM2"
}

# Function to verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for application to start
    sleep 5
    
    # Check if application is running
    local app_status=$(ssh "$EC2_USER@$EC2_HOST" "pm2 list | grep econlens-backend | awk '{print \$10}'" || echo "not_found")
    
    if [ "$app_status" = "online" ]; then
        log_success "Application is running"
    else
        log_error "Application failed to start"
        log_info "PM2 status:"
        ssh "$EC2_USER@$EC2_HOST" "pm2 list"
        log_info "Application logs:"
        ssh "$EC2_USER@$EC2_HOST" "pm2 logs econlens-backend --lines 20"
        exit 1
    fi
    
    # Test health endpoint (if available)
    log_info "Testing application health..."
    local health_response=$(ssh "$EC2_USER@$EC2_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health" || echo "000")
    
    if [ "$health_response" = "200" ]; then
        log_success "Health check passed"
    else
        log_warning "Health check failed (HTTP $health_response) - application may still be starting"
    fi
}

# Function to display deployment summary
display_summary() {
    local package_name="$1"
    
    echo ""
    echo "=========================================="
    echo "  DEPLOYMENT SUMMARY"
    echo "=========================================="
    echo "Package: $package_name"
    echo "EC2 Host: $EC2_HOST"
    echo "Backend Directory: $EC2_BACKEND_DIR"
    echo "Deployment Time: $(date)"
    echo ""
    echo "Next Steps:"
    echo "1. Configure environment variables:"
    echo "   ./scripts/setup-production-env.sh"
    echo ""
    echo "2. Monitor application:"
    echo "   ssh $EC2_USER@$EC2_HOST 'pm2 monit'"
    echo ""
    echo "3. View logs:"
    echo "   ssh $EC2_USER@$EC2_HOST 'pm2 logs econlens-backend'"
    echo ""
    echo "4. Restart if needed:"
    echo "   ssh $EC2_USER@$EC2_HOST 'pm2 restart econlens-backend'"
    echo "=========================================="
}

# Main deployment function
main() {
    local package_name="$1"
    
    if [ -z "$package_name" ]; then
        log_error "Package name is required"
        echo "Usage: $0 <package-name>"
        echo ""
        echo "Available packages:"
        ls -la "$PACKAGE_DIR"/*.tar.gz 2>/dev/null || echo "No packages found"
        echo ""
        echo "To build a new package, run:"
        echo "  ./scripts/build-and-package.sh"
        exit 1
    fi
    
    log_info "Starting EconLens backend deployment to EC2..."
    log_info "Target: $EC2_USER@$EC2_HOST"
    log_info "Package: $package_name"
    
    # Validate package
    local package_path=$(check_package "$package_name")
    
    # Test connection and prerequisites
    test_ssh_connection
    check_ec2_prerequisites
    
    # Deploy
    backup_current_deployment
    deploy_package "$package_path" "$package_name"
    install_dependencies
    configure_pm2
    start_application
    verify_deployment
    
    # Display summary
    display_summary "$package_name"
    
    log_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@"
