/**
 * Tier System Type Definitions
 * 
 * Defines types for user tiers and tier-based access control
 */

/**
 * Valid tier levels in the system
 * free < standard < enterprise (hierarchy)
 */
export type TierLevel = 'free' | 'standard' | 'enterprise';

/**
 * Tier information for a user
 */
export interface UserTier {
  /** Current tier level */
  tier: TierLevel;
  
  /** When the tier expires (ISO string), null if no expiry */
  expiresAt: string | null;
  
  /** Whether the tier is currently active */
  isActive: boolean;
  
  /** Tier subscription type if applicable */
  subscriptionType?: 'monthly' | 'annual' | null;
}

/**
 * Tier configuration with display info
 */
export interface TierConfig {
  /** Tier identifier */
  id: TierLevel;
  
  /** Display name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Price (empty for free tier) */
  price: string;
  
  /** Billing period (empty for free tier) */
  billingPeriod?: string;
  
  /** Tier hierarchy level (0=free, 1=standard, 2=enterprise) */
  level: number;
  
  /** Features included in this tier */
  features: string[];
}

/**
 * Props for TierGuard component
 */
export interface TierGuardProps {
  /** Required tier level to show content */
  tier: TierLevel;
  
  /** Content to show if user has sufficient tier */
  children: React.ReactNode;
  
  /** Content to show if user doesn't have sufficient tier */
  fallback?: React.ReactNode;
}

/**
 * Tier context type
 */
export interface TierContextType {
  /** Current user tier */
  tier: TierLevel | null;
  
  /** Full user tier information */
  tierInfo: UserTier | null;
  
  /** Whether tier is loading */
  loading: boolean;
  
  /** Refresh tier from backend */
  refresh: () => Promise<void>;
  
  /** Check if user has at least the specified tier */
  hasTier: (requiredTier: TierLevel) => boolean;
}

/**
 * Props for TierProvider
 */
export interface TierProviderProps {
  /** Child components */
  children: React.ReactNode;
}

/**
 * Tier hierarchy mapping
 */
export const TIER_HIERARCHY: Record<TierLevel, number> = {
  free: 0,
  standard: 1,
  enterprise: 2,
};

/**
 * Tier configurations
 */
export const TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    price: 'Free',
    level: 0,
    features: [
      'Dashboard access',
      'Basic task management',
      'Search',
      'Community support',
    ],
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'For growing teams',
    price: '$9.99',
    billingPeriod: '/month',
    level: 1,
    features: [
      'Everything in Free',
      'Advanced analytics',
      'Custom reports',
      'Data export',
      'Email support',
      'Team collaboration',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: '$49.99',
    billingPeriod: '/month',
    level: 2,
    features: [
      'Everything in Standard',
      'AI-powered insights',
      'Custom integrations',
      'Team management',
      'Custom branding',
      'API access',
      'Priority support',
      'Audit logs',
    ],
  },
};

