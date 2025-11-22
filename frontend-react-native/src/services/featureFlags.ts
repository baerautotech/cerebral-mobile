/**
 * Feature Flags Service
 *
 * Handles fetching feature flags from the backend API
 */

import { FeatureFlags } from '../types/featureFlags';

/**
 * Fetch feature flags from the backend
 *
 * @returns Promise resolving to feature flags object
 * @throws Returns empty object on network error (offline support)
 *
 * @example
 * const flags = await fetchFeatureFlags();
 * if (flags.ai_features) {
 *   // Show AI features
 * }
 */
export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  try {
    const response = await fetch('/api/flags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch feature flags: ${response.status} ${response.statusText}`);
      return {};
    }

    const flags: FeatureFlags = await response.json();
    console.log('Feature flags loaded from backend:', flags);
    return flags;
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    // Return empty object to allow offline fallback
    return {};
  }
}

/**
 * Validate a feature flag
 *
 * @param flags - Current feature flags
 * @param flagName - Name of the flag to check
 * @returns Boolean indicating if flag is enabled
 */
export function isFlagEnabled(flags: FeatureFlags, flagName: string): boolean {
  return flags[flagName] === true;
}
