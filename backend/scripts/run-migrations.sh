#!/bin/bash

# EconLens Database Migration Runner
# This script runs database migrations to set up the portfolio schema

set -e

echo "🚀 Starting EconLens database migrations..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables if not already set
export NODE_ENV=${NODE_ENV:-development}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
    echo "❌ Error: Database connection not configured"
    echo "Please set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT"
    exit 1
fi

echo "🔧 Running database migrations..."

# Run the migration script
node database/migrate.js

echo "✅ Database migrations completed successfully!"
echo ""
echo "📊 Database schema created:"
echo "  - portfolios table"
echo "  - portfolio_assets table"
echo "  - Sample data inserted"
echo ""
echo "🎯 Next steps:"
echo "  1. Start the backend server: npm run dev"
echo "  2. Test the API endpoints"
echo "  3. Verify data persistence"
