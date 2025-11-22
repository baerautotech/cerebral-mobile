/**
 * TierProvider Component
 * 
 * React Context provider for user tier information
 */

import React, { createContext } from 'react';
import { useUserTier } from '../hooks/useUserTier';
import { TierContextType, TierProviderProps } from '../types/tiers';

/**
 * Tier Context
 */
export const TierContext = createContext<TierContextType | null>(null);

/**
 * TierProvider Component
 * 
 * Provides tier information to entire app
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider wrapper
 */
export function TierProvider({ children }: TierProviderProps): JSX.Element {
  const { tier, tierInfo, loading, refresh, hasTier } = useUserTier();

  const value: TierContextType = {
    tier,
    tierInfo,
    loading,
    refresh,
    hasTier,
  };

  return (
    <TierContext.Provider value={value}>
      {children}
    </TierContext.Provider>
  );
}

/**
 * Hook to access tier context
 * 
 * @returns {TierContextType} Tier context
 * @throws {Error} If used outside TierProvider
 */
export function useTierContext(): TierContextType {
  const context = React.useContext(TierContext);
  
  if (!context) {
    throw new Error('useTierContext must be used within TierProvider');
  }
  
  return context;
}

