import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface QuickActionsProps {
  onCreateTask: () => void;
  onViewTasks: () => void;
  isDesktop: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateTask,
  onViewTasks,
  isDesktop,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Quick Actions</Text>
    <View style={styles.actionsGrid}>
      <TouchableOpacity style={styles.actionCard} onPress={onCreateTask}>
        <Text style={styles.actionIcon}>📝</Text>
        <Text style={styles.actionTitle}>Create Task</Text>
        <Text style={styles.actionDescription}>Add a new task to your workflow</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={onViewTasks}>
        <Text style={styles.actionIcon}>📋</Text>
        <Text style={styles.actionTitle}>View Tasks</Text>
        <Text style={styles.actionDescription}>See all your tasks and progress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <Text style={styles.actionIcon}>🤖</Text>
        <Text style={styles.actionTitle}>AI Agents</Text>
        <Text style={styles.actionDescription}>Manage your AI assistants</Text>
      </TouchableOpacity>

      {isDesktop && (
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionTitle}>Settings</Text>
          <Text style={styles.actionDescription}>Configure your workspace</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#999',
  },
});
