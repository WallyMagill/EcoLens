import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../services/api';
import type { Scenario } from '../types/api';

interface AnalysisResult {
  id: string;
  scenarioId: string;
  portfolioId: string;
  impact: number;
  riskScore: number;
  recommendations: string[];
  timestamp: string;
}

interface ScenarioState {
  availableScenarios: Scenario[];
  selectedScenarios: string[];
  analysisResults: AnalysisResult[];
  isAnalyzing: boolean;
  analysisProgress: number;
  loading: boolean;
  error: string | null;
}

const initialState: ScenarioState = {
  availableScenarios: [],
  selectedScenarios: [],
  analysisResults: [],
  isAnalyzing: false,
  analysisProgress: 0,
  loading: false,
  error: null,
};

// Async thunks
export const fetchScenarios = createAsyncThunk(
  'scenarios/fetchScenarios',
  async () => {
    const response = await apiClient.getScenarios();
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch scenarios');
    }
    return response.data || [];
  }
);

export const runScenarioAnalysis = createAsyncThunk(
  'scenarios/runAnalysis',
  async ({ portfolioId, scenarioIds }: { portfolioId: string; scenarioIds: string[] }) => {
    // This would typically call an analysis endpoint
    // For now, we'll simulate the analysis
    return new Promise<AnalysisResult[]>((resolve) => {
      setTimeout(() => {
        const results: AnalysisResult[] = scenarioIds.map((scenarioId, index) => ({
          id: `analysis_${Date.now()}_${index}`,
          scenarioId,
          portfolioId,
          impact: Math.random() * 20 - 10, // -10% to +10% impact
          riskScore: Math.random() * 100,
          recommendations: [
            'Consider diversifying your portfolio',
            'Monitor market volatility closely',
            'Review asset allocation quarterly'
          ],
          timestamp: new Date().toISOString(),
        }));
        resolve(results);
      }, 3000); // Simulate 3-second analysis
    });
  }
);

const scenarioSlice = createSlice({
  name: 'scenarios',
  initialState,
  reducers: {
    selectScenario: (state, action: PayloadAction<string>) => {
      const scenarioId = action.payload;
      if (state.selectedScenarios.includes(scenarioId)) {
        state.selectedScenarios = state.selectedScenarios.filter(id => id !== scenarioId);
      } else {
        state.selectedScenarios.push(scenarioId);
      }
    },
    clearSelectedScenarios: (state) => {
      state.selectedScenarios = [];
    },
    setAnalysisProgress: (state, action: PayloadAction<number>) => {
      state.analysisProgress = action.payload;
    },
    clearAnalysisResults: (state) => {
      state.analysisResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch scenarios
      .addCase(fetchScenarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        state.loading = false;
        state.availableScenarios = action.payload;
        state.error = null;
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch scenarios';
      })
      // Run analysis
      .addCase(runScenarioAnalysis.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisProgress = 0;
        state.error = null;
      })
      .addCase(runScenarioAnalysis.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analysisProgress = 100;
        state.analysisResults = action.payload;
        state.error = null;
      })
      .addCase(runScenarioAnalysis.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisProgress = 0;
        state.error = action.error.message || 'Analysis failed';
      });
  },
});

export const { 
  selectScenario, 
  clearSelectedScenarios, 
  setAnalysisProgress, 
  clearAnalysisResults, 
  clearError 
} = scenarioSlice.actions;
export default scenarioSlice.reducer;
