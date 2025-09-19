# EconLens Frontend Deployment Guide

This guide covers the deployment of the EconLens React frontend with proper environment configuration and CORS handling.

## Environment Configuration

### Production Environment (`.env.production`)
```bash
# API Configuration
REACT_APP_API_URL=https://44.203.253.29/api
REACT_APP_API_BASE_URL=https://44.203.253.29

# AWS Configuration
REACT_APP_AWS_REGION=us-east-1

# Cognito Configuration
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_f9G2iTorZ
REACT_APP_COGNITO_USER_POOL_CLIENT_ID=6dv1d5mtjpem1orfjfj5r4k3fg

# Application Configuration
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=0.1.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true

# CORS Configuration
REACT_APP_CORS_ORIGIN=https://44.203.253.29

# Build Configuration
GENERATE_SOURCEMAP=false
REACT_APP_BUILD_TIME=__BUILD_TIME__
```

### Development Environment (`.env.development`)
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_BASE_URL=http://localhost:3001

# AWS Configuration
REACT_APP_AWS_REGION=us-east-1

# Cognito Configuration
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_f9G2iTorZ
REACT_APP_COGNITO_USER_POOL_CLIENT_ID=6dv1d5mtjpem1orfjfj5r4k3fg

# Application Configuration
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=0.1.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_ERROR_REPORTING=false

# CORS Configuration
REACT_APP_CORS_ORIGIN=http://localhost:3001

# Build Configuration
GENERATE_SOURCEMAP=true
REACT_APP_BUILD_TIME=__BUILD_TIME__
```

## Build Process

### 1. Build for Production
```bash
# Using the build script
./scripts/build-frontend.sh

# Or manually
cd frontend
npm ci
REACT_APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) npm run build:prod
```

### 2. Build for Development
```bash
cd frontend
npm ci
REACT_APP_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) npm run build:dev
```

## Configuration Files

### Environment Configuration (`src/config/environment.ts`)
- Centralizes environment variable access
- Provides type safety for configuration
- Validates required environment variables
- Logs configuration in development mode

### API Client (`src/services/api.ts`)
- Handles API communication with the backend
- Includes authentication token management
- Supports both localStorage and AWS Amplify tokens
- Provides typed API methods for common operations

### AWS Amplify Configuration (`src/config/amplify.ts`)
- Configures AWS Amplify for authentication
- Sets up Cognito User Pool integration
- Configures API endpoints with authentication headers
- Includes S3 storage configuration

## CORS Configuration

### Backend CORS Setup
The backend has been updated to handle multiple origins:

```typescript
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://44.203.253.29:3000',
      'https://44.203.253.29:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
};
```

### Frontend CORS Handling
- API client includes `credentials: 'include'` for cookie support
- Proper authentication headers are automatically added
- CORS origin is configured via environment variables

## Deployment Steps

### 1. Build the Frontend
```bash
./scripts/build-frontend.sh
```

### 2. Deploy to Web Server
The `build/` directory contains the production-ready React application. Deploy this to your web server.

### 3. Configure Web Server
Ensure your web server:
- Serves the React app for all routes (SPA routing)
- Sets proper CORS headers if needed
- Serves static assets with appropriate caching headers

### 4. Verify Deployment
- Test API connectivity: `curl http://44.203.253.29:3001/health`
- Test frontend: Navigate to your deployed frontend URL
- Test authentication: Try logging in with Cognito
- Test API calls: Verify frontend can communicate with backend

## Environment Variables Reference

| Variable                                | Description            | Example                         |
| --------------------------------------- | ---------------------- | ------------------------------- |
| `REACT_APP_API_URL`                     | Backend API URL        | `http://44.203.253.29:3001/api` |
| `REACT_APP_API_BASE_URL`                | Backend base URL       | `http://44.203.253.29:3001`     |
| `REACT_APP_AWS_REGION`                  | AWS region             | `us-east-1`                     |
| `REACT_APP_COGNITO_USER_POOL_ID`        | Cognito User Pool ID   | `us-east-1_f9G2iTorZ`           |
| `REACT_APP_COGNITO_USER_POOL_CLIENT_ID` | Cognito Client ID      | `6dv1d5mtjpem1orfjfj5r4k3fg`    |
| `REACT_APP_ENVIRONMENT`                 | Environment name       | `production`                    |
| `REACT_APP_VERSION`                     | Application version    | `0.1.0`                         |
| `REACT_APP_ENABLE_ANALYTICS`            | Enable analytics       | `true`                          |
| `REACT_APP_ENABLE_ERROR_REPORTING`      | Enable error reporting | `true`                          |
| `REACT_APP_CORS_ORIGIN`                 | CORS origin            | `http://44.203.253.29:3001`     |
| `GENERATE_SOURCEMAP`                    | Generate source maps   | `false`                         |
| `REACT_APP_BUILD_TIME`                  | Build timestamp        | `2024-01-01T12:00:00Z`          |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration includes your frontend URL
   - Check that `credentials: true` is set in both frontend and backend
   - Ensure proper headers are included in requests

2. **Authentication Issues**
   - Verify Cognito User Pool ID and Client ID are correct
   - Check that AWS Amplify is properly configured
   - Ensure tokens are being sent with API requests

3. **API Connection Issues**
   - Verify backend is running and accessible
   - Check API URL configuration
   - Test backend health endpoint

4. **Build Issues**
   - Ensure all environment variables are set
   - Check for TypeScript errors
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check environment variables
cd frontend
npm run type-check

# Test API connectivity
curl http://44.203.253.29:3001/health

# Check build output
ls -la frontend/build/

# View build info
cat frontend/build/build-info.txt
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.production` to version control
2. **API Keys**: Use AWS IAM roles and Cognito for authentication
3. **CORS**: Restrict origins to known domains only
4. **HTTPS**: Use HTTPS in production for all communications
5. **Headers**: Use security headers (helmet.js) on the backend

## Next Steps

1. Set up a proper domain name and SSL certificate
2. Configure a CDN for static asset delivery
3. Set up monitoring and logging
4. Implement CI/CD pipeline for automated deployments
5. Add error tracking and analytics
