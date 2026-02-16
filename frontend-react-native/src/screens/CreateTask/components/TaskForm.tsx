import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { FormField } from './FormField';

interface Task {
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress';
}

interface TaskFormProps {
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPriorityChange: (priority: Task['priority']) => void;
  onStatusChange: (status: Task['status']) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  title,
  description,
  priority,
  status,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onStatusChange,
}) => (
  <View style={styles.form}>
    <FormField
      label="Title *"
      value={title}
      onChangeText={onTitleChange}
      placeholder="Enter task title"
    />

    <FormField
      label="Description"
      value={description}
      onChangeText={onDescriptionChange}
      placeholder="Enter task description"
      multiline
    />

    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Priority</Text>
      <View style={styles.buttonGroup}>
        {(['low', 'medium', 'high'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.optionButton, priority === p && styles.optionButtonActive]}
            onPress={() => onPriorityChange(p)}
          >
            <Text
              style={[styles.optionButtonText, priority === p && styles.optionButtonTextActive]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Initial Status</Text>
      <View style={styles.buttonGroup}>
        {(['pending', 'in_progress'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.optionButton, status === s && styles.optionButtonActive]}
            onPress={() => onStatusChange(s)}
          >
            <Text style={[styles.optionButtonText, status === s && styles.optionButtonTextActive]}>
              {s.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  form: {
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    textTransform: 'capitalize',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
});
