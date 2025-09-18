import type {
    ApiResponse,
    HealthResponse,
    Portfolio,
    Scenario
} from '../types/api';
import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT } from '../utils/constants';
import { getAuthHeaders } from './auth';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = REQUEST_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Get auth headers with JWT token
      const authHeaders = await getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...authHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats from backend
      if (data.success !== undefined) {
        // Backend already returns {success, data, message} format
        if (data.success) {
          return {
            data: data.data,
            success: true,
          };
        } else {
          return {
            error: {
              message: data.message || 'Backend error',
              status: response.status,
              timestamp: new Date().toISOString(),
            },
            success: false,
          };
        }
      } else {
        // Backend returns raw data (like health endpoint)
        return {
          data,
          success: true,
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: {
              message: 'Request timeout',
              status: 408,
              timestamp: new Date().toISOString(),
            },
            success: false,
          };
        }
        
        return {
          error: {
            message: error.message,
            status: 0,
            timestamp: new Date().toISOString(),
          },
          success: false,
        };
      }

      return {
        error: {
          message: 'Unknown error occurred',
          status: 0,
          timestamp: new Date().toISOString(),
        },
        success: false,
      };
    }
  }

  // Health check endpoint
  async testHealth(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>(API_ENDPOINTS.HEALTH);
  }

  // Get all portfolios
  async getPortfolios(): Promise<ApiResponse<Portfolio[]>> {
    return this.request<Portfolio[]>(API_ENDPOINTS.PORTFOLIOS);
  }

  // Get all scenarios
  async getScenarios(): Promise<ApiResponse<Scenario[]>> {
    return this.request<Scenario[]>(API_ENDPOINTS.SCENARIOS);
  }

  // Get single portfolio by ID
  async getPortfolio(id: string): Promise<ApiResponse<Portfolio>> {
    return this.request<Portfolio>(`${API_ENDPOINTS.PORTFOLIOS}/${id}`);
  }

  // Get single scenario by ID
  async getScenario(id: string): Promise<ApiResponse<Scenario>> {
    return this.request<Scenario>(`${API_ENDPOINTS.SCENARIOS}/${id}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
