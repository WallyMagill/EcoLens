// API Response Types
export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  assets?: PortfolioAsset[];
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  portfolioId: string;
  createdAt: string;
  updatedAt: string;
  parameters?: ScenarioParameters;
}

export interface ScenarioParameters {
  timeHorizon: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketConditions: string;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}