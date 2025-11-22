/**
 * FeatureFlagGuard Component Tests
 *
 * Tests for conditional rendering based on feature flags
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { FeatureFlagGuard } from '../../src/components/FeatureFlagGuard';

// Mock the useFeatureFlags hook
jest.mock('../../src/hooks/useFeatureFlags', () => ({
  useFeatureFlags: jest.fn(),
}));

import { useFeatureFlags } from '../../src/hooks/useFeatureFlags';

const mockUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>;

describe('FeatureFlagGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when flag is enabled', () => {
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: true },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    render(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.getByTestID('premium-content')).toBeTruthy();
    expect(screen.getByText('Premium Feature')).toBeTruthy();
  });

  test('does not render children when flag is disabled', () => {
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: false },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    render(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.queryByTestID('premium-content')).toBeNull();
  });

  test('renders fallback when flag is disabled and fallback provided', () => {
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: false },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    render(
      <FeatureFlagGuard
        flag="premium_features"
        fallback={<Text testID="fallback-content">Feature Disabled</Text>}
      >
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.getByTestID('fallback-content')).toBeTruthy();
    expect(screen.queryByTestID('premium-content')).toBeNull();
  });

  test('renders nothing when flag is disabled and no fallback', () => {
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: false },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    const { container } = render(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.queryByTestID('premium-content')).toBeNull();
    // Container should be empty or minimal
    expect(container.children.length).toBe(0);
  });

  test('renders nothing when loading', () => {
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: true },
      loading: true,
      refresh: jest.fn(),
      lastUpdated: 0,
    });

    const { container } = render(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.queryByTestID('premium-content')).toBeNull();
  });

  test('handles flag that does not exist in flags object', () => {
    mockUseFeatureFlags.mockReturnValue({
      flags: { other_flag: true },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    render(
      <FeatureFlagGuard flag="non_existent_flag">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    // Non-existent flag should be treated as false
    expect(screen.queryByTestID('premium-content')).toBeNull();
  });

  test('updates when flag value changes', () => {
    const { rerender } = render(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    // Initially flag is disabled
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: false },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    rerender(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.queryByTestID('premium-content')).toBeNull();

    // Now flag is enabled
    mockUseFeatureFlags.mockReturnValue({
      flags: { premium_features: true },
      loading: false,
      refresh: jest.fn(),
      lastUpdated: Date.now(),
    });

    rerender(
      <FeatureFlagGuard flag="premium_features">
        <Text testID="premium-content">Premium Feature</Text>
      </FeatureFlagGuard>
    );

    expect(screen.getByTestID('premium-content')).toBeTruthy();
  });
});
