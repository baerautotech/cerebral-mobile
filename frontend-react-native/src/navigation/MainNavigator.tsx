import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import ARViewScreen from '../screens/ARViewScreen';
import AccountScreen from '../screens/Account/AccountScreen';
import CreateTaskScreen from '../screens/CreateTask';
import DashboardScreen from '../screens/Dashboard';
import LiveDashboardScreen from '../screens/LiveDashboardScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import TaskDetailScreen from '../screens/TaskDetail';
import TasksScreen from '../screens/Tasks';

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Notifications: undefined;
  Account: undefined;
  CreateTask: undefined;
  TaskDetail: { taskId: string };
  ARView: undefined;
  LiveDashboard: undefined;
};

const MainTabs = createBottomTabNavigator<MainTabParamList>();

const NAV_COLORS = {
  headerBackground: 'black',
  headerText: 'white',
  tabBackground: 'black',
  tabBorder: 'rgb(51, 51, 51)',
  tabActive: 'rgb(0, 122, 255)',
  tabInactive: 'rgb(153, 153, 153)',
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
});

const DashboardIcon = (): React.ReactElement => (
  <Text style={styles.tabIcon}>📊</Text>
);
const TasksIcon = (): React.ReactElement => (
  <Text style={styles.tabIcon}>📝</Text>
);
const NotificationsIcon = (): React.ReactElement => (
  <Text style={styles.tabIcon}>🔔</Text>
);
const AccountIcon = (): React.ReactElement => (
  <Text style={styles.tabIcon}>👤</Text>
);
const ARViewIcon = (): React.ReactElement => (
  <Text style={styles.tabIcon}>🥽</Text>
);
const LiveDashboardIcon = (): React.ReactElement => (
  <Text style={styles.tabIcon}>⚡</Text>
);

export const MainNavigator = (): React.ReactElement => {
  const isWeb = Platform.OS === 'web';

  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: NAV_COLORS.headerBackground,
        },
        headerTintColor: NAV_COLORS.headerText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: NAV_COLORS.tabBackground,
          borderTopColor: NAV_COLORS.tabBorder,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: NAV_COLORS.tabActive,
        tabBarInactiveTintColor: NAV_COLORS.tabInactive,
      }}
    >
      <MainTabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: DashboardIcon,
        }}
      />

      <MainTabs.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: 'Tasks',
          tabBarIcon: TasksIcon,
        }}
      />

      <MainTabs.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: NotificationsIcon,
        }}
      />

      <MainTabs.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: 'Account',
          tabBarIcon: AccountIcon,
        }}
      />

      {/* Modal/Detail screens - hidden from tabs */}
      <MainTabs.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Create Task',
          tabBarButton: () => null,
        }}
      />

      <MainTabs.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          title: 'Task Details',
          tabBarButton: () => null,
        }}
      />

      {!isWeb && (
        <>
          <MainTabs.Screen
            name="ARView"
            component={ARViewScreen}
            options={{
              title: 'AR View',
              tabBarIcon: ARViewIcon,
            }}
          />

          <MainTabs.Screen
            name="LiveDashboard"
            component={LiveDashboardScreen}
            options={{
              title: 'Live',
              tabBarIcon: LiveDashboardIcon,
            }}
          />
        </>
      )}
    </MainTabs.Navigator>
  );
};
