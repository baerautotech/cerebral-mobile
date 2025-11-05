/**
 * CreateTaskScreen Tests
 * Comprehensive test coverage for task creation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateTaskScreen from '../../src/screens/CreateTaskScreen';
import { ApiClient } from '../../src/services/api';

jest.mock('../../src/services/api');

describe('CreateTaskScreen', () => {
  const mockOnTaskCreated = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render create task form', () => {
      const { getByText, getByPlaceholderText } = render(<CreateTaskScreen />);

      expect(getByText('Create New Task')).toBeTruthy();
      expect(getByPlaceholderText('Enter task title')).toBeTruthy();
      expect(getByPlaceholderText('Enter task description')).toBeTruthy();
      expect(getByText('Priority')).toBeTruthy();
      expect(getByText('Initial Status')).toBeTruthy();
    });

    it('should render all priority options', () => {
      const { getByText } = render(<CreateTaskScreen />);

      expect(getByText('Low')).toBeTruthy();
      expect(getByText('Medium')).toBeTruthy();
      expect(getByText('High')).toBeTruthy();
    });

    it('should render status options', () => {
      const { getByText } = render(<CreateTaskScreen />);

      expect(getByText('Pending')).toBeTruthy();
      expect(getByText('In Progress')).toBeTruthy();
    });

    it('should render cancel button when onCancel provided', () => {
      const { getByText } = render(<CreateTaskScreen onCancel={mockOnCancel} />);

      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update title input', () => {
      const { getByPlaceholderText } = render(<CreateTaskScreen />);
      const titleInput = getByPlaceholderText('Enter task title');

      fireEvent.changeText(titleInput, 'New Task Title');
      expect(titleInput.props.value).toBe('New Task Title');
    });

    it('should update description input', () => {
      const { getByPlaceholderText } = render(<CreateTaskScreen />);
      const descInput = getByPlaceholderText('Enter task description');

      fireEvent.changeText(descInput, 'Task description here');
      expect(descInput.props.value).toBe('Task description here');
    });

    it('should select priority', () => {
      const { getByText } = render(<CreateTaskScreen />);

      // Default is medium
      const highButton = getByText('High');
      fireEvent.press(highButton);

      // Priority should update (visual feedback tested via styles)
    });

    it('should select status', () => {
      const { getByText } = render(<CreateTaskScreen />);

      const inProgressButton = getByText('In Progress');
      fireEvent.press(inProgressButton);

      // Status should update
    });
  });

  describe('Form Validation', () => {
    it('should show error if title is empty', async () => {
      const { getByText, queryByText } = render(<CreateTaskScreen />);
      const createButton = getByText('Create Task');

      fireEvent.press(createButton);

      await waitFor(() => {
        expect(queryByText('Task title is required')).toBeTruthy();
      });
    });

    it('should show error if title is too short', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<CreateTaskScreen />);
      const titleInput = getByPlaceholderText('Enter task title');
      const createButton = getByText('Create Task');

      fireEvent.changeText(titleInput, 'AB');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(queryByText('Task title must be at least 3 characters')).toBeTruthy();
      });
    });

    it('should allow empty description', async () => {
      (ApiClient.post as jest.Mock).mockResolvedValue({
        data: { id: '1', title: 'Test Task', status: 'pending' },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <CreateTaskScreen onTaskCreated={mockOnTaskCreated} />
      );
      const titleInput = getByPlaceholderText('Enter task title');

      fireEvent.changeText(titleInput, 'Valid Title');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(ApiClient.post).toHaveBeenCalled();
      });
    });
  });

  describe('Task Creation', () => {
    it('should call API to create task', async () => {
      (ApiClient.post as jest.Mock).mockResolvedValue({
        data: { id: '1', title: 'New Task', status: 'pending' },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(<CreateTaskScreen />);

      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'New Task');
      fireEvent.changeText(getByPlaceholderText('Enter task description'), 'Task desc');
      fireEvent.press(getByText('High'));
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(ApiClient.post).toHaveBeenCalledWith('/v1/tasks/', {
          title: 'New Task',
          description: 'Task desc',
          priority: 'high',
          status: 'pending',
        });
      });
    });

    it('should call onTaskCreated on success', async () => {
      const createdTask = { id: '1', title: 'New Task', status: 'pending' };
      (ApiClient.post as jest.Mock).mockResolvedValue({
        data: createdTask,
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(
        <CreateTaskScreen onTaskCreated={mockOnTaskCreated} />
      );

      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'New Task');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(mockOnTaskCreated).toHaveBeenCalledWith(createdTask);
      });
    });

    it('should reset form after successful creation', async () => {
      (ApiClient.post as jest.Mock).mockResolvedValue({
        data: { id: '1', title: 'New Task' },
        error: null,
      });

      const { getByPlaceholderText, getByText } = render(<CreateTaskScreen />);
      const titleInput = getByPlaceholderText('Enter task title');

      fireEvent.changeText(titleInput, 'New Task');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(titleInput.props.value).toBe('');
      });
    });

    it('should show error on API failure', async () => {
      (ApiClient.post as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Failed to create task' },
      });

      const { getByPlaceholderText, getByText, queryByText } = render(<CreateTaskScreen />);

      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'New Task');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(queryByText('Failed to create task')).toBeTruthy();
      });
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button pressed', () => {
      const { getByText } = render(<CreateTaskScreen onCancel={mockOnCancel} />);

      fireEvent.press(getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should disable form during submission', async () => {
      (ApiClient.post as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      const { getByPlaceholderText, getByText } = render(<CreateTaskScreen />);
      const titleInput = getByPlaceholderText('Enter task title');

      fireEvent.changeText(titleInput, 'New Task');
      fireEvent.press(getByText('Create Task'));

      await waitFor(() => {
        expect(titleInput.props.editable).toBe(false);
      });
    });
  });
});
