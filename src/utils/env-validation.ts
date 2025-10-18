/**
 * Environment variable validation utility
 * Ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  supabaseProjectId: string;
  supabaseAnonKey: string;
  supabaseUrl: string;
  razorpayKeyId: string;
  googleClientId: string;
  appEnv: 'development' | 'production' | 'staging';
  appUrl: string;
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates and returns environment configuration
 * Throws an error if any required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const requiredVars = {
    supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  };

  const missingVars: string[] = [];

  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new EnvironmentValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate URL formats
  try {
    new URL(requiredVars.supabaseUrl);
  } catch {
    throw new EnvironmentValidationError('Invalid VITE_SUPABASE_URL format');
  }

  const appEnv = (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'production' | 'staging';
  const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8080';

  return {
    supabaseProjectId: requiredVars.supabaseProjectId,
    supabaseAnonKey: requiredVars.supabaseAnonKey,
    supabaseUrl: requiredVars.supabaseUrl,
    razorpayKeyId: requiredVars.razorpayKeyId,
    googleClientId: requiredVars.googleClientId,
    appEnv,
    appUrl,
  };
}

/**
 * Get environment configuration (cached after first call)
 */
let cachedConfig: EnvironmentConfig | null = null;

export function getEnvironmentConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment();
  }
  return cachedConfig;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironmentConfig().appEnv === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironmentConfig().appEnv === 'development';
}