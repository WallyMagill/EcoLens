import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../services/api';
import type { Portfolio } from '../types/api';

interface PortfolioState {
  items: Portfolio[];
  selectedPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  totalValue: number;
  totalAssets: number;
}

const initialState: PortfolioState = {
  items: [],
  selectedPortfolio: null,
  loading: false,
  error: null,
  totalValue: 0,
  totalAssets: 0,
};

// Async thunks
export const fetchPortfolios = createAsyncThunk(
  'portfolios/fetchPortfolios',
  async () => {
    const response = await apiClient.getPortfolios();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch portfolios');
    }
    return response.data || [];
  }
);

export const fetchPortfolio = createAsyncThunk(
  'portfolios/fetchPortfolio',
  async (id: string) => {
    const response = await apiClient.getPortfolio(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch portfolio');
    }
    return response.data;
  }
);

export const createPortfolio = createAsyncThunk(
  'portfolios/createPortfolio',
  async (portfolioData: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This would typically call a POST endpoint
    // For now, we'll simulate the creation
    const newPortfolio: Portfolio = {
      ...portfolioData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newPortfolio;
  }
);

export const updatePortfolio = createAsyncThunk(
  'portfolios/updatePortfolio',
  async ({ id, updates }: { id: string; updates: Partial<Portfolio> }) => {
    // This would typically call a PUT endpoint
    // For now, we'll simulate the update
    const updatedPortfolio: Portfolio = {
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    } as Portfolio;
    return updatedPortfolio;
  }
);

export const deletePortfolio = createAsyncThunk(
  'portfolios/deletePortfolio',
  async (id: string) => {
    // This would typically call a DELETE endpoint
    // For now, we'll just return the ID
    return id;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolios',
  initialState,
  reducers: {
    selectPortfolio: (state, action: PayloadAction<Portfolio | null>) => {
      state.selectedPortfolio = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.totalValue = state.items.reduce((total, portfolio) => {
        const portfolioValue = portfolio.assets?.reduce((assetTotal, asset) => 
          assetTotal + asset.value, 0) || 0;
        return total + portfolioValue;
      }, 0);
      
      state.totalAssets = state.items.reduce((total, portfolio) => 
        total + (portfolio.assets?.length || 0), 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolios
      .addCase(fetchPortfolios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchPortfolios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolios';
      })
      // Fetch single portfolio
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPortfolio = action.payload || null;
        state.error = null;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolio';
      })
      // Create portfolio
      .addCase(createPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(createPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create portfolio';
      })
      // Update portfolio
      .addCase(updatePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedPortfolio?.id === action.payload.id) {
          state.selectedPortfolio = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update portfolio';
      })
      // Delete portfolio
      .addCase(deletePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(p => p.id !== action.payload);
        if (state.selectedPortfolio?.id === action.payload) {
          state.selectedPortfolio = null;
        }
        state.error = null;
      })
      .addCase(deletePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete portfolio';
      });
  },
});

export const { selectPortfolio, clearError, calculateTotals } = portfolioSlice.actions;
export default portfolioSlice.reducer;
