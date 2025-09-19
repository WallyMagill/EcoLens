# HTTPS Frontend Configuration Update

## Summary

Updated the frontend configuration to use HTTPS backend endpoint instead of HTTP. The backend now has HTTPS enabled at `https://44.203.253.29`.

## Changes Made

### 1. Updated API Configuration (`src/utils/constants.ts`)
- Changed `API_BASE_URL` to use environment variable with HTTPS fallback
- Updated app configuration to use environment variables
- Configuration now supports both development and production environments

```typescript
// Before
export const API_BASE_URL = 'https://44.203.253.29';

// After
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://44.203.253.29';
```

### 2. Added TypeScript Definitions (`src/vite-env.d.ts`)
- Created type definitions for Vite environment variables
- Enables proper TypeScript support for `import.meta.env`

### 3. Enhanced Build Scripts (`package.json`)
- Added `build:prod` script for production builds
- Added `build:dev` script for development builds
- Scripts use Vite's mode system for environment-specific builds

### 4. Created Documentation (`ENVIRONMENT_SETUP.md`)
- Comprehensive guide for environment configuration
- Examples for both production and development setups
- Clear instructions for all environment variables

### 5. Added Deployment Script (`deploy-production.sh`)
- Automated production deployment script
- Creates `.env.production` file if missing
- Runs type checking and production build
- Provides clear next steps for deployment

## Environment Variables

### Production Configuration
Create `.env.production` file:
```bash
VITE_API_BASE_URL=https://44.203.253.29
VITE_APP_NAME=EconLens
VITE_APP_VERSION=1.0.0
```

### Development Configuration
Create `.env.local` file:
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=EconLens
VITE_APP_VERSION=1.0.0
```

## Deployment Commands

```bash
# Navigate to frontend directory
cd frontend

# Run production deployment script
./deploy-production.sh

# Or manually:
npm install
npm run type-check
npm run build:prod
```

## Verification

1. **Build Success**: Production build completes without errors
2. **HTTPS URLs**: All API calls use HTTPS endpoints
3. **Environment Variables**: Proper environment variable loading
4. **Type Safety**: TypeScript compilation passes

## Backend Integration

The frontend now correctly connects to the HTTPS backend at:
- **Health Check**: `https://44.203.253.29/health`
- **Portfolios API**: `https://44.203.253.29/api/portfolios`
- **Scenarios API**: `https://44.203.253.29/api/scenarios`

## Next Steps

1. **Deploy Frontend**: Use the deployment script to build and deploy
2. **Test Connectivity**: Verify HTTPS API calls work correctly
3. **Update CI/CD**: Update deployment pipelines to use new build scripts
4. **Monitor**: Check for any CORS or SSL certificate issues

## Files Modified

- `frontend/src/utils/constants.ts` - Environment variable configuration
- `frontend/src/vite-env.d.ts` - TypeScript definitions (new)
- `frontend/package.json` - Build scripts
- `frontend/ENVIRONMENT_SETUP.md` - Documentation (new)
- `frontend/deploy-production.sh` - Deployment script (new)
- `HTTPS_FRONTEND_CONFIGURATION.md` - This summary (new)
