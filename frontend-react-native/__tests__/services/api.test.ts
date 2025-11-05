/**
 * API Client tests
 */

import { ApiClient } from '../../src/services/api';
import { AuthService } from '../../src/services/supabase';

// Mock dependencies
jest.mock('../../src/services/supabase');

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AuthService.getAccessToken as jest.Mock).mockResolvedValue('mock-token');
  });

  describe('GET requests', () => {
    it('should make GET request with auth token', async () => {
      const mockData = { id: '1', title: 'Test Task' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await ApiClient.get('/v1/tasks/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/tasks/1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should handle errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await ApiClient.get('/v1/tasks/invalid');

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      const mockTask = { title: 'New Task', priority: 'high' };
      const mockResponse = { id: '1', ...mockTask };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiClient.post('/v1/tasks/', mockTask);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/tasks/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockTask),
        })
      );

      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', async () => {
      const mockUpdate = { status: 'completed' };
      const mockResponse = { id: '1', ...mockUpdate };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiClient.put('/v1/tasks/1', mockUpdate);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/tasks/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(mockUpdate),
        })
      );

      expect(result.data).toEqual(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await ApiClient.delete('/v1/tasks/1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/tasks/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result.data).toBeDefined();
    });
  });
});
