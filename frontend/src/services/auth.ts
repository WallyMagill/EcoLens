// Authentication service for EconLens Frontend
// Handles AWS Cognito authentication using AWS Amplify

import {
    confirmResetPassword,
    confirmSignUp,
    fetchAuthSession,
    resetPassword,
    getCurrentUser,
    resendSignUpCode,
    signIn,
    signOut,
    signUp,
    type AuthUser,
    type ConfirmResetPasswordInput,
    type ConfirmSignUpInput,
    type ResetPasswordInput,
    type SignInInput,
    type SignUpInput
} from 'aws-amplify/auth';

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerificationData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication service class
class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  // Convert Amplify user to our User type
  private convertAmplifyUser(amplifyUser: AuthUser): User {
    const attributes = amplifyUser.signInDetails?.loginId || '';
    const email = amplifyUser.username || '';
    
    return {
      id: amplifyUser.userId,
      email: email,
      firstName: amplifyUser.signInDetails?.loginId?.split('@')[0] || '',
      lastName: '',
      isVerified: true, // Assume verified if we can get the user
    };
  }

  // Get current authentication state
  async getCurrentAuthState(): Promise<AuthState> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      console.log('🔍 Auth Debug - User:', user?.userId);
      console.log('🔍 Auth Debug - Session valid:', !!session.tokens?.idToken);
      
      if (user && session.tokens?.idToken) {
        this.currentUser = this.convertAmplifyUser(user);
        this.isAuthenticated = true;
        
        console.log('✅ User authenticated:', this.currentUser.email);
        
        return {
          user: this.currentUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
    } catch (error: any) {
      console.log('❌ Auth Error:', error.name, error.message);
      
      // Handle specific error cases
      if (error.name === 'UserUnAuthenticatedException' || error.name === 'NotAuthorizedException') {
        console.log('🔐 User needs to log in');
      } else if (error.name === 'UserNotFoundException') {
        console.log('👤 User not found in pool - this should not happen if user was created');
      }
    }

    this.currentUser = null;
    this.isAuthenticated = false;
    
    console.log('❌ No valid authentication found');
    
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // Sign in user
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      // Always clear any existing auth state first to prevent conflicts
      await this.clearAuthState();
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const signInInput: SignInInput = {
        username: credentials.email,
        password: credentials.password,
      };

      const result = await signIn(signInInput);
      console.log('🔍 Sign-in result:', result);
      
      if (result.isSignedIn) {
        const user = await getCurrentUser();
        console.log('✅ Login successful, user ID:', user.userId);
        
        this.currentUser = this.convertAmplifyUser(user);
        this.isAuthenticated = true;
        return this.currentUser;
      } else {
        console.log('❌ Sign-in not completed');
        throw new Error('Sign in failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error.name, error.message);
      
      // Handle specific "already signed in" error with enhanced recovery
      if (error.message && error.message.includes('There is already a signed in user')) {
        console.log('🔄 Handling "already signed in" error - force clearing auth state...');
        try {
          await this.forceSignOutAndClear();
          console.log('✅ Authentication state forcefully cleared');
          throw new Error('Authentication session cleared. Please try logging in again.');
        } catch (clearError) {
          console.error('❌ Failed to clear authentication state:', clearError);
          throw new Error('Authentication session conflict. Please refresh the page and try again.');
        }
      }
      
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<{ user: User; requiresVerification: boolean }> {
    try {
      const signUpInput: SignUpInput = {
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            given_name: data.firstName,
            family_name: data.lastName,
          },
        },
      };

      const result = await signUp(signUpInput);
      
      const user: User = {
        id: result.userId || '',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        isVerified: false,
      };

      return {
        user,
        requiresVerification: !result.isSignUpComplete,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Verify email with code
  async verifyEmail(data: VerificationData): Promise<void> {
    try {
      const confirmSignUpInput: ConfirmSignUpInput = {
        username: data.email,
        confirmationCode: data.code,
      };

      await confirmSignUp(confirmSignUpInput);
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Resend verification code
  async resendVerificationCode(email: string): Promise<void> {
    try {
      await resendSignUpCode({ username: email });
    } catch (error: any) {
      console.error('Resend verification code error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    try {
      const resetPasswordInput: ResetPasswordInput = {
        username: data.email,
      };

      await resetPassword(resetPasswordInput);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Reset password with code
  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      const confirmResetPasswordInput: ConfirmResetPasswordInput = {
        username: data.email,
        confirmationCode: data.code,
        newPassword: data.newPassword,
      };

      await confirmResetPassword(confirmResetPasswordInput);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Sign out user
  async logout(): Promise<void> {
    try {
      await signOut();
      this.currentUser = null;
      this.isAuthenticated = false;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await getCurrentUser();
      this.currentUser = this.convertAmplifyUser(user);
      this.isAuthenticated = true;
      return this.currentUser;
    } catch (error) {
      this.currentUser = null;
      this.isAuthenticated = false;
      return null;
    }
  }

  // Get authentication token
  async getAuthToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // Clear all authentication state (for debugging/reset purposes)
  async clearAuthState(): Promise<void> {
    try {
      console.log('🧼 Clearing all authentication state...');
      
      // Sign out from Amplify (try both global and local)
      try {
        await signOut({ global: true });
        console.log('✅ Global sign out successful');
      } catch (error) {
        console.log('⚠️ Global sign out failed, trying local sign out:', error);
        try {
          await signOut();
          console.log('✅ Local sign out successful');
        } catch (localError) {
          console.log('⚠️ Local sign out failed (may be expected):', localError);
        }
      }
      
      // Clear local state
      this.currentUser = null;
      this.isAuthenticated = false;
      
      console.log('✅ Authentication state cleared');
    } catch (error) {
      console.error('❌ Error clearing auth state:', error);
      // Don't throw error to prevent blocking login attempts
    }
  }
  
  // Force sign out with aggressive clearing for stubborn auth states
  async forceSignOutAndClear(): Promise<void> {
    console.log('🔥 Force clearing authentication state...');
    
    // Clear local state first
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Try multiple sign out approaches
    const signOutMethods = [
      () => signOut({ global: true }),
      () => signOut(),
    ];
    
    for (const method of signOutMethods) {
      try {
        await method();
        console.log('✅ Sign out method succeeded');
        break;
      } catch (error) {
        console.log('⚠️ Sign out method failed, trying next:', error);
      }
    }
    
    // Clear any potential browser storage
    try {
      if (typeof window !== 'undefined') {
        // Clear localStorage items that might be related to Amplify
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('amplify') || key.includes('aws') || key.includes('cognito'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed storage key: ${key}`);
          } catch (e) {
            console.log(`⚠️ Failed to remove storage key: ${key}`);
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Failed to clear browser storage:', error);
    }
    
    console.log('✅ Force authentication clearing complete');
  }

  // Get user-friendly error messages
  private getErrorMessage(error: any): string {
    if (error.name === 'NotAuthorizedException') {
      return 'Invalid email or password. Please try again.';
    }
    if (error.name === 'UserNotConfirmedException') {
      return 'Please verify your email address before signing in.';
    }
    if (error.name === 'UserNotFoundException') {
      return 'No account found with this email address.';
    }
    if (error.name === 'InvalidPasswordException') {
      return 'Password does not meet requirements.';
    }
    if (error.name === 'UsernameExistsException') {
      return 'An account with this email already exists.';
    }
    if (error.name === 'CodeMismatchException') {
      return 'Invalid verification code. Please try again.';
    }
    if (error.name === 'ExpiredCodeException') {
      return 'Verification code has expired. Please request a new one.';
    }
    if (error.name === 'LimitExceededException') {
      return 'Too many attempts. Please try again later.';
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}

// Create and export singleton instance
export const authService = new AuthService();

// Export types and service
export default authService;

