/**
 * Combined Guards Integration Tests (Fallback chains)
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FeatureFlagGuard } from '../../src/components/FeatureFlagGuard';
import { TierGuard } from '../../src/components/TierGuard';
import { mockFeatureFlags, mockTier } from '../testUtils/guardMocks';

describe('Combined Guards (fallback chains)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders outer fallback when outer guard blocks', async () => {
    mockFeatureFlags({ ar_mode: false });
    mockTier({ tier: 'enterprise' });

    const { queryByText } = render(
      <FeatureFlagGuard flag="ar_mode" fallback={<Text>AR Not Available</Text>}>
        <TierGuard tier="enterprise" fallback={<Text>Upgrade Required</Text>}>
          <Text>AR Content</Text>
        </TierGuard>
      </FeatureFlagGuard>,
    );

    await waitFor(() => {
      expect(queryByText('AR Not Available')).toBeTruthy();
      expect(queryByText('Upgrade Required')).toBeFalsy();
      expect(queryByText('AR Content')).toBeFalsy();
    });
  });

  it('renders inner fallback when inner guard blocks', async () => {
    mockFeatureFlags({ ar_mode: true });
    mockTier({ tier: 'standard' });

    const { queryByText } = render(
      <FeatureFlagGuard flag="ar_mode" fallback={<Text>AR Not Available</Text>}>
        <TierGuard tier="enterprise" fallback={<Text>Upgrade Required</Text>}>
          <Text>AR Content</Text>
        </TierGuard>
      </FeatureFlagGuard>,
    );

    await waitFor(() => {
      expect(queryByText('Upgrade Required')).toBeTruthy();
      expect(queryByText('AR Not Available')).toBeFalsy();
      expect(queryByText('AR Content')).toBeFalsy();
    });
  });
});
