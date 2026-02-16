import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { FeatureFlagProvider } from '../../src/providers/FeatureFlagProvider';
import { TierProvider } from '../../src/providers/TierProvider';
import { IAPProvider } from '../../src/providers/IAPProvider';

jest.mock('../../src/hooks/useFeatureFlags');
jest.mock('../../src/hooks/useUserTier');
jest.mock('../../src/hooks/useIAP');
jest.mock('../../src/hooks/useAuth');
jest.mock('../../src/services/api');

export const TestWrapper: React.FC<{
  children: React.ReactNode;
  tier?: 'free' | 'standard' | 'enterprise';
  flags?: Record<string, boolean>;
}> = ({ children, tier = 'free', flags = {} }) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useFeatureFlags } = require('../../src/hooks/useFeatureFlags');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useUserTier } = require('../../src/hooks/useUserTier');

  useFeatureFlags.mockReturnValue({
    flags,
    loading: false,
    refresh: jest.fn(),
    lastUpdated: Date.now(),
  });

  useUserTier.mockReturnValue({
    tier,
    hasTier: (requiredTier: string) => {
      const tierHierarchy: Record<string, number> = {
        free: 0,
        standard: 1,
        enterprise: 2,
      };
      return tierHierarchy[tier] >= tierHierarchy[requiredTier];
    },
    loading: false,
  });

  return (
    <NavigationContainer>
      <FeatureFlagProvider>
        <TierProvider>
          <IAPProvider apiKey="test-key">{children}</IAPProvider>
        </TierProvider>
      </FeatureFlagProvider>
    </NavigationContainer>
  );
};
