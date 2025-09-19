#!/bin/bash

# EconLens Frontend Build Script
# This script builds the React frontend for production deployment

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BUILD_DIR="$FRONTEND_DIR/build"

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
    log_error "Frontend build failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Check if we're in the right directory
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    log_error "Frontend package.json not found. Please run this script from the project root."
    exit 1
fi

log_info "Starting EconLens frontend build process..."

# Check for environment file
if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    log_error "Production environment file not found: $FRONTEND_DIR/.env.production"
    log_info "Please create the production environment file first."
    exit 1
fi

log_success "Production environment file found"

# Clean previous builds
log_info "Cleaning previous builds..."
cd "$FRONTEND_DIR"
if [ -d "build" ]; then
    rm -rf build
    log_info "Removed existing build directory"
fi

if [ -d "node_modules" ]; then
    rm -rf node_modules
    log_info "Removed existing node_modules"
fi

# Install dependencies
log_info "Installing frontend dependencies..."
npm ci

# Run linting
log_info "Running ESLint..."
npm run lint || {
    log_warning "Linting failed, but continuing with build..."
}

# Run type checking
log_info "Running TypeScript type checking..."
npm run type-check || {
    log_warning "Type checking failed, but continuing with build..."
}

# Build for production
log_info "Building React application for production..."
VITE_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) npm run build:prod

if [ ! -d "build" ]; then
    log_error "Build failed - build directory not created"
    exit 1
fi

# Verify build
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log_success "Frontend build completed successfully ($BUILD_SIZE)"

# Display build information
log_info "Build contents:"
ls -la "$BUILD_DIR"

# Create build info file
cat > "$BUILD_DIR/build-info.txt" << EOF
EconLens Frontend Build Information
==================================
Build Date: $(date)
Build Host: $(hostname)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
Node Version: $(node --version)
NPM Version: $(npm --version)
Build Size: $BUILD_SIZE

Environment Variables Used:
- REACT_APP_API_URL: $(grep REACT_APP_API_URL "$FRONTEND_DIR/.env.production" | cut -d'=' -f2)
- REACT_APP_AWS_REGION: $(grep REACT_APP_AWS_REGION "$FRONTEND_DIR/.env.production" | cut -d'=' -f2)
- REACT_APP_COGNITO_USER_POOL_ID: $(grep REACT_APP_COGNITO_USER_POOL_ID "$FRONTEND_DIR/.env.production" | cut -d'=' -f2)
- REACT_APP_ENVIRONMENT: $(grep REACT_APP_ENVIRONMENT "$FRONTEND_DIR/.env.production" | cut -d'=' -f2)
EOF

log_success "Build information saved to build-info.txt"

# Display next steps
echo ""
echo "Next steps:"
echo "1. Deploy the build directory to your web server"
echo "2. Configure your web server to serve the React app"
echo "3. Ensure CORS is properly configured on the backend"
echo "4. Test the application in production environment"
echo ""
echo "Build location: $BUILD_DIR"
echo "Ready for deployment!"

log_success "Frontend build process completed successfully!"
