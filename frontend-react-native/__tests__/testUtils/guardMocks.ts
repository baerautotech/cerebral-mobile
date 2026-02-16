import { useFeatureFlagContext } from '../../src/providers/FeatureFlagProvider';
import { useTierContext } from '../../src/providers/TierProvider';

// Centralize guard-provider mocks so individual test files stay SRP-sized.
jest.mock('../../src/providers/FeatureFlagProvider', () => ({
  useFeatureFlagContext: jest.fn(),
  FeatureFlagProvider: ({ children }: { children: unknown }) => children,
}));

jest.mock('../../src/providers/TierProvider', () => ({
  useTierContext: jest.fn(),
  TierProvider: ({ children }: { children: unknown }) => children,
}));

export const MockFeatureFlagContext =
  useFeatureFlagContext as jest.MockedFunction<typeof useFeatureFlagContext>;
export const MockTierContext = useTierContext as jest.MockedFunction<
  typeof useTierContext
>;

export function mockFeatureFlags(flags: Record<string, boolean>): void {
  MockFeatureFlagContext.mockReturnValue({
    flags,
    loading: false,
    refresh: jest.fn(),
    lastUpdated: Date.now(),
  });
}

export function mockTier(opts: {
  tier: 'free' | 'standard' | 'enterprise';
  hasTier?: (required: string) => boolean;
}): void {
  const { tier, hasTier } = opts;
  MockTierContext.mockReturnValue({
    tier,
    hasTier:
      hasTier ??
      ((required: string) => {
        const hierarchy: Record<string, number> = {
          free: 0,
          standard: 1,
          enterprise: 2,
        };
        return hierarchy[tier] >= hierarchy[required];
      }),
    loading: false,
  });
}
