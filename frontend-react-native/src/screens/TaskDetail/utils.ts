/**
 * Utility functions for TaskDetail screen
 */

interface Task {
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
}

export const getStatusColor = (status: Task['status']): string => {
  switch (status) {
    case 'completed':
      return '#4CD964';
    case 'in_progress':
      return '#007AFF';
    case 'blocked':
      return '#FF3B30';
    default:
      return '#FF9500';
  }
};

export const getPriorityColor = (priority: Task['priority']): string => {
  switch (priority) {
    case 'high':
      return '#FF3B30';
    case 'medium':
      return '#FF9500';
    default:
      return '#999';
  }
};
