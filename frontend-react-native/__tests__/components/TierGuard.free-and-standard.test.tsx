/**
 * TierGuard Component Tests (free + standard)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { TierGuard } from '../../src/components/TierGuard';
import { mockTier } from '../testUtils/guardMocks';

describe('TierGuard (free tier user)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTier({ tier: 'free', hasTier: required => required === 'free' });
  });

  it('renders children for free requirement', () => {
    const { queryByText } = render(
      <TierGuard tier="free">
        <Text>Free Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Free Content')).toBeTruthy();
  });

  it('does not render children for standard requirement', () => {
    const { queryByText } = render(
      <TierGuard tier="standard">
        <Text>Standard Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Standard Content')).toBeFalsy();
  });

  it('renders fallback when provided', () => {
    const { queryByText } = render(
      <TierGuard tier="standard" fallback={<Text>Upgrade Required</Text>}>
        <Text>Premium Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Upgrade Required')).toBeTruthy();
    expect(queryByText('Premium Content')).toBeFalsy();
  });
});

describe('TierGuard (standard tier user)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTier({ tier: 'standard' });
  });

  it('renders children for standard requirement', () => {
    const { queryByText } = render(
      <TierGuard tier="standard">
        <Text>Standard Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Standard Content')).toBeTruthy();
  });

  it('does not render children for enterprise requirement', () => {
    const { queryByText } = render(
      <TierGuard tier="enterprise">
        <Text>Enterprise Content</Text>
      </TierGuard>,
    );

    expect(queryByText('Enterprise Content')).toBeFalsy();
  });
});
