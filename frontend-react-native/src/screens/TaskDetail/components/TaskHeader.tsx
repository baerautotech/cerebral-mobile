import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface TaskHeaderProps {
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  isEditing,
  saving,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onClose,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Task Details</Text>
      <View style={styles.headerActions}>
        {!isEditing ? (
          <>
            <TouchableOpacity onPress={onEdit} disabled={saving}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} disabled={saving}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={onCancel} disabled={saving}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.saveButton}>Save</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        {onClose && (
          <TouchableOpacity onPress={onClose} disabled={saving}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  editButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    color: '#4CD964',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    color: '#999',
    fontSize: 16,
  },
  closeButton: {
    color: '#999',
    fontSize: 24,
    fontWeight: '300',
  },
});
