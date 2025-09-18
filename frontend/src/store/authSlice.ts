import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../services/auth';
import {
    confirmSignUp,
    forgotPassword,
    getCurrentAuthUser,
    signIn,
    signOut,
    signUp
} from '../services/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const result = await signIn(email, password);
    return result;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, firstName, lastName }: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) => {
    const result = await signUp(email, password, {
      email,
      given_name: firstName,
      family_name: lastName,
    });
    return result;
  }
);

export const confirmUser = createAsyncThunk(
  'auth/confirm',
  async ({ email, code }: { email: string; code: string }) => {
    const result = await confirmSignUp(email, code);
    return result;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await signOut();
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    try {
      const user = await getCurrentAuthUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }
      return user;
    } catch (error) {
      // Don't throw error for checkAuthStatus - just return null
      return null;
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email }: { email: string }) => {
    const result = await forgotPassword(email);
    return result;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Confirm
      .addCase(confirmUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(confirmUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Confirmation failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Reset password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Password reset failed';
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
