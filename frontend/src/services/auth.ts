import { Auth } from 'aws-amplify';

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  name?: string;
  signInDetails?: {
    loginId: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
}

// Helper function to extract serializable user data from CognitoUser
const extractUserData = (cognitoUser: any): AuthUser => {
  // Handle both direct user object and session-based user
  const attributes = cognitoUser.attributes || cognitoUser.signInUserSession?.idToken?.payload || {};
  
  return {
    userId: attributes.sub || cognitoUser.username,
    username: cognitoUser.username,
    email: attributes.email || cognitoUser.username,
    name: attributes.name || attributes.given_name || attributes.family_name,
    signInDetails: {
      loginId: attributes.email || cognitoUser.username,
    },
  };
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const session = await Auth.currentSession();
    const idToken = session.getIdToken().getJwtToken();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    };
  } catch (error) {
    console.warn('No valid session found, proceeding without auth headers');
    return {
      'Content-Type': 'application/json',
    };
  }
};

export const getCurrentAuthUser = async (): Promise<AuthUser | null> => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return extractUserData(user);
  } catch (error) {
    console.warn('No authenticated user found:', error);
    return null;
  }
};

// Alias for compatibility
export const getCurrentUser = getCurrentAuthUser;

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await Auth.currentAuthenticatedUser();
    return true;
  } catch (error) {
    return false;
  }
};

// Real Amplify authentication functions
export const signIn = async (username: string, password: string) => {
  try {
    const user = await Auth.signIn(username, password);
    return { isSignedIn: true, user: extractUserData(user) };
  } catch (error) {
    const authError = error as any;
    throw new Error(authError.message || 'Sign in failed');
  }
};

export const signUp = async (username: string, password: string, attributes: Record<string, string>) => {
  try {
    const result = await Auth.signUp({
      username,
      password,
      attributes,
    });
    return { isSignUpComplete: result.userConfirmed };
  } catch (error) {
    const authError = error as any;
    throw new Error(authError.message || 'Sign up failed');
  }
};

export const confirmSignUp = async (username: string, confirmationCode: string) => {
  try {
    await Auth.confirmSignUp(username, confirmationCode);
    return { isSignUpComplete: true };
  } catch (error) {
    const authError = error as any;
    throw new Error(authError.message || 'Confirmation failed');
  }
};

export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    const authError = error as any;
    throw new Error(authError.message || 'Sign out failed');
  }
};

export const forgotPassword = async (username: string) => {
  try {
    await Auth.forgotPassword(username);
    return { isPasswordReset: true };
  } catch (error) {
    const authError = error as any;
    throw new Error(authError.message || 'Password reset failed');
  }
};

export const forgotPasswordSubmit = async (username: string, code: string, newPassword: string) => {
  try {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
    return { isPasswordReset: true };
  } catch (error) {
    const authError = error as any;
    throw new Error(authError.message || 'Password reset confirmation failed');
  }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const result = await Auth.changePassword(user, oldPassword, newPassword);
    return { success: true, result };
  } catch (error: any) {
    console.error('Password change error:', error);
    throw new Error(error.message || 'Failed to change password');
  }
};
