/**
 * useFeatureFlags Hook Tests (resilience)
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFeatureFlags } from '../../src/hooks/useFeatureFlags';

jest.mock('@react-native-async-storage/async-storage');

global.fetch = jest.fn();

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useFeatureFlags (resilience)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('falls back to cache when offline', async () => {
    const cachedFlags = { ai_features: true };

    mockAsyncStorage.getItem.mockImplementation(key => {
      if (key === 'cerebral_feature_flags')
        return Promise.resolve(JSON.stringify(cachedFlags));
      if (key === 'cerebral_feature_flags_time')
        return Promise.resolve((Date.now() - 10 * 60 * 1000).toString());
      return Promise.resolve(null);
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toEqual(cachedFlags);
  });

  test('refresh function fetches new flags', async () => {
    const initialFlags = { ai_features: false };
    const updatedFlags = { ai_features: true };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => initialFlags,
    });
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toEqual(initialFlags);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedFlags,
    });

    result.current.refresh();

    await waitFor(() => {
      expect(result.current.flags).toEqual(updatedFlags);
    });
  });

  test('returns lastUpdated timestamp', async () => {
    const mockFlags = { ai_features: true };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlags,
    });
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const beforeTest = Date.now();
    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.lastUpdated).toBeGreaterThanOrEqual(beforeTest);
    expect(result.current.lastUpdated).toBeLessThanOrEqual(Date.now());
  });

  test('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toEqual({});
  });
});
