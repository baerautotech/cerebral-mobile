/**
 * useIAP Hook
 * 
 * React hook for managing in-app purchases
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerInfo,
  getActivePurchasedSKUs,
  hasPurchased,
  purchaseSKU,
  restorePurchases as restorePurchasesService,
} from '../services/iap';
import { CustomerInfo } from '../types/iap';

/**
 * useIAP Hook
 * 
 * Manages IAP state and provides purchase functionality
 * 
 * @returns {Object} IAP state and methods
 * @returns {string[]} purchasedSKUs - Array of purchased SKU identifiers
 * @returns {boolean} loading - Whether data is loading
 * @returns {CustomerInfo | null} customerInfo - Full customer information
 * @returns {Function} initiateCheckout - Start purchase flow for SKU
 * @returns {Function} restorePurchases - Restore previous purchases
 * @returns {Function} refresh - Refresh purchase status
 * @returns {Function} hasPurchase - Check if SKU is purchased
 * 
 * @example
 * const { purchasedSKUs, initiateCheckout } = useIAP();
 * 
 * if (purchasedSKUs.includes('premium_monthly')) {
 *   return <PremiumFeature />;
 * }
 * 
 * return <PurchaseButton onPress={() => initiateCheckout('premium_monthly')} />;
 */
export function useIAP() {
  const [purchasedSKUs, setPurchasedSKUs] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Refresh purchase status from backend
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      
      if (info) {
        const skus = getActivePurchasedSKUs(info);
        setPurchasedSKUs(skus);
        console.log('Purchased SKUs:', skus);
      }
    } catch (error) {
      console.error('Error refreshing IAP:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load purchases on mount
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Initiate purchase for a SKU
   */
  const initiateCheckout = useCallback(
    async (sku: string) => {
      try {
        console.log(`Starting purchase flow for: ${sku}`);
        const result = await purchaseSKU(sku);
        
        if (result.success) {
          // Refresh purchases after successful purchase
          await refresh();
          console.log(`Purchase successful: ${sku}`);
        } else {
          console.warn(`Purchase failed: ${result.error}`);
        }
        
        return result;
      } catch (error) {
        console.error('Error during checkout:', error);
        return {
          success: false,
          error: String(error),
          sku,
        };
      }
    },
    [refresh]
  );

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async () => {
    try {
      console.log('Restoring purchases...');
      const info = await restorePurchasesService();
      
      if (info) {
        setCustomerInfo(info);
        const skus = getActivePurchasedSKUs(info);
        setPurchasedSKUs(skus);
        console.log('Purchases restored:', skus);
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  }, []);

  /**
   * Check if specific SKU is purchased
   */
  const hasPurchaseOf = useCallback(
    (sku: string): boolean => {
      return hasPurchased(customerInfo, sku);
    },
    [customerInfo]
  );

  return {
    purchasedSKUs,
    loading,
    customerInfo,
    initiateCheckout,
    restorePurchases,
    refresh,
    hasPurchase: hasPurchaseOf,
  };
}

