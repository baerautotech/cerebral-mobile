/**
 * FeatureFlagProvider Component
 * 
 * React Context provider for feature flags
 * Wraps the app and makes feature flags accessible throughout the component tree
 */

import React, { ReactNode, createContext } from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { FeatureFlagContextType, FeatureFlagProviderProps } from '../types/featureFlags';

/**
 * Feature Flag Context
 * 
 * Provides access to:
 * - flags: Current feature flags
 * - loading: Whether flags are loading
 * - refresh: Function to manually refresh flags
 * - lastUpdated: Timestamp of last update
 */
export const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

/**
 * FeatureFlagProvider Component
 * 
 * Wraps your application and provides feature flags context
 * 
 * @param {Object} props - Provider props
 * @param {ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Context provider wrapper
 * 
 * @example
 * // In your App.tsx
 * import { FeatureFlagProvider } from './providers/FeatureFlagProvider';
 * 
 * export function App() {
 *   return (
 *     <FeatureFlagProvider>
 *       <YourApp />
 *     </FeatureFlagProvider>
 *   );
 * }
 */
export function FeatureFlagProvider({ children }: FeatureFlagProviderProps): JSX.Element {
  const { flags, loading, refresh, lastUpdated } = useFeatureFlags();

  // Create the context value
  const value: FeatureFlagContextType = {
    flags,
    loading,
    refresh,
    lastUpdated,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access feature flag context
 * 
 * Must be used within FeatureFlagProvider
 * 
 * @returns {FeatureFlagContextType} Feature flag context
 * @throws Error if used outside FeatureFlagProvider
 * 
 * @example
 * function MyComponent() {
 *   const { flags, refresh } = useContext(FeatureFlagContext)!;
 *   
 *   return (
 *     <View>
 *       {flags.my_feature && <Text>Feature enabled!</Text>}
 *       <Button onPress={refresh} title="Refresh" />
 *     </View>
 *   );
 * }
 */
export function useFeatureFlagContext(): FeatureFlagContextType {
  const context = React.useContext(FeatureFlagContext);
  
  if (!context) {
    throw new Error(
      'useFeatureFlagContext must be used within FeatureFlagProvider'
    );
  }
  
  return context;
}

