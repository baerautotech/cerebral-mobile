import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  title: string;
  value: number;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => (
  <View style={[styles.statCard, styles.statCardBorder, { borderLeftColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    minWidth: 150,
  },
  statCardBorder: {
    borderLeftWidth: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
  },
});
