import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at?: string;
}

interface TaskFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  isEditing: boolean;
  placeholder?: string;
  multiline?: boolean;
}

export const TaskField: React.FC<TaskFieldProps> = ({
  label,
  value,
  onChangeText,
  isEditing,
  placeholder,
  multiline = false,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {isEditing && onChangeText ? (
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666"
          multiline={multiline}
          numberOfLines={multiline ? 6 : 1}
        />
      ) : (
        <Text style={styles.value}>{value ?? 'Not set'}</Text>
      )}
    </View>
  );
};

interface StatusSelectorProps {
  label: string;
  value: Task['status'];
  onChange: (status: Task['status']) => void;
  isEditing: boolean;
  getColor: (status: Task['status']) => string;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  label,
  value,
  onChange,
  isEditing,
  getColor,
}) => {
  const statuses: Task['status'][] = ['pending', 'in_progress', 'completed', 'blocked'];

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <View style={styles.buttonGroup}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.optionButton, value === status && styles.optionButtonActive]}
              onPress={() => onChange(status)}
            >
              <Text
                style={[styles.optionButtonText, value === status && styles.optionButtonTextActive]}
              >
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.badge, { backgroundColor: getColor(value) }]}>
          <Text style={styles.badgeText}>{value.replace('_', ' ')}</Text>
        </View>
      )}
    </View>
  );
};

interface PrioritySelectorProps {
  label: string;
  value: Task['priority'];
  onChange: (priority: Task['priority']) => void;
  isEditing: boolean;
  getColor: (priority: Task['priority']) => string;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  label,
  value,
  onChange,
  isEditing,
  getColor,
}) => {
  const priorities: Task['priority'][] = ['low', 'medium', 'high'];

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <View style={styles.buttonGroup}>
          {priorities.map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[styles.optionButton, value === priority && styles.optionButtonActive]}
              onPress={() => onChange(priority)}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  value === priority && styles.optionButtonTextActive,
                ]}
              >
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.badge, { backgroundColor: getColor(value) }]}>
          <Text style={styles.badgeText}>{value}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  input: {
    height: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    height: 150,
    paddingTop: 12,
    textAlignVertical: 'top',
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
