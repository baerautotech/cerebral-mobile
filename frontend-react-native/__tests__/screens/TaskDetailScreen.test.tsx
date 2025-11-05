/**
 * TaskDetailScreen Tests
 * Comprehensive test coverage for task detail/edit/delete
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import TaskDetailScreen from '../../src/screens/TaskDetailScreen';
import { ApiClient } from '../../src/services/api';

jest.mock('../../src/services/api');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('TaskDetailScreen', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'in_progress' as const,
    priority: 'high' as const,
    created_at: '2025-10-10T12:00:00Z',
    updated_at: '2025-10-10T13:00:00Z',
  };

  const mockOnTaskUpdated = jest.fn();
  const mockOnTaskDeleted = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiClient.get as jest.Mock).mockResolvedValue({
      data: mockTask,
      error: null,
    });
  });

  describe('Loading', () => {
    it('should show loading indicator initially', () => {
      const { getByText } = render(
        <TaskDetailScreen taskId="1" />
      );

      expect(getByText('Loading task...')).toBeTruthy();
    });

    it('should load task details on mount', async () => {
      render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        expect(ApiClient.get).toHaveBeenCalledWith('/v1/tasks/1');
      });
    });

    it('should display task after loading', async () => {
      const { getByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        expect(getByText('Test Task')).toBeTruthy();
        expect(getByText('Test Description')).toBeTruthy();
      });
    });

    it('should show error on load failure', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const { getByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        expect(getByText('Failed to load task details')).toBeTruthy();
      });
    });
  });

  describe('Viewing Task', () => {
    it('should display all task details', async () => {
      const { getByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        expect(getByText('Test Task')).toBeTruthy();
        expect(getByText('Test Description')).toBeTruthy();
        expect(getByText('in progress')).toBeTruthy();
        expect(getByText('high')).toBeTruthy();
      });
    });

    it('should show created and updated dates', async () => {
      const { getByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        expect(getByText(/Created:/)).toBeTruthy();
        expect(getByText(/Updated:/)).toBeTruthy();
      });
    });
  });

  describe('Editing Task', () => {
    it('should enter edit mode when edit button pressed', async () => {
      const { getByText, queryByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        expect(getByText('Edit')).toBeTruthy();
      });

      fireEvent.press(getByText('Edit'));

      await waitFor(() => {
        expect(queryByText('Save')).toBeTruthy();
        expect(queryByText('Cancel')).toBeTruthy();
      });
    });

    it('should allow editing title', async () => {
      const { getByText, getByDisplayValue } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        fireEvent.press(getByText('Edit'));
      });

      const titleInput = getByDisplayValue('Test Task');
      fireEvent.changeText(titleInput, 'Updated Title');

      expect(titleInput.props.value).toBe('Updated Title');
    });

    it('should call API to update task', async () => {
      (ApiClient.put as jest.Mock).mockResolvedValue({
        data: { ...mockTask, title: 'Updated Title' },
        error: null,
      });

      const { getByText, getByDisplayValue } = render(
        <TaskDetailScreen taskId="1" onTaskUpdated={mockOnTaskUpdated} />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Edit'));
      });

      const titleInput = getByDisplayValue('Test Task');
      fireEvent.changeText(titleInput, 'Updated Title');
      fireEvent.press(getByText('Save'));

      await waitFor(() => {
        expect(ApiClient.put).toHaveBeenCalledWith('/v1/tasks/1', {
          title: 'Updated Title',
          description: 'Test Description',
          status: 'in_progress',
          priority: 'high',
        });
      });
    });

    it('should call onTaskUpdated after successful update', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Title' };
      (ApiClient.put as jest.Mock).mockResolvedValue({
        data: updatedTask,
        error: null,
      });

      const { getByText, getByDisplayValue } = render(
        <TaskDetailScreen taskId="1" onTaskUpdated={mockOnTaskUpdated} />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Edit'));
      });

      fireEvent.changeText(getByDisplayValue('Test Task'), 'Updated Title');
      fireEvent.press(getByText('Save'));

      await waitFor(() => {
        expect(mockOnTaskUpdated).toHaveBeenCalledWith(updatedTask);
      });
    });

    it('should exit edit mode after successful save', async () => {
      (ApiClient.put as jest.Mock).mockResolvedValue({
        data: { ...mockTask, title: 'Updated' },
        error: null,
      });

      const { getByText, queryByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        fireEvent.press(getByText('Edit'));
      });

      fireEvent.press(getByText('Save'));

      await waitFor(() => {
        expect(queryByText('Edit')).toBeTruthy();
        expect(queryByText('Save')).toBeNull();
      });
    });

    it('should cancel edit mode without saving', async () => {
      const { getByText, queryByText, getByDisplayValue } = render(
        <TaskDetailScreen taskId="1" />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Edit'));
      });

      // Make changes
      const titleInput = getByDisplayValue('Test Task');
      fireEvent.changeText(titleInput, 'Changed Title');

      // Cancel
      fireEvent.press(getByText('Cancel'));

      await waitFor(() => {
        // Should be back in view mode
        expect(queryByText('Edit')).toBeTruthy();
        // Should show original title
        expect(queryByText('Test Task')).toBeTruthy();
      });
    });

    it('should show error on update failure', async () => {
      (ApiClient.put as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      const { getByText, getByDisplayValue, queryByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        fireEvent.press(getByText('Edit'));
      });

      fireEvent.changeText(getByDisplayValue('Test Task'), 'Updated');
      fireEvent.press(getByText('Save'));

      await waitFor(() => {
        expect(queryByText('Failed to update task')).toBeTruthy();
      });
    });
  });

  describe('Deleting Task', () => {
    it('should show confirmation dialog on delete', async () => {
      // Mock window.confirm for web
      (Platform as any).OS = 'web';
      global.confirm = jest.fn(() => false);

      const { getByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this task?'
      );
    });

    it('should call API to delete task on confirmation', async () => {
      (Platform as any).OS = 'web';
      global.confirm = jest.fn(() => true);
      (ApiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { getByText } = render(
        <TaskDetailScreen taskId="1" onTaskDeleted={mockOnTaskDeleted} />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      await waitFor(() => {
        expect(ApiClient.delete).toHaveBeenCalledWith('/v1/tasks/1');
      });
    });

    it('should call onTaskDeleted after successful delete', async () => {
      (Platform as any).OS = 'web';
      global.confirm = jest.fn(() => true);
      (ApiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { getByText } = render(
        <TaskDetailScreen
          taskId="1"
          onTaskDeleted={mockOnTaskDeleted}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      await waitFor(() => {
        expect(mockOnTaskDeleted).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should not delete if user cancels confirmation', async () => {
      (Platform as any).OS = 'web';
      global.confirm = jest.fn(() => false);

      const { getByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      expect(ApiClient.delete).not.toHaveBeenCalled();
    });

    it('should show error on delete failure', async () => {
      (Platform as any).OS = 'web';
      global.confirm = jest.fn(() => true);
      (ApiClient.delete as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' },
      });

      const { getByText, queryByText } = render(<TaskDetailScreen taskId="1" />);

      await waitFor(() => {
        fireEvent.press(getByText('Delete'));
      });

      await waitFor(() => {
        expect(queryByText('Failed to delete task')).toBeTruthy();
      });
    });
  });

  describe('Close Action', () => {
    it('should call onClose when close button pressed', async () => {
      const { getByText } = render(
        <TaskDetailScreen taskId="1" onClose={mockOnClose} />
      );

      await waitFor(() => {
        expect(getByText('✕')).toBeTruthy();
      });

      fireEvent.press(getByText('✕'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
