/**
 * Create Task Screen
 * Form for creating new tasks
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';

import { TaskForm } from './components/TaskForm';
import { ApiClient } from '../../services/api';
import { FeatureFlagGuard } from '../../components/FeatureFlagGuard';
import { TierGuard } from '../../components/TierGuard';

interface CreateTaskScreenProps {
  onTaskCreated?: (task: unknown) => void;
  onCancel?: () => void;
}

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({
  onTaskCreated,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!title.trim()) return 'Task title is required';
    if (title.length < 3) return 'Task title must be at least 3 characters';
    if (title.length > 200) return 'Task title must be less than 200 characters';
    return null;
  };

  const handleCreate = async (): Promise<void> => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { data, error: apiError } = await ApiClient.post('/v1/tasks', {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
      });

      if (apiError) {
        setError('Failed to create task');
        return;
      }

      onTaskCreated?.(data);
      resetForm();
    } catch (err) {
      if (__DEV__) {
        // Log error for debugging
      }
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('pending');
    setError(null);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Task</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <TaskForm
          title={title}
          description={description}
          priority={priority}
          status={status}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onPriorityChange={setPriority}
          onStatusChange={setStatus}
        />

        {/* Enterprise: AI Suggestions */}
        <FeatureFlagGuard flag="ai_suggestions">
          <TierGuard tier="enterprise">
            <View style={{ padding: 16, backgroundColor: '#2a1a3a', borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>🤖 AI Suggestions</Text>
              <Text style={{ color: '#ccc', fontSize: 12 }}>Get AI-powered title and description suggestions</Text>
            </View>
          </TierGuard>
        </FeatureFlagGuard>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    color: '#999',
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    marginTop: 32,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTaskScreen;
