// API Configuration
export const API_BASE_URL = 'http://44.203.253.29:3001';

export const API_ENDPOINTS = {
  HEALTH: '/health',
  PORTFOLIOS: '/api/portfolios',
  SCENARIOS: '/api/scenarios',
} as const;

// App Configuration
export const APP_NAME = 'EconLens';
export const APP_VERSION = '1.0.0';

// Request Configuration
export const REQUEST_TIMEOUT = 10000; // 10 seconds
export const MAX_RETRIES = 3;