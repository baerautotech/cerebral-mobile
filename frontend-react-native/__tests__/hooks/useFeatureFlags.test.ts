/**
 * useFeatureFlags Hook Tests
 *
 * Tests for feature flag fetching, caching, and offline support
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFeatureFlags } from '../../src/hooks/useFeatureFlags';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock fetch
global.fetch = jest.fn();

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('loads flags from backend on startup', async () => {
    const mockFlags = { ai_features: true, beta_ui: false };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlags,
    });

    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFeatureFlags());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toEqual(mockFlags);
    expect(global.fetch).toHaveBeenCalledWith('/api/flags', expect.any(Object));
  });

  test('caches flags in AsyncStorage', async () => {
    const mockFlags = { ai_features: true };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlags,
    });

    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'cerebral_feature_flags',
      JSON.stringify(mockFlags)
    );

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'cerebral_feature_flags_time',
      expect.any(String)
    );
  });

  test('uses fresh cache without calling backend', async () => {
    const mockFlags = { ai_features: true };
    const recentTime = Date.now() - 60 * 1000; // 1 minute ago

    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'cerebral_feature_flags') {
        return Promise.resolve(JSON.stringify(mockFlags));
      }
      if (key === 'cerebral_feature_flags_time') {
        return Promise.resolve(recentTime.toString());
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toEqual(mockFlags);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fetches fresh flags when cache is stale', async () => {
    const oldFlags = { ai_features: false };
    const newFlags = { ai_features: true };
    const oldTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago (stale)

    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'cerebral_feature_flags') {
        return Promise.resolve(JSON.stringify(oldFlags));
      }
      if (key === 'cerebral_feature_flags_time') {
        return Promise.resolve(oldTime.toString());
      }
      return Promise.resolve(null);
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => newFlags,
    });

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toEqual(newFlags);
    expect(global.fetch).toHaveBeenCalled();
  });

  test('falls back to cache when offline', async () => {
    const cachedFlags = { ai_features: true };

    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'cerebral_feature_flags') {
        return Promise.resolve(JSON.stringify(cachedFlags));
      }
      if (key === 'cerebral_feature_flags_time') {
        return Promise.resolve((Date.now() - 10 * 60 * 1000).toString());
      }
      return Promise.resolve(null);
    });

    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should still have cached flags
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

    // Mock updated flags for refresh
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedFlags,
    });

    // Call refresh
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

    // Should have empty flags
    expect(result.current.flags).toEqual({});
  });
});
