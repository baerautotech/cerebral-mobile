/**
 * TierGuard Component Tests
 * Tests tier-based access control component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TierGuard } from '../../src/components/TierGuard';
import { useTierContext } from '../../src/providers/TierProvider';

// Mock the tier context hook
jest.mock('../../src/providers/TierProvider', () => ({
  useTierContext: jest.fn(),
  TierProvider: ({ children }: any) => children,
}));

const MockTierContext = useTierContext as jest.MockedFunction<typeof useTierContext>;

describe('TierGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Free Tier User', () => {
    beforeEach(() => {
      MockTierContext.mockReturnValue({
        tier: 'free',
        hasTier: (required: string) => required === 'free',
        loading: false,
      });
    });

    it('should render children for free tier requirement', () => {
      const { queryByText } = render(
        <TierGuard tier="free">
          <Text>Free Content</Text>
        </TierGuard>
      );

      expect(queryByText('Free Content')).toBeTruthy();
    });

    it('should NOT render children for standard tier requirement', () => {
      const { queryByText } = render(
        <TierGuard tier="standard">
          <Text>Standard Content</Text>
        </TierGuard>
      );

      expect(queryByText('Standard Content')).toBeFalsy();
    });

    it('should NOT render children for enterprise tier requirement', () => {
      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <Text>Enterprise Content</Text>
        </TierGuard>
      );

      expect(queryByText('Enterprise Content')).toBeFalsy();
    });

    it('should render fallback when provided', () => {
      const { queryByText } = render(
        <TierGuard tier="standard" fallback={<Text>Upgrade Required</Text>}>
          <Text>Premium Content</Text>
        </TierGuard>
      );

      expect(queryByText('Upgrade Required')).toBeTruthy();
      expect(queryByText('Premium Content')).toBeFalsy();
    });
  });

  describe('Standard Tier User', () => {
    beforeEach(() => {
      MockTierContext.mockReturnValue({
        tier: 'standard',
        hasTier: (required: string) => {
          const hierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
          return hierarchy.standard >= hierarchy[required];
        },
        loading: false,
      });
    });

    it('should render children for free tier requirement', () => {
      const { queryByText } = render(
        <TierGuard tier="free">
          <Text>Free Content</Text>
        </TierGuard>
      );

      expect(queryByText('Free Content')).toBeTruthy();
    });

    it('should render children for standard tier requirement', () => {
      const { queryByText } = render(
        <TierGuard tier="standard">
          <Text>Standard Content</Text>
        </TierGuard>
      );

      expect(queryByText('Standard Content')).toBeTruthy();
    });

    it('should NOT render children for enterprise tier requirement', () => {
      const { queryByText } = render(
        <TierGuard tier="enterprise">
          <Text>Enterprise Content</Text>
        </TierGuard>
      );

      expect(queryByText('Enterprise Content')).toBeFalsy();
    });
  });

  describe('Enterprise Tier User', () => {
    beforeEach(() => {
      MockTierContext.mockReturnValue({
        tier: 'enterprise',
        hasTier: () => true, // Enterprise has access to everything
        loading: false,
      });
    });

    it('should render children for all tier requirements', () => {
      const tiers: Array<'free' | 'standard' | 'enterprise'> = ['free', 'standard', 'enterprise'];

      tiers.forEach((tier) => {
        const { queryByText } = render(
          <TierGuard tier={tier}>
            <Text>{`${tier} Content`}</Text>
          </TierGuard>
        );

        expect(queryByText(`${tier} Content`)).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should NOT render during loading', () => {
      MockTierContext.mockReturnValue({
        tier: 'free',
        hasTier: jest.fn(),
        loading: true,
      });

      const { queryByText } = render(
        <TierGuard tier="free">
          <Text>Content</Text>
        </TierGuard>
      );

      expect(queryByText('Content')).toBeFalsy();
    });

    it('should render after loading completes', () => {
      MockTierContext.mockReturnValue({
        tier: 'free',
        hasTier: (required: string) => required === 'free',
        loading: false,
      });

      const { queryByText } = render(
        <TierGuard tier="free">
          <Text>Content</Text>
        </TierGuard>
      );

      expect(queryByText('Content')).toBeTruthy();
    });
  });

  describe('Fallback Behavior', () => {
    beforeEach(() => {
      MockTierContext.mockReturnValue({
        tier: 'free',
        hasTier: (required: string) => required === 'free',
        loading: false,
      });
    });

    it('should render null when access denied and no fallback', () => {
      const { container } = render(
        <TierGuard tier="standard">
          <Text>Premium Content</Text>
        </TierGuard>
      );

      expect(container.children.length).toBe(0);
    });

    it('should render fallback when access denied', () => {
      const { queryByText } = render(
        <TierGuard tier="standard" fallback={<Text>Upgrade Your Plan</Text>}>
          <Text>Premium Content</Text>
        </TierGuard>
      );

      expect(queryByText('Upgrade Your Plan')).toBeTruthy();
      expect(queryByText('Premium Content')).toBeFalsy();
    });

    it('should not render fallback when access granted', () => {
      const { queryByText } = render(
        <TierGuard tier="free" fallback={<Text>Upgrade Your Plan</Text>}>
          <Text>Free Content</Text>
        </TierGuard>
      );

      expect(queryByText('Free Content')).toBeTruthy();
      expect(queryByText('Upgrade Your Plan')).toBeFalsy();
    });
  });

  describe('Multiple Children', () => {
    beforeEach(() => {
      MockTierContext.mockReturnValue({
        tier: 'standard',
        hasTier: (required: string) => {
          const hierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
          return hierarchy.standard >= hierarchy[required];
        },
        loading: false,
      });
    });

    it('should render multiple children when access granted', () => {
      const { queryByText } = render(
        <TierGuard tier="standard">
          <Text>Feature 1</Text>
          <Text>Feature 2</Text>
          <Text>Feature 3</Text>
        </TierGuard>
      );

      expect(queryByText('Feature 1')).toBeTruthy();
      expect(queryByText('Feature 2')).toBeTruthy();
      expect(queryByText('Feature 3')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid tier changes', () => {
      // Start as free
      MockTierContext.mockReturnValue({
        tier: 'free',
        hasTier: (required: string) => required === 'free',
        loading: false,
      });

      const { rerender, queryByText: queryFree } = render(
        <TierGuard tier="standard">
          <Text>Standard Content</Text>
        </TierGuard>
      );

      expect(queryFree('Standard Content')).toBeFalsy();

      // Upgrade to standard
      MockTierContext.mockReturnValue({
        tier: 'standard',
        hasTier: (required: string) => {
          const hierarchy: Record<string, number> = { free: 0, standard: 1, enterprise: 2 };
          return hierarchy.standard >= hierarchy[required];
        },
        loading: false,
      });

      rerender(
        <TierGuard tier="standard">
          <Text>Standard Content</Text>
        </TierGuard>
      );

      expect(queryByText('Standard Content')).toBeTruthy();
    });
  });
});

