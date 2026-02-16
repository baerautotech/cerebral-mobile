/**
 * Backend Client Tests
 *
 * Comprehensive test suite for type-safe backend API client
 */

import { BackendClient, APIError, NotFoundError } from './BackendClient';

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
        }),
      );
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
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=50'),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('unread_only=true'),
        expect.any(Object),
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

      const result = await client.markNotificationAsRead(
        '123e4567-e89b-12d3-a456-426614174000',
      );

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

      await expect(
        client.markNotificationAsRead('nonexistent-id'),
      ).rejects.toThrow(NotFoundError);
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
      const timeoutError = new Error(
        'The operation was aborted due to timeout',
      );
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
        }),
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
        }),
      );
    });

    it('should use correct HTTP methods', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await client.healthCheck();
      expect((global.fetch as jest.Mock).mock.calls[0][1].method).toBe('GET');

      await client.getNotifications();
      expect((global.fetch as jest.Mock).mock.calls[1][1].method).toBe('GET');

      await client.markNotificationAsRead('123');
      expect((global.fetch as jest.Mock).mock.calls[2][1].method).toBe('PUT');

      await client.deleteNotification('123');
      expect((global.fetch as jest.Mock).mock.calls[3][1].method).toBe(
        'DELETE',
      );
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
        expect.any(Object),
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
        }),
      );
    });
  });
});
