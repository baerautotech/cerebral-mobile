/**
 * Environment Configuration
 * Validates and exposes environment variables with type safety
 */


interface EnvironmentConfig {
  API_BASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ENABLE_ANALYTICS: boolean;
  SENTRY_DSN?: string;
}

/**
 * Validate required environment variables
 */
const validateEnv = (): void => {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

  // eslint-disable-next-line security/detect-object-injection
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

/**
 * Get environment-specific API URL
 */
const getApiUrl = (): string => {
  if (Platform.OS === 'web') {
    // Use relative path for web (nginx proxies to backend)
    return '/api';
  }

  // For mobile, use full URL
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'https://cerebral.baerautotech.com/api';
    case 'staging':
      return 'https://staging.cerebral.baerautotech.com/api';
    default:
      return 'http://localhost:8000/api';
  }
};

// Validate on import
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

/**
 * Typed environment configuration
 */
export const env: EnvironmentConfig = {
  API_BASE_URL: getApiUrl(),
  SUPABASE_URL: process.env.SUPABASE_URL ?? 'https://txlzlhcrfippujcmnief.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  ENVIRONMENT: (process.env.NODE_ENV as "development" | "staging" | "production") || 'development',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  SENTRY_DSN: process.env.SENTRY_DSN,
};

/**
 * Feature flags (easily togglable)
 */
export const features = {
  enableOfflineMode: false,
  enablePushNotifications: false,
  enableAdvancedAnalytics: false,
  enableExperimentalFeatures: __DEV__,
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return env.ENVIRONMENT === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return env.ENVIRONMENT === 'development' || __DEV__;
};

export default env;
