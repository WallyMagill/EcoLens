// Form validation utilities for EconLens Frontend

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Password validation (Cognito requirements)
export const validatePassword = (password: string): FieldValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): FieldValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): FieldValidationResult => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return { isValid: true };
};

// Verification code validation
export const validateVerificationCode = (code: string): FieldValidationResult => {
  if (!code) {
    return { isValid: false, error: 'Verification code is required' };
  }
  
  if (code.length !== 6) {
    return { isValid: false, error: 'Verification code must be 6 digits' };
  }
  
  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'Verification code must contain only numbers' };
  }
  
  return { isValid: true };
};

// Portfolio name validation
export const validatePortfolioName = (name: string): FieldValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Portfolio name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Portfolio name must be at least 2 characters long' };
  }
  
  if (name.length > 200) {
    return { isValid: false, error: 'Portfolio name must be less than 200 characters' };
  }
  
  return { isValid: true };
};

// Portfolio description validation
export const validatePortfolioDescription = (description: string): FieldValidationResult => {
  if (description && description.length > 1000) {
    return { isValid: false, error: 'Description must be less than 1000 characters' };
  }
  
  return { isValid: true };
};

// Asset symbol validation
export const validateAssetSymbol = (symbol: string): FieldValidationResult => {
  if (!symbol) {
    return { isValid: false, error: 'Asset symbol is required' };
  }
  
  if (symbol.length < 1) {
    return { isValid: false, error: 'Asset symbol must be at least 1 character' };
  }
  
  if (symbol.length > 20) {
    return { isValid: false, error: 'Asset symbol must be less than 20 characters' };
  }
  
  // Check for valid characters (letters, numbers, dots, hyphens)
  if (!/^[A-Za-z0-9.\-]+$/.test(symbol)) {
    return { isValid: false, error: 'Asset symbol can only contain letters, numbers, dots, and hyphens' };
  }
  
  return { isValid: true };
};

// Allocation percentage validation
export const validateAllocationPercentage = (percentage: number): FieldValidationResult => {
  if (percentage === undefined || percentage === null) {
    return { isValid: false, error: 'Allocation percentage is required' };
  }
  
  if (percentage < 0) {
    return { isValid: false, error: 'Allocation percentage cannot be negative' };
  }
  
  if (percentage > 100) {
    return { isValid: false, error: 'Allocation percentage cannot exceed 100%' };
  }
  
  return { isValid: true };
};

// Dollar amount validation
export const validateDollarAmount = (amount: number): FieldValidationResult => {
  if (amount === undefined || amount === null) {
    return { isValid: false, error: 'Dollar amount is required' };
  }
  
  if (amount < 0) {
    return { isValid: false, error: 'Dollar amount cannot be negative' };
  }
  
  if (amount > 1000000000) { // 1 billion limit
    return { isValid: false, error: 'Dollar amount cannot exceed $1,000,000,000' };
  }
  
  return { isValid: true };
};

// Portfolio allocation sum validation
export const validatePortfolioAllocationSum = (allocations: number[]): FieldValidationResult => {
  const sum = allocations.reduce((total, allocation) => total + (allocation || 0), 0);
  
  if (Math.abs(sum - 100) > 0.01) { // Allow for small floating point differences
    return { 
      isValid: false, 
      error: `Portfolio allocations must sum to 100%. Current sum: ${sum.toFixed(2)}%` 
    };
  }
  
  return { isValid: true };
};

// Form validation helper
export const validateForm = (validations: FieldValidationResult[]): ValidationResult => {
  const errors = validations
    .filter(validation => !validation.isValid)
    .map(validation => validation.error!)
    .filter(Boolean);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Real-time validation helper
export const getFieldError = (value: string, validator: (value: string) => FieldValidationResult): string | undefined => {
  const result = validator(value);
  return result.isValid ? undefined : result.error;
};

// Password strength indicator
export const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  if (score <= 2) {
    return { score, label: 'Weak', color: 'text-red-600' };
  } else if (score <= 4) {
    return { score, label: 'Medium', color: 'text-yellow-600' };
  } else {
    return { score, label: 'Strong', color: 'text-green-600' };
  }
};

