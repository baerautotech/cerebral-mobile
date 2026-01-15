import type { components } from '../types/backend-api';
import { emitStepUpRequired } from './stepUpBus';

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
type NotificationListResponse =
  components['schemas']['NotificationListResponse'];
type WebAuthnRegisterBeginResponse =
  components['schemas']['WebAuthnRegisterBeginResponse'];
type WebAuthnRegisterCompleteRequest =
  components['schemas']['WebAuthnRegisterCompleteRequest'];
type WebAuthnAuthBeginResponse =
  components['schemas']['WebAuthnAuthBeginResponse'];
type WebAuthnAuthCompleteRequest =
  components['schemas']['WebAuthnAuthCompleteRequest'];

// ==================== ERROR CLASSES ====================

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

export class AuthenticationError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends APIError {
  constructor(error: ErrorResponse['error']) {
    super(error, 422);
    this.name = 'ValidationError';
  }
}

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

export class BackendClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly enableLogging: boolean;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(options: BackendClientOptions = {}) {
    this.baseURL =
      options.baseURL ||
      process.env.REACT_APP_API_URL ||
      'https://api.dev.cerebral.baerautotech.com';
    this.timeout = options.timeout || 30000;
    this.enableLogging = options.enableLogging ?? true;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  // ==================== AUTHENTICATION METHODS ====================

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/signup', data);
  }

  async signin(data: SigninRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/signin', data);
  }

  async signout(sessionToken: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/signout', {
      session_token: sessionToken,
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('GET', '/auth/user');
  }

  // ==================== PASSWORD MANAGEMENT ====================

  async requestPasswordReset(
    email: string,
    redirectUrl?: string,
  ): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      'POST',
      '/auth/password-reset/request',
      {
        email,
        redirect_url: redirectUrl,
      },
    );
  }

  async confirmPasswordReset(
    token: string,
    password: string,
  ): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      'POST',
      '/auth/password-reset/confirm',
      {
        token,
        password,
      },
    );
  }

  // ==================== EMAIL VERIFICATION ====================

  async sendVerificationEmail(
    email: string,
    redirectUrl?: string,
  ): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/email/verify/send', {
      email,
      redirect_url: redirectUrl,
    });
  }

  async confirmEmailVerification(token: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/email/verify/confirm', {
      token,
    });
  }

  // ==================== MULTI-FACTOR AUTHENTICATION ====================

  async enrollMFA(method: 'TOTP' = 'TOTP'): Promise<MFAEnrollResponse> {
    return this.request<MFAEnrollResponse>('POST', '/auth/mfa/enroll', {
      method,
    });
  }

  async verifyMFA(code: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/mfa/verify', { code });
  }

  async disableMFA(password: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('POST', '/auth/mfa/disable', {
      password,
    });
  }

  // ==================== SINGLE SIGN-ON ====================

  async initiateSSO(
    provider: 'keycloak' | 'oidc_generic' | 'saml_generic',
    redirectUrl?: string,
  ): Promise<SSOInitiateResponse> {
    return this.request<SSOInitiateResponse>('POST', '/auth/sso/initiate', {
      provider,
      redirect_url: redirectUrl,
    });
  }

  async handleSSOCallback(
    provider: 'keycloak' | 'oidc_generic' | 'saml_generic',
    state: string,
    code: string,
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/sso/callback', {
      provider,
      state,
      code,
    });
  }

  // ==================== PERMISSIONS & RBAC ====================

  async checkPermissions(
    permissions: string[],
    resourceId?: string,
  ): Promise<PermissionCheckResponse> {
    const data: PermissionCheckRequest = {
      permissions,
      ...(resourceId && { resource_id: resourceId }),
    };
    return this.request<PermissionCheckResponse>(
      'POST',
      '/auth/permissions/check',
      data,
    );
  }

  // ==================== WEBAUTHN (PASSKEYS) ====================

  async beginWebAuthnRegistration(
    deviceName?: string,
  ): Promise<WebAuthnRegisterBeginResponse> {
    return this.request<WebAuthnRegisterBeginResponse>(
      'POST',
      '/auth/webauthn/register/begin',
      {
        device_name: deviceName,
      },
    );
  }

  async completeWebAuthnRegistration(
    credential: WebAuthnRegisterCompleteRequest['credential'],
  ): Promise<SuccessResponse> {
    return this.request<SuccessResponse>(
      'POST',
      '/auth/webauthn/register/complete',
      {
        credential,
      },
    );
  }

  async beginWebAuthnAuthentication(
    email: string,
  ): Promise<WebAuthnAuthBeginResponse> {
    return this.request<WebAuthnAuthBeginResponse>(
      'POST',
      '/auth/webauthn/authenticate/begin',
      { email },
    );
  }

  async completeWebAuthnAuthentication(
    credential: WebAuthnAuthCompleteRequest['credential'],
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      'POST',
      '/auth/webauthn/authenticate/complete',
      {
        credential,
      },
    );
  }

  // ==================== NOTIFICATIONS ====================

  async sendNotification(
    data: SendNotificationRequest,
  ): Promise<NotificationResponse> {
    return this.request<NotificationResponse>(
      'POST',
      '/notifications/send',
      data,
    );
  }

  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false,
  ): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString(),
    });
    return this.request<NotificationListResponse>(
      'GET',
      `/notifications?${queryParams}`,
    );
  }

  async markNotificationAsRead(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('PUT', `/notifications/${id}/read`);
  }

  async deleteNotification(id: string): Promise<SuccessResponse> {
    return this.request<SuccessResponse>('DELETE', `/notifications/${id}`);
  }

  async getNotificationPreferences(): Promise<{
    channels: Record<string, boolean>;
  }> {
    return this.request<{ channels: Record<string, boolean> }>(
      'GET',
      '/notifications/preferences',
    );
  }

  async updateNotificationPreferences(
    channels: Record<string, boolean>,
  ): Promise<{ success: boolean; channels: Record<string, boolean> }> {
    return this.request<{
      success: boolean;
      channels: Record<string, boolean>;
    }>('PUT', '/notifications/preferences', { channels });
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<{
    status: string;
    version: string;
    timestamp: string;
  }> {
    return this.request('GET', '/health');
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: Record<string, unknown>,
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
            Accept: 'application/json',
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
          const payload = await this.safeJson(response);
          this.handleStepUpRequiredIfPresent(response.status, payload);
          if (
            payload &&
            typeof payload === 'object' &&
            'error' in payload &&
            (payload as { error?: ErrorResponse['error'] }).error
          ) {
            const errorData = payload as { error: ErrorResponse['error'] };
            this.handleError(response.status, errorData.error);
          }
          this.handleError(
            response.status,
            this.buildUnknownError(response.status),
          );
        }

        const result = (await response.json()) as T;
        return result;
      } catch (error: unknown) {
        lastError = error;

        if (error instanceof APIError) {
          if (!error.retryable || attempt >= this.retryAttempts - 1) {
            throw error;
          }
        } else if (
          error.name === 'AbortError' ||
          error.name === 'TimeoutError'
        ) {
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
              408,
            );
          }
        } else if (
          error.name === 'TypeError' &&
          error.message.includes('fetch')
        ) {
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
              0,
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

  private handleError(
    statusCode: number,
    error: ErrorResponse['error'],
  ): never {
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

  private handleStepUpRequiredIfPresent(
    statusCode: number,
    payload: unknown,
  ): void {
    if (statusCode !== 403 || !payload || typeof payload !== 'object') return;
    const p = payload as { reason?: unknown; hint?: unknown };
    if (typeof p.reason !== 'string' || p.reason !== 'step_up_required') return;
    const message = typeof p.hint === 'string' ? p.hint : 'Step-up required';
    emitStepUpRequired({ message });
  }

  private buildUnknownError(statusCode: number): ErrorResponse['error'] {
    return {
      code: 'UNKNOWN',
      message: 'Request failed',
      type: statusCode === 403 ? 'AuthorizationError' : 'APIError',
      severity: 'medium',
      retryable: false,
      error_id: '',
      timestamp: new Date().toISOString(),
    };
  }

  private async safeJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private log(
    method: string,
    path: string,
    status: number,
    duration: number,
    attempt: number,
  ): void {
    const emoji = status < 300 ? '✅' : status < 500 ? '⚠️' : '❌';
    const retry = attempt > 1 ? ` (retry ${attempt})` : '';

    console.log(
      `${emoji} [BackendClient] ${method} ${path} → ${status} (${duration}ms)${retry}`,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateErrorId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== DEFAULT EXPORT ====================

const defaultClient = new BackendClient();

export default defaultClient;
