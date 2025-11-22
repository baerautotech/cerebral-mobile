/**
 * Backend Client Tests
 *
 * Comprehensive test suite for type-safe backend API client
 */

import {
  BackendClient,
  APIError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from './BackendClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('BackendClient', () => {
  let client: BackendClient;

  beforeEach(() => {
    client = new BackendClient({
      baseURL: 'https://api.test.com',
      enableLogging: false,
      retryAttempts: 1,
    });
    jest.clearAllMocks();
  });

  // ==================== HEALTH CHECK ====================

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const mockResponse = {
        status: 'healthy',
        version: '2.0.0',
        timestamp: '2025-10-13T12:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.healthCheck();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/health',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });
  });

  // ==================== AUTHENTICATION ====================

  describe('signup', () => {
    it('should create a new user account', async () => {
      const signupData = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const mockResponse = {
        success: true,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        tenant_id: '00000000-0000-0000-0000-000000000100',
        session_token: 'session_abc',
        access_token: 'access_abc',
        refresh_token: 'refresh_abc',
        expires_in: 3600,
        mfa_required: false,
        trust_score: 85,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await client.signup(signupData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/auth/signup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(signupData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle validation errors', async () => {
      const signupData = {
        email: 'test@example.com',
        password: 'weak',
      };

      const mockError = {
        error: {
          code: 'VAL002',
          message: 'Password must be at least 12 characters',
          type: 'ValidationError',
          severity: 'medium',
          retryable: true,
          error_id: '123-456',
          timestamp: '2025-10-13T12:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockError,
      });

      await expect(client.signup(signupData)).rejects.toThrow(ValidationError);
    });
  });

  describe('signin', () => {
    it('should authenticate user', async () => {
      const signinData = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const mockResponse = {
        success: true,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        tenant_id: '00000000-0000-0000-0000-000000000100',
        session_token: 'session_abc',
        access_token: 'access_abc',
        refresh_token: 'refresh_abc',
        expires_in: 3600,
        mfa_required: false,
        trust_score: 90,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.signin(signinData);

      expect(result).toEqual(mockResponse);
      expect(result.user_id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.mfa_required).toBe(false);
    });

    it('should handle authentication errors', async () => {
      const signinData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockError = {
        error: {
          code: 'AUTH001',
          message: 'Invalid email or password',
          type: 'AuthenticationError',
          severity: 'high',
          retryable: false,
          error_id: '123-456',
          timestamp: '2025-10-13T12:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockError,
      });

      await expect(client.signin(signinData)).rejects.toThrow(AuthenticationError);
    });

    it('should handle MFA required response', async () => {
      const signinData = {
        email: 'test@example.com',
        password: 'StrongPassword123!',
      };

      const mockResponse = {
        success: true,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        tenant_id: '00000000-0000-0000-0000-000000000100',
        session_token: 'session_abc',
        access_token: 'access_abc',
        refresh_token: 'refresh_abc',
        expires_in: 3600,
        mfa_required: true,
        trust_score: 85,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.signin(signinData);

      expect(result.mfa_required).toBe(true);
    });
  });

  describe('signout', () => {
    it('should sign out user', async () => {
      const mockResponse = {
        success: true,
        message: 'User signed out successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.signout('session_token_123');

      expect(result.success).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockResponse = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        tenant_id: '00000000-0000-0000-0000-000000000100',
        roles: ['user'],
        permissions: ['read:tasks', 'write:tasks'],
        mfa_enabled: true,
        email_verified: true,
        created_at: '2025-01-01T00:00:00Z',
        last_signin_at: '2025-10-13T12:00:00Z',
        metadata: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.getCurrentUser();

      expect(result.email).toBe('test@example.com');
      expect(result.mfa_enabled).toBe(true);
    });
  });

  // ==================== PASSWORD MANAGEMENT ====================

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.requestPasswordReset('test@example.com');

      expect(result.success).toBe(true);
    });

    it('should handle redirect URL parameter', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await client.requestPasswordReset('test@example.com', 'https://app.com/reset');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/auth/password-reset/request',
        expect.objectContaining({
          body: JSON.stringify({
            email: 'test@example.com',
            redirect_url: 'https://app.com/reset',
          }),
        })
      );
    });
  });

  describe('confirmPasswordReset', () => {
    it('should reset password with token', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.confirmPasswordReset('reset_token', 'NewPassword123!');

      expect(result.success).toBe(true);
    });
  });

  // ==================== MFA ====================

  describe('enrollMFA', () => {
    it('should enroll user in MFA', async () => {
      const mockResponse = {
        success: true,
        method: 'TOTP',
        secret: 'JBSWY3DPEHPK3PXP',
        qr_code: 'data:image/png;base64,...',
        backup_codes: ['123456', '234567'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.enrollMFA();

      expect(result.method).toBe('TOTP');
      expect(result.secret).toBeTruthy();
      expect(result.backup_codes).toHaveLength(2);
    });
  });

  describe('verifyMFA', () => {
    it('should verify MFA code', async () => {
      const mockResponse = {
        success: true,
        message: 'MFA verified successfully',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.verifyMFA('123456');

      expect(result.success).toBe(true);
    });

    it('should handle invalid MFA code', async () => {
      const mockError = {
        error: {
          code: 'MFA001',
          message: 'Invalid MFA code',
          type: 'ValidationError',
          severity: 'medium',
          retryable: true,
          error_id: '123-456',
          timestamp: '2025-10-13T12:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockError,
      });

      await expect(client.verifyMFA('000000')).rejects.toThrow(ValidationError);
    });
  });

  // ==================== SSO ====================

  describe('initiateSSO', () => {
    it('should initiate SSO flow', async () => {
      const mockResponse = {
        success: true,
        provider: 'keycloak',
        authorization_url: 'https://keycloak.dev.cerebral.com/auth/...',
        state: 'random_state_123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.initiateSSO('keycloak');

      expect(result.provider).toBe('keycloak');
      expect(result.authorization_url).toBeTruthy();
      expect(result.state).toBeTruthy();
    });
  });

  describe('handleSSOCallback', () => {
    it('should handle SSO callback', async () => {
      const mockResponse = {
        success: true,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        tenant_id: '00000000-0000-0000-0000-000000000100',
        session_token: 'session_abc',
        access_token: 'access_abc',
        refresh_token: 'refresh_abc',
        expires_in: 3600,
        mfa_required: false,
        trust_score: 95,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.handleSSOCallback('keycloak', 'state_123', 'code_abc');

      expect(result.success).toBe(true);
      expect(result.user_id).toBeTruthy();
    });
  });

  // ==================== PERMISSIONS ====================

  describe('checkPermissions', () => {
    it('should check user permissions', async () => {
      const mockResponse = {
        has_permissions: true,
        granted_permissions: ['read:tasks', 'write:tasks'],
        denied_permissions: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.checkPermissions(['read:tasks', 'write:tasks']);

      expect(result.has_permissions).toBe(true);
      expect(result.granted_permissions).toHaveLength(2);
    });

    it('should handle resource-specific permissions', async () => {
      const mockResponse = {
        has_permissions: false,
        granted_permissions: ['read:tasks'],
        denied_permissions: ['write:tasks'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.checkPermissions(
        ['read:tasks', 'write:tasks'],
        '550e8400-e29b-41d4-a716-446655440000'
      );

      expect(result.has_permissions).toBe(false);
      expect(result.denied_permissions).toContain('write:tasks');
    });
  });

  // ==================== NOTIFICATIONS ====================

  describe('sendNotification', () => {
    it('should send notification', async () => {
      const notificationData = {
        recipient_id: '550e8400-e29b-41d4-a716-446655440000',
        channel: 'email' as const,
        title: 'Test Notification',
        message: 'This is a test',
        priority: 'normal' as const,
      };

      const mockResponse = {
        success: true,
        notification_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'sent' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.sendNotification(notificationData);

      expect(result.success).toBe(true);
      expect(result.notification_id).toBeTruthy();
      expect(result.status).toBe('sent');
    });
  });

  describe('getNotifications', () => {
    it('should retrieve user notifications', async () => {
      const mockResponse = {
        notifications: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            recipient_id: '550e8400-e29b-41d4-a716-446655440000',
            channel: 'email' as const,
            title: 'Test Notification',
            message: 'This is a test',
            priority: 'normal' as const,
            read: false,
            created_at: '2025-10-13T12:00:00Z',
            metadata: {},
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.getNotifications();

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const mockResponse = {
        notifications: [],
        total: 100,
        limit: 50,
        offset: 50,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await client.getNotifications(50, 50, true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=50'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('unread_only=true'),
        expect.any(Object)
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResponse = {
        success: true,
        message: 'Notification marked as read',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.markNotificationAsRead('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(true);
    });

    it('should handle not found errors', async () => {
      const mockError = {
        error: {
          code: 'RES001',
          message: 'Notification not found',
          type: 'NotFoundError',
          severity: 'low',
          retryable: false,
          error_id: '123-456',
          timestamp: '2025-10-13T12:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockError,
      });

      await expect(client.markNotificationAsRead('nonexistent-id')).rejects.toThrow(NotFoundError);
    });
  });

  // ==================== ERROR HANDLING ====================

  describe('Error Handling', () => {
    it('should handle network errors with retry', async () => {
      const networkError = new TypeError('Failed to fetch');

      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(client.healthCheck()).rejects.toThrow(APIError);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('The operation was aborted due to timeout');
      timeoutError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      await expect(client.healthCheck()).rejects.toThrow(APIError);
    });

    it('should preserve error details from backend', async () => {
      const mockError = {
        error: {
          code: 'TEST001',
          message: 'Test error message',
          type: 'TestError',
          severity: 'high',
          retryable: false,
          error_id: 'test-error-123',
          timestamp: '2025-10-13T12:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      try {
        await client.healthCheck();
        fail('Should have thrown APIError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(APIError);
        expect(error.code).toBe('TEST001');
        expect(error.message).toBe('Test error message');
        expect(error.severity).toBe('high');
        expect(error.retryable).toBe(false);
        expect(error.errorId).toBe('test-error-123');
      }
    });
  });

  // ==================== REQUEST OPTIONS ====================

  describe('Request Configuration', () => {
    it('should include credentials for cookie-based auth', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      });

      await client.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should set correct content-type headers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      });

      await client.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });

    it('should use correct HTTP methods', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await client.getCurrentUser();
      expect((global.fetch as jest.Mock).mock.calls[0][1].method).toBe('GET');

      await client.signup({ email: 'test@test.com', password: 'Password123!' });
      expect((global.fetch as jest.Mock).mock.calls[1][1].method).toBe('POST');

      await client.markNotificationAsRead('123');
      expect((global.fetch as jest.Mock).mock.calls[2][1].method).toBe('PUT');

      await client.deleteNotification('123');
      expect((global.fetch as jest.Mock).mock.calls[3][1].method).toBe('DELETE');
    });
  });

  // ==================== CUSTOM CLIENT ====================

  describe('Custom Client Configuration', () => {
    it('should use custom baseURL', async () => {
      const customClient = new BackendClient({
        baseURL: 'https://api.custom.com',
        enableLogging: false,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      });

      await customClient.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.custom.com/health',
        expect.any(Object)
      );
    });

    it('should respect custom timeout', async () => {
      const customClient = new BackendClient({
        timeout: 5000,
        enableLogging: false,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      });

      await customClient.healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });
});
