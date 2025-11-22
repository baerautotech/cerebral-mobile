/**
 * Tier System Service
 *
 * Handles tier extraction from JWT and tier validation
 */

import { TierLevel, UserTier, TIER_HIERARCHY } from '../types/tiers';

/**
 * Decode JWT and extract tier
 *
 * @param token - JWT token
 * @returns Decoded JWT payload or null if invalid
 */
function decodeJWT(token: string): Record<string, any> | null {
  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT format');
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];

    // Add padding if needed
    const padded = payload + '==='.substring(0, (4 - (payload.length % 4)) % 4);

    // Convert base64url to base64
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');

    // Decode
    const decoded = atob(base64);
    const parsed = JSON.parse(decoded);

    return parsed;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Extract and validate tier from JWT token
 *
 * @param token - JWT token from authentication
 * @returns User tier or 'free' as default
 *
 * @example
 * const token = await getAuthToken();
 * const tier = extractTierFromJWT(token);
 */
export function extractTierFromJWT(token: string | null): TierLevel {
  if (!token) {
    console.warn('No token provided, defaulting to free tier');
    return 'free';
  }

  const payload = decodeJWT(token);
  if (!payload) {
    console.warn('Could not decode JWT, defaulting to free tier');
    return 'free';
  }

  const tier = payload.tier || payload.user_tier;

  if (!tier) {
    console.warn('No tier found in JWT, defaulting to free tier');
    return 'free';
  }

  // Validate tier
  if (!isValidTier(tier)) {
    console.warn(`Invalid tier "${tier}" in JWT, defaulting to free tier`);
    return 'free';
  }

  console.log(`Tier extracted from JWT: ${tier}`);
  return tier as TierLevel;
}

/**
 * Check if a tier value is valid
 *
 * @param tier - Tier to validate
 * @returns True if tier is valid
 */
export function isValidTier(tier: any): tier is TierLevel {
  return tier === 'free' || tier === 'standard' || tier === 'enterprise';
}

/**
 * Get tier hierarchy level (0=free, 1=standard, 2=enterprise)
 *
 * @param tier - Tier to get level for
 * @returns Numeric level
 */
export function getTierLevel(tier: TierLevel): number {
  return TIER_HIERARCHY[tier];
}

/**
 * Check if user has at least the required tier
 *
 * @param userTier - User's current tier
 * @param requiredTier - Required tier
 * @returns True if user meets requirement
 *
 * @example
 * if (hasTierAccess(userTier, 'standard')) {
 *   // Show premium features
 * }
 */
export function hasTierAccess(userTier: TierLevel | null, requiredTier: TierLevel): boolean {
  if (!userTier) {
    return requiredTier === 'free';
  }

  const userLevel = getTierLevel(userTier);
  const requiredLevel = getTierLevel(requiredTier);

  return userLevel >= requiredLevel;
}

/**
 * Construct UserTier object from tier string
 *
 * @param tier - Tier level
 * @returns Full UserTier object
 */
export function createUserTier(
  tier: TierLevel,
  expiresAt: string | null = null,
  subscriptionType: 'monthly' | 'annual' | null = null
): UserTier {
  return {
    tier,
    expiresAt,
    isActive: true,
    subscriptionType,
  };
}

/**
 * Check if tier subscription is expired
 *
 * @param tierInfo - User tier information
 * @returns True if expired
 */
export function isTierExpired(tierInfo: UserTier): boolean {
  if (!tierInfo.expiresAt) {
    return false; // No expiration
  }

  const expiryDate = new Date(tierInfo.expiresAt);
  return new Date() > expiryDate;
}

/**
 * Format tier name for display
 *
 * @param tier - Tier level
 * @returns Display name
 */
export function formatTierName(tier: TierLevel): string {
  const names: Record<TierLevel, string> = {
    free: 'Free',
    standard: 'Standard',
    enterprise: 'Enterprise',
  };

  return names[tier];
}
