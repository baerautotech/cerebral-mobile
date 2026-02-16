/**
 * Combined Guards Integration Tests (Nested + real-world)
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { FeatureFlagGuard } from '../../src/components/FeatureFlagGuard';
import { TierGuard } from '../../src/components/TierGuard';
import { mockFeatureFlags, mockTier } from '../testUtils/guardMocks';

describe('Combined Guards (nested)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Multiple nested guards', () => {
    it('renders when all guards pass', async () => {
      mockFeatureFlags({ feature1: true, feature2: true });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="feature1">
          <TierGuard tier="standard">
            <FeatureFlagGuard flag="feature2">
              <TierGuard tier="enterprise">
                <Text>Deeply Nested Content</Text>
              </TierGuard>
            </FeatureFlagGuard>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('Deeply Nested Content')).toBeTruthy();
      });
    });

    it('blocks when any guard fails', async () => {
      mockFeatureFlags({ feature1: true, feature2: false });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="feature1">
          <TierGuard tier="standard">
            <FeatureFlagGuard flag="feature2">
              <TierGuard tier="enterprise">
                <Text>Deeply Nested Content</Text>
              </TierGuard>
            </FeatureFlagGuard>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('Deeply Nested Content')).toBeFalsy();
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('handles AR View gate (flag + enterprise)', async () => {
      mockFeatureFlags({ ar_mode: true });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ar_mode">
          <TierGuard tier="enterprise">
            <View>
              <Text>AR View Screen</Text>
              <Text>3D Model Viewer</Text>
              <Text>AR Debugging Tools</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AR View Screen')).toBeTruthy();
        expect(queryByText('3D Model Viewer')).toBeTruthy();
        expect(queryByText('AR Debugging Tools')).toBeTruthy();
      });
    });

    it('handles AI suggestions gate (flag + enterprise)', async () => {
      mockFeatureFlags({ ai_suggestions: true });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <View>
              <Text>AI-Powered Task Suggestions</Text>
              <Text>Smart Task Categorization</Text>
              <Text>Predictive Reminders</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('AI-Powered Task Suggestions')).toBeTruthy();
        expect(queryByText('Smart Task Categorization')).toBeTruthy();
        expect(queryByText('Predictive Reminders')).toBeTruthy();
      });
    });

    it('handles workflow automation gate (flag + enterprise)', async () => {
      mockFeatureFlags({ workflow_automation: true });
      mockTier({ tier: 'enterprise' });

      const { queryByText } = render(
        <FeatureFlagGuard flag="workflow_automation">
          <TierGuard tier="enterprise">
            <View>
              <Text>Automation Rules</Text>
              <Text>Create Custom Workflows</Text>
              <Text>Schedule Task Actions</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>,
      );

      await waitFor(() => {
        expect(queryByText('Automation Rules')).toBeTruthy();
        expect(queryByText('Create Custom Workflows')).toBeTruthy();
        expect(queryByText('Schedule Task Actions')).toBeTruthy();
      });
    });
  });
});
