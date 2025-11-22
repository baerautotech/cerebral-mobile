/**
 * Feature Flags Service
 *
 * Handles fetching feature flags from the backend API
 */

import { FeatureFlags } from '../types/featureFlags';
import { backendClient } from '@cerebral/core';

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
    // Use backendClient from core
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flags = await (backendClient as any).request('GET', '/api/flags');

    console.log('Feature flags loaded from backend:', flags);
    return flags as FeatureFlags;
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
