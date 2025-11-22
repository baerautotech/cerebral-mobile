/**
 * Main Dashboard Screen
 * Unified dashboard for web and mobile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';

import { QuickActions } from './components/QuickActions';
import { RecentActivity } from './components/RecentActivity';
import { StatsCard } from './components/StatsCard';
import { styles } from './styles';
import { AuthService } from '../../services/supabase';
import { FeatureFlagGuard } from '../../components/FeatureFlagGuard';
import { TierGuard } from '../../components/TierGuard';

interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export const DashboardScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      const { user: currentUser } = await AuthService.getUser();
      setUser(currentUser);

      // TODO: Load real stats from API
      setStats({
        totalTasks: 24,
        activeTasks: 8,
        completedTasks: 12,
        pendingTasks: 4,
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load dashboard data:', error);
      }
      setStats({ totalTasks: 0, activeTasks: 0, completedTasks: 0, pendingTasks: 0 });
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async (): Promise<void> => {
    await AuthService.signOut();
  };

  const handleCreateTask = (): void => {
    // Navigation implementation pending
  };

  const handleViewTasks = (): void => {
    // Navigation implementation pending
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.email ?? 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatsCard title="Total Tasks" value={stats.totalTasks} color="#007AFF" />
        <StatsCard title="Active" value={stats.activeTasks} color="#4CD964" />
        <StatsCard title="Completed" value={stats.completedTasks} color="#5856D6" />
        <StatsCard title="Pending" value={stats.pendingTasks} color="#FF9500" />
      </View>

      <QuickActions
        onCreateTask={handleCreateTask}
        onViewTasks={handleViewTasks}
        isDesktop={isDesktop}
      />

      {/* Standard Tier: Advanced Analytics */}
      <TierGuard tier="standard">
        <View style={{ padding: 16, backgroundColor: '#e8f4f8', marginTop: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Advanced Analytics</Text>
          <Text style={{ color: '#666' }}>Detailed insights and trends available in Standard tier</Text>
        </View>
      </TierGuard>

      <RecentActivity />

      {/* Enterprise Tier: AI Insights */}
      <TierGuard tier="enterprise">
        <View style={{ padding: 16, backgroundColor: '#f0e8f8', marginTop: 16, borderRadius: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>🤖 AI-Powered Insights</Text>
          <Text style={{ color: '#666' }}>Personalized recommendations powered by AI</Text>
        </View>
      </TierGuard>
    </ScrollView>
  );
};

export default DashboardScreen;
