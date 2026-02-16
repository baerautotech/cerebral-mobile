/**
 * Utility functions for TaskDetail screen
 */

import { appColors } from '../../config/colors';

interface Task {
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
}

export const getStatusColor = (status: Task['status']): string => {
  switch (status) {
    case 'completed':
      return appColors.success as string;
    case 'in_progress':
      return appColors.brand as string;
    case 'blocked':
      return appColors.danger as string;
    default:
      return appColors.warning as string;
  }
};

export const getPriorityColor = (priority: Task['priority']): string => {
  switch (priority) {
    case 'high':
      return appColors.danger as string;
    case 'medium':
      return appColors.warning as string;
    default:
      return appColors.textTertiary as string;
  }
};
