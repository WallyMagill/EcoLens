/**
 * EconLens Shared Types and Utilities
 * Main export file for shared workspace
 */

// Portfolio Types
export * from './types/portfolio';

// Utility Functions
export * from './utils/calculations';
export * from './utils/constants';
export * from './utils/validation';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Environment Configuration
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  AWS_REGION: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  API_BASE_URL: string;
}
