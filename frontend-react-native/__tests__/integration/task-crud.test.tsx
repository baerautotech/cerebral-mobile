/**
 * Task CRUD Integration Tests
 * Tests complete task lifecycle: Create → Read → Update → Delete
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TasksScreen from '../../src/screens/TasksScreen';
import CreateTaskScreen from '../../src/screens/CreateTaskScreen';
import TaskDetailScreen from '../../src/screens/TaskDetailScreen';
import { ApiClient } from '../../src/services/api';

jest.mock('../../src/services/api');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

describe('Task CRUD Integration', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending' as const,
      priority: 'medium' as const,
      created_at: '2025-10-10T12:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create → Read Flow', () => {
    it('should create task and display in list', async () => {
      const mockOnTaskCreated = jest.fn((task) => {
        // Simulate adding task to list
        mockTasks.push(task);
      });

      // Setup API mocks
      (ApiClient.post as jest.Mock).mockResolvedValue({
        data: {
          id: '2',
          title: 'New Task',
          description: 'New Description',
          status: 'pending',
          priority: 'high',
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <CreateTaskScreen onTaskCreated={mockOnTaskCreated} />
      );

      // Fill form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'New Task');
      fireEvent.changeText(getByPlaceholderText('Enter task description'), 'New Description');
      fireEvent.press(getByText('High'));

      // Submit
      fireEvent.press(getByText('Create Task'));

      // Verify API called
      await waitFor(() => {
        expect(ApiClient.post).toHaveBeenCalledWith('/v1/tasks/', {
          title: 'New Task',
          description: 'New Description',
          priority: 'high',
          status: 'pending',
        });
      });

      // Verify callback called
      expect(mockOnTaskCreated).toHaveBeenCalled();
    });
  });

  describe('Read → Update Flow', () => {
    it('should load task and update it', async () => {
      const mockTask = mockTasks[0];

      // Mock GET for loading task
      (ApiClient.get as jest.Mock).mockResolvedValue({
        data: mockTask,
        error: null,
      });

      // Mock PUT for updating
      (ApiClient.put as jest.Mock).mockResolvedValue({
        data: { ...mockTask, title: 'Updated Task' },
        error: null,
      });

      const mockOnTaskUpdated = jest.fn();

      const { getByText, getByDisplayValue } = render(
        <TaskDetailScreen taskId="1" onTaskUpdated={mockOnTaskUpdated} />
      );

      // Wait for task to load
      await waitFor(() => {
        expect(getByText('Test Task')).toBeTruthy();
      });

      // Enter edit mode
      fireEvent.press(getByText('Edit'));

      await waitFor(() => {
        expect(getByText('Save')).toBeTruthy();
      });

      // Update title
      const titleInput = getByDisplayValue('Test Task');
      fireEvent.changeText(titleInput, 'Updated Task');

      // Save
      fireEvent.press(getByText('Save'));

      // Verify PUT called
      await waitFor(() => {
        expect(ApiClient.put).toHaveBeenCalledWith('/v1/tasks/1', expect.objectContaining({
          title: 'Updated Task',
        }));
      });

      // Verify callback
      expect(mockOnTaskUpdated).toHaveBeenCalled();
    });
  });

  describe('Read → Delete Flow', () => {
    it('should load task and delete it', async () => {
      const mockTask = mockTasks[0];

      (ApiClient.get as jest.Mock).mockResolvedValue({
        data: mockTask,
        error: null,
      });

      (ApiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      // Mock Platform for web
      const Platform = require('react-native').Platform;
      (Platform as any).OS = 'web';
      global.confirm = jest.fn(() => true);

      const mockOnTaskDeleted = jest.fn();
      const mockOnClose = jest.fn();

      const { getByText } = render(
        <TaskDetailScreen
          taskId="1"
          onTaskDeleted={mockOnTaskDeleted}
          onClose={mockOnClose}
        />
      );

      // Wait for load
      await waitFor(() => {
        expect(getByText('Test Task')).toBeTruthy();
      });

      // Delete
      fireEvent.press(getByText('Delete'));

      // Verify DELETE called
      await waitFor(() => {
        expect(ApiClient.delete).toHaveBeenCalledWith('/v1/tasks/1');
      });

      // Verify callbacks
      expect(mockOnTaskDeleted).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
