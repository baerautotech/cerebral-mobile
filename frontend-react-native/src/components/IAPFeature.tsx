/**
 * IAPFeature Component
 *
 * Conditionally renders content based on in-app purchase status
 */

import React, { ReactNode } from 'react';
import { useIAP } from '../hooks/useIAP';
import { IAPFeatureProps, SKU_CONFIGS } from '../types/iap';
import { UpgradeCTA } from './UpgradeCTA';

/**
 * IAPFeature Component
 *
 * Wraps content behind an in-app purchase requirement
 * Shows purchase prompt if user hasn't purchased the SKU
 *
 * @param {string} sku - Required SKU for this feature
 * @param {ReactNode} children - Content to show if user has purchased
 * @param {ReactNode} [fallback] - Optional custom UI if user hasn't purchased
 * @returns {ReactNode} Content or purchase prompt
 *
 * @example
 * // Show premium analytics only to subscribers
 * <IAPFeature sku="analytics_addon">
 *   <AdvancedAnalytics />
 * </IAPFeature>
 *
 * @example
 * // With custom fallback
 * <IAPFeature
 *   sku="premium_monthly"
 *   fallback={<Text>Subscribe for premium features</Text>}
 * >
 *   <PremiumContent />
 * </IAPFeature>
 */
export function IAPFeature({ sku, children, fallback }: IAPFeatureProps): ReactNode {
  const { purchasedSKUs, loading, initiateCheckout } = useIAP();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Check if user has purchased this SKU
  const hasPurchase = purchasedSKUs.includes(sku);

  if (hasPurchase) {
    return <>{children}</>;
  }

  // Show fallback or default purchase prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: Show upgrade CTA
  const skuConfig = SKU_CONFIGS[sku];
  const message = skuConfig
    ? `Unlock ${skuConfig.name} for ${skuConfig.price}${
        skuConfig.billingPeriod === 'monthly' ? '/month' : '/year'
      }`
    : 'Unlock premium features';

  return (
    <UpgradeCTA
      sku={sku}
      message={message}
      buttonText="Subscribe Now"
      onPress={() => {
        console.log(`Initiating purchase for ${sku}`);
        initiateCheckout(sku);
      }}
    />
  );
}
