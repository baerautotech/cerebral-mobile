import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FilterBarProps {
  filter: 'all' | 'active' | 'completed';
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filter, onFilterChange }) => (
  <View style={styles.filterButtons}>
    <TouchableOpacity
      style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
      onPress={() => onFilterChange('all')}
    >
      <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
        All
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
      onPress={() => onFilterChange('active')}
    >
      <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>
        Active
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
      onPress={() => onFilterChange('completed')}
    >
      <Text
        style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}
      >
        Completed
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});
