/**
 * Combined Guards Integration Tests
 * Tests scenarios where FeatureFlagGuard and TierGuard are nested
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FeatureFlagGuard } from '../../src/components/FeatureFlagGuard';
import { TierGuard } from '../../src/components/TierGuard';
import { mockFeatureFlags, mockTier } from '../testUtils/guardMocks';

describe('Combined Guards Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FeatureFlagGuard wrapped in TierGuard', () => {
    it('should render when both flag enabled and tier sufficient', async () => {
      mockFeatureFlags({ ar_mode: true });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeTruthy();
      });
    });

    it('should NOT render when flag disabled (tier sufficient)', async () => {
      mockFeatureFlags({ ar_mode: false });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });

    it('should NOT render when tier insufficient (flag enabled)', async () => {
      mockFeatureFlags({ ar_mode: true });
      mockTier({ tier: 'standard' });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });

    it('should NOT render when both flag disabled and tier insufficient', async () => {
      mockFeatureFlags({ ar_mode: false });
      mockTier({ tier: 'free', hasTier: required => required === 'free' });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });
  });

  describe('TierGuard wrapped in FeatureFlagGuard', () => {
    it('should render when flag enabled and tier sufficient', async () => {
      mockFeatureFlags({ ai_suggestions: true });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <Text>AI Content</Text>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AI Content')).toBeTruthy();
      });
    });

    it('should NOT render when flag disabled', async () => {
      mockFeatureFlags({ ai_suggestions: false });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <Text>AI Content</Text>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AI Content')).toBeFalsy();
      });
    });

    it('should NOT render when tier insufficient', async () => {
      mockFeatureFlags({ ai_suggestions: true });
      mockTier({ tier: 'standard' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <Text>AI Content</Text>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AI Content')).toBeFalsy();
      });
    });
  });
});
