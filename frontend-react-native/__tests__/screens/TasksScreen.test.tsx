/**
 * TasksScreen Tests
 * Comprehensive test coverage for task list functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TasksScreen from '../../src/screens/TasksScreen';
import { ApiClient } from '../../src/services/api';

jest.mock('../../src/services/api');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('TasksScreen', () => {
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: 'in_progress' as const,
      priority: 'high' as const,
      created_at: '2025-10-10T12:00:00Z',
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      status: 'pending' as const,
      priority: 'medium' as const,
      created_at: '2025-10-10T13:00:00Z',
    },
    {
      id: '3',
      title: 'Test Task 3',
      description: 'Description 3',
      status: 'completed' as const,
      priority: 'low' as const,
      created_at: '2025-10-10T14:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiClient.get as jest.Mock).mockResolvedValue({
      data: mockTasks,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render tasks header', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Tasks')).toBeTruthy();
      });
    });

    it('should render search input', async () => {
      const { getByPlaceholderText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByPlaceholderText('Search tasks...')).toBeTruthy();
      });
    });

    it('should render filter buttons', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('All')).toBeTruthy();
        expect(getByText('Active')).toBeTruthy();
        expect(getByText('Completed')).toBeTruthy();
      });
    });

    it('should render add task button', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('+ Add Task')).toBeTruthy();
      });
    });
  });

  describe('Data Loading', () => {
    it('should load tasks on mount', async () => {
      render(<TasksScreen />);

      await waitFor(() => {
        expect(ApiClient.get).toHaveBeenCalledWith('/v1/tasks');
      });
    });

    it('should display loaded tasks', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Test Task 1')).toBeTruthy();
        expect(getByText('Test Task 2')).toBeTruthy();
        expect(getByText('Test Task 3')).toBeTruthy();
      });
    });

    it('should handle API errors gracefully', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      const { queryByText } = render(<TasksScreen />);

      await waitFor(() => {
        // Should show empty state or error
        expect(queryByText('Test Task 1')).toBeNull();
      });
    });

    it('should show empty state when no tasks', async () => {
      (ApiClient.get as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('No tasks found')).toBeTruthy();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter tasks by active status', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Active')).toBeTruthy();
      });

      fireEvent.press(getByText('Active'));

      await waitFor(() => {
        expect(ApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('status=pending,in_progress')
        );
      });
    });

    it('should filter tasks by completed status', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('Completed')).toBeTruthy();
      });

      fireEvent.press(getByText('Completed'));

      await waitFor(() => {
        expect(ApiClient.get).toHaveBeenCalledWith(expect.stringContaining('status=completed'));
      });
    });

    it('should show all tasks when "All" filter selected', async () => {
      const { getByText } = render(<TasksScreen />);

      // First select a filter
      await waitFor(() => {
        fireEvent.press(getByText('Active'));
      });

      // Then select "All"
      fireEvent.press(getByText('All'));

      await waitFor(() => {
        expect(ApiClient.get).toHaveBeenCalledWith('/v1/tasks');
      });
    });
  });

  describe('Search', () => {
    it('should update search query', () => {
      const { getByPlaceholderText } = render(<TasksScreen />);
      const searchInput = getByPlaceholderText('Search tasks...');

      fireEvent.changeText(searchInput, 'test query');
      expect(searchInput.props.value).toBe('test query');
    });
  });

  describe('Task Display', () => {
    it('should show task status badge', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('in progress')).toBeTruthy();
        expect(getByText('pending')).toBeTruthy();
        expect(getByText('completed')).toBeTruthy();
      });
    });

    it('should show task priority', async () => {
      const { getByText } = render(<TasksScreen />);

      await waitFor(() => {
        expect(getByText('high')).toBeTruthy();
        expect(getByText('medium')).toBeTruthy();
        expect(getByText('low')).toBeTruthy();
      });
    });

    it('should show task creation date', async () => {
      const { queryByText } = render(<TasksScreen />);

      await waitFor(() => {
        // Should show formatted dates
        expect(queryByText(/10\/10\/2025/)).toBeTruthy();
      });
    });
  });
});
