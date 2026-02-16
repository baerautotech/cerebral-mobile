/**
 * Enhanced API Client with Retry, Cache, and Monitoring
 * Production-ready API client with resilience patterns
 */

import { logApiError, logPerformance, addBreadcrumb } from './monitoring';
import { AuthService } from './supabase';
import { env } from '../config/env';
import { backendClient } from '@cerebral/core';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  cacheEnabled: boolean;
  cacheDuration: number;
}

interface CacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  cacheEnabled: true,
  cacheDuration: 60000, // 1 minute
};

class EnhancedApiClient {
  private config: ApiConfig;
  private cache: Map<string, CacheEntry>;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new Map();
  }

  /**
   * Check if request is cacheable (GET requests only)
   */
  private isCacheable(method: string): boolean {
    return this.config.cacheEnabled && method === 'GET';
  }

  /**
   * Get cached response if available and fresh
   */
  private getCached(key: string): Record<string, unknown> | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > this.config.cacheDuration) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache entry
   */
  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data: data as Record<string, unknown>,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache (call on logout or data mutations)
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Make request with retry logic
   * Note: backendClient already handles retries, but this layer adds monitoring/caching
   */
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    try {
      const startTime = performance.now();
      const method = options.method ?? 'GET';
      const body = options.body ? JSON.parse(options.body as string) : undefined;

      // Use backendClient from core
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await (backendClient as any).request(method, endpoint, body);

      const duration = performance.now() - startTime;

      // Log performance
      logPerformance({
        name: `API: ${method} ${endpoint}`,
        value: duration,
        unit: 'ms',
      });

      return { data, error: null };
    } catch (error: any) {
      // Log error
      logApiError(endpoint, options.method ?? 'GET', error.statusCode || 0, error);

      return { data: null, error: error };
    }
  }

  /**
   * Make authenticated API request
   */
  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    const method = options.method ?? 'GET';
    const cacheKey = `${method}:${endpoint}`;

    // Check cache for GET requests
    if (this.isCacheable(method)) {
      const cached = this.getCached(cacheKey);
      if (cached) {
        addBreadcrumb('Cache hit', 'api', { endpoint });
        return { data: cached as unknown as T, error: null };
      }
    }

    // Make request (backendClient handles Auth header)
    const result = await this.requestWithRetry<T>(endpoint, {
      ...options,
      method,
    });

    // Cache successful GET responses
    if (result.data && this.isCacheable(method)) {
      this.setCache(cacheKey, result.data);
    }

    // Clear cache on mutations
    if (result.data && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      this.clearCache();
    }

    return result;
  }

  /**
   * GET request
   */
  public async get<T>(
    endpoint: string
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  public async post<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(
    endpoint: string
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const ApiClient = new EnhancedApiClient();

export default ApiClient;
