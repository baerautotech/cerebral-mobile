/**
 * IAPProvider Component
 *
 * React Context provider for in-app purchase functionality
 */

import React, { createContext, useEffect } from 'react';
import { useIAP } from '../hooks/useIAP';
import { initializeIAP } from '../services/iap';
import { IAPContextType, IAPProviderProps } from '../types/iap';

/**
 * IAP Context
 */
export const IAPContext = createContext<IAPContextType | null>(null);

/**
 * IAPProvider Component
 *
 * Provides in-app purchase functionality to entire app
 * Initializes RevenueCat on mount
 *
 * @param {Object} props
 * @param {string} props.apiKey - RevenueCat SDK key
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider wrapper
 *
 * @example
 * <IAPProvider apiKey="your_revenuecat_key">
 *   <App />
 * </IAPProvider>
 */
export function IAPProvider({ apiKey, children }: IAPProviderProps): JSX.Element {
  const {
    purchasedSKUs,
    loading,
    customerInfo,
    initiateCheckout,
    restorePurchases,
    refresh,
    hasPurchase,
  } = useIAP();

  // Initialize IAP on mount
  useEffect(() => {
    initializeIAP(apiKey).catch((error) => {
      console.error('Failed to initialize IAP:', error);
    });
  }, [apiKey]);

  const value: IAPContextType = {
    purchasedSKUs,
    loading,
    customerInfo,
    initiateCheckout,
    restorePurchases,
    refresh,
    hasPurchase,
  };

  return <IAPContext.Provider value={value}>{children}</IAPContext.Provider>;
}

/**
 * Hook to access IAP context
 *
 * @returns {IAPContextType} IAP context
 * @throws {Error} If used outside IAPProvider
 */
export function useIAPContext(): IAPContextType {
  const context = React.useContext(IAPContext);

  if (!context) {
    throw new Error('useIAPContext must be used within IAPProvider');
  }

  return context;
}
