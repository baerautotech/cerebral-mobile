/**
 * FeatureFlagGuard Component
 *
 * Conditionally renders content based on feature flag state
 */

import React, { ReactNode } from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { FeatureFlagGuardProps } from '../types/featureFlags';

/**
 * FeatureFlagGuard Component
 *
 * Wraps content and conditionally renders based on feature flag state
 *
 * @param {string} flag - The feature flag key to check
 * @param {ReactNode} children - Content to render if flag is enabled
 * @param {ReactNode} [fallback] - Optional content to render if flag is disabled
 * @returns {ReactNode} Rendered content or fallback
 *
 * @example
 * // Show premium features only if flag enabled
 * <FeatureFlagGuard flag="premium_features">
 *   <PremiumAnalytics />
 * </FeatureFlagGuard>
 *
 * @example
 * // With fallback UI
 * <FeatureFlagGuard
 *   flag="beta_ui"
 *   fallback={<Text>Beta UI not available</Text>}
 * >
 *   <BetaUI />
 * </FeatureFlagGuard>
 */
export function FeatureFlagGuard({ flag, children, fallback }: FeatureFlagGuardProps): ReactNode {
  const { flags, loading } = useFeatureFlags();

  // During loading, don't render anything (avoid flashing)
  if (loading) {
    return null;
  }

  // Check if flag is enabled
  const isFlagEnabled = flags[flag] === true;

  // If flag enabled, render children
  if (isFlagEnabled) {
    return <>{children}</>;
  }

  // If flag disabled, render fallback (or nothing)
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: render nothing
  return null;
}
