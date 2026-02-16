/**
 * Feature Flags Type Definitions
 *
 * Defines the types used throughout the feature flag system
 */

/**
 * Feature flags returned from the backend
 * Key-value pairs where key is flag name and value is enabled/disabled
 */
export interface FeatureFlags {
  [key: string]: boolean;
}

/**
 * Context type for the Feature Flag context
 */
export interface FeatureFlagContextType {
  /** Current feature flags state */
  flags: FeatureFlags;

  /** Whether flags are currently loading from backend */
  loading: boolean;

  /** Manually refresh flags from backend */
  refresh: () => Promise<void>;

  /** Timestamp of last successful update */
  lastUpdated: number;
}

/**
 * Props for FeatureFlagProvider component
 */
export interface FeatureFlagProviderProps {
  /** Child components to wrap */
  children: React.ReactNode;
}

/**
 * Props for FeatureFlagGuard component
 */
export interface FeatureFlagGuardProps {
  /** The feature flag key to check */
  flag: string;

  /** Content to render if flag is enabled */
  children: React.ReactNode;

  /** Optional content to render if flag is disabled */
  fallback?: React.ReactNode;
}
