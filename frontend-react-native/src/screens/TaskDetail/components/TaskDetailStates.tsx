import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';

interface LoadingStateProps {
  styles: {
    loadingContainer: object;
    loadingText: object;
  };
}

export const LoadingState: React.FC<LoadingStateProps> = ({ styles }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading task...</Text>
  </View>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  styles: {
    errorContainer: object;
    errorText: object;
    retryButton: object;
    retryButtonText: object;
  };
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, styles }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

interface NotFoundStateProps {
  styles: {
    errorContainer: object;
    errorText: object;
  };
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({ styles }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>Task not found</Text>
  </View>
);
