// API client configuration for EconLens Frontend
// This file handles API communication with the backend

import { config } from '../config/environment';

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// API Client class
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Get authentication token from localStorage or Amplify
  private async getAuthToken(): Promise<string | null> {
    // Try to get token from localStorage first
    const token = localStorage.getItem('authToken');
    if (token) {
      return token;
    }

    // If using AWS Amplify, get token from there
    try {
      const { getCurrentUser } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      if (user) {
        const { fetchAuthSession } = await import('aws-amplify/auth');
        const session = await fetchAuthSession();
        return session.tokens?.idToken?.toString() || null;
      }
    } catch (error) {
      console.warn('Failed to get auth token from Amplify:', error);
    }

    return null;
  }

  // Create request headers with authentication
  private async createHeaders(customHeaders?: HeadersInit): Promise<HeadersInit> {
    const headers: Record<string, string> = { ...this.defaultHeaders as Record<string, string>, ...customHeaders as Record<string, string> };
    
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.createHeaders(options.headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for CORS
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, headers?: HeadersInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export specific API methods for common operations
export const api = {
  // Health check
  health: () => apiClient.healthCheck(),

  // Portfolio operations
  portfolios: {
    list: () => apiClient.get('/portfolios'),
    get: (id: string) => apiClient.get(`/portfolios/${id}`),
    create: (data: any) => apiClient.post('/portfolios', data),
    update: (id: string, data: any) => apiClient.put(`/portfolios/${id}`, data),
    delete: (id: string) => apiClient.delete(`/portfolios/${id}`),
  },

  // Scenario analysis
  scenarios: {
    run: (data: { portfolioId: string; scenarioId: string }) => 
      apiClient.post('/scenarios/run', data),
    list: () => apiClient.get('/scenarios'),
  },

  // Authentication (if using custom auth)
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials),
    logout: () => apiClient.post('/auth/logout'),
    refresh: () => apiClient.post('/auth/refresh'),
  },
};

export default apiClient;
