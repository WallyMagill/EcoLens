import { Portfolio } from '@econlens/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  loading: false,
  error: null,
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPortfolios: (state, action: PayloadAction<Portfolio[]>) => {
      state.portfolios = action.payload;
    },
    setCurrentPortfolio: (state, action: PayloadAction<Portfolio | null>) => {
      state.currentPortfolio = action.payload;
    },
    addPortfolio: (state, action: PayloadAction<Portfolio>) => {
      state.portfolios.push(action.payload);
    },
    updatePortfolio: (state, action: PayloadAction<Portfolio>) => {
      const index = state.portfolios.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.portfolios[index] = action.payload;
      }
      if (state.currentPortfolio?.id === action.payload.id) {
        state.currentPortfolio = action.payload;
      }
    },
    removePortfolio: (state, action: PayloadAction<string>) => {
      state.portfolios = state.portfolios.filter(p => p.id !== action.payload);
      if (state.currentPortfolio?.id === action.payload) {
        state.currentPortfolio = null;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setPortfolios,
  setCurrentPortfolio,
  addPortfolio,
  updatePortfolio,
  removePortfolio,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
