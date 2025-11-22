/**
 * useUserTier Hook
 *
 * React hook that manages user tier extraction and caching
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { extractTierFromJWT, hasTierAccess } from '../services/tiers';
import { TierLevel, UserTier } from '../types/tiers';

/**
 * useUserTier Hook
 *
 * Extracts user tier from JWT token and provides tier-based access checks
 *
 * @returns {Object} User tier state and methods
 * @returns {TierLevel | null} tier - Current user tier
 * @returns {UserTier | null} tierInfo - Full tier information
 * @returns {boolean} loading - Whether tier is loading
 * @returns {Function} refresh - Manually refresh tier
 * @returns {Function} hasTier - Check if user has required tier
 *
 * @example
 * const { tier, loading, hasTier } = useUserTier();
 *
 * if (loading) return <LoadingSpinner />;
 * if (hasTier('standard')) {
 *   return <PremiumFeature />;
 * }
 * return <UpgradePrompt />;
 */
export function useUserTier() {
  const { getToken } = useAuth();
  const [tier, setTier] = useState<TierLevel | null>(null);
  const [tierInfo, setTierInfo] = useState<UserTier | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load tier from JWT
   */
  const loadTier = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        console.warn('No auth token available, setting to free tier');
        setTier('free');
        setTierInfo({
          tier: 'free',
          expiresAt: null,
          isActive: true,
        });
        return;
      }

      const extractedTier = extractTierFromJWT(token);
      setTier(extractedTier);

      // Create tier info object
      const info: UserTier = {
        tier: extractedTier,
        expiresAt: null,
        isActive: true,
      };
      setTierInfo(info);

      console.log(`User tier loaded: ${extractedTier}`);
    } catch (error) {
      console.error('Error loading user tier:', error);
      // Fallback to free tier on error
      setTier('free');
      setTierInfo({
        tier: 'free',
        expiresAt: null,
        isActive: true,
      });
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * Load tier on mount
   */
  useEffect(() => {
    loadTier();
  }, [loadTier]);

  /**
   * Check if user has at least the required tier
   */
  const hasTierLevel = useCallback(
    (requiredTier: TierLevel): boolean => {
      return hasTierAccess(tier, requiredTier);
    },
    [tier]
  );

  return {
    tier,
    tierInfo,
    loading,
    refresh: loadTier,
    hasTier: hasTierLevel,
  };
}
