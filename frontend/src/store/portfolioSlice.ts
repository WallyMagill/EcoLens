import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../services/api';
import type { CreatePortfolioRequest, Portfolio } from '../types/api';

interface PortfolioState {
  items: Portfolio[];
  selectedPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  totalValue: number;
  totalAssets: number;
  createLoading: boolean;
  createError: string | null;
}

const initialState: PortfolioState = {
  items: [],
  selectedPortfolio: null,
  loading: false,
  error: null,
  totalValue: 0,
  totalAssets: 0,
  createLoading: false,
  createError: null,
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
  async (portfolioData: CreatePortfolioRequest) => {
    const response = await apiClient.createPortfolio(portfolioData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create portfolio');
    }
    return response.data;
  }
);

export const updatePortfolio = createAsyncThunk(
  'portfolios/updatePortfolio',
  async ({ id, portfolioData }: { id: string; portfolioData: CreatePortfolioRequest }) => {
    const response = await apiClient.updatePortfolio(id, portfolioData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update portfolio');
    }
    return response.data;
  }
);

export const deletePortfolio = createAsyncThunk(
  'portfolios/deletePortfolio',
  async (id: string) => {
    const response = await apiClient.deletePortfolio(id);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete portfolio');
    }
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
    clearCreateError: (state) => {
      state.createError = null;
    },
    calculateTotals: (state) => {
      // Calculate total value from portfolio.totalValue (which is now properly calculated from backend)
      state.totalValue = state.items.reduce((total, portfolio) => 
        total + (portfolio.totalValue || 0), 0);
      
      // Calculate total assets count
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
        // Recalculate totals after fetching portfolios
        portfolioSlice.caseReducers.calculateTotals(state);
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
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.createLoading = false;
        if (action.payload) {
          state.items.push(action.payload);
        }
        state.createError = null;
        // Recalculate totals after creating portfolio
        portfolioSlice.caseReducers.calculateTotals(state);
      })
      .addCase(createPortfolio.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.error.message || 'Failed to create portfolio';
      })
      // Update portfolio
      .addCase(updatePortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.items.findIndex(p => p.id === action.payload!.id);
          if (index !== -1) {
            state.items[index] = action.payload!;
          }
          if (state.selectedPortfolio?.id === action.payload!.id) {
            state.selectedPortfolio = action.payload!;
          }
        }
        state.error = null;
        // Recalculate totals after updating portfolio
        portfolioSlice.caseReducers.calculateTotals(state);
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
        // Recalculate totals after deleting portfolio
        portfolioSlice.caseReducers.calculateTotals(state);
      })
      .addCase(deletePortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete portfolio';
      });
  },
});

export const { selectPortfolio, clearError, clearCreateError, calculateTotals } = portfolioSlice.actions;
export default portfolioSlice.reducer;
