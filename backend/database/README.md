# EconLens Database Implementation

This directory contains the database schema, migrations, and utilities for the EconLens portfolio management system.

## Overview

The database implementation provides persistent storage for portfolios and their associated assets, replacing the previous mock data approach with real PostgreSQL operations.

## Database Schema

### Tables

#### `portfolios`
Stores portfolio metadata and user information.

```sql
CREATE TABLE portfolios (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    analysis_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### `portfolio_assets`
Stores individual asset holdings within portfolios.

```sql
CREATE TABLE portfolio_assets (
    id VARCHAR(50) PRIMARY KEY,
    portfolio_id VARCHAR(50) NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_category VARCHAR(100),
    sector VARCHAR(100),
    geographic_region VARCHAR(50),
    allocation_percentage DECIMAL(5,2) NOT NULL,
    dollar_amount DECIMAL(15,2) NOT NULL,
    shares DECIMAL(15,6),
    avg_purchase_price DECIMAL(10,2),
    risk_rating INTEGER CHECK (risk_rating BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

- `idx_portfolios_user_id` - Fast user portfolio lookups
- `idx_portfolios_created_at` - Chronological ordering
- `idx_portfolio_assets_portfolio_id` - Fast asset lookups by portfolio
- `idx_portfolio_assets_symbol` - Asset symbol searches

### Constraints

- Allocation percentages must be between 0-100%
- Dollar amounts must be non-negative
- Risk ratings must be between 1-10
- Valid asset types: stock, etf, mutual_fund, bond, reit, commodity, cash
- Valid geographic regions: us, developed_international, emerging_markets, global

## Migration System

### Running Migrations

```bash
# From the backend directory
./scripts/run-migrations.sh

# Or manually
node database/migrate.js
```

### Migration Files

- `migrations/001_create_portfolio_tables.sql` - Initial schema creation
- Future migrations will be numbered sequentially (002, 003, etc.)

### Migration Tracking

The system automatically tracks executed migrations in the `schema_migrations` table to prevent re-running completed migrations.

## API Endpoints

All portfolio endpoints now use real database operations:

### GET /api/portfolios
- Lists all portfolios for the authenticated user
- Includes asset counts and calculated total values
- Ordered by creation date (newest first)

### GET /api/portfolios/:id
- Retrieves a specific portfolio with all its assets
- Validates user ownership
- Returns 404 if portfolio not found

### POST /api/portfolios
- Creates a new portfolio with assets
- Validates allocation percentages sum to 100%
- Uses database transactions for consistency
- Returns the created portfolio with assets

### PUT /api/portfolios/:id
- Updates portfolio metadata and assets
- Validates user ownership
- Replaces all assets (delete + insert pattern)
- Uses database transactions for consistency

### DELETE /api/portfolios/:id
- Deletes portfolio and all associated assets
- Validates user ownership
- Uses CASCADE DELETE for assets

## Database Operations

### Connection Management

```typescript
import { getDatabaseClient } from '../database/connection';

let client;
try {
  client = await getDatabaseClient();
  // Database operations
} catch (error) {
  // Error handling
} finally {
  if (client) {
    client.release();
  }
}
```

### Transaction Handling

```typescript
await client.query('BEGIN');
try {
  // Multiple operations
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
}
```

### Error Handling

All database operations include:
- Proper try/catch blocks
- Client release in finally blocks
- Meaningful error messages
- Appropriate HTTP status codes

## Testing

### Database Test Script

```bash
node scripts/test-database.js
```

This script verifies:
- Tables exist and are properly structured
- Sample data is available
- CRUD operations work correctly
- Foreign key constraints function
- Cascade deletes work properly

## Environment Variables

Required database connection variables:

```bash
# Option 1: Full connection string
DATABASE_URL=postgresql://user:password@host:port/database

# Option 2: Individual components
DB_HOST=localhost
DB_PORT=5432
DB_NAME=econlens
DB_USER=postgres
DB_PASSWORD=password
```

## Sample Data

The migration includes sample portfolios and assets for testing:

- **Retirement Fund**: VTI (40%), BND (30%), VXUS (30%)
- **Growth Portfolio**: QQQ (60%), ARKK (40%)

## Performance Considerations

### Query Optimization
- Uses proper indexes for common queries
- Leverages PostgreSQL's JSON aggregation for asset data
- Implements efficient JOIN operations

### Connection Pooling
- Configured with 20 max connections
- 30-second idle timeout
- 2-second connection timeout

### Data Validation
- Database-level constraints prevent invalid data
- Application-level validation for business rules
- Allocation percentage validation (must sum to 100%)

## Security

### User Isolation
- All queries filter by `user_id`
- No cross-user data access possible
- JWT token integration planned for authentication

### SQL Injection Prevention
- All queries use parameterized statements
- No dynamic SQL construction
- Input validation and sanitization

## Future Enhancements

### Planned Features
- JWT authentication integration
- Risk profile calculations
- Portfolio analysis tracking
- Asset classification automation
- Performance metrics

### Schema Evolution
- Additional asset metadata fields
- Scenario analysis results storage
- User preferences and settings
- Audit logging

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check database server status
   - Validate network connectivity

2. **Migration Failures**
   - Check database permissions
   - Verify SQL syntax
   - Review migration logs

3. **Data Validation Errors**
   - Check allocation percentages
   - Verify asset type values
   - Review constraint violations

### Debug Mode

Enable detailed logging:

```bash
DEBUG=* npm run dev
```

This will show all database queries and connection details.
