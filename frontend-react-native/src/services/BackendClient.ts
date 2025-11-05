/**
 * Type-Safe Backend API Client
 *
 * Enterprise-grade SDK for Cerebral Platform Backend API
 * Auto-generated from OpenAPI 3.0 specification
 *
 * Features:
 * - Full TypeScript type safety using generated types
 * - OAuth2-Proxy cookie-based authentication
 * - Comprehensive error handling
 * - Request/response logging
 * - Retry logic for transient failures
 * - SOC2/HIPAA/GDPR compliant
 *
 * @version 2.0.0
 * @author Cerebral Platform Team
 * @since 2025-10-13 (Epic 6)
 */

import type { paths, components, operations } from '../types/backend-api';

// ==================== TYPES ====================

type SignupRequest = components['schemas']['SignupRequest'];
type SigninRequest = components['schemas']['SigninRequest'];
type AuthResponse = components['schemas']['AuthResponse'];
type UserResponse = components['schemas']['UserResponse'];
type SuccessResponse = components['schemas']['SuccessResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];
type MFAEnrollResponse = components['schemas']['MFAEnrollResponse'];
type SSOInitiateResponse = components['schemas']['SSOInitiateResponse'];
type PermissionCheckRequest = components['schemas']['PermissionCheckRequest'];
type PermissionCheckResponse = components['schemas']['PermissionCheckResponse'];
type SendNotificationRequest = components['schemas']['SendNotificationRequest'];
type NotificationResponse = components['schemas']['NotificationResponse'];
type NotificationListResponse = components['schemas']['NotificationListResponse'];

// ==================== ERROR CLASSES ====================

/**
 * Base API error class
 */
export class APIError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly severity: string;
  public readonly retryable: boolean;
  public readonly errorId: string;
  public readonly timestamp: string;

  constructor(error: ErrorResponse['error'], statusCode: number) {
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

/**
 * Authentication error (401)
 */
export class AuthenticationError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 422);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 404);
    this.name = 'NotFoundError';
  }
}

// ==================== CLIENT OPTIONS ====================

export interface BackendClientOptions {
  baseURL?: string;
  timeout?: number;
  enableLogging?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// ==================== BACKEND CLIENT ====================

/**
 * Type-safe backend API client
 *
 * All methods use generated types from OpenAPI specification for
 * compile-time type safety and IDE autocomplete.
 */
export class BackendClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(options: BackendClientOptions = {}) {
    this.baseURL = options.baseURL || process.env.REACT_APP_API_URL || 'https://api.dev.cerebral.baerautotech.com';
    this.timeout = options.timeout || 30000;
    this.enableLogging = options.enableLogging ?? true;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  // ==================== AUTHENTICATION METHODS ====================

  /**
   * User signup
   * Creates a new user account with email and password
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/signup', data);
  }

  /**
   * User signin
   * Authenticates user with email and password
   */
  async signin(data: SigninRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/signin', data);
  }

  /**
   * User signout
   * Signs out the currently authenticated user
   */
  async signout(sessionToken: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/signout', { session_token: sessionToken });
  }

