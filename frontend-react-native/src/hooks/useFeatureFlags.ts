/**
 * useFeatureFlags Hook
 *
 * React hook that manages feature flags with AsyncStorage caching
 * Provides offline support and manual refresh capability
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchFeatureFlags as fetchFlagsFromBackend } from '../services/featureFlags';
import { FeatureFlags } from '../types/featureFlags';

/**
 * Cache key for AsyncStorage
 */
const CACHE_KEY = 'cerebral_feature_flags';

/**
 * Cache time-to-live: 5 minutes
 */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * useFeatureFlags Hook
 *
 * Manages feature flags with caching:
 * 1. On startup, checks AsyncStorage for cached flags
 * 2. If cache is fresh (< 5 min), uses cached flags
 * 3. Otherwise, fetches fresh flags from backend
 * 4. Updates cache with new flags
 * 5. Falls back to expired cache if offline
 *
 * @returns {Object} Feature flags state and methods
 * @returns {FeatureFlags} flags - Current feature flags
 * @returns {boolean} loading - Whether flags are loading
 * @returns {Function} refresh - Manually refresh flags from backend
 * @returns {number} lastUpdated - Timestamp of last update
 *
 * @example
 * const { flags, loading, refresh } = useFeatureFlags();
 *
 * if (loading) return <LoadingSpinner />;
 *
 * return (
 *   <View>
 *     {flags.ai_features && <PremiumFeature />}
 *     <Button onPress={refresh} title="Refresh Flags" />
 *   </View>
 * );
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  /**
   * Load flags from cache or backend
   */
  const loadFlags = async () => {
    try {
      setLoading(true);

      // Try to load from cache first
      const cachedFlags = await AsyncStorage.getItem(CACHE_KEY);
      const cachedTime = await AsyncStorage.getItem(`${CACHE_KEY}_time`);

      // If cache exists and is fresh, use it
      if (cachedFlags && cachedTime) {
        const cacheAge = Date.now() - parseInt(cachedTime, 10);

        if (cacheAge < CACHE_TTL) {
          const parsedFlags = JSON.parse(cachedFlags);
          console.log('Using cached feature flags (age: ' + Math.floor(cacheAge / 1000) + 's)');
          setFlags(parsedFlags);
          setLastUpdated(parseInt(cachedTime, 10));
          setLoading(false);
          return;
        }
      }

      // Cache is stale or missing, fetch fresh flags from backend
      console.log('Fetching fresh feature flags from backend...');
      const newFlags = await fetchFlagsFromBackend();

      // Update cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newFlags));
      await AsyncStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());

      setFlags(newFlags);
      setLastUpdated(Date.now());
      console.log('Feature flags updated from backend');
    } catch (error) {
      console.error('Error loading feature flags:', error);

      // Fallback: try to use expired cache
      try {
        const cachedFlags = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedFlags) {
          console.warn('Using expired cache as fallback');
          setFlags(JSON.parse(cachedFlags));
        }
      } catch (fallbackError) {
        console.error('Fallback cache loading also failed:', fallbackError);
        setFlags({});
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load flags on component mount
   */
  useEffect(() => {
    loadFlags();
  }, []);

  return {
    flags,
    loading,
    refresh: loadFlags,
    lastUpdated,
  };
}
