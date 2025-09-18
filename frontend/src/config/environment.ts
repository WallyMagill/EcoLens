// Environment configuration for EconLens Frontend
// This file centralizes environment variable access and provides type safety

export interface EnvironmentConfig {
  apiUrl: string;
  apiBaseUrl: string;
  awsRegion: string;
  cognitoUserPoolId: string;
  cognitoUserPoolClientId: string;
  environment: 'development' | 'production' | 'test';
  version: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  corsOrigin: string;
  buildTime?: string;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value;
};

// Parse boolean environment variables
const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

// Environment configuration
export const config: EnvironmentConfig = {
  apiUrl: getEnvVar('REACT_APP_API_URL', 'http://localhost:3001/api'),
  apiBaseUrl: getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:3001'),
  awsRegion: getEnvVar('REACT_APP_AWS_REGION', 'us-east-1'),
  cognitoUserPoolId: getEnvVar('REACT_APP_COGNITO_USER_POOL_ID'),
  cognitoUserPoolClientId: getEnvVar('REACT_APP_COGNITO_USER_POOL_CLIENT_ID'),
  environment: (getEnvVar('REACT_APP_ENVIRONMENT', 'development') as 'development' | 'production' | 'test'),
  version: getEnvVar('REACT_APP_VERSION', '0.1.0'),
  enableAnalytics: getBooleanEnvVar('REACT_APP_ENABLE_ANALYTICS', false),
  enableErrorReporting: getBooleanEnvVar('REACT_APP_ENABLE_ERROR_REPORTING', false),
  corsOrigin: getEnvVar('REACT_APP_CORS_ORIGIN', 'http://localhost:3001'),
  buildTime: process.env.REACT_APP_BUILD_TIME,
};

// Validation
export const validateConfig = (): void => {
  const requiredFields: (keyof EnvironmentConfig)[] = [
    'cognitoUserPoolId',
    'cognitoUserPoolClientId',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`);
  }
};

// Log configuration in development
if (config.environment === 'development') {
  console.log('EconLens Frontend Configuration:', {
    ...config,
    // Don't log sensitive values
    cognitoUserPoolId: config.cognitoUserPoolId ? '***' : undefined,
    cognitoUserPoolClientId: config.cognitoUserPoolClientId ? '***' : undefined,
  });
}

// Validate configuration on import
validateConfig();

export default config;
