import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const RecentActivity: React.FC = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Recent Activity</Text>
    <View style={styles.activityList}>
      <View style={styles.activityItem}>
        <View style={[styles.activityDot, styles.dotGreen]} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Task completed</Text>
          <Text style={styles.activityDescription}>Authentication service implementation</Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityItem}>
        <View style={[styles.activityDot, styles.dotBlue]} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>New task created</Text>
          <Text style={styles.activityDescription}>React Native Web integration</Text>
          <Text style={styles.activityTime}>5 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityItem}>
        <View style={[styles.activityDot, styles.dotPurple]} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Comment added</Text>
          <Text style={styles.activityDescription}>Great progress on the frontend quality!</Text>
          <Text style={styles.activityTime}>1 day ago</Text>
        </View>
      </View>
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
  activityList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  dotGreen: {
    backgroundColor: '#4CD964',
  },
  dotBlue: {
    backgroundColor: '#007AFF',
  },
  dotPurple: {
    backgroundColor: '#5856D6',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
});
