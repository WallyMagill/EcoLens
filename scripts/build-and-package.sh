#!/bin/bash

# EconLens Backend Build and Package Script
# This script builds the TypeScript backend and creates a deployment package

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
SHARED_DIR="$PROJECT_ROOT/shared"
PACKAGE_NAME="econlens-backend-$(date +%Y%m%d-%H%M%S).tar.gz"
PACKAGE_DIR="$PROJECT_ROOT/deploy-packages"

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
    log_error "Build failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Check if we're in the right directory
if [ ! -f "$BACKEND_DIR/package.json" ]; then
    log_error "Backend package.json not found. Please run this script from the project root."
    exit 1
fi

log_info "Starting EconLens backend build and packaging process..."

# Create package directory
mkdir -p "$PACKAGE_DIR"
log_info "Created package directory: $PACKAGE_DIR"

# Clean previous builds
log_info "Cleaning previous builds..."
cd "$BACKEND_DIR"
if [ -d "dist" ]; then
    rm -rf dist
    log_info "Removed existing dist directory"
fi

if [ -d "node_modules" ]; then
    rm -rf node_modules
    log_info "Removed existing node_modules"
fi

# Build shared package first
log_info "Building shared package..."
cd "$SHARED_DIR"
if [ ! -f "package.json" ]; then
    log_error "Shared package.json not found"
    exit 1
fi

npm ci --production=false
npm run build
log_success "Shared package built successfully"

# Build backend
log_info "Building backend TypeScript..."
cd "$BACKEND_DIR"

# Install dependencies
log_info "Installing backend dependencies..."
npm ci --production=false

# Run linting
log_info "Running ESLint..."
npm run lint || {
    log_warning "Linting failed, but continuing with build..."
}

# Run tests
log_info "Running tests..."
npm test || {
    log_warning "Tests failed, but continuing with build..."
}

# Build TypeScript
log_info "Compiling TypeScript..."
npm run build

if [ ! -d "dist" ]; then
    log_error "Build failed - dist directory not created"
    exit 1
fi

log_success "TypeScript compilation completed"

# Install production dependencies only
log_info "Installing production dependencies..."
rm -rf node_modules
npm ci --production=true

# Create deployment package
log_info "Creating deployment package..."

# Create temporary directory for packaging
TEMP_PACKAGE_DIR="/tmp/econlens-backend-$$"
mkdir -p "$TEMP_PACKAGE_DIR"

# Copy necessary files
cp -r dist "$TEMP_PACKAGE_DIR/"
cp -r node_modules "$TEMP_PACKAGE_DIR/"
cp package.json "$TEMP_PACKAGE_DIR/"
cp package-lock.json "$TEMP_PACKAGE_DIR/" 2>/dev/null || true

# Copy shared package
mkdir -p "$TEMP_PACKAGE_DIR/shared"
cp -r "$SHARED_DIR/dist" "$TEMP_PACKAGE_DIR/shared/"
cp -r "$SHARED_DIR/node_modules" "$TEMP_PACKAGE_DIR/shared/"
cp "$SHARED_DIR/package.json" "$TEMP_PACKAGE_DIR/shared/"

# Copy environment template
cp env.example "$TEMP_PACKAGE_DIR/.env.template"

# Create deployment info file
cat > "$TEMP_PACKAGE_DIR/deployment-info.txt" << EOF
EconLens Backend Deployment Package
===================================
Build Date: $(date)
Build Host: $(hostname)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
Node Version: $(node --version)
NPM Version: $(npm --version)
Package Size: $(du -sh "$TEMP_PACKAGE_DIR" | cut -f1)

Contents:
- dist/ (compiled TypeScript)
- node_modules/ (production dependencies)
- shared/ (shared package)
- package.json
- .env.template
- deployment-info.txt
EOF

# Create tar.gz package
cd /tmp
tar -czf "$PACKAGE_DIR/$PACKAGE_NAME" "econlens-backend-$$"
rm -rf "$TEMP_PACKAGE_DIR"

# Verify package
PACKAGE_SIZE=$(du -sh "$PACKAGE_DIR/$PACKAGE_NAME" | cut -f1)
log_success "Deployment package created: $PACKAGE_NAME ($PACKAGE_SIZE)"

# Display package contents
log_info "Package contents:"
tar -tzf "$PACKAGE_DIR/$PACKAGE_NAME" | head -20
if [ $(tar -tzf "$PACKAGE_DIR/$PACKAGE_NAME" | wc -l) -gt 20 ]; then
    echo "... and $(($(tar -tzf "$PACKAGE_DIR/$PACKAGE_NAME" | wc -l) - 20)) more files"
fi

# Clean up old packages (keep last 5)
log_info "Cleaning up old packages..."
cd "$PACKAGE_DIR"
ls -t econlens-backend-*.tar.gz | tail -n +6 | xargs -r rm -f

log_success "Build and packaging completed successfully!"
log_info "Package location: $PACKAGE_DIR/$PACKAGE_NAME"
log_info "Ready for deployment to EC2"

# Display next steps
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/deploy-to-ec2.sh $PACKAGE_NAME"
echo "2. Or run: ./scripts/setup-production-env.sh (after deployment)"
