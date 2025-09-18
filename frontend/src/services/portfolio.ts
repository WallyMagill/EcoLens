// Portfolio service for EconLens Frontend

import { AssetCategory, AssetType, Portfolio, Region } from '@econlens/shared';
import { apiClient } from './api';

export interface CreatePortfolioData {
  name: string;
  description?: string;
  totalValue: number;
  assets: CreatePortfolioAssetData[];
}

export interface CreatePortfolioAssetData {
  symbol: string;
  name: string;
  assetType: AssetType;
  assetCategory: AssetCategory;
  sector?: string;
  geographicRegion: Region;
  allocationPercentage: number;
  dollarAmount: number;
  shares?: number;
  avgPurchasePrice?: number;
  expenseRatio?: number;
  dividendYield?: number;
  peRatio?: number;
  duration?: number;
  creditRating?: string;
  riskRating: number;
  volatility?: number;
  beta?: number;
}

export interface UpdatePortfolioData {
  name?: string;
  description?: string;
  totalValue?: number;
  assets?: CreatePortfolioAssetData[];
}

export interface PortfolioFilters {
  search?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: 'name' | 'totalValue' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface PortfolioListResponse {
  portfolios: Portfolio[];
  total: number;
  page: number;
  limit: number;
}

class PortfolioService {
  // Get all portfolios for the current user
  async getPortfolios(filters?: PortfolioFilters): Promise<PortfolioListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.minValue) queryParams.append('minValue', filters.minValue.toString());
      if (filters?.maxValue) queryParams.append('maxValue', filters.maxValue.toString());
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const endpoint = `/portfolios${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<PortfolioListResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
      throw new Error('Failed to fetch portfolios');
    }
  }

  // Get a specific portfolio by ID
  async getPortfolio(id: string): Promise<Portfolio> {
    try {
      const response = await apiClient.get<Portfolio>(`/portfolios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch portfolio ${id}:`, error);
      throw new Error('Failed to fetch portfolio');
    }
  }

  // Create a new portfolio
  async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>('/portfolios', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create portfolio:', error);
      throw new Error('Failed to create portfolio');
    }
  }

  // Update an existing portfolio
  async updatePortfolio(id: string, data: UpdatePortfolioData): Promise<Portfolio> {
    try {
      const response = await apiClient.put<Portfolio>(`/portfolios/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update portfolio ${id}:`, error);
      throw new Error('Failed to update portfolio');
    }
  }

  // Delete a portfolio
  async deletePortfolio(id: string): Promise<void> {
    try {
      await apiClient.delete(`/portfolios/${id}`);
    } catch (error) {
      console.error(`Failed to delete portfolio ${id}:`, error);
      throw new Error('Failed to delete portfolio');
    }
  }

  // Add an asset to a portfolio
  async addAssetToPortfolio(portfolioId: string, assetData: CreatePortfolioAssetData): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>(`/portfolios/${portfolioId}/assets`, assetData);
      return response.data;
    } catch (error) {
      console.error(`Failed to add asset to portfolio ${portfolioId}:`, error);
      throw new Error('Failed to add asset to portfolio');
    }
  }

  // Update an asset in a portfolio
  async updatePortfolioAsset(portfolioId: string, assetId: string, assetData: Partial<CreatePortfolioAssetData>): Promise<Portfolio> {
    try {
      const response = await apiClient.put<Portfolio>(`/portfolios/${portfolioId}/assets/${assetId}`, assetData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update asset ${assetId} in portfolio ${portfolioId}:`, error);
      throw new Error('Failed to update asset');
    }
  }

  // Remove an asset from a portfolio
  async removeAssetFromPortfolio(portfolioId: string, assetId: string): Promise<Portfolio> {
    try {
      const response = await apiClient.delete<Portfolio>(`/portfolios/${portfolioId}/assets/${assetId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to remove asset ${assetId} from portfolio ${portfolioId}:`, error);
      throw new Error('Failed to remove asset from portfolio');
    }
  }

  // Duplicate a portfolio
  async duplicatePortfolio(id: string, newName?: string): Promise<Portfolio> {
    try {
      const response = await apiClient.post<Portfolio>(`/portfolios/${id}/duplicate`, { name: newName });
      return response.data;
    } catch (error) {
      console.error(`Failed to duplicate portfolio ${id}:`, error);
      throw new Error('Failed to duplicate portfolio');
    }
  }

  // Export portfolio data
  async exportPortfolio(id: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`/api/portfolios/${id}/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export portfolio');
      }

      return await response.blob();
    } catch (error) {
      console.error(`Failed to export portfolio ${id}:`, error);
      throw new Error('Failed to export portfolio');
    }
  }

  // Import portfolio from CSV
  async importPortfolioFromCSV(csvFile: File): Promise<Portfolio> {
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('/api/portfolios/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import portfolio');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to import portfolio:', error);
      throw new Error('Failed to import portfolio');
    }
  }

  // Get portfolio analytics
  async getPortfolioAnalytics(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/portfolios/${id}/analytics`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get analytics for portfolio ${id}:`, error);
      throw new Error('Failed to get portfolio analytics');
    }
  }

  // Validate portfolio data
  validatePortfolioData(data: CreatePortfolioData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate portfolio name
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Portfolio name must be at least 2 characters long');
    }

    // Validate total value
    if (data.totalValue <= 0) {
      errors.push('Total value must be greater than 0');
    }

    // Validate assets
    if (!data.assets || data.assets.length === 0) {
      errors.push('Portfolio must have at least one asset');
    } else {
      // Check allocation sum
      const totalAllocation = data.assets.reduce((sum, asset) => sum + asset.allocationPercentage, 0);
      if (Math.abs(totalAllocation - 100) > 0.01) {
        errors.push(`Portfolio allocations must sum to 100%. Current sum: ${totalAllocation.toFixed(2)}%`);
      }

      // Validate individual assets
      data.assets.forEach((asset, index) => {
        if (!asset.symbol || asset.symbol.trim().length === 0) {
          errors.push(`Asset ${index + 1}: Symbol is required`);
        }
        if (!asset.name || asset.name.trim().length === 0) {
          errors.push(`Asset ${index + 1}: Name is required`);
        }
        if (asset.allocationPercentage < 0 || asset.allocationPercentage > 100) {
          errors.push(`Asset ${index + 1}: Allocation percentage must be between 0 and 100`);
        }
        if (asset.dollarAmount < 0) {
          errors.push(`Asset ${index + 1}: Dollar amount cannot be negative`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Helper method to get auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
      const user = await getCurrentUser();
      if (user) {
        const session = await fetchAuthSession();
        return session.tokens?.idToken?.toString() || null;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return null;
  }
}

// Create and export singleton instance
export const portfolioService = new PortfolioService();

export default portfolioService;