  /**
   * Get current user
   * Retrieves the currently authenticated user's information
   */
  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('GET', '/auth/user');
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Request password reset
   * Sends password reset email to user
   */
  async requestPasswordReset(email: string, redirectUrl?: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/password-reset/request', {
      email,
      redirect_url: redirectUrl,
    });
  }

  /**
   * Confirm password reset
   * Resets password using token from email
   */
  async confirmPasswordReset(token: string, password: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/password-reset/confirm', {
      token,
      password,
    });
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Send verification email
   * Sends email verification link to user
   */
  async sendVerificationEmail(email: string, redirectUrl?: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/email/verify/send', {
      email,
      redirect_url: redirectUrl,
    });
  }

  /**
   * Confirm email verification
   * Verifies email using token from link
   */
  async confirmEmailVerification(token: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/email/verify/confirm', { token });
  }

  // ==================== MULTI-FACTOR AUTHENTICATION ====================

  /**
   * Enroll in MFA
   * Enrolls user in TOTP-based multi-factor authentication
   */
  async enrollMFA(method: 'TOTP' = 'TOTP'): Promise<MFAEnrollResponse> {
    return this.request<MFAEnrollResponse>('POST', '/auth/mfa/enroll', { method });
  }

  /**
   * Verify MFA code
   * Verifies TOTP code for MFA
   */
  async verifyMFA(code: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/mfa/verify', { code });
  }

  /**
   * Disable MFA
   * Disables multi-factor authentication for user
   */
  async disableMFA(password: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/mfa/disable', { password });
  }

  // ==================== SINGLE SIGN-ON ====================

  /**
   * Initiate SSO
   * Initiates Single Sign-On flow (Keycloak, OIDC, SAML)
   */
  async initiateSSO(
    provider: 'keycloak' | 'oidc_generic' | 'saml_generic',
    redirectUrl?: string
  ): Promise<SSOInitiateResponse> {
    return this.request<SSOInitiateResponse>('POST', '/auth/sso/initiate', {
      provider,
      redirect_url: redirectUrl,
    });
  }

  /**
   * Handle SSO callback
   * Processes SSO callback from identity provider
   */
  async handleSSOCallback(
    provider: 'keycloak' | 'oidc_generic' | 'saml_generic',
    state: string,
    code: string
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/sso/callback', {
      provider,
      state,
      code,
    });
  }

  // ==================== PERMISSIONS & RBAC ====================

  /**
   * Check permissions
   * Checks if user has specific permissions
   */
  async checkPermissions(
    permissions: string[],
    resourceId?: string
  ): Promise<PermissionCheckResponse> {
    const data: PermissionCheckRequest = {
      permissions,
      ...(resourceId && { resource_id: resourceId }),
    };
    return this.request<PermissionCheckResponse>('POST', '/auth/permissions/check', data);
  }

  // ==================== WEBAUTHN (PASSKEYS) ====================

  /**
   * Begin WebAuthn registration
   * Starts passwordless WebAuthn registration process
   */
  async beginWebAuthnRegistration(deviceName?: string): Promise<any> {
    return this.request('POST', '/auth/webauthn/register/begin', {
      device_name: deviceName,
    });
  }

  /**
   * Complete WebAuthn registration
   * Completes passwordless WebAuthn registration
   */
  async completeWebAuthnRegistration(credential: any): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/webauthn/register/complete', {
      credential,
    });
  }

  /**
   * Begin WebAuthn authentication
   * Starts passwordless WebAuthn authentication
   */
  async beginWebAuthnAuthentication(email: string): Promise<any> {
    return this.request('POST', '/auth/webauthn/authenticate/begin', { email });
  }

  /**
   * Complete WebAuthn authentication
   * Completes passwordless WebAuthn authentication
   */
  async completeWebAuthnAuthentication(credential: any): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/webauthn/authenticate/complete', {
      credential,
    });
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Send notification
   * Sends notification via email, push, SMS, or webhook
   */
  async sendNotification(data: SendNotificationRequest): Promise<NotificationResponse> {
    return this.request<NotificationResponse>('POST', '/notifications/send', data);
  }

  /**
   * Get notifications
   * Retrieves user's notifications
   */
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString(),
    });
    return this.request<NotificationListResponse>('GET', `/notifications?${queryParams}`);
  }

  /**
   * Mark notification as read
   * Marks a specific notification as read
   */
  async markNotificationAsRead(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('PUT', `/notifications/${id}/read`);
  }

  /**
   * Delete notification
   * Deletes a specific notification
   */
  async deleteNotification(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('DELETE', `/notifications/${id}`);
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Health check
   * Checks if the API is running and healthy
   */
  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    return this.request('GET', '/health');
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Make HTTP request with type safety and error handling
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    const startTime = Date.now();
    const url = `${this.baseURL}${path}`;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.retryAttempts) {
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          signal: AbortSignal.timeout(this.timeout),
        };

        if (data && (method === 'POST' || method === 'PUT')) {
          options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const duration = Date.now() - startTime;

        if (this.enableLogging) {
          this.log(method, path, response.status, duration, attempt + 1);
        }

        if (!response.ok) {
          const errorData = await response.json() as { error: ErrorResponse['error'] };
          this.handleError(response.status, errorData.error);
        }

        const result = await response.json() as T;
        return result;

      } catch (error: any) {
        lastError = error;

        if (error instanceof APIError) {
          if (!error.retryable || attempt >= this.retryAttempts - 1) {
            throw error;
          }
        } else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          if (attempt >= this.retryAttempts - 1) {
            throw new APIError(
              {
                code: 'TIMEOUT',
                message: `Request timeout after ${this.timeout}ms`,
                type: 'NetworkError',
                severity: 'medium',
                retryable: true,
                error_id: this.generateErrorId(),
                timestamp: new Date().toISOString(),
              },
              408
            );
          }
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          if (attempt >= this.retryAttempts - 1) {
            throw new APIError(
              {
                code: 'NETWORK',
                message: 'Network error: Unable to connect to server',
                type: 'NetworkError',
                severity: 'high',
                retryable: true,
                error_id: this.generateErrorId(),
                timestamp: new Date().toISOString(),
              },
              0
            );
          }
        } else {
          throw error;
        }

        attempt++;
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Request failed after all retry attempts');
  }

  /**
   * Handle API errors and throw appropriate error types
   */
  private handleError(statusCode: number, error: ErrorResponse['error']): never {
    switch (statusCode) {
      case 401:
        throw new AuthenticationError(error);
      case 403:
        throw new AuthorizationError(error);
      case 404:
        throw new NotFoundError(error);
      case 422:
        throw new ValidationError(error);
      default:
        throw new APIError(error, statusCode);
    }
  }

  /**
   * Log request/response details
   */
  private log(
    method: string,
    path: string,
    status: number,
    duration: number,
    attempt: number
  ): void {
    const emoji = status < 300 ? '✅' : status < 500 ? '⚠️' : '❌';
    const retry = attempt > 1 ? ` (retry ${attempt})` : '';

    console.log(
      `${emoji} [BackendClient] ${method} ${path} → ${status} (${duration}ms)${retry}`
    );
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== DEFAULT EXPORT ====================

/**
 * Default backend client instance
 * Use this for most cases, or create a new instance with custom options
 */
const defaultClient = new BackendClient();

export default defaultClient;

// ==================== USAGE EXAMPLES ====================

/**
 * Usage Examples:
 *
 * ```typescript
 * import backendClient, { BackendClient, ValidationError } from './services/BackendClient';
 *
 * // Using default client
 * try {
 *   const authResponse = await backendClient.signup({
 *     email: 'user@example.com',
 *     password: 'StrongPassword123!',
 *   });
 *   console.log('User ID:', authResponse.user_id);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Validation failed:', error.message);
 *   }
 * }
 *
 * // Using custom client
 * const client = new BackendClient({
 *   baseURL: 'https://api.cerebral.baerautotech.com',
 *   timeout: 10000,
 *   enableLogging: false,
 * });
 *
 * const user = await client.getCurrentUser();
 * console.log('Current user:', user.email);
 *
 * // Check permissions
 * const permissionCheck = await client.checkPermissions(['read:tasks', 'write:tasks']);
 * if (permissionCheck.has_permissions) {
 *   console.log('User has all required permissions');
 * }
 *
 * // Send notification
 * await client.sendNotification({
 *   recipient_id: user.id,
 *   channel: 'email',
 *   title: 'Welcome',
 *   message: 'Welcome to Cerebral Platform!',
 *   priority: 'normal',
 * });
 * ```
 */
