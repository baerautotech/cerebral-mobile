/**
 * Task Detail Screen
 * View and edit task details with backend integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';

import { LoadingState, ErrorState, NotFoundState } from './components/TaskDetailStates';
import { TaskField, StatusSelector, PrioritySelector } from './components/TaskField';
import { TaskHeader } from './components/TaskHeader';
import { styles } from './styles';
import { getStatusColor, getPriorityColor } from './utils';
import { ApiClient } from '../../services/api';
import { FeatureFlagGuard } from '../../components/FeatureFlagGuard';
import { TierGuard } from '../../components/TierGuard';

interface TaskDetailScreenProps {
  taskId: string;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: () => void;
  onClose?: () => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at?: string;
  due_date?: string;
  assigned_to?: string[];
  tags?: string[];
}

// Component has multiple state branches - helper functions extracted for clarity
// eslint-disable-next-line complexity
export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  taskId,
  onTaskUpdated,
  onTaskDeleted,
  onClose,
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<Task['status']>('pending');
  const [editPriority, setEditPriority] = useState<Task['priority']>('medium');

  const initializeFormData = (data: Task): void => {
    setTask(data);
    setEditTitle(data.title);
    setEditDescription(data.description);
    setEditStatus(data.status);
    setEditPriority(data.priority);
  };

  const handleLoadError = (err: unknown): void => {
    if (__DEV__) {
      console.error('Failed to load task:', err);
    }
    setError('An unexpected error occurred');
  };

  const loadTaskDetails = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await ApiClient.get<Task>(`/v1/tasks/${taskId}`);

      if (apiError) {
        setError('Failed to load task details');
        return;
      }

      if (data) {
        initializeFormData(data);
      }
    } catch (err) {
      handleLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTaskDetails();
  }, [loadTaskDetails]);

  const updateTaskData = (data: Task): void => {
    setTask(data);
    setIsEditing(false);
    onTaskUpdated?.(data);
  };

  const buildUpdatePayload = (): {
    title: string;
    description: string;
    status: Task['status'];
    priority: Task['priority'];
  } => ({
    title: editTitle.trim(),
    description: editDescription.trim(),
    status: editStatus,
    priority: editPriority,
  });

  const handleSave = async (): Promise<void> => {
    if (!task) return;

    setError(null);
    setSaving(true);

    try {
      const payload = buildUpdatePayload();
      const { data, error: apiError } = await ApiClient.put<Task>(`/v1/tasks/${taskId}`, payload);

      if (apiError) {
        setError('Failed to update task');
        return;
      }

      if (data) {
        updateTaskData(data);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Failed to update task:', err);
      }
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const performDelete = async (): Promise<void> => {
    setSaving(true);

    try {
      const { error: apiError } = await ApiClient.delete(`/v1/tasks/${taskId}`);

      if (apiError) {
        setError('Failed to delete task');
        return;
      }

      onTaskDeleted?.();
      onClose?.();
    } catch (err) {
      if (__DEV__) {
        console.error('Failed to delete task:', err);
      }
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (): void => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: performDelete },
    ]);
  };

  if (loading) return <LoadingState styles={styles} />;
  if (error && !task) return <ErrorState error={error} onRetry={loadTaskDetails} styles={styles} />;
  if (!task) return <NotFoundState styles={styles} />;

  return (
    <ScrollView style={styles.container}>
      <TaskHeader
        isEditing={isEditing}
        saving={saving}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={onClose}
      />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <TaskField
          label="Title"
          value={isEditing ? editTitle : task.title}
          onChangeText={setEditTitle}
          isEditing={isEditing}
          placeholder="Task title"
        />

        <TaskField
          label="Description"
          value={isEditing ? editDescription : task.description}
          onChangeText={setEditDescription}
          isEditing={isEditing}
          placeholder="Task description"
          multiline
        />

        <StatusSelector
          label="Status"
          value={isEditing ? editStatus : task.status}
          onChange={setEditStatus}
          isEditing={isEditing}
          getColor={getStatusColor}
        />

        <PrioritySelector
          label="Priority"
          value={isEditing ? editPriority : task.priority}
          onChange={setEditPriority}
          isEditing={isEditing}
          getColor={getPriorityColor}
        />

        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Created: {new Date(task.created_at).toLocaleDateString()}
          </Text>
          {task.updated_at && (
            <Text style={styles.metadataText}>
              Updated: {new Date(task.updated_at).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Standard Tier: Data Export */}
        <TierGuard tier="standard">
          <View style={{ padding: 16, backgroundColor: '#e8f4f8', borderRadius: 8, marginTop: 16 }}>
            <Text style={{ color: '#006064', fontSize: 14, fontWeight: '600' }}>
              📊 Export Task Data
            </Text>
            <Text style={{ color: '#00838f', fontSize: 12 }}>
              Available in Standard tier and above
            </Text>
          </View>
        </TierGuard>

        {/* Enterprise: AI Suggestions */}
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <View
              style={{ padding: 16, backgroundColor: '#2a1a3a', borderRadius: 8, marginTop: 16 }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                🤖 AI Insights
              </Text>
              <Text style={{ color: '#ccc', fontSize: 12 }}>
                Get AI-powered recommendations for this task
              </Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>

        {/* Enterprise: Workflow Automation */}
        <FeatureFlagGuard flag="workflow_automation">
          <TierGuard tier="enterprise">
            <View
              style={{ padding: 16, backgroundColor: '#1a3a2a', borderRadius: 8, marginTop: 16 }}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                ⚙️ Automation Rules
              </Text>
              <Text style={{ color: '#ccc', fontSize: 12 }}>
                Set up automated workflows for this task type
              </Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>
      </View>
    </ScrollView>
  );
};

export default TaskDetailScreen;
