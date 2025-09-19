# Environment Configuration

## Production Environment Setup

To configure the frontend for production deployment with HTTP backend (S3 website), create a `.env.production` file in the frontend root directory with the following content:

```bash
# API Configuration
VITE_API_BASE_URL=http://EconLe-EconL-rZpK4Z8Snovx-624635801.us-east-1.elb.amazonaws.com

# AWS Cognito Configuration (if needed)
# VITE_COGNITO_USER_POOL_ID=your_user_pool_id
# VITE_COGNITO_USER_POOL_WEB_CLIENT_ID=your_web_client_id
# VITE_COGNITO_REGION=us-east-1

# App Configuration
VITE_APP_NAME=EconLens
VITE_APP_VERSION=1.0.0
```

## Development Environment Setup

For development, create a `.env.local` file:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME=EconLens
VITE_APP_VERSION=1.0.0
```

## Environment Variables

- `VITE_API_BASE_URL`: The base URL for the backend API (HTTP for ALB endpoint)
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_COGNITO_USER_POOL_ID`: AWS Cognito User Pool ID (optional)
- `VITE_COGNITO_USER_POOL_WEB_CLIENT_ID`: AWS Cognito Web Client ID (optional)
- `VITE_COGNITO_REGION`: AWS Cognito region (optional)

## Production Deployment URLs

- **Frontend**: `http://econlens-frontend-prod.s3-website-us-east-1.amazonaws.com/`
- **API Test**: `http://econlens-frontend-prod.s3-website-us-east-1.amazonaws.com/api-test`
- **Backend API**: `http://EconLe-EconL-rZpK4Z8Snovx-624635801.us-east-1.elb.amazonaws.com`

**Note**: All URLs use HTTP protocol to avoid mixed content issues between S3 website and ALB.

## Build Commands

```bash
# Build for production
npm run build:prod

# Build for development
npm run build:dev
```

The application will automatically use the appropriate environment variables based on the build mode.
