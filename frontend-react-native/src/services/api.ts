/**
 * Backend API Client
 * Unified API client for calling Cerebral backend services
 */

import { AuthService } from './supabase';

// API configuration
const API_BASE_URL =
  Platform.OS === 'web'
    ? '/api' // Use relative path for web (nginx proxies to backend)
    : 'https://cerebral.baerautotech.com/api'; // Direct URL for mobile

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

      // Make request
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Check response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        return { data: null, error: errorData };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
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
