/**
 * TierGuard Component
 * 
 * Conditionally renders content based on user tier level
 */

import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUserTier } from '../hooks/useUserTier';
import { TierGuardProps, formatTierName } from '../types/tiers';

/**
 * TierGuard Component
 * 
 * Wraps content and shows it only if user has the required tier
 * Shows upgrade prompt if user doesn't have sufficient access
 * 
 * @param {string} tier - Required tier level ('free' | 'standard' | 'enterprise')
 * @param {ReactNode} children - Content to show if user has tier
 * @param {ReactNode} [fallback] - Optional custom fallback UI
 * @returns {ReactNode} Either content, fallback, or upgrade prompt
 * 
 * @example
 * // Show premium analytics only to standard+ users
 * <TierGuard tier="standard">
 *   <AdvancedAnalyticsScreen />
 * </TierGuard>
 * 
 * @example
 * // With custom fallback
 * <TierGuard
 *   tier="enterprise"
 *   fallback={<Text>Available in Enterprise plan</Text>}
 * >
 *   <AIFeaturesScreen />
 * </TierGuard>
 */
export function TierGuard({
  tier,
  children,
  fallback,
}: TierGuardProps): ReactNode {
  const { tier: userTier, loading, hasTier } = useUserTier();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Check if user has required tier
  const hasAccess = hasTier(tier);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or default upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: Show upgrade prompt
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Premium Feature</Text>
        <Text style={styles.description}>
          This feature requires {formatTierName(tier)} tier or higher
        </Text>
        {userTier && (
          <Text style={styles.currentTier}>
            You are currently on {formatTierName(userTier)} tier
          </Text>
        )}
        <TouchableOpacity 
          style={styles.upgradeButton}
          onPress={() => {
            // TODO: Navigate to upgrade/purchase screen
            console.log('Navigate to upgrade screen');
          }}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  currentTier: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

