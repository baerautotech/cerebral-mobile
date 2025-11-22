/**
 * Combined Guards Integration Tests
 * Tests scenarios where FeatureFlagGuard and TierGuard are nested
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { FeatureFlagGuard } from '../../src/components/FeatureFlagGuard';
import { TierGuard } from '../../src/components/TierGuard';
import { useFeatureFlagContext } from '../../src/providers/FeatureFlagProvider';
import { useTierContext } from '../../src/providers/TierProvider';

// Mock the context hooks
jest.mock('../../src/providers/FeatureFlagProvider', () => ({
  useFeatureFlagContext: jest.fn(),
  FeatureFlagProvider: ({ children }: any) => children,
}));

jest.mock('../../src/providers/TierProvider', () => ({
  useTierContext: jest.fn(),
  TierProvider: ({ children }: any) => children,
}));

const MockFeatureFlagContext = useFeatureFlagContext as jest.MockedFunction<typeof useFeatureFlagContext>;
const MockTierContext = useTierContext as jest.MockedFunction<typeof useTierContext>;

describe('Combined Guards Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FeatureFlagGuard wrapped in TierGuard', () => {
    it('should render when both flag enabled and tier sufficient', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeTruthy();
      });
    });

    it('should NOT render when flag disabled (tier sufficient)', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: false },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });

    it('should NOT render when tier insufficient (flag enabled)', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'standard',
        hasTier: (required: string) => {
          const hierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
          return hierarchy.standard >= hierarchy[required];
        },
        loading: false,
      });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });

    it('should NOT render when both flag disabled and tier insufficient', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: false },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'free',
        hasTier: (required: string) => required === 'free',
        loading: false,
      });

      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <FeatureFlagGuard flag="ar_mode">
            <Text>AR Content</Text>
          </FeatureFlagGuard>
        </TierGuard>
      );

      await waitFor(() => {
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });
  });

  describe('TierGuard wrapped in FeatureFlagGuard', () => {
    it('should render when flag enabled and tier sufficient', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ai_suggestions: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <Text>AI Content</Text>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('AI Content')).toBeTruthy();
      });
    });

    it('should NOT render when flag disabled', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ai_suggestions: false },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <Text>AI Content</Text>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('AI Content')).toBeFalsy();
      });
    });

    it('should NOT render when tier insufficient', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ai_suggestions: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'standard',
        hasTier: (required: string) => {
          const hierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
          return hierarchy.standard >= hierarchy[required];
        },
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <Text>AI Content</Text>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('AI Content')).toBeFalsy();
      });
    });
  });

  describe('Multiple nested guards', () => {
    it('should handle deeply nested guards', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { feature1: true, feature2: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="feature1">
          <TierGuard tier="standard">
            <FeatureFlagGuard flag="feature2">
              <TierGuard tier="enterprise">
                <Text>Deeply Nested Content</Text>
              </TierGuard>
            </FeatureFlagGuard>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('Deeply Nested Content')).toBeTruthy();
      });
    });

    it('should block when any guard fails', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { feature1: true, feature2: false }, // feature2 disabled
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="feature1">
          <TierGuard tier="standard">
            <FeatureFlagGuard flag="feature2">
              <TierGuard tier="enterprise">
                <Text>Deeply Nested Content</Text>
              </TierGuard>
            </FeatureFlagGuard>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('Deeply Nested Content')).toBeFalsy();
      });
    });
  });

  describe('Fallback chains', () => {
    it('should render outermost fallback when outer guard blocks', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: false }, // Disabled
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ar_mode" fallback={<Text>AR Not Available</Text>}>
          <TierGuard tier="enterprise" fallback={<Text>Upgrade Required</Text>}>
            <Text>AR Content</Text>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('AR Not Available')).toBeTruthy();
        expect(queryByText('Upgrade Required')).toBeFalsy();
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });

    it('should render inner fallback when inner guard blocks', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: true }, // Enabled
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'standard', // Insufficient tier
        hasTier: (required: string) => {
          const hierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
          return hierarchy.standard >= hierarchy[required];
        },
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ar_mode" fallback={<Text>AR Not Available</Text>}>
          <TierGuard tier="enterprise" fallback={<Text>Upgrade Required</Text>}>
            <Text>AR Content</Text>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('Upgrade Required')).toBeTruthy();
        expect(queryByText('AR Not Available')).toBeFalsy();
        expect(queryByText('AR Content')).toBeFalsy();
      });
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle AR View gate (flag + enterprise)', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ar_mode: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ar_mode">
          <TierGuard tier="enterprise">
            <View>
              <Text>AR View Screen</Text>
              <Text>3D Model Viewer</Text>
              <Text>AR Debugging Tools</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('AR View Screen')).toBeTruthy();
        expect(queryByText('3D Model Viewer')).toBeTruthy();
        expect(queryByText('AR Debugging Tools')).toBeTruthy();
      });
    });

    it('should handle AI suggestions gate (flag + enterprise)', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { ai_suggestions: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <View>
              <Text>AI-Powered Task Suggestions</Text>
              <Text>Smart Task Categorization</Text>
              <Text>Predictive Reminders</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('AI-Powered Task Suggestions')).toBeTruthy();
        expect(queryByText('Smart Task Categorization')).toBeTruthy();
        expect(queryByText('Predictive Reminders')).toBeTruthy();
      });
    });

    it('should handle workflow automation gate (flag + enterprise)', async () => {
      MockFeatureFlagContext.mockReturnValue({
        flags: { workflow_automation: true },
        loading: false,
        refresh: jest.fn(),
        lastUpdated: Date.now(),
      });

      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true,
        loading: false,
      });

      const { queryByText } = render(
        <FeatureFlagGuard flag="workflow_automation">
          <TierGuard tier="enterprise">
            <View>
              <Text>Automation Rules</Text>
              <Text>Create Custom Workflows</Text>
              <Text>Schedule Task Actions</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>
      );

      await waitFor(() => {
        expect(queryByText('Automation Rules')).toBeTruthy();
        expect(queryByText('Create Custom Workflows')).toBeTruthy();
        expect(queryByText('Schedule Task Actions')).toBeTruthy();
      });
    });
  });
});

