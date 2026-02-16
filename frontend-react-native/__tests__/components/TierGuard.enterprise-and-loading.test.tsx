/**
 * TierGuard Component Tests (enterprise + loading)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { TierGuard } from '../../src/components/TierGuard';
import { MockTierContext, mockTier } from '../testUtils/guardMocks';

describe('TierGuard (enterprise tier user)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTier({ tier: 'enterprise' });
  });

  it('renders children for enterprise requirement', () => {
    const { queryByText } = render(
      <TierGuard tier="enterprise">
        <Text>Enterprise Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Enterprise Content')).toBeTruthy();
  });

  it('renders children for standard requirement', () => {
    const { queryByText } = render(
      <TierGuard tier="standard">
        <Text>Standard Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Standard Content')).toBeTruthy();
  });
});

describe('TierGuard (loading)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockTierContext.mockReturnValue({
      tier: 'free',
      hasTier: () => false,
      loading: true,
    });
  });

  it('renders nothing while loading', () => {
    const { queryByText } = render(
      <TierGuard tier="free">
        <Text>Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Content')).toBeFalsy();
  });
});
