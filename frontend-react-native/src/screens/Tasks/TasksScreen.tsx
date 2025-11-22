/**
 * Tasks Screen
 * Task management interface for web and mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';

import { FilterBar } from './components/FilterBar';
import { TaskCard } from './components/TaskCard';
import { ApiClient } from '../../services/api';
import { FeatureFlagGuard } from '../../components/FeatureFlagGuard';
import { TierGuard } from '../../components/TierGuard';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = useCallback(async (): Promise<void> => {
    try {
      const params: Record<string, string> = {};

      if (filter === 'active') {
        params.status = 'pending,in_progress';
      } else if (filter === 'completed') {
        params.status = 'completed';
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/v1/tasks${queryString ? `?${queryString}` : ''}`;

      const { data: tasksData, error: tasksError } = await ApiClient.get<Task[]>(endpoint);

      if (tasksError) {
        if (__DEV__) {
          console.error('Failed to load tasks:', tasksError);
        }
        setTasks([]);
        return;
      }

      if (tasksData) {
        setTasks(tasksData);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load tasks:', error);
      }
      setTasks([]);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const getStatusColor = (status: Task['status']): string => {
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

  const getPriorityColor = (priority: Task['priority']): string => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      default:
        return '#999';
    }
  };

  const handleTaskPress = (_taskId: string): void => {
    // TODO: Navigate to task detail
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
      </View>

      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FilterBar filter={filter} onFilterChange={setFilter} />

        {/* Beta: Advanced Filtering */}
        <FeatureFlagGuard flag="advanced_filtering">
          <View style={{ padding: 8, backgroundColor: '#1f5f3f', borderRadius: 4, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              ✨ Advanced Filters Available
            </Text>
          </View>
        </FeatureFlagGuard>

        {/* Beta: Bulk Actions */}
        <FeatureFlagGuard flag="advanced_actions">
          <View style={{ padding: 8, backgroundColor: '#3f5f1f', borderRadius: 4, marginTop: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
              ⚡ Bulk Actions Enabled
            </Text>
          </View>
        </FeatureFlagGuard>
      </View>

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={handleTaskPress}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        }
        ListFooterComponent={
          <FeatureFlagGuard flag="ai_suggestions">
            <TierGuard tier="enterprise">
              <View
                style={{
                  padding: 16,
                  backgroundColor: '#2a1a3a',
                  borderRadius: 8,
                  marginTop: 16,
                  marginHorizontal: 16,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  🤖 AI Task Suggestions
                </Text>
                <Text style={{ color: '#ccc', fontSize: 12 }}>
                  Get AI-powered suggestions to optimize your task workflow
                </Text>
              </View>
            </TierGuard>
          </FeatureFlagGuard>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  controls: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TasksScreen;
