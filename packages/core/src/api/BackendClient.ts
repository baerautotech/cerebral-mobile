/**
 * Backend API Client
 * Cross-platform HTTP client for Cerebral Platform Backend API
 *
 * Features:
 * - Automatic JWT token injection
 * - Error handling with custom error types
 * - Retry logic for transient failures
 * - Request logging
 * - React Native & Web compatible
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import AuthService from '../services/supabase';

// ==================== TYPES ====================

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    type: string;
    severity: string;
    retryable: boolean;
    error_id: string;
    timestamp: string;
  };
}

export interface ApiOptions {
  baseURL?: string;
  timeout?: number;
  enableLogging?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// ==================== ERROR CLASSES ====================

export class APIError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly severity: string;
  public readonly retryable: boolean;
  public readonly errorId: string;
  public readonly timestamp: string;

  constructor(error: ApiErrorResponse['error'], statusCode: number) {
    super(error.message);
    this.name = 'APIError';
    this.code = error.code;
    this.statusCode = statusCode;
    this.severity = error.severity;
    this.retryable = error.retryable;
    this.errorId = error.error_id;
    this.timestamp = error.timestamp;
  }
}

export class AuthenticationError extends APIError {
  constructor(error: ApiErrorResponse['error']) {
    super(error, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(error: ApiErrorResponse['error']) {
    super(error, 403);
    this.name = 'AuthorizationError';
  }
}

// ==================== BACKEND CLIENT ====================

export class BackendClient {
  private client: AxiosInstance;
  private readonly enableLogging: boolean;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(options: ApiOptions = {}) {
    const baseURL =
      options.baseURL ||
      process.env.REACT_APP_API_URL ||
      'https://api.dev.cerebral.baerautotech.com';

    this.enableLogging = options.enableLogging ?? true;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;

    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    });

    // Add response interceptor for JWT token injection and error handling
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AuthService.getAccessToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('[BackendClient] Failed to get token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add error interceptor for handling API errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Handle authentication errors
          AuthService.signOut().catch((err) =>
            console.error('[BackendClient] Failed to sign out on 401:', err)
          );
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTHENTICATION METHODS ====================

  async signup(data: any) {
    return this.request('POST', '/auth/signup', data);
  }

  async signin(data: any) {
    return this.request('POST', '/auth/signin', data);
  }

  async signout(sessionToken: string) {
    return this.request('POST', '/auth/signout', { session_token: sessionToken });
  }

  async getCurrentUser() {
    return this.request('GET', '/auth/user');
  }

  // ==================== PASSWORD MANAGEMENT ====================

  async requestPasswordReset(email: string, redirectUrl?: string) {
    return this.request('POST', '/auth/password-reset/request', {
      email,
      redirect_url: redirectUrl,
    });
  }

  async confirmPasswordReset(token: string, password: string) {
    return this.request('POST', '/auth/password-reset/confirm', {
      token,
      password,
    });
  }

  // ==================== PERMISSIONS & RBAC ====================

  async checkPermissions(permissions: string[], resourceId?: string) {
    return this.request('POST', '/auth/permissions/check', {
      permissions,
      ...(resourceId && { resource_id: resourceId }),
    });
  }

  // ==================== NOTIFICATIONS ====================

  async sendNotification(data: any) {
    return this.request('POST', '/notifications/send', data);
  }

  async getNotifications(limit: number = 20, offset: number = 0, unreadOnly: boolean = false) {
    return this.request('GET', '/notifications', {
      params: { limit, offset, unread_only: unreadOnly },
    });
  }

  async markNotificationAsRead(id: string) {
    return this.request('PUT', `/notifications/${id}/read`);
  }

  async deleteNotification(id: string) {
    return this.request('DELETE', `/notifications/${id}`);
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck() {
    return this.request('GET', '/health');
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async request<T>(method: string, path: string, data?: any): Promise<T> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.retryAttempts) {
      try {
        const config: any = {
          method,
          url: path,
        };

        if (data && (method === 'POST' || method === 'PUT')) {
          if (data.params) {
            config.params = data.params;
          } else {
            config.data = data;
          }
        } else if (data && data.params) {
          config.params = data.params;
        }

        const response: AxiosResponse<T> = await this.client.request(config);
        const duration = Date.now() - startTime;

        if (this.enableLogging) {
          this.log(method, path, 200, duration, attempt + 1);
        }

        return response.data;
      } catch (error: any) {
        lastError = error;
        const status = error.response?.status || 0;
        const duration = Date.now() - startTime;

        if (this.enableLogging) {
          this.log(method, path, status, duration, attempt + 1);
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          const errorData = error.response.data as ApiErrorResponse;
          throw new AuthenticationError(errorData.error);
        } else if (error.response?.status === 403) {
          const errorData = error.response.data as ApiErrorResponse;
          throw new AuthorizationError(errorData.error);
        } else if (error.response?.data?.error) {
          const errorData = error.response.data as ApiErrorResponse;
          throw new APIError(errorData.error, status);
        }

        // Retry logic
        if (
          (error.code === 'ECONNABORTED' || error.message === 'timeout' || status >= 500) &&
          attempt < this.retryAttempts - 1
        ) {
          attempt++;
          await this.delay(this.retryDelay * attempt);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Request failed after all retry attempts');
  }

  private log(
    method: string,
    path: string,
    status: number,
    duration: number,
    attempt: number
  ): void {
    const emoji = status < 300 ? '✅' : status < 500 ? '⚠️' : '❌';
    const retry = attempt > 1 ? ` (retry ${attempt})` : '';
    console.log(`${emoji} [BackendClient] ${method} ${path} → ${status} (${duration}ms)${retry}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== SINGLETON EXPORT ====================

export const backendClient = new BackendClient();
export default backendClient;
