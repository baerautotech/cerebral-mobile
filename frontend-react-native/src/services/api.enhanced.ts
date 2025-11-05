/**
 * Enhanced API Client with Retry, Cache, and Monitoring
 * Production-ready API client with resilience patterns
 */


import { logApiError, logPerformance, addBreadcrumb } from './monitoring';
import { AuthService } from './supabase';
import { env } from '../config/env';

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
      data,
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
   * Check if error is retryable
   */
  private isRetryable(error: { message?: string; status?: number }): boolean {
    // Network errors are retryable
    if (error.message === 'Network request failed') return true;

    // 5xx server errors are retryable
    if (error.status >= 500 && error.status < 600) return true;

    // Rate limit errors (429) are retryable
    if (error.status === 429) return true;

    return false;
  }

  /**
   * Delay for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make request with retry logic
   */
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    retriesLeft: number = this.config.retries
  ): Promise<{ data: T | null; error: Record<string, unknown> }> {
    try {
      const startTime = performance.now();

      // Make request
      const response = await fetch(`${this.config.baseURL}${endpoint}`, {
        ...options,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const duration = performance.now() - startTime;

      // Log performance
      logPerformance({
        name: `API: ${options.method} ${endpoint}`,
        value: duration,
        unit: 'ms',
      });

      // Check response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));

        const error = {
          status: response.status,
          message: errorData.message ?? response.statusText,
          ...errorData,
        };

        // Log error
        logApiError(endpoint, options.method ?? 'GET', response.status, error);

        // Retry if applicable
        if (retriesLeft > 0 && this.isRetryable(error)) {
          addBreadcrumb('Retrying API request', 'api', {
            endpoint,
            retriesLeft,
            status: response.status,
          });

          await this.delay(this.config.retryDelay);
          return this.requestWithRetry(endpoint, options, retriesLeft - 1);
        }

        return { data: null, error };
      }

      const data = await response.json();
      return { data, error: null };

    } catch (error: unknown) {
      // Network error or timeout
      logApiError(endpoint, options.method ?? 'GET', 0, error);

      // Retry if applicable
      if (retriesLeft > 0 && this.isRetryable(error)) {
        await this.delay(this.config.retryDelay);
        return this.requestWithRetry(endpoint, options, retriesLeft - 1);
      }

      return { data: null, error };
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
        return { data: cached, error: null };
      }
    }

    // Get access token
    const token = await AuthService.getAccessToken();

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Make request with retry
    const result = await this.requestWithRetry<T>(endpoint, {
      ...options,
      method,
      headers,
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
  public async get<T>(endpoint: string): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  public async post<T>(endpoint: string, body?: Record<string, unknown>): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(endpoint: string, body?: Record<string, unknown>): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string): Promise<{ data: T | null; error: Record<string, unknown> }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const ApiClient = new EnhancedApiClient();

export default ApiClient;
