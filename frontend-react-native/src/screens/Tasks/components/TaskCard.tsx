import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
  getStatusColor: (status: Task['status']) => string;
  getPriorityColor: (priority: Task['priority']) => string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  getStatusColor,
  getPriorityColor,
}) => (
  <TouchableOpacity style={styles.taskCard} onPress={() => onPress(task.id)}>
    <View style={styles.taskHeader}>
      <Text style={styles.taskTitle}>{task.title}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
        <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
      </View>
    </View>

    <Text style={styles.taskDescription}>{task.description}</Text>

    <View style={styles.taskFooter}>
      <View style={[styles.priorityBadge, { borderColor: getPriorityColor(task.priority) }]}>
        <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
          {task.priority}
        </Text>
      </View>
      <Text style={styles.taskDate}>
        {new Date(task.created_at).toLocaleDateString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
});
