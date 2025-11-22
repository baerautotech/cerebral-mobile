/**
 * Backend API Client
 * Unified API client for calling Cerebral backend services
 * Wraps @cerebral/core BackendClient for compatibility
 */

import { backendClient } from '@cerebral/core';

/**
 * API client with automatic authentication
 */
export class ApiClient {
  /**
   * Make authenticated API request
   */
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body as string) : undefined;

      // Use backendClient from core which handles auth, headers, and retries
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await (backendClient as any).request(method, endpoint, body);

      return { data, error: null };
    } catch (error: any) {
      if (__DEV__) {
        console.error('API request error:', error);
      }
      return { data: null, error };
    }
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  static async post<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  static async put<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string): Promise<{ data: T | null; error: Error | null }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export default ApiClient;
