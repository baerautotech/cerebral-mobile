/**
 * UpgradeCTA Component
 *
 * Call-to-action for user upgrades
 * Used by TierGuard and IAPFeature to prompt upgrades
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TIER_CONFIGS, TierLevel } from '../types/tiers';

export interface UpgradeCTAProps {
  /** Required tier or SKU */
  targetTier?: TierLevel;

  /** SKU identifier if IAP-based */
  sku?: string;

  /** Message to display */
  message?: string;

  /** Callback when upgrade button pressed */
  onPress?: () => void;

  /** Custom button text */
  buttonText?: string;
}

/**
 * UpgradeCTA Component
 *
 * Reusable upgrade call-to-action component
 * Can be tier-based or IAP SKU-based
 *
 * @param {TierLevel} [targetTier] - Target tier for upgrade
 * @param {string} [sku] - IAP SKU
 * @param {string} [message] - Custom message
 * @param {Function} [onPress] - Callback when upgrade clicked
 * @param {string} [buttonText] - Custom button text
 * @returns {JSX.Element} Upgrade CTA card
 *
 * @example
 * // Tier-based upgrade
 * <UpgradeCTA
 *   targetTier="standard"
 *   onPress={() => navigateToUpgrade()}
 * />
 *
 * @example
 * // Custom message and button
 * <UpgradeCTA
 *   message="Unlock advanced analytics"
 *   buttonText="Subscribe Now"
 *   onPress={handleSubscribe}
 * />
 */
export function UpgradeCTA({
  targetTier,
  sku,
  message,
  onPress,
  buttonText = 'Upgrade Now',
}: UpgradeCTAProps): JSX.Element {
  // Generate message based on tier if not provided
  let displayMessage = message;
  if (!displayMessage && targetTier) {
    const tierConfig = TIER_CONFIGS[targetTier];
    displayMessage = `Upgrade to ${tierConfig.name} tier for ${tierConfig.price}${
      tierConfig.billingPeriod ? tierConfig.billingPeriod : ''
    }`;
  }

  if (!displayMessage) {
    displayMessage = 'Upgrade your account to unlock more features';
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✨</Text>
        </View>

        <Text style={styles.title}>Premium Feature</Text>

        <Text style={styles.message}>{displayMessage}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => {
            // User can dismiss
            console.log('Dismissed upgrade prompt');
          }}
        >
          <Text style={styles.dismissText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
});
