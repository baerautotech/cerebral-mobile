/**
 * In-App Purchase (IAP) Type Definitions
 *
 * Defines types for RevenueCat integration and purchase flow
 */

/**
 * Purchase status
 */
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * Supported SKU identifiers
 */
export enum IAP_SKUS {
  // Monthly subscriptions
  STANDARD_MONTHLY = 'standard_monthly',
  ENTERPRISE_MONTHLY = 'enterprise_monthly',

  // Annual subscriptions
  FAMILY_ANNUAL = 'family_annual',

  // Add-ons (optional)
  ANALYTICS_ADDON = 'analytics_addon',
}

/**
 * SKU configuration
 */
export interface SKUConfig {
  /** SKU identifier */
  id: IAP_SKUS | string;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Price display string */
  price: string;

  /** Billing period */
  billingPeriod: 'monthly' | 'annual';

  /** Tier this SKU grants (if any) */
  tierGrant?: 'standard' | 'enterprise';
}

/**
 * Purchase information
 */
export interface Purchase {
  /** Purchase ID from store */
  id: string;

  /** Product/SKU ID */
  productId: string;

  /** Purchase timestamp */
  purchaseDate: number;

  /** Expiration date (for subscriptions)*/
  expirationDate?: number;

  /** Whether purchase is active */
  isActive: boolean;

  /** Whether this is a subscription */
  isSubscription: boolean;
}

/**
 * Customer information from RevenueCat
 */
export interface CustomerInfo {
  /** Customer ID */
  customerId: string;

  /** Active purchases */
  activePurchases: Purchase[];

  /** All subscriptions */
  subscriptions: Record<string, Purchase>;

  /** Non-subscription purchases */
  nonSubscriptionPurchases: Record<string, Purchase>;
}

/**
 * IAP context type
 */
export interface IAPContextType {
  /** Currently purchased SKUs */
  purchasedSKUs: string[];

  /** Whether IAP is loading */
  loading: boolean;

  /** Customer info */
  customerInfo: CustomerInfo | null;

  /** Initiate purchase flow */
  initiateCheckout: (sku: string) => Promise<void>;

  /** Restore purchases */
  restorePurchases: () => Promise<void>;

  /** Refresh purchase status */
  refresh: () => Promise<void>;

  /** Check if specific SKU is purchased */
  hasPurchase: (sku: string) => boolean;
}

/**
 * Props for IAPProvider
 */
export interface IAPProviderProps {
  /** RevenueCat API key */
  apiKey: string;

  /** Child components */
  children: React.ReactNode;
}

/**
 * Props for IAPFeature component
 */
export interface IAPFeatureProps {
  /** SKU required for this feature */
  sku: string;

  /** Content to show if user has purchased */
  children: React.ReactNode;

  /** Content to show if user hasn't purchased */
  fallback?: React.ReactNode;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  /** Purchase success */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Purchased SKU */
  sku?: string;

  /** New tier (if applicable) */
  newTier?: 'standard' | 'enterprise';
}

/**
 * Default SKU configurations
 */
export const SKU_CONFIGS: Record<string, SKUConfig> = {
  [IAP_SKUS.STANDARD_MONTHLY]: {
    id: IAP_SKUS.STANDARD_MONTHLY,
    name: 'Standard Monthly',
    description: 'Standard features with monthly billing',
    price: '$9.99',
    billingPeriod: 'monthly',
    tierGrant: 'standard',
  },
  [IAP_SKUS.ENTERPRISE_MONTHLY]: {
    id: IAP_SKUS.ENTERPRISE_MONTHLY,
    name: 'Enterprise Monthly',
    description: 'Enterprise features with monthly billing',
    price: '$49.99',
    billingPeriod: 'monthly',
    tierGrant: 'enterprise',
  },
  [IAP_SKUS.FAMILY_ANNUAL]: {
    id: IAP_SKUS.FAMILY_ANNUAL,
    name: 'Family Annual',
    description: 'Family plan with annual billing',
    price: '$99.99',
    billingPeriod: 'annual',
    tierGrant: 'standard',
  },
};
